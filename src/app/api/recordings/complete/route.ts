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
  // Forme UUID stricte : évite un 500 sur cast Postgres pour un id malformé.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entretienId)) {
    return NextResponse.json({ error: "entretienId invalide" }, { status: 400 });
  }
  const bytes = Number(body.bytes);
  const duration = Number(body.duration);

  const supabase = createAdminClient();
  // `.select("id")` : un UPDATE qui ne matche AUCUNE ligne ne renvoie pas
  // d'erreur Supabase. Sans ce contrôle on renverrait {ok:true} alors que rien
  // n'est écrit → le VPS croirait l'enregistrement enregistré et pourrait
  // supprimer le MP4. On exige donc exactement 1 ligne touchée, sinon 404.
  const { data, error } = await supabase
    .from("entretiens")
    .update({
      recording_path: path,
      recording_status: "ready",
      recording_bytes: Number.isFinite(bytes) ? Math.round(bytes) : null,
      recording_duration_s: Number.isFinite(duration) ? Math.round(duration) : null,
    })
    .eq("id", entretienId)
    .select("id");
  if (error) {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
  if (!data || data.length !== 1) {
    return NextResponse.json({ error: "entretien introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
