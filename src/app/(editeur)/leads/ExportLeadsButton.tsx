"use client";

import type { LeadRow } from "./data";

// Export CSV des leads déjà chargés (aucune donnée inventée, aucun appel
// réseau). Génère le fichier côté client à partir du portefeuille affiché.
function toCsv(leads: LeadRow[]): string {
  const headers = [
    "Contact",
    "Email",
    "Téléphone",
    "Source",
    "Étape",
    "Dernier contact",
    "Affecté à",
  ];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = leads.map((l) =>
    [
      l.name ?? "",
      l.email ?? "",
      l.phone ?? "",
      l.source?.value ?? "",
      l.stageLabel,
      l.lastContact,
      l.assignee ?? "",
    ]
      .map((v) => escape(String(v)))
      .join(","),
  );
  return [headers.map(escape).join(","), ...lines].join("\r\n");
}

export function ExportLeadsButton({ leads }: { leads: LeadRow[] }) {
  function handleExport() {
    const csv = "﻿" + toCsv(leads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={leads.length === 0}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Export
    </button>
  );
}
