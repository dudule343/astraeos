"use client";

import { useRouter } from "next/navigation";

import type { EtudePrioritaire, StageBadge } from "../_data/tableau-de-bord";

const STAGE_STYLE: Record<StageBadge["variant"], React.CSSProperties> = {
  success: {},
  orange: { background: "rgba(229,124,75,0.15)", color: "var(--orange-text)" },
  "gold-100": { background: "var(--gold-100)", color: "var(--gold-deep)" },
  "gold-soft": { background: "rgba(198,142,14,0.15)", color: "var(--gold-deep)" },
};

function StageBadgeEl({ stage }: { stage: StageBadge }) {
  if (stage.variant === "success") {
    return (
      <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
        {stage.label}
      </span>
    );
  }
  return (
    <span className="badge" style={{ ...STAGE_STYLE[stage.variant], fontSize: "9.5px" }}>
      {stage.label}
    </span>
  );
}

/**
 * Table « Mes études prioritaires » du tableau de bord.
 *
 * Portage fidèle de la maquette : dans le wireframe chaque ligne porte
 * `<tr onclick="goToPage('ing-fiche-dossier')">`, c'est la LIGNE entière qui
 * navigue vers la fiche dossier. Les boutons d'action (Préparer / Reprendre /
 * Continuer / Relancer) ne sont PAS des liens : ils héritent du clic de la
 * ligne. On reproduit exactement ça avec un vrai handler client.
 */
export function EtudesPrioritairesTable({ etudes }: { etudes: EtudePrioritaire[] }) {
  const router = useRouter();

  return (
    <table className="dt" style={{ fontSize: "12.5px" }}>
      <thead>
        <tr>
          <th>Client</th>
          <th>Étape</th>
          <th>Échéance</th>
          <th className="num">Honoraires</th>
          <th className="center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {etudes.map((etu) => (
          <tr
            key={etu.id}
            className="dt-clickable"
            style={etu.highlight ? { background: "var(--gold-100)" } : undefined}
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
              <StageBadgeEl stage={etu.stage} />
            </td>
            <td
              className="nowrap"
              style={etu.echeanceLate ? { color: "var(--orange-text)" } : undefined}
            >
              {etu.echeance.includes("·") || etu.echeanceLate ? (
                <strong>{etu.echeance}</strong>
              ) : (
                etu.echeance
              )}
            </td>
            <td className={`num cell-money${etu.honorairesGold ? " gold" : ""}`}>
              {etu.honoraires}
            </td>
            <td className="center">
              <button type="button" className="btn btn-ghost btn-sm">
                {etu.actionLabel}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
