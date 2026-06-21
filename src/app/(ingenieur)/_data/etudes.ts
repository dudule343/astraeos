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

/** Clé de filtre rapide. "toutes" = aucun filtre. */
export type FilterKey =
  | "toutes"
  | "sous-30j"
  | "patrimoniales"
  | "immo-direct"
  | "fin-direct"
  | "assurance"
  | "en-retard";

export type EtudesFilter = {
  key: FilterKey;
  label: string;
  count: string;
  active?: boolean;
  alert?: boolean;
};

export const etudesFilters: EtudesFilter[] = [
  { key: "toutes", label: "Toutes", count: "41", active: true },
  { key: "sous-30j", label: "Restitution sous 30 j", count: "22" },
  { key: "patrimoniales", label: "Études patrimoniales", count: "28" },
  { key: "immo-direct", label: "Investissement immobilier direct", count: "8" },
  { key: "fin-direct", label: "Investissement financier direct", count: "3" },
  { key: "assurance", label: "Mise en place assurance direct", count: "2" },
  { key: "en-retard", label: "En retard", count: "3", alert: true },
];

export function isValidFilter(value: string | undefined): value is FilterKey {
  return (
    value === "toutes" ||
    value === "sous-30j" ||
    value === "patrimoniales" ||
    value === "immo-direct" ||
    value === "fin-direct" ||
    value === "assurance" ||
    value === "en-retard"
  );
}

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

/** Une étude est « en retard » dès que le délai contractuel est dépassé. */
function isEnRetard(row: EtudeRow): boolean {
  return Boolean(row.restitMetaAlert || row.progressAlert || row.restitAlert);
}

/** Restitution « sous 30 j » : on lit le « Dans N jours » du méta de restitution. */
function isSous30Jours(row: EtudeRow): boolean {
  if (isEnRetard(row)) return false;
  const match = row.restitMeta.match(/Dans\s+(\d+)\s+jour/i);
  if (!match) return false;
  return Number(match[1]) <= 30;
}

function rowMatchesFilter(row: EtudeRow, filter: FilterKey): boolean {
  switch (filter) {
    case "toutes":
      return true;
    case "sous-30j":
      return isSous30Jours(row);
    case "patrimoniales":
      return row.studyType === "patrimoine";
    case "immo-direct":
      return row.studyType === "immo-direct";
    case "fin-direct":
      return row.studyType === "fin-direct";
    case "assurance":
      return row.studyType === "assurance";
    case "en-retard":
      return isEnRetard(row);
    default:
      return true;
  }
}

export type EtudesData = {
  filters: EtudesFilter[];
  rows: EtudeRow[];
  remaining: { count: number; total: number };
};

/**
 * Renvoie les études filtrées selon la clé demandée. Filtrage réel : lignes,
 * filtre actif, compteur « … N autres » et total affiché sont recalculés.
 * « toutes » (défaut) ne filtre rien. Le total d'une catégorie = le compteur
 * annoncé par le filtre rapide (le tableau n'affiche qu'un extrait).
 */
export function fetchEtudes(filter: FilterKey = "toutes"): EtudesData {
  const filters = etudesFilters.map((f) => ({ ...f, active: f.key === filter }));

  if (filter === "toutes") {
    return { filters, rows: etudesRows, remaining: etudesRemaining };
  }

  const rows = etudesRows.filter((r) => rowMatchesFilter(r, filter));
  const total = Number(
    etudesFilters.find((f) => f.key === filter)?.count ?? rows.length,
  );
  const count = Math.max(0, total - rows.length);

  return { filters, rows, remaining: { count, total } };
}
