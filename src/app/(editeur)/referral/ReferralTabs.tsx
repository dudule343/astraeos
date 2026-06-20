"use client";

import { useState } from "react";

// Onglets de la page parrainage, portés à l'identique de la maquette
// (lignes 2229-2234). Le script générique de la maquette bascule simplement
// la classe .active au sein du conteneur .tabs au clic — pas de panneau lié.
// On reproduit ce comportement visuel avec un état client.
const TABS = ["Vue d'ensemble", "Parrains (14)", "Filleuls (42)", "Configuration commission"];

export function ReferralTabs() {
  const [active, setActive] = useState(0);

  return (
    <div className="tabs">
      {TABS.map((label, i) => (
        <button
          key={label}
          className={`tab${i === active ? " active" : ""}`}
          onClick={() => setActive(i)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
