"use client";

import { useState } from "react";

// Barre d'outils du tableau des essais : filtres rapides (.qf) — un seul actif
// à la fois (logique de groupe de la maquette) — et champ de recherche.
// État initial = "Tous" actif, comme dans la maquette.

type QuickFilter = { key: string; label: string; count?: string };

const FILTERS: QuickFilter[] = [
  { key: "tous", label: "Tous", count: "4" },
  { key: "echeance", label: "Échéance < 7j", count: "3" },
  { key: "email-ouvert", label: "Email ouvert" },
  { key: "sans-offre", label: "Sans offre proposée" },
];

export function TrialToolbar() {
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
          <input className="search-input" placeholder="Rechercher..." />
        </div>
      </div>
    </div>
  );
}
