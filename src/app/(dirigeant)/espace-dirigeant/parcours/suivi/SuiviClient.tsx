"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import Link from "next/link";
import { useState } from "react";

const STEPPER = [
  { step: "01", label: "Prospects actifs", count: "187", href: "/espace-dirigeant/parcours/prospects" },
  { step: "02", label: "Compliance validée", count: "18", href: "/espace-dirigeant/parcours/compliance" },
  { step: "03", label: "Collecte docs", count: "24", href: "/espace-dirigeant/parcours/collecte" },
  { step: "04", label: "Études en cours", count: "41", href: "/espace-dirigeant/parcours/etudes" },
  { step: "05", label: "Études restituées", count: "28", href: "/espace-dirigeant/parcours/restituees" },
  { step: "06", label: "Clients en suivi", count: "142", href: "/espace-dirigeant/parcours/suivi" },
];

function StepperBadge({ step }: { step: string }) {
  switch (step) {
    case "01":
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
          <circle cx="13" cy="13" r="8.5" strokeWidth="1.8" />
          <circle cx="13" cy="13" r="5.5" strokeWidth="0.9" opacity="0.5" strokeDasharray="1 1.5" />
          <path d="M13 8.5 L 14 11.5 L 17 12 L 14.5 14 L 15 17 L 13 15.5 L 11 17 L 11.5 14 L 9 12 L 12 11.5 Z" fill="currentColor" stroke="none" />
          <line x1="19.2" y1="19.2" x2="25" y2="25" strokeWidth="2.2" />
          <circle cx="25" cy="25" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "02":
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M16 3 L 6 6 L 6 15 C 6 21 11 26 16 28 C 21 26 26 21 26 15 L 26 6 Z" strokeWidth="1.8" />
          <path d="M16 6 L 9 8 L 9 15 C 9 19.5 12.5 23 16 24.5 C 19.5 23 23 19.5 23 15 L 23 8 Z" strokeWidth="0.8" opacity="0.5" strokeDasharray="1.5 1.5" />
          <polyline points="11.5 15.5 14.5 18.5 20.5 12" strokeWidth="2.4" />
          <circle cx="16" cy="5" r="0.9" fill="currentColor" />
          <circle cx="11" cy="9" r="0.6" fill="currentColor" />
          <circle cx="21" cy="9" r="0.6" fill="currentColor" />
        </svg>
      );
    case "03":
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M4 9 L 13 9 L 15.5 12 L 28 12 L 28 25 C 28 26 27 27 26 27 L 6 27 C 5 27 4 26 4 25 Z" strokeWidth="1.8" />
          <line x1="4" y1="14" x2="28" y2="14" strokeWidth="0.8" opacity="0.5" />
          <rect x="11" y="6" width="10" height="12" rx="0.8" fill="white" strokeWidth="1.5" />
          <line x1="13" y1="9" x2="19" y2="9" strokeWidth="1" />
          <line x1="13" y1="11.5" x2="19" y2="11.5" strokeWidth="1" />
          <line x1="13" y1="14" x2="17" y2="14" strokeWidth="1" />
        </svg>
      );
    case "04":
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <rect x="3" y="3" width="26" height="26" rx="2" strokeWidth="1.8" />
          <line x1="6" y1="11" x2="26" y2="11" strokeWidth="0.6" opacity="0.4" />
          <line x1="6" y1="17" x2="26" y2="17" strokeWidth="0.6" opacity="0.4" />
          <line x1="6" y1="23" x2="26" y2="23" strokeWidth="0.6" opacity="0.4" />
          <polyline points="6 22 11 17 14 19 18 13 22 14 26 8" strokeWidth="2" />
          <circle cx="11" cy="17" r="1.6" fill="currentColor" />
          <circle cx="14" cy="19" r="1.6" fill="currentColor" />
          <circle cx="18" cy="13" r="1.6" fill="currentColor" />
          <circle cx="22" cy="14" r="1.6" fill="currentColor" />
          <circle cx="26" cy="8" r="2" fill="currentColor" />
        </svg>
      );
    case "05":
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M7 4 L 19 4 L 25 10 L 25 28 L 7 28 Z" strokeWidth="1.8" />
          <polyline points="19 4 19 10 25 10" strokeWidth="1.5" />
          <line x1="11" y1="14" x2="21" y2="14" strokeWidth="0.9" opacity="0.7" />
          <line x1="11" y1="17" x2="21" y2="17" strokeWidth="0.9" opacity="0.7" />
          <line x1="11" y1="20" x2="17" y2="20" strokeWidth="0.9" opacity="0.7" />
          <circle cx="22" cy="24" r="4.2" fill="white" strokeWidth="1.6" />
          <polyline points="20 24 21.5 25.5 24 22.5" strokeWidth="1.8" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
          <circle cx="16" cy="16" r="13" strokeWidth="0.7" opacity="0.4" strokeDasharray="0.8 1.8" />
          <circle cx="16" cy="16" r="10.5" strokeWidth="1.8" />
          <circle cx="16" cy="16" r="7" strokeWidth="1.4" />
          <circle cx="16" cy="16" r="3.5" strokeWidth="1.2" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

type Filter = "tous" | "entrevue" | "missions" | "sans3" | "sans6";

const QF: { key: Filter; label: React.ReactNode; count: string; alert?: boolean }[] = [
  { key: "tous", label: "Tous", count: "142" },
  { key: "entrevue", label: "Entrevue prévue < 30 j", count: "38" },
  { key: "missions", label: "Missions actives", count: "52" },
  { key: "sans3", label: "Sans contact > 3 mois", count: "12", alert: true },
  { key: "sans6", label: "Sans contact > 6 mois", count: "3", alert: true },
];

export function SuiviClient() {
  const [filter, setFilter] = useState<Filter>("tous");

  return (
    <>
      <div className="pipeline-stepper-v1">
        {STEPPER.map((s) => (
          <Link
            key={s.step}
            href={s.href}
            className={`stepper-item-v1 ${s.step === "06" ? "active" : ""}`}
          >
            <div className="stepper-badge-v1" data-step={s.step}>
              <StepperBadge step={s.step} />
            </div>
            <div className="stepper-label-v1">{s.label}</div>
            <div className="stepper-count-v1">{s.count}</div>
          </Link>
        ))}
      </div>

      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 06</span> Suivi patrimonial · cycle continu
          </div>
          <h1 className="hero-title">Clients en suivi</h1>
          <p className="hero-sub">
            Portefeuille des 28 clients en suivi récurrent par le Luc THILLIEZ. Pilotage des
            entrevues, contacts, missions actives et alerte sur les clients dormants.
          </p>
        </div>
      </section>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Clients en suivi</div>
          <div className="kpi-value">28</div>
          <div className="kpi-meta">portefeuille servi par le cabinet</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Entrevues sous 30 j</div>
          <div className="kpi-value">6</div>
          <div className="kpi-meta">point récurrent prévu</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Sans contact &gt; 3 mois</div>
          <div className="kpi-value" style={{ color: "var(--orange-text)" }}>2</div>
          <div className="kpi-meta">à recontacter en priorité</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Sans contact &gt; 6 mois</div>
          <div className="kpi-value" style={{ color: "var(--red-text)" }}>1</div>
          <div className="kpi-meta">risque de churn</div>
        </div>
      </div>

      <div className="qf-bar-v1">
        {QF.map((q) => (
          <button
            key={q.key}
            className={`qf-v1 ${q.alert ? "alert" : ""} ${filter === q.key ? "active" : ""}`}
            onClick={() => setFilter(q.key)}
          >
            {q.label} <span className="qf-count">{q.count}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>Client</th>
              <th>Ingénieur</th>
              <th>Conseiller</th>
              <th className="num">Encours du client</th>
              <th>Dernier rendez-vous</th>
              <th>Prochaine entrevue</th>
              <th>Préconisations réalisées</th>
              <th>Statut du client</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Bertrand DUPONT / Monique TOPIN — entrevue dans 37 j, missions actives */}
            {(filter === "tous" || filter === "missions") && (
              <tr className="pipe-row-couple" style={{ background: "rgba(198,142,14,0.05)" }}>
                <td>
                  <div className="client-cell">
                    <span className="client-name-line">Bertrand DUPONT</span>
                    <span className="client-name-line">Monique TOPIN</span>
                    <span className="client-type couple">Couple</span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">Luc THILLIEZ</span>
                    <span className="city">Dirigeant-praticien</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">JV</div>
                    <span className="ingenieur-name">Julien VASSEUR</span>
                  </div>
                </td>
                <td className="num cell-money gold">1 200 000 €</td>
                <td className="nowrap">
                  <div className="date-cell">15/03/2026</div>
                  <div className="date-cell-meta">Il y a 56 j</div>
                </td>
                <td className="nowrap">
                  <div className="date-cell">15/06/2026</div>
                  <div className="date-cell-meta">Dans 37 jours</div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px" }}>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>PEA</span>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>Investissement immobilier</span>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>Démembrement avec notaire</span>
                  </div>
                </td>
                <td><span className="badge badge-success">Actif</span></td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn"><svg><use href="#i-eye" /></svg></button>
                  </div>
                </td>
              </tr>
            )}

            {/* Marie DUBOIS — entrevue dans 19 j (<30j), missions actives */}
            {(filter === "tous" || filter === "entrevue" || filter === "missions") && (
              <tr>
                <td>
                  <div className="client-cell">
                    <span className="client-name">Marie DUBOIS</span>
                    <span className="client-type">Personne seule</span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">Julien VASSEUR</span>
                    <span className="city">Senior · 8 ans</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">RB</div>
                    <span className="ingenieur-name">Romain BERTHIER</span>
                  </div>
                </td>
                <td className="num cell-money">580 000 €</td>
                <td className="nowrap">
                  <div className="date-cell">14/02/2026</div>
                  <div className="date-cell-meta">Il y a 86 j</div>
                </td>
                <td className="nowrap">
                  <div className="date-cell">28/05/2026</div>
                  <div className="date-cell-meta">Dans 19 jours</div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px" }}>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>PEA</span>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>Création de société</span>
                  </div>
                </td>
                <td><span className="badge badge-success">Actif</span></td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn"><svg><use href="#i-eye" /></svg></button>
                  </div>
                </td>
              </tr>
            )}

            {/* Albert / Cécile HUYGHE — entrevue dans 24 j (<30j), missions actives */}
            {(filter === "tous" || filter === "entrevue" || filter === "missions") && (
              <tr className="pipe-row-couple">
                <td>
                  <div className="client-cell">
                    <span className="client-name-line">Albert HUYGHE</span>
                    <span className="client-name-line">Cécile HUYGHE</span>
                    <span className="client-type couple">Couple</span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">Luc THILLIEZ</span>
                    <span className="city">Dirigeant-praticien</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">EL</div>
                    <span className="ingenieur-name">Émilie LAMBERT</span>
                  </div>
                </td>
                <td className="num cell-money">880 000 €</td>
                <td className="nowrap">
                  <div className="date-cell">02/03/2026</div>
                  <div className="date-cell-meta">Il y a 69 j</div>
                </td>
                <td className="nowrap">
                  <div className="date-cell">02/06/2026</div>
                  <div className="date-cell-meta">Dans 24 jours</div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px" }}>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>Investissement immobilier</span>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>Création de société</span>
                  </div>
                </td>
                <td><span className="badge badge-success">Actif</span></td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn"><svg><use href="#i-eye" /></svg></button>
                  </div>
                </td>
              </tr>
            )}

            {/* Henri DUPONT — sans contact 149 j (>3 et >6 mois), pas de mission */}
            {(filter === "tous" || filter === "sans3" || filter === "sans6") && (
              <tr style={{ background: "rgba(245,221,215,0.3)" }}>
                <td>
                  <div className="client-cell">
                    <span className="client-name">Henri DUPONT</span>
                    <span className="client-type">Personne seule</span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">Sophie MERCIER</span>
                    <span className="city">5 ans</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">HC</div>
                    <span className="ingenieur-name">Hélène CARRÈRE</span>
                  </div>
                </td>
                <td className="num cell-money">320 000 €</td>
                <td className="nowrap">
                  <div className="date-cell alert">12/12/2025</div>
                  <div className="date-cell-meta" style={{ color: "var(--red-text)", fontWeight: 600 }}>Il y a 149 j</div>
                </td>
                <td className="nowrap">
                  <div className="date-cell" style={{ color: "var(--navy-300)" }}>—</div>
                  <div className="date-cell-meta" style={{ color: "var(--orange-text)" }}>À reprogrammer</div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px" }}>
                    <span style={{ fontWeight: 600, color: "var(--navy-300)" }}>Aucune en cours</span>
                  </div>
                </td>
                <td>
                  <span className="badge" style={{ background: "var(--orange-bg)", color: "var(--orange-text)", fontWeight: 700 }}>
                    Non renouvelé conseil
                  </span>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn"><svg><use href="#i-alert" /></svg></button>
                  </div>
                </td>
              </tr>
            )}

            {/* SAS GROUPE LEBON — entrevue dans 44 j, missions actives */}
            {(filter === "tous" || filter === "missions") && (
              <tr className="pipe-row-pm">
                <td>
                  <div className="client-cell">
                    <span className="client-name">SAS GROUPE LEBON</span>
                    <span className="client-type" style={{ background: "var(--light-blue)", color: "var(--navy)" }}>Personne morale</span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">Luc THILLIEZ</span>
                    <span className="city">Dirigeant-praticien</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">LT</div>
                    <span className="ingenieur-name">Luc THILLIEZ</span>
                  </div>
                </td>
                <td className="num cell-money gold">1 240 000 €</td>
                <td className="nowrap">
                  <div className="date-cell">22/03/2026</div>
                  <div className="date-cell-meta">Il y a 49 j</div>
                </td>
                <td className="nowrap">
                  <div className="date-cell">22/06/2026</div>
                  <div className="date-cell-meta">Dans 44 jours · trimestriel</div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px" }}>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>Compte-titres société</span>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>Holding</span>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>Optimisation IS</span>
                  </div>
                </td>
                <td><span className="badge badge-gold">VIP corporate</span></td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn"><svg><use href="#i-eye" /></svg></button>
                  </div>
                </td>
              </tr>
            )}

            <tr style={{ background: "var(--ivory)" }}>
              <td colSpan={9} style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy-300)", padding: "14px" }}>
                … 137 autres clients en suivi ·{" "}
                <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>Voir l&apos;intégralité (142)</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
