import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ALLOWED_MODELS, DEFAULT_MODEL } from "@/lib/ia-analyse";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

type SettingsRow = {
  id: string;
  provider: string;
  api_key: string;
  model: string;
  label: string | null;
};

/** "sk-ant-…f3Gh" : 7 premiers + 4 derniers, jamais la clé complète. */
function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 11) return "…";
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

async function readSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("ia_settings")
    .select("id, provider, api_key, model, label")
    .limit(1)
    .maybeSingle();
  return { supabase, settings: (data as SettingsRow | null) ?? null };
}

function publicView(settings: SettingsRow | null) {
  if (!settings || !settings.api_key) {
    return {
      connected: false,
      provider: "anthropic",
      model: DEFAULT_MODEL,
      masked_key: null as string | null,
      label: null as string | null,
    };
  }
  return {
    connected: true,
    provider: settings.provider || "anthropic",
    model: settings.model || DEFAULT_MODEL,
    masked_key: maskKey(settings.api_key),
    label: settings.label ?? null,
  };
}

export async function GET() {
  try {
    const { settings } = await readSettings();
    return NextResponse.json(publicView(settings));
  } catch {
    return NextResponse.json(
      { error: "Lecture des réglages IA impossible" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let payload: { api_key?: unknown; model?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête JSON attendue" }, { status: 400 });
  }

  const apiKey = typeof payload.api_key === "string" ? payload.api_key.trim() : "";
  if (!apiKey) {
    return NextResponse.json({ error: "Clé API requise" }, { status: 400 });
  }

  const requestedModel =
    typeof payload.model === "string" ? payload.model.trim() : DEFAULT_MODEL;
  const model = (ALLOWED_MODELS as readonly string[]).includes(requestedModel)
    ? requestedModel
    : DEFAULT_MODEL;

  // Validation en direct : un ping minimal sur l'API Anthropic.
  let resp: Response;
  try {
    resp = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de joindre l'API Anthropic" },
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

  // Clé valide → upsert mono-ligne.
  try {
    const { supabase, settings } = await readSettings();
    const now = new Date().toISOString();
    if (settings) {
      const { error } = await supabase
        .from("ia_settings")
        .update({ provider: "anthropic", api_key: apiKey, model, updated_at: now })
        .eq("id", settings.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("ia_settings")
        .insert({ provider: "anthropic", api_key: apiKey, model });
      if (error) throw error;
    }

    const { settings: fresh } = await readSettings();
    return NextResponse.json(publicView(fresh));
  } catch {
    return NextResponse.json(
      { error: "Enregistrement de la clé impossible" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const { supabase } = await readSettings();
    await supabase.from("ia_settings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    return NextResponse.json(publicView(null));
  } catch {
    return NextResponse.json(
      { error: "Déconnexion impossible" },
      { status: 500 },
    );
  }
}
