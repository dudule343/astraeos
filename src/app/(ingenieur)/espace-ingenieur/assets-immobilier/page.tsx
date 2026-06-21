import Link from "next/link";

import { getAssetsImmobilier, type AssetsImmoKpi } from "../../_data/assets-immobilier";
import "../../_styles/assets-immobilier.css";
import { ExportImmoButton } from "./ExportImmoButton";
import { ProjectsTable } from "./ProjectsTable";

export const metadata = {
  title: "ASTRAEOS · Investissement immobilier",
};

export const dynamic = "force-dynamic";

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

export default async function AssetsImmobilierPage() {
  const screen = await getAssetsImmobilier();

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
          <ExportImmoButton screen={screen} />
        </div>
      </div>

      {/* 3 KPIs : Volume + Projets + Ticket moyen */}
      <div className="kpis kpis-3 mb-20">
        {screen.kpis.map((kpi) => (
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
            {screen.projects.length} projets · cliquez pour le détail client
          </span>
        </div>
        <ProjectsTable projects={screen.projects} total={screen.projectsTotal} />
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
            {screen.breakdown.map((p) => (
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
