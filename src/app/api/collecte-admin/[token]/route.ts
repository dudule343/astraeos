import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Vue ingénieur : détail d'une collecte (structure, dépôts, messages, avancement).
 * Outil privé (service_role, pas d'auth à ce stade).
 */

type Item = {
  theme?: string;
  sub?: string;
  label: string;
  type?: "Document" | "Question";
};

type Depot = {
  item_index: number;
  label: string;
  file_name: string | null;
  file_size: number | null;
  reponse: string | null;
  created_at: string;
  storage_path: string | null;
};

// Next 16 : params est une Promise.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token || token.length > 40) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  const supabase = createAdminClient();

  const { data: collecte, error } = await supabase
    .from("collectes")
    .select("id, client_nom, client_email, created_at, opened_at, structure")
    .eq("token", token)
    .maybeSingle();

  if (error || !collecte) {
    return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
  }

  const [{ data: depotsData }, { data: messagesData }] = await Promise.all([
    supabase
      .from("collecte_depots")
      .select("item_index, label, file_name, file_size, reponse, created_at, storage_path")
      .eq("collecte_id", collecte.id)
      .order("item_index", { ascending: true }),
    supabase
      .from("collecte_messages")
      .select("id, item_index, author, body, created_at")
      .eq("collecte_id", collecte.id)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);

  const depots: Depot[] = (depotsData ?? []) as Depot[];
  const structure: Item[] = Array.isArray(collecte.structure)
    ? (collecte.structure as Item[])
    : [];

  return NextResponse.json({
    client_nom: collecte.client_nom,
    client_email: collecte.client_email,
    created_at: collecte.created_at,
    opened_at: collecte.opened_at,
    structure,
    depots,
    messages: messagesData ?? [],
    progress: { done: depots.length, total: structure.length },
  });
}
