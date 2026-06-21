import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  KPIS,
  ROWS,
  TOTAL_DOSSIERS,
  type ConformiteRow,
  type DocStatus,
  type PayTone,
} from "./conformite";

/**
 * Module SERVEUR de l'écran « Conformité en cours » (étape 02 du parcours).
 *
 * Lit les dossiers RÉELS de l'ingénieur courant au stade `02_compliance`
 * (`dossiers` ⨝ `clients` ⨝ `personnes`), enrichis des pièces de conformité
 * réelles (`conformite_items`, par dossier) et du statut de paiement dérivé de
 * `souscriptions`. La fiche conformité détaillée s'ouvre sur l'id de dossier
 * réel (route `conformite/[id]`). Dégrade sur la maquette quand la base n'est
 * pas configurée, la session manque, ou aucun dossier n'est en conformité.
 *
 * Le composant client reçoit `rows` / `kpis` / `total` par props, jamais via un
 * import de ce module (règle d'or Next : pas de base côté client).
 */

export type ConformiteScreen = {
  rows: ConformiteRow[];
  kpis: typeof KPIS;
  total: number;
  /** true quand les lignes viennent de la base (sinon repli maquette). */
  realData: boolean;
};

const FALLBACK: ConformiteScreen = {
  rows: ROWS,
  kpis: KPIS,
  total: TOTAL_DOSSIERS,
  realData: false,
};

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawConformiteItem = {
  type: string;
  status: string; // a_faire | envoye | signe | valide
};

type RawSouscription = {
  amount_initial: number | string | null;
  status: string | null; // pending_signature | signed | active | ...
  subscription_date: string | null;
};

type RawDossier = {
  id: string;
  client: {
    id: string;
    household_type: string | null;
    personnes: RawPersonne[] | null;
    souscriptions: RawSouscription[] | null;
  } | null;
  conformite_items: RawConformiteItem[] | null;
};

const DOC_CODE: Record<string, string> = {
  der: "DER",
  kyc: "KYC",
  lettre_mission: "LM",
  mandat: "Mandat",
};

const STATUS_TEXT: Record<string, { text: string; em?: string; tone: DocStatus["tone"] }> = {
  a_faire: { text: "○ À finaliser par l'ingénieur", tone: "navy" },
  envoye: { text: "▸ Envoyé · ", em: "Non signé", tone: "gold" },
  signe: { text: "✓ Signé", tone: "green" },
  valide: { text: "✓ Validé", tone: "green" },
};

/** Construit les 3 lignes de documents (DER / KYC / LM) à partir des items réels. */
function docsFromItems(items: RawConformiteItem[]): DocStatus[] {
  const byType = new Map(items.map((i) => [i.type, i.status]));
  return (["der", "kyc", "lettre_mission"] as const).map((type) => {
    const status = byType.get(type) ?? "a_faire";
    const tpl = STATUS_TEXT[status] ?? STATUS_TEXT.a_faire;
    return { code: DOC_CODE[type], text: tpl.text, em: tpl.em, tone: tpl.tone };
  });
}

/** Statut data (facette KPI) déduit de l'avancement des 3 documents. */
function dataStatusFromDocs(docs: DocStatus[]): ConformiteRow["dataStatus"] {
  const allSigned = docs.every((d) => d.tone === "green");
  return allSigned ? "signe-attente" : "a-signer";
}

/** Paiement de l'acompte d'étude dérivé de la 1re souscription du foyer. */
function paymentFrom(souscriptions: RawSouscription[]): {
  tone: PayTone;
  label: string;
  meta: string;
  paid: boolean;
} {
  const acompte = "3 900 € TTC";
  if (souscriptions.length === 0) {
    return { tone: "attente", label: "En attente", meta: acompte, paid: false };
  }
  const paid = souscriptions.some((s) => s.status === "active" || s.status === "signed");
  if (paid) {
    const s = souscriptions.find((x) => x.status === "active" || x.status === "signed");
    const date = s?.subscription_date
      ? new Date(s.subscription_date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null;
    return { tone: "recu", label: "Reçu", meta: date ? `3 900 € · ${date}` : "3 900 €", paid: true };
  }
  return { tone: "attente", label: "En attente", meta: acompte, paid: false };
}

function householdNames(personnes: RawPersonne[], householdType: string | null): {
  names: string[];
  typeLabel: string;
  kind: ConformiteRow["kind"];
} {
  if (personnes.length === 0) {
    return { names: ["Foyer sans nom"], typeLabel: "Personne seule", kind: "seul" };
  }
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");
  const lastName = (a.last_name ?? "").trim();
  const aName = `${(a.first_name ?? "").trim()} ${lastName}`.trim();
  if (b) {
    const bName = `${(b.first_name ?? "").trim()} ${(b.last_name ?? "").trim()}`.trim();
    const label = householdType === "couple_pacs" ? "Couple PACS" : "Couple";
    return { names: [aName, bName], typeLabel: label, kind: "couple" };
  }
  return { names: [aName], typeLabel: "Personne seule", kind: "seul" };
}

function toRow(d: RawDossier): ConformiteRow {
  const personnes = d.client?.personnes ?? [];
  const { names, typeLabel, kind } = householdNames(personnes, d.client?.household_type ?? null);
  const docs = docsFromItems(d.conformite_items ?? []);
  const dataStatus = dataStatusFromDocs(docs);
  const payment = paymentFrom(d.client?.souscriptions ?? []);

  const status: ConformiteRow["status"] = payment.paid
    ? { tone: "paid", label: "Paiement reçu · prêt étape 03" }
    : dataStatus === "signe-attente"
      ? { tone: "signed", label: "Tous signés · attente paiement" }
      : { tone: "waiting", label: "À signer" };

  return {
    id: d.id,
    names,
    typeLabel,
    kind,
    dataStatus: payment.paid ? "paye" : dataStatus,
    cabinet: { name: "Sarah KAUFMANN", sub: "Cabinet Paris Étoile" },
    supervisor: { initials: "SK", name: "Sarah KAUFMANN" },
    docs,
    payment: { tone: payment.tone, label: payment.label, meta: payment.meta },
    status,
    // La fiche conformité détaillée existe en route pour tout dossier réel.
    ficheReady: true,
  };
}

function buildScreen(rows: ConformiteRow[]): ConformiteScreen {
  const aSigner = rows.filter((r) => r.dataStatus === "a-signer").length;
  const enConformite = rows.filter((r) => r.dataStatus === "signe-attente").length;
  const recu = rows.filter((r) => r.payment.tone === "recu").length;
  const attente = rows.filter((r) => r.payment.tone === "attente").length;
  const totalPay = rows.length;
  const pct = totalPay > 0 ? Math.round((recu / totalPay) * 100) : 0;

  return {
    rows,
    kpis: {
      aSigner: {
        count: String(aSigner),
        unit: aSigner > 1 ? "clients" : "client",
        meta: "3 documents à signer (DER · KYC · LM)",
      },
      enConformite: {
        count: String(enConformite),
        unit: enConformite > 1 ? "clients" : "client",
        meta: "documents signés · en attente de paiement",
      },
      paiement: {
        recu: String(recu),
        total: String(totalPay),
        pct: `${pct} %`,
        attente: `${attente} en attente`,
      },
      delai: KPIS.delai,
    },
    total: rows.length,
    realData: true,
  };
}

export async function getConformiteScreen(): Promise<ConformiteScreen> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return FALLBACK;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return FALLBACK;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          client:clients!inner (
            id, household_type,
            personnes ( role_in_household, first_name, last_name ),
            souscriptions ( amount_initial, status, subscription_date )
          ),
          conformite_items ( type, status )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("engineer_id", ctx.userId)
      .eq("pipeline_stage", "02_compliance")
      .order("pipeline_entry_date", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK;

    const rows = (data as unknown as RawDossier[]).map(toRow);
    return buildScreen(rows);
  } catch {
    return FALLBACK;
  }
}
