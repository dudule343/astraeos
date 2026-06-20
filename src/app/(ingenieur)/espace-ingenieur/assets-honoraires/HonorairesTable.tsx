"use client";

import { useRouter } from "next/navigation";

import {
  etudesMissions,
  honorairesTotal,
  type EtudeMission,
} from "../../_data/assets-honoraires";

/**
 * Tableau « Détail de mes études patrimoniales ».
 * Porte le comportement de la maquette : chaque <tr> est cliquable
 * (onclick="goToPage('ing-fiche-dossier')") et ouvre la fiche du dossier de la
 * ligne (timeline du parcours). Le bouton « Voir → » fait la même navigation.
 */
export function HonorairesTable() {
  const router = useRouter();

  const goToDossier = (dossierId: string) =>
    router.push(`/espace-ingenieur/dossiers/${dossierId}`);

  return (
    <table className="dt">
      <thead>
        <tr>
          <th>Clients</th>
          <th>Entrée en relation</th>
          <th>Type de conseil</th>
          <th>Dates de l&apos;étude</th>
          <th className="num">Honoraires facturés</th>
          <th className="center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {etudesMissions.map((m) => (
          <EtudeRow key={m.dossierId} mission={m} onOpen={goToDossier} />
        ))}
        <tr className="hon-total-row">
          <td>
            <strong>Total portefeuille</strong>
          </td>
          <td className="hon-total-resume" colSpan={3}>
            {honorairesTotal.resume}
          </td>
          <td className="num cell-money gold">{honorairesTotal.montant}</td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

function EtudeRow({
  mission,
  onOpen,
}: {
  mission: EtudeMission;
  onOpen: (dossierId: string) => void;
}) {
  return (
    <tr className="dt-clickable" onClick={() => onOpen(mission.dossierId)}>
      <td>
        <div className="hon-client-cell">
          <span className="ingenieur-avatar">{mission.initials}</span>
          <span className="cell-primary">{mission.client}</span>
        </div>
      </td>
      <td className="nowrap" style={{ fontSize: "11px" }}>
        {mission.entreeRelation}
      </td>
      <td className="hon-conseil-cell">
        {mission.typesConseil.map((t, i) => (
          <span className="badge badge-gold" key={i}>
            {t}
          </span>
        ))}
      </td>
      <td className="nowrap hon-dates-cell">
        {mission.datesEtude.map((d, i) => (
          <span className="hon-date-line" key={i}>
            {d}
          </span>
        ))}
      </td>
      <td className="num cell-money gold">{mission.honoraires}</td>
      <td className="center">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(mission.dossierId);
          }}
        >
          Voir →
        </button>
      </td>
    </tr>
  );
}
