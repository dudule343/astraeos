// Espace éditeur — page « Support & qualité » (route /quality).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-quality">, lignes 1909-1995. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";

export const metadata = {
  title: "ASTRAEOS · Support & qualité",
};

const SUPPORT_KPIS = [
  {
    label: "Tickets ouverts",
    value: "12",
    meta: "4 critiques · 8 standards",
  },
  {
    label: "Temps moyen de première réponse",
    value: "2,4",
    unit: "h",
    meta: "objectif < 4h",
  },
  {
    label: "Temps moyen de résolution",
    value: "8,2",
    unit: "h",
    meta: "objectif < 24h",
  },
  {
    label: "Satisfaction support",
    value: "4,7",
    unit: "/5",
    meta: "CSAT moyen",
  },
];

const STABILITE_KPIS = [
  {
    label: "Bugs critiques ouverts",
    value: "2",
    valueColor: "var(--red-text)",
    meta: "à corriger sous 48h",
  },
  {
    label: "Incidents de plateforme",
    value: "0",
    meta: "30 derniers jours · 100 % stable",
  },
  {
    label: "Niveau de service garanti",
    value: "99,8",
    unit: "%",
    meta: "disponibilité contractuelle (SLA)",
  },
];

const N1_RESOLUTION = [
  {
    label: "Cette semaine",
    value: "82",
    meta: "28 résolus / 34 tickets",
    compare: [
      { period: "S-1", value: "▲ 78 %" },
      { period: "S-2", value: "▲ 76 %" },
    ],
  },
  {
    label: "Ce mois",
    value: "79",
    meta: "112 / 142 tickets",
    compare: [
      { period: "M-1", value: "▲ 74 %" },
      { period: "M-2", value: "▲ 71 %" },
    ],
  },
  {
    label: "Ce trimestre",
    value: "76",
    meta: "324 / 426 tickets",
    compare: [
      { period: "T-1", value: "▲ 68 %" },
      { period: "N-1", value: "▲ 58 %" },
    ],
  },
  {
    label: "Cette année",
    value: "73",
    meta: "986 / 1 350 tickets",
    compare: [
      { period: "N-1", value: "▲ 61 %" },
      { period: "N-2", value: "▲ 52 %" },
    ],
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Support & qualité" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Bloc 07 · Support &amp; qualité</div>
            <h1 className="hero-title">Support &amp; qualité</h1>
            <p className="hero-sub">
              Mesurer la qualité du support et la stabilité produit — gestion des tickets,
              résolution de bugs, suivi des incidents de plateforme et satisfaction client.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export" data-stub-mode="toast">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Charge support</div>
              <div className="section-title">Tickets &amp; délais</div>
            </div>
          </div>
          <div className="kpis">
            {SUPPORT_KPIS.map((kpi) => (
              <div className="kpi" key={kpi.label}>
                <span className="phase-tag p1">PHASE 1</span>
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">
                  {kpi.value}
                  {kpi.unit ? (
                    <>
                      {" "}
                      <span className="unit">{kpi.unit}</span>
                    </>
                  ) : null}
                </div>
                <div className="kpi-meta">{kpi.meta}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Stabilité produit</div>
              <div className="section-title">Bugs &amp; incidents</div>
            </div>
          </div>
          <div className="kpis kpis-3">
            {STABILITE_KPIS.map((kpi) => (
              <div className="kpi" key={kpi.label}>
                <span className="phase-tag p1">PHASE 1</span>
                <div className="kpi-label">{kpi.label}</div>
                <div
                  className="kpi-value"
                  style={kpi.valueColor ? { color: kpi.valueColor } : undefined}
                >
                  {kpi.value}
                  {kpi.unit ? (
                    <>
                      {" "}
                      <span className="unit">{kpi.unit}</span>
                    </>
                  ) : null}
                </div>
                <div className="kpi-meta">{kpi.meta}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Premier niveau de support</div>
              <div className="section-title">
                Taux de résolution niveau 1 · évolution temporelle
              </div>
            </div>
          </div>
          <div className="info-bar">
            <svg>
              <use href="#i-info" />
            </svg>
            <div>
              Pourcentage de tickets résolus directement par l&apos;équipe support de premier
              niveau, sans escalade vers le développement.
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div
                className="kpis-3"
                style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}
              >
                {N1_RESOLUTION.map((kpi) => (
                  <div className="kpi" key={kpi.label} style={{ background: "var(--ivory)" }}>
                    <div className="kpi-label">{kpi.label}</div>
                    <div className="kpi-value">
                      {kpi.value} <span className="unit">%</span>
                    </div>
                    <div className="kpi-meta">{kpi.meta}</div>
                    <div className="kpi-compare">
                      {kpi.compare.map((c) => (
                        <div className="kpi-compare-cell" key={c.period}>
                          <div className="kpi-compare-period">{c.period}</div>
                          <div className="kpi-compare-value up">{c.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
