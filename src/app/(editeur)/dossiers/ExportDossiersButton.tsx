"use client";

import type { Dossier } from "@/lib/pipeline";

const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospects",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituées",
  "06_suivi": "Suivi",
};

const HEADERS = [
  "Dossier",
  "Étape",
  "Priorité",
  "DCI (%)",
  "Entrée pipeline",
  "Entrée étape",
  "Livré le",
  "Restitution",
  "Jours dans l'étape",
];

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function dossiersToCsv(dossiers: Dossier[]): string {
  const rows = dossiers.map((d) => [
    d.name,
    STAGE_LABELS[d.stage] ?? d.stage,
    d.priority ?? "",
    d.dciPct ?? "",
    d.entryDate ?? "",
    d.stageEnteredAt ?? "",
    d.deliveredAt ?? "",
    d.restitDate ?? "",
    d.daysInStage ?? "",
  ]);
  return [HEADERS, ...rows].map((row) => row.map(escapeCsvCell).join(";")).join("\n");
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

export function ExportDossiersButton({ dossiers }: { dossiers: Dossier[] }) {
  const handleClick = () => {
    if (dossiers.length === 0) {
      alert("Aucun dossier à exporter");
      return;
    }
    const csv = dossiersToCsv(dossiers);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `astraeos-dossiers-${date}.csv`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={dossiers.length === 0}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      Exporter
    </button>
  );
}
