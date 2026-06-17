import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// Endpoint Deepgram utilisé à la fois pour valider la clé (le simple fait de
// lister les projets exige une clé valide) et, dans stt-token, pour récupérer
// le project_id avant de créer une clé temporaire.
const DEEPGRAM_PROJECTS_URL = "https://api.deepgram.com/v1/projects";

// Seuls les rôles gestionnaires peuvent écrire/supprimer la clé BYOK du cabinet.
// Un engineer transcrit mais ne touche pas aux clés.
const KEY_MANAGER_ROLES = ["cabinet_director", "brand_owner", "editor"];

type SettingsRow = {
  id: string;
  provider: string;
  api_key: string;
};

/** "abc1234…f3Gh" : 7 premiers + 4 derniers, jamais la clé complète. */
function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 11) return "…";
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

async function readSettings(cabinetId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("stt_settings")
    .select("id, provider, api_key")
    .eq("cabinet_id", cabinetId)
    .maybeSingle();
  return { supabase, settings: (data as SettingsRow | null) ?? null };
}

function publicView(settings: SettingsRow | null) {
  if (!settings || !settings.api_key) {
    return {
      connected: false,
      provider: "deepgram",
      masked_key: null as string | null,
    };
  }
  return {
    connected: true,
    provider: settings.provider || "deepgram",
    masked_key: maskKey(settings.api_key),
  };
}

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }
  try {
    const { settings } = await readSettings(ctx.cabinetId);
    return NextResponse.json(publicView(settings));
  } catch {
    return NextResponse.json(
      { error: "Lecture des réglages STT impossible" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }
  if (!KEY_MANAGER_ROLES.includes(ctx.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  let payload: { api_key?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête JSON attendue" }, { status: 400 });
  }

  const apiKey = typeof payload.api_key === "string" ? payload.api_key.trim() : "";
  if (!apiKey) {
    return NextResponse.json({ error: "Clé API requise" }, { status: 400 });
  }

  // Validation en direct : lister les projets Deepgram exige une clé valide.
  let resp: Response;
  try {
    resp = await fetch(DEEPGRAM_PROJECTS_URL, {
      method: "GET",
      headers: { Authorization: `Token ${apiKey}` },
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de joindre l'API Deepgram" },
      { status: 502 },
    );
  }

  if (resp.status === 401 || resp.status === 403) {
    return NextResponse.json({ error: "Clé invalide" }, { status: 400 });
  }
  if (!resp.ok) {
    const msg = await resp.text().catch(() => "");
    return NextResponse.json(
      { error: `Validation impossible (HTTP ${resp.status}). ${msg.slice(0, 160)}`.trim() },
      { status: 400 },
    );
  }

  // Clé valide → upsert mono-ligne, scopé au cabinet de la session.
  try {
    const { supabase, settings } = await readSettings(ctx.cabinetId);
    const now = new Date().toISOString();
    if (settings) {
      const { error } = await supabase
        .from("stt_settings")
        .update({ provider: "deepgram", api_key: apiKey, updated_at: now })
        .eq("id", settings.id)
        .eq("cabinet_id", ctx.cabinetId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("stt_settings")
        .insert({
          provider: "deepgram",
          api_key: apiKey,
          tenant_id: ctx.tenantId,
          cabinet_id: ctx.cabinetId,
        });
      if (error) throw error;
    }

    const { settings: fresh } = await readSettings(ctx.cabinetId);
    return NextResponse.json(publicView(fresh));
  } catch {
    return NextResponse.json(
      { error: "Enregistrement de la clé impossible" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }
  if (!KEY_MANAGER_ROLES.includes(ctx.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const supabase = createAdminClient();
    await supabase
      .from("stt_settings")
      .delete()
      .eq("cabinet_id", ctx.cabinetId);
    return NextResponse.json(publicView(null));
  } catch {
    return NextResponse.json({ error: "Déconnexion impossible" }, { status: 500 });
  }
}
