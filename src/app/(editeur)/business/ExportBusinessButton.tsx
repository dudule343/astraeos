"use client";

// Export CSV des comptes du parc (données réelles). Remplace le bouton stub.
type Compte = {
  rank: number;
  name: string;
  type: string;
  aum: number;
  clients: number;
  status: string | null;
};

const HEADERS = ["Rang", "Compte", "Type", "Encours sous gestion (€)", "Clients", "Statut"];

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(comptes: Compte[]): string {
  const rows = comptes.map((c) => [
    c.rank,
    c.name,
    c.type,
    c.aum,
    c.clients,
    c.status ?? "",
  ]);
  return [HEADERS, ...rows].map((r) => r.map(escapeCsvCell).join(";")).join("\r\n");
}

export function ExportBusinessButton({ comptes }: { comptes: Compte[] }) {
  function onExport() {
    const csv = "﻿" + toCsv(comptes); // BOM → accents corrects dans Excel
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pilotage-business-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={comptes.length === 0}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:opacity-40"
    >
      Export
    </button>
  );
}
