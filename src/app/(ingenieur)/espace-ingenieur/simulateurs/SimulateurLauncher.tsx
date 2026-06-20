"use client";

import { useEffect, useState } from "react";

/**
 * Bouton « Lancer le simulateur » des cartes calculateurs.
 *
 * Portage fidèle de la maquette ingénieur v28 (`page-ing-out-simulateurs`) :
 * la maquette affiche un `.btn .btn-gold` pleinement actif (or 100 %, hover
 * #d39817, curseur pointer). On reproduit exactement cet état visuel et on
 * branche une vraie interaction client (useState + handlers) plutôt qu'un
 * bouton désactivé/mort : au clic, une modale s'ouvre, fermable par la croix,
 * le bouton « Fermer », un clic sur l'arrière-plan ou la touche Échap.
 */
export function SimulateurLauncher({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="btn btn-gold sim-btn"
        onClick={() => setOpen(true)}
      >
        Lancer le simulateur
      </button>

      {open ? (
        <div
          className="sim-modal-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="sim-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Simulateur ${title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sim-modal-header">
              <div className="sim-modal-eyebrow">Simulateur · calculateur</div>
              <div className="sim-modal-title">{title}</div>
              <button
                type="button"
                className="sim-modal-close"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>
            <div className="sim-modal-body">
              <div className="sim-modal-desc">{description}</div>
              <div className="sim-modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
