// Assets du portefeuille · Assurance.
//
// Données d'exemple reprises À L'IDENTIQUE de la maquette
// (0 - 030_Wireframes_Ingenieur_v28.html, page-ing-assets-assurance) : c'est
// « comme si un ingénieur avait saisi ses contrats à la main ». Source unique de
// la page : aucune valeur en dur dans le composant. Les chiffres de synthèse
// (KPIs, totaux, top produits) sont dérivés de ces lignes, jamais ressaisis.

export type AssuranceComparePeriod = {
  period: string; // "S-1", "M-1", "N-1"
  delta: string; // "=", "+1", "+200 €", "+18 %"...
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
  /** Lien vers la fiche client (route clients/[id]). Maquette : la LIGNE entière
   *  navigue vers `goToPage('ing-fiche-client')`. */
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
    clientsLabel: string; // "5 clients sur 7"
    fees: string;
  };
  topProducts: AssuranceTopProduct[];
};

const DATA: AssetsAssurance = {
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

export function getAssetsAssurance(): AssetsAssurance {
  return DATA;
}
