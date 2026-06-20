"use client";

/* ─────────────────────────────────────────────────────────────────────────
 * Bouton « Modifier le RDV » du hero de la fiche RDV (porté du
 * `#page-ing-fiche-rdv-joubert` de la maquette 030 v28, ligne 7846 :
 * `onclick="openModalNouveauRdv()"`).
 *
 * Dans la maquette, « Modifier le RDV » rouvre la grande popup « Création RDV
 * directe » (`modal-nouveau-rdv`) pré-remplie pour ajuster le rendez-vous. On
 * porte le comportement à l'identique : le bouton réutilise la vraie modale
 * NewRdvModal de l'agenda (Client Component + Server Action `createRdv`), via
 * l'événement window `open-new-rdv`, pré-remplie avec le client et la date de
 * la fiche, en-tête « Modification du RDV ». Plus de bouton mort.
 * ───────────────────────────────────────────────────────────────────────── */

import {
  NewRdvModal,
  OPEN_NEW_RDV_EVENT,
  type OpenNewRdvDetail,
} from "../NewRdvModal";

export function ModifierRdvButton({
  clientNom,
  dateLabel,
}: {
  clientNom: string;
  dateLabel: string;
}) {
  function open() {
    window.dispatchEvent(
      new CustomEvent<OpenNewRdvDetail>(OPEN_NEW_RDV_EVENT, {
        detail: {
          clientExistant: clientNom,
          jour: dateLabel,
          modeModification: true,
        },
      }),
    );
  }

  return (
    <>
      <button
        type="button"
        className="s1c-visio-btn replay frdv-replay-sm"
        title={`Modifier le rendez-vous · ${clientNom}`}
        onClick={open}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ width: "14px", height: "14px" }}
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
        </svg>
        Modifier le RDV
      </button>
      <NewRdvModal />
    </>
  );
}
