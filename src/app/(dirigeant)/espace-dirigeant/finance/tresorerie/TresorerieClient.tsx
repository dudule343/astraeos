"use client";

import { useState } from "react";

type Mode = "M" | "T" | "A";

const MODE_LABEL: Record<Mode, string> = { M: "mensuel", T: "trimestriel", A: "annuel" };

export function TresorerieClient() {
  const [mode, setMode] = useState<Mode>("M");
  const modeLabel = MODE_LABEL[mode];

  return (
    <>
      {/* Toggle Mensuel / Trimestriel / Annuel · CLIQUABLE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <button
          className={`tr-toggle-btn${mode === "M" ? " active" : ""}`}
          onClick={() => setMode("M")}
        >
          Mensuel
        </button>
        <button
          className={`tr-toggle-btn${mode === "T" ? " active" : ""}`}
          onClick={() => setMode("T")}
        >
          Trimestriel
        </button>
        <button
          className={`tr-toggle-btn${mode === "A" ? " active" : ""}`}
          onClick={() => setMode("A")}
        >
          Annuel
        </button>
      </div>

      {/* GRAPHIQUE 1 : SOLDE FIN DE PÉRIODE */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-finance" />
            </svg>
            Solde en fin de période · <span className="tr-mode-label">{modeLabel}</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--navy-300)", fontStyle: "italic" }}>
            comparaison 4 années
          </span>
        </div>
        <div className="card-body" style={{ padding: "16px 20px" }}>
          {/* SOLDE · MENSUEL */}
          <div className={`tr-graph-block tr-solde-block${mode === "M" ? " active" : ""}`}>
            <svg
              viewBox="0 0 1200 240"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto", minHeight: 200 }}
              fontFamily="Epilogue, sans-serif"
            >
              <line x1="50" y1="30.0" x2="1180" y2="30.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="33.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">6M</text>
              <line x1="50" y1="72.5" x2="1180" y2="72.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="75.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">4,5M</text>
              <line x1="50" y1="115.0" x2="1180" y2="115.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="118.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">3M</text>
              <line x1="50" y1="157.5" x2="1180" y2="157.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="160.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,5M</text>
              <line x1="50" y1="200" x2="1180" y2="200" stroke="var(--navy-300)" strokeWidth="1" />
              <g className="hover-month">
                <rect x="60" y="180" width="17" height="20" fill="#A4AEBB" />
                <rect x="79" y="143" width="17" height="57" fill="#708196" />
                <rect x="98" y="121" width="17" height="79" fill="#DDBB6E" />
                <rect x="117" y="179" width="17" height="21" fill="#102D50" />
                <rect className="hover-zone" x="57" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(140,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Janvier</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">720 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">2 040 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">2 810 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">760 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼24%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs déc. 2025</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼73%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs jan 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="152" y="168" width="17" height="32" fill="#A4AEBB" />
                <rect x="171" y="137" width="17" height="63" fill="#708196" />
                <rect x="190" y="112" width="17" height="88" fill="#DDBB6E" />
                <rect x="209" y="169" width="17" height="31" fill="#102D50" />
                <rect className="hover-zone" x="149" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(232,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Février</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">1 160 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">2 250 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">3 130 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">1 100 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▲45%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs jan 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼65%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs fév 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="244" y="179" width="17" height="21" fill="#A4AEBB" />
                <rect x="263" y="135" width="17" height="65" fill="#708196" />
                <rect x="282" y="117" width="17" height="83" fill="#DDBB6E" />
                <rect x="301" y="186" width="17" height="14" fill="#102D50" />
                <rect className="hover-zone" x="241" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(324,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Mars</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">760 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">2 320 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">2 930 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">500 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼55%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs fév 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼83%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs mar 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="336" y="185" width="17" height="15" fill="#A4AEBB" />
                <rect x="355" y="127" width="17" height="73" fill="#708196" />
                <rect x="374" y="118" width="17" height="82" fill="#DDBB6E" />
                <rect x="393" y="183" width="17" height="17" fill="#102D50" />
                <rect className="hover-zone" x="333" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(416,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Avril</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">530 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">2 600 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">2 900 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">620 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▲24%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs mar 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼79%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs avr 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="428" y="178" width="17" height="22" fill="#A4AEBB" />
                <rect x="447" y="120" width="17" height="80" fill="#708196" />
                <rect x="466" y="127" width="17" height="73" fill="#DDBB6E" />
                <rect x="485" y="190" width="17" height="10" fill="#102D50" />
                <rect className="hover-zone" x="425" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(508,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Mai</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">800 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">2 850 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">2 610 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">360 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼42%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs avr 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼86%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs mai 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="520" y="182" width="17" height="18" fill="#A4AEBB" />
                <rect x="539" y="115" width="17" height="85" fill="#708196" />
                <rect x="558" y="131" width="17" height="69" fill="#DDBB6E" />
                <rect className="hover-zone" x="517" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(600,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Juin</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">640 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">3 000 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">2 450 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="612" y="180" width="17" height="20" fill="#A4AEBB" />
                <rect x="631" y="104" width="17" height="96" fill="#708196" />
                <rect x="650" y="130" width="17" height="70" fill="#DDBB6E" />
                <rect className="hover-zone" x="609" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(692,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Juillet</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">720 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">340 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">2 500 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="704" y="176" width="17" height="24" fill="#A4AEBB" />
                <rect x="723" y="96" width="17" height="104" fill="#708196" />
                <rect x="742" y="186" width="17" height="14" fill="#DDBB6E" />
                <rect className="hover-zone" x="701" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(784,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Août</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">880 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">3 700 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">520 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="796" y="176" width="17" height="24" fill="#A4AEBB" />
                <rect x="815" y="91" width="17" height="109" fill="#708196" />
                <rect x="834" y="178" width="17" height="22" fill="#DDBB6E" />
                <rect className="hover-zone" x="793" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(631,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Septembre</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">870 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">3 850 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">780 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="888" y="174" width="17" height="26" fill="#A4AEBB" />
                <rect x="907" y="78" width="17" height="122" fill="#708196" />
                <rect x="926" y="176" width="17" height="24" fill="#DDBB6E" />
                <rect className="hover-zone" x="885" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(723,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Octobre</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">940 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">4 320 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">850 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="980" y="156" width="17" height="44" fill="#A4AEBB" />
                <rect x="999" y="74" width="17" height="126" fill="#708196" />
                <rect x="1018" y="163" width="17" height="37" fill="#DDBB6E" />
                <rect className="hover-zone" x="977" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(815,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Novembre</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">1 580 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">4 450 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">1 320 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="1072" y="149" width="17" height="51" fill="#A4AEBB" />
                <rect x="1091" y="53" width="17" height="147" fill="#708196" />
                <rect x="1110" y="172" width="17" height="28" fill="#DDBB6E" />
                <rect className="hover-zone" x="1069" y="30" width="86" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(907,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Décembre</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">1 810 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">5 210 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">1 002 028 €</tspan></text>
                </g>
              </g>
              <text x="98" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Jan</text>
              <text x="190" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Fév</text>
              <text x="282" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Mar</text>
              <text x="374" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Avr</text>
              <text x="466" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Mai</text>
              <text x="558" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Juin</text>
              <text x="650" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Juil</text>
              <text x="742" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Août</text>
              <text x="834" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Sept</text>
              <text x="926" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Oct</text>
              <text x="1018" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Nov</text>
              <text x="1110" y="216" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Déc</text>
              <rect x="480" y="225" width="11" height="11" fill="#A4AEBB" rx="2" />
              <text x="494" y="234" fontSize="11" fill="var(--navy-300)" fontWeight="600">2023</text>
              <rect x="540" y="225" width="11" height="11" fill="#708196" rx="2" />
              <text x="554" y="234" fontSize="11" fill="var(--navy-300)" fontWeight="600">2024</text>
              <rect x="600" y="225" width="11" height="11" fill="#DDBB6E" rx="2" />
              <text x="614" y="234" fontSize="11" fill="var(--navy-300)" fontWeight="600">2025</text>
              <rect x="660" y="225" width="11" height="11" fill="#102D50" rx="2" />
              <text x="674" y="234" fontSize="11" fill="var(--navy-300)" fontWeight="600">2026</text>
            </svg>
          </div>

          {/* SOLDE · TRIMESTRIEL */}
          <div className={`tr-graph-block tr-solde-block${mode === "T" ? " active" : ""}`}>
            <svg
              viewBox="0 0 1200 240"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto", minHeight: 200 }}
              fontFamily="Epilogue, sans-serif"
            >
              <line x1="50" y1="30.0" x2="1180" y2="30.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="33.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">6M</text>
              <line x1="50" y1="72.5" x2="1180" y2="72.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="75.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">4,5M</text>
              <line x1="50" y1="115.0" x2="1180" y2="115.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="118.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">3M</text>
              <line x1="50" y1="157.5" x2="1180" y2="157.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="160.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,5M</text>
              <line x1="50" y1="200" x2="1180" y2="200" stroke="var(--navy-300)" strokeWidth="1" />
              <g className="hover-month">
                <rect x="100" y="179" width="44" height="21" fill="#A4AEBB" />
                <rect x="150" y="135" width="44" height="65" fill="#708196" />
                <rect x="200" y="117" width="44" height="83" fill="#DDBB6E" />
                <rect x="250" y="186" width="44" height="14" fill="#102D50" />
                <rect className="hover-zone" x="90" y="30" width="220" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(315,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">T1 (jan-mars)</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">760 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">2 320 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">2 930 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">500 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼50%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs T4 2025</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▼83%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs T1 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="370" y="182" width="44" height="18" fill="#A4AEBB" />
                <rect x="420" y="115" width="44" height="85" fill="#708196" />
                <rect x="470" y="131" width="44" height="69" fill="#DDBB6E" />
                <rect className="hover-zone" x="360" y="30" width="220" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(585,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">T2 (avr-juin)</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">640 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">3 000 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">2 450 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="640" y="176" width="44" height="24" fill="#A4AEBB" />
                <rect x="690" y="91" width="44" height="109" fill="#708196" />
                <rect x="740" y="178" width="44" height="22" fill="#DDBB6E" />
                <rect className="hover-zone" x="630" y="30" width="220" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(475,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">T3 (juil-sept)</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">870 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">3 850 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">780 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="910" y="149" width="44" height="51" fill="#A4AEBB" />
                <rect x="960" y="53" width="44" height="147" fill="#708196" />
                <rect x="1010" y="172" width="44" height="28" fill="#DDBB6E" />
                <rect className="hover-zone" x="900" y="30" width="220" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(745,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">T4 (oct-déc)</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">1 810 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">5 210 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">1 002 028 €</tspan></text>
                </g>
              </g>
              <text x="200" y="218" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">T1</text>
              <text x="470" y="218" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">T2</text>
              <text x="740" y="218" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">T3</text>
              <text x="1010" y="218" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">T4</text>
              <rect x="480" y="225" width="11" height="11" fill="#A4AEBB" rx="2" />
              <text x="494" y="234" fontSize="11" fill="var(--navy-300)" fontWeight="600">2023</text>
              <rect x="540" y="225" width="11" height="11" fill="#708196" rx="2" />
              <text x="554" y="234" fontSize="11" fill="var(--navy-300)" fontWeight="600">2024</text>
              <rect x="600" y="225" width="11" height="11" fill="#DDBB6E" rx="2" />
              <text x="614" y="234" fontSize="11" fill="var(--navy-300)" fontWeight="600">2025</text>
              <rect x="660" y="225" width="11" height="11" fill="#102D50" rx="2" />
              <text x="674" y="234" fontSize="11" fill="var(--navy-300)" fontWeight="600">2026</text>
            </svg>
          </div>

          {/* SOLDE · ANNUEL */}
          <div className={`tr-graph-block tr-solde-block${mode === "A" ? " active" : ""}`}>
            <svg
              viewBox="0 0 1200 240"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto", minHeight: 200 }}
              fontFamily="Epilogue, sans-serif"
            >
              <line x1="50" y1="30.0" x2="1180" y2="30.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="33.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">6M</text>
              <line x1="50" y1="72.5" x2="1180" y2="72.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="75.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">4,5M</text>
              <line x1="50" y1="115.0" x2="1180" y2="115.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="118.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">3M</text>
              <line x1="50" y1="157.5" x2="1180" y2="157.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="160.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,5M</text>
              <line x1="50" y1="200" x2="1180" y2="200" stroke="var(--navy-300)" strokeWidth="1" />
              <g className="hover-month">
                <rect x="130" y="149" width="160" height="51" fill="#A4AEBB" />
                <text x="210.0" y="143" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--navy)">1 810 000 €</text>
                <rect className="hover-zone" x="120" y="30" width="180" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(308,90)">
                  <rect x="0" y="0" width="155" height="60" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="78" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#A4AEBB">2023 (fin déc.)</text>
                  <text x="78" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Solde : 1 810 000 €</text>
                </g>
              </g>
              <text x="210.0" y="218" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">2023</text>
              <g className="hover-month">
                <rect x="400" y="53" width="160" height="147" fill="#708196" />
                <text x="480.0" y="47" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--navy)">5 210 000 €</text>
                <rect className="hover-zone" x="390" y="30" width="180" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(578,90)">
                  <rect x="0" y="0" width="155" height="60" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="78" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#708196">2024 (fin déc.)</text>
                  <text x="78" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Solde : 5 210 000 €</text>
                  <text x="78" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2EA85A">▲ 188 % vs N-1</text>
                </g>
              </g>
              <text x="480.0" y="218" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">2024</text>
              <g className="hover-month">
                <rect x="670" y="172" width="160" height="28" fill="#DDBB6E" />
                <text x="750.0" y="166" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--navy)">1 002 028 €</text>
                <rect className="hover-zone" x="660" y="30" width="180" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(525,90)">
                  <rect x="0" y="0" width="155" height="60" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="78" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#DDBB6E">2025 (fin déc.)</text>
                  <text x="78" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Solde : 1 002 028 €</text>
                  <text x="78" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill="#E57C4B">▼ 81 % vs N-1</text>
                </g>
              </g>
              <text x="750.0" y="218" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">2025</text>
              <g className="hover-month">
                <rect x="940" y="190" width="160" height="10" fill="#102D50" />
                <text x="1020.0" y="184" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--navy)">360 000 €</text>
                <rect className="hover-zone" x="930" y="30" width="180" height="170" fill="transparent" />
                <g className="hover-tooltip" transform="translate(795,90)">
                  <rect x="0" y="0" width="155" height="60" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="78" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#102D50">2026 (au 31/05)</text>
                  <text x="78" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">Solde : 360 000 €</text>
                  <text x="78" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill="#E57C4B">▼ 64 % vs N-1</text>
                </g>
              </g>
              <text x="1020.0" y="218" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">2026 ⚠</text>
              <text x="1170" y="218" textAnchor="end" fontSize="9" fontStyle="italic" fill="var(--orange-text)">⚠ 2026 = solde au 31/05</text>
            </svg>
          </div>
        </div>
      </div>

      {/* GRAPHIQUE 2 : DÉPENSES */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-finance" />
            </svg>
            Dépenses du cabinet · <span className="tr-mode-label">{modeLabel}</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--navy-300)", fontStyle: "italic" }}>
            comparaison 4 années
          </span>
        </div>
        <div className="card-body" style={{ padding: "16px 20px" }}>
          {/* DÉPENSES · MENSUEL */}
          <div className={`tr-graph-block tr-dep-block${mode === "M" ? " active" : ""}`}>
            <svg
              viewBox="0 0 1200 220"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto", minHeight: 180 }}
              fontFamily="Epilogue, sans-serif"
            >
              <line x1="50" y1="30.0" x2="1180" y2="30.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="33.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">2M</text>
              <line x1="50" y1="79.5" x2="1180" y2="79.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="82.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,3M</text>
              <line x1="50" y1="129.0" x2="1180" y2="129.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="132.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">660k</text>
              <line x1="50" y1="180" x2="1180" y2="180" stroke="var(--navy-300)" strokeWidth="1" />
              <g className="hover-month">
                <rect x="60" y="169" width="17" height="11" fill="#A4AEBB" />
                <rect x="79" y="168" width="17" height="12" fill="#708196" />
                <rect x="98" y="164" width="17" height="16" fill="#DDBB6E" />
                <rect x="117" y="164" width="17" height="16" fill="#102D50" />
                <rect className="hover-zone" x="57" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(140,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Janvier</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">150 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">165 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">220 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">220 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▼75%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs déc. 2025</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▲0%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs jan 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="152" y="171" width="17" height="9" fill="#A4AEBB" />
                <rect x="171" y="171" width="17" height="9" fill="#708196" />
                <rect x="190" y="171" width="17" height="9" fill="#DDBB6E" />
                <rect x="209" y="165" width="17" height="15" fill="#102D50" />
                <rect className="hover-zone" x="149" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(232,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Février</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">200 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▼9%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs jan 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▲54%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs fév 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="244" y="168" width="17" height="12" fill="#A4AEBB" />
                <rect x="263" y="171" width="17" height="9" fill="#708196" />
                <rect x="282" y="165" width="17" height="15" fill="#DDBB6E" />
                <rect x="301" y="163" width="17" height="17" fill="#102D50" />
                <rect className="hover-zone" x="241" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(324,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Mars</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">160 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">200 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">230 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▲15%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs fév 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▲15%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs mar 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="336" y="169" width="17" height="11" fill="#A4AEBB" />
                <rect x="355" y="171" width="17" height="9" fill="#708196" />
                <rect x="374" y="164" width="17" height="16" fill="#DDBB6E" />
                <rect x="393" y="164" width="17" height="16" fill="#102D50" />
                <rect className="hover-zone" x="333" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(416,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Avril</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">150 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">220 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">220 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▼4%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs mar 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▲0%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs avr 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="428" y="173" width="17" height="7" fill="#A4AEBB" />
                <rect x="447" y="174" width="17" height="6" fill="#708196" />
                <rect x="466" y="169" width="17" height="11" fill="#DDBB6E" />
                <rect x="485" y="177" width="17" height="3" fill="#102D50" />
                <rect className="hover-zone" x="425" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(508,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Mai</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">100 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">80 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">150 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">50 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▼77%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs avr 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▼67%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs mai 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="520" y="171" width="17" height="9" fill="#A4AEBB" />
                <rect x="539" y="169" width="17" height="11" fill="#708196" />
                <rect x="558" y="165" width="17" height="15" fill="#DDBB6E" />
                <rect className="hover-zone" x="517" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(600,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Juin</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">150 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">200 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="612" y="173" width="17" height="7" fill="#A4AEBB" />
                <rect x="631" y="168" width="17" height="12" fill="#708196" />
                <rect x="650" y="171" width="17" height="9" fill="#DDBB6E" />
                <rect className="hover-zone" x="609" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(692,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Juillet</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">100 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">160 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="704" y="171" width="17" height="9" fill="#A4AEBB" />
                <rect x="723" y="172" width="17" height="8" fill="#708196" />
                <rect x="742" y="169" width="17" height="11" fill="#DDBB6E" />
                <rect className="hover-zone" x="701" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(784,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Août</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">110 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">150 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="796" y="174" width="17" height="6" fill="#A4AEBB" />
                <rect x="815" y="165" width="17" height="15" fill="#708196" />
                <rect x="834" y="162" width="17" height="18" fill="#DDBB6E" />
                <rect className="hover-zone" x="793" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(631,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Septembre</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">90 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">200 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">240 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="888" y="171" width="17" height="9" fill="#A4AEBB" />
                <rect x="907" y="164" width="17" height="16" fill="#708196" />
                <rect x="926" y="158" width="17" height="22" fill="#DDBB6E" />
                <rect className="hover-zone" x="885" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(723,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Octobre</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">130 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">220 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">300 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="980" y="159" width="17" height="21" fill="#A4AEBB" />
                <rect x="999" y="48" width="17" height="132" fill="#708196" />
                <rect x="1018" y="165" width="17" height="15" fill="#DDBB6E" />
                <rect className="hover-zone" x="977" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(815,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Novembre</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">290 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">1 761 716 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">200 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="1072" y="137" width="17" height="43" fill="#A4AEBB" />
                <rect x="1091" y="48" width="17" height="132" fill="#708196" />
                <rect x="1110" y="113" width="17" height="67" fill="#DDBB6E" />
                <rect className="hover-zone" x="1069" y="30" width="86" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(907,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">Décembre</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">573 554 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">1 761 716 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">893 367 €</tspan></text>
                </g>
              </g>
              <text x="98" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Jan</text>
              <text x="190" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Fév</text>
              <text x="282" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Mar</text>
              <text x="374" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Avr</text>
              <text x="466" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Mai</text>
              <text x="558" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Juin</text>
              <text x="650" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Juil</text>
              <text x="742" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Août</text>
              <text x="834" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Sept</text>
              <text x="926" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Oct</text>
              <text x="1018" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Nov</text>
              <text x="1110" y="196" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">Déc</text>
              <rect x="480" y="205" width="11" height="11" fill="#A4AEBB" rx="2" />
              <text x="494" y="214" fontSize="11" fill="var(--navy-300)" fontWeight="600">2023</text>
              <rect x="540" y="205" width="11" height="11" fill="#708196" rx="2" />
              <text x="554" y="214" fontSize="11" fill="var(--navy-300)" fontWeight="600">2024</text>
              <rect x="600" y="205" width="11" height="11" fill="#DDBB6E" rx="2" />
              <text x="614" y="214" fontSize="11" fill="var(--navy-300)" fontWeight="600">2025</text>
              <rect x="660" y="205" width="11" height="11" fill="#102D50" rx="2" />
              <text x="674" y="214" fontSize="11" fill="var(--navy-300)" fontWeight="600">2026</text>
            </svg>
          </div>

          {/* DÉPENSES · TRIMESTRIEL */}
          <div className={`tr-graph-block tr-dep-block${mode === "T" ? " active" : ""}`}>
            <svg
              viewBox="0 0 1200 220"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto", minHeight: 180 }}
              fontFamily="Epilogue, sans-serif"
            >
              <line x1="50" y1="30.0" x2="1180" y2="30.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="33.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">5M</text>
              <line x1="50" y1="79.5" x2="1180" y2="79.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="82.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">3,3M</text>
              <line x1="50" y1="129.0" x2="1180" y2="129.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="132.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,7M</text>
              <line x1="50" y1="180" x2="1180" y2="180" stroke="var(--navy-300)" strokeWidth="1" />
              <g className="hover-month">
                <rect x="100" y="167" width="44" height="13" fill="#A4AEBB" />
                <rect x="150" y="168" width="44" height="12" fill="#708196" />
                <rect x="200" y="164" width="44" height="16" fill="#DDBB6E" />
                <rect x="250" y="161" width="44" height="19" fill="#102D50" />
                <rect className="hover-zone" x="90" y="30" width="220" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(315,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">T1 (jan-mars)</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">440 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">425 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">550 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">650 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▼53%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs T4 2025</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#E57C4B" fontSize="9" fontWeight="700">▲18%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs T1 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="370" y="169" width="44" height="11" fill="#A4AEBB" />
                <rect x="420" y="170" width="44" height="10" fill="#708196" />
                <rect x="470" y="163" width="44" height="17" fill="#DDBB6E" />
                <rect x="520" y="172" width="44" height="8" fill="#102D50" />
                <rect className="hover-zone" x="360" y="30" width="220" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(585,40)">
                  <rect x="0" y="0" width="160" height="130" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">T2 (avr-juin)</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">380 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">360 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">570 000 €</tspan></text>
                  <text x="6" y="74" fontSize="9" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> <tspan fontWeight="700">270 000 €</tspan></text>
                  <line x1="6" y1="90" x2="154" y2="90" stroke="var(--navy-100)" strokeWidth="0.5" />
                  <text x="6" y="100" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▼58%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs T1 2026</tspan></text>
                  <text x="6" y="113" fontSize="9"><tspan fill="#2EA85A" fontSize="9" fontWeight="700">▼53%</tspan> <tspan fill="var(--navy-300)" fontSize="8.5">vs T2 2025</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="640" y="171" width="44" height="9" fill="#A4AEBB" />
                <rect x="690" y="166" width="44" height="14" fill="#708196" />
                <rect x="740" y="165" width="44" height="15" fill="#DDBB6E" />
                <rect className="hover-zone" x="630" y="30" width="220" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(475,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">T3 (juil-sept)</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">320 000 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">470 000 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">520 000 €</tspan></text>
                </g>
              </g>
              <g className="hover-month">
                <rect x="910" y="151" width="44" height="29" fill="#A4AEBB" />
                <rect x="960" y="68" width="44" height="112" fill="#708196" />
                <rect x="1010" y="139" width="44" height="41" fill="#DDBB6E" />
                <rect className="hover-zone" x="900" y="30" width="220" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(745,40)">
                  <rect x="0" y="0" width="160" height="110" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="80" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--navy)">T4 (oct-déc)</text>
                  <text x="6" y="32" fontSize="9" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> <tspan fontWeight="700">993 554 €</tspan></text>
                  <text x="6" y="46" fontSize="9" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> <tspan fontWeight="700">3 743 432 €</tspan></text>
                  <text x="6" y="60" fontSize="9" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> <tspan fontWeight="700">1 393 367 €</tspan></text>
                </g>
              </g>
              <text x="200" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">T1</text>
              <text x="470" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">T2</text>
              <text x="740" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">T3</text>
              <text x="1010" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">T4</text>
              <rect x="480" y="205" width="11" height="11" fill="#A4AEBB" rx="2" />
              <text x="494" y="214" fontSize="11" fill="var(--navy-300)" fontWeight="600">2023</text>
              <rect x="540" y="205" width="11" height="11" fill="#708196" rx="2" />
              <text x="554" y="214" fontSize="11" fill="var(--navy-300)" fontWeight="600">2024</text>
              <rect x="600" y="205" width="11" height="11" fill="#DDBB6E" rx="2" />
              <text x="614" y="214" fontSize="11" fill="var(--navy-300)" fontWeight="600">2025</text>
              <rect x="660" y="205" width="11" height="11" fill="#102D50" rx="2" />
              <text x="674" y="214" fontSize="11" fill="var(--navy-300)" fontWeight="600">2026</text>
            </svg>
          </div>

          {/* DÉPENSES · ANNUEL */}
          <div className={`tr-graph-block tr-dep-block${mode === "A" ? " active" : ""}`}>
            <svg
              viewBox="0 0 1200 220"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto", minHeight: 180 }}
              fontFamily="Epilogue, sans-serif"
            >
              <line x1="50" y1="30.0" x2="1180" y2="30.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="33.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">5M</text>
              <line x1="50" y1="79.5" x2="1180" y2="79.5" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="82.5" textAnchor="end" fontSize="9" fill="var(--navy-300)">3,3M</text>
              <line x1="50" y1="129.0" x2="1180" y2="129.0" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5" />
              <text x="44" y="132.0" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,7M</text>
              <line x1="50" y1="180" x2="1180" y2="180" stroke="var(--navy-300)" strokeWidth="1" />
              <g className="hover-month">
                <rect x="130" y="116" width="160" height="64" fill="#A4AEBB" />
                <text x="210.0" y="110" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--navy)">2 133 554 €</text>
                <rect className="hover-zone" x="120" y="30" width="180" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(308,80)">
                  <rect x="0" y="0" width="155" height="60" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="78" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#A4AEBB">2023 (annuel)</text>
                  <text x="78" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 133 554 €</text>
                </g>
              </g>
              <text x="210.0" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">2023</text>
              <g className="hover-month">
                <rect x="400" y="31" width="160" height="149" fill="#708196" />
                <text x="480.0" y="25" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--navy)">4 998 432 €</text>
                <rect className="hover-zone" x="390" y="30" width="180" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(578,80)">
                  <rect x="0" y="0" width="155" height="60" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="78" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#708196">2024 (annuel)</text>
                  <text x="78" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">4 998 432 €</text>
                  <text x="78" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill="#E57C4B">▲ 134 % vs N-1</text>
                </g>
              </g>
              <text x="480.0" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">2024</text>
              <g className="hover-month">
                <rect x="670" y="89" width="160" height="91" fill="#DDBB6E" />
                <text x="750.0" y="83" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--navy)">3 033 367 €</text>
                <rect className="hover-zone" x="660" y="30" width="180" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(525,80)">
                  <rect x="0" y="0" width="155" height="60" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="78" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#DDBB6E">2025 (annuel)</text>
                  <text x="78" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">3 033 367 €</text>
                  <text x="78" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2EA85A">▼ 39 % vs N-1</text>
                </g>
              </g>
              <text x="750.0" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">2025</text>
              <g className="hover-month">
                <rect x="940" y="153" width="160" height="27" fill="#102D50" />
                <text x="1020.0" y="147" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--navy)">920 000 €</text>
                <rect className="hover-zone" x="930" y="30" width="180" height="150" fill="transparent" />
                <g className="hover-tooltip" transform="translate(795,80)">
                  <rect x="0" y="0" width="155" height="60" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))" />
                  <text x="78" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#102D50">2026 (cumul jan-mai)</text>
                  <text x="78" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">920 000 €</text>
                  <text x="78" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2EA85A">▼ 70 % vs N-1</text>
                </g>
              </g>
              <text x="1020.0" y="198" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--navy-300)">2026 ⚠</text>
              <text x="1170" y="198" textAnchor="end" fontSize="9" fontStyle="italic" fill="var(--orange-text)">⚠ 2026 = cumul depuis janvier</text>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
