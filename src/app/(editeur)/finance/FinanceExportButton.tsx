"use client";

import type { FinanceData } from "./FinanceTabs";

const HEADERS = [
  "Source",
  "Type",
  "Souscriptions",
  "CA généré (€)",
  "CA encaissé (€)",
  "Reste à encaisser (€)",
];

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function financeToCsv(data: FinanceData): string {
  const rows = data.sourceRows.map((r) => [r.source, r.type, r.subs, r.gen, r.enc, r.rest]);
  const totalRow = [
    "Total · part éditeur",
    "",
    data.sourceRows.reduce((a, r) => a + r.subs, 0),
    data.totalGenere,
    data.totalEncaisse,
    data.resteAEncaisser,
  ];
  const lines = [HEADERS, ...rows, totalRow].map((row) => row.map(escapeCsvCell).join(";"));
  return lines.join("\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function FinanceExportButton({ data }: { data: FinanceData }) {
  const handleClick = () => {
    if (!data.hasData || data.sourceRows.length === 0) {
      alert("Aucune commission à exporter.");
      return;
    }
    const csv = financeToCsv(data);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `astraeos-finance-${date}.csv`);
  };

  const isEmpty = !data.hasData || data.sourceRows.length === 0;
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isEmpty}
      title={isEmpty ? "Aucune donnée à exporter pour l'instant — l'export s'activera dès qu'il y aura des commissions." : "Exporter le détail comptable (CSV)"}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Export comptable
    </button>
  );
}
