import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Vitesse première valeur (TTV) — vue d'ÉQUIPE du cabinet courant.
// Périmètre : cabinet_id + tenant_id (funnel d'ingénieurs), pas l'activité
// perso. Tout est dérivé du schéma réel :
//   - dossiers.created_at / engineer_id / cabinet_id / tenant_id
//   - etudes (rattachées via dossier_id) : created_at, delivered_at, status
//   - users (role='engineer') = cohorte des ingénieurs du cabinet
//
// Deux jalons n'ont AUCUNE source dans le schéma actuel et restent en état
// vide honnête (jamais de valeur inventée) :
//   - "Connexion initiale" : pas de tracking de premier login horodaté.
//   - "Première simulation" : pas de table `simulations`.
// =========================================================================

export type TtvMilestone = {
  label: string;
  /** Valeur déjà formatée pour la carte ("5,8", "—"). */
  value: string;
  unit?: string;
  meta?: string;
};

export type TtvFunnelStep = {
  label: string;
  /** null = jalon non instrumenté (ligne affichée en état vide, pas de barre factice). */
  pct: number | null;
  reached: number;
  cohort: number;
  tracked: boolean;
};

export type TtvData = {
  milestones: TtvMilestone[];
  funnel: TtvFunnelStep[];
  /** Nombre d'ingénieurs de la cohorte (remplace le "18" hardcodé). */
  cohort: number;
  hasData: boolean;
};

// -------------------------------------------------------------------------
// Formatage
// -------------------------------------------------------------------------

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Médiane d'une liste de nombres, ou null si vide. */
export function median(values: number[]): number | null {
  const xs = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 === 0 ? (xs[mid - 1] + xs[mid]) / 2 : xs[mid];
}

/** Délai en jours entre deux dates ISO, ou null si l'une manque / incohérente. */
export function daysBetween(fromIso: string | null, toIso: string | null): number | null {
  if (!fromIso || !toIso) return null;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  const d = (to - from) / MS_PER_DAY;
  return d >= 0 ? d : null;
}

/** Formate un nombre de jours pour une carte. null/NaN → "—". */
export function fmtJours(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// -------------------------------------------------------------------------
// Agrégations pures (testables sans DB)
// -------------------------------------------------------------------------

type DossierRow = { id: string; engineer_id: string | null; created_at: string | null };
type EtudeRow = {
  dossier_id: string;
  status: string | null;
  created_at: string | null;
  delivered_at: string | null;
};

type Aggregates = {
  /** Délai médian création dossier → 1ère étude (toute version). */
  medianeFirstEtude: number | null;
  /** Délai médian création dossier → 1ère étude livrée (status='delivered'). */
  medianeFirstReport: number | null;
  /** Délai médian création compte ingénieur → son 1er dossier. */
  medianeFirstClient: number | null;
  /** Ingénieurs (de la cohorte) ayant ≥1 dossier. */
  engineersWithDossier: number;
  /** Ingénieurs ayant ≥1 dossier avec ≥1 étude. */
  engineersWithEtude: number;
  /** Ingénieurs ayant ≥1 étude livrée sur leurs dossiers. */
  engineersWithReport: number;
};

/**
 * Cœur du calcul. `engineers` = [{id, created_at}] de la cohorte du cabinet.
 * Pur : aucune dépendance Supabase → testable directement.
 */
export function computeAggregates(
  engineers: { id: string; created_at: string | null }[],
  dossiers: DossierRow[],
  etudes: EtudeRow[],
): Aggregates {
  const cohortIds = new Set(engineers.map((e) => e.id));
  const engineerCreatedAt = new Map(engineers.map((e) => [e.id, e.created_at]));

  // 1ère étude (toute version) et 1ère étude livrée, par dossier.
  const firstEtudeAt = new Map<string, string>();
  const firstDeliveredAt = new Map<string, string>();
  for (const e of etudes) {
    if (e.created_at) {
      const cur = firstEtudeAt.get(e.dossier_id);
      if (!cur || e.created_at < cur) firstEtudeAt.set(e.dossier_id, e.created_at);
    }
    if (e.status === "delivered" && e.delivered_at) {
      const cur = firstDeliveredAt.get(e.dossier_id);
      if (!cur || e.delivered_at < cur) firstDeliveredAt.set(e.dossier_id, e.delivered_at);
    }
  }

  const delaisFirstEtude: number[] = [];
  const delaisFirstReport: number[] = [];
  // 1er dossier par ingénieur (date la plus ancienne).
  const firstDossierAt = new Map<string, string>();

  for (const d of dossiers) {
    if (d.created_at && d.engineer_id) {
      const cur = firstDossierAt.get(d.engineer_id);
      if (!cur || d.created_at < cur) firstDossierAt.set(d.engineer_id, d.created_at);
    }
    const fe = firstEtudeAt.get(d.id);
    if (fe) {
      const v = daysBetween(d.created_at, fe);
      if (v != null) delaisFirstEtude.push(v);
    }
    const fd = firstDeliveredAt.get(d.id);
    if (fd) {
      const v = daysBetween(d.created_at, fd);
      if (v != null) delaisFirstReport.push(v);
    }
  }

  // Délai compte ingénieur → 1er dossier (sur la cohorte uniquement).
  const delaisFirstClient: number[] = [];
  for (const [engId, dossierAt] of firstDossierAt) {
    if (!cohortIds.has(engId)) continue;
    const v = daysBetween(engineerCreatedAt.get(engId) ?? null, dossierAt);
    if (v != null) delaisFirstClient.push(v);
  }

  // Funnel : combien d'ingénieurs de la cohorte ont atteint chaque jalon.
  const engineersWithDossier = new Set<string>();
  const engineersWithEtude = new Set<string>();
  const engineersWithReport = new Set<string>();
  const engineerOfDossier = new Map<string, string | null>();
  for (const d of dossiers) {
    engineerOfDossier.set(d.id, d.engineer_id);
    if (d.engineer_id && cohortIds.has(d.engineer_id)) engineersWithDossier.add(d.engineer_id);
  }
  for (const [dossierId] of firstEtudeAt) {
    const eng = engineerOfDossier.get(dossierId);
    if (eng && cohortIds.has(eng)) engineersWithEtude.add(eng);
  }
  for (const [dossierId] of firstDeliveredAt) {
    const eng = engineerOfDossier.get(dossierId);
    if (eng && cohortIds.has(eng)) engineersWithReport.add(eng);
  }

  return {
    medianeFirstEtude: median(delaisFirstEtude),
    medianeFirstReport: median(delaisFirstReport),
    medianeFirstClient: median(delaisFirstClient),
    engineersWithDossier: engineersWithDossier.size,
    engineersWithEtude: engineersWithEtude.size,
    engineersWithReport: engineersWithReport.size,
  };
}

/** Construit l'objet TtvData (milestones + funnel) à partir des agrégats. */
export function buildTtvData(cohort: number, agg: Aggregates): TtvData {
  const pct = (reached: number) =>
    cohort > 0 ? Math.round((reached / cohort) * 100) : 0;

  const milestones: TtvMilestone[] = [
    {
      label: "Connexion initiale",
      value: "—",
      meta: "donnée non suivie",
    },
    {
      label: "Premier client ajouté",
      value: fmtJours(agg.medianeFirstClient),
      unit: agg.medianeFirstClient != null ? "jours" : undefined,
      meta: agg.medianeFirstClient != null ? "médiane" : "aucune donnée",
    },
    {
      label: "Première étude patrimoniale",
      value: fmtJours(agg.medianeFirstEtude),
      unit: agg.medianeFirstEtude != null ? "jours" : undefined,
      meta: agg.medianeFirstEtude != null ? "médiane" : "aucune donnée",
    },
    {
      label: "Première simulation",
      value: "—",
      meta: "module non instrumenté",
    },
    {
      label: "Premier rapport généré",
      value: fmtJours(agg.medianeFirstReport),
      unit: agg.medianeFirstReport != null ? "jours" : undefined,
      meta:
        agg.medianeFirstReport != null
          ? "médiane · révèle la valeur"
          : "aucune donnée",
    },
  ];

  const funnel: TtvFunnelStep[] = [
    {
      label: "Connexion initiale",
      pct: null,
      reached: 0,
      cohort,
      tracked: false,
    },
    {
      label: "Premier client ajouté",
      pct: pct(agg.engineersWithDossier),
      reached: agg.engineersWithDossier,
      cohort,
      tracked: true,
    },
    {
      label: "Première étude patrimoniale",
      pct: pct(agg.engineersWithEtude),
      reached: agg.engineersWithEtude,
      cohort,
      tracked: true,
    },
    {
      label: "Première simulation",
      pct: null,
      reached: 0,
      cohort,
      tracked: false,
    },
    {
      label: "Premier rapport généré",
      pct: pct(agg.engineersWithReport),
      reached: agg.engineersWithReport,
      cohort,
      tracked: true,
    },
  ];

  const hasData =
    cohort > 0 &&
    (agg.engineersWithDossier > 0 ||
      agg.medianeFirstEtude != null ||
      agg.medianeFirstReport != null);

  return { milestones, funnel, cohort, hasData };
}

const EMPTY: TtvData = buildTtvData(0, {
  medianeFirstEtude: null,
  medianeFirstReport: null,
  medianeFirstClient: null,
  engineersWithDossier: 0,
  engineersWithEtude: 0,
  engineersWithReport: 0,
});

// -------------------------------------------------------------------------
// Accès données
// -------------------------------------------------------------------------

export async function fetchTtv(): Promise<TtvData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    // Cohorte = ingénieurs du cabinet.
    const { data: engineersRaw } = await supabase
      .from("users")
      .select("id, created_at")
      .eq("cabinet_id", ctx.cabinetId)
      .eq("tenant_id", ctx.tenantId)
      .eq("role", "engineer");

    const engineers = (engineersRaw ?? []).map((u) => ({
      id: u.id as string,
      created_at: (u.created_at as string) ?? null,
    }));
    const cohort = engineers.length;

    // Dossiers du cabinet.
    const { data: dossiersRaw } = await supabase
      .from("dossiers")
      .select("id, engineer_id, created_at")
      .eq("cabinet_id", ctx.cabinetId)
      .eq("tenant_id", ctx.tenantId);

    const dossiers: DossierRow[] = (dossiersRaw ?? []).map((d) => ({
      id: d.id as string,
      engineer_id: (d.engineer_id as string) ?? null,
      created_at: (d.created_at as string) ?? null,
    }));

    // Études rattachées aux dossiers du cabinet (via dossier_id).
    let etudes: EtudeRow[] = [];
    const dossierIds = dossiers.map((d) => d.id);
    if (dossierIds.length > 0) {
      const { data: etudesRaw } = await supabase
        .from("etudes")
        .select("dossier_id, status, created_at, delivered_at")
        .in("dossier_id", dossierIds);
      etudes = (etudesRaw ?? []).map((e) => ({
        dossier_id: e.dossier_id as string,
        status: (e.status as string) ?? null,
        created_at: (e.created_at as string) ?? null,
        delivered_at: (e.delivered_at as string) ?? null,
      }));
    }

    return buildTtvData(cohort, computeAggregates(engineers, dossiers, etudes));
  } catch {
    return EMPTY;
  }
}
