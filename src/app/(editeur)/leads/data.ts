import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// Pipeline d'acquisition (vue commerciale du cabinet) : on lit les dossiers en
// amont de l'étude, scopés sur le cabinet courant (PAS sur l'ingénieur, contraire-
// ment à mon-activite). En mode legacy (auth off), getSessionContext renvoie le
// contexte du seed → données réelles du cabinet.
//
// Le concept "lead/prospect" n'existe pas comme table dédiée : la source réelle
// est `dossiers` (pipeline_stage) + le client/personnes/ingénieur joints. Tout ce
// qui n'a pas de source (cabinet du prospect, "prochaine action", €/mois par étape,
// essais proposés, filtres commerciaux) reste en état vide honnête.

// Étapes du pipeline réel de l'enum DB pipeline_stage.
export const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
  "00_archive": "Archivé",
};

// Les 6 étapes commerciales affichées dans le bloc "Pipeline". On s'aligne sur les
// vrais stages du dossier pour rester honnête (pas de pipeline commercial inventé).
const PIPELINE_ORDER = [
  "01_prospect",
  "02_compliance",
  "03_collecte",
  "04_etudes",
  "05_restituee",
  "06_suivi",
];

// Étapes considérées "amont" (= leads commerciaux, avant production d'étude).
const LEAD_STAGES = ["01_prospect", "02_compliance"];

// Badge "Source" : libellés FR de l'enum acquisition_origin.
const ACQUISITION_LABELS: Record<string, string> = {
  recommandation: "Recommandation",
  captation_directe: "Captation directe",
  reattribution: "Réattribution",
  marketing: "Marketing",
  autre: "Autre",
};

// Teinte du badge source (réutilise les tons existants du composant page).
const ACQUISITION_TONE: Record<string, "success" | "info" | "warning" | "purple"> = {
  recommandation: "success",
  captation_directe: "info",
  reattribution: "purple",
  marketing: "warning",
  autre: "info",
};

// Teinte du badge étape, dérivée du stage réel.
const STAGE_TONE: Record<string, "warning" | "success" | "info"> = {
  "01_prospect": "warning",
  "02_compliance": "info",
  "03_collecte": "info",
  "04_etudes": "info",
  "05_restituee": "success",
  "06_suivi": "success",
  "00_archive": "info",
};

// Libellé d'action dérivé du stage (statique, pas une donnée inventée).
const STAGE_CTA: Record<string, { label: string; primary: boolean }> = {
  "01_prospect": { label: "Qualifier", primary: true },
  "02_compliance": { label: "Suivre", primary: false },
};

export type LeadSource = {
  value: string;
  tone: "success" | "info" | "warning" | "purple";
} | null;

export type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  cabinet: null; // pas de source réelle (attribut B2C absent du schéma) → "—"
  source: LeadSource;
  stage: string;
  stageLabel: string;
  stageTone: "warning" | "success" | "info";
  lastContact: string; // formaté ; "—" si null
  nextAction: null; // pas de champ → "—"
  assignee: string | null;
  cta: { label: string; primary: boolean };
};

export type PipelineStep = {
  stage: string;
  label: string;
  count: number;
  active: boolean;
};

export type LeadsKpis = {
  leadsTotal: number;
  nouveauxMois: number;
  nouveauxMoisDelta: number | null; // variation vs M-1 (réelle, 2e requête)
  rdvPlanifies: number;
  essaisProposes: null; // pas de table d'essai → "—"
  tauxQualif: number | null; // % amont qualifié (02_compliance / total amont)
  delaiMoyenJours: number | null; // moyenne stage_entered_at - pipeline_entry_date
};

export type LeadsData = {
  kpis: LeadsKpis;
  pipeline: PipelineStep[];
  leads: LeadRow[];
  totalCount: number;
  hasData: boolean;
};

const EMPTY: LeadsData = {
  kpis: {
    leadsTotal: 0,
    nouveauxMois: 0,
    nouveauxMoisDelta: null,
    rdvPlanifies: 0,
    essaisProposes: null,
    tauxQualif: null,
    delaiMoyenJours: null,
  },
  pipeline: PIPELINE_ORDER.map((s) => ({
    stage: s,
    label: STAGE_LABELS[s] ?? s,
    count: 0,
    active: false,
  })),
  leads: [],
  totalCount: 0,
  hasData: false,
};

type Personne = {
  role_in_household?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
};
type ClientEmbed = {
  acquisition_origin?: string | null;
  personnes?: Personne[] | Personne | null;
};
type UserEmbed = { first_name?: string | null; last_name?: string | null };
type LeadDossierRow = {
  id: string;
  pipeline_stage: string | null;
  last_activity_at: string | null;
  created_at: string | null;
  engineer_id: string | null;
  clients?: ClientEmbed | ClientEmbed[] | null;
  users?: UserEmbed | UserEmbed[] | null;
};

function clientOf(row: LeadDossierRow): ClientEmbed | null {
  return Array.isArray(row.clients) ? (row.clients[0] ?? null) : (row.clients ?? null);
}

// Représentant principal du client : person_a en priorité, sinon le premier.
function primaryPersonne(client: ClientEmbed | null): Personne | null {
  if (!client) return null;
  const persons = client.personnes;
  const list = Array.isArray(persons) ? persons : persons ? [persons] : [];
  if (list.length === 0) return null;
  return list.find((p) => p.role_in_household === "person_a") ?? list[0];
}

function assigneeOf(row: LeadDossierRow): string | null {
  const u = Array.isArray(row.users) ? row.users[0] : row.users;
  if (!u) return null;
  const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  return name || null;
}

export async function fetchLeads(): Promise<LeadsData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();
    const now = new Date();
    const nowIso = now.toISOString();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    // --- Bloc Pipeline : compte de TOUS les dossiers du cabinet par étape. ---
    const { data: stageRows } = await supabase
      .from("dossiers")
      .select("pipeline_stage")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);

    const stageCounts = new Map<string, number>();
    for (const d of stageRows ?? []) {
      const s = (d.pipeline_stage as string) ?? "01_prospect";
      stageCounts.set(s, (stageCounts.get(s) ?? 0) + 1);
    }
    // L'étape active = celle la plus peuplée parmi les étapes amont (dérivé, pas figé).
    let activeStage = "";
    let activeMax = -1;
    for (const s of LEAD_STAGES) {
      const c = stageCounts.get(s) ?? 0;
      if (c > activeMax) {
        activeMax = c;
        activeStage = s;
      }
    }
    const pipeline: PipelineStep[] = PIPELINE_ORDER.map((stage) => ({
      stage,
      label: STAGE_LABELS[stage] ?? stage,
      count: stageCounts.get(stage) ?? 0,
      active: stage === activeStage && activeMax > 0,
    }));

    // --- Bloc Liste : dossiers amont avec client / personnes / ingénieur. ---
    const { data: leadsRaw } = await supabase
      .from("dossiers")
      .select(
        `id, pipeline_stage, last_activity_at, created_at, engineer_id,
         pipeline_entry_date, stage_entered_at,
         clients(acquisition_origin, personnes(role_in_household, first_name, last_name, email, phone)),
         users:engineer_id(first_name, last_name)`,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("pipeline_stage", LEAD_STAGES)
      .order("last_activity_at", { ascending: false })
      .limit(50);

    const leadRows = (leadsRaw ?? []) as LeadDossierRow[];
    const leads: LeadRow[] = leadRows.map((row) => {
      const client = clientOf(row);
      const p = primaryPersonne(client);
      const stage = row.pipeline_stage ?? "01_prospect";
      const origin = client?.acquisition_origin ?? null;
      const name = p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || null : null;
      return {
        id: row.id,
        name,
        email: p?.email ?? null,
        phone: p?.phone ?? null,
        cabinet: null,
        source:
          origin && ACQUISITION_LABELS[origin]
            ? { value: ACQUISITION_LABELS[origin], tone: ACQUISITION_TONE[origin] ?? "info" }
            : null,
        stage,
        stageLabel: STAGE_LABELS[stage] ?? stage,
        stageTone: STAGE_TONE[stage] ?? "info",
        lastContact: fmtRelDate(row.last_activity_at),
        nextAction: null,
        assignee: assigneeOf(row),
        cta: STAGE_CTA[stage] ?? { label: "Ouvrir", primary: false },
      };
    });

    // --- Bloc KPIs ---
    // Leads totaux = dossiers amont du cabinet.
    const leadsTotal = LEAD_STAGES.reduce((acc, s) => acc + (stageCounts.get(s) ?? 0), 0);

    // Nouveaux ce mois + variation vs M-1 (dossiers amont créés dans la fenêtre).
    const { count: nouveauxMoisCount } = await supabase
      .from("dossiers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("pipeline_stage", LEAD_STAGES)
      .gte("created_at", startOfThisMonth);
    const nouveauxMois = nouveauxMoisCount ?? 0;

    const { count: prevMoisCount } = await supabase
      .from("dossiers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("pipeline_stage", LEAD_STAGES)
      .gte("created_at", startOfPrevMonth)
      .lt("created_at", startOfThisMonth);
    const prevMois = prevMoisCount ?? 0;
    const nouveauxMoisDelta =
      prevMois > 0 ? Math.round(((nouveauxMois - prevMois) / prevMois) * 100) : null;

    // RDV planifiés à venir (table rdv, cabinet).
    const { count: rdvCount } = await supabase
      .from("rdv")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("status", ["scheduled", "confirmed"])
      .gte("scheduled_at", nowIso);
    const rdvPlanifies = rdvCount ?? 0;

    // Taux de qualification : part des leads amont passés en conformité.
    const prospects = stageCounts.get("01_prospect") ?? 0;
    const conformite = stageCounts.get("02_compliance") ?? 0;
    const tauxQualif = leadsTotal > 0 ? Math.round((conformite / leadsTotal) * 100) : null;
    void prospects; // (prospects = amont brut, conservé pour lisibilité)

    // Délai moyen en étape amont : stage_entered_at - pipeline_entry_date (jours).
    const delaiMoyenJours = computeDelaiMoyen(leadRows);

    const hasData = (stageRows?.length ?? 0) > 0;

    return {
      kpis: {
        leadsTotal,
        nouveauxMois,
        nouveauxMoisDelta,
        rdvPlanifies,
        essaisProposes: null,
        tauxQualif,
        delaiMoyenJours,
      },
      pipeline,
      leads,
      totalCount: leadsTotal,
      hasData,
    };
  } catch {
    return EMPTY;
  }
}

function computeDelaiMoyen(rows: LeadDossierRow[]): number | null {
  const deltas: number[] = [];
  for (const r of rows) {
    const row = r as LeadDossierRow & {
      pipeline_entry_date?: string | null;
      stage_entered_at?: string | null;
    };
    if (!row.pipeline_entry_date || !row.stage_entered_at) continue;
    const entry = new Date(row.pipeline_entry_date).getTime();
    const entered = new Date(row.stage_entered_at).getTime();
    if (!Number.isFinite(entry) || !Number.isFinite(entered)) continue;
    const days = (entered - entry) / (1000 * 60 * 60 * 24);
    if (days >= 0) deltas.push(days);
  }
  if (deltas.length === 0) return null;
  return Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);
}

// Date relative FR ("Aujourd'hui", "Hier", "il y a N jours", sinon date courte).
export function fmtRelDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startToday.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  return fmtDate(iso);
}

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
