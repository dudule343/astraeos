import Link from "next/link";

import "../../_styles/maquette.css";
import "../../_styles/assets-assurance.css";
import { getAssetsAssurance } from "../../_data/assets-assurance";

export const dynamic = "force-dynamic";

const BASE = "/espace-ingenieur";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Assets · Assurance",
};

/* Pictos copiés tels quels depuis les symboles SVG de la maquette. */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const QualityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9.5-4.5-1-8-4.5-8-9.5V6l8-3z" />
    <path d="M9 12l2.5 2.5L16 10" />
  </svg>
);

export default function AssetsAssurancePage() {
  const data = getAssetsAssurance();

  return (
    <div className="maquette-ing px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Assets du portefeuille · assurance</div>
          <h1 className="hero-title">
            <strong>Assurance</strong>
          </h1>
          <p className="hero-sub">
            Détail des contrats d&apos;assurance distribués via votre portefeuille (emprunteur
            immo, prêt conso, prévoyance pro, mutuelle dirigeant, homme clé). Frais de dossier
            appliqués au client.
          </p>
        </div>
        <div className="hero-actions">
          <Link href={`${BASE}/assets`} className="btn btn-ghost btn-sm">
            ← Retour vue d&apos;ensemble
          </Link>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            disabled
            title="Export en cours de construction"
          >
            Exporter
          </button>
        </div>
      </div>

      {/* 3 KPIs : Contrats actifs + Clients + Frais appliqués clients */}
      <div className="kpis kpis-3 mb-20">
        {data.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className={`kpi-value${kpi.goldValue ? " gold" : ""}`}>
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
                    {c.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Détail de mes contrats d'assurance */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <ShieldIcon />
            Détail de mes contrats d&apos;assurance
          </div>
          <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>
            {data.total.contracts} contrats actifs · cliquez pour le détail client
          </span>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Clients</th>
              <th className="num">Contrats actifs</th>
              <th>Types souscrits</th>
              <th>Dates de souscription</th>
              <th className="num">Frais de dossier perçus</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map((c) => (
              <tr key={c.clientId} className="dt-clickable">
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <div className="ingenieur-avatar">{c.initials}</div>
                    <Link href={`${BASE}/clients`} className="cell-primary" style={{ textDecoration: "none" }}>
                      {c.name}
                    </Link>
                  </div>
                </td>
                <td className="num" style={{ verticalAlign: "middle" }}>
                  {c.contracts.length}
                </td>
                <td style={{ lineHeight: 1.9 }}>
                  {c.contracts.map((ct, i) => (
                    <span key={i}>
                      <span
                        className="badge badge-gold"
                        style={{ fontSize: "10px", display: "inline-block", marginBottom: "3px" }}
                      >
                        {ct.label}
                      </span>
                      {i < c.contracts.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </td>
                <td className="nowrap" style={{ fontSize: "11px", lineHeight: 1.9 }}>
                  {c.contracts.map((ct, i) => (
                    <span key={i}>
                      {ct.date}
                      {i < c.contracts.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </td>
                <td className="num cell-money gold" style={{ verticalAlign: "middle" }}>
                  {c.fees}
                </td>
                <td className="center" style={{ verticalAlign: "middle" }}>
                  <Link href={`${BASE}/clients`} className="btn btn-ghost btn-sm">
                    Voir →
                  </Link>
                </td>
              </tr>
            ))}
            <tr className="dt-total">
              <td>
                <strong>Total portefeuille</strong>
              </td>
              <td className="num">
                <strong>{data.total.contracts}</strong>
              </td>
              <td colSpan={2} style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy)" }}>
                {data.total.clientsLabel}
              </td>
              <td className="num cell-money gold">{data.total.fees}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Top produits d'assurance placés par le portefeuille */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">
            <QualityIcon />
            Top produits d&apos;assurance placés par le portefeuille
          </div>
        </div>
        <table className="dt" style={{ fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Produit</th>
              <th className="num">Contrats</th>
              <th className="num">Frais perçus</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.map((p) => (
              <tr key={p.product}>
                <td>
                  <strong>{p.product}</strong>
                </td>
                <td className={`num cell-money${p.goldCount ? " gold" : ""}`}>{p.contracts}</td>
                <td className="num cell-money">{p.fees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
