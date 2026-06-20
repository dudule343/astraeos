"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AgendaDayHeader, AgendaRdv } from "../../_data/agenda";
import { OPEN_NEW_RDV_EVENT, type OpenNewRdvDetail } from "./NewRdvModal";

/**
 * Carte « Vue semaine » de l'agenda — Client Component pour que la navigation
 * de semaine (‹ Semaine · Aujourd'hui · Semaine ›) AGISSE réellement, au lieu
 * des boutons inertes de la maquette mono-semaine.
 *
 * La grille d'événements est synchronisée Google Agenda sur la semaine de base
 * (lundi 11 mai 2026). Naviguer décale honnêtement le libellé de semaine et la
 * numérotation des jours ; les autres semaines n'affichent pas d'événement (rien
 * n'y est encore synchronisé), mais leurs créneaux libres restent cliquables
 * pour créer un RDV. « Aujourd'hui » revient sur la semaine de base.
 */

const SLOTS: { key: string; label: string; half: boolean }[] = [];
for (let h = 9; h <= 19; h++) {
  SLOTS.push({ key: `${h}h00`, label: `${h}h`, half: false });
  if (h < 19) SLOTS.push({ key: `${h}h30`, label: `${h}h30`, half: true });
}

const LUNCH_SLOTS = new Set(["12h00", "12h30", "13h00"]);

/** Lundi de la semaine de base (11 mai 2026), point d'ancrage des décalages. */
const BASE_MONDAY = new Date(2026, 4, 11);

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

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function weekLabelFor(monday: Date): string {
  const sunday = addDays(monday, 6);
  const left = `${monday.getDate()} ${MONTHS[monday.getMonth()]}`;
  const right = `${sunday.getDate()} ${MONTHS[sunday.getMonth()]} ${sunday.getFullYear()}`;
  return `Semaine du lundi ${left} au dimanche ${right}`;
}

function EventCard({ rdv }: { rdv: AgendaRdv }) {
  return (
    <Link
      href={rdv.href}
      className={`agenda-v2-event ${rdv.variant}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <strong>
        {rdv.hourLabel} · {rdv.surname}
      </strong>
      <div className="ev-meta">{rdv.metaLabel}</div>
    </Link>
  );
}

function openNewRdv(slotKey: string, dayLabel: string) {
  window.dispatchEvent(
    new CustomEvent<OpenNewRdvDetail>(OPEN_NEW_RDV_EVENT, {
      detail: { heureDebut: slotKey, jour: dayLabel },
    }),
  );
}

export function WeekCalendar({
  baseWeekLabel,
  days,
  rdvsBySlot,
}: {
  baseWeekLabel: string;
  days: AgendaDayHeader[];
  /** map "dayIndex:slotKey" -> RDV, valable uniquement sur la semaine de base */
  rdvsBySlot: Map<string, AgendaRdv>;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const isBaseWeek = weekOffset === 0;

  const monday = useMemo(
    () => addDays(BASE_MONDAY, weekOffset * 7),
    [weekOffset],
  );

  // Jours affichés : sur la semaine de base, on garde les en-têtes fournis
  // (avec « auj. »). Sinon on recalcule numéros + libellés à partir du lundi.
  const displayDays: AgendaDayHeader[] = useMemo(() => {
    if (isBaseWeek) return days;
    return days.map((d) => {
      const date = addDays(monday, d.index);
      return {
        ...d,
        num: date.getDate(),
        fullLabel: `${capitalize(d.name)} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
        isToday: false,
      };
    });
  }, [days, isBaseWeek, monday]);

  const weekLabel = isBaseWeek ? baseWeekLabel : weekLabelFor(monday);

  return (
    <div className="card">
      <div
        className="card-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {weekLabel}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "11px" }}
            onClick={() => setWeekOffset((o) => o - 1)}
            title="Semaine précédente"
          >
            ‹ Semaine
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{
              fontSize: "11px",
              background: isBaseWeek ? "var(--ivory)" : undefined,
            }}
            onClick={() => setWeekOffset(0)}
            disabled={isBaseWeek}
            title="Revenir à la semaine courante"
          >
            Aujourd&apos;hui
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "11px" }}
            onClick={() => setWeekOffset((o) => o + 1)}
            title="Semaine suivante"
          >
            Semaine ›
          </button>
        </div>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <div className="agenda-v2-grid">
          {/* En-têtes jours */}
          <div />
          {displayDays.map((day) => (
            <div
              key={`head-${day.index}`}
              className={`agenda-v2-day-header${day.isToday ? " today" : ""}`}
              style={day.index === 6 ? { borderRight: "none" } : undefined}
            >
              <div className="day-name">
                {day.name}
                {day.isToday ? " · auj." : ""}
              </div>
              <div className="day-num">{day.num}</div>
            </div>
          ))}

          {/* Lignes horaires */}
          {SLOTS.map((slot, slotIdx) => {
            const isLastRow = slotIdx === SLOTS.length - 1;
            return (
              <Fragment key={slot.key}>
                <div className={`agenda-v2-time-label${slot.half ? " half" : ""}`}>
                  {slot.label}
                </div>
                {displayDays.map((day) => {
                  // Les événements ne valent que pour la semaine de base.
                  const rdv = isBaseWeek
                    ? rdvsBySlot.get(`${day.index}:${slot.key}`)
                    : undefined;
                  const isLunch =
                    LUNCH_SLOTS.has(slot.key) && day.index <= 4 && !rdv;
                  const isEmpty = !rdv && !isLunch;
                  const classes = [
                    "agenda-v2-cell",
                    slot.half ? "half-line" : "",
                    day.isToday ? "today-col" : "",
                    isLunch ? "lunch" : "",
                    isEmpty ? "is-empty" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const cellStyle = isLastRow
                    ? { borderBottom: "none" as const }
                    : undefined;
                  if (isEmpty) {
                    return (
                      <div
                        key={`${slot.key}-${day.index}`}
                        className={classes}
                        style={cellStyle}
                        onClick={() => openNewRdv(slot.key, day.fullLabel)}
                      />
                    );
                  }
                  return (
                    <div
                      key={`${slot.key}-${day.index}`}
                      className={classes}
                      style={cellStyle}
                    >
                      {rdv ? <EventCard rdv={rdv} /> : null}
                    </div>
                  );
                })}
              </Fragment>
            );
          })}
        </div>

        {/* Légende */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            alignItems: "center",
            padding: "12px 18px",
            background: "var(--ivory-deep)",
            borderTop: "1px solid var(--navy-100)",
            fontSize: "10.5px",
            color: "var(--navy-300)",
          }}
        >
          <span style={{ fontWeight: 700, color: "var(--navy)", letterSpacing: "0.05em" }}>
            LÉGENDE
          </span>
          <LegendItem bg="var(--gold-100)" border="var(--gold)" label="Entretien initial" />
          <LegendItem bg="var(--light-blue)" border="var(--navy)" label="Entretien intermédiaire" />
          <LegendItem bg="var(--gold-100)" border="var(--gold-deep)" label="Restitution de l'étude" />
          <LegendItem bg="#E8F5EE" border="#2EA85A" label="Entretien de suivi" />
          <LegendItem
            bg="rgba(112,129,150,0.12)"
            border="var(--navy-300)"
            label="Interne · équipe"
          />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              marginLeft: "auto",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "10px",
                background:
                  "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(112,129,150,0.2) 3px, rgba(112,129,150,0.2) 6px)",
              }}
            />
            Plage déjeuner
          </span>
        </div>
      </div>
    </div>
  );
}

function Fragment({ children }: { children: React.ReactNode; key?: string }) {
  return <>{children}</>;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function LegendItem({ bg, border, label }: { bg: string; border: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
      <span
        style={{
          display: "inline-block",
          width: "12px",
          height: "10px",
          background: bg,
          borderLeft: `3px solid ${border}`,
        }}
      />
      {label}
    </span>
  );
}
