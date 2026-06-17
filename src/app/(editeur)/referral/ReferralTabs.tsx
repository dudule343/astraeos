"use client";

import { useState } from "react";

// Onglets réels (état client) du programme de parrainage. Le programme SaaS
// n'a pas de jeux de données distincts par onglet (tout est "à venir"), mais
// chaque onglet pointe vers la section correspondante déjà présente sur la
// page : le clic change l'onglet actif ET fait défiler jusqu'à la section.
const TABS = [
  { label: "Vue d'ensemble", target: "referral-overview" },
  { label: "Parrains", target: "referral-sponsors" },
  { label: "Filleuls", target: "referral-activity" },
  { label: "Configuration commission", target: "referral-config" },
] as const;

export function ReferralTabs() {
  const [active, setActive] = useState(0);

  function select(i: number) {
    setActive(i);
    const el = document.getElementById(TABS[i].target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mb-6 flex gap-1 border-b border-[var(--navy-100)]">
      {TABS.map((t, i) => (
        <button
          type="button"
          key={t.label}
          onClick={() => select(i)}
          className={`-mb-px border-b-2 px-4 py-2 text-[12px] font-semibold ${
            i === active
              ? "border-[var(--gold)] text-[var(--gold)]"
              : "border-transparent text-[var(--navy-300)] hover:text-[var(--navy)]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
