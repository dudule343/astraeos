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
  /** vrais RDV pris en ligne, indexés par date absolue "année-mois-jour:créneau" */
  realRdvs: Map<string, AgendaRdv>;
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

/** Parse "Vendredi 15 mai 2026" + "09:00 – 10:00" → date ABSOLUE + créneau.
 *  Pas de contrainte de semaine : le RDV est placé à sa vraie date. */
function parseRdvDate(
  dateLabel: string,
  timeLabel: string,
): { year: number; month: number; date: number; slotKey: string; hourLabel: string } | null {
  const md = dateLabel.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/);
  if (!md) return null;
  const date = Number(md[1]);
  const month = MOIS[md[2].toLowerCase()];
  const year = Number(md[3]);
  if (month === undefined) return null;
  const mt = timeLabel.match(/(\d{1,2}):(\d{2})/);
  if (!mt) return null;
  const hh = Number(mt[1]);
  const mm = mt[2];
  return {
    year,
    month,
    date,
    slotKey: `${hh}h${mm}`,
    hourLabel: `${String(hh).padStart(2, "0")}h${mm === "00" ? "" : mm}`,
  };
}

/** Charge les vrais RDV pris en ligne (dci_submissions kind='rdv'), scopés au
 *  cabinet, indexés par DATE ABSOLUE "année-mois-jour:créneau". La grille les
 *  affiche dans la semaine réelle où ils tombent (n'importe quelle date).
 *  Best-effort : map vide sans base/contexte. */
async function loadRealRdvsByDate(): Promise<Map<string, AgendaRdv>> {
  const out = new Map<string, AgendaRdv>();
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return out;
    const ctx = await getSessionContext();
    if (!ctx) return out;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dci_submissions")
      .select("prospect_slug, display_name, payload")
      .eq("tenant_id", ctx.tenantId)
      .eq("kind", "rdv")
      .limit(200);
    for (const r of (data ?? []) as Array<{
      prospect_slug: string;
      display_name: string | null;
      payload: Record<string, unknown> | null;
    }>) {
      const p = r.payload ?? {};
      const pos = parseRdvDate(
        typeof p.dateLabel === "string" ? p.dateLabel : "",
        typeof p.timeLabel === "string" ? p.timeLabel : "",
      );
      if (!pos) continue;
      const surname = (r.display_name ?? r.prospect_slug).split(" ").slice(-1)[0].toUpperCase();
      const room = typeof p.visioRoom === "string" ? p.visioRoom : `rdv-${r.prospect_slug}-initial`;
      out.set(`${pos.year}-${pos.month}-${pos.date}:${pos.slotKey}`, {
        id: `real-${r.prospect_slug}`,
        dayIndex: 0,
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
    // best-effort
  }
  return out;
}

/** Variante de couleur de l'event selon le type de RDV (table rdv). */
const RDV_TYPE_VARIANT: Record<string, AgendaRdv["variant"]> = {
  decouverte: "ev-gold",
  restitution: "ev-gold",
  collecte: "ev-gold",
  suivi_annuel: "ev-success",
  signature: "ev-navy",
  autre: "ev-internal",
};

const RDV_TYPE_META: Record<string, string> = {
  decouverte: "Entretien initial",
  restitution: "Restitution étude",
  collecte: "Point collecte",
  suivi_annuel: "Suivi annuel",
  signature: "Signature",
  autre: "Rendez-vous",
};

const RDV_FORMAT_META: Record<string, string> = {
  visio: "visio",
  telephone: "tél.",
  presentiel: "présentiel",
};

type RdvTableRow = {
  id: string;
  scheduled_at: string | null;
  type: string | null;
  format: string | null;
  duration_minutes: number | null;
  dossiers?:
    | { clients?: { personnes?: Array<{ last_name?: string | null }> | { last_name?: string | null } | null } | null }
    | Array<{ clients?: { personnes?: Array<{ last_name?: string | null }> | { last_name?: string | null } | null } | null }>
    | null;
};

function lastNameOf(row: RdvTableRow): string {
  const dossier = Array.isArray(row.dossiers) ? row.dossiers[0] : row.dossiers;
  const persons = dossier?.clients?.personnes;
  const p = Array.isArray(persons) ? persons[0] : persons;
  const ln = p?.last_name ?? "";
  return ln ? ln.toUpperCase() : "RDV";
}

/**
 * Charge les vrais RDV de l'ingénieur depuis la table `rdv`, indexés par DATE
 * ABSOLUE "année-mois-jour:créneau" — placés dans la grille à leur vraie date.
 * Renvoie aussi les stats brutes pour les KPI (semaine / mois / durée moyenne).
 * Best-effort.
 */
async function loadEngineerRdvs(): Promise<{
  byDate: Map<string, AgendaRdv>;
  weekCount: number;
  weekVisio: number;
  weekPresentiel: number;
  monthCount: number;
  monthLabel: string;
  avgMinutes: number | null;
}> {
  const byDate = new Map<string, AgendaRdv>();
  const fallback = {
    byDate,
    weekCount: 0,
    weekVisio: 0,
    weekPresentiel: 0,
    monthCount: 0,
    monthLabel: "ce mois",
    avgMinutes: null as number | null,
  };
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return fallback;
    const ctx = await getSessionContext();
    if (!ctx) return fallback;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("rdv")
      .select(
        "id, scheduled_at, type, format, duration_minutes, dossiers(clients(personnes(last_name)))",
      )
      .eq("engineer_id", ctx.userId)
      .order("scheduled_at", { ascending: true })
      .limit(300);

    const rows = (data ?? []) as RdvTableRow[];
    const now = new Date();
    // Semaine ISO courante (lundi → dimanche).
    const monday = new Date(now);
    const dow = (monday.getDay() + 6) % 7; // 0 = lundi
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - dow);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    let weekCount = 0;
    let weekVisio = 0;
    let weekPresentiel = 0;
    let monthCount = 0;
    let durSum = 0;
    let durN = 0;

    for (const r of rows) {
      if (!r.scheduled_at) continue;
      const dt = new Date(r.scheduled_at);
      if (!Number.isFinite(dt.getTime())) continue;
      const hh = dt.getHours();
      const mm = dt.getMinutes();
      const slotKey = `${hh}h${String(mm).padStart(2, "0")}`;
      const hourLabel = `${String(hh).padStart(2, "0")}h${mm === 0 ? "" : String(mm).padStart(2, "0")}`;
      const type = r.type ?? "autre";
      const format = r.format ?? "";
      const metaParts = [RDV_TYPE_META[type] ?? type.replace(/_/g, " ")];
      if (format) metaParts.push(RDV_FORMAT_META[format] ?? format);
      byDate.set(`${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}:${slotKey}`, {
        id: `rdv-${r.id}`,
        dayIndex: 0,
        slotKey,
        hourLabel,
        surname: lastNameOf(r),
        metaLabel: metaParts.join(" · "),
        isVisio: format === "visio",
        variant: RDV_TYPE_VARIANT[type] ?? "ev-navy",
        href: "/espace-ingenieur/agenda",
      });

      if (dt >= monday && dt < sunday) {
        weekCount += 1;
        if (format === "visio") weekVisio += 1;
        if (format === "presentiel") weekPresentiel += 1;
      }
      if (dt >= monthStart && dt < monthEnd) monthCount += 1;
      if (r.duration_minutes != null) {
        durSum += Number(r.duration_minutes);
        durN += 1;
      }
    }

    return {
      byDate,
      weekCount,
      weekVisio,
      weekPresentiel,
      monthCount,
      monthLabel: `cumul ${now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
      avgMinutes: durN > 0 ? Math.round(durSum / durN) : null,
    };
  } catch {
    return fallback;
  }
}

function formatAvgDuration(minutes: number | null): { value: string; unit: string } {
  if (minutes == null) return { value: "—", unit: "" };
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return { value: String(m), unit: "min" };
  return { value: String(h), unit: m === 0 ? "h" : `h ${m} min` };
}

/** Données de l'agenda : grille = vrais RDV de l'ingénieur (table rdv) +
 *  RDV pris en ligne (dci_submissions), placés par date réelle ; KPI calculés
 *  sur les vrais RDV. La semaine de base maquette sert de repère visuel. */
export async function getAgenda(): Promise<AgendaData> {
  const [onlineRdvs, eng] = await Promise.all([
    loadRealRdvsByDate(),
    loadEngineerRdvs(),
  ]);

  // Fusion : les vrais RDV de la table rdv + les prises de RDV en ligne, tous
  // indexés par date absolue. La prise en ligne (visio prospect) prime.
  const realRdvs = new Map<string, AgendaRdv>(eng.byDate);
  for (const [k, v] of onlineRdvs) realRdvs.set(k, v);

  const avg = formatAvgDuration(eng.avgMinutes);
  const now = new Date();

  return {
    rdvsBySlot: buildSlotMap(),
    realRdvs,
    weekLabel: "Semaine du lundi 11 au dimanche 17 mai 2026",
    weekEyebrow: `Mon agenda · synchronisé Google Agenda · semaine ${isoWeek(now)}`,
    syncLabel: "Google Agenda · sync activée",
    days: DAYS,
    kpiWeekCount: eng.weekCount,
    kpiWeekMeta:
      eng.weekCount > 0
        ? `${eng.weekPresentiel} en présentiel · ${eng.weekVisio} en visio`
        : "aucun RDV cette semaine",
    kpiWeekCompare: [],
    kpiMonthCount: eng.monthCount,
    kpiMonthLabel: eng.monthLabel,
    kpiMonthCompare: [],
    avgDurationValue: avg.value,
    avgDurationUnit: avg.unit,
    avgDurationMeta:
      eng.avgMinutes != null ? "sur mes RDV planifiés" : "aucune durée renseignée",
    publicSlug: "luc-thilliez",
    publicLink: "priveos.com/rdv/luc-thilliez",
  };
}

/** Numéro de semaine ISO 8601. */
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}
