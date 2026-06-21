"use client";

import { useRouter } from "next/navigation";

import type { CollecteRow } from "../../_data/collectes";

/**
 * Cellule « Complétion » de l'écran collecte. Cliquer ouvre la fiche client
 * (où vivent les documents collectés), comme le pictogramme « œil » de la ligne
 * et comme le pattern des autres écrans pipe (cf. conformité : row.onClick ->
 * router.push de la fiche). Le détail document-par-document de la maquette est
 * conservé en infobulle (title) au survol.
 */
const BASE = "/espace-ingenieur";

export default function ProgressCell({ row }: { row: CollecteRow }) {
  const router = useRouter();
  const ficheHref = `${BASE}/clients/${row.id}`;
  const open = () => router.push(ficheHref);

  return (
    <td
      style={{ cursor: "pointer" }}
      onClick={open}
      role="button"
      tabIndex={0}
      title={row.detail ?? "Ouvrir la fiche client pour voir les documents"}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
    >
      <div className="progress-cell">
        <div className="progress-bar">
          <div
            className={`progress-bar-fill${row.progressVariant ? ` ${row.progressVariant}` : ""}`}
            style={{ width: `${row.pct}%` }}
          />
        </div>
        <div className="progress-text">
          <span>
            {row.docsCollected}/{row.docsExpected} docs
          </span>
          <span className="pct">{row.pct} %</span>
        </div>
      </div>
    </td>
  );
}
