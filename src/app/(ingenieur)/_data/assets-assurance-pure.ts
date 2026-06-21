// Module PUR de l'axe « Assurance ». Types, libellés, données de repli (maquette
// v28) et builders purs (écran + CSV). AUCUN import serveur : importable par les
// composants `"use client"` (ContratsAssuranceTable, ExportAssuranceButton).

import {
  ASSET_CLASS_OF,
  formatDateFr,
  isActiveSubscription,
  PRODUIT_CATEGORY_LABELS,
  toCsv,
  type SubscriptionRow,
} from "./assets-pure";

export type AssuranceComparePeriod = {
  period: string;
  delta: string;
  dir: "up" | "down";
};

export type AssuranceKpi = {
  label: string;
  value: string;
  unit?: string;
  goldValue?: boolean;
  meta: string;
  compare: AssuranceComparePeriod[];
};

export type AssuranceContract = { label: string; date: string };

export type AssuranceClient = {
  clientId: string;
  initials: string;
  name: string;
  contracts: AssuranceContract[];
  fees: string;
  /** Lien vers la fiche client (route clients/[id]). */
  ficheHref: string;
};

export type AssuranceTopProduct = {
  product: string;
  contracts: number;
  fees: string;
  goldCount?: boolean;
};

export type AssetsAssurance = {
  kpis: AssuranceKpi[];
  clients: AssuranceClient[];
  total: {
    contracts: number;
    clientsLabel: string;
    fees: string;
  };
  topProducts: AssuranceTopProduct[];
};

/** Données de repli : maquette v28 (rendu identique sans base / base vide). */
export const FALLBACK_ASSURANCE: AssetsAssurance = {
  kpis: [
    {
      label: "Contrats actifs",
      value: "9",
      goldValue: true,
      meta: "tous types confondus · portefeuille",
      compare: [
        { period: "S-1", delta: "=", dir: "up" },
        { period: "M-1", delta: "+1", dir: "up" },
        { period: "N-1", delta: "+3", dir: "up" },
      ],
    },
    {
      label: "Clients concernés",
      value: "5",
      unit: "/ 7",
      meta: "clients du portefeuille avec assurance",
      compare: [
        { period: "S-1", delta: "=", dir: "up" },
        { period: "M-1", delta: "+1", dir: "up" },
        { period: "N-1", delta: "+2", dir: "up" },
      ],
    },
    {
      label: "Frais de dossier appliqués au client",
      value: "8 400",
      unit: "€",
      meta: "cumul 2026 · facturés directement par vous",
      compare: [
        { period: "S-1", delta: "+200 €", dir: "up" },
        { period: "M-1", delta: "+1 200 €", dir: "up" },
        { period: "N-1", delta: "+18 %", dir: "up" },
      ],
    },
  ],
  clients: [
    {
      clientId: "dupont-topin",
      initials: "BD",
      name: "Bertrand & Monique DUPONT-TOPIN",
      contracts: [
        { label: "Mutuelle dirigeant", date: "18/03/2025" },
        { label: "Emprunteur immo", date: "15/10/2025" },
      ],
      fees: "2 400 €",
      ficheHref: "/espace-ingenieur/clients/dupont-topin",
    },
    {
      clientId: "huyghe",
      initials: "AH",
      name: "Albert & Cécile HUYGHE",
      contracts: [
        { label: "Prévoyance pro", date: "28/01/2025" },
        { label: "Mutuelle dirigeant", date: "14/06/2025" },
      ],
      fees: "1 800 €",
      ficheHref: "/espace-ingenieur/clients/huyghe",
    },
    {
      clientId: "groupe-lefebvre",
      initials: "GL",
      name: "SAS GROUPE LEFEBVRE",
      contracts: [
        { label: "Assurance pro", date: "15/04/2025" },
        { label: "Homme clé", date: "22/11/2025" },
      ],
      fees: "2 200 €",
      ficheHref: "/espace-ingenieur/clients/lefebvre-sas",
    },
    {
      clientId: "lamoureux",
      initials: "PL",
      name: "Pierre LAMOUREUX",
      contracts: [
        { label: "Prévoyance pro", date: "12/03/2024" },
        { label: "Mutuelle dirigeant", date: "08/09/2024" },
      ],
      fees: "1 400 €",
      ficheHref: "/espace-ingenieur/clients/lamoureux",
    },
    {
      clientId: "lacroix",
      initials: "ML",
      name: "Maître LACROIX",
      contracts: [{ label: "Prévoyance pro", date: "22/02/2024" }],
      fees: "600 €",
      ficheHref: "/espace-ingenieur/clients/lacroix",
    },
  ],
  total: {
    contracts: 9,
    clientsLabel: "5 clients sur 7",
    fees: "8 400 €",
  },
  topProducts: [
    { product: "Mutuelle dirigeant", contracts: 3, fees: "3 200 €", goldCount: true },
    { product: "Prévoyance pro", contracts: 3, fees: "2 600 €" },
    { product: "Emprunteur immobilier", contracts: 1, fees: "1 200 €" },
    { product: "Assurance pro", contracts: 1, fees: "800 €" },
    { product: "Homme clé", contracts: 1, fees: "600 €" },
  ],
};

/** Garde les souscriptions actives de classe « assurance ». */
export function assuranceSubscriptions(subs: SubscriptionRow[]): SubscriptionRow[] {
  return subs.filter(
    (s) => isActiveSubscription(s) && ASSET_CLASS_OF[s.produitCategory] === "assurance",
  );
}

/**
 * Construit l'écran « assurance » depuis les souscriptions réelles. Les frais de
 * dossier ne sont pas modélisés sur la souscription : on dérive ce que l'on
 * peut (contrats, clients, types), les frais affichent « — » faute de colonne.
 * Builder PUR.
 */
export function buildAssuranceScreen(subs: SubscriptionRow[]): AssetsAssurance {
  const ass = assuranceSubscriptions(subs);

  const byClient = new Map<string, SubscriptionRow[]>();
  for (const s of ass) {
    const arr = byClient.get(s.clientId) ?? [];
    arr.push(s);
    byClient.set(s.clientId, arr);
  }

  const clients: AssuranceClient[] = [...byClient.entries()].map(([clientId, rows]) => ({
    clientId,
    initials: rows[0].initials,
    name: rows[0].clientName,
    contracts: rows.map((s) => ({
      label: s.produitName ?? PRODUIT_CATEGORY_LABELS[s.produitCategory],
      date: formatDateFr(s.subscriptionDate),
    })),
    fees: "—",
    ficheHref: `/espace-ingenieur/clients/${clientId}`,
  }));

  const totalContracts = ass.length;

  const kpis: AssuranceKpi[] = [
    {
      label: "Contrats actifs",
      value: String(totalContracts),
      goldValue: true,
      meta: "tous types confondus · portefeuille",
      compare: FALLBACK_ASSURANCE.kpis[0].compare,
    },
    {
      label: "Clients concernés",
      value: String(clients.length),
      meta: "clients du portefeuille avec assurance",
      compare: FALLBACK_ASSURANCE.kpis[1].compare,
    },
    {
      label: "Frais de dossier appliqués au client",
      value: "—",
      meta: "non renseigné sur les souscriptions",
      compare: FALLBACK_ASSURANCE.kpis[2].compare,
    },
  ];

  const byProduct = new Map<string, number>();
  for (const s of ass) {
    const label = s.produitName ?? PRODUIT_CATEGORY_LABELS[s.produitCategory];
    byProduct.set(label, (byProduct.get(label) ?? 0) + 1);
  }
  const topProducts: AssuranceTopProduct[] = [...byProduct.entries()]
    .map(([product, contracts], i) => ({
      product,
      contracts,
      fees: "—",
      goldCount: i === 0,
    }))
    .sort((a, b) => b.contracts - a.contracts);

  return {
    kpis,
    clients,
    total: {
      contracts: totalContracts,
      clientsLabel: `${clients.length} client${clients.length > 1 ? "s" : ""}`,
      fees: "—",
    },
    topProducts,
  };
}

/**
 * CSV du détail des contrats d'assurance (source = data.clients). Une ligne par
 * contrat + ligne de total. Helper PUR, consommé par le bouton d'export.
 */
export function buildAssuranceCsv(data: AssetsAssurance): string {
  const header = [
    "Client",
    "Contrats actifs",
    "Type souscrit",
    "Date de souscription",
    "Frais de dossier perçus",
  ];
  const rows: string[][] = [];
  for (const c of data.clients) {
    c.contracts.forEach((ct, i) => {
      rows.push([
        c.name,
        i === 0 ? String(c.contracts.length) : "",
        ct.label,
        ct.date,
        i === 0 ? c.fees : "",
      ]);
    });
  }
  rows.push([
    "Total portefeuille",
    String(data.total.contracts),
    data.total.clientsLabel,
    "",
    data.total.fees,
  ]);
  return toCsv([header, ...rows]);
}
