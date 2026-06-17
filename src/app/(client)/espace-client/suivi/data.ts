import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getClientContext } from "../../_data/client";

// =========================================================================
// Lecture du suivi & de la restitution — AUTH-GATÉ role='client'.
//
// On NE touche pas au data layer partagé (_data/client.ts). Ici on lit deux
// tables que ce data layer n'expose pas encore : `rdv` et `etudes`.
// Le scope est RE-RÉSOLU à chaque appel via getClientContext() : on part
// TOUJOURS de personnes.user_id = session → client_id → dossier_id, jamais
// d'un identifiant fourni par le client. On ne lit donc QUE le dossier du
// client connecté. Toute erreur / absence dégrade en état vide honnête.
// =========================================================================

const RDV_TYPE_LABELS: Record<string, string> = {
  decouverte: "Entretien découverte",
  collecte: "Entretien de collecte",
  restitution: "Restitution de l'étude",
  signature: "Signature",
  suivi_annuel: "Point annuel",
  autre: "Rendez-vous",
};

const RDV_FORMAT_LABELS: Record<string, string> = {
  visio: "Visioconférence",
  presentiel: "En cabinet",
  telephone: "Téléphone",
};

export type ClientRdv = {
  id: string;
  typeLabel: string;
  formatLabel: string;
  format: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  videoRoomUrl: string | null;
};

/**
 * RDV à venir du dossier du client : statut planifié/confirmé et date future.
 * Triés du plus proche au plus lointain. Dégrade à [].
 */
export async function fetchClientUpcomingRdv(): Promise<ClientRdv[]> {
  try {
    const client = await getClientContext();
    if (!client) return [];

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("rdv")
      .select(
        "id, type, format, scheduled_at, duration_minutes, status, video_room_url, dossier_id",
      )
      .eq("dossier_id", client.dossierId)
      .in("status", ["scheduled", "confirmed"])
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });

    if (error || !data) return [];

    return data.map((r) => {
      const type = (r.type as string) ?? "autre";
      const format = (r.format as string) ?? "visio";
      return {
        id: r.id as string,
        typeLabel: RDV_TYPE_LABELS[type] ?? RDV_TYPE_LABELS.autre,
        formatLabel: RDV_FORMAT_LABELS[format] ?? format,
        format,
        scheduledAt: r.scheduled_at as string,
        durationMinutes: Number(r.duration_minutes ?? 60),
        status: (r.status as string) ?? "scheduled",
        videoRoomUrl: (r.video_room_url as string) ?? null,
      };
    });
  } catch {
    return [];
  }
}

export type ClientEtude = {
  id: string;
  version: number;
  status: string;
  delivered: boolean;
  deliveredAt: string | null;
  completePdfUrl: string | null;
  summaryPdfUrl: string | null;
  interactiveWebUrl: string | null;
};

/**
 * Étude livrée du dossier du client (la plus récente). On n'expose le rapport
 * QUE lorsque l'étude est délivrée (status='delivered' && delivered_at). Tant
 * qu'elle ne l'est pas → null (état vide honnête, le rapport n'apparaît pas).
 */
export async function fetchClientEtude(): Promise<ClientEtude | null> {
  try {
    const client = await getClientContext();
    if (!client) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("etudes")
      .select(
        "id, version, status, delivered_at, complete_pdf_url, summary_pdf_url, interactive_web_url, dossier_id",
      )
      .eq("dossier_id", client.dossierId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const status = (data.status as string) ?? "draft";
    const deliveredAt = (data.delivered_at as string) ?? null;
    const delivered = status === "delivered" && Boolean(deliveredAt);

    if (!delivered) return null;

    return {
      id: data.id as string,
      version: Number(data.version ?? 1),
      status,
      delivered,
      deliveredAt,
      completePdfUrl: (data.complete_pdf_url as string) ?? null,
      summaryPdfUrl: (data.summary_pdf_url as string) ?? null,
      interactiveWebUrl: (data.interactive_web_url as string) ?? null,
    };
  } catch {
    return null;
  }
}
