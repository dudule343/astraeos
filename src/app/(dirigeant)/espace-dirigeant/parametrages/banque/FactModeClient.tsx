"use client";

import { useState } from "react";

// Mode de facturation : deux options radio (Automatique / Manuelle).
// Le clic change la sélection visuelle (bordure + fond dorés) comme dans la maquette.
export function FactModeClient() {
  const [mode, setMode] = useState<"auto" | "manuelle">("auto");

  const autoSelected = mode === "auto";

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <label
        onClick={() => setMode("auto")}
        style={{
          flex: 1,
          padding: "10px 14px",
          border: autoSelected
            ? "1.5px solid var(--gold)"
            : "1px solid var(--navy-100)",
          background: autoSelected ? "var(--gold-100)" : "white",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <input
          type="radio"
          name="fact-mode"
          checked={autoSelected}
          onChange={() => setMode("auto")}
          style={{ accentColor: "var(--gold)" }}
        />
        <span
          style={{
            fontSize: "12px",
            fontWeight: autoSelected ? 700 : 400,
            color: "var(--navy)",
          }}
        >
          Automatique
        </span>
      </label>
      <label
        onClick={() => setMode("manuelle")}
        style={{
          flex: 1,
          padding: "10px 14px",
          border: !autoSelected
            ? "1.5px solid var(--gold)"
            : "1px solid var(--navy-100)",
          background: !autoSelected ? "var(--gold-100)" : "white",
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <input
          type="radio"
          name="fact-mode"
          checked={!autoSelected}
          onChange={() => setMode("manuelle")}
          style={{ accentColor: "var(--gold)" }}
        />
        <span
          style={{
            fontSize: "12px",
            fontWeight: !autoSelected ? 700 : 400,
            color: "var(--navy)",
          }}
        >
          Manuelle
        </span>
      </label>
    </div>
  );
}
