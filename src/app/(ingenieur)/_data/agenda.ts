/**
 * Données d'exemple de l'agenda ingénieur — RÉPLIQUE EXACTE de la maquette
 * 030 v28 (`#page-ing-agenda`, lignes 5519→5901).
 *
 * Source unique de la page agenda. Les vraies données Supabase seront
 * rebranchées plus tard ; ici on porte les exemples de la maquette pour la
 * fidélité pixel (ingénieur connecté = Luc THILLIEZ, comme la sidebar et le
 * profil ; lien public personnel = priveos.com/rdv/luc-thilliez ; semaine du
 * 11 au 17 mai 2026, aujourd'hui = mardi 12).
 */

/** Un RDV positionné dans la grille semaine. */
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

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

const MOIS: Record<string, number> = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
  décembre: 11, decembre: 11,
};

/** Parse "Vendredi 15 mai 2026" + "09:00 – 10:00" → position dans la semaine de
 *  base (lundi 11 → dimanche 17 mai 2026). null si hors de cette semaine. */
function positionInBaseWeek(
  dateLabel: string,
  timeLabel: string,
): { dayIndex: number; slotKey: string; hourLabel: string } | null {
  const md = dateLabel.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/);
  if (!md) return null;
  const day = Number(md[1]);
  const mois = MOIS[md[2].toLowerCase()];
  const year = Number(md[3]);
  if (mois !== 4 || year !== 2026 || day < 11 || day > 17) return null;
  const mt = timeLabel.match(/(\d{1,2}):(\d{2})/);
  if (!mt) return null;
  const hh = Number(mt[1]);
  const mm = mt[2];
  return {
    dayIndex: day - 11, // 11 mai = lundi = 0
    slotKey: `${hh}h${mm}`,
    hourLabel: `${String(hh).padStart(2, "0")}h${mm === "00" ? "" : mm}`,
  };
}

/** Injecte dans la grille les vrais RDV pris en ligne (dci_submissions kind='rdv')
 *  qui tombent dans la semaine affichée, scopés au cabinet. Best-effort. */
async function mergeRealRdvs(map: Map<string, AgendaRdv>): Promise<void> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const ctx = await getSessionContext();
    if (!ctx) return;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dci_submissions")
      .select("prospect_slug, display_name, payload")
      .eq("tenant_id", ctx.tenantId)
      .eq("kind", "rdv")
      .limit(100);
    for (const r of (data ?? []) as Array<{
      prospect_slug: string;
      display_name: string | null;
      payload: Record<string, unknown> | null;
    }>) {
      const p = r.payload ?? {};
      const pos = positionInBaseWeek(
        typeof p.dateLabel === "string" ? p.dateLabel : "",
        typeof p.timeLabel === "string" ? p.timeLabel : "",
      );
      if (!pos) continue;
      const surname = (r.display_name ?? r.prospect_slug).split(" ").slice(-1)[0].toUpperCase();
      const room = typeof p.visioRoom === "string" ? p.visioRoom : `rdv-${r.prospect_slug}-initial`;
      map.set(`${pos.dayIndex}:${pos.slotKey}`, {
        id: `real-${r.prospect_slug}`,
        dayIndex: pos.dayIndex,
        slotKey: pos.slotKey,
        hourLabel: pos.hourLabel,
        surname,
        metaLabel: "Entretien initial · visio · prospect en ligne",
        isVisio: true,
        variant: "ev-gold",
        href: `/visio/${room}?role=engineer`,
      });
    }
  } catch {
    // best-effort : la grille démo reste affichée si la base est indisponible.
  }
}

/** Données de l'agenda (exemples maquette + vrais RDV pris en ligne). */
export async function getAgenda(): Promise<AgendaData> {
  const rdvsBySlot = buildSlotMap();
  await mergeRealRdvs(rdvsBySlot);
  return {
    rdvsBySlot,
    weekLabel: "Semaine du lundi 11 au dimanche 17 mai 2026",
    weekEyebrow: "Mon agenda · synchronisé Google Agenda · semaine 20",
    syncLabel: "Google Agenda · sync 11:42",
    days: DAYS,
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
    publicSlug: "luc-thilliez",
    publicLink: "priveos.com/rdv/luc-thilliez",
  };
}
