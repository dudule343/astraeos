import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// On fabrique une clé Deepgram ÉPHÉMÈRE (TTL court, scope minimal) à partir de
// la clé maître du cabinet. Cette clé temporaire est sûre à exposer au
// navigateur : elle expire en 120 s et ne peut que streamer de la transcription
// (scope usage:write). La clé maître ne quitte jamais le serveur.
const DEEPGRAM_PROJECTS_URL = "https://api.deepgram.com/v1/projects";
const TTL_SECONDS = 120;

type Project = { project_id?: string };

export async function POST() {
  // Route STAFF : sans session valide, on ne fabrique aucune clé Deepgram et on
  // n'expose surtout pas la clé maître au navigateur.
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  // 1. Clé maître Deepgram : clé serveur PRIVEOS (env DEEPGRAM_API_KEY) en
  //    priorité, sinon repli sur la clé du cabinet de la session (stt_settings).
  //    Absente des deux → 409 (le front bascule sur Web Speech).
  let masterKey: string;
  const envKey = process.env.DEEPGRAM_API_KEY?.trim();
  if (envKey) {
    masterKey = envKey;
  } else {
    try {
      const supabase = createAdminClient();
      const { data: settings } = await supabase
        .from("stt_settings")
        .select("api_key")
        .eq("cabinet_id", ctx.cabinetId)
        .maybeSingle();

      if (!settings || !settings.api_key) {
        return NextResponse.json({ error: "STT non connectée" }, { status: 409 });
      }
      masterKey = settings.api_key as string;
    } catch {
      return NextResponse.json({ error: "STT non connectée" }, { status: 409 });
    }
  }

  const authHeader = { Authorization: `Token ${masterKey}` };

  // 2. Récupération du project_id (premier projet du compte).
  let projectId: string;
  try {
    const resp = await fetch(DEEPGRAM_PROJECTS_URL, {
      method: "GET",
      headers: authHeader,
    });
    if (!resp.ok) {
      const msg = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: `Deepgram: projets indisponibles (HTTP ${resp.status}). ${msg.slice(0, 160)}`.trim() },
        { status: 502 },
      );
    }
    const data = (await resp.json()) as { projects?: Project[] };
    const first = Array.isArray(data.projects) ? data.projects[0] : undefined;
    if (!first || !first.project_id) {
      return NextResponse.json(
        { error: "Deepgram: aucun projet associé à cette clé" },
        { status: 502 },
      );
    }
    projectId = first.project_id;
  } catch {
    return NextResponse.json(
      { error: "Impossible de joindre l'API Deepgram" },
      { status: 502 },
    );
  }

  // 3. Création de la clé temporaire (scope minimal, TTL court).
  try {
    const resp = await fetch(
      `${DEEPGRAM_PROJECTS_URL}/${encodeURIComponent(projectId)}/keys`,
      {
        method: "POST",
        headers: { ...authHeader, "content-type": "application/json" },
        body: JSON.stringify({
          comment: "astraeos-visio-ephemere",
          scopes: ["usage:write"],
          time_to_live_in_seconds: TTL_SECONDS,
        }),
      },
    );

    if (resp.ok) {
      const data = (await resp.json()) as { key?: string };
      if (data.key) {
        return NextResponse.json({ key: data.key, expires_in: TTL_SECONDS });
      }
    }

    // Repli : les clés créées via la console Deepgram (rôle « Default ») savent
    // transcrire mais n'ont pas le scope keys:write pour fabriquer des clés
    // éphémères (HTTP 403). On NE renvoie JAMAIS la clé maître au navigateur :
    // même scopée transcription, elle n'a ni TTL ni rotation et fuiterait dans
    // le client. Sans clé éphémère possible, le STT serveur est indisponible →
    // 503 ; le front bascule sur Web Speech.
    if (resp.status === 403) {
      return NextResponse.json(
        { error: "STT temporairement indisponible" },
        { status: 503 },
      );
    }

    const msg = await resp.text().catch(() => "");
    return NextResponse.json(
      { error: `Deepgram: création de clé en échec (HTTP ${resp.status}). ${msg.slice(0, 160)}`.trim() },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible de joindre l'API Deepgram" },
      { status: 502 },
    );
  }
}
