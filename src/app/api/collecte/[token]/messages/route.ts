import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Messagerie client ↔ conseiller d'une collecte.
 * GET  : historique des messages (ordre chronologique).
 * POST : nouveau message côté client { body, item_index? }.
 */

async function findCollecte(token: string) {
  if (!token || token.length > 40) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("collectes")
    .select("id")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return null;
  return { supabase, id: data.id as string };
}

// Next 16 : params est une Promise.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const found = await findCollecte(token);
  if (!found) {
    return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
  }

  const { data, error } = await found.supabase
    .from("collecte_messages")
    .select("id, item_index, author, body, created_at")
    .eq("collecte_id", found.id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const found = await findCollecte(token);
  if (!found) {
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

  const { data, error } = await found.supabase
    .from("collecte_messages")
    .insert({ collecte_id: found.id, item_index: itemIndex, author: "client", body })
    .select("id, item_index, author, body, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Envoi impossible" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: data });
}
