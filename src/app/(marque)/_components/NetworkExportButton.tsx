"use client";

/**
 * Bouton d'export CSV réel pour l'espace marque (tête de réseau).
 * Même rendu visuel que le GhostButton du chrome (PageHeader.tsx) mais câblé :
 * génère un CSV (séparateur « ; », BOM UTF-8 pour Excel) à partir des données
 * déjà chargées côté serveur et déclenche le téléchargement.
 */

type Cell = string | number | null | undefined;

function escapeCsvCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // RFC 4180 : quote si la cellule contient virgule, guillemet, retour ligne ou ;
  if (/[",\n\r;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(headers: string[], rows: Cell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(";"));
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

export function NetworkExportButton({
  label,
  filename,
  headers,
  rows,
}: {
  /** Libellé du bouton (ex. « Export », « Export comptable »). */
  label: string;
  /** Préfixe du fichier généré, sans date ni extension. */
  filename: string;
  headers: string[];
  rows: Cell[][];
}) {
  const empty = rows.length === 0;

  const handleClick = () => {
    if (empty) return;
    const csv = rowsToCsv(headers, rows);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `${filename}-${date}.csv`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={empty}
      title={empty ? "Aucune donnée à exporter pour le moment" : undefined}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
