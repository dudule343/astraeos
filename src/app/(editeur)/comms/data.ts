import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Données de la page "Communications & annonces" (éditeur).
//
// CONSTAT SCHÉMA (db/migrations/0001_initial_schema.sql) : il n'existe AUCUNE
// table du domaine "communications sortantes marketing" — pas de campaigns,
// newsletters, webinars, comm_templates, ni de métriques d'ouverture/clic.
// Le concept entier de cette page (newsletters envoyées, taux d'ouverture,
// webinars, calendrier de comms, performances email) n'a donc pas de source.
//
// Deux tables approchent le sens "communication", sans le recouvrir :
//   - notifications : boîte de réception PERSO d'un user (recipient_user_id).
//     Pas de tenant_id/cabinet_id. = communications REÇUES par l'utilisateur
//     courant, pas un outil d'emailing sortant. On la lit honnêtement, scopée
//     sur ctx.userId, et on la présente pour ce qu'elle est.
//   - timeline_events : journal d'activité des dossiers (tenant/cabinet).
//     Ce n'est PAS un calendrier de comms → on ne le détourne pas.
//
// Le seed ne peuple ni notifications ni timeline_events → en mode legacy tout
// dégrade en état vide honnête. Aucune valeur n'est inventée.
// =========================================================================

export type NotificationItem = {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  body: string | null;
  priority: "low" | "normal" | "high" | "critical";
  priorityLabel: string;
  read: boolean;
  createdAt: string | null;
};

export type CommsData = {
  /** Notifications reçues par l'utilisateur courant (sa boîte de réception). */
  notifications: NotificationItem[];
  /** Total de notifications reçues. */
  notifTotal: number;
  /** Non lues. */
  notifUnread: number;
  /** Répartition par type (label → nombre). */
  notifByType: { type: string; label: string; count: number }[];
  hasNotifications: boolean;
};

const EMPTY: CommsData = {
  notifications: [],
  notifTotal: 0,
  notifUnread: 0,
  notifByType: [],
  hasNotifications: false,
};

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  new_message: "Message",
  document_signed: "Document signé",
  rdv_reminder: "Rappel RDV",
  study_delivered: "Étude livrée",
  commission_received: "Commission",
  compliance_alert: "Alerte conformité",
  system: "Système",
};

const NOTIFICATION_PRIORITY_LABELS: Record<string, string> = {
  low: "Faible",
  normal: "Normale",
  high: "Haute",
  critical: "Critique",
};

type NotificationRow = {
  id: string;
  type: string | null;
  title: string | null;
  body: string | null;
  priority: string | null;
  read_at: string | null;
  created_at: string | null;
};

export async function fetchCommsData(): Promise<CommsData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    // Boîte de réception de l'utilisateur courant. notifications n'a pas de
    // tenant_id/cabinet_id : le seul périmètre fiable est recipient_user_id.
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, priority, read_at, created_at")
      .eq("recipient_user_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return EMPTY;

    const rows = data as NotificationRow[];
    const notifications: NotificationItem[] = rows.map((n) => {
      const type = n.type ?? "system";
      const priority = (n.priority ?? "normal") as NotificationItem["priority"];
      return {
        id: n.id,
        type,
        typeLabel: NOTIFICATION_TYPE_LABELS[type] ?? type,
        title: n.title ?? "—",
        body: n.body ?? null,
        priority,
        priorityLabel: NOTIFICATION_PRIORITY_LABELS[priority] ?? priority,
        read: n.read_at != null,
        createdAt: n.created_at,
      };
    });

    const notifUnread = notifications.filter((n) => !n.read).length;

    const typeCounts = new Map<string, number>();
    for (const n of notifications) {
      typeCounts.set(n.type, (typeCounts.get(n.type) ?? 0) + 1);
    }
    const notifByType = [...typeCounts.entries()]
      .map(([type, count]) => ({
        type,
        label: NOTIFICATION_TYPE_LABELS[type] ?? type,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      notifications,
      notifTotal: notifications.length,
      notifUnread,
      notifByType,
      hasNotifications: notifications.length > 0,
    };
  } catch {
    return EMPTY;
  }
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
