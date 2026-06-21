"use client";

import { useRouter } from "next/navigation";

/**
 * Forme d'une étude prioritaire telle qu'affichée par le tableau de bord.
 * Type local (pas d'import du module serveur mon-activite-server) : ce
 * composant est un Client Component, il ne reçoit que des données sérialisées
 * en props.
 */
export type EtudePrioritaireRow = {
  id: string;
  initials: string;
  client: string;
  ref: string;
  stageLabel: string;
  stageNum: number;
  pct: number | null;
  honoraires: string;
  dossierHref: string;
};

/** Couleur du badge d'étape, dérivée du numéro d'étape (réel). */
function stageStyle(stageNum: number): { className: string; inline: React.CSSProperties } {
  if (stageNum >= 5) {
    return { className: "badge badge-success", inline: { fontSize: "9.5px" } };
  }
  if (stageNum === 2) {
    return {
      className: "badge",
      inline: { background: "rgba(229,124,75,0.15)", color: "var(--orange-text)", fontSize: "9.5px" },
    };
  }
  return {
    className: "badge",
    inline: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "9.5px" },
  };
}

/**
 * Table « Mes études prioritaires » du tableau de bord.
 *
 * Portage fidèle de la maquette : la LIGNE entière navigue vers la fiche
 * dossier (réelle). Le bouton d'action hérite du clic de la ligne.
 */
export function EtudesPrioritairesTable({ etudes }: { etudes: EtudePrioritaireRow[] }) {
  const router = useRouter();

  return (
    <table className="dt" style={{ fontSize: "12.5px" }}>
      <thead>
        <tr>
          <th>Client</th>
          <th>Étape</th>
          <th>Avancement</th>
          <th className="num">Honoraires</th>
          <th className="center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {etudes.map((etu) => {
          const badge = stageStyle(etu.stageNum);
          return (
            <tr
              key={etu.id}
              className="dt-clickable"
              role="link"
              tabIndex={0}
              onClick={() => router.push(etu.dossierHref)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(etu.dossierHref);
                }
              }}
            >
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="ingenieur-avatar">{etu.initials}</div>
                  <div>
                    <div className="cell-primary">{etu.client}</div>
                    <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>{etu.ref}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={badge.className} style={badge.inline}>
                  {etu.stageLabel}
                </span>
              </td>
              <td className="nowrap">
                {etu.pct != null ? `${Math.round(etu.pct)} %` : "—"}
              </td>
              <td className="num cell-money">{etu.honoraires}</td>
              <td className="center">
                <button type="button" className="btn btn-ghost btn-sm">
                  Ouvrir
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
