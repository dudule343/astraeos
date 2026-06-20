"use client";

import { useState } from "react";

// Filtres rapides du classement des packs (.qf) : pur toggle visuel, l'actif
// reçoit la classe "active" dans son conteneur (cf. script maquette ~l.4660).
const OPTIONS = ["Mois", "Trimestre", "Cumul depuis janv.", "12 derniers mois"];

export function RankingPeriodFilter() {
  const [active, setActive] = useState("Cumul depuis janv.");

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          className={`qf${active === opt ? " active" : ""}`}
          onClick={() => setActive(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
