import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { ActiviteClient } from "./ActiviteClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Activité commerciale" };

// Tableau 2 · Panier moyen et médian par client (mensuel) — données EXACTES de la maquette
// (reference/wireframes-dirigeant.html, lignes 5239-5531). Chaque mois = [Nb clients, CA,
// Panier moyen, Panier médian] ; "" => cellule vide (tiret) pour les mois non échus de 2026.
type Cell = string;
type MonthBlock = [Cell, Cell, Cell, Cell];

const EMPTY: MonthBlock = ["", "", "", ""];

const PANIER_2026: MonthBlock[] = [
  ["22", "386 200 €", "17 555 €", "12 800 €"],
  ["28", "512 800 €", "18 314 €", "13 200 €"],
  ["31", "598 400 €", "19 303 €", "14 100 €"],
  ["34", "688 200 €", "20 241 €", "14 800 €"],
  ["27", "567 000 €", "21 000 €", "15 200 €"],
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
  EMPTY,
];

const PANIER_2025: MonthBlock[] = [
  ["28", "382 240 €", "13 651 €", "9 800 €"],
  ["42", "624 540 €", "14 870 €", "10 400 €"],
  ["58", "923 760 €", "15 927 €", "11 200 €"],
  ["52", "878 800 €", "16 900 €", "11 600 €"],
  ["48", "866 400 €", "18 050 €", "12 400 €"],
  ["22", "412 500 €", "18 750 €", "12 800 €"],
  ["38", "738 200 €", "19 426 €", "13 400 €"],
  ["98", "1 976 400 €", "20 167 €", "13 900 €"],
  ["18", "376 200 €", "20 900 €", "14 400 €"],
  ["42", "902 300 €", "21 483 €", "14 800 €"],
  ["22", "487 300 €", "22 150 €", "15 200 €"],
  ["18", "411 400 €", "22 855 €", "15 800 €"],
];

const PANIER_2024: MonthBlock[] = [
  ["32", "395 200 €", "12 350 €", "8 600 €"],
  ["52", "688 480 €", "13 240 €", "9 200 €"],
  ["68", "948 600 €", "13 950 €", "9 800 €"],
  ["58", "868 800 €", "14 980 €", "10 400 €"],
  ["64", "1 010 240 €", "15 785 €", "10 900 €"],
  ["28", "463 400 €", "16 550 €", "11 400 €"],
  ["62", "1 067 880 €", "17 224 €", "11 900 €"],
  ["152", "2 698 000 €", "17 750 €", "12 300 €"],
  ["22", "401 400 €", "18 245 €", "12 700 €"],
  ["58", "1 086 600 €", "18 734 €", "13 000 €"],
  ["32", "615 200 €", "19 225 €", "13 400 €"],
  ["56", "1 106 800 €", "19 764 €", "13 700 €"],
];

const PANIER_2023: MonthBlock[] = [
  ["30", "329 000 €", "10 967 €", "7 400 €"],
  ["53", "631 700 €", "11 919 €", "8 200 €"],
  ["61", "770 660 €", "12 634 €", "8 800 €"],
  ["52", "702 000 €", "13 500 €", "9 200 €"],
  ["63", "894 600 €", "14 200 €", "9 800 €"],
  ["32", "480 000 €", "15 000 €", "10 400 €"],
  ["86", "1 339 400 €", "15 575 €", "10 800 €"],
  ["178", "2 853 600 €", "16 031 €", "11 100 €"],
  ["46", "758 500 €", "16 489 €", "11 400 €"],
  ["82", "1 392 200 €", "16 978 €", "11 700 €"],
  ["44", "769 560 €", "17 490 €", "12 100 €"],
  ["103", "1 853 400 €", "18 000 €", "12 400 €"],
];

const PANIER_YEARS: { year: string; data: MonthBlock[]; ivory: boolean }[] = [
  { year: "2026", data: PANIER_2026, ivory: true },
  { year: "2025", data: PANIER_2025, ivory: false },
  { year: "2024", data: PANIER_2024, ivory: false },
  { year: "2023", data: PANIER_2023, ivory: false },
];

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const nowrap: React.CSSProperties = { whiteSpace: "nowrap" };
const dash: React.CSSProperties = { color: "var(--navy-300)" };
const stickyYear: React.CSSProperties = {
  background: "var(--navy)",
  color: "white",
  fontWeight: 700,
  position: "sticky",
  left: 0,
  zIndex: 1,
};
const divider: React.CSSProperties = { borderRight: "1px solid rgba(255,255,255,0.2)" };

function PanierMonthCells({ block, isGold }: { block: MonthBlock; isGold: boolean }) {
  const [nb, ca, moyen, median] = block;
  if (nb === "") {
    return (
      <>
        <td className="num" style={dash}>
          —
        </td>
        <td className="num" style={dash}>
          —
        </td>
        <td className="num" style={dash}>
          —
        </td>
        <td className="num" style={dash}>
          —
        </td>
      </>
    );
  }
  return (
    <>
      <td className="num" style={nowrap}>
        {nb}
      </td>
      <td className="num cell-money" style={nowrap}>
        {ca}
      </td>
      <td className={`num cell-money${isGold ? " gold" : ""}`} style={nowrap}>
        {moyen}
      </td>
      <td className="num" style={nowrap}>
        {median}
      </td>
    </>
  );
}

const ltvKpi: React.CSSProperties = {
  background: "var(--ivory)",
  padding: "14px 16px",
  borderRadius: "8px",
  borderLeft: "3px solid var(--gold)",
};
const ltvKpiLabel: React.CSSProperties = {
  fontSize: "10px",
  color: "var(--navy-300)",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};
const ltvKpiMeta: React.CSSProperties = {
  fontSize: "10.5px",
  color: "var(--navy-300)",
  marginTop: "4px",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Activité commerciale" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Tableau de bord · synthèse financière du cabinet</div>
            <h1 className="hero-title">
              Activité commerciale <strong>du cabinet</strong>
            </h1>
            <p className="hero-sub">
              Suivi de l&apos;activité commerciale du Cabinet Paris Étoile : nouveaux clients générés
              par mois et panier moyen par client. Comparaison 2023-2024-2025-2026 pour identifier
              les saisonnalités et l&apos;évolution du ticket moyen.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-gold btn-sm">Exporter</button>
          </div>
        </div>

        {/* Tableau 1 + drawer (interactif) */}
        <ActiviteClient />

        {/* Tableau 2 : Panier moyen et médian par client */}
        <div className="card mb-24">
          <div
            className="card-header"
            style={{ background: "white", borderBottom: "1px solid var(--navy-100)" }}
          >
            <div className="card-title" style={{ color: "var(--navy)" }}>
              Panier moyen et médian par client
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  border: "1px solid var(--navy-100)",
                  borderRadius: "5px",
                  fontSize: "12px",
                  color: "var(--navy)",
                  fontWeight: 600,
                }}
              >
                5 personnes sélectionnés <span style={{ color: "var(--navy-300)" }}>▼</span>
              </div>
              <button
                style={{
                  padding: "6px 14px",
                  background: "var(--navy)",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                mensuel ▼
              </button>
              <button
                style={{
                  padding: "6px 14px",
                  background: "white",
                  color: "var(--navy)",
                  border: "1px solid var(--navy-100)",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                annuel ▼
              </button>
            </div>
          </div>
          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--navy-100)",
              borderRadius: "8px",
              margin: "0 18px 18px",
            }}
          >
            <table className="dt" style={{ fontSize: "11px", minWidth: "3600px", margin: 0 }}>
              <thead>
                <tr style={{ background: "var(--navy)", color: "white" }}>
                  <th
                    style={{
                      background: "var(--navy)",
                      color: "white",
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                    }}
                    rowSpan={2}
                  >
                    Année
                  </th>
                  {MONTHS.map((m, i) => (
                    <th
                      key={m}
                      colSpan={4}
                      style={{
                        color: "white",
                        textAlign: "center",
                        ...(i < MONTHS.length - 1 ? divider : {}),
                      }}
                    >
                      {m}
                    </th>
                  ))}
                </tr>
                <tr style={{ background: "var(--navy)", color: "white", fontSize: "10px" }}>
                  {MONTHS.map((m, i) => (
                    <PanierSubHeaders key={m} last={i === MONTHS.length - 1} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {PANIER_YEARS.map(({ year, data, ivory }) => (
                  <tr key={year} style={ivory ? { background: "var(--ivory)" } : undefined}>
                    <td style={stickyYear}>{year}</td>
                    {data.map((block, i) => (
                      <PanierMonthCells key={i} block={block} isGold={ivory} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              padding: "14px 18px",
              background: "var(--ivory)",
              borderLeft: "3px solid var(--gold)",
              borderRadius: "0 0 8px 8px",
              fontSize: "12px",
              color: "var(--navy-300)",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--navy)" }}>Lecture :</strong> le panier moyen par client
            progresse régulièrement (10 967 € en jan-2023 → 17 555 € en jan-2026, soit{" "}
            <strong style={{ color: "var(--green-text)" }}>+60 % en 4 ans</strong>). La montée en
            gamme du conseil et les programmes immobiliers premium tirent le ticket moyen vers le
            haut. Le tableau peut être filtré par ingénieur pour détail individuel.
          </div>
        </div>

        {/* LTV · valeur cumulée d'un client dans le temps */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-finance" />
              </svg>
              LTV · valeur cumulée d&apos;un client dans le temps
            </div>
            <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>
              moyenne réseau · panel de 1 200 clients suivis depuis 2020
            </span>
          </div>
          <div className="card-body" style={{ padding: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px",
                marginBottom: "22px",
              }}
            >
              <div style={ltvKpi}>
                <div style={ltvKpiLabel}>Durée de vie moyenne</div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                  }}
                >
                  6,2{" "}
                  <span style={{ fontSize: "14px", color: "var(--navy-300)", fontWeight: 600 }}>
                    ans
                  </span>
                </div>
                <div style={ltvKpiMeta}>avant sortie du cabinet ou inactivité &gt; 24 mois</div>
              </div>
              <div style={ltvKpi}>
                <div style={ltvKpiLabel}>LTV moyenne</div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--gold)",
                    marginTop: "4px",
                  }}
                >
                  28 400{" "}
                  <span style={{ fontSize: "14px", color: "var(--navy-300)", fontWeight: 600 }}>
                    €
                  </span>
                </div>
                <div style={ltvKpiMeta}>cumul facturé sur la durée de vie</div>
              </div>
              <div style={ltvKpi}>
                <div style={ltvKpiLabel}>Croissance LTV par an</div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--green-text)",
                    marginTop: "4px",
                  }}
                >
                  ▲ +28{" "}
                  <span style={{ fontSize: "14px", color: "var(--navy-300)", fontWeight: 600 }}>
                    %
                  </span>
                </div>
                <div style={ltvKpiMeta}>après la première étude</div>
              </div>
              <div style={ltvKpi}>
                <div style={ltvKpiLabel}>Taux de rétention 5 ans</div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                  }}
                >
                  72{" "}
                  <span style={{ fontSize: "14px", color: "var(--navy-300)", fontWeight: 600 }}>
                    %
                  </span>
                </div>
                <div style={ltvKpiMeta}>clients toujours actifs au bout de 5 ans</div>
              </div>
            </div>

            {/* Graphique LTV cumulée par année */}
            <svg
              viewBox="0 0 1200 380"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto" }}
              fontFamily="Epilogue, sans-serif"
            >
              <line x1="80" y1="40" x2="1180" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <line x1="80" y1="100" x2="1180" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <line x1="80" y1="160" x2="1180" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <line x1="80" y1="220" x2="1180" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <line x1="80" y1="280" x2="1180" y2="280" stroke="var(--navy-300)" strokeWidth="1" />

              <text x="70" y="44" textAnchor="end" fontSize="10" fill="var(--navy-300)">40 000 €</text>
              <text x="70" y="104" textAnchor="end" fontSize="10" fill="var(--navy-300)">30 000 €</text>
              <text x="70" y="164" textAnchor="end" fontSize="10" fill="var(--navy-300)">20 000 €</text>
              <text x="70" y="224" textAnchor="end" fontSize="10" fill="var(--navy-300)">10 000 €</text>
              <text x="70" y="284" textAnchor="end" fontSize="10" fill="var(--navy-300)">0</text>

              {/* An 0 : 8 200 € */}
              <g className="hover-month">
                <rect x="160" y="231" width="80" height="49" fill="var(--navy-300)" />
                <rect className="hover-zone" x="155" y="40" width="90" height="240" fill="transparent" />
                <g className="hover-tooltip" transform="translate(255, 60)">
                  <rect x="0" y="0" width="180" height="125" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="90" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Année d&apos;entrée</text>
                  <text x="10" y="36" fontSize="10" fill="var(--navy)"><tspan fontWeight="700">LTV cumul :</tspan> <tspan fill="var(--gold)" fontWeight="700">8 200 €</tspan></text>
                  <text x="10" y="54" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy-300)">●</tspan> Étude initiale : 8 200 €</text>
                  <text x="10" y="68" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy)">●</tspan> Études récurrentes : 0 €</text>
                  <text x="10" y="82" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold)">●</tspan> Immobilier : 0 €</text>
                  <text x="10" y="96" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold-300)">●</tspan> Assurance : 0 €</text>
                  <text x="10" y="110" fontSize="10" fill="var(--navy-300)"><tspan fill="#9DD9A8">●</tspan> Investissement fin. : 0 €</text>
                </g>
              </g>

              {/* An 1 : 12 600 € */}
              <g className="hover-month">
                <rect x="320" y="207" width="80" height="73" fill="var(--navy-300)" />
                <rect x="320" y="197" width="80" height="10" fill="var(--navy)" />
                <rect x="320" y="184" width="80" height="13" fill="var(--gold-300)" />
                <rect x="320" y="178" width="80" height="6" fill="var(--gold)" />
                <rect className="hover-zone" x="315" y="40" width="90" height="240" fill="transparent" />
                <g className="hover-tooltip" transform="translate(415, 60)">
                  <rect x="0" y="0" width="180" height="125" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="90" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Après 1 an</text>
                  <text x="10" y="36" fontSize="10" fill="var(--navy)"><tspan fontWeight="700">LTV cumul :</tspan> <tspan fill="var(--gold)" fontWeight="700">12 600 €</tspan> <tspan fill="var(--green-text)" fontSize="9" fontWeight="700">+54 %</tspan></text>
                  <text x="10" y="54" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy-300)">●</tspan> Étude initiale : 8 200 €</text>
                  <text x="10" y="68" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy)">●</tspan> Études récurrentes : 1 600 €</text>
                  <text x="10" y="82" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold)">●</tspan> Immobilier : 1 000 €</text>
                  <text x="10" y="96" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold-300)">●</tspan> Assurance : 1 800 €</text>
                  <text x="10" y="110" fontSize="10" fill="var(--navy-300)"><tspan fill="#9DD9A8">●</tspan> Investissement fin. : 0 €</text>
                </g>
              </g>

              {/* An 2 : 18 400 € */}
              <g className="hover-month">
                <rect x="480" y="231" width="80" height="49" fill="var(--navy-300)" />
                <rect x="480" y="207" width="80" height="24" fill="var(--navy)" />
                <rect x="480" y="183" width="80" height="24" fill="var(--gold-300)" />
                <rect x="480" y="170" width="80" height="13" fill="var(--gold)" />
                <rect className="hover-zone" x="475" y="40" width="90" height="240" fill="transparent" />
                <g className="hover-tooltip" transform="translate(575, 60)">
                  <rect x="0" y="0" width="180" height="125" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="90" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Après 2 ans</text>
                  <text x="10" y="36" fontSize="10" fill="var(--navy)"><tspan fontWeight="700">LTV cumul :</tspan> <tspan fill="var(--gold)" fontWeight="700">18 400 €</tspan> <tspan fill="var(--green-text)" fontSize="9" fontWeight="700">+46 %</tspan></text>
                  <text x="10" y="54" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy-300)">●</tspan> Étude initiale : 8 200 €</text>
                  <text x="10" y="68" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy)">●</tspan> Études récurrentes : 3 200 €</text>
                  <text x="10" y="82" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold)">●</tspan> Immobilier : 3 000 €</text>
                  <text x="10" y="96" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold-300)">●</tspan> Assurance : 4 000 €</text>
                  <text x="10" y="110" fontSize="10" fill="var(--navy-300)"><tspan fill="#9DD9A8">●</tspan> Investissement fin. : 0 €</text>
                </g>
              </g>

              {/* An 3 : 24 800 € */}
              <g className="hover-month">
                <rect x="640" y="231" width="80" height="49" fill="var(--navy-300)" />
                <rect x="640" y="202" width="80" height="29" fill="var(--navy)" />
                <rect x="640" y="167" width="80" height="35" fill="var(--gold-300)" />
                <rect x="640" y="137" width="80" height="30" fill="var(--gold)" />
                <rect x="640" y="131" width="80" height="6" fill="#9DD9A8" />
                <rect className="hover-zone" x="635" y="40" width="90" height="240" fill="transparent" />
                <g className="hover-tooltip" transform="translate(580, 60)">
                  <rect x="0" y="0" width="180" height="125" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="90" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Après 3 ans</text>
                  <text x="10" y="36" fontSize="10" fill="var(--navy)"><tspan fontWeight="700">LTV cumul :</tspan> <tspan fill="var(--gold)" fontWeight="700">24 800 €</tspan> <tspan fill="var(--green-text)" fontSize="9" fontWeight="700">+35 %</tspan></text>
                  <text x="10" y="54" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy-300)">●</tspan> Étude initiale : 8 200 €</text>
                  <text x="10" y="68" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy)">●</tspan> Études récurrentes : 4 800 €</text>
                  <text x="10" y="82" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold)">●</tspan> Immobilier : 5 000 €</text>
                  <text x="10" y="96" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold-300)">●</tspan> Assurance : 5 800 €</text>
                  <text x="10" y="110" fontSize="10" fill="var(--navy-300)"><tspan fill="#9DD9A8">●</tspan> Investissement fin. : 1 000 €</text>
                </g>
              </g>

              {/* An 4 : 29 600 € */}
              <g className="hover-month">
                <rect x="800" y="231" width="80" height="49" fill="var(--navy-300)" />
                <rect x="800" y="193" width="80" height="38" fill="var(--navy)" />
                <rect x="800" y="151" width="80" height="42" fill="var(--gold-300)" />
                <rect x="800" y="115" width="80" height="36" fill="var(--gold)" />
                <rect x="800" y="103" width="80" height="12" fill="#9DD9A8" />
                <rect className="hover-zone" x="795" y="40" width="90" height="240" fill="transparent" />
                <g className="hover-tooltip" transform="translate(740, 60)">
                  <rect x="0" y="0" width="180" height="125" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="90" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Après 4 ans</text>
                  <text x="10" y="36" fontSize="10" fill="var(--navy)"><tspan fontWeight="700">LTV cumul :</tspan> <tspan fill="var(--gold)" fontWeight="700">29 600 €</tspan> <tspan fill="var(--green-text)" fontSize="9" fontWeight="700">+19 %</tspan></text>
                  <text x="10" y="54" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy-300)">●</tspan> Étude initiale : 8 200 €</text>
                  <text x="10" y="68" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy)">●</tspan> Études récurrentes : 6 400 €</text>
                  <text x="10" y="82" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold)">●</tspan> Immobilier : 6 000 €</text>
                  <text x="10" y="96" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold-300)">●</tspan> Assurance : 7 000 €</text>
                  <text x="10" y="110" fontSize="10" fill="var(--navy-300)"><tspan fill="#9DD9A8">●</tspan> Investissement fin. : 2 000 €</text>
                </g>
              </g>

              {/* An 5+ : 35 200 € */}
              <g className="hover-month">
                <rect x="960" y="231" width="80" height="49" fill="var(--navy-300)" />
                <rect x="960" y="183" width="80" height="48" fill="var(--navy)" />
                <rect x="960" y="134" width="80" height="49" fill="var(--gold-300)" />
                <rect x="960" y="87" width="80" height="47" fill="var(--gold)" />
                <rect x="960" y="69" width="80" height="18" fill="#9DD9A8" />
                <rect className="hover-zone" x="955" y="40" width="90" height="240" fill="transparent" />
                <g className="hover-tooltip" transform="translate(900, 60)">
                  <rect x="0" y="0" width="180" height="125" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
                  <text x="90" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Après 5 ans et +</text>
                  <text x="10" y="36" fontSize="10" fill="var(--navy)"><tspan fontWeight="700">LTV cumul :</tspan> <tspan fill="var(--gold)" fontWeight="700">35 200 €</tspan> <tspan fill="var(--green-text)" fontSize="9" fontWeight="700">+19 %</tspan></text>
                  <text x="10" y="54" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy-300)">●</tspan> Étude initiale : 8 200 €</text>
                  <text x="10" y="68" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--navy)">●</tspan> Études récurrentes : 8 000 €</text>
                  <text x="10" y="82" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold)">●</tspan> Immobilier : 7 800 €</text>
                  <text x="10" y="96" fontSize="10" fill="var(--navy-300)"><tspan fill="var(--gold-300)">●</tspan> Assurance : 8 200 €</text>
                  <text x="10" y="110" fontSize="10" fill="var(--navy-300)"><tspan fill="#9DD9A8">●</tspan> Investissement fin. : 3 000 €</text>
                </g>
              </g>

              <text x="200" y="298" textAnchor="middle" fontSize="11" fill="var(--navy-300)">Année 0</text>
              <text x="200" y="312" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">entrée</text>
              <text x="360" y="298" textAnchor="middle" fontSize="11" fill="var(--navy-300)">Année 1</text>
              <text x="520" y="298" textAnchor="middle" fontSize="11" fill="var(--navy-300)">Année 2</text>
              <text x="680" y="298" textAnchor="middle" fontSize="11" fill="var(--navy-300)">Année 3</text>
              <text x="840" y="298" textAnchor="middle" fontSize="11" fill="var(--navy-300)">Année 4</text>
              <text x="1000" y="298" textAnchor="middle" fontSize="11" fill="var(--navy-300)">Année 5 et +</text>

              <g transform="translate(150, 340)">
                <rect x="0" y="0" width="14" height="10" fill="var(--navy-300)" />
                <text x="20" y="9" fontSize="11" fill="var(--navy-300)">Étude initiale</text>
                <rect x="160" y="0" width="14" height="10" fill="var(--navy)" />
                <text x="180" y="9" fontSize="11" fill="var(--navy-300)">Études récurrentes</text>
                <rect x="340" y="0" width="14" height="10" fill="var(--gold)" />
                <text x="360" y="9" fontSize="11" fill="var(--navy-300)">Investissement immobilier</text>
                <rect x="540" y="0" width="14" height="10" fill="var(--gold-300)" />
                <text x="560" y="9" fontSize="11" fill="var(--navy-300)">Assurance</text>
                <rect x="680" y="0" width="14" height="10" fill="#9DD9A8" />
                <text x="700" y="9" fontSize="11" fill="var(--navy-300)">Investissement financier</text>
              </g>
            </svg>

            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                background: "var(--ivory)",
                borderLeft: "3px solid var(--gold)",
                borderRadius: "6px",
                fontSize: "12px",
                color: "var(--navy-300)",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "var(--navy)" }}>Lecture :</strong> un client génère 8 200 € à
              l&apos;entrée (étude initiale), puis sa LTV cumulée croît avec les recommandations qui
              se concrétisent (immobilier, assurance, investissement financier) et la récurrence des
              études.{" "}
              <strong style={{ color: "var(--gold-deep)" }}>
                Plus un client reste, plus son ticket moyen explose
              </strong>{" "}
              : un client présent depuis 5+ ans génère <strong>4,3× plus</strong> qu&apos;un nouveau
              client.
            </div>
          </div>
        </div>

        <div className="kpis kpis-4">
          <div className="kpi">
            <div className="kpi-label">Nouveaux clients · cumul depuis janvier</div>
            <div className="kpi-value gold">142</div>
            <div className="kpi-meta">vs 178 attendus en 5 mois (taux atteint 80 %)</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Panier moyen 2026</div>
            <div className="kpi-value">
              18 853 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">moyenne sur jan-mai · vs 15 337 € en 2025</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Panier médian 2026</div>
            <div className="kpi-value">
              13 725 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">vs 10 650 € en 2025 · ▲ +29 %</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Croissance ticket moyen</div>
            <div className="kpi-value" style={{ color: "var(--green-text)" }}>
              ▲ +23 <span className="unit">%</span>
            </div>
            <div className="kpi-meta">vs 2025 · à périmètre constant</div>
          </div>
        </div>
      </div>
    </>
  );
}

function PanierSubHeaders({ last }: { last: boolean }) {
  const th: React.CSSProperties = { color: "white", whiteSpace: "nowrap" };
  const thDivider: React.CSSProperties = {
    color: "white",
    whiteSpace: "nowrap",
    borderRight: "1px solid rgba(255,255,255,0.2)",
  };
  return (
    <>
      <th className="num" style={th}>
        Nb clients
      </th>
      <th className="num" style={th}>
        CA
      </th>
      <th className="num" style={th}>
        Panier moyen
      </th>
      <th className="num" style={last ? th : thDivider}>
        Panier médian
      </th>
    </>
  );
}
