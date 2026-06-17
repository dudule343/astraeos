import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Données réelles de la page "Support & qualité" (Bloc 07).
//
// La maquette d'origine affichait des indicateurs de SUPPORT (tickets, délais
// de réponse, CSAT, bugs, incidents, SLA, taux de résolution N1). Aucune de
// ces sources n'existe en base : pas de table tickets / incidents / bugs /
// sla / csat. On NE FABRIQUE RIEN.
//
// Deux indicateurs sont honnêtement dérivables et câblés ici :
//   1. Suivi des dossiers en retard / bloqués, dérivé de dossiers.stage_entered_at,
//      last_activity_at, days_in_stage_cached, priority. C'est le proxy métier
//      réel de la "charge à traiter" du cabinet, à la place de la résolution N1.
//   2. Satisfaction d'étude (etudes.client_satisfaction_score, 1-10), moyenne sur
//      les études du cabinet où le score est renseigné. Étiquetée explicitement
//      "satisfaction étude" — surtout PAS "satisfaction support / CSAT".
//
// Tout le reste (délais support, bugs, incidents, SLA) passe en état vide
// honnête côté page, faute de source. Filtrage systématique par tenant + cabinet.
// =========================================================================

// Seuil de "retard" : un dossier qui stagne au-delà de N jours dans son étape.
const STALE_DAYS = 14;
// Seuil "sans activité récente".
const INACTIVE_DAYS = 14;
const DAY_MS = 1000 * 60 * 60 * 24;

export type QualityData = {
  // Bloc "Dossiers en attente / en retard" (dérivé, réel).
  dossiersActifs: number;
  enRetard: number;
  sansActivite: number;
  prioritairesBloques: number;
  // Bloc satisfaction d'étude (réel, table etudes).
  satisfactionMoyenne: number | null; // /10
  satisfactionCount: number; // nb d'études notées
  hasDossiers: boolean;
};

const EMPTY: QualityData = {
  dossiersActifs: 0,
  enRetard: 0,
  sansActivite: 0,
  prioritairesBloques: 0,
  satisfactionMoyenne: null,
  satisfactionCount: 0,
  hasDossiers: false,
};

type DossierRow = {
  pipeline_stage: string | null;
  stage_entered_at: string | null;
  last_activity_at: string | null;
  days_in_stage_cached: number | null;
  priority: string | null;
};

/** Âge en jours d'un timestamp ISO (depuis maintenant), ou null si absent. */
function daysSince(iso: string | null, now: number): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return (now - t) / DAY_MS;
}

/** Un dossier "en retard" : days_in_stage_cached fiable sinon âge dans l'étape. */
function isStale(d: DossierRow, now: number): boolean {
  if (d.days_in_stage_cached != null && d.days_in_stage_cached > 0) {
    return d.days_in_stage_cached > STALE_DAYS;
  }
  const age = daysSince(d.stage_entered_at, now);
  return age != null && age > STALE_DAYS;
}

function isInactive(d: DossierRow, now: number): boolean {
  const age = daysSince(d.last_activity_at, now);
  return age != null && age > INACTIVE_DAYS;
}

function isHighPriority(d: DossierRow): boolean {
  return d.priority === "high" || d.priority === "urgent";
}

/** Agrégations pures sur la liste de dossiers (testable sans DB). */
export function computeDossierQuality(rows: DossierRow[]): {
  dossiersActifs: number;
  enRetard: number;
  sansActivite: number;
  prioritairesBloques: number;
} {
  const now = Date.now();
  let enRetard = 0;
  let sansActivite = 0;
  let prioritairesBloques = 0;
  for (const d of rows) {
    const stale = isStale(d, now);
    if (stale) enRetard += 1;
    if (isInactive(d, now)) sansActivite += 1;
    if (stale && isHighPriority(d)) prioritairesBloques += 1;
  }
  return { dossiersActifs: rows.length, enRetard, sansActivite, prioritairesBloques };
}

/** Moyenne /10 des scores de satisfaction d'étude renseignés. */
export function computeSatisfaction(scores: (number | null)[]): {
  moyenne: number | null;
  count: number;
} {
  const valid = scores.filter((s): s is number => s != null && Number.isFinite(s));
  if (valid.length === 0) return { moyenne: null, count: 0 };
  const sum = valid.reduce((a, s) => a + s, 0);
  return { moyenne: sum / valid.length, count: valid.length };
}

export async function fetchQuality(): Promise<QualityData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    // Dossiers du cabinet (hors archive) → suivi des retards / blocages.
    const { data: dossiersRaw } = await supabase
      .from("dossiers")
      .select("pipeline_stage, stage_entered_at, last_activity_at, days_in_stage_cached, priority")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .neq("pipeline_stage", "00_archive");

    const dossiers = (dossiersRaw ?? []) as DossierRow[];
    const dossierAgg = computeDossierQuality(dossiers);

    // Satisfaction d'étude : scores renseignés sur les études du cabinet.
    let satisfaction = { moyenne: null as number | null, count: 0 };
    const { data: etudesRaw } = await supabase
      .from("etudes")
      .select("client_satisfaction_score, dossiers!inner(tenant_id, cabinet_id)")
      .eq("dossiers.tenant_id", ctx.tenantId)
      .eq("dossiers.cabinet_id", ctx.cabinetId)
      .not("client_satisfaction_score", "is", null);

    if (etudesRaw) {
      const scores = (etudesRaw as { client_satisfaction_score: number | null }[]).map(
        (e) => e.client_satisfaction_score,
      );
      satisfaction = computeSatisfaction(scores);
    }

    return {
      ...dossierAgg,
      satisfactionMoyenne: satisfaction.moyenne,
      satisfactionCount: satisfaction.count,
      hasDossiers: dossiers.length > 0,
    };
  } catch {
    return EMPTY;
  }
}

/** Affiche un entier ou "—" si zéro/absent. */
export function fmtCount(n: number): string {
  return n > 0 ? String(n) : "—";
}

/** Moyenne /10 formatée façon "7,8", ou "—" si pas de note. */
export function fmtScore(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
