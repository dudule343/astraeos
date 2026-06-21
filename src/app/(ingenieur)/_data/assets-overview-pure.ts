// Module PUR de la vue d'ensemble des assets. Types, données de repli (maquette
// v28) et builder pur. AUCUN import serveur. La page assets/ est un Server
// Component : elle peut importer le module serveur `assets.ts`, mais on garde le
// pur séparé pour les types et le repli, par cohérence avec les autres axes.

import type { AssetClass, StudyFeeRow, SubscriptionRow } from "./assets-pure";

export type Trend = { period: string; value: string; dir: "up" | "down" };

export type SyntheseKpi = {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  trends: Trend[];
};

export type AxisStat = { label: string; value: string };

export type AxisCard = {
  href: string;
  title: string;
  titleLine2?: string;
  icon: "finance" | "shield" | "business" | "doc";
  value: string;
  valueUnit: string;
  caption: string;
  stats: AxisStat[];
};

export type AssetsOverview = {
  hero: {
    eyebrow: string;
    titleLead: string;
    titleStrong: string;
    sub: string;
  };
  syntheseHeader: { eyebrow: string; right: string };
  repartitionHeader: { eyebrow: string; right: string };
  synthese: SyntheseKpi[];
  axes: AxisCard[];
};

const HERO = {
  eyebrow: "Assets du portefeuille · vue d'ensemble personnelle",
  titleLead: "Assets ",
  titleStrong: "du portefeuille",
  sub: "Vue consolidée des assets placés via votre portefeuille personnel · patrimoine sous gestion, contrats actifs, clients servis. Cliquez sur un axe pour ouvrir le détail.",
};

const SYNTHESE_HEADER = { eyebrow: "Synthèse", right: "Mon portefeuille · 2026" };
const REPARTITION_HEADER = {
  eyebrow: "Répartition par axe",
  right: "cliquez sur un axe pour le détail",
};

/** Données de repli : maquette v28 (rendu identique sans base / base vide). */
export const FALLBACK_OVERVIEW: AssetsOverview = {
  hero: HERO,
  syntheseHeader: SYNTHESE_HEADER,
  repartitionHeader: REPARTITION_HEADER,
  synthese: [
    {
      label: "Patrimoine sous gestion",
      value: "2 100 000",
      unit: "€",
      meta: "cumul placé via votre portefeuille",
      trends: [
        { period: "M-1", value: "+2,3 %", dir: "up" },
        { period: "T-1", value: "+6,8 %", dir: "up" },
        { period: "N-1", value: "+18 %", dir: "up" },
      ],
    },
    {
      label: "Contrats actifs",
      value: "22",
      meta: "11 financiers · 9 assurance · 2 suivis en conseil",
      trends: [
        { period: "M-1", value: "+2", dir: "up" },
        { period: "T-1", value: "+4", dir: "up" },
        { period: "N-1", value: "+6", dir: "up" },
      ],
    },
    {
      label: "Clients servis",
      value: "7",
      meta: "clients en cours de suivi (honoraires)",
      trends: [
        { period: "M-1", value: "+1", dir: "up" },
        { period: "T-1", value: "+1", dir: "up" },
        { period: "N-1", value: "+2", dir: "up" },
      ],
    },
  ],
  axes: [
    {
      href: "/espace-ingenieur/assets-financier",
      title: "Investissement",
      titleLine2: "financier",
      icon: "finance",
      value: "1 720 000",
      valueUnit: "€",
      caption: "Encours sous gestion",
      stats: [
        { label: "Contrats", value: "11" },
        { label: "Clients", value: "6 / 7" },
      ],
    },
    {
      href: "/espace-ingenieur/assets-assurance",
      title: "Assurance",
      titleLine2: " ",
      icon: "shield",
      value: "9",
      valueUnit: "contrats",
      caption: "Tous types confondus",
      stats: [
        { label: "Clients", value: "5 / 7" },
        { label: "Frais", value: "8 400 €" },
      ],
    },
    {
      href: "/espace-ingenieur/assets-immobilier",
      title: "Investissement",
      titleLine2: "immobilier",
      icon: "business",
      value: "2",
      valueUnit: "projets",
      caption: "Montant cumulé · 180 000 €",
      stats: [
        { label: "Clients", value: "2 / 7" },
        { label: "Ticket", value: "90 000 €" },
      ],
    },
    {
      href: "/espace-ingenieur/assets-honoraires",
      title: "Honoraires",
      titleLine2: "de conseil",
      icon: "doc",
      value: "48 800",
      valueUnit: "€",
      caption: "Honoraires facturés · 2026",
      stats: [
        { label: "Études", value: "4" },
        { label: "Moyen", value: "12 200 €" },
      ],
    },
  ],
};

type OverviewInput = {
  byClass: Map<AssetClass, SubscriptionRow[]>;
  studyFees: StudyFeeRow[];
  formatAmount: (n: number) => string;
};

/** Construit la vue d'ensemble depuis les agrégats réels. Builder PUR. */
export function buildOverview({ byClass, studyFees, formatAmount }: OverviewInput): AssetsOverview {
  const fin = byClass.get("financier") ?? [];
  const ass = byClass.get("assurance") ?? [];
  const immo = byClass.get("immobilier") ?? [];

  const allActive = [...fin, ...ass, ...immo, ...(byClass.get("autre") ?? [])];
  const aumTotal = allActive.reduce((a, s) => a + s.amountInitial, 0);
  const contractsTotal = allActive.length;

  const clientIds = new Set<string>();
  for (const s of allActive) clientIds.add(s.clientId);
  for (const f of studyFees) clientIds.add(f.clientId);

  const finAum = fin.reduce((a, s) => a + s.amountInitial, 0);
  const finClients = new Set(fin.map((s) => s.clientId)).size;
  const assClients = new Set(ass.map((s) => s.clientId)).size;
  const immoAmount = immo.reduce((a, s) => a + s.amountInitial, 0);
  const immoClients = new Set(immo.map((s) => s.clientId)).size;
  const immoTicket = immo.length > 0 ? Math.round(immoAmount / immo.length) : 0;

  const honoTotal = studyFees.reduce((a, f) => a + f.amountEur, 0);
  const honoCount = studyFees.length;
  const honoAvg = honoCount > 0 ? Math.round(honoTotal / honoCount) : 0;

  const synthese: SyntheseKpi[] = [
    {
      label: "Patrimoine sous gestion",
      value: formatAmount(aumTotal),
      unit: "€",
      meta: "cumul placé via votre portefeuille",
      trends: FALLBACK_OVERVIEW.synthese[0].trends,
    },
    {
      label: "Contrats actifs",
      value: String(contractsTotal),
      meta: `${fin.length} financiers · ${ass.length} assurance · ${immo.length} immobilier`,
      trends: FALLBACK_OVERVIEW.synthese[1].trends,
    },
    {
      label: "Clients servis",
      value: String(clientIds.size),
      meta: "clients en cours de suivi (honoraires)",
      trends: FALLBACK_OVERVIEW.synthese[2].trends,
    },
  ];

  const axes: AxisCard[] = [
    {
      href: "/espace-ingenieur/assets-financier",
      title: "Investissement",
      titleLine2: "financier",
      icon: "finance",
      value: formatAmount(finAum),
      valueUnit: "€",
      caption: "Encours sous gestion",
      stats: [
        { label: "Contrats", value: String(fin.length) },
        { label: "Clients", value: String(finClients) },
      ],
    },
    {
      href: "/espace-ingenieur/assets-assurance",
      title: "Assurance",
      titleLine2: " ",
      icon: "shield",
      value: String(ass.length),
      valueUnit: "contrats",
      caption: "Tous types confondus",
      stats: [
        { label: "Clients", value: String(assClients) },
        { label: "Frais", value: "—" },
      ],
    },
    {
      href: "/espace-ingenieur/assets-immobilier",
      title: "Investissement",
      titleLine2: "immobilier",
      icon: "business",
      value: String(immo.length),
      valueUnit: "projets",
      caption: `Montant cumulé · ${formatAmount(immoAmount)} €`,
      stats: [
        { label: "Clients", value: String(immoClients) },
        { label: "Ticket", value: `${formatAmount(immoTicket)} €` },
      ],
    },
    {
      href: "/espace-ingenieur/assets-honoraires",
      title: "Honoraires",
      titleLine2: "de conseil",
      icon: "doc",
      value: formatAmount(honoTotal),
      valueUnit: "€",
      caption: "Honoraires facturés",
      stats: [
        { label: "Études", value: String(honoCount) },
        { label: "Moyen", value: `${formatAmount(honoAvg)} €` },
      ],
    },
  ];

  return {
    hero: HERO,
    syntheseHeader: SYNTHESE_HEADER,
    repartitionHeader: REPARTITION_HEADER,
    synthese,
    axes,
  };
}
