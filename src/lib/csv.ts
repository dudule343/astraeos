// Helpers CSV partagés (export). Centralise l'échappement RFC 4180, la
// sérialisation et le téléchargement — jusqu'ici recopiés dans chaque bouton
// d'export.

/** Échappe une cellule CSV (quote si elle contient `,` `;` `"` ou saut de ligne). */
export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Construit le CSV (BOM en tête → accents corrects dans Excel). */
export function rowsToCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
  sep = ";",
): string {
  return "﻿" + [headers, ...rows].map((r) => r.map(escapeCsvCell).join(sep)).join("\r\n");
}

/** Déclenche le téléchargement d'un CSV (client uniquement). */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
