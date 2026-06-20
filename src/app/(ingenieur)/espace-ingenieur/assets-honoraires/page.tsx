import Link from "next/link";

import { honorairesKpis, etudesMissions, repartitionMissions } from "../../_data/assets-honoraires";
import "../../_styles/assets-honoraires.css";
import { HonorairesTable } from "./HonorairesTable";

export const metadata = {
  title: "ASTRAEOS · Honoraires de conseil",
};

/** Picto document (sprite #i-doc de la maquette), inliné. */
function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

/** Picto graphique (sprite #i-chart de la maquette), inliné. */
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="20" x2="20" y2="20" />
      <rect x="6" y="12" width="3" height="6" />
      <rect x="11" y="8" width="3" height="10" />
      <rect x="16" y="4" width="3" height="14" />
    </svg>
  );
}

export default function AssetsHonorairesPage() {
  return (
    <div className="assets-honoraires-page-wrap">
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Assets du portefeuille · honoraires de conseil</div>
          <h1 className="hero-title">
            Honoraires <strong>de conseil</strong>
          </h1>
          <p className="hero-sub">
            Détail de vos études patrimoniales facturées · études réalisées, frais
            d&apos;études, honoraires moyens.
          </p>
        </div>
        <div className="hero-actions">
          <Link href="/espace-ingenieur/assets" className="btn btn-ghost btn-sm">
            ← Retour vue d&apos;ensemble
          </Link>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            data-stub="Exporter les honoraires de conseil"
            data-stub-body="L'export du détail de vos honoraires de conseil sera disponible dans une prochaine itération."
          >
            Exporter
          </button>
        </div>
      </div>

      {/* 3 KPIs : Études réalisées + Honoraires + Honoraire moyen */}
      <div className="kpis kpis-3 mb-20">
        {honorairesKpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className={`kpi-value${kpi.valueGold ? " gold" : ""}`}>
              {kpi.value}
              {kpi.unit ? <span className="unit"> {kpi.unit}</span> : null}
            </div>
            <div className="kpi-meta">{kpi.meta}</div>
            <div className="kpi-compare-3">
              {kpi.compare.map((c) => (
                <div key={c.period}>
                  <div className="kpi-compare-3-period">{c.period}</div>
                  <div className={`kpi-compare-3-value ${c.dir}`}>
                    <span className="kpi-compare-3-arrow">{c.dir === "up" ? "▲" : "▼"}</span>
                    {c.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Détail de mes études patrimoniales */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <IconDoc />
            Détail de mes études patrimoniales
          </div>
          <span className="card-header-note">
            {etudesMissions.length} études réalisées · cliquez pour le détail client
          </span>
        </div>
        <HonorairesTable />
      </div>

      {/* Répartition par type de mission du portefeuille */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">
            <IconChart />
            Répartition par type de mission du portefeuille
          </div>
        </div>
        <div className="card-body hon-repartition-body">
          <div className="hon-repartition-grid">
            {repartitionMissions.map((r) => (
              <div className="hon-repartition-tile" key={r.label}>
                <div className="hon-repartition-count">{r.count}</div>
                <div className="hon-repartition-label">{r.label}</div>
                <div className="hon-repartition-meta">{r.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
