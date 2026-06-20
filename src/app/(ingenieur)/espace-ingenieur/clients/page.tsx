import Link from "next/link";

import { getClientsScreen, type Client, type StatutVariant } from "../../_data/clients";
import "../../_styles/clients.css";

export const metadata = {
  title: "ASTRAEOS · Tous mes clients",
};

export const dynamic = "force-dynamic";

/** Couplets background/color du badge de statut, repris à l'identique de la maquette. */
const STATUT_STYLE: Record<StatutVariant, { background: string; color: string }> = {
  gold: { background: "var(--gold-100)", color: "var(--gold-deep)" },
  orange: { background: "rgba(229,124,75,0.15)", color: "var(--orange-text)" },
  info: { background: "var(--light-blue)", color: "var(--navy)" },
  green: { background: "#E8F5EE", color: "var(--green-text)" },
};

function TypeBadge({ type }: { type: Client["type"] }) {
  if (type === "Personne morale") {
    return (
      <span
        className="badge"
        style={{ background: "var(--light-blue)", color: "var(--navy)", fontSize: "9.5px" }}
      >
        Personne morale
      </span>
    );
  }
  return (
    <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
      Personne physique
    </span>
  );
}

export default function ClientsPage() {
  const screen = getClientsScreen();
  const kpiActifs = screen.kpiClientsActifs;
  const kpiTicket = screen.kpiTicketMoyen;

  return (
    <div className="px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            Mes <strong>clients</strong>
          </h1>
          <p className="hero-sub">{screen.heroSub}</p>
        </div>
        <div className="hero-actions">
          <Link className="btn btn-gold btn-sm" href="/espace-ingenieur/client-new">
            + Créer un espace client
          </Link>
        </div>
      </div>

      {/* 3 KPIs principaux avec comparaisons */}
      <div className="kpis kpis-3 mb-20">
        <div className="kpi">
          <div className="kpi-label">{kpiActifs.label}</div>
          <div className="kpi-value">{kpiActifs.value}</div>
          <div className="kpi-meta">{kpiActifs.meta}</div>
          <div className="kpi-compare">
            {kpiActifs.compare.map((cell) => (
              <div className="kpi-compare-cell" key={cell.period}>
                <div className="kpi-compare-period">{cell.period}</div>
                <div className={`kpi-compare-value ${cell.direction}`}>
                  {cell.direction === "up" ? "▲" : "▼"} {cell.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">
            Répartition personnes physiques / personnes morales
          </div>
          <div className="kpi-value" style={{ fontSize: "24px" }}>
            6{" "}
            <span style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 500 }}>
              personnes physiques
            </span>{" "}
            <span
              style={{
                fontSize: "18px",
                color: "var(--navy-300)",
                fontWeight: 400,
                margin: "0 8px",
              }}
            >
              ·
            </span>{" "}
            1{" "}
            <span style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 500 }}>
              personne morale
            </span>
          </div>
          <div className="kpi-meta">
            6 personnes physiques (couples ou seuls) · 1 personne morale (SAS)
          </div>
          <div className="kpi-compare">
            <div className="kpi-compare-cell">
              <div className="kpi-compare-period">M-1</div>
              <div className="kpi-compare-value up">P. physiques ▲ +1</div>
            </div>
            <div className="kpi-compare-cell">
              <div className="kpi-compare-period">N-1</div>
              <div className="kpi-compare-value up">P. physiques ▲ +2 · P. morale =</div>
            </div>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{kpiTicket.label}</div>
          <div className="kpi-value gold">
            {kpiTicket.valueAmount} <span className="unit">€</span>
          </div>
          <div className="kpi-meta">{kpiTicket.meta}</div>
          <div className="kpi-compare">
            {kpiTicket.compare.map((cell) => (
              <div className="kpi-compare-cell" key={cell.period}>
                <div className="kpi-compare-period">{cell.period}</div>
                <div className={`kpi-compare-value ${cell.direction}`}>
                  {cell.direction === "up" ? "▲" : "▼"} {cell.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau 7 clients */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="8" r="3" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
              <path d="M14 16.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" />
            </svg>
            {screen.cardTitle}
          </div>
          <div className="search-wrap" style={{ marginLeft: "auto" }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.5-4.5" />
            </svg>
            <input className="search-input" placeholder="Rechercher un client..." />
          </div>
        </div>
        <table className="dt" style={{ fontSize: "12.5px" }}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Date 1ère étude</th>
              <th>Dernière interaction</th>
              <th className="num">CA généré 2026</th>
              <th className="center">Statut</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {screen.clients.map((client) => {
              const statut = STATUT_STYLE[client.statutVariant];
              const ficheHref = `/espace-ingenieur/clients/${client.slug}`;
              return (
                <tr key={client.nom} className="dt-clickable">
                  <td>
                    <Link
                      href={ficheHref}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        textDecoration: "none",
                      }}
                    >
                      <div className="ingenieur-avatar">{client.initiales}</div>
                      <div>
                        <div className="cell-primary">{client.nom}</div>
                        <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                          {client.details}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <TypeBadge type={client.type} />
                  </td>
                  <td className="nowrap">{client.date1ereEtude}</td>
                  <td className="nowrap">{client.derniereInteraction}</td>
                  <td className={`num cell-money${client.caGold ? " gold" : ""}`}>
                    {client.caGenere2026}
                  </td>
                  <td className="center">
                    <span
                      className="badge"
                      style={{ background: statut.background, color: statut.color, fontSize: "9.5px" }}
                    >
                      {client.statutLabel}
                    </span>
                  </td>
                  <td className="center">
                    {/* Ouvre la vraie fiche client ingénieur (route clients/[id],
                        écran page-ing-fiche-client déjà branché sur _data/fiche-client). */}
                    <Link className="btn btn-ghost btn-sm" href={ficheHref}>
                      Voir →
                    </Link>
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
              <td colSpan={4}>
                <strong>Total portefeuille</strong>
              </td>
              <td className="num cell-money gold">{screen.totalPortefeuille}</td>
              <td
                colSpan={2}
                style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy)" }}
              >
                {screen.totalMeta}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
