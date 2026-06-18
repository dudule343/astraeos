import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { getSessionContext } from "@/lib/auth/context";

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
  const denied = await requireAuth(req);
  if (denied) return denied;

  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

  const { token } = await params;

  if (!token || token.length > 40) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const rawIndex = req.nextUrl.searchParams.get("item_index");
  const itemIndex = Number(rawIndex);
  if (rawIndex === null || !Number.isInteger(itemIndex) || itemIndex < 0) {
    return NextResponse.json({ error: "item_index invalide" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: collecte, error } = await supabase
      .from("collectes")
      .select("id, tenant_id")
      .eq("token", token)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    // Isolation cabinet : token non secret → on borne tenant + cabinet en requête.
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
  } catch (err) {
    console.error("[collecte-admin/[token]/file] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
