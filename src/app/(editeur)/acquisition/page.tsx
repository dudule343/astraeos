import { EditeurTopbar } from "../_components/EditeurTopbar";

const FUNNEL_STAGES = [
  { label: "Visiteurs site web", width: 100, num: "4 280", pct: "100 %", gold: false },
  { label: "Leads qualifiés", width: 18, num: "312", pct: "7,3 %", gold: false },
  { label: "Essais gratuits démarrés", width: 9, num: "42", pct: "1,0 %", gold: false },
  { label: "Clients convertis", width: 5, num: "23", pct: "0,5 %", gold: true },
] as const;

const VOLUME_KPIS = [
  { label: "Visiteurs site web", value: "4 280", meta: <>30 derniers jours · <strong className="up">▲ +14 %</strong></> },
  { label: "Leads qualifiés", value: "312", meta: <>contactables · <strong className="up">▲ +8 %</strong></> },
  { label: "Essais gratuits en cours", value: "4", meta: <>démarrés &lt; 30 jours</> },
  { label: "Clients convertis", value: "3", meta: <>signés en mai 2026</> },
] as const;

const CONVERSION_KPIS = [
  {
    label: "Coût d'acquisition par canal",
    value: "3 200 ",
    unit: "€",
    meta: "moyenne pondérée tous canaux",
  },
  {
    label: "Durée moyenne de conversion",
    value: "28 ",
    unit: "jours",
    meta: "premier contact → signature",
  },
  {
    label: "Taux de conversion global",
    value: "7,4 ",
    unit: "%",
    meta: "essai → client payant",
  },
] as const;

type Badge = { label: string; variant: "success" | "warning" };

const SOURCE_ROWS: {
  source: string;
  visiteurs: string;
  leads: string;
  essais: string;
  convertis: string;
  coutTotal: string;
  coutClient: string;
  coutClientGold: boolean;
  badge: Badge;
}[] = [
  {
    source: "Recommandation client",
    visiteurs: "312",
    leads: "68",
    essais: "14",
    convertis: "9",
    coutTotal: "0 €",
    coutClient: "0 €",
    coutClientGold: true,
    badge: { label: "Excellent", variant: "success" },
  },
  {
    source: "Recherche organique",
    visiteurs: "1 480",
    leads: "112",
    essais: "12",
    convertis: "6",
    coutTotal: "2 400 €",
    coutClient: "400 €",
    coutClientGold: false,
    badge: { label: "Excellent", variant: "success" },
  },
  {
    source: "LinkedIn Ads",
    visiteurs: "1 240",
    leads: "82",
    essais: "10",
    convertis: "5",
    coutTotal: "12 800 €",
    coutClient: "2 560 €",
    coutClientGold: false,
    badge: { label: "Correct", variant: "warning" },
  },
  {
    source: "Salons & événements",
    visiteurs: "680",
    leads: "38",
    essais: "4",
    convertis: "2",
    coutTotal: "9 600 €",
    coutClient: "4 800 €",
    coutClientGold: false,
    badge: { label: "Élevé", variant: "warning" },
  },
  {
    source: "Direct",
    visiteurs: "568",
    leads: "12",
    essais: "2",
    convertis: "1",
    coutTotal: "0 €",
    coutClient: "0 €",
    coutClientGold: true,
    badge: { label: "Excellent", variant: "success" },
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Acquisition & conversion" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Bloc 02 · Acquisition & conversion</div>
            <h1 className="hero-title">Acquisition & conversion</h1>
            <p className="hero-sub">
              Comprendre comment les prospects deviennent clients : visiteur anonyme jusqu&apos;à la
              signature, suivi des canaux d&apos;acquisition et de leur rentabilité.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Funnel */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Entonnoir de conversion</div>
              <div className="section-title">Du visiteur au client signé</div>
            </div>
            <button className="btn btn-ghost btn-sm" data-stub="Période">
              30 jours ▾
            </button>
          </div>
          {FUNNEL_STAGES.map((stage) => (
            <div
              key={stage.label}
              className="funnel-stage"
              style={stage.gold ? { borderColor: "var(--gold)" } : undefined}
            >
              <span
                className="funnel-label"
                style={stage.gold ? { color: "var(--gold)" } : undefined}
              >
                {stage.label}
              </span>
              <div className="funnel-bar">
                <div className="funnel-bar-fill" style={{ width: `${stage.width}%` }} />
              </div>
              <span
                className="funnel-num"
                style={stage.gold ? { color: "var(--gold)" } : undefined}
              >
                {stage.num}
              </span>
              <span className="funnel-pct">{stage.pct}</span>
            </div>
          ))}
        </div>

        {/* KPIs acquisition */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Volumétrie de conversion</div>
              <div className="section-title">Indicateurs d&apos;acquisition</div>
            </div>
          </div>
          <div className="kpis">
            {VOLUME_KPIS.map((kpi) => (
              <div className="kpi" key={kpi.label}>
                <span className="phase-tag p1">PHASE 1</span>
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                <div className="kpi-meta">{kpi.meta}</div>
              </div>
            ))}
          </div>
          <div className="kpis kpis-3" style={{ marginTop: "12px" }}>
            {CONVERSION_KPIS.map((kpi) => (
              <div className="kpi" key={kpi.label}>
                <span className="phase-tag p1">PHASE 1</span>
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">
                  {kpi.value}
                  <span className="unit">{kpi.unit}</span>
                </div>
                <div className="kpi-meta">{kpi.meta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance par source */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Rentabilité par canal</div>
              <div className="section-title">Performance par source d&apos;acquisition</div>
            </div>
            <button className="btn btn-ghost btn-sm" data-stub="Comparer périodes">
              Comparer périodes
            </button>
          </div>
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>Source</th>
                  <th className="num">Visiteurs</th>
                  <th className="num">Leads</th>
                  <th className="num">Essais</th>
                  <th className="num">Convertis</th>
                  <th className="num">Coût total</th>
                  <th className="num">Coût par client</th>
                  <th className="center">Rentabilité</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_ROWS.map((row) => (
                  <tr key={row.source}>
                    <td className="cell-primary">{row.source}</td>
                    <td className="num">{row.visiteurs}</td>
                    <td className="num">{row.leads}</td>
                    <td className="num">{row.essais}</td>
                    <td className="num cell-money">{row.convertis}</td>
                    <td className="num">{row.coutTotal}</td>
                    <td className={`num cell-money${row.coutClientGold ? " gold" : ""}`}>
                      {row.coutClient}
                    </td>
                    <td className="center">
                      <span className={`badge badge-${row.badge.variant}`}>{row.badge.label}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
