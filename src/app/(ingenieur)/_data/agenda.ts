import "server-only";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/** Un RDV positionné dans la grille semaine. */
export type AgendaRdv = {
  id: string;
  scheduledAt: string;
  /** 0 = lundi … 6 = dimanche */
  dayIndex: number;
  /** clé de créneau "HHhMM" sur la demi-heure (ex "9h00", "14h30") */
  slotKey: string;
  surname: string;
  typeLabel: string;
  formatLabel: string;
  isVisio: boolean;
  /** classe de couleur portée de la maquette (ev-gold / ev-navy / ev-success / ev-internal) */
  variant: "ev-gold" | "ev-navy" | "ev-success" | "ev-internal";
};

export type AgendaDayHeader = {
  /** 0 = lundi … 6 = dimanche */
  index: number;
  /** "Lun", "Mar"… */
  name: string;
  /** numéro du jour dans le mois */
  num: number;
  isToday: boolean;
};

export type AgendaData = {
  weekLabel: string;
  weekEyebrow: string;
  days: AgendaDayHeader[];
  rdvsBySlot: Map<string, AgendaRdv>;
  kpiWeekCount: number;
  kpiWeekPresentiel: number;
  kpiWeekVisio: number;
  kpiMonthCount: number;
  kpiMonthLabel: string;
  avgDurationLabel: string | null;
  publicSlug: string;
  publicLink: string;
};

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const TYPE_LABELS: Record<string, string> = {
  decouverte: "Entretien initial",
  collecte: "Point collecte",
  restitution: "Restitution étude",
  signature: "Signature",
  suivi_annuel: "Suivi annuel",
  autre: "Rendez-vous",
};

const FORMAT_LABELS: Record<string, string> = {
  visio: "visio",
  presentiel: "présentiel",
  telephone: "tél.",
};

function variantForType(type: string | null): AgendaRdv["variant"] {
  switch (type) {
    case "decouverte":
    case "restitution":
      return "ev-gold";
    case "suivi_annuel":
      return "ev-success";
    case "autre":
      return "ev-internal";
    default:
      return "ev-navy";
  }
}

function surnameOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] ?? name;
  return last.toUpperCase();
}

type Personne = { first_name?: string; last_name?: string };
type ClientEmbed = { personnes?: Personne[] | Personne | null };
type DossierEmbed = { clients?: ClientEmbed | ClientEmbed[] | null };

function clientNameOf(dossier: DossierEmbed | undefined): string {
  const client = Array.isArray(dossier?.clients)
    ? dossier?.clients[0]
    : dossier?.clients;
  const persons = client?.personnes;
  const p = Array.isArray(persons) ? persons[0] : persons;
  if (!p) return "Dossier";
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return name || "Dossier";
}

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Début (lundi 00:00 local) de la semaine contenant `ref`. */
function startOfWeek(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // 0 = lundi
  d.setDate(d.getDate() - dow);
  return d;
}

/** "9h00" / "14h30" arrondi à la demi-heure inférieure, comme la maquette. */
function slotKeyOf(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes() < 30 ? "00" : "30";
  return `${h}h${m}`;
}

export const EMPTY_AGENDA: AgendaData = {
  weekLabel: "",
  weekEyebrow: "Mon agenda · semaine courante",
  days: [],
  rdvsBySlot: new Map(),
  kpiWeekCount: 0,
  kpiWeekPresentiel: 0,
  kpiWeekVisio: 0,
  kpiMonthCount: 0,
  kpiMonthLabel: "",
  avgDurationLabel: null,
  publicSlug: "mon-lien",
  publicLink: "priveos.com/rdv/mon-lien",
};

export async function fetchAgenda(): Promise<AgendaData> {
  const ctx = await getSessionContext();
  if (!ctx) return EMPTY_AGENDA;

  const supabase = createAdminClient();
  const now = new Date();

  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Slug public lisible de l'ingénieur (prénom-nom), fallback sur l'id.
  let publicSlug = ctx.userId;
  {
    const { data: me } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", ctx.userId)
      .maybeSingle();
    if (me) {
      const composed = slugify(`${me.first_name ?? ""} ${me.last_name ?? ""}`);
      if (composed) publicSlug = composed;
    }
  }

  // RDV de la semaine courante, au niveau cabinet.
  const { data: rdvRaw } = await supabase
    .from("rdv")
    .select(
      "id, scheduled_at, type, format, duration_minutes, dossier_id, dossiers(clients(personnes(first_name, last_name)))",
    )
    .eq("cabinet_id", ctx.cabinetId)
    .eq("tenant_id", ctx.tenantId)
    .gte("scheduled_at", weekStart.toISOString())
    .lt("scheduled_at", weekEnd.toISOString())
    .order("scheduled_at", { ascending: true });

  type RdvRow = {
    id: string;
    scheduled_at: string | null;
    type: string | null;
    format: string | null;
    duration_minutes: number | null;
    dossiers?: DossierEmbed | DossierEmbed[] | null;
  };
  const rows = (rdvRaw ?? []) as RdvRow[];

  const rdvsBySlot = new Map<string, AgendaRdv>();
  let weekPresentiel = 0;
  let weekVisio = 0;
  let durationSum = 0;
  let durationCount = 0;

  for (const r of rows) {
    if (!r.scheduled_at) continue;
    const d = new Date(r.scheduled_at);
    const dayIndex = (d.getDay() + 6) % 7;
    const slotKey = slotKeyOf(d);
    const dossier = Array.isArray(r.dossiers) ? r.dossiers[0] : r.dossiers;
    const isVisio = r.format === "visio";
    if (isVisio) weekVisio += 1;
    else weekPresentiel += 1;
    if (typeof r.duration_minutes === "number" && r.duration_minutes > 0) {
      durationSum += r.duration_minutes;
      durationCount += 1;
    }

    const item: AgendaRdv = {
      id: r.id,
      scheduledAt: r.scheduled_at,
      dayIndex,
      slotKey,
      surname: surnameOf(clientNameOf(dossier ?? undefined)),
      typeLabel: TYPE_LABELS[r.type ?? ""] ?? "Rendez-vous",
      formatLabel: FORMAT_LABELS[r.format ?? ""] ?? "présentiel",
      isVisio,
      variant: variantForType(r.type),
    };
    // Une case = un RDV ; le 1er positionné gagne le créneau.
    const cellKey = `${dayIndex}:${slotKey}`;
    if (!rdvsBySlot.has(cellKey)) rdvsBySlot.set(cellKey, item);
  }

  // Décompte du mois.
  const { count: monthCount } = await supabase
    .from("rdv")
    .select("id", { count: "exact", head: true })
    .eq("cabinet_id", ctx.cabinetId)
    .eq("tenant_id", ctx.tenantId)
    .gte("scheduled_at", monthStart.toISOString())
    .lt("scheduled_at", monthEnd.toISOString());

  // En-têtes des 7 jours de la semaine.
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  const days: AgendaDayHeader[] = DAY_NAMES.map((name, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      index: i,
      name,
      num: d.getDate(),
      isToday: d.getTime() === todayMidnight.getTime(),
    };
  });

  const lastDay = new Date(weekStart);
  lastDay.setDate(lastDay.getDate() + 6);
  const weekLabel = `Semaine du lundi ${weekStart.getDate()} au dimanche ${lastDay.getDate()} ${MONTHS[lastDay.getMonth()]} ${lastDay.getFullYear()}`;

  const avgDurationLabel =
    durationCount > 0
      ? (() => {
          const avg = Math.round(durationSum / durationCount);
          const h = Math.floor(avg / 60);
          const m = avg % 60;
          if (h > 0 && m > 0) return `${h} h ${m} min`;
          if (h > 0) return `${h} h`;
          return `${m} min`;
        })()
      : null;

  return {
    weekLabel,
    weekEyebrow: "Mon agenda · synchronisé Google Agenda",
    days,
    rdvsBySlot,
    kpiWeekCount: rows.length,
    kpiWeekPresentiel: weekPresentiel,
    kpiWeekVisio: weekVisio,
    kpiMonthCount: monthCount ?? 0,
    kpiMonthLabel: `cumul ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    avgDurationLabel,
    publicSlug,
    publicLink: `priveos.com/rdv/${publicSlug}`,
  };
}
