// Module PUR partagé par tous les écrans « Assets du portefeuille » de l'espace
// ingénieur. AUCUN import serveur ici (next/headers, getSessionContext,
// createAdminClient, supabase/server) : ce fichier est importable par les
// composants `"use client"` (boutons d'export CSV, tableaux interactifs).
//
// Il porte : les types des lignes brutes lues en base (SubscriptionRow,
// StudyFeeRow), les mappings d'enums (catégorie produit → classe d'actifs,
// libellés FR), les prédicats purs (souscription active) et les helpers de
// formatage. Les fetchers Supabase vivent dans `assets-source.ts` (serveur).

/** Catégorie produit telle que stockée en base (enum produit_category). */
export type ProduitCategory =
  | "av_multisupport"
  | "av_lux"
  | "per"
  | "scpi"
  | "fpci"
  | "opci"
  | "structure"
  | "prevoyance"
  | "credit"
  | "autre";

/** Statut d'une souscription (enum souscription_status). */
export type SubscriptionStatus =
  | "pending_signature"
  | "signed"
  | "active"
  | "partial_redemption"
  | "closed";

/**
 * Une souscription du portefeuille de l'ingénieur, projetée depuis
 * `souscriptions ⨝ produits ⨝ clients ⨝ personnes`. Forme stable consommée par
 * les dérivations de chaque axe (financier, assurance, immobilier).
 */
export type SubscriptionRow = {
  id: string;
  clientId: string;
  /** Représentant principal (ou raison sociale) du foyer. */
  clientName: string;
  initials: string;
  amountInitial: number;
  subscriptionDate: string | null;
  status: SubscriptionStatus;
  produitName: string | null;
  produitCategory: ProduitCategory;
  partnerName: string | null;
};

/**
 * Une commission d'honoraires d'étude (commission_type = 'study_fee'), projetée
 * depuis `commissions ⨝ souscriptions ⨝ clients ⨝ personnes`. Sert l'axe
 * honoraires de conseil.
 */
export type StudyFeeRow = {
  id: string;
  clientId: string;
  clientName: string;
  initials: string;
  amountEur: number;
  /** Date de versement/échéance retenue pour l'affichage. */
  date: string | null;
};

/** Classe d'actifs de présentation (mêmes regroupements que le dirigeant). */
export type AssetClass = "financier" | "immobilier" | "assurance" | "autre";

/** Catégorie produit → classe d'actifs (identique à computeAumByAssetClass dirigeant). */
export const ASSET_CLASS_OF: Record<ProduitCategory, AssetClass> = {
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

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  financier: "Investissement financier",
  immobilier: "Investissement immobilier",
  assurance: "Assurance & prévoyance",
  autre: "Autre",
};

/** Libellés FR des catégories produit (alignés sur le dirigeant). */
export const PRODUIT_CATEGORY_LABELS: Record<ProduitCategory, string> = {
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

/** Statuts considérés « actifs » pour l'encours / les contrats actifs. */
const ACTIVE_STATUSES = new Set<SubscriptionStatus>(["signed", "active", "partial_redemption"]);

/** Une souscription compte dans le portefeuille si elle est signée/active. */
export function isActiveSubscription(s: SubscriptionRow): boolean {
  return ACTIVE_STATUSES.has(s.status);
}

/** Classe d'actifs d'une souscription. */
export function assetClassOf(s: SubscriptionRow): AssetClass {
  return ASSET_CLASS_OF[s.produitCategory] ?? "autre";
}

/** Initiales (prénom + nom, ou 2 premières lettres). */
export function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

/** Date ISO → « jj/mm/aaaa », ou « — » si nulle/invalide. */
export function formatDateFr(date: string | null | undefined): string {
  if (!date) return "—";
  const t = new Date(date);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Montant entier en euros au format FR (« 1 720 000 »), « 0 » si vide. */
export function formatAmountFr(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("fr-FR");
}

/** Montant en euros suffixé (« 1 720 000 € »). */
export function formatEurosFr(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

/** Échappe une cellule CSV (séparateur « ; »). Helper pur, réutilisé par les exports. */
export function csvEscape(v: string): string {
  return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Sérialise une matrice de cellules en CSV (séparateur « ; », CRLF). */
export function toCsv(rows: string[][]): string {
  return rows.map((cols) => cols.map(csvEscape).join(";")).join("\r\n");
}
