"use client";

import { useState } from "react";

// Barre d'outils de la liste de leads : filtres rapides (.qf) — un seul actif
// à la fois (logique de groupe de la maquette) — et champ de recherche.
// État initial = "Tous (312)" actif.

type QuickFilter = { key: string; label: string; count?: string };

const FILTERS: QuickFilter[] = [
  { key: "tous", label: "Tous (312)" },
  { key: "hot", label: "Hot leads", count: "28" },
  { key: "relancer", label: "À relancer", count: "42" },
  { key: "sans-suite", label: "Sans suite", count: "14" },
];

export function LeadsToolbar() {
  const [active, setActive] = useState("tous");

  return (
    <div className="table-toolbar">
      <div className="table-toolbar-left">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`qf${f.key === active ? " active" : ""}`}
            onClick={() => setActive(f.key)}
          >
            {f.label}
            {f.count ? <span className="qf-count">{f.count}</span> : null}
          </button>
        ))}
      </div>
      <div className="table-toolbar-right">
        <div className="search-wrap">
          <svg>
            <use href="#i-search" />
          </svg>
          <input className="search-input" placeholder="Rechercher un lead..." />
        </div>
      </div>
    </div>
  );
}
