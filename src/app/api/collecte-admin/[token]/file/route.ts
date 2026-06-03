import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "depots";

/**
 * Vue ingénieur : téléchargement d'une pièce déposée.
 * GET ?item_index=N → URL signée (1 h) puis redirect.
 * Outil privé (service_role, pas d'auth à ce stade).
 */

// Next 16 : params est une Promise.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token || token.length > 40) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const rawIndex = req.nextUrl.searchParams.get("item_index");
  const itemIndex = Number(rawIndex);
  if (rawIndex === null || !Number.isInteger(itemIndex) || itemIndex < 0) {
    return NextResponse.json({ error: "item_index invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: collecte, error } = await supabase
    .from("collectes")
    .select("id")
    .eq("token", token)
    .maybeSingle();

  if (error || !collecte) {
    return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
  }

  const { data: depot } = await supabase
    .from("collecte_depots")
    .select("storage_path")
    .eq("collecte_id", collecte.id)
    .eq("item_index", itemIndex)
    .maybeSingle();

  const storagePath = depot?.storage_path as string | null | undefined;
  if (!storagePath) {
    return NextResponse.json({ error: "Pièce introuvable" }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "URL signée indisponible" }, { status: 404 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
