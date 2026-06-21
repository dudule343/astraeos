import { NextRequest, NextResponse } from "next/server";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Téléchargement de l'enregistrement vidéo d'un entretien.
 * GET /api/recordings/download?entretienId=... (ou ?room=...)
 *
 * Réservé au STAFF (l'enregistrement est confidentiel). On récupère le
 * `recording_path` de l'entretien (posé par finalize.sh côté VPS), on crée une
 * URL SIGNÉE temporaire (1 h) du bucket privé `recordings`, et on redirige
 * dessus en mode téléchargement. Le MP4 n'est jamais public.
 */
export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const entretienId = params.get("entretienId");
  const room = params.get("room");
  if (!entretienId && !room) {
    return NextResponse.json({ error: "entretienId ou room requis" }, { status: 400 });
  }

  const supabase = createAdminClient();

  let query = supabase
    .from("entretiens")
    .select("id, recording_path")
    .not("recording_path", "is", null)
    .limit(1);
  query = entretienId
    ? query.eq("id", entretienId)
    : query.eq("room", room).order("created_at", { ascending: false });

  const { data, error } = await query.maybeSingle();
  if (error || !data?.recording_path) {
    return NextResponse.json(
      { error: "Aucun enregistrement disponible pour ce rendez-vous." },
      { status: 404 },
    );
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("recordings")
    .createSignedUrl(data.recording_path as string, 3600, { download: true });
  if (signError || !signed?.signedUrl) {
    return NextResponse.json(
      { error: "Lien de téléchargement indisponible." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
