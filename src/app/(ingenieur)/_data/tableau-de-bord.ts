/**
 * Données d'exemple du tableau de bord ingénieur — RÉPLIQUE EXACTE de la
 * maquette 030 v28 (`#page-ing-accueil`, lignes 4160→4473).
 *
 * Source unique de la page tableau de bord. Les valeurs (KPI, comparatifs,
 * études prioritaires, alertes, RDV du jour, santé du portefeuille) sont
 * portées telles quelles depuis la maquette — comme si un vrai ingénieur
 * (Luc, cabinet de Julien VASSEUR) avait saisi son portefeuille à la main.
 * La page ne contient aucune valeur en dur : tout vient d'ici.
 */

export type CompareDir = "up" | "down";

export type Compare3 = {
  period: string;
  value: string;
  dir: CompareDir;
};

export type Kpi = {
  label: string;
  value: string;
  unit?: string;
  gold?: boolean;
  meta: string;
  compares: Compare3[];
};

/** Couleur du badge d'étape, portée des styles inline de la maquette. */
export type StageBadge = {
  label: string;
  /** "success" | "orange" | "gold-100" | "gold-soft" */
  variant: "success" | "orange" | "gold-100" | "gold-soft";
};

export type EtudePrioritaire = {
  id: string;
  initials: string;
  client: string;
  ref: string;
  stage: StageBadge;
  echeance: string;
  /** échéance affichée en orange (retard) */
  echeanceLate?: boolean;
  honoraires: string;
  /** honoraires en or (ligne mise en avant) */
  honorairesGold?: boolean;
  /** ligne surlignée (fond gold-100) */
  highlight?: boolean;
  actionLabel: string;
  /**
   * Cible de la ligne entière : dans la maquette `<tr onclick="goToPage(
   * 'ing-fiche-dossier')">`, cliquer la ligne ouvre la fiche dossier. On
   * navigue vers la fiche dossier de l'espace ingénieur.
   */
  dossierHref: string;
};

export type AlertDot = "orange" | "gold" | "navy";

export type Alerte = {
  id: string;
  dot: AlertDot;
  title: string;
  detail: string;
};

export type RdvJour = {
  id: string;
  jour: string;
  heure: string;
  client: string;
  meta: string;
};

export type SanteBar = {
  label: string;
  value: string;
  pct: number;
  tone: "green" | "gold";
  meta: string;
};

export type CockpitData = {
  dateLabel: string;
  prenom: string;
  heroSub: string;
  kpis: Kpi[];
  etudes: EtudePrioritaire[];
  etudesCount: string;
  alertes: Alerte[];
  alertesCount: string;
  rdvDuJour: RdvJour[];
  rdvDuJourMeta: string;
  sante: SanteBar[];
  santeScore: string;
};

const KPIS: Kpi[] = [
  {
    label: "Mon CA généré",
    value: "280 000",
    unit: "€",
    gold: true,
    meta: "cumul depuis janvier 2026",
    compares: [
      { period: "M-1", value: "+18 %", dir: "up" },
      { period: "T-1", value: "+14 %", dir: "up" },
      { period: "N-1", value: "+16 %", dir: "up" },
    ],
  },
  {
    label: "Études réalisées et restituées",
    value: "7",
    meta: "cumul 2026",
    compares: [
      { period: "M-1", value: "+1", dir: "up" },
      { period: "T-1", value: "+2", dir: "up" },
      { period: "N-1", value: "+3", dir: "up" },
    ],
  },
  {
    label: "Investissements financiers",
    value: "1 720 000",
    unit: "€",
    meta: "encours sous gestion · 6 clients concernés",
    compares: [
      { period: "M-1", value: "+4 %", dir: "up" },
      { period: "T-1", value: "+9 %", dir: "up" },
      { period: "N-1", value: "-2 %", dir: "down" },
    ],
  },
  {
    label: "Assurance",
    value: "9",
    unit: "contrats",
    meta: "5 clients concernés · tous types confondus",
    compares: [
      { period: "M-1", value: "+1", dir: "up" },
      { period: "T-1", value: "+2", dir: "up" },
      { period: "N-1", value: "+3", dir: "up" },
    ],
  },
  {
    label: "Investissements immobiliers",
    value: "2",
    unit: "projets",
    meta: "2 clients concernés · 180 000 € engagés",
    compares: [
      { period: "M-1", value: "+1", dir: "up" },
      { period: "T-1", value: "+1", dir: "up" },
      { period: "N-1", value: "-1", dir: "down" },
    ],
  },
];

const ETUDES: EtudePrioritaire[] = [
  {
    id: "etu-2026-014",
    initials: "BD",
    client: "Bertrand & Monique DUPONT-TOPIN",
    ref: "ETU-2026-014 · stratégie transmission",
    stage: { label: "Étape 05 · restitution", variant: "success" },
    echeance: "Demain · 14h00",
    honoraires: "12 800 €",
    honorairesGold: true,
    highlight: true,
    actionLabel: "Préparer",
    dossierHref: "/espace-ingenieur/dossiers/etu-2026-014",
  },
  {
    id: "etu-2026-018",
    initials: "AH",
    client: "Albert & Cécile HUYGHE",
    ref: "ETU-2026-018 · audit successoral",
    stage: { label: "Étape 04 · retard 3j", variant: "orange" },
    echeance: "Échéance 09/05",
    echeanceLate: true,
    honoraires: "14 200 €",
    actionLabel: "Reprendre",
    dossierHref: "/espace-ingenieur/dossiers/etu-2026-018",
  },
  {
    id: "etu-2026-022",
    initials: "GL",
    client: "SAS GROUPE LEFEBVRE",
    ref: "ETU-2026-022 · optimisation fiscale",
    stage: { label: "Étape 04 · production", variant: "gold-100" },
    echeance: "22/05/2026",
    honoraires: "18 400 €",
    actionLabel: "Continuer",
    dossierHref: "/espace-ingenieur/dossiers/etu-2026-022",
  },
  {
    id: "etu-2026-027",
    initials: "MB",
    client: "Maître BONNARD",
    ref: "ETU-2026-027 · bilan retraite",
    stage: { label: "Étape 03 · collecte 67 %", variant: "gold-soft" },
    echeance: "28/05/2026",
    honoraires: "8 600 €",
    actionLabel: "Relancer",
    dossierHref: "/espace-ingenieur/dossiers/etu-2026-027",
  },
];

const ALERTES: Alerte[] = [
  {
    id: "alert-delannoy",
    dot: "orange",
    title: "DELANNOY · KYC en attente",
    detail: "Conformité bloquée depuis 32 jours",
  },
  {
    id: "alert-huyghe",
    dot: "orange",
    title: "HUYGHE · étude en retard 3j",
    detail: "Restitution prévue le 09/05/2026",
  },
  {
    id: "alert-bonnard",
    dot: "gold",
    title: "BONNARD · 4 docs manquants",
    detail: "Dernière relance il y a 9 jours",
  },
  {
    id: "alert-dupont-topin",
    dot: "navy",
    title: "DUPONT-TOPIN · préparer restitution",
    detail: "RDV demain 12/05 à 14h00",
  },
];

const RDV_JOUR: RdvJour[] = [
  {
    id: "rdv-lacroix",
    jour: "Auj.",
    heure: "10h00",
    client: "Maître LACROIX",
    meta: "Point trimestriel · Paris 8e",
  },
  {
    id: "rdv-lamoureux",
    jour: "Auj.",
    heure: "14h30",
    client: "Pierre LAMOUREUX",
    meta: "Revue annuelle · visio",
  },
  {
    id: "rdv-bertrand",
    jour: "Auj.",
    heure: "17h00",
    client: "Camille BERTRAND (junior)",
    meta: "Point d'équipe interne",
  },
];

const SANTE: SanteBar[] = [
  {
    label: "Satisfaction client",
    value: "4,8 / 5",
    pct: 96,
    tone: "green",
    meta: "Note Trustpilot moyenne · 6 avis cumulés",
  },
  {
    label: "Conformité réglementaire",
    value: "100 %",
    pct: 100,
    tone: "green",
    meta: "Tous mes dossiers à jour · KYC à 5 / 7",
  },
  {
    label: "Activité commerciale",
    value: "78 %",
    pct: 78,
    tone: "gold",
    meta: "3 actions en retard · taux RDV→étude 64 %",
  },
  {
    label: "Formation continue",
    value: "14 h / 15 h",
    pct: 93,
    tone: "green",
    meta: "Obligation annuelle CIF · 1 h restante",
  },
];

/** Données du tableau de bord (exemples maquette). Source unique pour la page. */
export function getCockpit(): CockpitData {
  return {
    dateLabel: "12 mai 2026",
    prenom: "Luc",
    heroSub:
      "Vue d'ensemble de votre activité personnelle · 4 études en cours, 5 prospects actifs, 7 clients en suivi. Cumul depuis janvier 2026 · 280 000 € de CA généré.",
    kpis: KPIS,
    etudes: ETUDES,
    etudesCount: "4 études en cours",
    alertes: ALERTES,
    alertesCount: "4 alertes",
    rdvDuJour: RDV_JOUR,
    rdvDuJourMeta: "aujourd'hui 12 mai · 3 RDV",
    sante: SANTE,
    santeScore: "88 / 100",
  };
}
