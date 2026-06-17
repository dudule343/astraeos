"use client";

import type { RankingRow } from "./data";

// Export CSV du classement des packs déjà chargé (données de ventes réelles,
// aucune invention, aucun appel réseau). Génère le fichier côté client.
function toCsv(ranking: RankingRow[]): string {
  const headers = [
    "Rang",
    "Pack",
    "Catégorie",
    "Souscriptions",
    "Récurrent mensuel (€)",
    "CA cumulé (€)",
    "Part (%)",
  ];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = ranking.map((r) =>
    [
      String(r.num),
      r.name,
      r.categoryLabel,
      String(r.subs),
      String(Math.round(r.recurringMonthly)),
      String(Math.round(r.ca)),
      String(r.pct),
    ]
      .map((v) => escape(v))
      .join(","),
  );
  return [headers.map(escape).join(","), ...lines].join("\r\n");
}

export function ExportTarifsButton({ ranking }: { ranking: RankingRow[] }) {
  function handleExport() {
    const csv = "﻿" + toCsv(ranking);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalogue-packs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={ranking.length === 0}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Export tarifs
    </button>
  );
}
