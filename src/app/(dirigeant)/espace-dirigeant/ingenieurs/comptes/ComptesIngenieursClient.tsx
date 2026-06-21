"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useMemo, useState } from "react";

type Connexion = {
  date: string;
  duree: string;
};

type Ingenieur = {
  id: string;
  initiales: string;
  nom: string;
  vous?: boolean;
  role: string;
  stockage: string;
  derniereConnexion: string;
  connexions30j: number;
  tempsMoyen: string;
  connexionsRecentes: Connexion[];
};

const INGENIEURS: Ingenieur[] = [
  {
    id: "lt",
    initiales: "LT",
    nom: "Luc THILLIEZ",
    vous: true,
    role: "Dirigeant-praticien",
    stockage: "1,2 GB",
    derniereConnexion: "12/05/2026 · 09h12",
    connexions30j: 38,
    tempsMoyen: "3h22",
    connexionsRecentes: [
      { date: "12/05/2026 · 09h12", duree: "3h41" },
      { date: "11/05/2026 · 08h54", duree: "3h12" },
      { date: "10/05/2026 · 09h20", duree: "2h58" },
      { date: "09/05/2026 · 08h47", duree: "3h33" },
      { date: "08/05/2026 · 09h05", duree: "3h18" },
      { date: "07/05/2026 · 08h38", duree: "3h47" },
      { date: "06/05/2026 · 09h28", duree: "3h02" },
      { date: "05/05/2026 · 08h51", duree: "3h26" },
      { date: "02/05/2026 · 09h14", duree: "3h09" },
      { date: "30/04/2026 · 08h42", duree: "3h35" },
    ],
  },
  {
    id: "jv",
    initiales: "JV",
    nom: "Julien VASSEUR",
    role: "Senior · 8 ans",
    stockage: "1,1 GB",
    derniereConnexion: "12/05/2026 · 08h32",
    connexions30j: 42,
    tempsMoyen: "3h08",
    connexionsRecentes: [
      { date: "12/05/2026 · 08h32", duree: "3h22" },
      { date: "11/05/2026 · 08h28", duree: "2h54" },
      { date: "10/05/2026 · 08h41", duree: "3h11" },
      { date: "09/05/2026 · 08h35", duree: "3h05" },
      { date: "08/05/2026 · 08h19", duree: "3h18" },
      { date: "07/05/2026 · 08h44", duree: "2h48" },
      { date: "06/05/2026 · 08h30", duree: "3h27" },
      { date: "05/05/2026 · 08h26", duree: "3h02" },
      { date: "02/05/2026 · 08h38", duree: "2h59" },
      { date: "30/04/2026 · 08h21", duree: "3h14" },
    ],
  },
  {
    id: "sm",
    initiales: "SM",
    nom: "Sophie MERCIER",
    role: "5 ans",
    stockage: "0,9 GB",
    derniereConnexion: "12/05/2026 · 09h05",
    connexions30j: 36,
    tempsMoyen: "2h45",
    connexionsRecentes: [
      { date: "12/05/2026 · 09h05", duree: "2h52" },
      { date: "11/05/2026 · 09h12", duree: "2h38" },
      { date: "10/05/2026 · 08h58", duree: "2h47" },
      { date: "09/05/2026 · 09h21", duree: "2h41" },
      { date: "08/05/2026 · 09h03", duree: "2h55" },
      { date: "07/05/2026 · 08h49", duree: "2h33" },
      { date: "06/05/2026 · 09h17", duree: "2h49" },
      { date: "05/05/2026 · 09h08", duree: "2h44" },
      { date: "02/05/2026 · 09h25", duree: "2h36" },
      { date: "30/04/2026 · 08h55", duree: "2h51" },
    ],
  },
  {
    id: "tl",
    initiales: "TL",
    nom: "Thomas LEROY",
    role: "3 ans",
    stockage: "0,6 GB",
    derniereConnexion: "11/05/2026 · 18h22",
    connexions30j: 28,
    tempsMoyen: "2h12",
    connexionsRecentes: [
      { date: "11/05/2026 · 18h22", duree: "2h18" },
      { date: "09/05/2026 · 14h47", duree: "2h05" },
      { date: "08/05/2026 · 09h33", duree: "2h21" },
      { date: "07/05/2026 · 16h12", duree: "1h58" },
      { date: "06/05/2026 · 10h08", duree: "2h14" },
      { date: "05/05/2026 · 15h41", duree: "2h09" },
      { date: "02/05/2026 · 11h25", duree: "2h26" },
      { date: "30/04/2026 · 14h18", duree: "2h02" },
      { date: "29/04/2026 · 09h47", duree: "2h17" },
      { date: "28/04/2026 · 16h33", duree: "1h54" },
    ],
  },
  {
    id: "cb",
    initiales: "CB",
    nom: "Camille BERTRAND",
    role: "Junior · 2 ans",
    stockage: "0,4 GB",
    derniereConnexion: "12/05/2026 · 09h45",
    connexions30j: 24,
    tempsMoyen: "1h58",
    connexionsRecentes: [
      { date: "12/05/2026 · 09h45", duree: "2h03" },
      { date: "11/05/2026 · 09h52", duree: "1h47" },
      { date: "10/05/2026 · 10h08", duree: "1h58" },
      { date: "08/05/2026 · 09h41", duree: "2h11" },
      { date: "07/05/2026 · 09h38", duree: "1h52" },
      { date: "06/05/2026 · 10h15", duree: "2h05" },
      { date: "05/05/2026 · 09h47", duree: "1h44" },
      { date: "02/05/2026 · 09h59", duree: "2h08" },
      { date: "30/04/2026 · 09h33", duree: "1h56" },
      { date: "28/04/2026 · 10h22", duree: "1h49" },
    ],
  },
];

export function ComptesIngenieursClient() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Ingenieur | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INGENIEURS;
    return INGENIEURS.filter(
      (i) => i.nom.toLowerCase().includes(q) || i.role.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <>
      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
              Comptes des 5 ingénieurs · cliquez pour le détail 10 dernières connexions
            </span>
          </div>
          <div className="table-toolbar-right">
            <div className="search-wrap">
              <svg>
                <use href="#i-search" />
              </svg>
              <input
                className="search-input"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Ingénieur</th>
              <th>Rôle</th>
              <th>Statut compte</th>
              <th className="num">Stockage</th>
              <th>Dernière connexion</th>
              <th className="num">Connexions / 30 j</th>
              <th className="num">Temps moyen / session</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((ing) => (
              <tr
                key={ing.id}
                className="dt-clickable"
                onClick={() => setSelected(ing)}
                style={
                  ing.vous
                    ? {
                        background: "linear-gradient(90deg, var(--gold-100) 0%, transparent 50%)",
                      }
                    : undefined
                }
              >
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <div
                      className="ingenieur-avatar"
                      style={
                        ing.vous
                          ? {
                              width: "30px",
                              height: "30px",
                              fontSize: "10px",
                              background: "var(--gold)",
                              color: "white",
                            }
                          : { width: "30px", height: "30px", fontSize: "10px" }
                      }
                    >
                      {ing.initiales}
                    </div>
                    <div className="cell-primary">
                      {ing.nom}
                      {ing.vous && (
                        <span
                          style={{
                            fontSize: "9.5px",
                            color: "var(--gold-deep)",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {" "}
                          ·VOUS
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>{ing.role}</td>
                <td>
                  <span className="badge badge-success">Actif</span>
                </td>
                <td className="num">{ing.stockage}</td>
                <td className="nowrap">{ing.derniereConnexion}</td>
                <td className="num">{ing.connexions30j}</td>
                <td className="num cell-money">{ing.tempsMoyen}</td>
                <td className="center">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(ing);
                    }}
                  >
                    Gérer
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="center"
                  style={{ padding: "24px 16px", color: "var(--navy-300)" }}
                >
                  Aucun ingénieur ne correspond à votre recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16,45,80,0.45)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "440px",
              maxWidth: "92vw",
              height: "100%",
              background: "white",
              boxShadow: "-8px 0 28px rgba(16,45,80,0.18)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--navy-100)",
                background: "var(--ivory)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                className="ingenieur-avatar"
                style={
                  selected.vous
                    ? {
                        width: "40px",
                        height: "40px",
                        fontSize: "13px",
                        background: "var(--gold)",
                        color: "white",
                      }
                    : { width: "40px", height: "40px", fontSize: "13px" }
                }
              >
                {selected.initiales}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--navy)" }}>
                  {selected.nom}
                  {selected.vous && (
                    <span
                      style={{
                        fontSize: "9.5px",
                        color: "var(--gold-deep)",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {" "}
                      ·VOUS
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "var(--navy-300)" }}>{selected.role}</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelected(null)}
                aria-label="Fermer"
              >
                Fermer
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div
                className="kpis"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "14px",
                  marginBottom: "18px",
                }}
              >
                <div className="kpi">
                  <div className="kpi-label">Connexions / 30 j</div>
                  <div className="kpi-value">{selected.connexions30j}</div>
                  <div className="kpi-meta">activité plateforme ASTRAEOS</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Temps moyen / session</div>
                  <div className="kpi-value">{selected.tempsMoyen}</div>
                  <div className="kpi-meta">stockage {selected.stockage}</div>
                </div>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--navy)",
                  marginBottom: "10px",
                }}
              >
                10 dernières connexions
              </div>
              <table className="dt" style={{ fontSize: "12px" }}>
                <thead>
                  <tr>
                    <th>Date &amp; heure</th>
                    <th className="num">Durée session</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.connexionsRecentes.map((c, idx) => (
                    <tr key={idx}>
                      <td className="nowrap">{c.date}</td>
                      <td className="num cell-money">{c.duree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <button className="btn btn-ghost btn-sm">
                  <svg>
                    <use href="#i-alert" />
                  </svg>
                  Suspendre le compte
                </button>
                <button className="btn btn-gold btn-sm">
                  <svg>
                    <use href="#i-success" />
                  </svg>
                  Réactiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
