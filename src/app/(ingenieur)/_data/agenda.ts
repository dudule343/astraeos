/**
 * Données d'exemple de l'agenda ingénieur — RÉPLIQUE EXACTE de la maquette
 * 030 v28 (`#page-ing-agenda`, lignes 5519→5901).
 *
 * Source unique de la page agenda. Les vraies données Supabase seront
 * rebranchées plus tard ; ici on porte les exemples de la maquette pour la
 * fidélité pixel (ingénieur connecté = Julien VASSEUR, semaine du 11 au 17
 * mai 2026, aujourd'hui = mardi 12).
 */

/** Un RDV positionné dans la grille semaine. */
export type AgendaRdv = {
  id: string;
  /** 0 = lundi … 6 = dimanche */
  dayIndex: number;
  /** clé de créneau "HHhMM" sur la demi-heure (ex "9h00", "14h30") */
  slotKey: string;
  /** libellé horaire exactement comme la maquette ("09h", "09h30", "11h30"…) */
  hourLabel: string;
  surname: string;
  /** texte de la ligne `.ev-meta` complet, tel que la maquette ("Suivi annuel · visio") */
  metaLabel: string;
  isVisio: boolean;
  /** classe de couleur portée de la maquette (ev-gold / ev-navy / ev-success / ev-internal) */
  variant: "ev-gold" | "ev-navy" | "ev-success" | "ev-internal";
  /**
   * Destination du clic, comme la maquette (goToPage) :
   *  - JOUBERT-BERTHOUX → fiche RDV Joubert,
   *  - MERCIER → fiche RDV Mercier,
   *  - tous les autres → fiche client générique.
   */
  href: string;
};

export type AgendaDayHeader = {
  /** 0 = lundi … 6 = dimanche */
  index: number;
  /** "Lun", "Mar"… */
  name: string;
  /** numéro du jour dans le mois */
  num: number;
  /** libellé complet pré-rempli dans la modale ("Lundi 11 mai 2026") */
  fullLabel: string;
  isToday: boolean;
};

export type KpiCompareCell = {
  period: string;
  value: string;
  direction: "up" | "down";
};

export type AgendaData = {
  weekLabel: string;
  weekEyebrow: string;
  syncLabel: string;
  days: AgendaDayHeader[];
  rdvsBySlot: Map<string, AgendaRdv>;
  kpiWeekCount: number;
  kpiWeekMeta: string;
  kpiWeekCompare: KpiCompareCell[];
  kpiMonthCount: number;
  kpiMonthLabel: string;
  kpiMonthCompare: KpiCompareCell[];
  avgDurationValue: string;
  avgDurationUnit: string;
  avgDurationMeta: string;
  publicSlug: string;
  publicLink: string;
};

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_FULL_NAMES = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

/**
 * Cible de navigation des events, exactement comme la maquette (goToPage) :
 * la fiche RDV pour Joubert/Mercier, la fiche client générique pour les autres.
 */
const FICHE_CLIENT_HREF = "/espace-ingenieur/clients/dupont-topin";
const FICHE_RDV_JOUBERT_HREF = "/espace-ingenieur/agenda/joubert";
const FICHE_RDV_MERCIER_HREF = "/espace-ingenieur/agenda/mercier";

/** Les 14 événements de la maquette, dans l'ordre des créneaux. */
const RDVS: AgendaRdv[] = [
  {
    id: "delannoy",
    dayIndex: 3,
    slotKey: "9h00",
    hourLabel: "09h",
    surname: "DELANNOY",
    metaLabel: "Suivi conformité · tél.",
    isVisio: false,
    variant: "ev-navy",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "marchand",
    dayIndex: 2,
    slotKey: "9h30",
    hourLabel: "09h30",
    surname: "MARCHAND",
    metaLabel: "Suivi annuel · visio",
    isVisio: true,
    variant: "ev-navy",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "lacroix",
    dayIndex: 1,
    slotKey: "10h00",
    hourLabel: "10h",
    surname: "LACROIX",
    metaLabel: "Suivi trim. · présentiel",
    isVisio: false,
    variant: "ev-success",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "lefebvre",
    dayIndex: 4,
    slotKey: "10h30",
    hourLabel: "10h30",
    surname: "LEFEBVRE",
    metaLabel: "Suivi étude · visio",
    isVisio: true,
    variant: "ev-navy",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "bonnard",
    dayIndex: 3,
    slotKey: "11h00",
    hourLabel: "11h",
    surname: "BONNARD",
    metaLabel: "Point collecte · cabinet",
    isVisio: false,
    variant: "ev-gold",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "joubert-berthoux",
    dayIndex: 1,
    slotKey: "11h30",
    hourLabel: "11h30",
    surname: "JOUBERT-BERTHOUX",
    metaLabel: "Entretien initial couple · visio",
    isVisio: true,
    variant: "ev-gold",
    href: FICHE_RDV_JOUBERT_HREF,
  },
  {
    id: "dupont-topin",
    dayIndex: 1,
    slotKey: "14h00",
    hourLabel: "14h",
    surname: "DUPONT-TOPIN",
    metaLabel: "Restitution étude · 2h",
    isVisio: false,
    variant: "ev-gold",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "lamoureux",
    dayIndex: 0,
    slotKey: "14h30",
    hourLabel: "14h30",
    surname: "LAMOUREUX",
    metaLabel: "Revue annuelle · visio",
    isVisio: true,
    variant: "ev-gold",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "tessier",
    dayIndex: 2,
    slotKey: "15h00",
    hourLabel: "15h",
    surname: "TESSIER",
    metaLabel: "Entretien interm. · visio",
    isVisio: true,
    variant: "ev-navy",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "charpentier",
    dayIndex: 3,
    slotKey: "15h30",
    hourLabel: "15h30",
    surname: "CHARPENTIER",
    metaLabel: "1er entretien · cabinet",
    isVisio: false,
    variant: "ev-gold",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "mercier",
    dayIndex: 1,
    slotKey: "16h00",
    hourLabel: "16h",
    surname: "MERCIER",
    metaLabel: "Entretien initial · visio",
    isVisio: true,
    variant: "ev-gold",
    href: FICHE_RDV_MERCIER_HREF,
  },
  {
    id: "lefranc",
    dayIndex: 3,
    slotKey: "16h30",
    hourLabel: "16h30",
    surname: "LEFRANC",
    metaLabel: "Suivi étude · visio",
    isVisio: true,
    variant: "ev-navy",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "equipe-camille",
    dayIndex: 1,
    slotKey: "17h00",
    hourLabel: "17h",
    surname: "Équipe",
    metaLabel: "Camille (junior) · brief",
    isVisio: false,
    variant: "ev-internal",
    href: FICHE_CLIENT_HREF,
  },
  {
    id: "aubert",
    dayIndex: 0,
    slotKey: "18h00",
    hourLabel: "18h",
    surname: "AUBERT",
    metaLabel: "Suivi conformité · tél.",
    isVisio: false,
    variant: "ev-navy",
    href: FICHE_CLIENT_HREF,
  },
];

/** En-têtes des 7 jours : semaine du lundi 11 au dimanche 17 mai 2026, auj. = mardi 12. */
const DAYS: AgendaDayHeader[] = DAY_NAMES.map((name, index) => ({
  index,
  name,
  num: 11 + index,
  fullLabel: `${DAY_FULL_NAMES[index]} ${11 + index} mai 2026`,
  isToday: index === 1,
}));

function buildSlotMap(): Map<string, AgendaRdv> {
  const map = new Map<string, AgendaRdv>();
  for (const rdv of RDVS) {
    map.set(`${rdv.dayIndex}:${rdv.slotKey}`, rdv);
  }
  return map;
}

/** Données de l'agenda (exemples maquette). Source unique pour la page. */
export function getAgenda(): AgendaData {
  return {
    weekLabel: "Semaine du lundi 11 au dimanche 17 mai 2026",
    weekEyebrow: "Mon agenda · synchronisé Google Agenda · semaine 20",
    syncLabel: "Google Agenda · sync 11:42",
    days: DAYS,
    rdvsBySlot: buildSlotMap(),
    kpiWeekCount: 8,
    kpiWeekMeta: "5 en présentiel · 3 en visio",
    kpiWeekCompare: [
      { period: "S-1", value: "+2", direction: "up" },
      { period: "N-1 même semaine", value: "+3", direction: "up" },
    ],
    kpiMonthCount: 22,
    kpiMonthLabel: "cumul mai 2026",
    kpiMonthCompare: [
      { period: "M-1", value: "+4", direction: "up" },
      { period: "N-1 même mois", value: "+6", direction: "up" },
    ],
    avgDurationValue: "1",
    avgDurationUnit: "h 12 min",
    avgDurationMeta: "cumul N-1 · ▼ -8 min",
    publicSlug: "julien-vasseur",
    publicLink: "priveos.com/rdv/julien-vasseur",
  };
}
