"use client";

import { useState } from "react";

// Préférences de notification de l'écran "Profil & agréments" (reference/wireframes-dirigeant.html
// lignes 9807-9822). Les cases de la maquette sont rendues interactives via un état client
// pour rester cochables/décochables sans warning React (checked sans onChange).

const NOTIFICATION_PREFS = [
  { label: "Alertes conformité (KYC en retard, LCB-FT)", checked: true },
  { label: "Études en retard de production", checked: true },
  { label: "Trésorerie sous seuil critique", checked: true },
  { label: "Nouveau prospect / candidature ingénieur", checked: true },
  { label: "Newsletter ASTRAEOS hebdomadaire", checked: false },
  { label: "Mises à jour du catalogue produits", checked: true },
];

export function ProfilNotificationPrefs() {
  const [prefs, setPrefs] = useState(NOTIFICATION_PREFS.map((p) => p.checked));

  function toggle(index: number) {
    setPrefs((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  return (
    <div className="card-body" style={{ padding: "22px", fontSize: "12.5px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
        {NOTIFICATION_PREFS.map((pref, index) => (
          <div key={pref.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={prefs[index]}
              onChange={() => toggle(index)}
            />{" "}
            <span>{pref.label}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "18px",
          padding: "14px",
          background: "var(--ivory)",
          borderRadius: "6px",
          fontSize: "11px",
          color: "var(--navy-300)",
          lineHeight: 1.6,
        }}
      >
        &#8505; Les modifications de votre identité, vos agréments et vos coordonnées
        professionnelles doivent être effectuées auprès de votre référent ASTRAEOS pour mise à jour
        réglementaire.
      </div>
    </div>
  );
}
