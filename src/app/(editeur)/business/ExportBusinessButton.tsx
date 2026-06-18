"use client";

import { downloadCsv, rowsToCsv } from "@/lib/csv";

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

export function ExportBusinessButton({ comptes }: { comptes: Compte[] }) {
  function onExport() {
    const csv = rowsToCsv(
      HEADERS,
      comptes.map((c) => [c.rank, c.name, c.type, c.aum, c.clients, c.status ?? ""]),
    );
    downloadCsv(csv, `pilotage-business-${new Date().toISOString().slice(0, 10)}.csv`);
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
