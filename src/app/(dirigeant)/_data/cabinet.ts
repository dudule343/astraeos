import { createAdminClient, DEFAULT_CABINET_ID, DEFAULT_TENANT_ID } from "@/lib/supabase/admin";

// =========================================================================
// Accès données du cockpit dirigeant — tenant unique = cabinet courant.
// Aucune table "revenus/honoraires" dédiée : le CA perçu se dérive des
// commissions (status='received', paid_date) jointes via souscriptions →
// produits. Toutes les requêtes filtrent par cabinet_id + tenant_id.
//
// Réconciliation avec le schéma réel (db/migrations/0001_initial_schema.sql) :
//   - commission_status = pending | received | reconciled  (PAS de 'paid')
//     → "perçu / encaissé" = status IN ('received','reconciled') avec paid_date
//   - commission_recipient = brand_owner | cabinet | engineer_bonus
//     → part cabinet = recipient_type='cabinet' + recipient_cabinet_id
//     → reversé ingénieurs = recipient_type='engineer_bonus' + recipient_user_id
//   - commission_type = upfront | recurring_management | performance | study_fee
//     → honoraires d'études = 'study_fee'
//     → apports d'affaires  = upfront + recurring_management + performance
// =========================================================================

export const CABINET_ID = DEFAULT_CABINET_ID;
export const TENANT_ID = DEFAULT_TENANT_ID;

// Date de référence : "aujourd'hui". Le seed n'a pas de données financières,
// donc les fenêtres temporelles dégradent proprement à 0.
const NOW = new Date();

export type CabinetCommission = {
  amount_eur: number;
  commission_type: "upfront" | "recurring_management" | "performance" | "study_fee";
  recipient_type: "brand_owner" | "cabinet" | "engineer_bonus";
  recipient_user_id: string | null;
  status: "pending" | "received" | "reconciled";
  paid_date: string | null;
  due_date: string | null;
  souscription: {
    id: string;
    amount_initial: number | null;
    engineer_id: string | null;
    subscription_date: string | null;
    produit: {
      category: string | null;
      partner_name: string | null;
      name: string | null;
    } | null;
  } | null;
};

export type EngineerRow = {
  id: string;
  first_name: string;
  last_name: string;
  specialties: string[];
  orias_number: string | null;
  created_at: string;
};

/**
 * Récupère toutes les commissions du cabinet courant avec la souscription et
 * le produit joints. On filtre côté requête sur le cabinet de la souscription
 * (souscriptions.cabinet_id) — fiable même quand recipient_cabinet_id est nul.
 * Dégrade à [] en cas d'erreur ou de schéma absent.
 */
export async function fetchCabinetCommissions(): Promise<CabinetCommission[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("commissions")
      .select(
        `amount_eur, commission_type, recipient_type, recipient_user_id, status, paid_date, due_date,
         souscription:souscriptions!inner(
           id, amount_initial, engineer_id, subscription_date, cabinet_id, tenant_id,
           produit:produits(category, partner_name, name)
         )`,
      )
      .eq("souscription.cabinet_id", CABINET_ID)
      .eq("souscription.tenant_id", TENANT_ID);

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
        recipient_user_id: row.recipient_user_id ?? null,
        status: row.status,
        paid_date: row.paid_date ?? null,
        due_date: row.due_date ?? null,
        souscription: sousRaw
          ? {
              id: sousRaw.id as string,
              amount_initial: sousRaw.amount_initial != null ? Number(sousRaw.amount_initial) : null,
              engineer_id: sousRaw.engineer_id ?? null,
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
      } satisfies CabinetCommission;
    });
  } catch {
    return [];
  }
}

/** Ingénieurs actifs du cabinet (role='engineer'). Dégrade à []. */
export async function fetchCabinetEngineers(): Promise<EngineerRow[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, specialties, orias_number, created_at")
      .eq("cabinet_id", CABINET_ID)
      .eq("tenant_id", TENANT_ID)
      .eq("role", "engineer")
      .eq("is_active", true);

    if (error || !data) return [];
    return data.map((u) => ({
      id: u.id as string,
      first_name: (u.first_name as string) ?? "",
      last_name: (u.last_name as string) ?? "",
      specialties: (u.specialties as string[]) ?? [],
      orias_number: (u.orias_number as string) ?? null,
      created_at: u.created_at as string,
    }));
  } catch {
    return [];
  }
}

export type DossierLite = {
  id: string;
  client_id: string;
  engineer_id: string | null;
  created_at: string;
};

/** Dossiers du cabinet (pour études / nouveaux clients par ingénieur). Dégrade à []. */
export async function fetchCabinetDossiers(): Promise<DossierLite[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select("id, client_id, engineer_id, created_at")
      .eq("cabinet_id", CABINET_ID)
      .eq("tenant_id", TENANT_ID);

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id as string,
      client_id: d.client_id as string,
      engineer_id: d.engineer_id ?? null,
      created_at: d.created_at as string,
    }));
  } catch {
    return [];
  }
}

/** Compte les études livrées rattachées aux dossiers du cabinet, par engineer_id. */
export async function fetchEtudesByEngineer(
  dossiers: DossierLite[],
): Promise<Map<string, number>> {
  const byEngineer = new Map<string, number>();
  if (dossiers.length === 0) return byEngineer;
  try {
    const supabase = createAdminClient();
    const dossierIds = dossiers.map((d) => d.id);
    const { data, error } = await supabase
      .from("etudes")
      .select("dossier_id")
      .in("dossier_id", dossierIds);

    if (error || !data) return byEngineer;
    const engineerOf = new Map(dossiers.map((d) => [d.id, d.engineer_id]));
    for (const e of data) {
      const eng = engineerOf.get(e.dossier_id as string);
      if (!eng) continue;
      byEngineer.set(eng, (byEngineer.get(eng) ?? 0) + 1);
    }
    return byEngineer;
  } catch {
    return byEngineer;
  }
}

// ---------------------------------------------------------------------------
// Agrégations dérivées (pures, testables sans DB)
// ---------------------------------------------------------------------------

const RECEIVED = new Set(["received", "reconciled"]);

function isHonoraires(c: CabinetCommission) {
  return c.commission_type === "study_fee";
}
function isApports(c: CabinetCommission) {
  return (
    c.commission_type === "upfront" ||
    c.commission_type === "recurring_management" ||
    c.commission_type === "performance"
  );
}
/** Commission perçue par le cabinet (vs reversée à un ingénieur ou à la marque). */
function isCabinetShare(c: CabinetCommission) {
  return c.recipient_type === "cabinet";
}

function inWindow(dateStr: string | null, from: Date, to: Date) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= from && d <= to;
}

function startOfMonth(ref: Date) {
  return new Date(ref.getFullYear(), ref.getMonth(), 1);
}
function startOfQuarter(ref: Date) {
  const q = Math.floor(ref.getMonth() / 3) * 3;
  return new Date(ref.getFullYear(), q, 1);
}
function startOfYear(ref: Date) {
  return new Date(ref.getFullYear(), 0, 1);
}

export type RevenusKpis = {
  mois: { total: number; honoraires: number; apports: number };
  trimestre: { total: number; honoraires: number; apports: number };
  annee: { total: number; honoraires: number; apports: number };
  cumulTotal: { total: number; honoraires: number; apports: number };
};

/**
 * Revenus perçus par le cabinet (part cabinet, commissions encaissées) agrégés
 * par fenêtre via paid_date. cumulTotal = tout le perçu, toutes années.
 */
export function computeRevenusPercus(commissions: CabinetCommission[]): RevenusKpis {
  const percues = commissions.filter((c) => isCabinetShare(c) && RECEIVED.has(c.status));

  const sum = (rows: CabinetCommission[], pred: (c: CabinetCommission) => boolean) =>
    rows.filter(pred).reduce((acc, c) => acc + c.amount_eur, 0);

  const bucket = (from: Date) => {
    const win = percues.filter((c) => inWindow(c.paid_date, from, NOW));
    return {
      total: win.reduce((acc, c) => acc + c.amount_eur, 0),
      honoraires: sum(win, isHonoraires),
      apports: sum(win, isApports),
    };
  };

  return {
    mois: bucket(startOfMonth(NOW)),
    trimestre: bucket(startOfQuarter(NOW)),
    annee: bucket(startOfYear(NOW)),
    cumulTotal: {
      total: percues.reduce((acc, c) => acc + c.amount_eur, 0),
      honoraires: sum(percues, isHonoraires),
      apports: sum(percues, isApports),
    },
  };
}

export type FinanceResultat = {
  honorairesGenere: number;
  honorairesEncaisse: number;
  apportsGenere: number;
  apportsEncaisse: number;
  reverseIngenieurs: number;
  totalGenere: number;
  totalEncaisse: number;
  resteAEncaisser: number;
};

/** Synthèse finance : généré (toutes commissions) vs encaissé (received). */
export function computeFinanceResultat(commissions: CabinetCommission[]): FinanceResultat {
  const cabinet = commissions.filter(isCabinetShare);
  const genere = (pred: (c: CabinetCommission) => boolean) =>
    cabinet.filter(pred).reduce((acc, c) => acc + c.amount_eur, 0);
  const encaisse = (pred: (c: CabinetCommission) => boolean) =>
    cabinet
      .filter((c) => pred(c) && RECEIVED.has(c.status))
      .reduce((acc, c) => acc + c.amount_eur, 0);

  const reverseIngenieurs = commissions
    .filter((c) => c.recipient_type === "engineer_bonus")
    .reduce((acc, c) => acc + c.amount_eur, 0);

  const totalGenere = genere(() => true);
  const totalEncaisse = encaisse(() => true);

  return {
    honorairesGenere: genere(isHonoraires),
    honorairesEncaisse: encaisse(isHonoraires),
    apportsGenere: genere(isApports),
    apportsEncaisse: encaisse(isApports),
    reverseIngenieurs,
    totalGenere,
    totalEncaisse,
    resteAEncaisser: Math.max(0, totalGenere - totalEncaisse),
  };
}

export type SourceBreakdown = { key: string; label: string; generated: number; subs: number };

/** Répartition des apports d'affaires par catégorie de produit. */
export function computeBreakdownByCategory(commissions: CabinetCommission[]): SourceBreakdown[] {
  const map = new Map<string, { generated: number; subs: Set<string> }>();
  for (const c of commissions) {
    if (!isCabinetShare(c)) continue;
    const cat = c.souscription?.produit?.category ?? "autre";
    const entry = map.get(cat) ?? { generated: 0, subs: new Set<string>() };
    entry.generated += c.amount_eur;
    if (c.souscription?.id) entry.subs.add(c.souscription.id);
    map.set(cat, entry);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: PRODUIT_CATEGORY_LABELS[key] ?? key, generated: v.generated, subs: v.subs.size }))
    .sort((a, b) => b.generated - a.generated);
}

/** Répartition par partenaire (partner_name) sur les apports d'affaires. */
export function computeBreakdownByPartner(commissions: CabinetCommission[]): SourceBreakdown[] {
  const map = new Map<string, { generated: number; subs: Set<string> }>();
  for (const c of commissions) {
    if (!isCabinetShare(c)) continue;
    const partner = c.souscription?.produit?.partner_name ?? "Sans partenaire";
    const entry = map.get(partner) ?? { generated: 0, subs: new Set<string>() };
    entry.generated += c.amount_eur;
    if (c.souscription?.id) entry.subs.add(c.souscription.id);
    map.set(partner, entry);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: key, generated: v.generated, subs: v.subs.size }))
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
 * Lignes "généré vs encaissé" pour le détail finance : une ligne honoraires
 * d'études + une ligne apports par catégorie de produit.
 */
export function computeSourceRows(commissions: CabinetCommission[]): SourceRow[] {
  const rows: SourceRow[] = [];

  const honoraires = commissions.filter((c) => isCabinetShare(c) && isHonoraires(c));
  if (honoraires.length > 0) {
    const subs = new Set(honoraires.map((c) => c.souscription?.id).filter(Boolean));
    const gen = honoraires.reduce((a, c) => a + c.amount_eur, 0);
    const enc = honoraires.filter((c) => RECEIVED.has(c.status)).reduce((a, c) => a + c.amount_eur, 0);
    rows.push({ source: "Honoraires études patrimoniales", type: "Honoraires", subs: subs.size, gen, enc, rest: Math.max(0, gen - enc) });
  }

  const apportsByCat = new Map<string, CabinetCommission[]>();
  for (const c of commissions) {
    if (!isCabinetShare(c) || !isApports(c)) continue;
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

export type EngineerCommission = {
  initiales: string;
  nom: string;
  ca: number;
  reverse: number;
  encaisse: number;
  pending: number;
};

/**
 * Par ingénieur : CA généré (souscriptions.amount_initial, dédupliqué) et
 * commissions reversées (engineer_bonus) ventilées encaissé / en attente.
 */
export function computeEngineerCommissions(
  engineers: EngineerRow[],
  commissions: CabinetCommission[],
): EngineerCommission[] {
  const byId = new Map(engineers.map((e) => [e.id, e]));

  const caByEngineer = new Map<string, number>();
  const seenSubs = new Set<string>();
  for (const c of commissions) {
    const sub = c.souscription;
    if (!sub?.engineer_id || !sub.id || seenSubs.has(sub.id)) continue;
    seenSubs.add(sub.id);
    caByEngineer.set(sub.engineer_id, (caByEngineer.get(sub.engineer_id) ?? 0) + (sub.amount_initial ?? 0));
  }

  const reverse = new Map<string, { total: number; encaisse: number; pending: number }>();
  for (const c of commissions) {
    if (c.recipient_type !== "engineer_bonus" || !c.recipient_user_id) continue;
    const e = reverse.get(c.recipient_user_id) ?? { total: 0, encaisse: 0, pending: 0 };
    e.total += c.amount_eur;
    if (RECEIVED.has(c.status)) e.encaisse += c.amount_eur;
    else e.pending += c.amount_eur;
    reverse.set(c.recipient_user_id, e);
  }

  // Union des ingénieurs ayant un CA ou un reversement.
  const ids = new Set<string>([...caByEngineer.keys(), ...reverse.keys()]);
  return [...ids]
    .map((id) => {
      const e = byId.get(id);
      const r = reverse.get(id) ?? { total: 0, encaisse: 0, pending: 0 };
      return {
        initiales: e ? initials(e.first_name, e.last_name) : "?",
        nom: e ? `${e.first_name} ${e.last_name}`.trim() : "Ingénieur",
        ca: caByEngineer.get(id) ?? 0,
        reverse: r.total,
        encaisse: r.encaisse,
        pending: r.pending,
      } satisfies EngineerCommission;
    })
    .sort((a, b) => b.reverse - a.reverse || b.ca - a.ca);
}

export type EngineerStats = {
  engineer: EngineerRow;
  caGenere: number;
  clientsServed: number;
  etudes: number;
  nouveauxClients: number;
  ancienneteMois: number;
};

/** Agrège les stats par ingénieur pour le classement. */
export function computeEngineerStats(
  engineers: EngineerRow[],
  commissions: CabinetCommission[],
  dossiers: DossierLite[],
  etudesByEngineer: Map<string, number>,
): EngineerStats[] {
  const caByEngineer = new Map<string, number>();
  for (const c of commissions) {
    const eng = c.souscription?.engineer_id;
    if (!eng) continue;
    caByEngineer.set(eng, (caByEngineer.get(eng) ?? 0) + (c.souscription?.amount_initial ?? 0));
  }
  // amount_initial est répété par commission → on déduplique par souscription.
  const aumByEngineer = new Map<string, number>();
  const seenSubs = new Set<string>();
  for (const c of commissions) {
    const sub = c.souscription;
    if (!sub?.engineer_id || !sub.id || seenSubs.has(sub.id)) continue;
    seenSubs.add(sub.id);
    aumByEngineer.set(sub.engineer_id, (aumByEngineer.get(sub.engineer_id) ?? 0) + (sub.amount_initial ?? 0));
  }

  const clientsByEngineer = new Map<string, Set<string>>();
  for (const d of dossiers) {
    if (!d.engineer_id) continue;
    const set = clientsByEngineer.get(d.engineer_id) ?? new Set<string>();
    set.add(d.client_id);
    clientsByEngineer.set(d.engineer_id, set);
  }

  return engineers
    .map((e) => {
      const clients = clientsByEngineer.get(e.id)?.size ?? 0;
      const created = new Date(e.created_at);
      const ancienneteMois = Math.max(
        0,
        Math.round((NOW.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
      );
      return {
        engineer: e,
        caGenere: aumByEngineer.get(e.id) ?? 0,
        clientsServed: clients,
        etudes: etudesByEngineer.get(e.id) ?? 0,
        nouveauxClients: clients, // proxy : clients distincts servis (pas de période modélisée)
        ancienneteMois,
      } satisfies EngineerStats;
    })
    .sort((a, b) => b.caGenere - a.caGenere);
}

// ---------------------------------------------------------------------------
// Formatage
// ---------------------------------------------------------------------------

export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return Math.round(n).toLocaleString("fr-FR");
}

export function fmtEurCell(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "— €";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

export function fmtAnciennete(mois: number): string {
  if (mois <= 0) return "—";
  if (mois < 12) return `${mois} mois`;
  const ans = Math.floor(mois / 12);
  const reste = mois % 12;
  return reste > 0 ? `${ans} an${ans > 1 ? "s" : ""} ${reste} m` : `${ans} an${ans > 1 ? "s" : ""}`;
}

export function initials(first: string, last: string): string {
  return `${(first[0] ?? "").toUpperCase()}${(last[0] ?? "").toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// Encours & assets (AUM) — dérivé des souscriptions du cabinet
// ---------------------------------------------------------------------------

export type AumCategoryRow = { key: string; label: string; aum: number; subs: number };

/** Encours sous gestion par catégorie de produit. Déduplique par souscription. */
export function computeAumByCategory(commissions: CabinetCommission[]): AumCategoryRow[] {
  const map = new Map<string, { aum: number; subs: Set<string> }>();
  const seen = new Set<string>();
  for (const c of commissions) {
    const sub = c.souscription;
    if (!sub?.id || seen.has(sub.id)) continue;
    seen.add(sub.id);
    const cat = sub.produit?.category ?? "autre";
    const e = map.get(cat) ?? { aum: 0, subs: new Set<string>() };
    e.aum += sub.amount_initial ?? 0;
    e.subs.add(sub.id);
    map.set(cat, e);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, label: PRODUIT_CATEGORY_LABELS[key] ?? key, aum: v.aum, subs: v.subs.size }))
    .sort((a, b) => b.aum - a.aum);
}

export type AssetClass = "financier" | "immobilier" | "assurance" | "autre";

const ASSET_CLASS_OF: Record<string, AssetClass> = {
  av_multisupport: "financier",
  av_lux: "financier",
  per: "financier",
  fpci: "financier",
  structure: "financier",
  scpi: "immobilier",
  opci: "immobilier",
  prevoyance: "assurance",
  credit: "autre",
  autre: "autre",
};

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  financier: "Investissement financier",
  immobilier: "Investissement immobilier",
  assurance: "Assurance & prévoyance",
  autre: "Autre",
};

export type AumClassRow = {
  key: AssetClass;
  label: string;
  aum: number;
  subs: number;
  cats: AumCategoryRow[];
};

/** Regroupe l'AUM par classe d'actifs (cartes). Classes vides masquées. */
export function computeAumByAssetClass(rows: AumCategoryRow[]): AumClassRow[] {
  const order: AssetClass[] = ["financier", "immobilier", "assurance", "autre"];
  const map = new Map<AssetClass, AumClassRow>();
  for (const k of order) {
    map.set(k, { key: k, label: ASSET_CLASS_LABELS[k], aum: 0, subs: 0, cats: [] });
  }
  for (const r of rows) {
    const cls = ASSET_CLASS_OF[r.key] ?? "autre";
    const entry = map.get(cls);
    if (!entry) continue;
    entry.aum += r.aum;
    entry.subs += r.subs;
    entry.cats.push(r);
  }
  return order.map((k) => map.get(k)).filter((c): c is AumClassRow => !!c && c.cats.length > 0);
}

// ---------------------------------------------------------------------------
// Performance — pipeline du cabinet
// ---------------------------------------------------------------------------

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
  "00_archive": "Archivé",
};

const PIPELINE_ORDER = [
  "01_prospect",
  "02_compliance",
  "03_collecte",
  "04_etudes",
  "05_restituee",
  "06_suivi",
];

export type PipelineStageRow = { stage: string; label: string; count: number };

/** Compte les dossiers du cabinet par étape de pipeline (ordre métier). */
export async function fetchPipelineStages(): Promise<PipelineStageRow[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select("pipeline_stage")
      .eq("cabinet_id", CABINET_ID)
      .eq("tenant_id", TENANT_ID);
    if (error || !data) return [];
    const counts = new Map<string, number>();
    for (const d of data) {
      const s = (d.pipeline_stage as string) ?? "01_prospect";
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return PIPELINE_ORDER.map((stage) => ({
      stage,
      label: PIPELINE_STAGE_LABELS[stage] ?? stage,
      count: counts.get(stage) ?? 0,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Paramétrages — profil du cabinet + accès utilisateurs
// ---------------------------------------------------------------------------

export type CabinetProfile = {
  name: string;
  address_street: string | null;
  address_city: string | null;
  address_zipcode: string | null;
  phone: string | null;
  email: string | null;
  orias_number: string | null;
  rc_pro_insurer: string | null;
  rc_pro_expiry_date: string | null;
  contract_start_date: string | null;
  commission_split_to_owner: number | null;
  total_aum_cached: number | null;
  total_clients_cached: number | null;
  network_rank_cached: number | null;
};

/** Profil administratif du cabinet courant (table cabinets). */
export async function fetchCabinetProfile(): Promise<CabinetProfile | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("cabinets")
      .select(
        "name, address_street, address_city, address_zipcode, phone, email, orias_number, rc_pro_insurer, rc_pro_expiry_date, contract_start_date, commission_split_to_owner, total_aum_cached, total_clients_cached, network_rank_cached",
      )
      .eq("id", CABINET_ID)
      .maybeSingle();
    if (error || !data) return null;
    const d = data as Record<string, unknown>;
    const num = (v: unknown) => (v != null ? Number(v) : null);
    const str = (v: unknown) => (v != null ? String(v) : null);
    return {
      name: (d.name as string) ?? "",
      address_street: str(d.address_street),
      address_city: str(d.address_city),
      address_zipcode: str(d.address_zipcode),
      phone: str(d.phone),
      email: str(d.email),
      orias_number: str(d.orias_number),
      rc_pro_insurer: str(d.rc_pro_insurer),
      rc_pro_expiry_date: str(d.rc_pro_expiry_date),
      contract_start_date: str(d.contract_start_date),
      commission_split_to_owner: num(d.commission_split_to_owner),
      total_aum_cached: num(d.total_aum_cached),
      total_clients_cached: num(d.total_clients_cached),
      network_rank_cached: num(d.network_rank_cached),
    };
  } catch {
    return null;
  }
}

export type CabinetUserAccess = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  last_login_at: string | null;
  mfa_enabled: boolean;
  is_active: boolean;
};

/** Utilisateurs du cabinet (pour la gestion des accès dans Paramétrages). */
export async function fetchCabinetUsers(): Promise<CabinetUserAccess[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, role, last_login_at, mfa_enabled, is_active")
      .eq("cabinet_id", CABINET_ID)
      .eq("tenant_id", TENANT_ID)
      .order("role");
    if (error || !data) return [];
    return data.map((u) => ({
      id: u.id as string,
      first_name: (u.first_name as string) ?? "",
      last_name: (u.last_name as string) ?? "",
      email: (u.email as string) ?? "",
      role: (u.role as string) ?? "",
      last_login_at: (u.last_login_at as string) ?? null,
      mfa_enabled: Boolean(u.mfa_enabled),
      is_active: Boolean(u.is_active),
    }));
  } catch {
    return [];
  }
}

export const USER_ROLE_LABELS: Record<string, string> = {
  director: "Dirigeant",
  engineer: "Ingénieur",
  admin: "Administrateur",
  assistant: "Assistant",
};
