"use client";

import type { TeamCategory } from "./data";

const HEADERS = [
  "Prénom Nom",
  "Rôle",
  "Email interne",
  "Téléphone",
  "Spécialités",
  "Clients affectés",
  "RDV semaine",
  "Études livrées",
  "CA généré (€)",
];

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function teamToCsv(categories: TeamCategory[]): string {
  const rows = categories.flatMap((cat) =>
    cat.members.map((m) => [
      m.name,
      m.roleLabel,
      m.email,
      m.phone,
      m.specialties.join(", "),
      m.activity.clientsAffectes,
      m.activity.rdvSemaine,
      m.activity.etudesLivrees,
      m.activity.caGenere,
    ]),
  );
  const lines = [HEADERS, ...rows].map((row) => row.map(escapeCsvCell).join(";"));
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

export function TeamExportButton({ categories }: { categories: TeamCategory[] }) {
  const count = categories.reduce((a, c) => a + c.members.length, 0);
  const handleClick = () => {
    if (count === 0) {
      alert("Aucun collaborateur à exporter.");
      return;
    }
    const csv = teamToCsv(categories);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `astraeos-equipe-${date}.csv`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={count === 0}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Export RH
    </button>
  );
}
