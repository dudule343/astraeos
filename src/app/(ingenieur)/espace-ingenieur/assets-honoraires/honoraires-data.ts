import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

/** Une étude facturée : ligne du tableau « Détail de mes études patrimoniales ». */
export type HonoraireRow = {
  id: string;
  /** Représentant principal du client (ou raison sociale pour une PM). */
  clientName: string;
  /** Date d'entrée en relation (pipeline_entry_date). */
  entryDate: string | null;
  /** Date de restitution / livraison de l'étude. */
  studyDate: string | null;
  /** Honoraires HT facturés, en euros (number), ou null si inconnu. */
  honoraires: number | null;
};

export type HonorairesSummary = {
  rows: HonoraireRow[];
  /** Nombre d'études et missions réalisées (= lignes avec honoraires connus). */
  studyCount: number;
  /** Total HT facturé sur le portefeuille (somme des honoraires connus). */
  totalHt: number;
  /** Honoraire moyen (totalHt / studyCount), ou null si aucune étude chiffrée. */
  averageHt: number | null;
};

/** total_revenue_cached / internal_notes.revenue → euros (number) ou null. */
function parseHonoraires(rawCached: unknown, notesRaw: unknown): number | null {
  const fromColumn = toAmount(rawCached);
  if (fromColumn != null) return fromColumn;
  if (typeof notesRaw === "string") {
    try {
      const notes = JSON.parse(notesRaw) as { revenue?: unknown };
      return toAmount(notes.revenue);
    } catch {
      return null;
    }
  }
  return null;
}

function toAmount(raw: unknown): number | null {
  if (raw == null) return null;
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function fullName(p?: { first_name?: string | null; last_name?: string | null }): string {
  if (!p) return "";
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
}

/**
 * Charge les études patrimoniales facturées du portefeuille de l'ingénieur :
 * dossiers livrés / restitués / en suivi, avec leurs honoraires (total_revenue_cached,
 * fallback internal_notes.revenue). Source réelle de la rubrique honoraires de conseil.
 *
 * Dégradation gracieuse : renvoie un résumé vide si Supabase n'est pas configuré,
 * sans session, ou en cas d'erreur Postgres. La page affiche alors un état honnête.
 */
export async function fetchHonoraires(): Promise<HonorairesSummary> {
  const empty: HonorairesSummary = { rows: [], studyCount: 0, totalHt: 0, averageHt: null };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return empty;

  const ctx = await getSessionContext();
  if (!ctx) return empty;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          pipeline_stage,
          pipeline_entry_date,
          study_delivered_at,
          restitution_meeting_date,
          total_revenue_cached,
          internal_notes,
          clients ( personnes ( first_name, last_name ) )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      // Études effectivement facturées : restituées + en suivi.
      .in("pipeline_stage", ["05_restituee", "06_suivi"])
      .order("study_delivered_at", { ascending: false })
      .limit(200);

    if (!data || data.length === 0) return empty;

    const rows: HonoraireRow[] = data.map((d: Record<string, unknown>) => {
      const notesRaw = d.internal_notes as string | null | undefined;
      let raisonSociale: string | undefined;
      if (typeof notesRaw === "string") {
        try {
          raisonSociale = (JSON.parse(notesRaw) as { raison_sociale?: string }).raison_sociale;
        } catch {
          // internal_notes non-JSON : ignoré
        }
      }

      const clientRaw = d.clients as
        | { personnes?: Array<{ first_name?: string; last_name?: string }> }
        | Array<{ personnes?: Array<{ first_name?: string; last_name?: string }> }>
        | null
        | undefined;
      const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
      const person = client?.personnes?.[0];

      return {
        id: d.id as string,
        clientName: raisonSociale || fullName(person) || "Dossier sans nom",
        entryDate: (d.pipeline_entry_date as string) ?? null,
        studyDate:
          (d.study_delivered_at as string) ?? (d.restitution_meeting_date as string) ?? null,
        honoraires: parseHonoraires(d.total_revenue_cached, notesRaw),
      } satisfies HonoraireRow;
    });

    const chiffrees = rows.filter((r) => r.honoraires != null);
    const totalHt = chiffrees.reduce((sum, r) => sum + (r.honoraires ?? 0), 0);
    const studyCount = chiffrees.length;
    const averageHt = studyCount > 0 ? Math.round(totalHt / studyCount) : null;

    return { rows, studyCount, totalHt, averageHt };
  } catch {
    return empty;
  }
}

/** Formate un montant en euros au format FR (« 12 800 € »), ou « — » si null. */
export function formatEuros(n: number | null): string {
  if (n == null) return "—";
  return `${n.toLocaleString("fr-FR")} €`;
}
