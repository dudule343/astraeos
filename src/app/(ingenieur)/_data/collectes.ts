// Données d'exemple de l'écran « Collecte docs & infos » (pipe 03), reprises
// EXACTEMENT de la maquette ingénieur (page-ing-pipe-03). Source unique : la page
// lit d'ici, aucune valeur en dur dans le composant.

export type ClientType = "seule" | "couple" | "couple-pacs" | "personne-morale";

export type CollecteStatus = "signed" | "sent" | "dormant";

export type CollecteRow = {
  id: string;
  /** Lignes de nom (1 pour personne seule/morale, 2 pour couple). */
  nameLines: string[];
  /** Sous-libellé éventuel (ex. représentant d'une personne morale). */
  representant?: string;
  clientType: ClientType;
  clientTypeLabel: string;
  /** Praticien rattaché (colonne « Ingénieur »). */
  cabinetName: string;
  cabinetCity: string;
  /** Superviseur (colonne « Supervisé par ») : initiales + nom. */
  superviseurInitials: string;
  superviseurName: string;
  openingDate: string;
  openingMeta: string;
  /** true = date d'ouverture en alerte (inactif). */
  openingAlert?: boolean;
  docsCollected: number;
  docsExpected: number;
  /** Pourcentage de complétion (0-100). */
  pct: number;
  /** Variante de la barre de progression. */
  progressVariant?: "complete" | "alert";
  status: CollecteStatus;
  statusLabel: string;
  /** Détail affiché au clic sur la cellule de progression (comme la maquette). */
  detail?: string;
  /** Ligne surlignée (fond rosé) pour les dossiers inactifs. */
  highlightRow?: boolean;
  /** Picto d'action : œil (consulter) ou relance (refresh). */
  action: "view" | "relance";
};

export type StepperItem = {
  step: string;
  page: string;
  label: string;
  count: string;
  active?: boolean;
};

export const COLLECTE_STEPPER: StepperItem[] = [
  { step: "01", page: "ing-pipe-01", label: "Prospects actifs", count: "187" },
  { step: "02", page: "ing-pipe-02", label: "Conformité en cours", count: "18" },
  { step: "03", page: "ing-pipe-03", label: "Collecte docs", count: "24", active: true },
  { step: "04", page: "ing-pipe-04", label: "Études en cours", count: "41" },
  { step: "05", page: "ing-pipe-05", label: "Études restituées", count: "28" },
  { step: "06", page: "ing-pipe-06", label: "Clients en suivi", count: "142" },
];

export type CollecteKpi = {
  label: string;
  value: string;
  unit?: string;
  valueColor?: string;
  meta: string;
};

export const COLLECTE_KPIS: CollecteKpi[] = [
  {
    label: "Inactifs > 14 jours",
    value: "1",
    valueColor: "var(--orange-text)",
    meta: "à relancer en priorité",
  },
  {
    label: "En collecte",
    value: "5",
    unit: "clients",
    meta: "en attente de collecte des documents",
  },
  {
    label: "Complétion moyenne",
    value: "68",
    unit: "%",
    meta: "dossiers à 100 % : 6",
  },
  {
    label: "Prêts pour étape 04",
    value: "2",
    valueColor: "var(--gold)",
    meta: "complets · à lancer",
  },
];

export type CollecteFilter = {
  label: string;
  count: string;
  active?: boolean;
  alert?: boolean;
};

export const COLLECTE_FILTERS: CollecteFilter[] = [
  { label: "Tous", count: "24", active: true },
  { label: "Prêts pour étape 04", count: "6" },
  { label: "En collecte active", count: "13" },
  { label: "Inactifs > 14 j", count: "5", alert: true },
];

export const COLLECTE_FOOTNOTE =
  "… 1 autre client en collecte · 4 dossiers prêts pour étape 04 · documents par dossier : 60 à 300 selon complexité patrimoniale";

export const COLLECTE_ROWS: CollecteRow[] = [
  {
    id: "dupont-topin",
    nameLines: ["Bertrand DUPONT", "Monique TOPIN"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    cabinetName: "Luc THILLIEZ",
    cabinetCity: "Dirigeant-praticien",
    superviseurInitials: "JV",
    superviseurName: "Julien VASSEUR",
    openingDate: "29/04/2026",
    openingMeta: "Il y a 10 jours",
    docsCollected: 142,
    docsExpected: 142,
    pct: 100,
    progressVariant: "complete",
    status: "signed",
    statusLabel: "Prêt à commencer l'étude",
    detail:
      "Détail : 142 documents collectés sur 142 attendus. Cliquez ici pour ouvrir la liste des documents (CNI, RIB, avis imposition, contrats existants, statuts société, etc.).",
    action: "view",
  },
  {
    id: "moreau",
    nameLines: ["Stéphane MOREAU"],
    clientType: "seule",
    clientTypeLabel: "Personne seule",
    cabinetName: "Julien VASSEUR",
    cabinetCity: "Senior · 8 ans",
    superviseurInitials: "RB",
    superviseurName: "Romain BERTHIER",
    openingDate: "02/05/2026",
    openingMeta: "Il y a 7 jours",
    docsCollected: 65,
    docsExpected: 85,
    pct: 76,
    status: "sent",
    statusLabel: "En collecte",
    detail:
      "Détail : 65/85 documents collectés. Documents manquants : 3 derniers bulletins de salaire, attestation de propriété, RIB compte épargne...",
    action: "view",
  },
  {
    id: "leroy",
    nameLines: ["Anne LEROY", "Pierre LEROY"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    cabinetName: "Julien VASSEUR",
    cabinetCity: "Senior · 8 ans",
    superviseurInitials: "AR",
    superviseurName: "Antoine ROSSI",
    openingDate: "04/05/2026",
    openingMeta: "Il y a 5 jours",
    docsCollected: 84,
    docsExpected: 186,
    pct: 45,
    status: "sent",
    statusLabel: "En collecte",
    detail:
      "Détail : 84/186 documents collectés. Couple avec patrimoine complexe : 2 SCI, plusieurs immobiliers locatifs, 4 contrats AV, 1 PER...",
    action: "view",
  },
  {
    id: "lefebvre-sas",
    nameLines: ["SAS GROUPE LEFEBVRE"],
    representant: "Représentant : Pierre LEFEBVRE",
    clientType: "personne-morale",
    clientTypeLabel: "Personne morale",
    cabinetName: "Luc THILLIEZ",
    cabinetCity: "Dirigeant-praticien",
    superviseurInitials: "JV",
    superviseurName: "Julien VASSEUR",
    openingDate: "06/05/2026",
    openingMeta: "Il y a 3 jours",
    docsCollected: 95,
    docsExpected: 268,
    pct: 35,
    status: "sent",
    statusLabel: "En collecte",
    detail:
      "Détail : 95/268 documents. Personne morale : statuts, K-bis, bilans 3 dernières années, déclarations fiscales, pacte associés, comptes courants associés...",
    action: "view",
  },
  {
    id: "roche",
    nameLines: ["Christian ROCHE", "Marie ROCHE"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    cabinetName: "Sophie MERCIER",
    cabinetCity: "5 ans",
    superviseurInitials: "CF",
    superviseurName: "Caroline FAURE",
    openingDate: "28/04/2026",
    openingMeta: "Il y a 11 jours",
    docsCollected: 74,
    docsExpected: 120,
    pct: 62,
    status: "sent",
    statusLabel: "En collecte",
    action: "view",
  },
  {
    id: "joubert-berthoux",
    nameLines: ["Camille JOUBERT", "Yannick BERTHOUX"],
    clientType: "couple-pacs",
    clientTypeLabel: "Couple PACS",
    cabinetName: "Camille BERTRAND",
    cabinetCity: "Junior · 2 ans",
    superviseurInitials: "LR",
    superviseurName: "Léa RICCI",
    openingDate: "06/05/2026",
    openingMeta: "Il y a 3 jours",
    docsCollected: 54,
    docsExpected: 61,
    pct: 88,
    status: "sent",
    statusLabel: "En collecte",
    action: "view",
  },
  {
    id: "bonnet",
    nameLines: ["François BONNET", "Isabelle BONNET"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    cabinetName: "Luc THILLIEZ",
    cabinetCity: "Dirigeant-praticien",
    superviseurInitials: "MK",
    superviseurName: "Mathieu KELLER",
    openingDate: "03/05/2026",
    openingMeta: "Il y a 6 jours",
    docsCollected: 118,
    docsExpected: 118,
    pct: 100,
    progressVariant: "complete",
    status: "signed",
    statusLabel: "Prêt à commencer l'étude",
    action: "view",
  },
  {
    id: "bardet",
    nameLines: ["Élise BARDET"],
    clientType: "seule",
    clientTypeLabel: "Personne seule",
    cabinetName: "Camille BERTRAND",
    cabinetCity: "Junior · 2 ans",
    superviseurInitials: "LR",
    superviseurName: "Léa RICCI",
    openingDate: "12/04/2026",
    openingMeta: "Il y a 27 jours · inactif",
    openingAlert: true,
    docsCollected: 22,
    docsExpected: 78,
    pct: 28,
    progressVariant: "alert",
    status: "dormant",
    statusLabel: "Inactif > 14j",
    highlightRow: true,
    action: "relance",
  },
  {
    id: "charpentier",
    nameLines: ["Olivier CHARPENTIER", "Nathalie CHARPENTIER"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    cabinetName: "Julien VASSEUR",
    cabinetCity: "Senior · 8 ans",
    superviseurInitials: "PM",
    superviseurName: "Paul MARTINEZ",
    openingDate: "07/05/2026",
    openingMeta: "Il y a 2 jours",
    docsCollected: 16,
    docsExpected: 92,
    pct: 18,
    status: "sent",
    statusLabel: "En collecte",
    action: "view",
  },
  {
    id: "roux",
    nameLines: ["Maxime ROUX"],
    clientType: "seule",
    clientTypeLabel: "Personne seule",
    cabinetName: "Sophie MERCIER",
    cabinetCity: "5 ans",
    superviseurInitials: "HC",
    superviseurName: "Hélène CARRÈRE",
    openingDate: "28/04/2026",
    openingMeta: "Il y a 11 jours",
    docsCollected: 72,
    docsExpected: 130,
    pct: 55,
    status: "sent",
    statusLabel: "En collecte",
    action: "view",
  },
];
