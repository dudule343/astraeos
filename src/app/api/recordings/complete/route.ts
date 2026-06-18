import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/recordings/complete
 *
 * Appelé par finalize (VPS) une fois le MP4 poussé vers le bucket. Secret partagé.
 * Body { entretienId, path, bytes, duration }. Marque l'entretien 'ready' et
 * enregistre le chemin de stockage (lu plus tard via URL signée pour la lecture).
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.RECORDINGS_WEBHOOK_SECRET;
  if (!secret) return false;
  const got = req.headers.get("x-recording-secret");
  return !!got && got === secret;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { entretienId?: unknown; path?: unknown; bytes?: unknown; duration?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const entretienId = String(body.entretienId ?? "").trim();
  const path = String(body.path ?? "").trim();
  if (!entretienId || !path) {
    return NextResponse.json({ error: "entretienId & path requis" }, { status: 400 });
  }
  const bytes = Number(body.bytes);
  const duration = Number(body.duration);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("entretiens")
    .update({
      recording_path: path,
      recording_status: "ready",
      recording_bytes: Number.isFinite(bytes) ? Math.round(bytes) : null,
      recording_duration_s: Number.isFinite(duration) ? Math.round(duration) : null,
    })
    .eq("id", entretienId);
  if (error) {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
