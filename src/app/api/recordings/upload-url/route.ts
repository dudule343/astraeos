import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/recordings/upload-url
 *
 * Appelé par le script finalize de Jibri (sur le VPS) après un enregistrement.
 * Authentifié par un secret partagé (header x-recording-secret == env
 * RECORDINGS_WEBHOOK_SECRET) — pas de session navigateur ici.
 *
 * Body { room, filename } (room = nom de salle Jitsi). On mappe la salle →
 * entretien, on crée une URL d'upload SIGNÉE vers le bucket privé 'recordings'
 * (la clé service ne quitte jamais l'app), et on marque l'entretien 'uploading'.
 * Le VPS pousse ensuite le MP4 directement vers le stockage via cette URL.
 */

const ROOM_PREFIX = "astraeospriveos_";

function visioRoomFromJitsi(jitsiRoom: string): string {
  const r = jitsiRoom.toLowerCase();
  return r.startsWith(ROOM_PREFIX) ? r.slice(ROOM_PREFIX.length) : r;
}

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

  let body: { room?: unknown; filename?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const room = String(body.room ?? "").trim();
  const filename = String(body.filename ?? "recording.mp4")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
  if (!room) return NextResponse.json({ error: "room required" }, { status: 400 });

  const visioRoom = visioRoomFromJitsi(room);
  const supabase = createAdminClient();

  // Entretien le plus récent pour cette salle (l'upsert serveur est par room).
  const { data: ent } = await supabase
    .from("entretiens")
    .select("id")
    .eq("room", visioRoom)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!ent) {
    return NextResponse.json({ error: "entretien introuvable", room: visioRoom }, { status: 404 });
  }

  const path = `${ent.id}/${Date.now()}_${filename}`;
  const { data: signed, error } = await supabase.storage
    .from("recordings")
    .createSignedUploadUrl(path);
  if (error || !signed) {
    return NextResponse.json({ error: "signed url failed" }, { status: 500 });
  }

  await supabase
    .from("entretiens")
    .update({ recording_status: "uploading", recording_started_at: new Date().toISOString() })
    .eq("id", ent.id);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return NextResponse.json({
    entretienId: ent.id,
    path,
    token: signed.token,
    // URL PUT directe vers le stockage (signée, sans clé service côté VPS).
    uploadUrl: `${base}/storage/v1/object/upload/sign/recordings/${path}?token=${signed.token}`,
  });
}
