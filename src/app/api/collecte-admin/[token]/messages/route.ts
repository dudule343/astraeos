import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

/**
 * Vue ingénieur : réponse du conseiller dans la conversation d'une collecte.
 * POST { body } → insert author='conseiller'.
 * Outil privé (service_role, pas d'auth à ce stade).
 */

// Next 16 : params est une Promise.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const { token } = await params;

  if (!token || token.length > 40) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  try {
    const supabase = createAdminClient();

    const { data: collecte, error } = await supabase
      .from("collectes")
      .select("id")
      .eq("token", token)
      .maybeSingle();

    if (error || !collecte) {
      return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
    }

    let payload: { body?: unknown; item_index?: unknown };
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const body = String(payload.body ?? "").trim();
    if (!body || body.length > 4000) {
      return NextResponse.json({ error: "Message vide ou trop long" }, { status: 400 });
    }
    const itemIndex =
      typeof payload.item_index === "number" && Number.isInteger(payload.item_index)
        ? payload.item_index
        : null;

    const { data, error: insertError } = await supabase
      .from("collecte_messages")
      .insert({ collecte_id: collecte.id, item_index: itemIndex, author: "conseiller", body })
      .select("id, item_index, author, body, created_at")
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Envoi impossible" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: data });
  } catch (err) {
    console.error("[collecte-admin/[token]/messages] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
