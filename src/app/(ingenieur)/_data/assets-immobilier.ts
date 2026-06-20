// Données d'exemple de l'écran « Assets · investissement immobilier » de l'espace
// ingénieur, reprises à l'identique de la maquette (page-ing-assets-immobilier).
// Source unique : la page lit ces constantes, aucune valeur n'est écrite en dur
// dans le composant. Ingénieur connecté : Julien VASSEUR.

export type KpiCompareCell = {
  period: string;
  value: string;
  direction: "up" | "down";
};

export type AssetsImmoKpi = {
  label: string;
  value: string;
  unit?: string;
  /** Classe de teinte de la valeur, telle que la maquette (« gold » ou rien). */
  valueTone?: "gold";
  meta: string;
  compare: KpiCompareCell[];
};

export const assetsImmoKpis: AssetsImmoKpi[] = [
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

export type ImmoProjectRow = {
  clientId: string;
  initials: string;
  clientName: string;
  /** Types de programme (un badge par entrée). */
  types: string[];
  /** Dates d'initiation (une ligne par projet). */
  initiationDates: string[];
  /** Dates de livraison (une ligne par projet, « en cours » possible). */
  deliveryDates: string[];
  projectsTotal: number;
  /** Délai affiché tel quel (ex. « 188 jours »). */
  delay: string;
};

export const immoProjects: ImmoProjectRow[] = [
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

export const immoProjectsTotal = {
  clientsLabel: "2 clients sur 7",
  projectsTotal: 3,
  delayAverage: "194 j moy.",
};

export type ProgramBreakdown = {
  count: number;
  label: string;
  /** Part du portefeuille (absente pour les types non encore présents). */
  share?: string;
  /** Catégorie inactive (0 projet), grisée comme dans la maquette. */
  muted?: boolean;
};

export const programBreakdown: ProgramBreakdown[] = [
  { count: 1, label: "LMNP résidence services", share: "50 % du portefeuille" },
  { count: 1, label: "Projet Denormandie", share: "50 % du portefeuille" },
  { count: 0, label: "Ancien rénové", muted: true },
  { count: 0, label: "Location nue", muted: true },
];
