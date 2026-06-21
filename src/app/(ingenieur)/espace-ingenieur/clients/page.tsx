import Link from "next/link";

import { getClientsScreen } from "../../_data/clients-server";
import "../../_styles/clients.css";

import ClientsTable from "./ClientsTable";

export const metadata = {
  title: "ASTRAEOS · Tous mes clients",
};

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const screen = await getClientsScreen();
  const kpiActifs = screen.kpiClientsActifs;
  const kpiRepartition = screen.kpiRepartition;
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
          <div className="kpi-label">{kpiRepartition.label}</div>
          <div className="kpi-value" style={{ fontSize: "24px" }}>
            {kpiRepartition.nbPhysiques}{" "}
            <span style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 500 }}>
              {kpiRepartition.libellePhysiques}
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
            {kpiRepartition.nbMorales}{" "}
            <span style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 500 }}>
              {kpiRepartition.libelleMorales}
            </span>
          </div>
          <div className="kpi-meta">{kpiRepartition.meta}</div>
          <div className="kpi-compare">
            {kpiRepartition.compare.map((cell) => (
              <div className="kpi-compare-cell" key={cell.period}>
                <div className="kpi-compare-period">{cell.period}</div>
                <div className={`kpi-compare-value ${cell.direction}`}>{cell.value}</div>
              </div>
            ))}
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

      {/* Tableau 7 clients · interactions branchées (clic ligne + recherche) */}
      <ClientsTable
        clients={screen.clients}
        cardTitle={screen.cardTitle}
        totalPortefeuille={screen.totalPortefeuille}
        totalMeta={screen.totalMeta}
      />
    </div>
  );
}
