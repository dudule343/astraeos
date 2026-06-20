import { EditeurTopbar } from "../_components/EditeurTopbar";
import { ExpansionTable } from "./ExpansionTable";
import {
  type Kpi,
  growthKpis,
  volumeKpis,
  ltvKpis,
  chartBars,
} from "./businessData";

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="kpi">
      <span className={`phase-tag ${kpi.phase}`}>
        {kpi.phase === "p1" ? "PHASE 1" : "PHASE 2"}
      </span>
      <div className="kpi-label">{kpi.label}</div>
      <div
        className={kpi.valueCls ? `kpi-value ${kpi.valueCls}` : "kpi-value"}
        style={kpi.valueStyle}
      >
        {kpi.value} <span className="unit">{kpi.unit}</span>
      </div>
      <div className="kpi-meta">{kpi.meta}</div>
      {kpi.compares && (
        <div className="kpi-compare">
          {kpi.compares.map((c) => (
            <div className="kpi-compare-cell" key={c.period}>
              <div className="kpi-compare-period">{c.period}</div>
              <div className={c.cls ? `kpi-compare-value ${c.cls}` : "kpi-compare-value"}>
                {c.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Pilotage business" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Bloc 01 · Pilotage business</div>
            <h1 className="hero-title">Pilotage business</h1>
            <p className="hero-sub">
              Suivi de la croissance financière et commerciale de la plateforme ASTRAEOS — revenus
              récurrents des abonnements, expansion, valeur à long terme.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Ajouter widget">
              Ajouter widget
            </button>
          </div>
        </div>

        {/* Section 1 : Croissance des abonnements (RMR / RAR / Croissance) */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Revenus récurrents</div>
              <div className="section-title">Croissance des abonnements</div>
            </div>
          </div>

          <div className="kpis kpis-3">
            {growthKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </div>

        {/* Section 2 : Évolution du RMR */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Tendance</div>
              <div className="section-title">Évolution du revenu mensuel récurrent</div>
            </div>
            <button className="btn btn-ghost btn-sm" data-stub="12 mois">
              12 mois ▾
            </button>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="chart-area" style={{ height: "220px" }}>
                <div className="chart-bars">
                  {chartBars.map((bar) => (
                    <div className="chart-bar" style={{ height: bar.height }} key={bar.label}>
                      <div className="chart-bar-label">{bar.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  marginTop: "32px",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  textAlign: "center",
                }}
              >
                Croissance constante depuis 12 mois · multiplié par 3,1
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 : Volumétrie clients */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Volumétrie</div>
              <div className="section-title">Mouvement net du portefeuille clients</div>
            </div>
            <div
              style={{
                fontSize: "11.5px",
                color: "var(--navy-300)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg style={{ width: "13px", height: "13px", color: "var(--gold)" }}>
                <use href="#i-calendar" />
              </svg>
              Période : mai 2026 · ajustable via le sélecteur de date
            </div>
          </div>
          <div className="kpis">
            {volumeKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </div>

        {/* Section 4 : Top 5 comptes en expansion */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Top performers</div>
              <div className="section-title">Top 5 des comptes en expansion ce trimestre</div>
            </div>
          </div>
          <div className="info-bar">
            <svg>
              <use href="#i-info" />
            </svg>
            <div>
              Pour chaque compte : ce qu&apos;il <strong>paie en abonnement</strong>, ce qu&apos;il
              a <strong>dépensé chez nous</strong> (packs unitaires), ce qu&apos;il{" "}
              <strong>nous a apporté</strong> (revenu total) et sa <strong>progression</strong> vs
              M-1 et N-1.
            </div>
          </div>
          <ExpansionTable />
        </div>

        {/* Section 5 : Valeur à long terme */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Rentabilité long terme</div>
              <div className="section-title">Valeur à long terme</div>
            </div>
          </div>
          <div className="kpis kpis-3">
            {ltvKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
