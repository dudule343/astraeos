"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useState, type ReactNode } from "react";

type Simulateur = {
  id: string;
  titre: string;
  description: string;
  icon: ReactNode;
};

const SIMULATEURS: Simulateur[] = [
  {
    id: "financier",
    titre: "Investissement financier",
    description:
      "Calculateur d'intérêts composés. Capital de départ, versements mensuels, taux annuel, horizon. Visualisation graphique de la croissance.",
    icon: (
      <svg
        style={{ width: 24, height: 24 }}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 8.5c-1.8-2.2-4.4-3.5-7.2-3.5C9.4 5 5 9.4 5 14.8c0 5.4 4.4 9.7 9.8 9.7 2.8 0 5.4-1.3 7.2-3.5" />
        <line x1="3" y1="12.5" x2="18" y2="12.5" />
        <line x1="3" y1="17" x2="16" y2="17" />
      </svg>
    ),
  },
  {
    id: "pret",
    titre: "Prêt immobilier",
    description:
      "Simulation de prêt immobilier (prêt simple, prêt gigogne). Calcul des mensualités, durée, TAEG, coût total du crédit, tableau d'amortissement.",
    icon: (
      <svg
        style={{ width: 24, height: 24 }}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 28V11l8-5 8 5v17" />
        <path d="M21 28V14l6-3v17" />
        <line x1="3" y1="28" x2="29" y2="28" strokeWidth="2" />
        <rect x="9" y="14" width="3" height="3" />
        <rect x="14" y="14" width="3" height="3" />
        <rect x="9" y="20" width="3" height="3" />
        <rect x="14" y="20" width="3" height="3" />
        <rect x="23" y="17" width="2.5" height="2.5" />
        <rect x="23" y="22" width="2.5" height="2.5" />
      </svg>
    ),
  },
  {
    id: "ifi",
    titre: "Impôt sur la Fortune Immobilière",
    description:
      "Calcul de l'IFI selon barème en vigueur, prise en compte des dettes déductibles et abattements.",
    icon: (
      <svg
        style={{ width: 24, height: 24 }}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 14L16 4l12 10v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
        <path d="M12 28V18h8v10" />
        <polyline points="6 8 6 4 10 4" strokeWidth="1.4" opacity="0.9" />
        <polyline points="22 4 26 4 26 8" strokeWidth="1.4" opacity="0.9" />
        <circle cx="16" cy="22" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "donation",
    titre: "Donation",
    description:
      "Optimisation des donations entre vifs : abattements par enfant, par petit-enfant, durée de réutilisation (15 ans).",
    icon: (
      <svg
        style={{ width: 24, height: 24 }}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="13" width="24" height="16" rx="1.5" />
        <line x1="4" y1="20" x2="28" y2="20" strokeWidth="1.4" />
        <rect x="3" y="9" width="26" height="5" rx="1" />
        <line x1="16" y1="29" x2="16" y2="9" strokeWidth="1.6" />
        <path
          d="M16 9C13 9 11 6 12 4c1-1.5 3.5-1 4 1l0.5 4M16 9c3 0 5-3 4-5-1-1.5-3.5-1-4 1L15.5 9"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  {
    id: "succession",
    titre: "Succession",
    description:
      "Calcul des droits de succession, simulation par héritier, estimation des pénalités selon les barèmes en vigueur.",
    icon: (
      <svg
        style={{ width: 24, height: 24 }}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
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
          strokeWidth="1.5"
          strokeDasharray="1.5 1.5"
          opacity="0.7"
        />
        <circle cx="16" cy="28" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "per",
    titre: "PER · Plan Épargne Retraite",
    description:
      "Optimisation des versements PER, économie d'impôt selon TMI, simulation de rente future et capital à la sortie.",
    icon: (
      <svg
        style={{ width: 24, height: 24 }}
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 4h14M9 28h14" />
        <path d="M9 4v3c0 4 5 7 7 9-2 2-7 5-7 9v3" />
        <path d="M23 4v3c0 4-5 7-7 9 2 2 7 5 7 9v3" />
        <path d="M12 8h8c0 3-3 5-4 6-1-1-4-3-4-6z" fill="currentColor" opacity="0.4" />
        <path d="M13 25c0-2 2-3 3-3s3 1 3 3" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
];

export function SimulateursClient() {
  const [actif, setActif] = useState<string | null>(null);
  const ouvert = SIMULATEURS.find((s) => s.id === actif);

  return (
    <>
      {ouvert && (
        <div
          className="card"
          style={{
            borderLeft: "4px solid var(--gold)",
            marginBottom: 24,
            background: "var(--ivory)",
          }}
        >
          <div
            className="card-body"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  background: "var(--ivory)",
                  border: "1.5px solid var(--gold)",
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  color: "var(--gold-deep)",
                }}
              >
                {ouvert.icon}
              </div>
              <div>
                <strong style={{ fontSize: 15, color: "var(--navy)" }}>
                  Simulateur {ouvert.titre}
                </strong>
                <div style={{ fontSize: 12, color: "var(--navy-300)", marginTop: 4 }}>
                  Chargement du simulateur en cours, préparation des paramètres de calcul.
                </div>
              </div>
            </div>
            <button className="btn btn-ghost" onClick={() => setActif(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {SIMULATEURS.map((s) => (
          <div
            key={s.id}
            className="card"
            style={{ borderLeft: "4px solid var(--gold)", display: "flex", flexDirection: "column" }}
          >
            <div
              className="card-body"
              style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 260 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    background: "var(--ivory)",
                    border: "1.5px solid var(--gold)",
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    color: "var(--gold-deep)",
                  }}
                >
                  {s.icon}
                </div>
                <strong style={{ fontSize: 15, color: "var(--navy)" }}>{s.titre}</strong>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--navy-300)",
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {s.description}
              </div>
              <button
                className="btn btn-gold"
                style={{
                  width: "100%",
                  marginTop: 18,
                  padding: "12px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
                onClick={() => setActif(s.id)}
              >
                Lancer le simulateur
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
