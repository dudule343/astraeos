import { NextResponse, type NextRequest, after } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { analyserDepot } from "@/lib/ia-analyse";
import { requireAuth } from "@/lib/auth";

/**
 * Vue ingénieur : relancer l'analyse IA d'un dépôt.
 * POST { item_index } → réexécute analyserDepot, qui re-upsert le statut.
 * Idempotent : sert à débloquer une pièce restée 'en_cours' (process serverless
 * coupé, surcharge transitoire) ou à réessayer une analyse en 'erreur'.
 * Outil privé (service_role, pas d'auth à ce stade), comme les autres routes
 * collecte-admin.
 */

// L'analyse IA tourne via `after()` après la réponse : on laisse la fonction
// vivre assez longtemps pour ne pas être coupée en plein appel modèle.
export const maxDuration = 60;

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

  const supabase = createAdminClient();

  const { data: collecte, error } = await supabase
    .from("collectes")
    .select("id, structure")
    .eq("token", token)
    .maybeSingle();

  if (error || !collecte) {
    return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
  }

  let payload: { item_index?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const itemIndex = Number(payload.item_index);
  if (!Number.isInteger(itemIndex) || itemIndex < 0) {
    return NextResponse.json({ error: "item_index invalide" }, { status: 400 });
  }

  const structure = Array.isArray(collecte.structure) ? collecte.structure : [];
  if (itemIndex >= structure.length) {
    return NextResponse.json({ error: "item_index hors structure" }, { status: 400 });
  }

  // Relance en post-réponse : on ne fait pas attendre l'ingénieur. analyserDepot
  // re-upsert le statut ('en_cours' puis verdict final), donc l'appel repart
  // proprement même si la pièce était bloquée.
  after(
    analyserDepot({ collecteId: collecte.id, itemIndex }).catch(() => {
      /* silencieux : l'analyse ne doit jamais faire échouer la requête */
    }),
  );

  return NextResponse.json({ ok: true });
}
