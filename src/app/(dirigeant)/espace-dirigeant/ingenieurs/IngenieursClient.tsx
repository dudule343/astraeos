"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useMemo, useState } from "react";

type SortKey = "ca" | "etudes" | "nouveaux";

type Ingenieur = {
  initials: string;
  name: string;
  manager: string;
  clients: number;
  caLabel: string;
  ca: number;
  etudes: number;
  nouveaux: number;
  anciennete: string;
  badge?: string;
};

const INGENIEURS: Ingenieur[] = [
  {
    initials: "JV",
    name: "Julien VASSEUR",
    manager: "Luc THILLIEZ",
    clients: 38,
    caLabel: "68 200 €",
    ca: 68200,
    etudes: 3,
    nouveaux: 8,
    anciennete: "4 ans",
    badge: "Ambassadeur",
  },
  {
    initials: "EL",
    name: "Émilie LAMBERT",
    manager: "Luc THILLIEZ",
    clients: 32,
    caLabel: "58 400 €",
    ca: 58400,
    etudes: 2,
    nouveaux: 6,
    anciennete: "3 ans",
  },
  {
    initials: "RB",
    name: "Romain BERTHIER",
    manager: "Julien VASSEUR",
    clients: 30,
    caLabel: "52 800 €",
    ca: 52800,
    etudes: 2,
    nouveaux: 5,
    anciennete: "3 ans",
  },
  {
    initials: "AR",
    name: "Antoine ROSSI",
    manager: "Thomas LEROY",
    clients: 28,
    caLabel: "48 200 €",
    ca: 48200,
    etudes: 2,
    nouveaux: 5,
    anciennete: "2 ans",
  },
  {
    initials: "CF",
    name: "Caroline FAURE",
    manager: "Sophie MERCIER",
    clients: 26,
    caLabel: "44 600 €",
    ca: 44600,
    etudes: 2,
    nouveaux: 4,
    anciennete: "2 ans",
  },
  {
    initials: "MK",
    name: "Mathieu KELLER",
    manager: "Julien VASSEUR",
    clients: 24,
    caLabel: "42 100 €",
    ca: 42100,
    etudes: 1,
    nouveaux: 4,
    anciennete: "2 ans",
  },
  {
    initials: "LR",
    name: "Léa RICCI",
    manager: "Camille BERTRAND",
    clients: 23,
    caLabel: "38 800 €",
    ca: 38800,
    etudes: 1,
    nouveaux: 3,
    anciennete: "1,5 an",
  },
  {
    initials: "TR",
    name: "Thomas RENARD",
    manager: "Thomas LEROY",
    clients: 22,
    caLabel: "36 400 €",
    ca: 36400,
    etudes: 1,
    nouveaux: 3,
    anciennete: "1,5 an",
  },
  {
    initials: "SD",
    name: "Sophie DELATTRE",
    manager: "Thomas LEROY Préfecture",
    clients: 20,
    caLabel: "34 200 €",
    ca: 34200,
    etudes: 1,
    nouveaux: 2,
    anciennete: "1 an",
  },
  {
    initials: "FM",
    name: "Florence MERCIER",
    manager: "Camille BERTRAND Patrimoine",
    clients: 18,
    caLabel: "31 400 €",
    ca: 31400,
    etudes: 1,
    nouveaux: 2,
    anciennete: "1 an",
  },
];

const SORT_PILLS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "ca",
    label: "CA généré",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M6 12h12M9 18h6" />
      </svg>
    ),
  },
  {
    key: "etudes",
    label: "Études générées",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    key: "nouveaux",
    label: "Nouveaux clients",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
];

export function IngenieursClient() {
  const [sort, setSort] = useState<SortKey>("ca");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? INGENIEURS.filter(
          (ing) =>
            ing.name.toLowerCase().includes(q) || ing.manager.toLowerCase().includes(q),
        )
      : INGENIEURS;
    return [...filtered].sort((a, b) => b[sort] - a[sort]);
  }, [sort, query]);

  return (
    <div className="table-wrap">
      <div className="table-toolbar" style={{ flexWrap: "wrap", gap: "14px" }}>
        <div
          className="table-toolbar-left"
          style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}
        >
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
            Classement · 5 ingénieurs · mois en cours
          </span>
          <div className="sort-pill-group">
            <span className="sort-label">Trier par</span>
            {SORT_PILLS.map((pill) => (
              <button
                key={pill.key}
                className={`sort-pill${sort === pill.key ? " active" : ""}`}
                data-sort={pill.key}
                onClick={() => setSort(pill.key)}
              >
                {pill.icon}
                {pill.label}
              </button>
            ))}
          </div>
        </div>
        <div className="table-toolbar-right">
          <div className="search-wrap">
            <svg>
              <use href="#i-search" />
            </svg>
            <input
              className="search-input"
              placeholder="Rechercher un ingénieur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <table className="dt">
        <thead>
          <tr>
            <th className="num">Rang</th>
            <th>Ingénieur</th>
            <th>Ingénieur</th>
            <th className="num">Clients servis</th>
            <th className="num">CA généré · cumul depuis janv.</th>
            <th className="num">Études générées</th>
            <th className="num">Nouveaux clients générés</th>
            <th>Ancienneté</th>
            <th className="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((ing, i) => {
            const rang = i + 1;
            const podium = rang <= 3;
            return (
              <tr
                key={ing.initials + ing.name}
                style={selected === ing.name ? { background: "var(--ivory)" } : undefined}
              >
                <td className="num">
                  {podium ? (
                    <strong style={{ color: "var(--gold)" }}>{rang}</strong>
                  ) : (
                    rang
                  )}
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <div className="ingenieur-avatar">{ing.initials}</div>
                    <div className="cell-primary">{ing.name}</div>
                  </div>
                </td>
                <td>{ing.manager}</td>
                <td className="num">{ing.clients}</td>
                <td className={`num cell-money${podium ? " gold" : ""}`}>{ing.caLabel}</td>
                <td className="num">{ing.etudes}</td>
                <td className="num">
                  <strong>{ing.nouveaux}</strong>
                </td>
                <td>
                  {ing.anciennete}
                  {ing.badge ? (
                    <span className="badge badge-gold" style={{ marginLeft: "6px" }}>
                      {ing.badge}
                    </span>
                  ) : null}
                </td>
                <td className="center">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelected((cur) => (cur === ing.name ? null : ing.name))}
                  >
                    <svg>
                      <use href="#i-eye" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
          {query.trim() === "" ? (
            <tr style={{ background: "var(--ivory)" }}>
              <td
                colSpan={9}
                style={{
                  textAlign: "center",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  padding: "14px",
                }}
              >
                {showAll
                  ? "Liste complète des 80 ingénieurs · 70 ingénieurs supplémentaires (données non chargées dans cette démonstration)"
                  : "… 70 autres ingénieurs · "}
                {showAll ? null : (
                  <a
                    style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}
                    onClick={() => setShowAll(true)}
                  >
                    Voir l&apos;intégralité (80)
                  </a>
                )}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
