import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  COLLECTE_FILTERS,
  COLLECTE_KPIS,
  COLLECTE_ROWS,
  COLLECTE_STEPPER,
  type CollecteFilter,
  type CollecteKpi,
  type CollecteRow,
  type StepperItem,
} from "./collectes";

/**
 * Module SERVEUR de l'écran « Collecte docs & infos » (étape 03 du parcours).
 *
 * Lit les dossiers RÉELS de l'ingénieur courant au stade `03_collecte`
 * (`dossiers` ⨝ `clients` ⨝ `personnes`). La complétion vient de
 * `dossiers.dci_completion_pct` ; le nombre de pièces attendues est estimé à
 * partir de la complexité du foyer (couple / personne morale → plus de pièces).
 * Dégrade sur les exemples de la maquette quand la base n'est pas configurée,
 * la session manque, ou aucun dossier n'est en collecte. Le composant de
 * progression (client) reçoit chaque ligne par props (jamais d'accès base).
 */

export type CollectesScreen = {
  stepper: StepperItem[];
  kpis: CollecteKpi[];
  filters: CollecteFilter[];
  rows: CollecteRow[];
  footnote: string | null;
};

const FALLBACK: CollectesScreen = {
  stepper: COLLECTE_STEPPER,
  kpis: COLLECTE_KPIS,
  filters: COLLECTE_FILTERS,
  rows: COLLECTE_ROWS,
  footnote:
    "… documents par dossier : 60 à 300 selon complexité patrimoniale · ouvrez une fiche client pour la liste détaillée.",
};

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawDossier = {
  id: string;
  pipeline_entry_date: string | null;
  last_activity_at: string | null;
  dci_completion_pct: number | null;
  client: {
    id: string;
    household_type: string | null;
    personnes: RawPersonne[] | null;
  } | null;
};

/**
 * Estimation du volume de pièces attendues selon la nature du foyer.
 * Personne morale (aucune personne physique rattachée) → dossier le plus lourd.
 */
function expectedDocs(personnes: RawPersonne[]): number {
  if (personnes.length === 0) return 268;
  if (personnes.length >= 2) return 186;
  return 92;
}

function householdNames(personnes: RawPersonne[]): {
  lines: string[];
  type: CollecteRow["clientType"];
  typeLabel: string;
} {
  if (personnes.length === 0) {
    return { lines: ["Foyer sans nom"], type: "seule", typeLabel: "Personne seule" };
  }
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");
  const lastName = (a.last_name ?? "").trim();
  const aName = `${(a.first_name ?? "").trim()} ${lastName}`.trim();
  if (b) {
    const bName = `${(b.first_name ?? "").trim()} ${(b.last_name ?? "").trim()}`.trim();
    return { lines: [aName, bName], type: "couple", typeLabel: "Couple" };
  }
  return { lines: [aName], type: "seule", typeLabel: "Personne seule" };
}

function daysSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function toRow(d: RawDossier): CollecteRow {
  const personnes = d.client?.personnes ?? [];
  const { lines, type, typeLabel } = householdNames(personnes);
  const pct = Math.min(100, Math.max(0, d.dci_completion_pct ?? 0));
  const expected = expectedDocs(personnes);
  const collected = Math.round((pct / 100) * expected);
  const inactiveDays = daysSince(d.last_activity_at ?? d.pipeline_entry_date);
  const dormant = inactiveDays > 14;
  const complete = pct >= 100;

  return {
    id: d.client?.id ?? d.id,
    nameLines: lines,
    clientType: type,
    clientTypeLabel: typeLabel,
    cabinetName: "Sarah KAUFMANN",
    cabinetCity: "Cabinet Paris Étoile",
    superviseurInitials: "SK",
    superviseurName: "Sarah KAUFMANN",
    openingDate: d.pipeline_entry_date
      ? new Date(d.pipeline_entry_date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—",
    openingMeta: dormant ? `Il y a ${inactiveDays} jours · inactif` : `Il y a ${inactiveDays} jours`,
    openingAlert: dormant,
    docsCollected: collected,
    docsExpected: expected,
    pct,
    progressVariant: complete ? "complete" : dormant ? "alert" : undefined,
    status: complete ? "signed" : dormant ? "dormant" : "sent",
    statusLabel: complete
      ? "Prêt à commencer l'étude"
      : dormant
        ? "Inactif > 14j"
        : "En collecte",
    highlightRow: dormant,
    action: dormant ? "relance" : "view",
  };
}

function buildScreen(rows: CollecteRow[]): CollectesScreen {
  const total = rows.length;
  const inactifs = rows.filter((r) => r.openingAlert).length;
  const prets = rows.filter((r) => r.status === "signed").length;
  const enCollecte = rows.filter((r) => r.status === "sent").length;
  const avgPct = total > 0 ? Math.round(rows.reduce((acc, r) => acc + r.pct, 0) / total) : 0;
  const at100 = rows.filter((r) => r.pct >= 100).length;

  return {
    stepper: COLLECTE_STEPPER.map((s) =>
      s.step === "03" ? { ...s, count: String(total) } : s,
    ),
    kpis: [
      {
        label: "Inactifs > 14 jours",
        value: String(inactifs),
        valueColor: inactifs > 0 ? "var(--orange-text)" : undefined,
        meta: "à relancer en priorité",
      },
      {
        label: "En collecte",
        value: String(enCollecte),
        unit: enCollecte > 1 ? "clients" : "client",
        meta: "en attente de collecte des documents",
      },
      {
        label: "Complétion moyenne",
        value: String(avgPct),
        unit: "%",
        meta: `dossiers à 100 % : ${at100}`,
      },
      {
        label: "Prêts pour étape 04",
        value: String(prets),
        valueColor: "var(--gold)",
        meta: "complets · à lancer",
      },
    ],
    filters: [
      { key: "tous", label: "Tous", count: String(total) },
      { key: "prets-04", label: "Prêts pour étape 04", count: String(prets) },
      { key: "en-collecte", label: "En collecte active", count: String(enCollecte) },
      { key: "inactifs", label: "Inactifs > 14 j", count: String(inactifs), alert: inactifs > 0 },
    ],
    rows,
    footnote: null,
  };
}

export async function getCollectesScreen(): Promise<CollectesScreen> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return FALLBACK;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return FALLBACK;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id, pipeline_entry_date, last_activity_at, dci_completion_pct,
          client:clients!inner (
            id, household_type,
            personnes ( role_in_household, first_name, last_name )
          )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("engineer_id", ctx.userId)
      .eq("pipeline_stage", "03_collecte")
      .order("pipeline_entry_date", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK;

    const rows = (data as unknown as RawDossier[]).map(toRow);
    return buildScreen(rows);
  } catch {
    return FALLBACK;
  }
}
