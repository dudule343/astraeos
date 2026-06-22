"use client";

import { useState } from "react";

import { quickFilters } from "./clientsData";

// Table portée à l'identique de la maquette (#page-clients) : filtres rapides
// (.qf, état actif purement visuel comme dans le <script> du wireframe), recherche,
// sections de groupes, lignes cliquables et sous-lignes de cabinets affiliés.
export function ClientsTable() {
  const [activeFilter, setActiveFilter] = useState(0);

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          {quickFilters.map((qf, i) => (
            <button
              key={qf.label}
              className={i === activeFilter ? "qf active" : "qf"}
              onClick={() => setActiveFilter(i)}
            >
              {qf.label} <span className="qf-count">{qf.count}</span>
            </button>
          ))}
        </div>
        <div className="table-toolbar-right">
          <div className="search-wrap">
            <svg>
              <use href="#i-search" />
            </svg>
            <input className="search-input" placeholder="Rechercher un client..." />
          </div>
        </div>
      </div>

      <table className="dt">
        <thead>
          <tr>
            <th>#</th>
            <th>Client</th>
            <th>Catégorie</th>
            <th className="num">Ingénieurs</th>
            <th className="num">Clients finaux</th>
            <th className="num">Revenu /mois</th>
            <th>Pack</th>
            <th>Statut</th>
            <th className="center">Santé</th>
          </tr>
        </thead>
        <tbody>
          <tr className="dt-section">
            <td colSpan={9}>
              ▾ Marques (franchise · licence · réseau) — cliquez sur une marque pour déplier ses
              cabinets affiliés
            </td>
          </tr>

          <tr
            className="dt-clickable"
            onClick={() => alert("Déploiement des cabinets affiliés à ASTRAEOS Capital")}
          >
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              01
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-priveos">P</div>
                <div>
                  <div className="cell-primary">ASTRAEOS Capital</div>
                  <div
                    style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "2px" }}
                  >
                    ▾ 30 cabinets affiliés · cliquer pour déplier
                  </div>
                </div>
              </div>
            </td>
            <td>
              <span className="tt tt-marque">Marque · Licence</span>
            </td>
            <td className="num">~80</td>
            <td className="num">486</td>
            <td className="num cell-money">12 800 €</td>
            <td>
              <span className="badge badge-gold">Premium</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-warning">78</span>
            </td>
          </tr>

          <tr style={{ background: "var(--light-blue)" }}>
            <td
              className="num"
              style={{ paddingLeft: "30px", fontSize: "11px", color: "var(--navy-300)" }}
            >
              └
            </td>
            <td>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  paddingLeft: "8px",
                }}
              >
                <div className="tlogo tlogo-1 tlogo-sm">PE</div>
                <div className="cell-primary" style={{ fontSize: "12px" }}>
                  Cabinet Paris Étoile
                </div>
              </div>
            </td>
            <td>
              <span className="tt tt-cabinet">Cabinet affilié</span>
            </td>
            <td className="num">8</td>
            <td className="num">62</td>
            <td className="num cell-money">— inclus —</td>
            <td>
              <span className="badge badge-neutral">Hérité</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-success">94</span>
            </td>
          </tr>
          <tr style={{ background: "var(--light-blue)" }}>
            <td
              className="num"
              style={{ paddingLeft: "30px", fontSize: "11px", color: "var(--navy-300)" }}
            >
              └
            </td>
            <td>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  paddingLeft: "8px",
                }}
              >
                <div className="tlogo tlogo-2 tlogo-sm">L</div>
                <div className="cell-primary" style={{ fontSize: "12px" }}>
                  Cabinet Lyon Bellecour
                </div>
              </div>
            </td>
            <td>
              <span className="tt tt-cabinet">Cabinet affilié</span>
            </td>
            <td className="num">5</td>
            <td className="num">38</td>
            <td className="num cell-money">— inclus —</td>
            <td>
              <span className="badge badge-neutral">Hérité</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-success">87</span>
            </td>
          </tr>
          <tr style={{ background: "var(--light-blue)" }}>
            <td
              colSpan={9}
              style={{
                padding: "8px 16px",
                textAlign: "center",
                fontSize: "11.5px",
                color: "var(--navy-300)",
              }}
            >
              … et{" "}
              <strong style={{ color: "var(--gold)" }}>28 autres cabinets affiliés</strong> ·{" "}
              <a style={{ color: "var(--gold)", fontWeight: 600, cursor: "pointer" }}>
                voir la liste complète
              </a>
            </td>
          </tr>

          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              02
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-3">F</div>
                <div>
                  <div className="cell-primary">Fontaine &amp; Réseau</div>
                  <div
                    style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "2px" }}
                  >
                    ▸ 12 cabinets affiliés
                  </div>
                </div>
              </div>
            </td>
            <td>
              <span className="tt tt-marque">Marque · Réseau</span>
            </td>
            <td className="num">~32</td>
            <td className="num">198</td>
            <td className="num cell-money">5 600 €</td>
            <td>
              <span className="badge badge-gold">Premium</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-success">85</span>
            </td>
          </tr>
          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              03
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-1">A</div>
                <div>
                  <div className="cell-primary">Atlas Patrimoine</div>
                  <div
                    style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "2px" }}
                  >
                    ▸ 8 cabinets affiliés (franchise)
                  </div>
                </div>
              </div>
            </td>
            <td>
              <span className="tt tt-marque">Marque · Franchise</span>
            </td>
            <td className="num">~24</td>
            <td className="num">142</td>
            <td className="num cell-money">3 800 €</td>
            <td>
              <span className="badge badge-info">Standard</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-success">82</span>
            </td>
          </tr>

          <tr className="dt-section">
            <td colSpan={9}>
              ▾ Cabinets directs (indépendants — incluant les mandataires des marques)
            </td>
          </tr>

          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              04
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-dupont">D</div>
                <div className="cell-primary">Cabinet Dupont &amp; Associés</div>
              </div>
            </td>
            <td>
              <span className="tt tt-cabinet">Cabinet direct</span>
            </td>
            <td className="num">6</td>
            <td className="num">48</td>
            <td className="num cell-money">2 400 €</td>
            <td>
              <span className="badge badge-gold">Premium</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-success">92</span>
            </td>
          </tr>
          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              05
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-montblanc">MB</div>
                <div className="cell-primary">Mont-Blanc Patrimoine</div>
              </div>
            </td>
            <td>
              <span className="tt tt-cabinet">Cabinet direct</span>
            </td>
            <td className="num">4</td>
            <td className="num">32</td>
            <td className="num cell-money">2 100 €</td>
            <td>
              <span className="badge badge-gold">Premium</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-success">89</span>
            </td>
          </tr>
          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              06
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-2">L</div>
                <div className="cell-primary">Cabinet Lyonnais</div>
              </div>
            </td>
            <td>
              <span className="tt tt-cabinet">Cabinet direct</span>
            </td>
            <td className="num">3</td>
            <td className="num">22</td>
            <td className="num cell-money">1 800 €</td>
            <td>
              <span className="badge badge-info">Standard</span>
            </td>
            <td>
              <span className="badge badge-warning">À risque</span>
            </td>
            <td className="center">
              <span className="badge badge-warning">58</span>
            </td>
          </tr>
          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              07
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-1">B</div>
                <div className="cell-primary">Bordeaux Patrimoine</div>
              </div>
            </td>
            <td>
              <span className="tt tt-cabinet">Cabinet direct</span>
            </td>
            <td className="num">2</td>
            <td className="num">14</td>
            <td className="num cell-money">1 200 €</td>
            <td>
              <span className="badge badge-info">Standard</span>
            </td>
            <td>
              <span className="badge badge-warning">À risque</span>
            </td>
            <td className="center">
              <span className="badge badge-danger">42</span>
            </td>
          </tr>

          <tr className="dt-section">
            <td colSpan={9}>
              ▾ Autres professionnels (notaires, avocats, experts-comptables, etc.)
            </td>
          </tr>

          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              21
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-pro">M</div>
                <div className="cell-primary">Notaire Mercier &amp; Cie</div>
              </div>
            </td>
            <td>
              <span className="tt tt-pro">Notaire</span>
            </td>
            <td className="num">3</td>
            <td className="num">28</td>
            <td className="num cell-money">1 200 €</td>
            <td>
              <span className="badge badge-info">Standard</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-success">88</span>
            </td>
          </tr>
          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              22
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-pro">A</div>
                <div className="cell-primary">Cabinet Aubert · Avocats</div>
              </div>
            </td>
            <td>
              <span className="tt tt-pro">Avocat</span>
            </td>
            <td className="num">2</td>
            <td className="num">12</td>
            <td className="num cell-money">980 €</td>
            <td>
              <span className="badge badge-info">Standard</span>
            </td>
            <td>
              <span className="badge badge-success">Actif</span>
            </td>
            <td className="center">
              <span className="badge badge-success">81</span>
            </td>
          </tr>
          <tr className="dt-clickable">
            <td
              className="num cell-id"
              style={{ fontFamily: "'Epilogue'", fontWeight: 700, color: "var(--gold)" }}
            >
              23
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <div className="tlogo tlogo-pro">P</div>
                <div className="cell-primary">Notaire Pollet</div>
              </div>
            </td>
            <td>
              <span className="tt tt-pro">Notaire</span>
            </td>
            <td className="num">1</td>
            <td className="num">8</td>
            <td className="num cell-money">820 €</td>
            <td>
              <span className="badge badge-info">Standard</span>
            </td>
            <td>
              <span className="badge badge-warning">À risque</span>
            </td>
            <td className="center">
              <span className="badge badge-warning">54</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
