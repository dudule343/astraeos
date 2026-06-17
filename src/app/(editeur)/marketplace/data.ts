import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Catalogue des packs (/marketplace) — données réelles.
//
// La maquette mélange deux concepts qui n'ont pas le même support en base :
//   1. Un CATALOGUE d'offres (cartes) → table `produits` (filtrée tenant).
//      Réel : name, category, partner_name, status, recurring_management_fee,
//      min_ticket. Le schéma n'a AUCUN champ description/bullets/prix formaté
//      "87 €/mois" → ces blocs passent en état vide honnête (pas d'invention).
//   2. Des STATS DE VENTES (KPIs + classement) → table `souscriptions`
//      jointe `produits`, filtrée tenant. Réel : amount_initial,
//      amount_recurring_monthly, subscription_date, status, produit.name.
//
// "▲ +14 % vs M-1" : pas d'historique mensuel snapshoté en base → supprimé.
// "cumul depuis janvier 2026" : remplacé par la vraie borne MIN(subscription_date).
// Dégrade proprement (try/catch → EMPTY) si une table/donnée manque.
// =========================================================================

const PRODUIT_CATEGORY_LABELS: Record<string, string> = {
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

// Icône par catégorie (purement décoratif, dérivé d'une vraie valeur en base).
const PRODUIT_CATEGORY_ICONS: Record<string, string> = {
  av_multisupport: "📈",
  av_lux: "🌐",
  per: "🏦",
  scpi: "🏢",
  fpci: "💼",
  opci: "🏬",
  structure: "🧩",
  prevoyance: "🛡️",
  credit: "🏛️",
  autre: "📦",
};

// Modèle tarifaire dérivé des champs réels du produit (pas de table de pricing).
//   - recurring_management_fee > 0      → "Récurrent"
//   - partner_name présent, pas de frais → "Mise en relation"
//   - sinon                             → "Paiement unique"
export type PricingModel = "recurrent" | "partner" | "unique";

export const PRICING_TAGS: Record<PricingModel, { label: string; cls: string }> = {
  recurrent: { label: "Récurrent", cls: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
  partner: { label: "Mise en relation", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" },
  unique: { label: "Paiement unique", cls: "bg-[#E5DCEB] text-[#5B3A6E]" },
};

export type PackCard = {
  id: string;
  name: string;
  categoryLabel: string;
  icon: string;
  pricing: PricingModel;
  partnerName: string | null;
  minTicket: number | null;
  recurringFee: number | null;
};

export type RankingRow = {
  produitId: string;
  num: number;
  name: string;
  categoryLabel: string;
  subs: number;
  recurringMonthly: number;
  ca: number;
  pct: number;
};

export type CategoryTab = { key: string; label: string; count: number };

export type Marketplace = {
  // KPI 1 — revenus récurrents (Σ amount_recurring_monthly des souscriptions actives)
  recurringMonthly: number;
  // KPI 2 — revenus unitaires ce mois (Σ amount_initial sur subscription_date >= début du mois)
  unitRevenueThisMonth: number;
  unitCountThisMonth: number;
  // KPI 3 — pack le plus souscrit
  topPackName: string | null;
  topPackSubs: number;
  // Classement
  ranking: RankingRow[];
  rankingTotal: number;
  rankingFirstDate: string | null;
  // Catalogue
  packs: PackCard[];
  tabs: CategoryTab[];
  packsCount: number;
  hasData: boolean;
};

const EMPTY: Marketplace = {
  recurringMonthly: 0,
  unitRevenueThisMonth: 0,
  unitCountThisMonth: 0,
  topPackName: null,
  topPackSubs: 0,
  ranking: [],
  rankingTotal: 0,
  rankingFirstDate: null,
  packs: [],
  tabs: [],
  packsCount: 0,
  hasData: false,
};

type ProduitRow = {
  id: string;
  name: string | null;
  category: string | null;
  partner_name: string | null;
  status: string | null;
  recurring_management_fee: number | string | null;
  min_ticket: number | string | null;
};

type SubProduitEmbed = { name?: string | null; category?: string | null };
type SubRow = {
  produit_id: string | null;
  amount_initial: number | string | null;
  amount_recurring_monthly: number | string | null;
  subscription_date: string | null;
  status: string | null;
  produits?: SubProduitEmbed | SubProduitEmbed[] | null;
};

const ACTIVE_LIKE = new Set(["active", "signed"]);

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pricingOf(p: ProduitRow): PricingModel {
  if (num(p.recurring_management_fee) > 0) return "recurrent";
  if (p.partner_name && num(p.recurring_management_fee) === 0) return "partner";
  return "unique";
}

function embedOf(row: SubRow): SubProduitEmbed | null {
  const p = Array.isArray(row.produits) ? row.produits[0] : row.produits;
  return p ?? null;
}

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export async function fetchMarketplace(): Promise<Marketplace> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    // --- Catalogue : produits non archivés du tenant ---
    const { data: produitsRaw } = await supabase
      .from("produits")
      .select("id, name, category, partner_name, status, recurring_management_fee, min_ticket")
      .eq("tenant_id", ctx.tenantId)
      .neq("status", "archived")
      .order("name");

    const produits = (produitsRaw ?? []) as ProduitRow[];

    const packs: PackCard[] = produits.map((p) => {
      const cat = p.category ?? "autre";
      return {
        id: p.id,
        name: p.name ?? "—",
        categoryLabel: PRODUIT_CATEGORY_LABELS[cat] ?? cat,
        icon: PRODUIT_CATEGORY_ICONS[cat] ?? "📦",
        pricing: pricingOf(p),
        partnerName: p.partner_name ?? null,
        minTicket: p.min_ticket != null ? num(p.min_ticket) : null,
        recurringFee: p.recurring_management_fee != null ? num(p.recurring_management_fee) : null,
      };
    });

    // Onglets catégories — compteurs réels par modèle tarifaire dérivé.
    const tabCounts = { recurrent: 0, partner: 0, unique: 0 };
    for (const p of packs) tabCounts[p.pricing] += 1;
    const tabs: CategoryTab[] = [
      { key: "all", label: "Tous les packs", count: packs.length },
      { key: "recurrent", label: "Récurrents", count: tabCounts.recurrent },
      { key: "partner", label: "Mise en relation", count: tabCounts.partner },
      { key: "unique", label: "Paiements uniques", count: tabCounts.unique },
    ];

    // --- Ventes : souscriptions du tenant jointes au produit ---
    const { data: subsRaw } = await supabase
      .from("souscriptions")
      .select(
        "produit_id, amount_initial, amount_recurring_monthly, subscription_date, status, produits(name, category)",
      )
      .eq("tenant_id", ctx.tenantId);

    const subs = (subsRaw ?? []) as SubRow[];

    // KPI 1 — Σ récurrent mensuel sur souscriptions actives/signées.
    let recurringMonthly = 0;
    for (const s of subs) {
      if (ACTIVE_LIKE.has(s.status ?? "")) recurringMonthly += num(s.amount_recurring_monthly);
    }

    // KPI 2 — revenus unitaires ce mois (Σ amount_initial sur subscription_date >= début mois).
    const monthStart = startOfMonthISO();
    let unitRevenueThisMonth = 0;
    let unitCountThisMonth = 0;
    for (const s of subs) {
      if (s.subscription_date && s.subscription_date >= monthStart) {
        unitRevenueThisMonth += num(s.amount_initial);
        unitCountThisMonth += 1;
      }
    }

    // Agrégation par produit (classement + KPI 3).
    type Agg = { name: string; categoryLabel: string; subs: number; ca: number; recurring: number };
    const byProduit = new Map<string, Agg>();
    let firstDate: string | null = null;
    for (const s of subs) {
      if (s.subscription_date && (firstDate === null || s.subscription_date < firstDate)) {
        firstDate = s.subscription_date;
      }
      if (!s.produit_id) continue;
      const embed = embedOf(s);
      const cat = embed?.category ?? "autre";
      const entry =
        byProduit.get(s.produit_id) ??
        {
          name: embed?.name ?? "—",
          categoryLabel: PRODUIT_CATEGORY_LABELS[cat] ?? cat,
          subs: 0,
          ca: 0,
          recurring: 0,
        };
      entry.subs += 1;
      entry.ca += num(s.amount_initial);
      if (ACTIVE_LIKE.has(s.status ?? "")) entry.recurring += num(s.amount_recurring_monthly);
      byProduit.set(s.produit_id, entry);
    }

    const aggList = [...byProduit.entries()].map(([produitId, a]) => ({ produitId, ...a }));
    const rankingTotal = aggList.reduce((acc, a) => acc + a.ca, 0);

    const ranking: RankingRow[] = aggList
      .sort((a, b) => b.ca - a.ca)
      .map((a, i) => ({
        produitId: a.produitId,
        num: i + 1,
        name: a.name,
        categoryLabel: a.categoryLabel,
        subs: a.subs,
        recurringMonthly: a.recurring,
        ca: a.ca,
        pct: rankingTotal > 0 ? Math.round((a.ca / rankingTotal) * 1000) / 10 : 0,
      }));

    // KPI 3 — pack le plus souscrit (max subs).
    const topByCount = aggList.slice().sort((a, b) => b.subs - a.subs)[0] ?? null;

    return {
      recurringMonthly,
      unitRevenueThisMonth,
      unitCountThisMonth,
      topPackName: topByCount ? topByCount.name : null,
      topPackSubs: topByCount ? topByCount.subs : 0,
      ranking,
      rankingTotal,
      rankingFirstDate: firstDate,
      packs,
      tabs,
      packsCount: packs.length,
      hasData: packs.length > 0 || subs.length > 0,
    };
  } catch {
    return EMPTY;
  }
}

// ---------------------------------------------------------------------------
// Formatage
// ---------------------------------------------------------------------------

export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

/** Valeur d'un KpiCard : nombre brut sans symbole (l'unité € est portée à part). */
export function fmtKpiValue(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return Math.round(n).toLocaleString("fr-FR");
}

/** Libellé "depuis {mois année}" dérivé de la vraie première souscription. */
export function fmtSinceMonth(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  } catch {
    return null;
  }
}
