"use client";

import type { DbClient } from "./DbClientsTable";

const HEADERS = [
  "Raison sociale",
  "Représentant légal",
  "Email",
  "Catégorie",
  "Pack",
  "Ingénieurs",
  "Clients finaux",
  "Revenu /mois (€)",
  "Statut",
  "Score santé",
  "Cabinet",
  "Adresse",
  "Créé le",
];

function escapeCsvCell(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // RFC 4180 : quote si la cellule contient virgule, guillemet, ou retour ligne
  if (/[",\n\r;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function clientsToCsv(clients: DbClient[]): string {
  const rows = clients.map((c) => [
    c.raison_sociale,
    c.representant,
    c.representant_email,
    c.sub_category,
    c.pack,
    c.engineers,
    c.end_clients,
    c.revenue,
    c.status === "a_risque" ? "À risque" : c.status === "actif" ? "Actif" : c.status,
    c.health,
    c.cabinet_name,
    c.household_address,
    new Date(c.created_at).toLocaleDateString("fr-FR"),
  ]);

  const lines = [HEADERS, ...rows].map((row) => row.map(escapeCsvCell).join(";"));
  return lines.join("\n");
}

function downloadCsv(content: string, filename: string) {
  // BOM UTF-8 pour qu'Excel ouvre les accents correctement
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

export function ExportCsvButton({ clients }: { clients: DbClient[] }) {
  const handleClick = () => {
    if (clients.length === 0) {
      alert("Aucun client à exporter");
      return;
    }
    const csv = clientsToCsv(clients);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `astraeos-clients-${date}.csv`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={clients.length === 0}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Export CSV
    </button>
  );
}
