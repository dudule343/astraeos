"use client";

import { useState } from "react";

// Onglets de catégories de packs (.tabs/.tab) : pur toggle visuel, l'actif reçoit
// la classe "active" (cf. script maquette « ONGLETS GÉNÉRIQUES » ~l.4648). Aucun
// tab-panel associé dans la maquette : le clic ne fait que déplacer l'état actif.
const TABS = [
  "Tous les packs (8)",
  "Récurrents (1)",
  "Mise en relation (2)",
  "Paiements uniques (3)",
  "À l'unité (2)",
];

export function PackTabs() {
  const [active, setActive] = useState(TABS[0]);

  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab}
          className={`tab${active === tab ? " active" : ""}`}
          onClick={() => setActive(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
