"use client";

import { useState } from "react";

// Vue d'ensemble financière (dir-finance-overview) — porté fidèlement de la maquette
// (reference/wireframes-dirigeant.html, page-dir-finance-overview, lignes 2661-4202).
// Interaction portée : le toggle Mensuel / Trimestriel / Annuel (switchVeMode) pilote
// l'affichage des 4 graphiques (3 variantes M/T/A empilées) et le libellé de chaque carte.

type VeMode = "M" | "T" | "A";

export function FinanceOverviewClient() {
  const [mode, setMode] = useState<VeMode>("M");
  const modeLabel = mode === "M" ? "mensuel" : mode === "T" ? "trimestriel" : "annuel";

  return (
    <>
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Tableau de bord · synthèse financière du cabinet</div>
            <h1 className="hero-title">Vue d&apos;ensemble <strong>financière</strong></h1>
            <p className="hero-sub">Vision macro des flux financiers du Cabinet Paris Étoile · 5 personnes (vous + 4 ingénieurs) : CA réalisé, CA encaissé, charges et résultat net — comparaison sur 4 années (2023, 2024, 2025, 2026).</p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Exporter</button>
            <span style={{ fontSize: "11px", color: "var(--navy-300)", alignSelf: "center" }}>Dernière MAJ · 09/05/2026 · 11:51</span>
          </div>
        </div>

        {/* 4 KPIs hero · style Pennylane (Année / Trimestre / Mois) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "18px" }}>
          {/* KPI 1 : CA réalisé */}
          <div style={{ background: "white", border: "1px solid var(--navy-100)", borderRadius: "10px", padding: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--navy)", letterSpacing: "0.06em", paddingBottom: "8px", borderBottom: "2px solid var(--gold)", marginBottom: "14px" }}>CA réalisé</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Année</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--navy)", lineHeight: "1" }}>2 384 600 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Du 01/01/26<br />au 31/05/26</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +23 %</div>
              </div>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Trimestre</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--navy)", lineHeight: "1" }}>970 600 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Du 01/04/26<br />au 31/05/26</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +18 %</div>
              </div>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Mois en cours</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--gold)", lineHeight: "1" }}>398 600 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Mai 2026<br />partiel</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +24 %</div>
              </div>
            </div>
          </div>

          {/* KPI 2 : CA encaissé */}
          <div style={{ background: "white", border: "1px solid var(--navy-100)", borderRadius: "10px", padding: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--navy)", letterSpacing: "0.06em", paddingBottom: "8px", borderBottom: "2px solid var(--gold)", marginBottom: "14px" }}>CA encaissé</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Année</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--navy)", lineHeight: "1" }}>2 098 200 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Du 01/01/26<br />au 31/05/26</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +23 %</div>
              </div>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Trimestre</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--navy)", lineHeight: "1" }}>854 100 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Du 01/04/26<br />au 31/05/26</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +14 %</div>
              </div>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Mois en cours</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--gold)", lineHeight: "1" }}>350 800 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Mai 2026<br />partiel</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +20 %</div>
              </div>
            </div>
          </div>

          {/* KPI 3 : Charges & dépenses */}
          <div style={{ background: "white", border: "1px solid var(--navy-100)", borderRadius: "10px", padding: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--navy)", letterSpacing: "0.06em", paddingBottom: "8px", borderBottom: "2px solid var(--gold)", marginBottom: "14px" }}>Charges & dépenses</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Année</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--navy)", lineHeight: "1" }}>1 161 600 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Du 01/01/26<br />au 31/05/26</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(229,124,75,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--orange-text)" }}>▲ +18 %</div>
              </div>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Trimestre</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--navy)", lineHeight: "1" }}>436 600 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Du 01/04/26<br />au 31/05/26</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(229,124,75,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--orange-text)" }}>▲ +15 %</div>
              </div>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Mois en cours</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--gold)", lineHeight: "1" }}>180 600 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Mai 2026<br />partiel</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(229,124,75,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--orange-text)" }}>▲ +12 %</div>
              </div>
            </div>
          </div>

          {/* KPI 4 : Résultat net */}
          <div style={{ background: "white", border: "1px solid var(--navy-100)", borderRadius: "10px", padding: "18px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--navy)", letterSpacing: "0.06em", paddingBottom: "8px", borderBottom: "2px solid var(--gold)", marginBottom: "14px" }}>Résultat net</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Année</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--navy)", lineHeight: "1" }}>958 400 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Du 01/01/26<br />au 31/05/26</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +28 %</div>
              </div>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Trimestre</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--navy)", lineHeight: "1" }}>534 000 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Du 01/04/26<br />au 31/05/26</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +22 %</div>
              </div>
              <div>
                <div style={{ fontSize: "9.5px", fontWeight: "700", color: "var(--navy-300)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>Mois en cours</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontWeight: "700", fontSize: "18px", color: "var(--gold)", lineHeight: "1" }}>218 000 €</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: "1.3" }}>Mai 2026<br />partiel</div>
                <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", background: "rgba(46,168,90,0.12)", borderRadius: "3px", fontSize: "10px", fontWeight: "700", color: "var(--green-text)" }}>▲ +30 %</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Mensuel / Trimestriel / Annuel · CLIQUABLE */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "18px" }}>
          <button className={`ve-toggle-btn${mode === "M" ? " active" : ""}`} onClick={() => setMode("M")}>Mensuel</button>
          <button className={`ve-toggle-btn${mode === "T" ? " active" : ""}`} onClick={() => setMode("T")}>Trimestriel</button>
          <button className={`ve-toggle-btn${mode === "A" ? " active" : ""}`} onClick={() => setMode("A")}>Annuel</button>
        </div>

        {/* 4 graphiques · 3 versions empilées (M/T/A) avec switch */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "24px" }}>

          {/* Graphique 1 : CA réalisé */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><svg><use href="#i-finance"/></svg>CA réalisé · <span className="ve-mode-label" data-ve-target="ca_realise">{modeLabel}</span></div>
            </div>
            <div className="card-body" style={{ padding: "14px 18px" }}>
              <div className={`ve-graph-block${mode === "M" ? " active" : ""}`} data-ve-graph="ca_realise_M"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">600k</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">450k</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">300k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">150k</text>
              <g className="hover-month">
              <rect x="50" y="213" width="9" height="27" fill="#A4AEBB"/>
              <rect x="59" y="203" width="9" height="37" fill="#708196"/>
              <rect x="68" y="195" width="9" height="45" fill="#DDBB6E"/>
              <rect x="77" y="123" width="9" height="117" fill="#102D50"/>
              <rect className="hover-zone" x="47" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(100,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">janv.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 95 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 130 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 158 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲22%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 412 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲161%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="97" y="208" width="9" height="32" fill="#A4AEBB"/>
              <rect x="106" y="195" width="9" height="45" fill="#708196"/>
              <rect x="115" y="185" width="9" height="55" fill="#DDBB6E"/>
              <rect x="124" y="104" width="9" height="136" fill="#102D50"/>
              <rect className="hover-zone" x="94" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(147,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">févr.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 112 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 158 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲41%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 195 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 478 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲145%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="144" y="201" width="9" height="39" fill="#A4AEBB"/>
              <rect x="153" y="190" width="9" height="50" fill="#708196"/>
              <rect x="162" y="174" width="9" height="66" fill="#DDBB6E"/>
              <rect x="171" y="91" width="9" height="149" fill="#102D50"/>
              <rect className="hover-zone" x="141" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(194,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">mars</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 138 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 178 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 232 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲30%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 524 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲126%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="191" y="200" width="9" height="40" fill="#A4AEBB"/>
              <rect x="200" y="185" width="9" height="55" fill="#708196"/>
              <rect x="209" y="170" width="9" height="70" fill="#DDBB6E"/>
              <rect x="218" y="77" width="9" height="163" fill="#102D50"/>
              <rect className="hover-zone" x="188" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(241,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">avr.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 142 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 195 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 248 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 572 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲131%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="238" y="198" width="9" height="42" fill="#A4AEBB"/>
              <rect x="247" y="179" width="9" height="61" fill="#708196"/>
              <rect x="256" y="164" width="9" height="76" fill="#DDBB6E"/>
              <rect x="265" y="127" width="9" height="113" fill="#102D50"/>
              <rect className="hover-zone" x="235" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(288,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">mai</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 148 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 215 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲45%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 268 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲25%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 398 600 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲49%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="285" y="205" width="9" height="35" fill="#A4AEBB"/>
              <rect x="294" y="192" width="9" height="48" fill="#708196"/>
              <rect x="303" y="178" width="9" height="62" fill="#DDBB6E"/>
              <rect className="hover-zone" x="282" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(335,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">juin</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 125 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 168 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲34%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 218 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲30%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="332" y="201" width="9" height="39" fill="#A4AEBB"/>
              <rect x="341" y="190" width="9" height="50" fill="#708196"/>
              <rect x="350" y="174" width="9" height="66" fill="#DDBB6E"/>
              <rect className="hover-zone" x="329" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(382,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">juil.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 138 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 178 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 232 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲30%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="379" y="190" width="9" height="50" fill="#A4AEBB"/>
              <rect x="388" y="174" width="9" height="66" fill="#708196"/>
              <rect x="397" y="155" width="9" height="85" fill="#DDBB6E"/>
              <rect className="hover-zone" x="376" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(279,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">août</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 178 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 234 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲31%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 298 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="426" y="199" width="9" height="41" fill="#A4AEBB"/>
              <rect x="435" y="184" width="9" height="56" fill="#708196"/>
              <rect x="444" y="170" width="9" height="70" fill="#DDBB6E"/>
              <rect className="hover-zone" x="423" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(326,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">sept.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 145 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 198 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 248 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲25%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="473" y="195" width="9" height="45" fill="#A4AEBB"/>
              <rect x="482" y="179" width="9" height="61" fill="#708196"/>
              <rect x="491" y="164" width="9" height="76" fill="#DDBB6E"/>
              <rect className="hover-zone" x="470" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(373,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">oct.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 158 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 215 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲36%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 268 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲25%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="520" y="192" width="9" height="48" fill="#A4AEBB"/>
              <rect x="529" y="174" width="9" height="66" fill="#708196"/>
              <rect x="538" y="159" width="9" height="81" fill="#DDBB6E"/>
              <rect className="hover-zone" x="517" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(420,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">nov.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 168 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 232 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲38%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 286 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="567" y="185" width="9" height="55" fill="#A4AEBB"/>
              <rect x="576" y="164" width="9" height="76" fill="#708196"/>
              <rect x="585" y="150" width="9" height="90" fill="#DDBB6E"/>
              <rect className="hover-zone" x="564" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(467,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">déc.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 195 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 268 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 318 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲19%</tspan></text>
              </g>
              </g>
              <text x="68" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">1</text>
              <text x="115" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">2</text>
              <text x="162" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">3</text>
              <text x="209" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">4</text>
              <text x="256" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">5</text>
              <text x="303" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">6</text>
              <text x="350" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">7</text>
              <text x="397" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">8</text>
              <text x="444" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">9</text>
              <text x="491" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">10</text>
              <text x="538" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">11</text>
              <text x="585" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">12</text>
              <rect x="240" y="264" width="9" height="9" fill="#A4AEBB" rx="1.5"/>
              <text x="252" y="272" fontSize="10" fill="var(--navy-300)">2023</text>
              <rect x="300" y="264" width="9" height="9" fill="#708196" rx="1.5"/>
              <text x="312" y="272" fontSize="10" fill="var(--navy-300)">2024</text>
              <rect x="360" y="264" width="9" height="9" fill="#DDBB6E" rx="1.5"/>
              <text x="372" y="272" fontSize="10" fill="var(--navy-300)">2025</text>
              <rect x="420" y="264" width="9" height="9" fill="#102D50" rx="1.5"/>
              <text x="432" y="272" fontSize="10" fill="var(--navy-300)">2026</text>
              </svg></div>
              <div className={`ve-graph-block${mode === "T" ? " active" : ""}`} data-ve-graph="ca_realise_T"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,1M</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">825k</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">550k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">275k</text>
              <g className="hover-month">
              <rect x="70" y="178" width="22" height="62" fill="#A4AEBB"/>
              <rect x="94" y="156" width="22" height="84" fill="#708196"/>
              <rect x="118" y="134" width="22" height="106" fill="#DDBB6E"/>
              <rect x="142" y="-17" width="22" height="257" fill="#102D50"/>
              <rect className="hover-zone" x="65" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(180,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T1 (jan-mars)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 345 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 466 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲35%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 585 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲26%</tspan></text>
              <text x="5" y="61" fontSize="8.5" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 1 414 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲142%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="200" y="165" width="22" height="75" fill="#A4AEBB"/>
              <rect x="224" y="135" width="22" height="105" fill="#708196"/>
              <rect x="248" y="107" width="22" height="133" fill="#DDBB6E"/>
              <rect x="272" y="64" width="22" height="176" fill="#102D50"/>
              <rect className="hover-zone" x="195" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(310,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T2 (avr-juin)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 415 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 578 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲39%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 734 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              <text x="5" y="61" fontSize="8.5" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 970 600 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="330" y="157" width="22" height="83" fill="#A4AEBB"/>
              <rect x="354" y="130" width="22" height="110" fill="#708196"/>
              <rect x="378" y="99" width="22" height="141" fill="#DDBB6E"/>
              <rect className="hover-zone" x="325" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(230,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T3 (juil-sept)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 461 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 610 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 778 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲28%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="460" y="146" width="22" height="94" fill="#A4AEBB"/>
              <rect x="484" y="110" width="22" height="130" fill="#708196"/>
              <rect x="508" y="82" width="22" height="158" fill="#DDBB6E"/>
              <rect className="hover-zone" x="455" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(360,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T4 (oct-déc)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 521 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 715 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 872 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲22%</tspan></text>
              </g>
              </g>
              <text x="118" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T1</text>
              <text x="248" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T2</text>
              <text x="378" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T3</text>
              <text x="508" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T4</text>
              <rect x="240" y="264" width="9" height="9" fill="#A4AEBB" rx="1.5"/>
              <text x="252" y="272" fontSize="10" fill="var(--navy-300)">2023</text>
              <rect x="300" y="264" width="9" height="9" fill="#708196" rx="1.5"/>
              <text x="312" y="272" fontSize="10" fill="var(--navy-300)">2024</text>
              <rect x="360" y="264" width="9" height="9" fill="#DDBB6E" rx="1.5"/>
              <text x="372" y="272" fontSize="10" fill="var(--navy-300)">2025</text>
              <rect x="420" y="264" width="9" height="9" fill="#102D50" rx="1.5"/>
              <text x="432" y="272" fontSize="10" fill="var(--navy-300)">2026</text>
              </svg></div>
              <div className={`ve-graph-block${mode === "A" ? " active" : ""}`} data-ve-graph="ca_realise_A"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">3,5M</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">2,6M</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,7M</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">875k</text>
              <g className="hover-month">
              <rect x="80" y="141" width="80" height="99" fill="#A4AEBB"/>
              <text x="120.0" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 742 000 €</text>
              <rect className="hover-zone" x="75" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(170,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#A4AEBB">2023</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 742 000 €</text>
              </g>
              </g>
              <text x="120.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2023</text>
              <g className="hover-month">
              <rect x="210" y="105" width="80" height="135" fill="#708196"/>
              <text x="250.0" y="99" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 369 000 €</text>
              <rect className="hover-zone" x="205" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(300,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#708196">2024</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 369 000 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2EA85A">▲ 36% vs N-1</text>
              </g>
              </g>
              <text x="250.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2024</text>
              <g className="hover-month">
              <rect x="340" y="71" width="80" height="169" fill="#DDBB6E"/>
              <text x="380.0" y="65" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 969 000 €</text>
              <rect className="hover-zone" x="335" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(210,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#DDBB6E">2025</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 969 000 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2EA85A">▲ 25% vs N-1</text>
              </g>
              </g>
              <text x="380.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2025</text>
              <g className="hover-month">
              <rect x="470" y="104" width="80" height="136" fill="#102D50"/>
              <text x="510.0" y="98" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 384 600 €</text>
              <rect className="hover-zone" x="465" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(340,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#102D50">2026 (cumul jan-mai)</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 384 600 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#E57C4B">▼ 20% vs N-1</text>
              </g>
              </g>
              <text x="510.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2026 ⚠</text>
              <text x="540" y="256" textAnchor="end" fontSize="8" fontStyle="italic" fill="var(--orange-text)">⚠ 2026 = cumul jan-mai</text>
              </svg></div>
            </div>
          </div>

          {/* Graphique 2 : Charges & dépenses */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><svg><use href="#i-finance"/></svg>Charges & dépenses · <span className="ve-mode-label" data-ve-target="charges">{modeLabel}</span></div>
            </div>
            <div className="card-body" style={{ padding: "14px 18px" }}>
              <div className={`ve-graph-block${mode === "M" ? " active" : ""}`} data-ve-graph="charges_M"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">350k</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">260k</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">170k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">90k</text>
              <g className="hover-month">
              <rect x="50" y="204" width="9" height="36" fill="#A4AEBB"/>
              <rect x="59" y="196" width="9" height="44" fill="#708196"/>
              <rect x="68" y="186" width="9" height="54" fill="#DDBB6E"/>
              <rect x="77" y="108" width="9" height="132" fill="#102D50"/>
              <rect className="hover-zone" x="47" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(100,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">janv.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 64 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 78 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲22%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 95 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲22%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 232 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲144%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="97" y="202" width="9" height="38" fill="#A4AEBB"/>
              <rect x="106" y="188" width="9" height="52" fill="#708196"/>
              <rect x="115" y="176" width="9" height="64" fill="#DDBB6E"/>
              <rect x="124" y="100" width="9" height="140" fill="#102D50"/>
              <rect className="hover-zone" x="94" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(147,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">févr.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 68 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 92 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲35%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 112 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲22%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 245 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲119%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="144" y="196" width="9" height="44" fill="#A4AEBB"/>
              <rect x="153" y="180" width="9" height="60" fill="#708196"/>
              <rect x="162" y="165" width="9" height="75" fill="#DDBB6E"/>
              <rect x="171" y="99" width="9" height="141" fill="#102D50"/>
              <rect className="hover-zone" x="141" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(194,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">mars</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 78 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 105 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲35%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 132 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲26%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 248 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲88%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="191" y="194" width="9" height="46" fill="#A4AEBB"/>
              <rect x="200" y="175" width="9" height="65" fill="#708196"/>
              <rect x="209" y="159" width="9" height="81" fill="#DDBB6E"/>
              <rect x="218" y="94" width="9" height="146" fill="#102D50"/>
              <rect className="hover-zone" x="188" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(241,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">avr.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 82 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 115 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲40%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 142 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 256 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲80%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="238" y="192" width="9" height="48" fill="#A4AEBB"/>
              <rect x="247" y="171" width="9" height="69" fill="#708196"/>
              <rect x="256" y="154" width="9" height="86" fill="#DDBB6E"/>
              <rect x="265" y="137" width="9" height="103" fill="#102D50"/>
              <rect className="hover-zone" x="235" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(288,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">mai</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 85 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 122 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲44%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 152 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲25%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 180 600 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲19%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="285" y="199" width="9" height="41" fill="#A4AEBB"/>
              <rect x="294" y="184" width="9" height="56" fill="#708196"/>
              <rect x="303" y="167" width="9" height="73" fill="#DDBB6E"/>
              <rect className="hover-zone" x="282" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(335,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">juin</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 72 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 98 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲36%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 128 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲31%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="332" y="196" width="9" height="44" fill="#A4AEBB"/>
              <rect x="341" y="182" width="9" height="58" fill="#708196"/>
              <rect x="350" y="165" width="9" height="75" fill="#DDBB6E"/>
              <rect className="hover-zone" x="329" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(382,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">juil.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 78 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 102 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲31%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 132 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="379" y="182" width="9" height="58" fill="#A4AEBB"/>
              <rect x="388" y="165" width="9" height="75" fill="#708196"/>
              <rect x="397" y="144" width="9" height="96" fill="#DDBB6E"/>
              <rect className="hover-zone" x="376" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(279,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">août</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 102 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 132 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 168 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="426" y="192" width="9" height="48" fill="#A4AEBB"/>
              <rect x="435" y="175" width="9" height="65" fill="#708196"/>
              <rect x="444" y="159" width="9" height="81" fill="#DDBB6E"/>
              <rect className="hover-zone" x="423" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(326,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">sept.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 84 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 115 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 142 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="473" y="188" width="9" height="52" fill="#A4AEBB"/>
              <rect x="482" y="170" width="9" height="70" fill="#708196"/>
              <rect x="491" y="154" width="9" height="86" fill="#DDBB6E"/>
              <rect className="hover-zone" x="470" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(373,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">oct.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 92 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 124 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲35%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 152 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="520" y="184" width="9" height="56" fill="#A4AEBB"/>
              <rect x="529" y="165" width="9" height="75" fill="#708196"/>
              <rect x="538" y="148" width="9" height="92" fill="#DDBB6E"/>
              <rect className="hover-zone" x="517" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(420,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">nov.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 98 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 132 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲35%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 162 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="567" y="176" width="9" height="64" fill="#A4AEBB"/>
              <rect x="576" y="154" width="9" height="86" fill="#708196"/>
              <rect x="585" y="139" width="9" height="101" fill="#DDBB6E"/>
              <rect className="hover-zone" x="564" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(467,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">déc.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 112 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 152 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲36%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 178 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲17%</tspan></text>
              </g>
              </g>
              <text x="68" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">1</text>
              <text x="115" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">2</text>
              <text x="162" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">3</text>
              <text x="209" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">4</text>
              <text x="256" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">5</text>
              <text x="303" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">6</text>
              <text x="350" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">7</text>
              <text x="397" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">8</text>
              <text x="444" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">9</text>
              <text x="491" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">10</text>
              <text x="538" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">11</text>
              <text x="585" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">12</text>
              <rect x="240" y="264" width="9" height="9" fill="#A4AEBB" rx="1.5"/>
              <text x="252" y="272" fontSize="10" fill="var(--navy-300)">2023</text>
              <rect x="300" y="264" width="9" height="9" fill="#708196" rx="1.5"/>
              <text x="312" y="272" fontSize="10" fill="var(--navy-300)">2024</text>
              <rect x="360" y="264" width="9" height="9" fill="#DDBB6E" rx="1.5"/>
              <text x="372" y="272" fontSize="10" fill="var(--navy-300)">2025</text>
              <rect x="420" y="264" width="9" height="9" fill="#102D50" rx="1.5"/>
              <text x="432" y="272" fontSize="10" fill="var(--navy-300)">2026</text>
              </svg></div>
              <div className={`ve-graph-block${mode === "T" ? " active" : ""}`} data-ve-graph="charges_T"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">600k</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">450k</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">300k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">150k</text>
              <g className="hover-month">
              <rect x="70" y="170" width="22" height="70" fill="#A4AEBB"/>
              <rect x="94" y="149" width="22" height="91" fill="#708196"/>
              <rect x="118" y="128" width="22" height="112" fill="#DDBB6E"/>
              <rect x="142" y="-1" width="22" height="241" fill="#102D50"/>
              <rect className="hover-zone" x="65" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(180,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T1 (jan-mars)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 210 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 275 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲31%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 339 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              <text x="5" y="61" fontSize="8.5" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 725 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲114%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="200" y="161" width="22" height="79" fill="#A4AEBB"/>
              <rect x="224" y="129" width="22" height="111" fill="#708196"/>
              <rect x="248" y="100" width="22" height="140" fill="#DDBB6E"/>
              <rect x="272" y="95" width="22" height="145" fill="#102D50"/>
              <rect className="hover-zone" x="195" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(310,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T2 (avr-juin)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 239 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 335 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲40%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 422 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲26%</tspan></text>
              <text x="5" y="61" fontSize="8.5" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 436 600 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲3%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="330" y="152" width="22" height="88" fill="#A4AEBB"/>
              <rect x="354" y="124" width="22" height="116" fill="#708196"/>
              <rect x="378" y="93" width="22" height="147" fill="#DDBB6E"/>
              <rect className="hover-zone" x="325" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(230,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T3 (juil-sept)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 264 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 349 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 442 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="460" y="140" width="22" height="100" fill="#A4AEBB"/>
              <rect x="484" y="104" width="22" height="136" fill="#708196"/>
              <rect x="508" y="76" width="22" height="164" fill="#DDBB6E"/>
              <rect className="hover-zone" x="455" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(360,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T4 (oct-déc)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 302 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 408 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲35%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 492 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲21%</tspan></text>
              </g>
              </g>
              <text x="118" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T1</text>
              <text x="248" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T2</text>
              <text x="378" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T3</text>
              <text x="508" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T4</text>
              <rect x="240" y="264" width="9" height="9" fill="#A4AEBB" rx="1.5"/>
              <text x="252" y="272" fontSize="10" fill="var(--navy-300)">2023</text>
              <rect x="300" y="264" width="9" height="9" fill="#708196" rx="1.5"/>
              <text x="312" y="272" fontSize="10" fill="var(--navy-300)">2024</text>
              <rect x="360" y="264" width="9" height="9" fill="#DDBB6E" rx="1.5"/>
              <text x="372" y="272" fontSize="10" fill="var(--navy-300)">2025</text>
              <rect x="420" y="264" width="9" height="9" fill="#102D50" rx="1.5"/>
              <text x="432" y="272" fontSize="10" fill="var(--navy-300)">2026</text>
              </svg></div>
              <div className={`ve-graph-block${mode === "A" ? " active" : ""}`} data-ve-graph="charges_A"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,8M</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,3M</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">900k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">450k</text>
              <g className="hover-month">
              <rect x="80" y="128" width="80" height="112" fill="#A4AEBB"/>
              <text x="120.0" y="122" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 015 000 €</text>
              <rect className="hover-zone" x="75" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(170,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#A4AEBB">2023</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 015 000 €</text>
              </g>
              </g>
              <text x="120.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2023</text>
              <g className="hover-month">
              <rect x="210" y="89" width="80" height="151" fill="#708196"/>
              <text x="250.0" y="83" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 367 000 €</text>
              <rect className="hover-zone" x="205" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(300,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#708196">2024</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 367 000 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2EA85A">▲ 35% vs N-1</text>
              </g>
              </g>
              <text x="250.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2024</text>
              <g className="hover-month">
              <rect x="340" y="52" width="80" height="188" fill="#DDBB6E"/>
              <text x="380.0" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 695 000 €</text>
              <rect className="hover-zone" x="335" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(210,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#DDBB6E">2025</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 695 000 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2EA85A">▲ 24% vs N-1</text>
              </g>
              </g>
              <text x="380.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2025</text>
              <g className="hover-month">
              <rect x="470" y="111" width="80" height="129" fill="#102D50"/>
              <text x="510.0" y="105" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 161 600 €</text>
              <rect className="hover-zone" x="465" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(340,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#102D50">2026 (cumul jan-mai)</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 161 600 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#E57C4B">▼ 31% vs N-1</text>
              </g>
              </g>
              <text x="510.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2026 ⚠</text>
              <text x="540" y="256" textAnchor="end" fontSize="8" fontStyle="italic" fill="var(--orange-text)">⚠ 2026 = cumul jan-mai</text>
              </svg></div>
            </div>
          </div>

          {/* Graphique 3 : CA encaissé */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><svg><use href="#i-finance"/></svg>CA encaissé · <span className="ve-mode-label" data-ve-target="ca_encaisse">{modeLabel}</span></div>
            </div>
            <div className="card-body" style={{ padding: "14px 18px" }}>
              <div className={`ve-graph-block${mode === "M" ? " active" : ""}`} data-ve-graph="ca_encaisse_M"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">600k</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">450k</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">300k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">150k</text>
              <g className="hover-month">
              <rect x="50" y="217" width="9" height="23" fill="#A4AEBB"/>
              <rect x="59" y="208" width="9" height="32" fill="#708196"/>
              <rect x="68" y="201" width="9" height="39" fill="#DDBB6E"/>
              <rect x="77" y="137" width="9" height="103" fill="#102D50"/>
              <rect className="hover-zone" x="47" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(100,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">janv.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 83 600 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 114 400 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 139 040 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲22%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 362 560 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲161%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="97" y="212" width="9" height="28" fill="#A4AEBB"/>
              <rect x="106" y="201" width="9" height="39" fill="#708196"/>
              <rect x="115" y="191" width="9" height="49" fill="#DDBB6E"/>
              <rect x="124" y="120" width="9" height="120" fill="#102D50"/>
              <rect className="hover-zone" x="94" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(147,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">févr.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 98 560 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 139 040 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲41%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 171 600 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 420 640 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲145%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="144" y="206" width="9" height="34" fill="#A4AEBB"/>
              <rect x="153" y="196" width="9" height="44" fill="#708196"/>
              <rect x="162" y="182" width="9" height="58" fill="#DDBB6E"/>
              <rect x="171" y="109" width="9" height="131" fill="#102D50"/>
              <rect className="hover-zone" x="141" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(194,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">mars</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 121 440 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 156 640 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 204 160 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲30%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 461 120 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲126%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="191" y="205" width="9" height="35" fill="#A4AEBB"/>
              <rect x="200" y="191" width="9" height="49" fill="#708196"/>
              <rect x="209" y="178" width="9" height="62" fill="#DDBB6E"/>
              <rect x="218" y="97" width="9" height="143" fill="#102D50"/>
              <rect className="hover-zone" x="188" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(241,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">avr.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 124 960 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 171 600 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 218 240 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 503 360 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲131%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="238" y="203" width="9" height="37" fill="#A4AEBB"/>
              <rect x="247" y="186" width="9" height="54" fill="#708196"/>
              <rect x="256" y="173" width="9" height="67" fill="#DDBB6E"/>
              <rect x="265" y="140" width="9" height="100" fill="#102D50"/>
              <rect className="hover-zone" x="235" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(288,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">mai</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 130 240 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 189 200 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲45%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 235 840 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲25%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 350 768 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲49%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="285" y="209" width="9" height="31" fill="#A4AEBB"/>
              <rect x="294" y="198" width="9" height="42" fill="#708196"/>
              <rect x="303" y="186" width="9" height="54" fill="#DDBB6E"/>
              <rect className="hover-zone" x="282" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(335,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">juin</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 110 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 147 840 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲34%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 191 840 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲30%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="332" y="206" width="9" height="34" fill="#A4AEBB"/>
              <rect x="341" y="196" width="9" height="44" fill="#708196"/>
              <rect x="350" y="182" width="9" height="58" fill="#DDBB6E"/>
              <rect className="hover-zone" x="329" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(382,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">juil.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 121 440 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 156 640 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 204 160 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲30%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="379" y="196" width="9" height="44" fill="#A4AEBB"/>
              <rect x="388" y="182" width="9" height="58" fill="#708196"/>
              <rect x="397" y="166" width="9" height="74" fill="#DDBB6E"/>
              <rect className="hover-zone" x="376" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(279,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">août</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 156 640 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 205 920 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲31%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 262 240 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="426" y="204" width="9" height="36" fill="#A4AEBB"/>
              <rect x="435" y="191" width="9" height="49" fill="#708196"/>
              <rect x="444" y="178" width="9" height="62" fill="#DDBB6E"/>
              <rect className="hover-zone" x="423" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(326,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">sept.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 127 600 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 174 240 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 218 240 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲25%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="473" y="201" width="9" height="39" fill="#A4AEBB"/>
              <rect x="482" y="186" width="9" height="54" fill="#708196"/>
              <rect x="491" y="173" width="9" height="67" fill="#DDBB6E"/>
              <rect className="hover-zone" x="470" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(373,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">oct.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 139 040 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 189 200 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲36%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 235 840 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲25%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="520" y="198" width="9" height="42" fill="#A4AEBB"/>
              <rect x="529" y="182" width="9" height="58" fill="#708196"/>
              <rect x="538" y="169" width="9" height="71" fill="#DDBB6E"/>
              <rect className="hover-zone" x="517" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(420,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">nov.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 147 840 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 204 160 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲38%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 251 680 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲23%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="567" y="191" width="9" height="49" fill="#A4AEBB"/>
              <rect x="576" y="173" width="9" height="67" fill="#708196"/>
              <rect x="585" y="161" width="9" height="79" fill="#DDBB6E"/>
              <rect className="hover-zone" x="564" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(467,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">déc.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 171 600 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 235 840 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 279 840 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲19%</tspan></text>
              </g>
              </g>
              <text x="68" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">1</text>
              <text x="115" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">2</text>
              <text x="162" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">3</text>
              <text x="209" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">4</text>
              <text x="256" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">5</text>
              <text x="303" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">6</text>
              <text x="350" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">7</text>
              <text x="397" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">8</text>
              <text x="444" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">9</text>
              <text x="491" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">10</text>
              <text x="538" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">11</text>
              <text x="585" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">12</text>
              <rect x="240" y="264" width="9" height="9" fill="#A4AEBB" rx="1.5"/>
              <text x="252" y="272" fontSize="10" fill="var(--navy-300)">2023</text>
              <rect x="300" y="264" width="9" height="9" fill="#708196" rx="1.5"/>
              <text x="312" y="272" fontSize="10" fill="var(--navy-300)">2024</text>
              <rect x="360" y="264" width="9" height="9" fill="#DDBB6E" rx="1.5"/>
              <text x="372" y="272" fontSize="10" fill="var(--navy-300)">2025</text>
              <rect x="420" y="264" width="9" height="9" fill="#102D50" rx="1.5"/>
              <text x="432" y="272" fontSize="10" fill="var(--navy-300)">2026</text>
              </svg></div>
              <div className={`ve-graph-block${mode === "T" ? " active" : ""}`} data-ve-graph="ca_encaisse_T"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,1M</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">825k</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">550k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">275k</text>
              <g className="hover-month">
              <rect x="70" y="185" width="22" height="55" fill="#A4AEBB"/>
              <rect x="94" y="166" width="22" height="74" fill="#708196"/>
              <rect x="118" y="147" width="22" height="93" fill="#DDBB6E"/>
              <rect x="142" y="14" width="22" height="226" fill="#102D50"/>
              <rect className="hover-zone" x="65" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(180,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T1 (jan-mars)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 303 600 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 410 080 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲35%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 514 800 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲26%</tspan></text>
              <text x="5" y="61" fontSize="8.5" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 1 244 320 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲142%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="200" y="174" width="22" height="66" fill="#A4AEBB"/>
              <rect x="224" y="148" width="22" height="92" fill="#708196"/>
              <rect x="248" y="123" width="22" height="117" fill="#DDBB6E"/>
              <rect x="272" y="85" width="22" height="155" fill="#102D50"/>
              <rect className="hover-zone" x="195" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(310,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T2 (avr-juin)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 365 200 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 508 640 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲39%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 645 920 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              <text x="5" y="61" fontSize="8.5" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 854 128 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="330" y="167" width="22" height="73" fill="#A4AEBB"/>
              <rect x="354" y="143" width="22" height="97" fill="#708196"/>
              <rect x="378" y="116" width="22" height="124" fill="#DDBB6E"/>
              <rect className="hover-zone" x="325" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(230,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T3 (juil-sept)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 405 680 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 536 800 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 684 640 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲28%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="460" y="157" width="22" height="83" fill="#A4AEBB"/>
              <rect x="484" y="126" width="22" height="114" fill="#708196"/>
              <rect x="508" y="101" width="22" height="139" fill="#DDBB6E"/>
              <rect className="hover-zone" x="455" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(360,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T4 (oct-déc)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 458 480 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 629 200 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 767 360 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲22%</tspan></text>
              </g>
              </g>
              <text x="118" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T1</text>
              <text x="248" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T2</text>
              <text x="378" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T3</text>
              <text x="508" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T4</text>
              <rect x="240" y="264" width="9" height="9" fill="#A4AEBB" rx="1.5"/>
              <text x="252" y="272" fontSize="10" fill="var(--navy-300)">2023</text>
              <rect x="300" y="264" width="9" height="9" fill="#708196" rx="1.5"/>
              <text x="312" y="272" fontSize="10" fill="var(--navy-300)">2024</text>
              <rect x="360" y="264" width="9" height="9" fill="#DDBB6E" rx="1.5"/>
              <text x="372" y="272" fontSize="10" fill="var(--navy-300)">2025</text>
              <rect x="420" y="264" width="9" height="9" fill="#102D50" rx="1.5"/>
              <text x="432" y="272" fontSize="10" fill="var(--navy-300)">2026</text>
              </svg></div>
              <div className={`ve-graph-block${mode === "A" ? " active" : ""}`} data-ve-graph="ca_encaisse_A"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">3,5M</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">2,6M</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,7M</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">875k</text>
              <g className="hover-month">
              <rect x="80" y="153" width="80" height="87" fill="#A4AEBB"/>
              <text x="120.0" y="147" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 532 960 €</text>
              <rect className="hover-zone" x="75" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(170,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#A4AEBB">2023</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 532 960 €</text>
              </g>
              </g>
              <text x="120.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2023</text>
              <g className="hover-month">
              <rect x="210" y="121" width="80" height="119" fill="#708196"/>
              <text x="250.0" y="115" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 084 720 €</text>
              <rect className="hover-zone" x="205" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(300,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#708196">2024</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 084 720 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2EA85A">▲ 36% vs N-1</text>
              </g>
              </g>
              <text x="250.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2024</text>
              <g className="hover-month">
              <rect x="340" y="91" width="80" height="149" fill="#DDBB6E"/>
              <text x="380.0" y="85" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 612 720 €</text>
              <rect className="hover-zone" x="335" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(210,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#DDBB6E">2025</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 612 720 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2EA85A">▲ 25% vs N-1</text>
              </g>
              </g>
              <text x="380.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2025</text>
              <g className="hover-month">
              <rect x="470" y="121" width="80" height="119" fill="#102D50"/>
              <text x="510.0" y="115" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 098 448 €</text>
              <rect className="hover-zone" x="465" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(340,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#102D50">2026 (cumul jan-mai)</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">2 098 448 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#E57C4B">▼ 20% vs N-1</text>
              </g>
              </g>
              <text x="510.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2026 ⚠</text>
              <text x="540" y="256" textAnchor="end" fontSize="8" fontStyle="italic" fill="var(--orange-text)">⚠ 2026 = cumul jan-mai</text>
              </svg></div>
            </div>
          </div>

          {/* Graphique 4 : Résultat net */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><svg><use href="#i-finance"/></svg>Résultat net · <span className="ve-mode-label" data-ve-target="rn">{modeLabel}</span></div>
            </div>
            <div className="card-body" style={{ padding: "14px 18px" }}>
              <div className={`ve-graph-block${mode === "M" ? " active" : ""}`} data-ve-graph="rn_M"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">350k</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">260k</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">170k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">90k</text>
              <g className="hover-month">
              <rect x="50" y="223" width="9" height="17" fill="#A4AEBB"/>
              <rect x="59" y="211" width="9" height="29" fill="#708196"/>
              <rect x="68" y="204" width="9" height="36" fill="#DDBB6E"/>
              <rect x="77" y="138" width="9" height="102" fill="#102D50"/>
              <rect className="hover-zone" x="47" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(100,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">janv.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 31 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 52 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲68%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 63 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲21%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 180 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲186%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="97" y="215" width="9" height="25" fill="#A4AEBB"/>
              <rect x="106" y="203" width="9" height="37" fill="#708196"/>
              <rect x="115" y="193" width="9" height="47" fill="#DDBB6E"/>
              <rect x="124" y="107" width="9" height="133" fill="#102D50"/>
              <rect className="hover-zone" x="94" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(147,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">févr.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 44 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 66 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲50%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 83 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲26%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 233 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲181%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="144" y="206" width="9" height="34" fill="#A4AEBB"/>
              <rect x="153" y="199" width="9" height="41" fill="#708196"/>
              <rect x="162" y="183" width="9" height="57" fill="#DDBB6E"/>
              <rect x="171" y="83" width="9" height="157" fill="#102D50"/>
              <rect className="hover-zone" x="141" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(194,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">mars</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 60 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 73 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲22%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 100 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲37%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 276 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲176%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="191" y="206" width="9" height="34" fill="#A4AEBB"/>
              <rect x="200" y="195" width="9" height="45" fill="#708196"/>
              <rect x="209" y="180" width="9" height="60" fill="#DDBB6E"/>
              <rect x="218" y="60" width="9" height="180" fill="#102D50"/>
              <rect className="hover-zone" x="188" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(241,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">avr.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 60 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 80 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲33%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 106 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 316 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲198%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="238" y="204" width="9" height="36" fill="#A4AEBB"/>
              <rect x="247" y="187" width="9" height="53" fill="#708196"/>
              <rect x="256" y="174" width="9" height="66" fill="#DDBB6E"/>
              <rect x="265" y="116" width="9" height="124" fill="#102D50"/>
              <rect className="hover-zone" x="235" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(288,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">mai</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 63 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 93 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲48%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 116 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲25%</tspan></text>
              <text x="5" y="61" fontSize="8" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 218 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲88%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="285" y="210" width="9" height="30" fill="#A4AEBB"/>
              <rect x="294" y="200" width="9" height="40" fill="#708196"/>
              <rect x="303" y="189" width="9" height="51" fill="#DDBB6E"/>
              <rect className="hover-zone" x="282" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(335,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">juin</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 53 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 70 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 90 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="332" y="206" width="9" height="34" fill="#A4AEBB"/>
              <rect x="341" y="197" width="9" height="43" fill="#708196"/>
              <rect x="350" y="183" width="9" height="57" fill="#DDBB6E"/>
              <rect className="hover-zone" x="329" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(382,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">juil.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 60 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 76 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 100 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="379" y="197" width="9" height="43" fill="#A4AEBB"/>
              <rect x="388" y="182" width="9" height="58" fill="#708196"/>
              <rect x="397" y="166" width="9" height="74" fill="#DDBB6E"/>
              <rect className="hover-zone" x="376" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(279,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">août</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 76 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 102 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲34%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 130 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="426" y="206" width="9" height="34" fill="#A4AEBB"/>
              <rect x="435" y="193" width="9" height="47" fill="#708196"/>
              <rect x="444" y="180" width="9" height="60" fill="#DDBB6E"/>
              <rect className="hover-zone" x="423" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(326,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">sept.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 61 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 83 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲36%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 106 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲28%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="473" y="203" width="9" height="37" fill="#A4AEBB"/>
              <rect x="482" y="188" width="9" height="52" fill="#708196"/>
              <rect x="491" y="174" width="9" height="66" fill="#DDBB6E"/>
              <rect className="hover-zone" x="470" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(373,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">oct.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 66 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 91 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲38%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 116 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲27%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="520" y="200" width="9" height="40" fill="#A4AEBB"/>
              <rect x="529" y="183" width="9" height="57" fill="#708196"/>
              <rect x="538" y="170" width="9" height="70" fill="#DDBB6E"/>
              <rect className="hover-zone" x="517" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(420,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">nov.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 70 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 100 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲43%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 124 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲24%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="567" y="193" width="9" height="47" fill="#A4AEBB"/>
              <rect x="576" y="174" width="9" height="66" fill="#708196"/>
              <rect x="585" y="160" width="9" height="80" fill="#DDBB6E"/>
              <rect className="hover-zone" x="564" y="40" width="48" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(467,50)">
              <rect x="0" y="0" width="100" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="50" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">déc.</text>
              <text x="5" y="28" fontSize="8" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 83 000 €</text>
              <text x="5" y="39" fontSize="8" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 116 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲40%</tspan></text>
              <text x="5" y="50" fontSize="8" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 140 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲21%</tspan></text>
              </g>
              </g>
              <text x="68" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">1</text>
              <text x="115" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">2</text>
              <text x="162" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">3</text>
              <text x="209" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">4</text>
              <text x="256" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">5</text>
              <text x="303" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">6</text>
              <text x="350" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">7</text>
              <text x="397" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">8</text>
              <text x="444" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">9</text>
              <text x="491" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">10</text>
              <text x="538" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">11</text>
              <text x="585" y="256" textAnchor="middle" fontSize="9.5" fill="var(--navy-300)">12</text>
              <rect x="240" y="264" width="9" height="9" fill="#A4AEBB" rx="1.5"/>
              <text x="252" y="272" fontSize="10" fill="var(--navy-300)">2023</text>
              <rect x="300" y="264" width="9" height="9" fill="#708196" rx="1.5"/>
              <text x="312" y="272" fontSize="10" fill="var(--navy-300)">2024</text>
              <rect x="360" y="264" width="9" height="9" fill="#DDBB6E" rx="1.5"/>
              <text x="372" y="272" fontSize="10" fill="var(--navy-300)">2025</text>
              <rect x="420" y="264" width="9" height="9" fill="#102D50" rx="1.5"/>
              <text x="432" y="272" fontSize="10" fill="var(--navy-300)">2026</text>
              </svg></div>
              <div className={`ve-graph-block${mode === "T" ? " active" : ""}`} data-ve-graph="rn_T"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">600k</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">450k</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">300k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">150k</text>
              <g className="hover-month">
              <rect x="70" y="195" width="22" height="45" fill="#A4AEBB"/>
              <rect x="94" y="177" width="22" height="63" fill="#708196"/>
              <rect x="118" y="158" width="22" height="82" fill="#DDBB6E"/>
              <rect x="142" y="11" width="22" height="229" fill="#102D50"/>
              <rect className="hover-zone" x="65" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(180,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T1 (jan-mars)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 135 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 191 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲41%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 246 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              <text x="5" y="61" fontSize="8.5" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 689 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲180%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="200" y="182" width="22" height="58" fill="#A4AEBB"/>
              <rect x="224" y="159" width="22" height="81" fill="#708196"/>
              <rect x="248" y="136" width="22" height="104" fill="#DDBB6E"/>
              <rect x="272" y="62" width="22" height="178" fill="#102D50"/>
              <rect className="hover-zone" x="195" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(310,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T2 (avr-juin)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 176 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 243 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲38%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 312 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲28%</tspan></text>
              <text x="5" y="61" fontSize="8.5" fill="var(--navy)"><tspan fill="#102D50" fontWeight="700">●</tspan> <tspan fontWeight="600">2026</tspan> 534 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲71%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="330" y="175" width="22" height="65" fill="#A4AEBB"/>
              <rect x="354" y="153" width="22" height="87" fill="#708196"/>
              <rect x="378" y="128" width="22" height="112" fill="#DDBB6E"/>
              <rect className="hover-zone" x="325" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(230,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T3 (juil-sept)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 197 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 261 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲32%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 336 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲29%</tspan></text>
              </g>
              </g>
              <g className="hover-month">
              <rect x="460" y="167" width="22" height="73" fill="#A4AEBB"/>
              <rect x="484" y="138" width="22" height="102" fill="#708196"/>
              <rect x="508" y="114" width="22" height="126" fill="#DDBB6E"/>
              <rect className="hover-zone" x="455" y="40" width="110" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(360,50)">
              <rect x="0" y="0" width="120" height="84" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--navy)">T4 (oct-déc)</text>
              <text x="5" y="28" fontSize="8.5" fill="var(--navy)"><tspan fill="#A4AEBB" fontWeight="700">●</tspan> <tspan fontWeight="600">2023</tspan> 219 000 €</text>
              <text x="5" y="39" fontSize="8.5" fill="var(--navy)"><tspan fill="#708196" fontWeight="700">●</tspan> <tspan fontWeight="600">2024</tspan> 307 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲40%</tspan></text>
              <text x="5" y="50" fontSize="8.5" fill="var(--navy)"><tspan fill="#DDBB6E" fontWeight="700">●</tspan> <tspan fontWeight="600">2025</tspan> 380 000 € <tspan fill="#2EA85A" fontSize="7" fontWeight="700">▲24%</tspan></text>
              </g>
              </g>
              <text x="118" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T1</text>
              <text x="248" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T2</text>
              <text x="378" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T3</text>
              <text x="508" y="258" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--navy-300)">T4</text>
              <rect x="240" y="264" width="9" height="9" fill="#A4AEBB" rx="1.5"/>
              <text x="252" y="272" fontSize="10" fill="var(--navy-300)">2023</text>
              <rect x="300" y="264" width="9" height="9" fill="#708196" rx="1.5"/>
              <text x="312" y="272" fontSize="10" fill="var(--navy-300)">2024</text>
              <rect x="360" y="264" width="9" height="9" fill="#DDBB6E" rx="1.5"/>
              <text x="372" y="272" fontSize="10" fill="var(--navy-300)">2025</text>
              <rect x="420" y="264" width="9" height="9" fill="#102D50" rx="1.5"/>
              <text x="432" y="272" fontSize="10" fill="var(--navy-300)">2026</text>
              </svg></div>
              <div className={`ve-graph-block${mode === "A" ? " active" : ""}`} data-ve-graph="rn_A"><svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }} fontFamily="Epilogue, sans-serif">
              <line x1="46" y1="40" x2="580" y2="40" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="100" x2="580" y2="100" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="160" x2="580" y2="160" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="220" x2="580" y2="220" stroke="var(--navy-100)" strokeWidth="0.5" opacity="0.5"/>
              <line x1="46" y1="240" x2="580" y2="240" stroke="var(--navy-300)" strokeWidth="1"/>
              <text x="40" y="44" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,8M</text>
              <text x="40" y="104" textAnchor="end" fontSize="9" fill="var(--navy-300)">1,3M</text>
              <text x="40" y="164" textAnchor="end" fontSize="9" fill="var(--navy-300)">900k</text>
              <text x="40" y="224" textAnchor="end" fontSize="9" fill="var(--navy-300)">450k</text>
              <g className="hover-month">
              <rect x="80" y="160" width="80" height="80" fill="#A4AEBB"/>
              <text x="120.0" y="154" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">727 000 €</text>
              <rect className="hover-zone" x="75" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(170,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#A4AEBB">2023</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">727 000 €</text>
              </g>
              </g>
              <text x="120.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2023</text>
              <g className="hover-month">
              <rect x="210" y="129" width="80" height="111" fill="#708196"/>
              <text x="250.0" y="123" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 002 000 €</text>
              <rect className="hover-zone" x="205" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(300,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#708196">2024</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 002 000 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2EA85A">▲ 38% vs N-1</text>
              </g>
              </g>
              <text x="250.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2024</text>
              <g className="hover-month">
              <rect x="340" y="99" width="80" height="141" fill="#DDBB6E"/>
              <text x="380.0" y="93" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 274 000 €</text>
              <rect className="hover-zone" x="335" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(210,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#DDBB6E">2025</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 274 000 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2EA85A">▲ 27% vs N-1</text>
              </g>
              </g>
              <text x="380.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2025</text>
              <g className="hover-month">
              <rect x="470" y="105" width="80" height="135" fill="#102D50"/>
              <text x="510.0" y="99" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 223 000 €</text>
              <rect className="hover-zone" x="465" y="40" width="90" height="200" fill="transparent"/>
              <g className="hover-tooltip" transform="translate(340,80)">
              <rect x="0" y="0" width="120" height="50" fill="white" stroke="var(--navy-100)" strokeWidth="1" rx="4" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"/>
              <text x="60" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#102D50">2026 (cumul jan-mai)</text>
              <text x="60" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy)">1 223 000 €</text>
              <text x="60" y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#E57C4B">▼ 4% vs N-1</text>
              </g>
              </g>
              <text x="510.0" y="256" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--navy-300)">2026 ⚠</text>
              <text x="540" y="256" textAnchor="end" fontSize="8" fontStyle="italic" fill="var(--orange-text)">⚠ 2026 = cumul jan-mai</text>
              </svg></div>
            </div>
          </div>
        </div>



    </>
  );
}
