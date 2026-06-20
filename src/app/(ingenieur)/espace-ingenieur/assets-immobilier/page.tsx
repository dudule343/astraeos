import Link from "next/link";

import {
  assetsImmoKpis,
  immoProjects,
  immoProjectsTotal,
  programBreakdown,
  type AssetsImmoKpi,
  type ImmoProjectRow,
} from "../../_data/assets-immobilier";
import "../../_styles/assets-immobilier.css";

export const metadata = {
  title: "ASTRAEOS · Investissement immobilier",
};

/** Picto « courbe + flèche » du titre de carte (symbol #i-business). */
function BusinessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

/** Picto « barres » du titre de carte (symbol #i-chart). */
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <rect x="5" y="13" width="3" height="6" rx=".5" />
      <rect x="11" y="9" width="3" height="10" rx=".5" />
      <rect x="17" y="5" width="3" height="14" rx=".5" />
    </svg>
  );
}

function KpiBlock({ kpi }: { kpi: AssetsImmoKpi }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{kpi.label}</div>
      <div className={`kpi-value${kpi.valueTone === "gold" ? " gold" : ""}`}>
        {kpi.value}
        {kpi.unit ? <span className="unit"> {kpi.unit}</span> : null}
      </div>
      <div className="kpi-meta">{kpi.meta}</div>
      <div className="kpi-compare-3">
        {kpi.compare.map((c) => (
          <div key={c.period}>
            <div className="kpi-compare-3-period">{c.period}</div>
            <div className={`kpi-compare-3-value ${c.direction}`}>
              <span className="kpi-compare-3-arrow">{c.direction === "up" ? "▲" : "▼"}</span>
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectRow({ row }: { row: ImmoProjectRow }) {
  return (
    <tr style={{ cursor: "pointer" }}>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div className="ingenieur-avatar">{row.initials}</div>
          <div className="cell-primary">{row.clientName}</div>
        </div>
      </td>
      <td style={{ lineHeight: 1.9 }}>
        {row.types.map((t, i) => (
          <span key={t}>
            <span
              className="badge badge-gold"
              style={{
                fontSize: "10px",
                display: "inline-block",
                marginBottom: i < row.types.length - 1 ? "3px" : undefined,
              }}
            >
              {t}
            </span>
            {i < row.types.length - 1 ? <br /> : null}
          </span>
        ))}
      </td>
      <td className="nowrap" style={{ fontSize: "11px", lineHeight: 1.9 }}>
        {row.initiationDates.map((d, i) => (
          <span key={i}>
            {d}
            {i < row.initiationDates.length - 1 ? <br /> : null}
          </span>
        ))}
      </td>
      <td className="nowrap" style={{ fontSize: "11px", lineHeight: 1.9 }}>
        {row.deliveryDates.map((d, i) => (
          <span key={i}>
            {d}
            {i < row.deliveryDates.length - 1 ? <br /> : null}
          </span>
        ))}
      </td>
      <td className="num" style={{ verticalAlign: "middle" }}>
        {row.projectsTotal}
      </td>
      <td className="num" style={{ verticalAlign: "middle" }}>
        {row.delay}
      </td>
      <td className="center" style={{ verticalAlign: "middle" }}>
        <Link href="/espace-ingenieur/clients" className="btn btn-ghost btn-sm">
          Voir →
        </Link>
      </td>
    </tr>
  );
}

export default function AssetsImmobilierPage() {
  return (
    <div className="maquette-ing assets-immo-page">
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Assets du portefeuille · investissement immobilier</div>
          <h1 className="hero-title">
            Investissement <strong>immobilier</strong>
          </h1>
          <p className="hero-sub">
            Détail des projets immobiliers de votre portefeuille (LMNP, ancien rénové,
            Projet Denormandie, location nue).
          </p>
        </div>
        <div className="hero-actions">
          <Link href="/espace-ingenieur/assets" className="btn btn-ghost btn-sm">
            ← Retour vue d&apos;ensemble
          </Link>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            disabled
            title="En cours"
          >
            Exporter
          </button>
        </div>
      </div>

      {/* 3 KPIs : Volume + Projets + Ticket moyen */}
      <div className="kpis kpis-3 mb-20">
        {assetsImmoKpis.map((kpi) => (
          <KpiBlock key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Détail de mes projets immobiliers */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <BusinessIcon />
            Détail de mes projets immobiliers
          </div>
          <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>
            {immoProjects.length} projets · cliquez pour le détail client
          </span>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Clients</th>
              <th>Types</th>
              <th>Dates d&apos;initiation</th>
              <th>Dates de livraison</th>
              <th className="num">Projets total</th>
              <th className="num">Délai</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {immoProjects.map((row) => (
              <ProjectRow key={row.clientId} row={row} />
            ))}
            <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
              <td>
                <strong>Total portefeuille</strong>
              </td>
              <td colSpan={3} style={{ textAlign: "center", fontSize: "11.5px" }}>
                {immoProjectsTotal.clientsLabel}
              </td>
              <td className="num">
                <strong>{immoProjectsTotal.projectsTotal}</strong>
              </td>
              <td className="num">{immoProjectsTotal.delayAverage}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Répartition par type de programme */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">
            <ChartIcon />
            Répartition par type de programme du portefeuille
          </div>
        </div>
        <div style={{ padding: "22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px" }}>
            {programBreakdown.map((p) => (
              <div
                key={p.label}
                style={{
                  textAlign: "center",
                  padding: "16px",
                  background: p.muted ? "var(--ivory)" : "var(--gold-100)",
                  borderRadius: "8px",
                  opacity: p.muted ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: p.muted ? "var(--navy-300)" : "var(--gold-deep)",
                  }}
                >
                  {p.count}
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    color: p.muted ? "var(--navy-300)" : "var(--navy)",
                    fontWeight: 600,
                    marginTop: "4px",
                  }}
                >
                  {p.label}
                </div>
                {p.share ? (
                  <div style={{ fontSize: "10px", color: "var(--navy-300)", marginTop: "2px" }}>
                    {p.share}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
