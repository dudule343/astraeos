"use client";

import { useState } from "react";

import { buildPipelineCsv, type PipelineScreen } from "../../_data/pipeline";

/**
 * Bouton « Exporter » du hero pipeline. Action réelle : génère le CSV du
 * Kanban (source unique = screen) et déclenche le téléchargement côté
 * navigateur. Pas de bouton mort, pas de backend requis.
 */
export function ExportPipelineButton({ screen }: { screen: PipelineScreen }) {
  const [done, setDone] = useState(false);

  function exporter() {
    const csv = buildPipelineCsv(screen);
    // BOM UTF-8 pour qu'Excel ouvre les accents correctement.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `astraeos-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setDone(true);
    setTimeout(() => setDone(false), 2_500);
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={exporter}>
      {done ? "Exporté ✓" : "Exporter"}
    </button>
  );
}
