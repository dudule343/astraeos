import Link from "next/link";

import {
  getActiviteScreen,
  type BadgeStyle,
  type EtapeBadge,
} from "../../_data/activite";
import "../../_styles/activite.css";

export const metadata = {
  title: "ASTRAEOS · Mon activité commerciale",
};

export const dynamic = "force-dynamic";

/** Couplet background/color du badge « Type » de RDV, repris de la maquette. */
function typeBadgeStyle(style: BadgeStyle): {
  className: string;
  inline?: React.CSSProperties;
} {
  switch (style.kind) {
    case "gold":
      return { className: "badge badge-gold", inline: { fontSize: "10px" } };
    case "success":
      return { className: "badge badge-success", inline: { fontSize: "10px" } };
    case "info":
      return {
        className: "badge",
        inline: { background: "var(--light-blue)", color: "var(--navy)", fontSize: "10px" },
      };
    case "alert":
      return {
        className: "badge",
        inline: {
          background: "rgba(229,124,75,0.15)",
          color: "var(--orange-text)",
          fontSize: "10px",
        },
      };
  }
}

/** Badge « Étape » dans le tableau des prochains RDV. */
function etapeBadgeStyle(etape: EtapeBadge): {
  className: string;
  inline?: React.CSSProperties;
} {
  switch (etape.style) {
    case "success":
      return { className: "badge badge-success", inline: { fontSize: "9.5px" } };
    case "gold":
      return {
        className: "badge",
        inline: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "9.5px" },
      };
    case "alert":
      return {
        className: "badge",
        inline: {
          background: "rgba(229,124,75,0.15)",
          color: "var(--orange-text)",
          fontSize: "9.5px",
        },
      };
  }
}

// Icônes inlinées (la maquette utilise un sprite <use href="#i-…"/> absent ici).
const IconBusiness = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconLeads = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function MonActiviteCommerciale() {
  const s = getActiviteScreen();

  return (
    <div className="px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{s.heroEyebrow}</div>
          <h1 className="hero-title">
            Mon activité <strong>commerciale</strong>
          </h1>
          <p className="hero-sub">{s.heroSub}</p>
        </div>
        <div className="hero-actions">
          <Link className="btn btn-ghost btn-sm" href="/espace-ingenieur/agenda">
            Voir l&apos;agenda
          </Link>
        </div>
      </div>

      {/* 4 KPIs pilotage */}
      <div className="kpis kpis-4 mb-20">
        {s.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div
              className={`kpi-value${kpi.tone === "gold" ? " gold" : ""}`}
              style={kpi.tone === "alert" ? { color: "var(--orange-text)" } : undefined}
            >
              {kpi.value}
              {kpi.unit && <span className="unit"> {kpi.unit}</span>}
            </div>
            <div className="kpi-meta">{kpi.meta}</div>
          </div>
        ))}
      </div>

      {/* Performance par étape du parcours · header navy + body blanc */}
      <div className="card mb-18">
        <div className="card-header act-delais-header">
          <div className="card-title">
            <IconBusiness />
            {s.delaisTitre}
          </div>
          <span className="act-delais-meta">{s.delaisMeta}</span>
        </div>
        <div className="act-delais-body">
          <div className="act-delais-grid">
            {s.delais.map((d) => (
              <div
                className={`act-delais-col${d.cumul ? " cumul" : ""}`}
                key={d.step}
              >
                <div className="act-delais-step">{d.step}</div>
                <div className="act-delais-value">
                  {d.jours} <span className="unit">jours</span>
                </div>
                <div className="act-delais-transition">{d.transition}</div>
                <div className={`act-delais-ecart ${d.ecartTone}`}>{d.ecart}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions en retard + Sources d'acquisition */}
      <div className="act-two-col">
        {/* Actions en retard */}
        <div className="card">
          <div className="card-header">
            <div className="card-title act-card-title-orange">
              <IconAlert />
              Mes actions en retard
            </div>
            <span className="badge act-badge-orange">{s.actionsBadge}</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {s.actions.map((a) => (
              <div className="act-action-row" key={a.titre}>
                <div className={`act-action-dot ${a.severity}`} />
                <div className="act-action-body">
                  <div className="act-action-titre">{a.titre}</div>
                  <div className="act-action-detail">{a.detail}</div>
                </div>
                <Link className="btn btn-ghost btn-sm act-action-cta" href={a.href}>
                  {a.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Sources d'acquisition */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconLeads />
              Mes sources d&apos;acquisition
            </div>
            <span className="act-card-meta">{s.sourcesMeta}</span>
          </div>
          <div className="act-sources-body">
            {s.sources.map((src) => (
              <div className="act-source" key={src.label}>
                <div className="act-source-head">
                  <strong>{src.label}</strong>
                  <span
                    className={`act-source-count ${src.countGold ? "gold" : "navy"}`}
                  >
                    {src.count}
                  </span>
                </div>
                <div className="act-source-bar">
                  <span className={src.barStyle} style={{ width: src.pct }} />
                </div>
              </div>
            ))}
            <div className="act-sources-lecture">
              <strong>Lecture :</strong> {s.sourcesLecture}
            </div>
          </div>
        </div>
      </div>

      {/* Mes prochains rendez-vous */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <IconCalendar />
            Mes prochains rendez-vous
          </div>
          <span className="act-card-meta">{s.rdvMeta}</span>
        </div>
        <table className="dt" style={{ fontSize: "12.5px" }}>
          <thead>
            <tr>
              <th>Date &amp; heure</th>
              <th>Client</th>
              <th>Type</th>
              <th>Lieu</th>
              <th className="center">Étape</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {s.rdv.map((r) => {
              const type = typeBadgeStyle(r.typeStyle);
              const etape = etapeBadgeStyle(r.etape);
              return (
                <tr key={`${r.date}-${r.client}`}>
                  <td className="nowrap">
                    <strong>{r.date}</strong>
                    {r.dateMeta && <div className="act-rdv-date-meta">{r.dateMeta}</div>}
                  </td>
                  <td>
                    <strong>{r.client}</strong>
                  </td>
                  <td>
                    <span className={type.className} style={type.inline}>
                      {r.typeLabel}
                    </span>
                  </td>
                  <td>{r.lieu}</td>
                  <td className="center">
                    <span className={etape.className} style={etape.inline}>
                      {r.etape.label}
                    </span>
                  </td>
                  <td className="center">
                    {/* « Préparer » ouvre la vraie fiche client ingénieur. */}
                    <Link className="btn btn-ghost btn-sm" href={r.href}>
                      Préparer
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
