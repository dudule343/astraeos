"use client";

import { useRouter } from "next/navigation";

import type {
  ImmoProjectRow,
  ImmoProjectsTotal,
} from "../../_data/assets-immobilier-pure";

/**
 * Tableau « Détail de mes projets immobiliers ».
 * Porte le comportement de la maquette : chaque <tr> est cliquable
 * (onclick="goToPage('ing-fiche-client')") et ouvre la fiche du client de la
 * ligne. Le bouton « Voir → » fait la même navigation que la ligne.
 * Données réelles reçues par PROPS depuis la page serveur.
 */
export function ProjectsTable({
  projects,
  total,
}: {
  projects: ImmoProjectRow[];
  total: ImmoProjectsTotal;
}) {
  const router = useRouter();

  const goToClient = (clientId: string) =>
    router.push(`/espace-ingenieur/clients/${clientId}`);

  return (
    <table className="dt">
      <thead>
        <tr>
          <th>Clients</th>
          <th>Types</th>
          <th>Dates d&apos;initiation</th>
          <th>Dates de livraison</th>
          <th className="num">Projets total</th>
          <th className="num">Délai</th>
          <th className="center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((row) => (
          <ProjectRow key={row.clientId} row={row} onOpen={goToClient} />
        ))}
        <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
          <td>
            <strong>Total portefeuille</strong>
          </td>
          <td colSpan={3} style={{ textAlign: "center", fontSize: "11.5px" }}>
            {total.clientsLabel}
          </td>
          <td className="num">
            <strong>{total.projectsTotal}</strong>
          </td>
          <td className="num">{total.delayAverage}</td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

function ProjectRow({
  row,
  onOpen,
}: {
  row: ImmoProjectRow;
  onOpen: (clientId: string) => void;
}) {
  return (
    <tr style={{ cursor: "pointer" }} onClick={() => onOpen(row.clientId)}>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div className="ingenieur-avatar">{row.initials}</div>
          <div className="cell-primary">{row.clientName}</div>
        </div>
      </td>
      <td style={{ lineHeight: 1.9 }}>
        {row.types.map((t, i) => (
          <span key={t}>
            <span
              className="badge badge-gold"
              style={{
                fontSize: "10px",
                display: "inline-block",
                marginBottom: i < row.types.length - 1 ? "3px" : undefined,
              }}
            >
              {t}
            </span>
            {i < row.types.length - 1 ? <br /> : null}
          </span>
        ))}
      </td>
      <td className="nowrap" style={{ fontSize: "11px", lineHeight: 1.9 }}>
        {row.initiationDates.map((d, i) => (
          <span key={i}>
            {d}
            {i < row.initiationDates.length - 1 ? <br /> : null}
          </span>
        ))}
      </td>
      <td className="nowrap" style={{ fontSize: "11px", lineHeight: 1.9 }}>
        {row.deliveryDates.map((d, i) => (
          <span key={i}>
            {d}
            {i < row.deliveryDates.length - 1 ? <br /> : null}
          </span>
        ))}
      </td>
      <td className="num" style={{ verticalAlign: "middle" }}>
        {row.projectsTotal}
      </td>
      <td className="num" style={{ verticalAlign: "middle" }}>
        {row.delay}
      </td>
      <td className="center" style={{ verticalAlign: "middle" }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(row.clientId);
          }}
        >
          Voir →
        </button>
      </td>
    </tr>
  );
}
