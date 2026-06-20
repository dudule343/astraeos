import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { IngenieursClient } from "./IngenieursClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Mes ingénieurs",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Mes ingénieurs" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Cabinet Paris Étoile · 5 ingénieurs patrimoniaux</div>
            <h1 className="hero-title">
              Performance des <strong>ingénieurs</strong> au sein du cabinet
            </h1>
            <p className="hero-sub">
              Vue agrégée de la production des 5 ingénieurs patrimoniaux du cabinet. Pilotage de la
              formation, certifications, ancienneté et productivité par ingénieur et par individu.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
            <button className="btn btn-gold btn-sm">
              <svg>
                <use href="#i-comms" />
              </svg>
              Communication formation
            </button>
          </div>
        </div>

        {/* KPIs · Performance des ingénieurs du cabinet */}
        <div
          className="kpis kpis-5 mb-20"
          style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}
        >
          <div className="kpi">
            <div className="kpi-label">Ingénieurs actifs</div>
            <div className="kpi-value">5</div>
            <div className="kpi-meta">4 ingénieurs + vous (dirigeant-praticien)</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">CA moyen par ingénieur</div>
            <div className="kpi-value">
              218 220 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">cumul 2026 · 1 091 100 € / 5 ingénieurs</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Études générées</div>
            <div className="kpi-value">23</div>
            <div className="kpi-meta">cumul 2026 · 4,6 / ingénieur</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Certifications à jour</div>
            <div className="kpi-value">
              5 <span className="unit">/ 5</span>
            </div>
            <div className="kpi-meta">IAS · CIF · ORIAS · à jour</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Ancienneté moyenne</div>
            <div className="kpi-value">
              4,8 <span className="unit">ans</span>
            </div>
            <div className="kpi-meta">au sein du Cabinet Paris Étoile</div>
          </div>
        </div>

        {/* Filtres + tableau · tris par période */}
        <IngenieursClient />
      </div>
    </>
  );
}
