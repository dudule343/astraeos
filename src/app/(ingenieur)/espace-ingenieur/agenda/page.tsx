import Link from "next/link";

import { getAgenda, type KpiCompareCell } from "../../_data/agenda";
import { CopyLinkButton } from "./CopyLinkButton";
import { GoogleSyncButton } from "./GoogleSyncButton";
import { NewRdvModal, OpenRdvButton } from "./NewRdvModal";
import { WeekCalendar } from "./WeekCalendar";
import "./_styles/agenda.css";

export const metadata = {
  title: "ASTRAEOS · Calendrier & rendez-vous",
};

function KpiCompare({ cells }: { cells: KpiCompareCell[] }) {
  return (
    <div className="kpi-compare">
      {cells.map((cell) => (
        <div className="kpi-compare-cell" key={cell.period}>
          <div className="kpi-compare-period">{cell.period}</div>
          <div className={`kpi-compare-value ${cell.direction}`}>
            {cell.direction === "up" ? "▲" : "▼"} {cell.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AgendaPage() {
  const data = await getAgenda();
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
            Vue semaine de votre agenda · connecté à Google Calendar (sync
            activée) et lien public personnel de prise de RDV (style Calendly) à
            partager à vos clients.
          </p>
        </div>
        <div className="hero-actions">
          <GoogleSyncButton />
          <OpenRdvButton />
        </div>
      </div>

      {/* 4 KPIs avec comparaisons */}
      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">RDV cette semaine</div>
          <div className="kpi-value">{data.kpiWeekCount}</div>
          <div className="kpi-meta">{data.kpiWeekMeta}</div>
          <KpiCompare cells={data.kpiWeekCompare} />
        </div>
        <div className="kpi">
          <div className="kpi-label">RDV ce mois</div>
          <div className="kpi-value">{data.kpiMonthCount}</div>
          <div className="kpi-meta">{data.kpiMonthLabel}</div>
          <KpiCompare cells={data.kpiMonthCompare} />
        </div>
        <div className="kpi">
          <div className="kpi-label">Durée moyenne</div>
          <div className="kpi-value">
            {data.avgDurationValue}{" "}
            <span className="unit">{data.avgDurationUnit}</span>
          </div>
          <div className="kpi-meta">{data.avgDurationMeta}</div>
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
        {/* Vue semaine · navigation de semaine réellement active (Client) */}
        <WeekCalendar
          baseWeekLabel={data.weekLabel}
          days={days}
          rdvsBySlot={rdvsBySlot}
          realRdvs={data.realRdvs}
        />

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
                <Link href="/espace-ingenieur/agenda/types" className="types-rdv-config-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
                  </svg>
                  Configurer mes types de RDV
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modale « Nouveau RDV » (Création RDV directe) — Client Component branché */}
      <NewRdvModal />
    </div>
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
