import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  type Client,
  type ClientsScreen,
  type ClientType,
  type StatutVariant,
  clientInitials,
  formatClientDate,
  formatEurClient,
  getClientsScreenFallbackSync,
  HOUSEHOLD_TYPE_LABELS,
} from "./clients";

/**
 * Module SERVEUR de l'écran « Tous mes clients ».
 *
 * Lit la MÊME source que le dirigeant : `clients` ⨝ `personnes` ⨝ `dossiers`,
 * filtrée par tenant/cabinet et restreinte aux dossiers de l'ingénieur courant
 * (`dossiers.engineer_id = ctx.userId`). Le CA généré par client est dérivé de
 * `commissions` ⨝ `souscriptions` (même calcul que le cockpit dirigeant).
 *
 * Dégrade proprement sur l'écran de repli pur (maquette v28) quand la base
 * n'est pas configurée ou si l'ingénieur n'a encore aucun client réel.
 */

const PIPELINE_STATUT_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi récurrent",
  "00_archive": "Archivé",
};

const STATUT_VARIANT_OF_STAGE: Record<string, StatutVariant> = {
  "01_prospect": "info",
  "02_compliance": "goldStrong",
  "03_collecte": "goldStrong",
  "04_etudes": "orange",
  "05_restituee": "gold",
  "06_suivi": "green",
  "00_archive": "info",
};

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawDossier = {
  pipeline_stage: string | null;
  pipeline_entry_date: string | null;
  last_activity_at: string | null;
  study_delivered_at: string | null;
};

type RawClientRow = {
  id: string;
  household_type: string | null;
  household_address: string | null;
  marriage_date: string | null;
  personnes?: RawPersonne[] | null;
  dossiers?: RawDossier[] | null;
};

/** Nom d'affichage du foyer : « Bertrand & Monique DUPONT » (ou raison sociale). */
function householdName(personnes: RawPersonne[]): string {
  if (personnes.length === 0) return "Foyer sans nom";
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");
  const aFirst = (a.first_name ?? "").trim();
  const lastName = (a.last_name ?? "").trim();
  if (b) {
    const bFirst = (b.first_name ?? "").trim();
    const lead = [aFirst, bFirst].filter(Boolean).join(" & ");
    return `${lead} ${lastName}`.trim() || "Foyer sans nom";
  }
  return `${aFirst} ${lastName}`.trim() || "Foyer sans nom";
}

/** Détails secondaires du foyer (adresse, situation matrimoniale). */
function householdDetails(row: RawClientRow, nbPersonnes: number): string {
  const bits: string[] = [];
  if (row.household_address) bits.push(row.household_address);
  const situation = row.household_type ? HOUSEHOLD_TYPE_LABELS[row.household_type] : null;
  if (situation) bits.push(nbPersonnes >= 2 ? `${situation}s` : situation);
  else if (nbPersonnes === 1) bits.push("personne seule");
  return bits.join(" · ") || "—";
}

/** Étape de dossier la plus récente (dernière activité) pour le statut. */
function latestDossier(dossiers: RawDossier[]): RawDossier | null {
  if (dossiers.length === 0) return null;
  return [...dossiers].sort((a, b) => {
    const ta = new Date(a.last_activity_at ?? a.pipeline_entry_date ?? 0).getTime();
    const tb = new Date(b.last_activity_at ?? b.pipeline_entry_date ?? 0).getTime();
    return tb - ta;
  })[0];
}

/**
 * CA généré par client (année courante) — dérivé de commissions ⨝ souscriptions,
 * scope tenant/cabinet. Renvoie une Map client_id → montant € cumulé.
 */
async function fetchCaByClient(
  supabase: ReturnType<typeof createAdminClient>,
  tenantId: string,
  cabinetId: string,
): Promise<Map<string, number>> {
  const byClient = new Map<string, number>();
  const { data, error } = await supabase
    .from("commissions")
    .select(
      `amount_eur, recipient_type,
       souscription:souscriptions!inner(client_id, cabinet_id, tenant_id)`,
    )
    .eq("souscription.cabinet_id", cabinetId)
    .eq("souscription.tenant_id", tenantId);

  if (error || !data) return byClient;

  for (const row of data as Array<Record<string, unknown>>) {
    // On ne compte que la part cabinet (CA du cabinet, comme le dirigeant).
    if (row.recipient_type !== "cabinet") continue;
    const sousRaw = Array.isArray(row.souscription) ? row.souscription[0] : row.souscription;
    const clientId = (sousRaw as { client_id?: string } | null)?.client_id;
    if (!clientId) continue;
    byClient.set(clientId, (byClient.get(clientId) ?? 0) + Number(row.amount_eur ?? 0));
  }
  return byClient;
}

function buildScreen(clients: Client[], caTotal: number): ClientsScreen {
  const physiques = clients.filter((c) => c.type === "Personne physique").length;
  const morales = clients.length - physiques;
  const ticket = clients.length > 0 ? Math.round(caTotal / clients.length) : 0;

  return {
    heroEyebrow: "Mon portefeuille · cumul depuis janvier 2026",
    heroSub:
      `Votre portefeuille personnel · ${clients.length} client${clients.length > 1 ? "s" : ""} ` +
      `accompagné${clients.length > 1 ? "s" : ""} sur 2026, dont ${physiques} ` +
      `personne${physiques > 1 ? "s" : ""} physique${physiques > 1 ? "s" : ""} et ${morales} ` +
      `personne${morales > 1 ? "s" : ""} morale${morales > 1 ? "s" : ""} · cliquez sur une ligne ` +
      "pour ouvrir la fiche client détaillée.",
    kpiClientsActifs: {
      label: "Clients actifs",
      value: String(clients.length),
      meta: "portefeuille personnel",
      compare: [
        { period: "M-1", value: "—", direction: "up" },
        { period: "N-1", value: "—", direction: "up" },
      ],
    },
    kpiRepartition: {
      label: "Répartition personnes physiques / personnes morales",
      nbPhysiques: String(physiques),
      libellePhysiques: physiques > 1 ? "personnes physiques" : "personne physique",
      nbMorales: String(morales),
      libelleMorales: morales > 1 ? "personnes morales" : "personne morale",
      meta:
        `${physiques} personne${physiques > 1 ? "s" : ""} physique${physiques > 1 ? "s" : ""} ` +
        `(couples ou seuls) · ${morales} personne${morales > 1 ? "s" : ""} morale${morales > 1 ? "s" : ""}`,
      compare: [
        { period: "M-1", value: "—", direction: "up" },
        { period: "N-1", value: "—", direction: "up" },
      ],
    },
    kpiTicketMoyen: {
      label: "Ticket moyen par client",
      valueAmount: ticket > 0 ? Math.round(ticket).toLocaleString("fr-FR") : "—",
      meta:
        caTotal > 0
          ? `${Math.round(caTotal).toLocaleString("fr-FR")} € / ${clients.length} client${clients.length > 1 ? "s" : ""} · 2026`
          : "—",
      compare: [
        { period: "M-1", value: "—", direction: "up" },
        { period: "N-1", value: "—", direction: "up" },
      ],
    },
    clients,
    totalPortefeuille: caTotal > 0 ? `${Math.round(caTotal).toLocaleString("fr-FR")} €` : "—",
    totalMeta: `${clients.length} client${clients.length > 1 ? "s" : ""} actif${clients.length > 1 ? "s" : ""} · cumul 2026`,
    cardTitle: `Tous mes clients · ${clients.length} fiche${clients.length > 1 ? "s" : ""}`,
  };
}

/**
 * Écran « Mes clients » alimenté par la base réelle. Dégrade sur le repli pur
 * si Supabase n'est pas configuré, si la session manque, ou si l'ingénieur n'a
 * encore aucun client (on garde la maquette plutôt qu'un écran vide).
 */
export async function getClientsScreen(): Promise<ClientsScreen> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return getClientsScreenFallbackSync();
  try {
    const ctx = await getSessionContext();
    if (!ctx) return getClientsScreenFallbackSync();

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clients")
      .select(
        `
          id, household_type, household_address, marriage_date,
          personnes ( role_in_household, first_name, last_name ),
          dossiers!inner ( pipeline_stage, pipeline_entry_date, last_activity_at, study_delivered_at, engineer_id )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("dossiers.engineer_id", ctx.userId);

    if (error || !data || data.length === 0) return getClientsScreenFallbackSync();

    const caByClient = await fetchCaByClient(supabase, ctx.tenantId, ctx.cabinetId);

    const clients: Client[] = (data as RawClientRow[]).map((row) => {
      const personnes = row.personnes ?? [];
      const dossiers = row.dossiers ?? [];
      const nom = householdName(personnes);
      const last = latestDossier(dossiers);
      const stage = last?.pipeline_stage ?? "01_prospect";
      const ca = caByClient.get(row.id) ?? 0;
      const type: ClientType = personnes.length >= 1 ? "Personne physique" : "Personne morale";

      const firstDossier = [...dossiers].sort((a, b) => {
        const ta = new Date(a.pipeline_entry_date ?? 0).getTime();
        const tb = new Date(b.pipeline_entry_date ?? 0).getTime();
        return ta - tb;
      })[0];

      const interactionStage = PIPELINE_STATUT_LABELS[stage] ?? stage;
      const interactionDate = formatClientDate(
        last?.last_activity_at ?? last?.study_delivered_at ?? last?.pipeline_entry_date,
      );

      return {
        slug: row.id,
        initiales: clientInitials(nom),
        nom,
        details: householdDetails(row, personnes.length),
        type,
        date1ereEtude: formatClientDate(firstDossier?.pipeline_entry_date),
        derniereInteraction:
          interactionDate === "—"
            ? interactionStage
            : `${interactionDate} · ${interactionStage.toLowerCase()}`,
        caGenere2026: formatEurClient(ca),
        caGold: ca > 0,
        statutLabel: PIPELINE_STATUT_LABELS[stage] ?? stage,
        statutVariant: STATUT_VARIANT_OF_STAGE[stage] ?? "info",
      } satisfies Client;
    });

    clients.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

    const caTotal = clients.reduce((acc, c) => acc + (caByClient.get(c.slug) ?? 0), 0);
    return buildScreen(clients, caTotal);
  } catch {
    return getClientsScreenFallbackSync();
  }
}
