import Link from "next/link";

import { getAssetsFinancierScreen } from "../../_data/assets-financier";
import "../../_styles/assets-financier.css";
import { PlacementsTable } from "./PlacementsTable";

export const metadata = {
  title: "ASTRAEOS · Investissement financier",
};

export const dynamic = "force-dynamic";

/** Icône #i-finance de la maquette : portefeuille / carte. */
const FINANCE_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9H5a2 2 0 1 1 0-4h12" />
    <circle cx="17" cy="14" r="1.4" fill="currentColor" />
  </svg>
);

export default async function AssetsFinancierPage() {
  const screen = await getAssetsFinancierScreen();

  return (
    <div className="px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            {screen.heroTitleLead}
            <strong>{screen.heroTitleStrong}</strong>
          </h1>
          <p className="hero-sub">{screen.heroSub}</p>
        </div>
        <div className="hero-actions">
          <Link className="btn btn-ghost btn-sm" href="/espace-ingenieur/assets">
            ← Retour vue d&apos;ensemble
          </Link>
          {/* Bouton inerte dans la maquette : branché ici sur le feedback
              honnête global (StubShell), bouton actif comme la vue
              d'ensemble plutôt qu'une coquille morte. */}
          <button
            type="button"
            className="btn btn-gold btn-sm"
            data-stub="Export du portefeuille financier"
            data-stub-mode="toast"
            data-stub-body="L'export de votre portefeuille financier sera disponible prochainement."
          >
            Exporter
          </button>
        </div>
      </div>

      {/* 2 KPIs : Encours sous gestion + Clients */}
      <div className="kpis kpis-2 mb-20">
        {screen.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className={`kpi-value${kpi.valueGold ? " gold" : ""}`}>
              {kpi.value} {kpi.unit ? <span className="unit">{kpi.unit}</span> : null}
            </div>
            <div className="kpi-meta">{kpi.meta}</div>
            <div className="kpi-compare-3">
              {kpi.compare.map((cell) => (
                <div key={cell.period}>
                  <div className="kpi-compare-3-period">{cell.period}</div>
                  <div className={`kpi-compare-3-value ${cell.direction}`}>
                    <span className="kpi-compare-3-arrow">
                      {cell.direction === "up" ? "▲" : "▼"}
                    </span>
                    {cell.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Détail de mes placements */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            {FINANCE_ICON}
            {screen.placementsTitle}
          </div>
          <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>
            {screen.placementsCount}
          </span>
        </div>
        <PlacementsTable clients={screen.clients} total={screen.total} />
      </div>

      {/* Top produits placés par l'ingénieur */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">
            {FINANCE_ICON}
            {screen.topProductsTitle}
          </div>
        </div>
        <table className="dt" style={{ fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Produit</th>
              <th className="num">Placements 2026</th>
              <th className="num">Encours</th>
            </tr>
          </thead>
          <tbody>
            {screen.topProducts.map((p, i) => (
              <tr key={p.label}>
                <td>
                  <strong>{p.label}</strong>
                </td>
                <td className={i === 0 ? "num cell-money gold" : "num"}>{p.placements}</td>
                <td className="num cell-money">{p.encours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
