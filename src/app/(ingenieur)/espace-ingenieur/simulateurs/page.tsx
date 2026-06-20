import type { ReactNode } from "react";

import { getSimulateursScreen, type SimulateurIcon } from "../../_data/simulateurs";
import "../../_styles/simulateurs.css";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Simulateurs & calculateurs",
};

export const dynamic = "force-dynamic";

/** Pictogrammes premium portés à l'identique des <svg> inline de la maquette. */
const SIM_ICONS: Record<SimulateurIcon, ReactNode> = {
  financier: (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 8.5c-1.8-2.2-4.4-3.5-7.2-3.5C9.4 5 5 9.4 5 14.8c0 5.4 4.4 9.7 9.8 9.7 2.8 0 5.4-1.3 7.2-3.5" />
      <line x1="3" y1="12.5" x2="18" y2="12.5" />
      <line x1="3" y1="17" x2="16" y2="17" />
    </svg>
  ),
  "pret-immo": (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 28V11l8-5 8 5v17" />
      <path d="M21 28V14l6-3v17" />
      <line x1="3" y1="28" x2="29" y2="28" strokeWidth={2} />
      <rect x="9" y="14" width="3" height="3" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="9" y="20" width="3" height="3" />
      <rect x="14" y="20" width="3" height="3" />
      <rect x="23" y="17" width="2.5" height="2.5" />
      <rect x="23" y="22" width="2.5" height="2.5" />
    </svg>
  ),
  ifi: (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14L16 4l12 10v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M12 28V18h8v10" />
      <polyline points="6 8 6 4 10 4" strokeWidth={1.4} opacity={0.9} />
      <polyline points="22 4 26 4 26 8" strokeWidth={1.4} opacity={0.9} />
      <circle cx="16" cy="22" r="0.8" fill="currentColor" />
    </svg>
  ),
  donation: (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="13" width="24" height="16" rx="1.5" />
      <line x1="4" y1="20" x2="28" y2="20" strokeWidth={1.4} />
      <rect x="3" y="9" width="26" height="5" rx="1" />
      <line x1="16" y1="29" x2="16" y2="9" strokeWidth={1.6} />
      <path
        d="M16 9C13 9 11 6 12 4c1-1.5 3.5-1 4 1l0.5 4M16 9c3 0 5-3 4-5-1-1.5-3.5-1-4 1L15.5 9"
        strokeWidth={1.4}
      />
    </svg>
  ),
  succession: (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="3.5" />
      <circle cx="22" cy="10" r="3.5" />
      <path d="M5 22c0-3 2.2-5 5-5s5 2 5 5v3" />
      <path d="M17 22c0-3 2.2-5 5-5s5 2 5 5v3" />
      <line
        x1="16"
        y1="14"
        x2="16"
        y2="28"
        strokeWidth={1.5}
        strokeDasharray="1.5 1.5"
        opacity={0.7}
      />
      <circle cx="16" cy="28" r="1" fill="currentColor" />
    </svg>
  ),
  per: (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 4h14M9 28h14" />
      <path d="M9 4v3c0 4 5 7 7 9-2 2-7 5-7 9v3" />
      <path d="M23 4v3c0 4-5 7-7 9 2 2 7 5 7 9v3" />
      <path d="M12 8h8c0 3-3 5-4 6-1-1-4-3-4-6z" fill="currentColor" opacity={0.4} />
      <path d="M13 25c0-2 2-3 3-3s3 1 3 3" fill="currentColor" opacity={0.6} />
    </svg>
  ),
};

export default function SimulateursPage() {
  const screen = getSimulateursScreen();

  return (
    <div className="px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            Simulateurs &amp; <strong>calculateurs</strong>
          </h1>
          <p className="hero-sub">{screen.heroSub}</p>
        </div>
      </div>

      {/* 6 cartes alignées avec hauteur fixe + boutons alignés en bas */}
      <div className="sim-grid">
        {screen.simulateurs.map((sim) => (
          <div key={sim.id} className="card sim-card">
            <div className="card-body">
              <div className="sim-head">
                <div className="sim-icon">{SIM_ICONS[sim.icon]}</div>
                <strong className="sim-title">{sim.title}</strong>
              </div>
              <div className="sim-desc">{sim.description}</div>
              {/* Les calculateurs n'ont pas encore de moteur branché côté serveur :
                  bouton honnête désactivé plutôt que mort. */}
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="btn btn-gold sim-btn"
              >
                Lancer le simulateur
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
