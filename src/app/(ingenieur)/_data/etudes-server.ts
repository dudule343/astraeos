import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  etudesFilters,
  etudesKpis,
  fetchEtudes,
  type EtudesData,
  type EtudeRow,
  type EtudesFilter,
  type FilterKey,
  type StudyTypeKey,
} from "./etudes";

/**
 * Module SERVEUR de l'écran « Études en cours » (étape 04).
 *
 * Lit les vrais dossiers en production (`pipeline_stage = '04_etudes'`) du
 * cabinet courant, joints à leur étude active (avancement de phase) pour
 * reconstruire le tableau. KPIs et filtres rapides sont recalculés sur les
 * données réelles. Dégrade sur la maquette (`fetchEtudes`) si la base/session
 * manque ou si aucune étude n'est en cours — on garde l'écran plein.
 *
 * NE DOIT JAMAIS être importé par un composant client.
 */

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawEtude = {
  status: string | null;
  current_phase: string | null;
  phase_progress_pct: number | null;
  version: number | null;
};

type RawDossier = {
  id: string;
  pipeline_entry_date: string | null;
  stage_entered_at: string | null;
  restitution_meeting_date: string | null;
  internal_notes: string | null;
  clients?: { personnes?: RawPersonne[] } | { personnes?: RawPersonne[] }[] | null;
  etudes?: RawEtude[] | null;
};

const PHASE_LABELS: Record<string, { label: string; n: number }> = {
  phase_1_bilan: { label: "analyse des documents", n: 1 },
  phase_2_strategies: { label: "réalisation du bilan", n: 2 },
  phase_3_preconisations: { label: "réalisation des préconisations", n: 3 },
  phase_4_synthese: { label: "validation pour envoi", n: 4 },
  completed: { label: "validation pour envoi", n: 4 },
};

function formatFr(date: string | null): string {
  if (!date) return "—";
  const t = new Date(date);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function joursEntre(date: string | null, now: Date): number | null {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((t - now.getTime()) / (1000 * 60 * 60 * 24));
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function activeEtude(etudes: RawEtude[]): RawEtude | null {
  if (etudes.length === 0) return null;
  return [...etudes].sort((a, b) => (b.version ?? 0) - (a.version ?? 0))[0];
}

function rowOf(d: RawDossier, now: Date): EtudeRow {
  const clientRaw = Array.isArray(d.clients) ? d.clients[0] : d.clients;
  const personnes = clientRaw?.personnes ?? [];
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");

  let raisonSociale: string | undefined;
  if (d.internal_notes) {
    try {
      raisonSociale = (JSON.parse(d.internal_notes) as { raison_sociale?: string }).raison_sociale;
    } catch {
      /* internal_notes non-JSON */
    }
  }

  let clientNames: string[];
  let clientType: string;
  let rowVariant: EtudeRow["rowVariant"];
  let representant: string | undefined;
  if (raisonSociale) {
    clientNames = [raisonSociale];
    clientType = "Personne morale";
    rowVariant = "pm";
    if (a) representant = `Repr. : ${[a.first_name, a.last_name].filter(Boolean).join(" ")}`.trim();
  } else if (b) {
    const last = (a?.last_name ?? "").trim();
    clientNames = [
      `${(a?.first_name ?? "").trim()} ${last}`.trim(),
      `${(b.first_name ?? "").trim()} ${(b.last_name ?? last).trim()}`.trim(),
    ];
    clientType = "Couple";
    rowVariant = "couple";
  } else {
    clientNames = [`${(a?.first_name ?? "").trim()} ${(a?.last_name ?? "").trim()}`.trim() || "Foyer"];
    clientType = "Personne seule";
    rowVariant = "seul";
  }

  const etude = activeEtude(d.etudes ?? []);
  const phase = etude?.current_phase ? PHASE_LABELS[etude.current_phase] : undefined;
  const phaseN = phase?.n ?? 1;
  const progressPct = etude?.phase_progress_pct ?? 0;

  const restitJours = joursEntre(d.restitution_meeting_date, now);
  const enRetard = restitJours != null && restitJours < 0;
  const restitMeta = enRetard
    ? `En retard de ${Math.abs(restitJours)} j`
    : restitJours != null
      ? `Dans ${restitJours} jour${restitJours > 1 ? "s" : ""}`
      : "Date à fixer";

  // Study type : on n'a pas de typage métier fiable en base ici → patrimoine
  // par défaut (libellé neutre), ce qui reste cohérent avec la maquette.
  const studyType: StudyTypeKey = "patrimoine";

  return {
    id: d.id,
    clientNames,
    clientType,
    rowVariant,
    representant,
    rowHighlight: enRetard ? "rgba(245,221,215,0.3)" : undefined,
    cabinetName: "Julien VASSEUR",
    cabinetMeta: "Ingénieur",
    patrimonialInitials: initials(clientNames[0]),
    patrimonialName: clientNames[0],
    studyType,
    studyLabel: "Étude patrimoniale",
    startDate: formatFr(d.pipeline_entry_date ?? d.stage_entered_at),
    restitDate: formatFr(d.restitution_meeting_date),
    restitMeta,
    restitAlert: enRetard,
    restitMetaAlert: enRetard,
    progressPct,
    progressLabel: phase
      ? `Phase ${phaseN}/4 · ${phase.label}`
      : "Phase 1/4 · analyse des documents",
    progressAlert: enRetard,
    actionIcon: enRetard ? "alert" : "eye",
  };
}

function buildKpis(rows: EtudeRow[]) {
  const total = rows.length;
  const sous30 = rows.filter((r) => {
    if (r.restitMetaAlert) return false;
    const m = r.restitMeta.match(/Dans\s+(\d+)/);
    return m ? Number(m[1]) <= 30 : false;
  }).length;
  const retard = rows.filter((r) => r.restitMetaAlert || r.progressAlert).length;
  return [
    { label: "Études en cours", value: String(total), meta: "en production" },
    { label: "Restitution sous 30 jours", value: String(sous30), meta: "livrables proches" },
    {
      label: "En retard",
      value: String(retard),
      meta: "dépassement délai prévu",
      valueColor: retard > 0 ? ("orange" as const) : undefined,
    },
    { label: "Délai moyen de réalisation", value: "32", unit: "jours", meta: "depuis l'étape 03" },
  ];
}

function rowMatchesFilter(row: EtudeRow, filter: FilterKey): boolean {
  switch (filter) {
    case "toutes":
      return true;
    case "en-retard":
      return Boolean(row.restitMetaAlert || row.progressAlert || row.restitAlert);
    case "sous-30j": {
      if (row.restitMetaAlert) return false;
      const m = row.restitMeta.match(/Dans\s+(\d+)/);
      return m ? Number(m[1]) <= 30 : false;
    }
    case "patrimoniales":
      return row.studyType === "patrimoine";
    case "immo-direct":
      return row.studyType === "immo-direct";
    case "fin-direct":
      return row.studyType === "fin-direct";
    case "assurance":
      return row.studyType === "assurance";
    default:
      return true;
  }
}

async function loadRows(now: Date): Promise<EtudeRow[] | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const ctx = await getSessionContext();
  if (!ctx) return null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id, pipeline_entry_date, stage_entered_at, restitution_meeting_date, internal_notes,
          clients ( personnes ( role_in_household, first_name, last_name ) ),
          etudes ( status, current_phase, phase_progress_pct, version )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("pipeline_stage", "04_etudes")
      .order("stage_entered_at", { ascending: true })
      .limit(100);

    if (error || !data || data.length === 0) return null;
    return (data as RawDossier[]).map((d) => rowOf(d, now));
  } catch {
    return null;
  }
}

export type EtudesScreen = EtudesData & { kpis: typeof etudesKpis };

/**
 * Données de l'écran « Études en cours », alimentées par la base réelle.
 * Repli sur la maquette pleine si la base/session manque ou si aucune étude
 * n'est en production.
 */
export async function fetchEtudesLive(filter: FilterKey = "toutes"): Promise<EtudesScreen> {
  const allRows = await loadRows(new Date());
  if (!allRows || allRows.length === 0) {
    return { ...fetchEtudes(filter), kpis: etudesKpis };
  }

  const kpis = buildKpis(allRows);
  const total = allRows.length;
  const countFor = (key: FilterKey) =>
    String(allRows.filter((r) => rowMatchesFilter(r, key)).length);

  const filters: EtudesFilter[] = etudesFilters.map((f) => ({
    ...f,
    count: f.key === "toutes" ? String(total) : countFor(f.key),
    active: f.key === filter,
  }));

  const rows =
    filter === "toutes" ? allRows : allRows.filter((r) => rowMatchesFilter(r, filter));

  // Tout est affiché (pas de pagination réelle) : « voir l'intégralité » nul.
  return { filters, rows, remaining: { count: 0, total: rows.length }, kpis };
}
