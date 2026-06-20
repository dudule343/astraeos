"use client";

import { useState } from "react";

// Filtre rapide Mois / Trimestre du calendrier de communication.
// Reproduit le comportement .qf de la maquette : un seul bouton actif dans le
// groupe (classe "active"). État initial : "Mois" actif (cf. wireframe).
const OPTIONS = ["Mois", "Trimestre"] as const;

export function CommsCalendarFilter() {
  const [active, setActive] = useState<(typeof OPTIONS)[number]>("Mois");

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          className={opt === active ? "qf active" : "qf"}
          onClick={() => setActive(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
