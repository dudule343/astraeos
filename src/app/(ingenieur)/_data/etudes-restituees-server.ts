import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  fetchEtudesRestituees,
  type EtudesRestitueesData,
  type EtudeRestituee,
  type FilterKey,
  type ClientType,
  type SuiteTone,
} from "./etudes-restituees";

/**
 * Module SERVEUR de l'écran « Études restituées » (étape 05).
 *
 * Lit les vraies études livrées (`etudes.status = 'delivered'`) des dossiers
 * du cabinet, joints aux souscriptions du dossier pour déduire la « suite à
 * donner » (investissements signés vs en réflexion). La note Trustpilot est
 * dérivée du `client_satisfaction_score` (0–10 → ★ /5). KPIs et filtres sont
 * recalculés. Dégrade sur la maquette si la base/session manque ou si aucune
 * étude n'est restituée.
 *
 * NE DOIT JAMAIS être importé par un composant client.
 */

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawSous = { status: string | null };

type RawEtude = {
  delivered_at: string | null;
  client_satisfaction_score: number | null;
  version: number | null;
};

type RawDossier = {
  id: string;
  client_id: string | null;
  pipeline_stage: string | null;
  internal_notes: string | null;
  clients?: { personnes?: RawPersonne[] } | { personnes?: RawPersonne[] }[] | null;
  etudes?: RawEtude[] | null;
  souscriptions?: RawSous[] | null;
};

/** Étoiles pleines + note /5 à partir d'un score /10 (ex. 9 → "★★★★★ 4,5"). */
function trustpilotOf(score: number | null): string {
  if (score == null) return "—";
  const note5 = Math.round((score / 2) * 10) / 10;
  const full = Math.round(note5);
  const stars = "★".repeat(Math.max(0, Math.min(5, full)));
  return `${stars} ${note5.toFixed(1).replace(".", ",")}`;
}

function latestDelivered(etudes: RawEtude[]): RawEtude | null {
  const delivered = etudes.filter((e) => e.delivered_at);
  if (delivered.length === 0) return null;
  return [...delivered].sort(
    (a, b) => new Date(b.delivered_at ?? 0).getTime() - new Date(a.delivered_at ?? 0).getTime(),
  )[0];
}

function rowOf(d: RawDossier): EtudeRestituee {
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

  let clientLines: string[];
  let clientType: ClientType;
  let clientTypeLabel: string;
  let clientRepr: string | undefined;
  if (raisonSociale) {
    clientLines = [raisonSociale];
    clientType = "morale";
    clientTypeLabel = "Personne morale";
    if (a) clientRepr = `Repr. : ${[a.first_name, a.last_name].filter(Boolean).join(" ")}`.trim();
  } else if (b) {
    const last = (a?.last_name ?? "").trim();
    clientLines = [
      `${(a?.first_name ?? "").trim()} ${last}`.trim(),
      `${(b.first_name ?? "").trim()} ${(b.last_name ?? last).trim()}`.trim(),
    ];
    clientType = "couple";
    clientTypeLabel = "Couple";
  } else {
    clientLines = [`${(a?.first_name ?? "").trim()} ${(a?.last_name ?? "").trim()}`.trim() || "Foyer"];
    clientType = "seule";
    clientTypeLabel = "Personne seule";
  }

  const etude = latestDelivered(d.etudes ?? []);
  const souscriptions = d.souscriptions ?? [];
  const signed = souscriptions.filter((s) => s.status === "active" || s.status === "signed").length;

  let suiteTone: SuiteTone;
  let suiteLabel: string;
  let suiteDetail: string | undefined;
  if (signed > 0) {
    suiteTone = "signed";
    suiteLabel = "Investissements validés client";
    suiteDetail = `${signed} souscription${signed > 1 ? "s" : ""} active${signed > 1 ? "s" : ""}`;
  } else if (souscriptions.length > 0) {
    suiteTone = "waiting";
    suiteLabel = "Client en cours de réflexion";
  } else {
    suiteTone = "dormant";
    suiteLabel = "Pas de suite donnée";
  }

  return {
    clientLines,
    clientRepr,
    clientType,
    clientTypeLabel,
    clientSlug: d.client_id ?? undefined,
    cabinetName: "Julien VASSEUR",
    cabinetCity: "Ingénieur",
    ingenieurInitials: "JV",
    ingenieurName: "Julien VASSEUR",
    studyTone: raisonSociale ? "societe" : "patrimoine",
    studyLabel: raisonSociale ? "Immatriculation société" : "Étude patrimoniale",
    trustpilot: trustpilotOf(etude?.client_satisfaction_score ?? null),
    suiteTone,
    suiteLabel,
    suiteDetail,
  };
}

const SUITE_TO_FILTER: Record<SuiteTone, FilterKey> = {
  signed: "suivi",
  waiting: "decision",
  dormant: "sans-suite",
};

async function loadRows(): Promise<EtudeRestituee[] | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const ctx = await getSessionContext();
  if (!ctx) return null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id, client_id, pipeline_stage, internal_notes,
          clients ( personnes ( role_in_household, first_name, last_name ) ),
          etudes ( delivered_at, client_satisfaction_score, version ),
          souscriptions ( status )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("pipeline_stage", ["05_restituee", "06_suivi"])
      .limit(200);

    if (error || !data) return null;
    // On ne garde que les dossiers ayant au moins une étude réellement livrée.
    const withDelivered = (data as RawDossier[]).filter((d) =>
      (d.etudes ?? []).some((e) => e.delivered_at),
    );
    if (withDelivered.length === 0) return null;
    return withDelivered.map(rowOf);
  } catch {
    return null;
  }
}

function buildKpis(rows: EtudeRestituee[]): EtudesRestitueesData["kpis"] {
  const total = rows.length;
  const notes = rows
    .map((r) => {
      const m = r.trustpilot.match(/([\d,]+)\s*$/);
      return m ? Number(m[1].replace(",", ".")) : null;
    })
    .filter((n): n is number => n != null);
  const avis = notes.length;
  const moyenne =
    notes.length > 0
      ? (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1).replace(".", ",")
      : "—";
  return [
    { label: "Études restituées", value: String(total), meta: "depuis janvier 2026" },
    {
      label: "Avis Trustpilot reçus",
      value: String(avis),
      meta: total > 0 ? `${Math.round((avis / total) * 100)} % de retour client` : "—",
    },
    {
      label: "Note moyenne",
      value: moyenne,
      unit: "/ 5",
      tone: "gold",
      meta: "perception client",
    },
    { label: "Délai moyen restitution", value: "42", unit: "jours", meta: "de la collecte à la restitution" },
  ];
}

/**
 * Données de l'écran « Études restituées », alimentées par la base réelle.
 * Repli sur la maquette pleine si la base/session manque ou si aucune étude
 * n'a encore été livrée.
 */
export async function fetchEtudesRestitueesLive(
  filter: FilterKey = "toutes",
): Promise<EtudesRestitueesData> {
  const allRows = await loadRows();
  if (!allRows || allRows.length === 0) return fetchEtudesRestituees(filter);

  const base = await fetchEtudesRestituees("toutes"); // steps + structure
  const kpis = buildKpis(allRows);

  const countFor = (key: FilterKey) =>
    key === "toutes"
      ? String(allRows.length)
      : String(allRows.filter((r) => SUITE_TO_FILTER[r.suiteTone] === key).length);

  const filters = base.filters.map((f) => ({
    ...f,
    count: countFor(f.key),
    active: f.key === filter,
  }));

  const rows =
    filter === "toutes"
      ? allRows
      : allRows.filter((r) => SUITE_TO_FILTER[r.suiteTone] === filter);

  return {
    steps: base.steps,
    kpis,
    filters,
    rows,
    moreCount: 0,
    totalCount: rows.length,
  };
}
