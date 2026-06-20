/**
 * Données d'exemple de l'écran « Assets · honoraires de conseil »
 * (id maquette : page-ing-assets-honoraires).
 *
 * Valeurs reprises telles quelles de la maquette
 * 0 - 030_Wireframes_Ingenieur_v28.html (lignes 17407+).
 * Source unique : la page lit depuis ce module, aucune valeur en dur dans le TSX.
 */

export type HonorairesKpi = {
  label: string;
  value: string;
  unit?: string;
  valueGold?: boolean;
  meta: string;
  compare: { period: "M-1" | "T-1" | "N-1"; value: string; dir: "up" | "down" }[];
};

export type EtudeMission = {
  /**
   * Identifiant du dossier d'étude. Cible de navigation de la ligne :
   * la fiche dossier (dossiers/[id], timeline du parcours), comme dans la
   * maquette où chaque ligne fait goToPage('ing-fiche-dossier').
   */
  dossierId: string;
  initials: string;
  client: string;
  entreeRelation: string;
  /** Une à trois lignes « type de conseil » (badges or). */
  typesConseil: string[];
  /** Dates de l'étude, alignées ligne à ligne avec typesConseil. */
  datesEtude: string[];
  honoraires: string;
};

export type RepartitionMission = {
  count: number;
  label: string;
  meta: string;
};

export const honorairesKpis: HonorairesKpi[] = [
  {
    label: "Études et missions réalisées",
    value: "4",
    valueGold: true,
    meta: "cumul 2026 · portefeuille",
    compare: [
      { period: "M-1", value: "+1", dir: "up" },
      { period: "T-1", value: "+2", dir: "up" },
      { period: "N-1", value: "+3", dir: "up" },
    ],
  },
  {
    label: "Honoraires HT facturés",
    value: "48 800",
    unit: "€",
    meta: "cumul 2026 · portefeuille",
    compare: [
      { period: "M-1", value: "+12 800 €", dir: "up" },
      { period: "T-1", value: "+18 %", dir: "up" },
      { period: "N-1", value: "+24 %", dir: "up" },
    ],
  },
  {
    label: "Honoraire moyen",
    value: "12 200",
    unit: "€",
    meta: "moyenne du portefeuille",
    compare: [
      { period: "M-1", value: "+8 %", dir: "up" },
      { period: "T-1", value: "+4 %", dir: "up" },
      { period: "N-1", value: "+6 %", dir: "up" },
    ],
  },
];

export const etudesMissions: EtudeMission[] = [
  {
    dossierId: "etu-2026-014",
    initials: "BD",
    client: "Bertrand & Monique DUPONT-TOPIN",
    entreeRelation: "15/03/2025",
    typesConseil: [
      "Étude patrimoniale",
      "Immatriculation de société",
      "Pacte d'associés",
    ],
    datesEtude: ["12/05/2026", "03/04/2026", "22/04/2026"],
    honoraires: "12 800 €",
  },
  {
    dossierId: "etu-2025-lamoureux",
    initials: "PL",
    client: "Pierre LAMOUREUX",
    entreeRelation: "04/03/2024",
    typesConseil: ["Étude patrimoniale", "Optimisation rémunération gérant"],
    datesEtude: ["22/05/2025", "14/09/2025"],
    honoraires: "14 200 €",
  },
  {
    dossierId: "etu-2026-huyghe",
    initials: "AH",
    client: "Albert & Cécile HUYGHE",
    entreeRelation: "22/01/2025",
    typesConseil: ["Étude patrimoniale"],
    datesEtude: ["14/04/2026"],
    honoraires: "10 800 €",
  },
  {
    dossierId: "etu-2025-lacroix",
    initials: "ML",
    client: "Maître LACROIX",
    entreeRelation: "12/01/2024",
    typesConseil: ["Étude patrimoniale"],
    datesEtude: ["28/02/2025"],
    honoraires: "11 000 €",
  },
];

export const honorairesTotal = {
  resume: "4 études réalisées · 4 clients sur 7",
  montant: "48 800 €",
};

export const repartitionMissions: RepartitionMission[] = [
  { count: 2, label: "Étude patrimoniale", meta: "50 % du portefeuille" },
  {
    count: 1,
    label: "Optimisation de la rémunération du gérant",
    meta: "25 % du portefeuille",
  },
  {
    count: 1,
    label: "Immatriculation de sociétés",
    meta: "25 % · statuts et / ou pacte d'associés",
  },
];
