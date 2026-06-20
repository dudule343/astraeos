import Link from "next/link";

import { fetchAgenda, type AgendaRdv } from "../../_data/agenda";
import { CopyLinkButton } from "./CopyLinkButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Calendrier & rendez-vous",
};

/** Créneaux affichés : 9h → 19h par demi-heures, comme la maquette. */
const SLOTS: { key: string; label: string; half: boolean }[] = [];
for (let h = 9; h <= 19; h++) {
  SLOTS.push({ key: `${h}h00`, label: `${h}h`, half: false });
  if (h < 19) SLOTS.push({ key: `${h}h30`, label: `${h}h30`, half: true });
}

/** Plage déjeuner (12h, 12h30, 13h) bloquée du lundi au vendredi. */
const LUNCH_SLOTS = new Set(["12h00", "12h30", "13h00"]);

/** Salle de visio déterministe pour un RDV (même salle côté ingénieur et client). */
function visioRoom(rdv: AgendaRdv): string {
  return `rdv-${rdv.id.slice(0, 8)}`;
}

function EventCard({ rdv }: { rdv: AgendaRdv }) {
  const hourLabel = rdv.slotKey.replace("h00", "h");
  const inner = (
    <>
      <strong>
        {hourLabel} · {rdv.surname}
      </strong>
      <div className="ev-meta">
        {rdv.typeLabel} · {rdv.formatLabel}
        {rdv.isVisio ? (
          <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}> · Visio →</span>
        ) : null}
      </div>
    </>
  );
  // RDV en visio : tout le bloc ouvre la VRAIE salle visio existante (/visio/[room]).
  if (rdv.isVisio) {
    return (
      <Link
        href={`/visio/${visioRoom(rdv)}`}
        className={`agenda-v2-event ${rdv.variant}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        {inner}
      </Link>
    );
  }
  return <div className={`agenda-v2-event ${rdv.variant}`}>{inner}</div>;
}

export default async function AgendaPage() {
  const data = await fetchAgenda();
  const { days, rdvsBySlot } = data;

  return (
    <div className="agenda-page-wrap">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{data.weekEyebrow}</div>
          <h1 className="hero-title">
            Calendrier &amp; <strong>rendez-vous</strong>
          </h1>
          <p className="hero-sub">
            Vue semaine de votre agenda · connecté à Google Calendar et lien
            public personnel de prise de RDV (style Calendly) à partager à vos
            clients.
          </p>
        </div>
        <div className="hero-actions">
          <a
            className="btn btn-ghost btn-sm"
            href="/api/auth/google/start"
            title="Synchroniser votre Google Calendar avec Astraeos"
          >
            <svg
              style={{ width: "13px", height: "13px" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12 L 11 15 L 16 9" />
            </svg>
            <span>Connecter Google Calendar</span>
          </a>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            disabled
            title="En cours de construction"
          >
            + Nouveau RDV
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">RDV cette semaine</div>
          <div className="kpi-value">{data.kpiWeekCount}</div>
          <div className="kpi-meta">
            {data.kpiWeekPresentiel} en présentiel · {data.kpiWeekVisio} en visio
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">RDV ce mois</div>
          <div className="kpi-value">{data.kpiMonthCount}</div>
          <div className="kpi-meta">{data.kpiMonthLabel}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Durée moyenne</div>
          <div className="kpi-value">
            {data.avgDurationLabel ? (
              <span className="unit">{data.avgDurationLabel}</span>
            ) : (
              "—"
            )}
          </div>
          <div className="kpi-meta">sur les RDV de la semaine</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Mon lien public</div>
          <div
            className="kpi-value"
            style={{ fontSize: "13px", wordBreak: "break-all" }}
          >
            {data.publicLink}
          </div>
          <div className="kpi-meta">
            <CopyLinkButton link={data.publicLink} variant="link" />
          </div>
        </div>
      </div>

      {/* 2 colonnes : Calendrier semaine + Panneau */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.4fr 1fr",
          gap: "18px",
          marginBottom: "18px",
        }}
      >
        {/* Vue semaine */}
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
              {data.weekLabel}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: "11px" }} disabled>
                ‹ Semaine
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "11px", background: "var(--ivory)" }}
                disabled
              >
                Aujourd&apos;hui
              </button>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: "11px" }} disabled>
                Semaine ›
              </button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="agenda-v2-grid">
              {/* En-têtes jours */}
              <div />
              {days.map((day) => (
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
                  <FragmentRow key={slot.key}>
                    <div className={`agenda-v2-time-label${slot.half ? " half" : ""}`}>
                      {slot.label}
                    </div>
                    {days.map((day) => {
                      const rdv = rdvsBySlot.get(`${day.index}:${slot.key}`);
                      const isLunch =
                        LUNCH_SLOTS.has(slot.key) && day.index <= 4 && !rdv;
                      const classes = [
                        "agenda-v2-cell",
                        slot.half ? "half-line" : "",
                        day.isToday ? "today-col" : "",
                        isLunch ? "lunch" : "",
                        !rdv && !isLunch ? "is-empty" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <div
                          key={`${slot.key}-${day.index}`}
                          className={classes}
                          style={isLastRow ? { borderBottom: "none" } : undefined}
                        >
                          {rdv ? <EventCard rdv={rdv} /> : null}
                        </div>
                      );
                    })}
                  </FragmentRow>
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
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--navy)",
                  letterSpacing: "0.05em",
                }}
              >
                LÉGENDE
              </span>
              <LegendItem bg="var(--gold-100)" border="var(--gold)" label="Entretien initial" />
              <LegendItem bg="var(--light-blue)" border="var(--navy)" label="Entretien intermédiaire" />
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

        {/* Panneau de droite */}
        <div>
          <div className="card mb-18">
            <div className="card-header">
              <div className="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Mon lien public de prise de RDV
              </div>
            </div>
            <div className="card-body" style={{ padding: "18px 20px" }}>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--navy)",
                  lineHeight: 1.6,
                  marginBottom: "14px",
                }}
              >
                Partagez ce lien avec vos clients et prospects pour qu&apos;ils
                prennent rendez-vous sur les créneaux que vous avez ouverts.
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--ivory)",
                  border: "1px solid var(--ivory-deep)",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  color: "var(--gold-deep)",
                  fontWeight: 600,
                  wordBreak: "break-all",
                  marginBottom: "10px",
                }}
              >
                {data.publicLink}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <CopyLinkButton link={data.publicLink} variant="btn" />
                <Link
                  className="btn btn-ghost btn-sm"
                  style={{
                    flex: 1,
                    fontSize: "11px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  href="/espace-client/suivi"
                >
                  Aperçu
                </Link>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Mes types de RDV proposés
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <RdvTypeRow
                badge="1h"
                title="Entretien initial"
                meta="Découverte besoins · 1er contact client"
                tag="Public"
                tagPrivate={false}
              />
              <RdvTypeRow
                badge="1h"
                title="Entretien intermédiaire à l'étude"
                meta="Précision pendant la production · validation"
                tag="Privé"
                tagPrivate
              />
              <RdvTypeRow
                badge="2h"
                title="Restitution de l'étude"
                meta="Présentation des préconisations · présentiel cabinet"
                tag="Privé"
                tagPrivate
              />
              <RdvTypeRow
                badge="1h"
                title="Entretien de suivi"
                meta="Suivi récurrent · client en portefeuille"
                tag="Public"
                tagPrivate={false}
                last
              />
              <div style={{ padding: "10px 16px 14px", background: "var(--ivory)" }}>
                <button
                  type="button"
                  className="types-rdv-config-link"
                  disabled
                  title="En cours de construction"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
                  </svg>
                  Configurer mes types de RDV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Wrapper neutre : ses enfants restent des cellules directes de la grille. */
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
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

function RdvTypeRow({
  badge,
  title,
  meta,
  tag,
  tagPrivate,
  last = false,
}: {
  badge: string;
  title: string;
  meta: string;
  tag: string;
  tagPrivate: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: last ? "none" : "1px solid var(--ivory-deep)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "var(--gold-100)",
          display: "grid",
          placeItems: "center",
          color: "var(--gold-deep)",
          fontWeight: 700,
          fontSize: "11px",
          flexShrink: 0,
        }}
      >
        {badge}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--navy)" }}>
          {title}
        </div>
        <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>{meta}</div>
      </div>
      <span
        style={{
          fontSize: "9px",
          fontWeight: 700,
          padding: "3px 7px",
          background: tagPrivate ? "var(--light-blue)" : "var(--gold-100)",
          color: tagPrivate ? "var(--navy)" : "var(--gold-deep)",
          borderRadius: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {tag}
      </span>
    </div>
  );
}
