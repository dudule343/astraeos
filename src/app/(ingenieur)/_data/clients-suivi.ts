/**
 * Données d'exemple pour l'écran « Pipe 06 · Clients en suivi »
 * (maquette id="page-ing-pipe-06"). Valeurs reprises telles quelles de la
 * maquette : ce sont les exemples « comme si des clients avaient été saisis
 * à la main ». Source unique pour la page, aucune valeur en dur dans le TSX.
 */

/** Bandeau parcours patrimonial à 6 étapes, étape 06 active. */
export type PipelineStep = {
  step: string;
  label: string;
  count: string;
  /** href React vers l'écran réel correspondant à l'étape. */
  href: string;
  active?: boolean;
};

export const pipelineSteps: PipelineStep[] = [
  { step: "01", label: "Prospects actifs", count: "187", href: "/espace-ingenieur/prospects" },
  { step: "02", label: "Conformité en cours", count: "18", href: "/espace-ingenieur/conformite" },
  { step: "03", label: "Collecte docs", count: "24", href: "/espace-ingenieur/collectes" },
  { step: "04", label: "Études en cours", count: "41", href: "/espace-ingenieur/etudes" },
  { step: "05", label: "Études restituées", count: "28", href: "/espace-ingenieur/etudes-restituees" },
  { step: "06", label: "Clients en suivi", count: "142", href: "/espace-ingenieur/clients-suivi", active: true },
];

export type SuiviKpi = {
  label: string;
  value: string;
  meta: string;
  /** Couleur du chiffre (alerte) si besoin. */
  valueColor?: "orange" | "red";
};

export const suiviKpis: SuiviKpi[] = [
  { label: "Clients en suivi", value: "28", meta: "portefeuille servi par le cabinet" },
  { label: "Entrevues sous 30 j", value: "6", meta: "point récurrent prévu" },
  { label: "Sans contact > 3 mois", value: "2", meta: "à recontacter en priorité", valueColor: "orange" },
  { label: "Sans contact > 6 mois", value: "1", meta: "risque de churn", valueColor: "red" },
];

export type SuiviFilter = {
  label: string;
  count: string;
  active?: boolean;
  alert?: boolean;
};

export const suiviFilters: SuiviFilter[] = [
  { label: "Tous", count: "142", active: true },
  { label: "Entrevue prévue < 30 j", count: "38" },
  { label: "Missions actives", count: "52" },
  { label: "Sans contact > 3 mois", count: "12", alert: true },
  { label: "Sans contact > 6 mois", count: "3", alert: true },
];

export type StatusTone = "success" | "gold" | "orange";

export type SuiviRow = {
  id: string;
  /** Client : une ou deux lignes de nom (couple) + libellé de type. */
  clientNames: string[];
  clientType: string;
  /** Type de mise en forme du libellé : couple (doré) / morale (bleu). */
  clientTypeStyle?: "couple" | "morale";
  /** Variante de ligne (fond) reproduite de la maquette. */
  rowVariant?: "couple" | "pm";
  /** Style de fond ponctuel (ligne surlignée). */
  rowHighlight?: string;
  /** Colonne « Ingénieur » (nom + sous-titre). */
  cabinetName: string;
  cabinetMeta: string;
  /** Colonne « Supervisé par » (avatar + nom). */
  superviseInitials: string;
  superviseName: string;
  /** Encours du client (montant déjà formaté). */
  encours: string;
  encoursGold?: boolean;
  /** Dernier rendez-vous. */
  lastDate: string;
  lastMeta: string;
  lastAlert?: boolean;
  lastMetaAlert?: boolean;
  /** Prochaine entrevue. */
  nextDate: string;
  nextDateMuted?: boolean;
  nextMeta: string;
  nextMetaTone?: "orange";
  /** Préconisations réalisées (liste de lignes). */
  preconisations: string[];
  preconisationsMuted?: boolean;
  /** Statut du client. */
  statusLabel: string;
  statusTone: StatusTone;
  /** Action : œil (consulter) ou alerte. */
  actionIcon: "eye" | "alert";
};

export const suiviRows: SuiviRow[] = [
  {
    id: "dupont-topin",
    clientNames: ["Bertrand DUPONT", "Monique TOPIN"],
    clientType: "Couple",
    clientTypeStyle: "couple",
    rowVariant: "couple",
    rowHighlight: "rgba(198,142,14,0.05)",
    cabinetName: "Luc THILLIEZ",
    cabinetMeta: "Dirigeant-praticien",
    superviseInitials: "JV",
    superviseName: "Julien VASSEUR",
    encours: "1 200 000 €",
    encoursGold: true,
    lastDate: "15/03/2026",
    lastMeta: "Il y a 56 j",
    nextDate: "15/06/2026",
    nextMeta: "Dans 37 jours",
    preconisations: ["PEA", "Investissement immobilier", "Démembrement avec notaire"],
    statusLabel: "Actif",
    statusTone: "success",
    actionIcon: "eye",
  },
  {
    id: "dubois",
    clientNames: ["Marie DUBOIS"],
    clientType: "Personne seule",
    cabinetName: "Julien VASSEUR",
    cabinetMeta: "Senior · 8 ans",
    superviseInitials: "RB",
    superviseName: "Romain BERTHIER",
    encours: "580 000 €",
    lastDate: "14/02/2026",
    lastMeta: "Il y a 86 j",
    nextDate: "28/05/2026",
    nextMeta: "Dans 19 jours",
    preconisations: ["PEA", "Création de société"],
    statusLabel: "Actif",
    statusTone: "success",
    actionIcon: "eye",
  },
  {
    id: "huyghe",
    clientNames: ["Albert HUYGHE", "Cécile HUYGHE"],
    clientType: "Couple",
    clientTypeStyle: "couple",
    rowVariant: "couple",
    cabinetName: "Luc THILLIEZ",
    cabinetMeta: "Dirigeant-praticien",
    superviseInitials: "EL",
    superviseName: "Émilie LAMBERT",
    encours: "880 000 €",
    lastDate: "02/03/2026",
    lastMeta: "Il y a 69 j",
    nextDate: "02/06/2026",
    nextMeta: "Dans 24 jours",
    preconisations: ["Investissement immobilier", "Création de société"],
    statusLabel: "Actif",
    statusTone: "success",
    actionIcon: "eye",
  },
  {
    id: "dupont-henri",
    clientNames: ["Henri DUPONT"],
    clientType: "Personne seule",
    rowHighlight: "rgba(245,221,215,0.3)",
    cabinetName: "Sophie MERCIER",
    cabinetMeta: "5 ans",
    superviseInitials: "HC",
    superviseName: "Hélène CARRÈRE",
    encours: "320 000 €",
    lastDate: "12/12/2025",
    lastMeta: "Il y a 149 j",
    lastAlert: true,
    lastMetaAlert: true,
    nextDate: "—",
    nextDateMuted: true,
    nextMeta: "À reprogrammer",
    nextMetaTone: "orange",
    preconisations: ["Aucune en cours"],
    preconisationsMuted: true,
    statusLabel: "Non renouvelé conseil",
    statusTone: "orange",
    actionIcon: "alert",
  },
  {
    id: "groupe-lebon",
    clientNames: ["SAS GROUPE LEBON"],
    clientType: "Personne morale",
    clientTypeStyle: "morale",
    rowVariant: "pm",
    cabinetName: "Luc THILLIEZ",
    cabinetMeta: "Dirigeant-praticien",
    superviseInitials: "LT",
    superviseName: "Luc THILLIEZ",
    encours: "1 240 000 €",
    encoursGold: true,
    lastDate: "22/03/2026",
    lastMeta: "Il y a 49 j",
    nextDate: "22/06/2026",
    nextMeta: "Dans 44 jours · trimestriel",
    preconisations: ["Compte-titres société", "Holding", "Optimisation IS"],
    statusLabel: "VIP corporate",
    statusTone: "gold",
    actionIcon: "eye",
  },
];

/** Reste de la liste, ligne « voir l'intégralité » de la maquette. */
export const suiviRemaining = { count: 137, total: 142 };
