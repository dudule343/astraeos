import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import { clientInitials } from "./clients";
import {
  pipelineSteps,
  suiviFilters,
  suiviKpis,
  suiviRemaining,
  suiviRows,
  suiviRowMatchesFilter,
  type PipelineStep,
  type SuiviFilter,
  type SuiviKpi,
  type SuiviRow,
} from "./clients-suivi";

/**
 * Module SERVEUR de l'écran « Clients en suivi » (étape 06 du parcours).
 *
 * Lit les dossiers RÉELS de l'ingénieur courant au stade `06_suivi`
 * (`dossiers` ⨝ `clients` ⨝ `personnes`), avec l'encours dérivé de
 * `souscriptions.total_aum_current`. Dégrade proprement sur les exemples de la
 * maquette quand la base n'est pas configurée, la session manque, ou aucun
 * client n'est encore en suivi. Le composant client reçoit tout par props
 * (jamais d'accès base côté client).
 */

export type ClientsSuiviScreen = {
  steps: PipelineStep[];
  kpis: SuiviKpi[];
  filters: SuiviFilter[];
  rows: SuiviRow[];
  remaining: { count: number; total: number };
};

const FALLBACK: ClientsSuiviScreen = {
  steps: pipelineSteps,
  kpis: suiviKpis,
  filters: suiviFilters,
  rows: suiviRows,
  remaining: suiviRemaining,
};

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawSouscription = {
  total_aum_current: number | string | null;
  amount_initial: number | string | null;
  status: string | null;
};

type RawDossier = {
  id: string;
  client_id: string | null;
  last_activity_at: string | null;
  pipeline_entry_date: string | null;
  restitution_meeting_date: string | null;
  client: {
    id: string;
    household_type: string | null;
    personnes: RawPersonne[] | null;
    souscriptions: RawSouscription[] | null;
  } | null;
};

/** Nom(s) d'affichage du foyer : « Bertrand DUPONT » ou couple en 2 lignes. */
function householdNames(personnes: RawPersonne[]): { lines: string[]; kind: SuiviRow["clientTypeStyle"] } {
  if (personnes.length === 0) return { lines: ["Foyer sans nom"], kind: undefined };
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");
  const lastName = (a.last_name ?? "").trim();
  const aName = `${(a.first_name ?? "").trim()} ${lastName}`.trim();
  if (b) {
    const bName = `${(b.first_name ?? "").trim()} ${(b.last_name ?? "").trim()}`.trim();
    return { lines: [aName, bName], kind: "couple" };
  }
  return { lines: [aName], kind: undefined };
}

/** Jours entiers écoulés depuis une date ISO (≥ 0), ou un grand nombre si absente. */
function daysSince(iso: string | null | undefined): number {
  if (!iso) return 9999;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 9999;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function statusFromContact(days: number): { label: string; tone: SuiviRow["statusTone"]; alert: boolean } {
  if (days > 180) return { label: "Sans contact > 6 mois", tone: "orange", alert: true };
  if (days > 90) return { label: "Sans contact > 3 mois", tone: "orange", alert: true };
  return { label: "Actif", tone: "success", alert: false };
}

function toRow(d: RawDossier): SuiviRow {
  const personnes = d.client?.personnes ?? [];
  const { lines, kind } = householdNames(personnes);
  const aum = (d.client?.souscriptions ?? []).reduce((acc, s) => {
    const v = Number(s.total_aum_current ?? s.amount_initial ?? 0);
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
  const since = daysSince(d.last_activity_at ?? d.pipeline_entry_date);
  const status = statusFromContact(since);
  const lastDate = d.last_activity_at ?? d.pipeline_entry_date;

  return {
    id: d.client?.id ?? d.client_id ?? d.id,
    clientNames: lines,
    clientType: kind === "couple" ? "Couple" : "Personne seule",
    clientTypeStyle: kind,
    rowVariant: kind === "couple" ? "couple" : undefined,
    cabinetName: "Sarah KAUFMANN",
    cabinetMeta: "Cabinet Paris Étoile",
    superviseInitials: clientInitials(lines[0]),
    superviseName: lines[0],
    encours: aum > 0 ? `${Math.round(aum).toLocaleString("fr-FR")} €` : "—",
    encoursGold: aum >= 1_000_000,
    lastDate: lastDate
      ? new Date(lastDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "—",
    lastMeta: `Il y a ${since} j`,
    lastAlert: status.alert,
    lastMetaAlert: status.alert,
    nextDate: "—",
    nextDateMuted: true,
    nextMeta: status.alert ? "À reprogrammer" : "À planifier",
    nextMetaTone: status.alert ? "orange" : undefined,
    preconisations: ["Suivi récurrent"],
    statusLabel: status.label,
    statusTone: status.tone,
    actionIcon: status.alert ? "alert" : "eye",
    daysSinceLastContact: since,
    daysUntilNext: null,
    hasActiveMission: aum > 0,
  };
}

/** Recompte les facettes/KPI à partir des lignes réelles (cohérence garantie). */
function buildScreen(rows: SuiviRow[]): ClientsSuiviScreen {
  const total = rows.length;
  const sans3m = rows.filter((r) => r.daysSinceLastContact > 90).length;
  const sans6m = rows.filter((r) => r.daysSinceLastContact > 180).length;
  const missions = rows.filter((r) => r.hasActiveMission).length;
  const entrevue30 = rows.filter(
    (r) => r.daysUntilNext !== null && r.daysUntilNext < 30,
  ).length;

  const count = (key: SuiviFilter["key"]) =>
    String(rows.filter((r) => suiviRowMatchesFilter(r, key)).length);

  return {
    steps: pipelineSteps.map((s) =>
      s.step === "06" ? { ...s, count: String(total) } : s,
    ),
    kpis: [
      { label: "Clients en suivi", value: String(total), meta: "portefeuille servi par le cabinet" },
      { label: "Entrevues sous 30 j", value: String(entrevue30), meta: "point récurrent prévu" },
      {
        label: "Sans contact > 3 mois",
        value: String(sans3m),
        meta: "à recontacter en priorité",
        valueColor: sans3m > 0 ? "orange" : undefined,
      },
      {
        label: "Sans contact > 6 mois",
        value: String(sans6m),
        meta: "risque de churn",
        valueColor: sans6m > 0 ? "red" : undefined,
      },
    ],
    filters: [
      { key: "all", label: "Tous", count: count("all"), active: true },
      { key: "entrevue-30j", label: "Entrevue prévue < 30 j", count: count("entrevue-30j") },
      { key: "missions-actives", label: "Missions actives", count: String(missions) },
      { key: "sans-contact-3m", label: "Sans contact > 3 mois", count: count("sans-contact-3m"), alert: sans3m > 0 },
      { key: "sans-contact-6m", label: "Sans contact > 6 mois", count: count("sans-contact-6m"), alert: sans6m > 0 },
    ],
    rows,
    remaining: { count: 0, total },
  };
}

export async function getClientsSuiviScreen(): Promise<ClientsSuiviScreen> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return FALLBACK;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return FALLBACK;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id, last_activity_at, pipeline_entry_date, restitution_meeting_date,
          client:clients!inner (
            id, household_type,
            personnes ( role_in_household, first_name, last_name ),
            souscriptions ( total_aum_current, amount_initial, status )
          )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("engineer_id", ctx.userId)
      .eq("pipeline_stage", "06_suivi")
      .order("last_activity_at", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK;

    const rows = (data as unknown as RawDossier[]).map(toRow);
    rows.sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact);
    return buildScreen(rows);
  } catch {
    return FALLBACK;
  }
}
