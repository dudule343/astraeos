// Données d'exemple de l'écran « Assets · investissement financier »
// (page-ing-assets-financier de la maquette v28), reprises à l'identique :
// mêmes clients, mêmes contrats, mêmes dates, mêmes encours, mêmes KPI.
// Source de vérité unique pour la page, comme si l'ingénieur Julien VASSEUR
// avait saisi ces souscriptions à la main. Aucune valeur n'est dupliquée en
// dur dans le composant : la page lit tout depuis ce module.

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

const SCREEN: AssetsFinancierScreen = {
  heroEyebrow: "Assets du portefeuille · investissement financier",
  heroTitleLead: "Investissement ",
  heroTitleStrong: "financier",
  heroSub:
    "Détail de votre portefeuille financier · contrats placés, encours porté, clients concernés.",

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
      types: [
        { label: "Contrat de capitalisation" },
        { label: "Compte-titres" },
      ],
      dates: ["10/06/2025", "12/02/2026"],
      encoursTotal: "340 000 €",
    },
    {
      initiales: "MB",
      nom: "Maître BONNARD",
      slug: "bonnard",
      contratsActifs: 2,
      types: [
        { label: "Assurance vie française" },
        { label: "PEA" },
      ],
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

export function getAssetsFinancierScreen(): AssetsFinancierScreen {
  return SCREEN;
}
