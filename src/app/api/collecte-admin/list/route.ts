import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";

/**
 * Vue ingénieur : liste des collectes réelles avec leur avancement.
 * Réservé au cabinet (cookie de session).
 * Tri created_at desc, 50 dernières.
 */

type CollecteRow = {
  id: string;
  token: string;
  client_nom: string;
  client_email: string;
  created_at: string;
  email_sent_at: string | null;
  opened_at: string | null;
  structure: unknown;
};

export async function GET(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;
  try {
    const supabase = createAdminClient();

    const { data: collectes, error } = await supabase
      .from("collectes")
      .select("id, token, client_nom, client_email, created_at, email_sent_at, opened_at, structure")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
    }

    const rows = (collectes ?? []) as CollecteRow[];

    // Comptages et dernier message client par collecte.
    const result = await Promise.all(
      rows.map(async (c) => {
        const total = Array.isArray(c.structure) ? c.structure.length : 0;

        const [depCount, msgCount, lastMsg] = await Promise.all([
          supabase
            .from("collecte_depots")
            .select("id", { count: "exact", head: true })
            .eq("collecte_id", c.id),
          supabase
            .from("collecte_messages")
            .select("id", { count: "exact", head: true })
            .eq("collecte_id", c.id),
          supabase
            .from("collecte_messages")
            .select("created_at")
            .eq("collecte_id", c.id)
            .eq("author", "client")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        return {
          token: c.token,
          client_nom: c.client_nom,
          client_email: c.client_email,
          created_at: c.created_at,
          email_sent_at: c.email_sent_at,
          opened_at: c.opened_at,
          total,
          done: depCount.count ?? 0,
          messages: msgCount.count ?? 0,
          last_client_message_at:
            (lastMsg.data?.created_at as string | undefined) ?? null,
        };
      }),
    );

    return NextResponse.json({ collectes: result });
  } catch (err) {
    console.error("[collecte-admin/list] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
