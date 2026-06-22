"use client";

import Link from "next/link";
import { useState } from "react";

// Écran « Études restituées » (dir-pipe-05) porté à l'identique de la maquette
// dirigeant (reference/wireframes-dirigeant.html, lignes 7347-7475). Le stepper
// Parcours patrimonial navigue entre les six étapes ; la qf-bar filtre les lignes
// du tableau par suite à donner (toutes / convertis en suivi / en décision client /
// sans suite).

type Filter = "all" | "converted" | "decision" | "nosuite";

const STEPPER = [
  {
    step: "01",
    label: "Prospects actifs",
    count: "187",
    href: "/espace-dirigeant/parcours/prospects",
    icon: (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      >
        <circle cx="13" cy="13" r="8.5" strokeWidth="1.8" />
        <circle cx="13" cy="13" r="5.5" strokeWidth="0.9" opacity="0.5" strokeDasharray="1 1.5" />
        <path
          d="M13 8.5 L 14 11.5 L 17 12 L 14.5 14 L 15 17 L 13 15.5 L 11 17 L 11.5 14 L 9 12 L 12 11.5 Z"
          fill="currentColor"
          stroke="none"
        />
        <line x1="19.2" y1="19.2" x2="25" y2="25" strokeWidth="2.2" />
        <circle cx="25" cy="25" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    step: "02",
    label: "Compliance validée",
    count: "18",
    href: "/espace-dirigeant/parcours/compliance",
    icon: (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M16 3 L 6 6 L 6 15 C 6 21 11 26 16 28 C 21 26 26 21 26 15 L 26 6 Z" strokeWidth="1.8" />
        <path
          d="M16 6 L 9 8 L 9 15 C 9 19.5 12.5 23 16 24.5 C 19.5 23 23 19.5 23 15 L 23 8 Z"
          strokeWidth="0.8"
          opacity="0.5"
          strokeDasharray="1.5 1.5"
        />
        <polyline points="11.5 15.5 14.5 18.5 20.5 12" strokeWidth="2.4" />
        <circle cx="16" cy="5" r="0.9" fill="currentColor" />
        <circle cx="11" cy="9" r="0.6" fill="currentColor" />
        <circle cx="21" cy="9" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    step: "03",
    label: "Collecte docs",
    count: "24",
    href: "/espace-dirigeant/parcours/collecte",
    icon: (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path
          d="M4 9 L 13 9 L 15.5 12 L 28 12 L 28 25 C 28 26 27 27 26 27 L 6 27 C 5 27 4 26 4 25 Z"
          strokeWidth="1.8"
        />
        <line x1="4" y1="14" x2="28" y2="14" strokeWidth="0.8" opacity="0.5" />
        <rect x="11" y="6" width="10" height="12" rx="0.8" fill="white" strokeWidth="1.5" />
        <line x1="13" y1="9" x2="19" y2="9" strokeWidth="1" />
        <line x1="13" y1="11.5" x2="19" y2="11.5" strokeWidth="1" />
        <line x1="13" y1="14" x2="17" y2="14" strokeWidth="1" />
      </svg>
    ),
  },
  {
    step: "04",
    label: "Études en cours",
    count: "41",
    href: "/espace-dirigeant/parcours/etudes",
    icon: (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
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
    ),
  },
  {
    step: "05",
    label: "Études restituées",
    count: "28",
    href: "/espace-dirigeant/parcours/restituees",
    active: true,
    icon: (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M7 4 L 19 4 L 25 10 L 25 28 L 7 28 Z" strokeWidth="1.8" />
        <polyline points="19 4 19 10 25 10" strokeWidth="1.5" />
        <line x1="11" y1="14" x2="21" y2="14" strokeWidth="0.9" opacity="0.7" />
        <line x1="11" y1="17" x2="21" y2="17" strokeWidth="0.9" opacity="0.7" />
        <line x1="11" y1="20" x2="17" y2="20" strokeWidth="0.9" opacity="0.7" />
        <circle cx="22" cy="24" r="4.2" fill="white" strokeWidth="1.6" />
        <polyline points="20 24 21.5 25.5 24 22.5" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    step: "06",
    label: "Clients en suivi",
    count: "142",
    href: "/espace-dirigeant/parcours/suivi",
    icon: (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      >
        <circle cx="16" cy="16" r="13" strokeWidth="0.7" opacity="0.4" strokeDasharray="0.8 1.8" />
        <circle cx="16" cy="16" r="10.5" strokeWidth="1.8" />
        <circle cx="16" cy="16" r="7" strokeWidth="1.4" />
        <circle cx="16" cy="16" r="3.5" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const FILTERS: { id: Filter; label: string; count: string; alert?: boolean }[] = [
  { id: "all", label: "Toutes", count: "28" },
  { id: "converted", label: "Convertis en suivi", count: "24" },
  { id: "decision", label: "En décision client", count: "3" },
  { id: "nosuite", label: "Sans suite", count: "1", alert: true },
];

export function RestitueesClient() {
  const [filter, setFilter] = useState<Filter>("all");

  function show(cat: Exclude<Filter, "all">) {
    return filter === "all" || filter === cat;
  }

  return (
    <>
      <div className="pipeline-stepper-v1">
        {STEPPER.map((s) => (
          <Link
            key={s.step}
            href={s.href}
            className={`stepper-item-v1 ${s.active ? "active" : ""}`}
          >
            <div className="stepper-badge-v1" data-step={s.step}>
              {s.icon}
            </div>
            <div className="stepper-label-v1">{s.label}</div>
            <div className="stepper-count-v1">{s.count}</div>
          </Link>
        ))}
      </div>

      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 05</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">Études restituées</h1>
          <p className="hero-sub">
            Études patrimoniales restituées au client. Suivi de la suite à donner
            (signature de placements, missions complémentaires, abandon) et de la
            satisfaction client.
          </p>
        </div>
      </section>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Études restituées</div>
          <div className="kpi-value">14</div>
          <div className="kpi-meta">depuis janvier 2026</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avis Trustpilot reçus</div>
          <div className="kpi-value">11</div>
          <div className="kpi-meta">
            <strong>79 %</strong> de retour client
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Note moyenne</div>
          <div className="kpi-value gold">
            4,8 <span className="unit">/ 5</span>
          </div>
          <div className="kpi-meta">excellente perception</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Délai moyen restitution</div>
          <div className="kpi-value">
            42 <span className="unit">jours</span>
          </div>
          <div className="kpi-meta">de la collecte à la restitution</div>
        </div>
      </div>

      <div className="qf-bar-v1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`qf-v1${filter === f.id ? " active" : ""}${f.alert ? " alert" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label} <span className="qf-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>Client</th>
              <th>Ingénieur</th>
              <th>Ingénieur</th>
              <th>Type d&apos;accompagnement</th>
              <th>Trustpilot</th>
              <th>Suite à donner · décision client</th>
              <th>Date prochain entretien · mise en place</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {show("converted") && (
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
                <td>
                  <span className="study-type patrimoine">Étude patrimoniale</span>
                </td>
                <td>
                  <span
                    className="trustpilot-stars"
                    style={{ color: "#00B67A", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    ★★★★★ 5,0
                  </span>
                </td>
                <td>
                  <span className="status-pill-v1 signed">Investissements validés client</span>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy-300)",
                      marginTop: "3px",
                    }}
                  >
                    PEA + AV souscrits
                  </div>
                </td>
                <td className="nowrap">
                  <div className="date-cell">22/05/2026</div>
                  <div className="date-cell-meta">Dans 13 jours</div>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn">
                      <svg>
                        <use href="#i-eye" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {show("converted") && (
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
                <td>
                  <span className="study-type patrimoine">Étude patrimoniale</span>
                </td>
                <td>
                  <span
                    className="trustpilot-stars"
                    style={{ color: "#00B67A", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    ★★★★★ 5,0
                  </span>
                </td>
                <td>
                  <span className="status-pill-v1 signed">
                    Validation client investissement immobilier
                  </span>
                </td>
                <td className="nowrap">
                  <div className="date-cell">28/05/2026</div>
                  <div className="date-cell-meta">Dans 19 jours</div>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn">
                      <svg>
                        <use href="#i-eye" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {show("decision") && (
              <tr>
                <td>
                  <div className="client-cell">
                    <span className="client-name">Patrick ARMAND</span>
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
                    <div className="ingenieur-avatar">CF</div>
                    <span className="ingenieur-name">Caroline FAURE</span>
                  </div>
                </td>
                <td>
                  <span className="study-type immo-direct">Invest. immobilier direct</span>
                </td>
                <td>
                  <span
                    className="trustpilot-stars"
                    style={{ color: "#00B67A", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    ★★★★ 4,2
                  </span>
                </td>
                <td>
                  <span className="status-pill-v1 waiting">
                    Client en cours de réflexion sur investissement immobilier
                  </span>
                </td>
                <td className="nowrap">
                  <div className="date-cell">15/05/2026</div>
                  <div className="date-cell-meta">Dans 6 jours</div>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn">
                      <svg>
                        <use href="#i-eye" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {show("converted") && (
              <tr className="pipe-row-couple">
                <td>
                  <div className="client-cell">
                    <span className="client-name-line">Jean-Marc TROCHU</span>
                    <span className="client-name-line">Pascale TROCHU</span>
                    <span className="client-type couple">Couple</span>
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
                    <div className="ingenieur-avatar">AR</div>
                    <span className="ingenieur-name">Antoine ROSSI</span>
                  </div>
                </td>
                <td>
                  <span className="study-type assurance">Étude patrimoniale</span>
                </td>
                <td>
                  <span
                    className="trustpilot-stars"
                    style={{ color: "#00B67A", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    ★★★★★ 5,0
                  </span>
                </td>
                <td>
                  <span className="status-pill-v1 signed">
                    Validation client investissement financier
                  </span>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy-300)",
                      marginTop: "3px",
                    }}
                  >
                    PER + Mutuelle
                  </div>
                </td>
                <td className="nowrap">
                  <div className="date-cell">26/05/2026</div>
                  <div className="date-cell-meta">Dans 17 jours</div>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn">
                      <svg>
                        <use href="#i-eye" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {show("converted") && (
              <tr className="pipe-row-pm">
                <td>
                  <div className="client-cell">
                    <span className="client-name">SAS GROUPE LEBON</span>
                    <span
                      className="client-name-line"
                      style={{
                        fontSize: "10.5px",
                        color: "var(--navy-300)",
                        fontWeight: 500,
                      }}
                    >
                      Repr. : Henri LEBON
                    </span>
                    <span className="client-type personne-morale">Personne morale</span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">Luc THILLIEZ</span>
                    <span className="city">Paris 8e (ASTRAEOS)</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">LT</div>
                    <span className="ingenieur-name">Luc THILLIEZ</span>
                  </div>
                </td>
                <td>
                  <span className="study-type societe">Immatriculation société</span>
                </td>
                <td>
                  <span
                    className="trustpilot-stars"
                    style={{ color: "#00B67A", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    ★★★★★ 5,0
                  </span>
                </td>
                <td>
                  <span className="status-pill-v1 signed">
                    Validation client immatriculation société
                  </span>
                </td>
                <td className="nowrap">
                  <div className="date-cell">14/05/2026</div>
                  <div className="date-cell-meta">Dans 5 jours</div>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn">
                      <svg>
                        <use href="#i-eye" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {show("nosuite") && (
              <tr>
                <td>
                  <div className="client-cell">
                    <span className="client-name">Régis FOUCAULT</span>
                    <span className="client-type">Personne seule</span>
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
                    <div className="ingenieur-avatar">MK</div>
                    <span className="ingenieur-name">Mathieu KELLER</span>
                  </div>
                </td>
                <td>
                  <span className="study-type patrimoine">Étude patrimoniale</span>
                </td>
                <td>
                  <span
                    className="trustpilot-stars"
                    style={{ color: "#00B67A", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    ★★★ 3,8
                  </span>
                </td>
                <td>
                  <span className="status-pill-v1 dormant">Refus des propositions</span>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy-300)",
                      marginTop: "3px",
                    }}
                  >
                    Pas de suite donnée
                  </div>
                </td>
                <td className="nowrap">
                  <div style={{ color: "var(--navy-300)" }}>—</div>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn">
                      <svg>
                        <use href="#i-eye" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )}
            <tr style={{ background: "var(--ivory)" }}>
              <td
                colSpan={8}
                style={{
                  textAlign: "center",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  padding: "14px",
                }}
              >
                … 22 autres études restituées ·{" "}
                <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                  Voir l&apos;intégralité (28)
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          style={{
            marginTop: "14px",
            padding: "12px 14px",
            background: "var(--ivory)",
            borderLeft: "3px solid var(--gold)",
            borderRadius: "5px",
            fontSize: "11px",
            color: "var(--navy-300)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "var(--navy)" }}>
            Statuts possibles « Suite à donner » :
          </strong>{" "}
          <span style={{ color: "var(--green-text)" }}>Investissements validés client</span> ·{" "}
          <span style={{ color: "var(--gold)" }}>
            Validation client investissement immobilier
          </span>{" "}
          ·{" "}
          <span style={{ color: "var(--gold)" }}>
            Validation client investissement financier
          </span>{" "}
          ·{" "}
          <span style={{ color: "var(--gold)" }}>
            Validation client immatriculation société
          </span>{" "}
          · <span style={{ color: "var(--orange-text)" }}>Client en cours de réflexion</span> ·{" "}
          <span style={{ color: "var(--red-text)" }}>Refus des propositions</span>. La{" "}
          <strong>date du prochain entretien</strong> oblige l&apos;ingénieur à prévoir un
          rendez-vous de mise en place.
        </div>
      </div>
    </>
  );
}
