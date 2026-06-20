"use client";

import type { CollecteRow } from "../../_data/collectes";

/**
 * Cellule « Complétion » de l'écran collecte. Porte EXACTEMENT le comportement
 * de la maquette (page-ing-pipe-03) :
 *   - les lignes qui ont un `detail` ouvrent un alert() avec le détail
 *     document-par-document au clic ;
 *   - les lignes sans `detail` ont seulement cursor:pointer (aucune action),
 *     comme dans la maquette où ces cellules n'ont pas d'onclick.
 */
export default function ProgressCell({ row }: { row: CollecteRow }) {
  const handleClick = row.detail ? () => window.alert(row.detail) : undefined;

  return (
    <td
      style={{ cursor: "pointer" }}
      onClick={handleClick}
      role={row.detail ? "button" : undefined}
      tabIndex={row.detail ? 0 : undefined}
      onKeyDown={
        row.detail
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                window.alert(row.detail);
              }
            }
          : undefined
      }
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
