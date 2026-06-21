// Module PUR de l'axe « Investissement immobilier ». Types, données de repli
// (maquette v28), builders purs (écran + CSV). AUCUN import serveur : importable
// par les composants `"use client"` (ProjectsTable, ExportImmoButton).

import {
  ASSET_CLASS_OF,
  formatDateFr,
  formatEurosFr,
  isActiveSubscription,
  toCsv,
  type SubscriptionRow,
} from "./assets-pure";

export type KpiCompareCell = {
  period: string;
  value: string;
  direction: "up" | "down";
};

export type AssetsImmoKpi = {
  label: string;
  value: string;
  unit?: string;
  valueTone?: "gold";
  meta: string;
  compare: KpiCompareCell[];
};

export type ImmoProjectRow = {
  clientId: string;
  initials: string;
  clientName: string;
  types: string[];
  initiationDates: string[];
  deliveryDates: string[];
  projectsTotal: number;
  delay: string;
};

export type ImmoProjectsTotal = {
  clientsLabel: string;
  projectsTotal: number;
  delayAverage: string;
};

export type ProgramBreakdown = {
  count: number;
  label: string;
  share?: string;
  muted?: boolean;
};

export type AssetsImmoScreen = {
  kpis: AssetsImmoKpi[];
  projects: ImmoProjectRow[];
  projectsTotal: ImmoProjectsTotal;
  breakdown: ProgramBreakdown[];
};

const FALLBACK_KPIS: AssetsImmoKpi[] = [
  {
    label: "Montant des investissements immobiliers traités",
    value: "180 000",
    unit: "€",
    valueTone: "gold",
    meta: "cumul 2026 · projets réalisés",
    compare: [
      { period: "M-1", value: "+90 000 €", direction: "up" },
      { period: "T-1", value: "+24 %", direction: "up" },
      { period: "N-1", value: "+32 %", direction: "up" },
    ],
  },
  {
    label: "Projets réalisés",
    value: "2",
    meta: "2 clients concernés sur 7",
    compare: [
      { period: "M-1", value: "+1", direction: "up" },
      { period: "T-1", value: "+1", direction: "up" },
      { period: "N-1", value: "-1", direction: "down" },
    ],
  },
  {
    label: "Ticket moyen par projet",
    value: "90 000",
    unit: "€",
    meta: "moyenne du portefeuille",
    compare: [
      { period: "M-1", value: "+8 %", direction: "up" },
      { period: "T-1", value: "+12 %", direction: "up" },
      { period: "N-1", value: "+22 %", direction: "up" },
    ],
  },
];

const FALLBACK_PROJECTS: ImmoProjectRow[] = [
  {
    clientId: "dupont-topin",
    initials: "BD",
    clientName: "Bertrand & Monique DUPONT-TOPIN",
    types: ["LMNP résidence services", "Location nue"],
    initiationDates: ["15/09/2025", "04/02/2026"],
    deliveryDates: ["22/03/2026", "en cours"],
    projectsTotal: 2,
    delay: "188 jours",
  },
  {
    clientId: "lamoureux",
    initials: "PL",
    clientName: "Pierre LAMOUREUX",
    types: ["Projet Denormandie"],
    initiationDates: ["02/06/2025"],
    deliveryDates: ["18/12/2025"],
    projectsTotal: 1,
    delay: "199 jours",
  },
];

const FALLBACK_TOTAL: ImmoProjectsTotal = {
  clientsLabel: "2 clients sur 7",
  projectsTotal: 3,
  delayAverage: "194 j moy.",
};

const FALLBACK_BREAKDOWN: ProgramBreakdown[] = [
  { count: 1, label: "LMNP résidence services", share: "50 % du portefeuille" },
  { count: 1, label: "Projet Denormandie", share: "50 % du portefeuille" },
  { count: 0, label: "Ancien rénové", muted: true },
  { count: 0, label: "Location nue", muted: true },
];

/** Données de repli : maquette v28 (rendu identique sans base / base vide). */
export const FALLBACK_IMMO: AssetsImmoScreen = {
  kpis: FALLBACK_KPIS,
  projects: FALLBACK_PROJECTS,
  projectsTotal: FALLBACK_TOTAL,
  breakdown: FALLBACK_BREAKDOWN,
};

/** Garde les souscriptions actives de classe « immobilier » (SCPI, OPCI…). */
export function immoSubscriptions(subs: SubscriptionRow[]): SubscriptionRow[] {
  return subs.filter(
    (s) => isActiveSubscription(s) && ASSET_CLASS_OF[s.produitCategory] === "immobilier",
  );
}

/** Construit l'écran « immobilier » depuis les souscriptions réelles. Builder PUR. */
export function buildImmoScreen(subs: SubscriptionRow[]): AssetsImmoScreen {
  const immo = immoSubscriptions(subs);

  const byClient = new Map<string, SubscriptionRow[]>();
  for (const s of immo) {
    const arr = byClient.get(s.clientId) ?? [];
    arr.push(s);
    byClient.set(s.clientId, arr);
  }

  const projects: ImmoProjectRow[] = [...byClient.entries()].map(([clientId, rows]) => ({
    clientId,
    initials: rows[0].initials,
    clientName: rows[0].clientName,
    types: rows.map((s) => s.produitName ?? "Investissement immobilier"),
    initiationDates: rows.map((s) => formatDateFr(s.subscriptionDate)),
    deliveryDates: rows.map(() => "—"),
    projectsTotal: rows.length,
    delay: "—",
  }));

  const totalAmount = immo.reduce((a, s) => a + s.amountInitial, 0);
  const projectsTotal = immo.length;
  const ticket = projectsTotal > 0 ? Math.round(totalAmount / projectsTotal) : 0;

  const kpis: AssetsImmoKpi[] = [
    {
      label: "Montant des investissements immobiliers traités",
      value: formatEurosFr(totalAmount).replace(" €", ""),
      unit: "€",
      valueTone: "gold",
      meta: "cumul · projets réalisés",
      compare: FALLBACK_KPIS[0].compare,
    },
    {
      label: "Projets réalisés",
      value: String(projectsTotal),
      meta: `${projects.length} client${projects.length > 1 ? "s" : ""} concerné${projects.length > 1 ? "s" : ""}`,
      compare: FALLBACK_KPIS[1].compare,
    },
    {
      label: "Ticket moyen par projet",
      value: formatEurosFr(ticket).replace(" €", ""),
      unit: "€",
      meta: "moyenne du portefeuille",
      compare: FALLBACK_KPIS[2].compare,
    },
  ];

  const byProduct = new Map<string, number>();
  for (const s of immo) {
    const label = s.produitName ?? "Investissement immobilier";
    byProduct.set(label, (byProduct.get(label) ?? 0) + 1);
  }
  const breakdown: ProgramBreakdown[] = [...byProduct.entries()].map(([label, count]) => ({
    count,
    label,
    share:
      projectsTotal > 0 ? `${Math.round((count / projectsTotal) * 100)} % du portefeuille` : undefined,
  }));

  return {
    kpis,
    projects,
    projectsTotal: {
      clientsLabel: `${projects.length} client${projects.length > 1 ? "s" : ""}`,
      projectsTotal,
      delayAverage: "—",
    },
    breakdown,
  };
}

/**
 * CSV du détail des projets immobiliers (source = screen). Une ligne par projet
 * + ligne de total. Helper PUR, consommé par le bouton d'export.
 */
export function buildImmoCsv(screen: AssetsImmoScreen): string {
  const header = [
    "Client",
    "Types",
    "Dates d'initiation",
    "Dates de livraison",
    "Projets total",
    "Délai",
  ];
  const rows = screen.projects.map((p) => [
    p.clientName,
    p.types.join(" / "),
    p.initiationDates.join(" / "),
    p.deliveryDates.join(" / "),
    String(p.projectsTotal),
    p.delay,
  ]);
  const total = [
    "Total portefeuille",
    screen.projectsTotal.clientsLabel,
    "",
    "",
    String(screen.projectsTotal.projectsTotal),
    screen.projectsTotal.delayAverage,
  ];
  return toCsv([header, ...rows, total]);
}
