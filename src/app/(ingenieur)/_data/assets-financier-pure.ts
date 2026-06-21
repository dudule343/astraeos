// Module PUR de l'axe « Investissement financier ». Types, libellés, données de
// repli (FALLBACK, maquette v28) et builders purs (écran + CSV). AUCUN import
// serveur : importable par les composants `"use client"` (PlacementsTable,
// bouton d'export). Le module serveur `assets-financier.ts` fournit getXxx().

import {
  ASSET_CLASS_OF,
  formatAmountFr,
  formatDateFr,
  formatEurosFr,
  isActiveSubscription,
  PRODUIT_CATEGORY_LABELS,
  toCsv,
  type ProduitCategory,
  type SubscriptionRow,
} from "./assets-pure";

export type CompareDirection = "up" | "down";

export type CompareCell = {
  period: string;
  value: string;
  direction: CompareDirection;
};

export type FinancierKpi = {
  label: string;
  value: string;
  unit?: string;
  valueGold?: boolean;
  meta: string;
  compare: CompareCell[];
};

export type FinancierContractType = {
  label: string;
};

export type FinancierClient = {
  initiales: string;
  nom: string;
  /** Slug d'URL vers la fiche client ingénieur (route clients/[id]). */
  slug: string;
  contratsActifs: number;
  types: FinancierContractType[];
  dates: string[];
  encoursTotal: string;
};

export type FinancierTotal = {
  contratsActifs: number;
  meta: string;
  encoursTotal: string;
};

export type TopProduct = {
  label: string;
  placements: string;
  encours: string;
};

export type AssetsFinancierScreen = {
  heroEyebrow: string;
  heroTitleLead: string;
  heroTitleStrong: string;
  heroSub: string;
  kpis: FinancierKpi[];
  placementsTitle: string;
  placementsCount: string;
  clients: FinancierClient[];
  total: FinancierTotal;
  topProductsTitle: string;
  topProducts: TopProduct[];
};

const HERO = {
  heroEyebrow: "Assets du portefeuille · investissement financier",
  heroTitleLead: "Investissement ",
  heroTitleStrong: "financier",
  heroSub:
    "Détail de votre portefeuille financier · contrats placés, encours porté, clients concernés.",
};

/** Données de repli : maquette v28 (rendu identique sans base / base vide). */
export const FALLBACK_FINANCIER: AssetsFinancierScreen = {
  ...HERO,
  kpis: [
    {
      label: "Encours sous gestion",
      value: "1 720 000",
      unit: "€",
      valueGold: true,
      meta: "cumul placé via votre portefeuille · 11 contrats actifs",
      compare: [
        { period: "S-1", value: "+0,4 %", direction: "up" },
        { period: "M-1", value: "+2,3 %", direction: "up" },
        { period: "N-1", value: "+18 %", direction: "up" },
      ],
    },
    {
      label: "Clients investissement financier",
      value: "6",
      unit: "/ 7",
      meta: "clients en portefeuille concernés",
      compare: [
        { period: "S-1", value: "=", direction: "up" },
        { period: "M-1", value: "+1", direction: "up" },
        { period: "N-1", value: "+2", direction: "up" },
      ],
    },
  ],
  placementsTitle: "Détail de mes placements en investissement financier",
  placementsCount: "11 contrats actifs · cliquez pour le détail client",
  clients: [
    {
      initiales: "BD",
      nom: "Bertrand & Monique DUPONT-TOPIN",
      slug: "dupont-topin",
      contratsActifs: 3,
      types: [
        { label: "Assurance vie luxembourgeoise" },
        { label: "Contrat de capitalisation" },
        { label: "PER" },
      ],
      dates: ["22/05/2025", "18/09/2025", "18/04/2026"],
      encoursTotal: "420 000 €",
    },
    {
      initiales: "AH",
      nom: "Albert & Cécile HUYGHE",
      slug: "huyghe",
      contratsActifs: 2,
      types: [
        { label: "Assurance vie luxembourgeoise" },
        { label: "Contrat de capitalisation" },
      ],
      dates: ["15/02/2025", "28/03/2026"],
      encoursTotal: "380 000 €",
    },
    {
      initiales: "GL",
      nom: "SAS GROUPE LEFEBVRE",
      slug: "lefebvre-sas",
      contratsActifs: 2,
      types: [{ label: "Contrat de capitalisation" }, { label: "Compte-titres" }],
      dates: ["10/06/2025", "12/02/2026"],
      encoursTotal: "340 000 €",
    },
    {
      initiales: "MB",
      nom: "Maître BONNARD",
      slug: "bonnard",
      contratsActifs: 2,
      types: [{ label: "Assurance vie française" }, { label: "PEA" }],
      dates: ["18/04/2025", "22/01/2026"],
      encoursTotal: "280 000 €",
    },
    {
      initiales: "PL",
      nom: "Pierre LAMOUREUX",
      slug: "lamoureux",
      contratsActifs: 1,
      types: [{ label: "Assurance vie luxembourgeoise" }],
      dates: ["04/03/2024"],
      encoursTotal: "180 000 €",
    },
    {
      initiales: "ML",
      nom: "Maître LACROIX",
      slug: "lacroix",
      contratsActifs: 1,
      types: [{ label: "Assurance vie française" }],
      dates: ["12/01/2024"],
      encoursTotal: "120 000 €",
    },
  ],
  total: {
    contratsActifs: 11,
    meta: "6 clients sur 7 · cumul 2026",
    encoursTotal: "1 720 000 €",
  },
  topProductsTitle: "Top produits placés par l'ingénieur",
  topProducts: [
    { label: "Assurance vie luxembourgeoise", placements: "4", encours: "820 000 €" },
    { label: "Assurance vie française", placements: "3", encours: "480 000 €" },
    { label: "Contrat de capitalisation", placements: "2", encours: "240 000 €" },
    { label: "PEA Découverte", placements: "1", encours: "110 000 €" },
    { label: "PER Liberté", placements: "1", encours: "70 000 €" },
  ],
};

const FINANCIER_CATEGORIES = new Set<ProduitCategory>([
  "av_multisupport",
  "av_lux",
  "per",
  "fpci",
  "structure",
]);

/** Garde les souscriptions actives de classe « financier ». */
export function financierSubscriptions(subs: SubscriptionRow[]): SubscriptionRow[] {
  return subs.filter(
    (s) => isActiveSubscription(s) && ASSET_CLASS_OF[s.produitCategory] === "financier",
  );
}

/**
 * Construit l'écran « investissement financier » à partir des souscriptions
 * réelles de l'ingénieur. Builder PUR (testable sans base). Le module serveur
 * décide d'appeler ce builder ou de renvoyer FALLBACK_FINANCIER si vide.
 */
export function buildFinancierScreen(subs: SubscriptionRow[]): AssetsFinancierScreen {
  const fin = financierSubscriptions(subs);

  const byClient = new Map<string, SubscriptionRow[]>();
  for (const s of fin) {
    const arr = byClient.get(s.clientId) ?? [];
    arr.push(s);
    byClient.set(s.clientId, arr);
  }

  const clients: FinancierClient[] = [...byClient.entries()]
    .map(([clientId, rows]) => {
      const encours = rows.reduce((a, s) => a + s.amountInitial, 0);
      return {
        initiales: rows[0].initials,
        nom: rows[0].clientName,
        slug: clientId,
        contratsActifs: rows.length,
        types: rows.map((s) => ({
          label: s.produitName ?? PRODUIT_CATEGORY_LABELS[s.produitCategory],
        })),
        dates: rows.map((s) => formatDateFr(s.subscriptionDate)),
        encoursTotal: formatEurosFr(encours),
      } satisfies FinancierClient;
    })
    .sort(
      (a, b) =>
        parseEur(b.encoursTotal) - parseEur(a.encoursTotal) || b.contratsActifs - a.contratsActifs,
    );

  const encoursTotal = fin.reduce((a, s) => a + s.amountInitial, 0);
  const totalContrats = fin.length;

  const kpis: FinancierKpi[] = [
    {
      label: "Encours sous gestion",
      value: formatAmountFr(encoursTotal),
      unit: "€",
      valueGold: true,
      meta: `cumul placé via votre portefeuille · ${totalContrats} contrat${totalContrats > 1 ? "s" : ""} actif${totalContrats > 1 ? "s" : ""}`,
      compare: FALLBACK_FINANCIER.kpis[0].compare,
    },
    {
      label: "Clients investissement financier",
      value: String(clients.length),
      meta: "clients en portefeuille concernés",
      compare: FALLBACK_FINANCIER.kpis[1].compare,
    },
  ];

  // Top produits par catégorie réelle.
  const byCat = new Map<ProduitCategory, { count: number; encours: number }>();
  for (const s of fin) {
    const e = byCat.get(s.produitCategory) ?? { count: 0, encours: 0 };
    e.count += 1;
    e.encours += s.amountInitial;
    byCat.set(s.produitCategory, e);
  }
  const topProducts: TopProduct[] = [...byCat.entries()]
    .map(([cat, v]) => ({
      label: PRODUIT_CATEGORY_LABELS[cat],
      placements: String(v.count),
      encours: formatEurosFr(v.encours),
    }))
    .sort((a, b) => parseEur(b.encours) - parseEur(a.encours));

  return {
    ...HERO,
    kpis,
    placementsTitle: "Détail de mes placements en investissement financier",
    placementsCount: `${totalContrats} contrat${totalContrats > 1 ? "s" : ""} actif${totalContrats > 1 ? "s" : ""} · cliquez pour le détail client`,
    clients,
    total: {
      contratsActifs: totalContrats,
      meta: `${clients.length} client${clients.length > 1 ? "s" : ""} · cumul 2026`,
      encoursTotal: formatEurosFr(encoursTotal),
    },
    topProductsTitle: "Top produits placés par l'ingénieur",
    topProducts,
  };
}

function parseEur(s: string): number {
  const n = Number(s.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * CSV du détail des placements financiers (source = screen.clients). Une ligne
 * par contrat + ligne de total. Helper PUR, consommé par le bouton d'export.
 */
export function buildFinancierCsv(screen: AssetsFinancierScreen): string {
  const header = [
    "Client",
    "Contrats actifs",
    "Type souscrit",
    "Date de souscription",
    "Encours total",
  ];
  const rows: string[][] = [];
  for (const c of screen.clients) {
    c.types.forEach((t, i) => {
      rows.push([
        c.nom,
        i === 0 ? String(c.contratsActifs) : "",
        t.label,
        c.dates[i] ?? "",
        i === 0 ? c.encoursTotal : "",
      ]);
    });
  }
  rows.push([
    "Total portefeuille",
    String(screen.total.contratsActifs),
    screen.total.meta,
    "",
    screen.total.encoursTotal,
  ]);
  return toCsv([header, ...rows]);
}
