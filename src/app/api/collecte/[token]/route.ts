import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

type Item = {
  theme?: string;
  sub?: string;
  label: string;
  type?: "Document" | "Question";
};

type Depot = {
  item_index: number;
  file_name: string | null;
  reponse: string | null;
  created_at: string;
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
    .select("id, client_nom, structure, opened_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !collecte) {
    return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
  }

  // Première ouverture : on horodate opened_at.
  if (!collecte.opened_at) {
    await supabase
      .from("collectes")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", collecte.id);
  }

  const { data: depotsData } = await supabase
    .from("collecte_depots")
    .select("item_index, file_name, reponse, created_at")
    .eq("collecte_id", collecte.id)
    .order("item_index", { ascending: true });

  const depots: Depot[] = (depotsData ?? []) as Depot[];
  const structure: Item[] = Array.isArray(collecte.structure)
    ? (collecte.structure as Item[])
    : [];

  return NextResponse.json({
    client_nom: collecte.client_nom,
    structure,
    depots,
    progress: { done: depots.length, total: structure.length },
  });
}
