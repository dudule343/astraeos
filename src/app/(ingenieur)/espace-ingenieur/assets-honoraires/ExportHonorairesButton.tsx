"use client";

import { useState } from "react";

import {
  etudesMissions,
  honorairesTotal,
  type EtudeMission,
} from "../../_data/assets-honoraires";

const SEP = ";";

function escapeCell(v: string): string {
  return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Construit le CSV du détail des études patrimoniales facturées à partir de la
 * source unique (etudesMissions + honorairesTotal). Une ligne par étude, plus la
 * ligne de total du portefeuille. Aucune valeur dupliquée : tout vient de _data.
 */
function buildHonorairesCsv(rows: EtudeMission[]): string {
  const header = [
    "Client",
    "Entrée en relation",
    "Type(s) de conseil",
    "Date(s) de l'étude",
    "Honoraires facturés",
  ];

  const body = rows.map((m) => [
    m.client,
    m.entreeRelation,
    m.typesConseil.join(" / "),
    m.datesEtude.join(" / "),
    m.honoraires,
  ]);

  const total = [
    "Total portefeuille",
    honorairesTotal.resume,
    "",
    "",
    honorairesTotal.montant,
  ];

  return [header, ...body, total]
    .map((cols) => cols.map(escapeCell).join(SEP))
    .join("\r\n");
}

/**
 * Bouton « Exporter » du hero. Action réelle : génère le CSV des honoraires de
 * conseil et déclenche le téléchargement côté navigateur. Pas de bouton mort,
 * pas de backend requis (les données vivent dans _data/assets-honoraires).
 */
export function ExportHonorairesButton() {
  const [done, setDone] = useState(false);

  function exporter() {
    const csv = buildHonorairesCsv(etudesMissions);
    // BOM UTF-8 pour qu'Excel ouvre les accents correctement.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astraeos-honoraires-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setDone(true);
    setTimeout(() => setDone(false), 2_500);
  }

  return (
    <button type="button" className="btn btn-gold btn-sm" onClick={exporter}>
      {done ? "Exporté ✓" : "Exporter"}
    </button>
  );
}
