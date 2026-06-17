import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Finance interne de l'ÉDITEUR (ASTRAEOS, la marque) — consolidée, tous
// cabinets confondus. Aucune table "revenus/charges" dédiée : la part de
// revenu de l'éditeur se dérive des commissions dont il est le destinataire
// (recipient_type='brand_owner'), jointes via souscriptions → produits.
//
// Symétrie exacte avec la finance dirigeant ((dirigeant)/_data/cabinet.ts) :
//   - là-bas  recipient_type='cabinet'  + filtre cabinet_id
//   - ici     recipient_type='brand_owner' SANS filtre cabinet (consolidé)
//
// Périmètre via getSessionContext() : on scope sur recipient_tenant_id =
// ctx.tenantId (le tenant qui ENCAISSE la part marque). En mode legacy
// (auth off), le contexte renvoie le tenant du seed → données réelles.
//
// Réconciliation schéma (db/migrations/0001_initial_schema.sql) :
//   - commission_status = pending | received | reconciled  (PAS de 'paid')
//     → "encaissé" = status IN ('received','reconciled')
//   - commission_recipient = brand_owner | cabinet | engineer_bonus
//     → part éditeur = recipient_type='brand_owner'
//   - commission_type = upfront | recurring_management | performance | study_fee
//     → honoraires d'études = 'study_fee'
//     → apports d'affaires  = upfront + recurring_management + performance
//
// AUCUNE source en base pour : charges/salaires/SaaS/marketing, trésorerie /
// soldes bancaires, objectifs prévisionnels, PCA / étalement. Ces blocs
// dégradent en état vide honnête côté UI (jamais de chiffre inventé).
// =========================================================================

// Date de référence : "aujourd'hui". Le seed n'a pas de données financières,
// donc les fenêtres temporelles dégradent proprement à 0.
const NOW = new Date();

export type EditeurCommission = {
  amount_eur: number;
  commission_type: "upfront" | "recurring_management" | "performance" | "study_fee";
  recipient_type: "brand_owner" | "cabinet" | "engineer_bonus";
  status: "pending" | "received" | "reconciled";
  paid_date: string | null;
  due_date: string | null;
  souscription: {
    id: string;
    amount_initial: number | null;
    amount_recurring_monthly: number | null;
    subscription_date: string | null;
    produit: {
      category: string | null;
      partner_name: string | null;
      name: string | null;
    } | null;
  } | null;
};

/**
 * Récupère les commissions encaissées/dues par l'éditeur (part marque,
 * recipient_type='brand_owner') sur tout son périmètre, avec souscription et
 * produit joints. Scope sur recipient_tenant_id = ctx.tenantId. Pas de filtre
 * cabinet : vue consolidée. Dégrade à [] en cas d'erreur ou de schéma absent.
 */
export async function fetchEditeurCommissions(): Promise<EditeurCommission[]> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return [];
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("commissions")
      .select(
        `amount_eur, commission_type, recipient_type, status, paid_date, due_date,
         souscription:souscriptions!inner(
           id, amount_initial, amount_recurring_monthly, subscription_date,
           produit:produits(category, partner_name, name)
         )`,
      )
      .eq("recipient_type", "brand_owner")
      .eq("recipient_tenant_id", ctx.tenantId);

    if (error || !data) return [];

    return data.map((row) => {
      const sousRaw = Array.isArray(row.souscription) ? row.souscription[0] : row.souscription;
      const produitRaw = sousRaw
        ? Array.isArray(sousRaw.produit)
          ? sousRaw.produit[0]
          : sousRaw.produit
        : null;
      return {
        amount_eur: Number(row.amount_eur ?? 0),
        commission_type: row.commission_type,
        recipient_type: row.recipient_type,
        status: row.status,
        paid_date: row.paid_date ?? null,
        due_date: row.due_date ?? null,
        souscription: sousRaw
          ? {
              id: sousRaw.id as string,
              amount_initial: sousRaw.amount_initial != null ? Number(sousRaw.amount_initial) : null,
              amount_recurring_monthly:
                sousRaw.amount_recurring_monthly != null
                  ? Number(sousRaw.amount_recurring_monthly)
                  : null,
              subscription_date: sousRaw.subscription_date ?? null,
              produit: produitRaw
                ? {
                    category: produitRaw.category ?? null,
                    partner_name: produitRaw.partner_name ?? null,
                    name: produitRaw.name ?? null,
                  }
                : null,
            }
          : null,
      } satisfies EditeurCommission;
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Agrégations dérivées (pures, testables sans DB)
// ---------------------------------------------------------------------------

const RECEIVED = new Set(["received", "reconciled"]);

function isHonoraires(c: EditeurCommission) {
  return c.commission_type === "study_fee";
}
function isApports(c: EditeurCommission) {
  return (
    c.commission_type === "upfront" ||
    c.commission_type === "recurring_management" ||
    c.commission_type === "performance"
  );
}

export type EditeurResultat = {
  honorairesGenere: number;
  honorairesEncaisse: number;
  apportsGenere: number;
  apportsEncaisse: number;
  totalGenere: number;
  totalEncaisse: number;
  resteAEncaisser: number;
};

/** Synthèse : généré (toutes commissions brand_owner) vs encaissé (received). */
export function computeEditeurResultat(commissions: EditeurCommission[]): EditeurResultat {
  const genere = (pred: (c: EditeurCommission) => boolean) =>
    commissions.filter(pred).reduce((acc, c) => acc + c.amount_eur, 0);
  const encaisse = (pred: (c: EditeurCommission) => boolean) =>
    commissions
      .filter((c) => pred(c) && RECEIVED.has(c.status))
      .reduce((acc, c) => acc + c.amount_eur, 0);

  const totalGenere = genere(() => true);
  const totalEncaisse = encaisse(() => true);

  return {
    honorairesGenere: genere(isHonoraires),
    honorairesEncaisse: encaisse(isHonoraires),
    apportsGenere: genere(isApports),
    apportsEncaisse: encaisse(isApports),
    totalGenere,
    totalEncaisse,
    resteAEncaisser: Math.max(0, totalGenere - totalEncaisse),
  };
}

export type SourceBreakdown = { key: string; label: string; generated: number; subs: number };

/** Répartition du CA par catégorie de produit (apports + honoraires). */
export function computeBreakdownByCategory(commissions: EditeurCommission[]): SourceBreakdown[] {
  const map = new Map<string, { generated: number; subs: Set<string> }>();
  for (const c of commissions) {
    const cat = c.souscription?.produit?.category ?? "autre";
    const entry = map.get(cat) ?? { generated: 0, subs: new Set<string>() };
    entry.generated += c.amount_eur;
    if (c.souscription?.id) entry.subs.add(c.souscription.id);
    map.set(cat, entry);
  }
  return [...map.entries()]
    .map(([key, v]) => ({
      key,
      label: PRODUIT_CATEGORY_LABELS[key] ?? key,
      generated: v.generated,
      subs: v.subs.size,
    }))
    .sort((a, b) => b.generated - a.generated);
}

export type SourceRow = {
  source: string;
  type: "Honoraires" | "Apports";
  subs: number;
  gen: number;
  enc: number;
  rest: number;
};

/**
 * Lignes "généré vs encaissé" : une ligne honoraires d'études + une ligne
 * apports par catégorie de produit.
 */
export function computeSourceRows(commissions: EditeurCommission[]): SourceRow[] {
  const rows: SourceRow[] = [];

  const honoraires = commissions.filter(isHonoraires);
  if (honoraires.length > 0) {
    const subs = new Set(honoraires.map((c) => c.souscription?.id).filter(Boolean));
    const gen = honoraires.reduce((a, c) => a + c.amount_eur, 0);
    const enc = honoraires
      .filter((c) => RECEIVED.has(c.status))
      .reduce((a, c) => a + c.amount_eur, 0);
    rows.push({
      source: "Honoraires études patrimoniales",
      type: "Honoraires",
      subs: subs.size,
      gen,
      enc,
      rest: Math.max(0, gen - enc),
    });
  }

  const apportsByCat = new Map<string, EditeurCommission[]>();
  for (const c of commissions) {
    if (!isApports(c)) continue;
    const cat = c.souscription?.produit?.category ?? "autre";
    const arr = apportsByCat.get(cat) ?? [];
    arr.push(c);
    apportsByCat.set(cat, arr);
  }
  for (const [cat, arr] of apportsByCat) {
    const subs = new Set(arr.map((c) => c.souscription?.id).filter(Boolean));
    const gen = arr.reduce((a, c) => a + c.amount_eur, 0);
    const enc = arr.filter((c) => RECEIVED.has(c.status)).reduce((a, c) => a + c.amount_eur, 0);
    rows.push({
      source: `Apport · ${PRODUIT_CATEGORY_LABELS[cat] ?? cat}`,
      type: "Apports",
      subs: subs.size,
      gen,
      enc,
      rest: Math.max(0, gen - enc),
    });
  }

  return rows.sort((a, b) => b.gen - a.gen);
}

export type MonthlyRevenue = { key: string; label: string; generated: number; current: boolean };

const MONTH_LABELS = [
  "Janv",
  "Févr",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sept",
  "Oct",
  "Nov",
  "Déc",
];

/**
 * CA généré bucketé par mois sur l'année en cours (janv → mois courant).
 * On bucket via paid_date si présent, sinon subscription_date. Renvoie []
 * si aucune commission datée (→ histogramme masqué côté UI).
 */
export function computeMonthlyRevenue(commissions: EditeurCommission[]): MonthlyRevenue[] {
  const year = NOW.getFullYear();
  const currentMonth = NOW.getMonth();
  const buckets = new Array(currentMonth + 1).fill(0) as number[];
  let any = false;

  for (const c of commissions) {
    const ref = c.paid_date ?? c.souscription?.subscription_date ?? null;
    if (!ref) continue;
    const d = new Date(ref);
    if (d.getFullYear() !== year) continue;
    const m = d.getMonth();
    if (m > currentMonth) continue;
    buckets[m] += c.amount_eur;
    any = true;
  }

  if (!any) return [];

  return buckets.map((generated, m) => ({
    key: `${year}-${m}`,
    label: MONTH_LABELS[m] ?? String(m + 1),
    generated,
    current: m === currentMonth,
  }));
}

export const PRODUIT_CATEGORY_LABELS: Record<string, string> = {
  av_multisupport: "Assurance-vie multisupport",
  av_lux: "Assurance-vie luxembourgeoise",
  per: "Plan épargne retraite",
  scpi: "SCPI",
  fpci: "FPCI",
  opci: "OPCI",
  structure: "Produits structurés",
  prevoyance: "Prévoyance",
  credit: "Crédit",
  autre: "Autre",
};

// ---------------------------------------------------------------------------
// Formatage
// ---------------------------------------------------------------------------

/** Montant brut → "12 340" ; 0 ou non-fini → "—" (état vide honnête). */
export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return Math.round(n).toLocaleString("fr-FR");
}

/** Montant suffixé → "12 340 €" ; 0 ou non-fini → "— €". */
export function fmtEurCell(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "— €";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

export function pct(part: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((part / total) * 100)} %`;
}
