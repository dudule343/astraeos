import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import type { Dossier } from "@/lib/pipeline";

/**
 * Charge les dossiers du cabinet courant, projetés sur le type pur `Dossier`.
 * Source unique partagée par les pages du parcours patrimonial de l'espace
 * ingénieur (conformité, études, études restituées, clients en suivi).
 * Renvoie [] si Supabase n'est pas configuré ou si aucune session.
 */
export async function fetchDossiers(): Promise<Dossier[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const ctx = await getSessionContext();
  if (!ctx) return [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          pipeline_stage,
          priority,
          dci_completion_pct,
          pipeline_entry_date,
          stage_entered_at,
          study_delivered_at,
          restitution_meeting_date,
          days_in_stage_cached,
          internal_notes,
          clients ( personnes ( first_name, last_name ) )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("stage_entered_at", { ascending: false })
      .limit(200);

    if (!data) return [];

    return data.map((d: Record<string, unknown>) => {
      let raisonSociale: string | undefined;
      const notesRaw = d.internal_notes as string | null | undefined;
      if (notesRaw) {
        try {
          raisonSociale = (JSON.parse(notesRaw) as { raison_sociale?: string }).raison_sociale;
        } catch {
          // internal_notes non-JSON : on ignore
        }
      }
      const clientRaw = d.clients as
        | { personnes?: Array<{ first_name?: string; last_name?: string }> }
        | Array<{ personnes?: Array<{ first_name?: string; last_name?: string }> }>
        | null
        | undefined;
      const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
      const person = client?.personnes?.[0];
      const representant = person
        ? `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim()
        : "";

      return {
        id: d.id as string,
        stage: d.pipeline_stage as string,
        name: raisonSociale || representant || "Dossier sans nom",
        priority: (d.priority as string) ?? null,
        dciPct: (d.dci_completion_pct as number) ?? null,
        entryDate: (d.pipeline_entry_date as string) ?? null,
        stageEnteredAt: (d.stage_entered_at as string) ?? null,
        deliveredAt: (d.study_delivered_at as string) ?? null,
        restitDate: (d.restitution_meeting_date as string) ?? null,
        daysInStage: (d.days_in_stage_cached as number) ?? null,
      } satisfies Dossier;
    });
  } catch {
    return [];
  }
}

const STAGE_LABEL_MAP: Record<string, string> = {
  "01_prospect": "Prospects",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
};

export function stageLabel(stage: string): string {
  return STAGE_LABEL_MAP[stage] ?? stage;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function formatDateFr(date: string | null | undefined): string {
  if (!date) return "—";
  const t = new Date(date);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
