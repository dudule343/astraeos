/**
 * Données d'exemple pour l'écran « Pipe 04 · Études en cours »
 * (maquette id="page-ing-pipe-04"). Valeurs reprises telles quelles de la
 * maquette : ce sont les exemples « comme si des clients avaient été saisis
 * à la main ». Source unique pour la page, aucune valeur en dur dans le TSX.
 */

export type StudyTypeKey =
  | "patrimoine"
  | "immo-direct"
  | "fin-direct"
  | "assurance"
  | "societe";

/** Bandeau parcours patrimonial à 6 étapes, étape 04 active. */
export type PipelineStep = {
  step: string;
  label: string;
  count: string;
  page: string;
  /** href React vers l'écran réel correspondant à l'étape. */
  href: string;
  active?: boolean;
};

export const pipelineSteps: PipelineStep[] = [
  { step: "01", label: "Prospects actifs", count: "187", page: "ing-pipe-01", href: "/espace-ingenieur/prospects" },
  { step: "02", label: "Conformité en cours", count: "18", page: "ing-pipe-02", href: "/espace-ingenieur/conformite" },
  { step: "03", label: "Collecte docs", count: "24", page: "ing-pipe-03", href: "/espace-ingenieur/collectes" },
  { step: "04", label: "Études en cours", count: "41", page: "ing-pipe-04", href: "/espace-ingenieur/etudes", active: true },
  { step: "05", label: "Études restituées", count: "28", page: "ing-pipe-05", href: "/espace-ingenieur/etudes-restituees" },
  { step: "06", label: "Clients en suivi", count: "142", page: "ing-pipe-06", href: "/espace-ingenieur/clients-suivi" },
];

export type EtudesKpi = {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  /** Couleur du chiffre (alerte) si besoin. */
  valueColor?: "orange" | "red";
};

export const etudesKpis: EtudesKpi[] = [
  { label: "Études en cours", value: "7", meta: "démarrées sur la période" },
  { label: "Restitution sous 30 jours", value: "4", meta: "livrables proches" },
  { label: "En retard", value: "2", meta: "dépassement délai contractuel", valueColor: "orange" },
  { label: "Délai moyen de réalisation", value: "32", unit: "jours", meta: "depuis l'étape 03" },
];

export type EtudesFilter = {
  label: string;
  count: string;
  active?: boolean;
  alert?: boolean;
};

export const etudesFilters: EtudesFilter[] = [
  { label: "Toutes", count: "41", active: true },
  { label: "Restitution sous 30 j", count: "22" },
  { label: "Études patrimoniales", count: "28" },
  { label: "Investissement immobilier direct", count: "8" },
  { label: "Investissement financier direct", count: "3" },
  { label: "Mise en place assurance direct", count: "2" },
  { label: "En retard", count: "3", alert: true },
];

export type EtudeRow = {
  id: string;
  /** Client : une ou deux lignes de nom (couple) + libellé de type. */
  clientNames: string[];
  clientType: string;
  /** Variante de ligne (couleur de fond) : couple / pm / seul. */
  rowVariant?: "couple" | "pm" | "seul";
  /** Style de fond ponctuel (ligne en retard surlignée). */
  rowHighlight?: string;
  /** Représentant pour une personne morale (sous le nom). */
  representant?: string;
  /** Ingénieur du cabinet (colonne 2). */
  cabinetName: string;
  cabinetMeta: string;
  /** Ingénieur patrimonial (colonne 3, avatar). */
  patrimonialInitials: string;
  patrimonialName: string;
  studyType: StudyTypeKey;
  studyLabel: string;
  startDate: string;
  restitDate: string;
  restitMeta: string;
  restitAlert?: boolean;
  restitMetaAlert?: boolean;
  progressPct: number;
  progressLabel: string;
  progressAlert?: boolean;
  /** Action : œil (consulter) ou alerte (en retard). */
  actionIcon: "eye" | "alert";
};

export const etudesRows: EtudeRow[] = [
  {
    id: "dupont-topin",
    clientNames: ["Bertrand DUPONT", "Monique TOPIN"],
    clientType: "Couple",
    rowVariant: "couple",
    cabinetName: "Luc THILLIEZ",
    cabinetMeta: "Dirigeant-praticien",
    patrimonialInitials: "JV",
    patrimonialName: "Julien VASSEUR",
    studyType: "patrimoine",
    studyLabel: "Étude patrimoniale",
    startDate: "04/05/2026",
    restitDate: "10/06/2026",
    restitMeta: "Dans 32 jours",
    progressPct: 25,
    progressLabel: "Phase 1/4 · analyse des documents",
    actionIcon: "eye",
  },
  {
    id: "moreau",
    clientNames: ["Stéphane MOREAU"],
    clientType: "Personne seule",
    cabinetName: "Julien VASSEUR",
    cabinetMeta: "Senior · 8 ans",
    patrimonialInitials: "RB",
    patrimonialName: "Romain BERTHIER",
    studyType: "immo-direct",
    studyLabel: "Invest. immobilier direct",
    startDate: "28/04/2026",
    restitDate: "28/05/2026",
    restitMeta: "Dans 19 jours",
    progressPct: 60,
    progressLabel: "Phase 2/4 · réalisation du bilan",
    actionIcon: "eye",
  },
  {
    id: "dubois",
    clientNames: ["Marie DUBOIS"],
    clientType: "Personne seule",
    cabinetName: "Julien VASSEUR",
    cabinetMeta: "Senior · 8 ans",
    patrimonialInitials: "AR",
    patrimonialName: "Antoine ROSSI",
    studyType: "patrimoine",
    studyLabel: "Étude patrimoniale",
    startDate: "15/04/2026",
    restitDate: "15/05/2026",
    restitMeta: "Dans 6 jours",
    progressPct: 90,
    progressLabel: "Phase 4/4 · validation pour envoi",
    actionIcon: "eye",
  },
  {
    id: "duriez",
    clientNames: ["Camille DURIEZ"],
    clientType: "Personne seule",
    rowHighlight: "rgba(245,221,215,0.3)",
    cabinetName: "Thomas LEROY",
    cabinetMeta: "5 ans",
    patrimonialInitials: "OM",
    patrimonialName: "Olivier MARTIN",
    studyType: "societe",
    studyLabel: "Immatriculation société",
    startDate: "10/03/2026",
    restitDate: "10/04/2026",
    restitMeta: "En retard de 29 j",
    restitAlert: true,
    restitMetaAlert: true,
    progressPct: 65,
    progressLabel: "Phase 3/4 · réalisation des préconisations",
    progressAlert: true,
    actionIcon: "alert",
  },
];

/** Reste de la liste, ligne « voir l'intégralité » de la maquette. */
export const etudesRemaining = { count: 37, total: 41 };
