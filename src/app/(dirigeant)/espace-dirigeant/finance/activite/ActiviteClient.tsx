"use client";

import { useState } from "react";

// Tableau 1 (nouveaux clients par mois) avec cellules cliquables 2026 ouvrant le drawer
// drilldown, fidèle à la maquette (reference/wireframes-dirigeant.html, lignes 5122-5237 +
// drawer 5767-5835). openDrawerActivite(mois, annee) → état React qui ouvre le drawer et
// change son titre.

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
] as const;

const ROW_2025 = [28, 42, 58, 52, 48, 22, 38, 98, 18, 42, 22, 18];
const ROW_2024 = [32, 52, 68, 58, 64, 28, 62, 152, 22, 58, 32, 56];
const ROW_2023 = [30, 53, 61, 52, 63, 32, 86, 178, 46, 82, 44, 103];
const ROW_TOTAL = [112, 175, 218, 196, 202, 82, 186, 428, 86, 182, 98, 177];

const DRAWER_ROWS: {
  date: string;
  client: string;
  ing1: string;
  ing2: string;
  badge: string;
  badgeStyle: React.CSSProperties;
  montant: string;
}[] = [
  {
    date: "02/01/2026",
    client: "Olivier MAILLOT",
    ing1: "Luc THILLIEZ",
    ing2: "Émilie LAMBERT",
    badge: "Étude patrimoniale",
    badgeStyle: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "10px" },
    montant: "8 200 €",
  },
  {
    date: "04/01/2026",
    client: "Bertrand & Monique DUPONT-TOPIN",
    ing1: "Luc THILLIEZ",
    ing2: "Julien VASSEUR",
    badge: "Étude patrimoniale",
    badgeStyle: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "10px" },
    montant: "12 400 €",
  },
  {
    date: "07/01/2026",
    client: "SAS GROUPE LEBON",
    ing1: "Luc THILLIEZ",
    ing2: "Luc THILLIEZ",
    badge: "Immatriculation société",
    badgeStyle: { background: "var(--light-blue)", color: "var(--navy)", fontSize: "10px" },
    montant: "2 000 €",
  },
  {
    date: "09/01/2026",
    client: "Stéphane MOREAU",
    ing1: "Julien VASSEUR",
    ing2: "Romain BERTHIER",
    badge: "Étude patrimoniale",
    badgeStyle: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "10px" },
    montant: "9 600 €",
  },
  {
    date: "12/01/2026",
    client: "Anne & Pierre LEROY",
    ing1: "Thomas LEROY",
    ing2: "Antoine ROSSI",
    badge: "Étude patrimoniale",
    badgeStyle: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "10px" },
    montant: "11 200 €",
  },
  {
    date: "15/01/2026",
    client: "Hélène GUYOT",
    ing1: "Sophie MERCIER",
    ing2: "Caroline FAURE",
    badge: "Investissement immobilier",
    badgeStyle: { background: "#E8F5EE", color: "var(--green-text)", fontSize: "10px" },
    montant: "22 000 €",
  },
  {
    date: "17/01/2026",
    client: "Marc & Sandra DELACROIX",
    ing1: "Julien VASSEUR",
    ing2: "Mathieu KELLER",
    badge: "Étude patrimoniale",
    badgeStyle: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "10px" },
    montant: "14 800 €",
  },
  {
    date: "19/01/2026",
    client: "Camille DURIEZ",
    ing1: "Julien VASSEUR",
    ing2: "Olivier MARTIN",
    badge: "Investissement immobilier",
    badgeStyle: { background: "#E8F5EE", color: "var(--green-text)", fontSize: "10px" },
    montant: "18 600 €",
  },
  {
    date: "22/01/2026",
    client: "Marie DUBOIS",
    ing1: "Julien VASSEUR",
    ing2: "Romain BERTHIER",
    badge: "Investissement financier",
    badgeStyle: { background: "var(--purple-bg)", color: "var(--purple-text)", fontSize: "10px" },
    montant: "9 800 €",
  },
  {
    date: "23/01/2026",
    client: "Régis FOUCAULT",
    ing1: "Julien VASSEUR",
    ing2: "Mathieu KELLER",
    badge: "Étude patrimoniale",
    badgeStyle: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "10px" },
    montant: "7 800 €",
  },
  {
    date: "25/01/2026",
    client: "Famille DELANNOY (neveu)",
    ing1: "Cabinet PRIVEOS direct",
    ing2: "Luc THILLIEZ",
    badge: "Investissement immobilier",
    badgeStyle: { background: "#E8F5EE", color: "var(--green-text)", fontSize: "10px" },
    montant: "28 400 €",
  },
  {
    date: "26/01/2026",
    client: "Albert & Cécile HUYGHE",
    ing1: "Luc THILLIEZ",
    ing2: "Émilie LAMBERT",
    badge: "Investissement immobilier",
    badgeStyle: { background: "#E8F5EE", color: "var(--green-text)", fontSize: "10px" },
    montant: "38 200 €",
  },
];

const numCellStyle: React.CSSProperties = { fontWeight: 700 };
const dashStyle: React.CSSProperties = { color: "var(--navy-300)" };

const kpiCard: React.CSSProperties = {
  background: "white",
  padding: "12px 14px",
  borderRadius: "8px",
  borderLeft: "3px solid var(--gold)",
};
const kpiCardLabel: React.CSSProperties = {
  fontSize: "10px",
  color: "var(--navy-300)",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

export function ActiviteClient() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Nouveaux clients · janvier 2026");

  function openDrawer(mois: string, annee: string) {
    setTitle(`Nouveaux clients · ${mois} ${annee}`);
    setOpen(true);
  }

  return (
    <>
      {/* Tableau 1 : Nouveaux clients par mois × année */}
      <div className="card mb-24">
        <div
          className="card-header"
          style={{ background: "white", borderBottom: "1px solid var(--navy-100)" }}
        >
          <div className="card-title" style={{ color: "var(--navy)" }}>
            Nombre de nouveaux clients générés par mois{" "}
            <span style={{ fontWeight: 400, color: "var(--navy-300)", fontSize: "12px" }}>
              (en date d&apos;achat)
            </span>
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
          </div>
        </div>
        <table className="dt" style={{ fontSize: "11.5px" }}>
          <thead>
            <tr style={{ background: "var(--navy)", color: "white" }}>
              <th style={{ background: "var(--navy)", color: "white", width: "7%" }}></th>
              <th
                className="num"
                style={{ background: "var(--green-text)", color: "white", width: "8%" }}
              >
                Total
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="num" style={{ color: "white" }}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: "var(--green-bg, #E8F5EE)" }}>
              <td style={{ background: "var(--green-text)", color: "white", fontWeight: 700 }}>
                Total
              </td>
              <td
                className="num"
                style={{ background: "var(--green-bg, #E8F5EE)", fontWeight: 700 }}
              >
                2 142
              </td>
              {ROW_TOTAL.map((v, i) => (
                <td key={i} className="num" style={numCellStyle}>
                  {v}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ background: "var(--navy)", color: "white", fontWeight: 700 }}>2026</td>
              <td
                className="num activite-clic-cell"
                style={{ background: "var(--ivory)", fontWeight: 700, cursor: "pointer" }}
                onClick={() => openDrawer("cumul", "2026")}
                title="Voir détail cumul 2026"
              >
                142
              </td>
              <td
                className="num activite-clic-cell"
                onClick={() => openDrawer("janvier", "2026")}
                title="Voir détail · janvier 2026"
              >
                22
              </td>
              <td
                className="num activite-clic-cell"
                onClick={() => openDrawer("février", "2026")}
                title="Voir détail · février 2026"
              >
                28
              </td>
              <td
                className="num activite-clic-cell"
                onClick={() => openDrawer("mars", "2026")}
                title="Voir détail · mars 2026"
              >
                31
              </td>
              <td
                className="num activite-clic-cell"
                onClick={() => openDrawer("avril", "2026")}
                title="Voir détail · avril 2026"
              >
                34
              </td>
              <td
                className="num cell-money gold activite-clic-cell"
                onClick={() => openDrawer("mai", "2026")}
                title="Voir détail · mai 2026"
              >
                27
              </td>
              <td className="num" style={dashStyle}>
                —
              </td>
              <td className="num" style={dashStyle}>
                —
              </td>
              <td className="num" style={dashStyle}>
                —
              </td>
              <td className="num" style={dashStyle}>
                —
              </td>
              <td className="num" style={dashStyle}>
                —
              </td>
              <td className="num" style={dashStyle}>
                —
              </td>
              <td className="num" style={dashStyle}>
                —
              </td>
            </tr>
            <tr>
              <td style={{ background: "var(--navy)", color: "white", fontWeight: 700 }}>2025</td>
              <td className="num" style={{ background: "var(--ivory)", fontWeight: 700 }}>
                486
              </td>
              {ROW_2025.map((v, i) => (
                <td key={i} className="num">
                  {v}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ background: "var(--navy)", color: "white", fontWeight: 700 }}>2024</td>
              <td className="num" style={{ background: "var(--ivory)", fontWeight: 700 }}>
                684
              </td>
              {ROW_2024.map((v, i) => (
                <td key={i} className="num">
                  {v}
                </td>
              ))}
            </tr>
            <tr>
              <td style={{ background: "var(--navy)", color: "white", fontWeight: 700 }}>2023</td>
              <td className="num" style={{ background: "var(--ivory)", fontWeight: 700 }}>
                830
              </td>
              {ROW_2023.map((v, i) => (
                <td key={i} className="num">
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
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
          <strong style={{ color: "var(--navy)" }}>Lecture :</strong> 142 nouveaux clients depuis
          janvier 2026 (▲ +75 % vs même période 2025 = 178 attendus en 5 mois). Pic d&apos;activité
          historique en août chaque année (rentrée investissement immobilier). Cumul depuis 2023 : 2
          142 nouveaux clients.
        </div>
      </div>

      {/* Drawer drilldown · Détail nouveaux clients d'un mois */}
      <style>{`
        .activite-drawer-overlay { position: fixed; inset: 0; background: rgba(16,45,80,0.5); z-index: 999; display: none; }
        .activite-drawer-overlay.open { display: flex; justify-content: flex-end; }
        .activite-drawer { width: 920px; max-width: 92vw; height: 100%; background: var(--ivory); overflow-y: auto; box-shadow: -8px 0 24px rgba(0,0,0,0.18); animation: activiteSlideIn 0.25s ease-out; }
        @keyframes activiteSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .activite-drawer-header { background: var(--navy); color: white; padding: 22px 28px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 2; }
        .activite-drawer-close { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 14px; border-radius: 5px; cursor: pointer; font-family: inherit; font-size: 12px; }
        .activite-drawer-close:hover { background: rgba(255,255,255,0.12); }
        .activite-clic-cell { cursor: pointer; transition: background 0.15s; }
        .activite-clic-cell:hover { background: var(--gold-100) !important; }
      `}</style>

      <div
        className={`activite-drawer-overlay${open ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="activite-drawer">
          <div className="activite-drawer-header">
            <div>
              <div
                style={{
                  fontSize: "10.5px",
                  fontWeight: 700,
                  color: "var(--gold-300)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Détail · activité commerciale
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{title}</div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.65)",
                  marginTop: "4px",
                }}
              >
                22 clients entrés · cumul cabinet d&apos;origine + dates d&apos;entrée
              </div>
            </div>
            <button className="activite-drawer-close" onClick={() => setOpen(false)}>
              Fermer ✕
            </button>
          </div>

          <div style={{ padding: "24px 28px" }}>
            {/* KPIs synthèse */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <div style={kpiCard}>
                <div style={kpiCardLabel}>Total clients</div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                  }}
                >
                  22
                </div>
              </div>
              <div style={kpiCard}>
                <div style={kpiCardLabel}>Ingénieurs contributeurs</div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                  }}
                >
                  5 / 5
                </div>
              </div>
              <div style={kpiCard}>
                <div style={kpiCardLabel}>CA généré</div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--gold)",
                    marginTop: "4px",
                  }}
                >
                  386 200 €
                </div>
              </div>
              <div style={kpiCard}>
                <div style={kpiCardLabel}>Panier moyen</div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                  }}
                >
                  17 555 €
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--gold)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Détail des 22 entrées
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <table className="dt" style={{ fontSize: "12px" }}>
                <thead>
                  <tr>
                    <th>Date d&apos;entrée</th>
                    <th>Client</th>
                    <th>Ingénieur</th>
                    <th>Ingénieur</th>
                    <th>Type d&apos;accompagnement</th>
                    <th className="num">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {DRAWER_ROWS.map((r) => (
                    <tr key={r.date}>
                      <td className="nowrap">{r.date}</td>
                      <td>
                        <strong>{r.client}</strong>
                      </td>
                      <td>{r.ing1}</td>
                      <td>{r.ing2}</td>
                      <td>
                        <span className="badge" style={r.badgeStyle}>
                          {r.badge}
                        </span>
                      </td>
                      <td className="num cell-money">{r.montant}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "var(--ivory)" }}>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        fontSize: "11px",
                        color: "var(--navy-300)",
                        padding: "14px",
                      }}
                    >
                      … 10 autres entrées ·{" "}
                      <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                        Voir la totalité (22)
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                background: "var(--gold-100)",
                borderLeft: "3px solid var(--gold)",
                borderRadius: "6px",
                fontSize: "11.5px",
                color: "var(--navy)",
                lineHeight: 1.6,
              }}
            >
              <strong>Origine des 22 clients :</strong> 6 Paris Étoile · 4 Lyon Défense · 3
              Strasbourg Orangerie · 2 Paris Vendôme · 2 Bordeaux Centre · 2 PRIVEOS direct · 2
              Marseille Avenue · 1 Nantes Tour. Aucune entrée pour les autres cabinets sur janvier.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
