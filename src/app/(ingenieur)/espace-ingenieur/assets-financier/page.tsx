import Link from "next/link";

import { getAssetsFinancierScreen } from "../../_data/assets-financier";
import "../../_styles/assets-financier.css";

export const metadata = {
  title: "ASTRAEOS · Investissement financier",
};

export const dynamic = "force-dynamic";

const FINANCE_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

/** Slug stable pour brancher la ligne sur la fiche client réelle. */
function clientSlug(initiales: string): string {
  return initiales.toLowerCase();
}

export default function AssetsFinancierPage() {
  const screen = getAssetsFinancierScreen();

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
          {/* L'export PDF/Excel du portefeuille n'est pas encore câblé :
              bouton honnête désactivé plutôt qu'une coquille morte. */}
          <button className="btn btn-gold btn-sm" disabled title="En cours">
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
              {kpi.value}
              {kpi.unit ? <span className="unit"> {kpi.unit}</span> : null}
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
        <table className="dt">
          <thead>
            <tr>
              <th>Clients</th>
              <th className="num">Contrats actifs</th>
              <th>Types souscrits</th>
              <th>Dates de souscription</th>
              <th className="num">Encours total</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {screen.clients.map((client) => {
              const href = `/espace-ingenieur/clients/${clientSlug(client.initiales)}`;
              return (
                <tr key={client.nom} className="dt-clickable">
                  <td>
                    <Link
                      href={href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        textDecoration: "none",
                      }}
                    >
                      <div className="ingenieur-avatar">{client.initiales}</div>
                      <div className="cell-primary">{client.nom}</div>
                    </Link>
                  </td>
                  <td className="num" style={{ verticalAlign: "middle" }}>
                    {client.contratsActifs}
                  </td>
                  <td style={{ lineHeight: "1.9" }}>
                    {client.types.map((t, i) => (
                      <span key={t.label}>
                        <span
                          className="badge badge-gold"
                          style={{
                            fontSize: "10px",
                            display: "inline-block",
                            marginBottom: i < client.types.length - 1 ? "3px" : undefined,
                          }}
                        >
                          {t.label}
                        </span>
                        {i < client.types.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </td>
                  <td className="nowrap" style={{ fontSize: "11px", lineHeight: "1.9" }}>
                    {client.dates.map((d, i) => (
                      <span key={d}>
                        {d}
                        {i < client.dates.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </td>
                  <td className="num cell-money gold" style={{ verticalAlign: "middle" }}>
                    {client.encoursTotal}
                  </td>
                  <td className="center" style={{ verticalAlign: "middle" }}>
                    <Link className="btn btn-ghost btn-sm" href={href}>
                      Voir →
                    </Link>
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
              <td>
                <strong>Total portefeuille</strong>
              </td>
              <td className="num">
                <strong>{screen.total.contratsActifs}</strong>
              </td>
              <td
                colSpan={2}
                style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy)" }}
              >
                {screen.total.meta}
              </td>
              <td className="num cell-money gold">{screen.total.encoursTotal}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
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
