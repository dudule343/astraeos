"use client";

import Link from "next/link";
import { useState } from "react";

type StudyRow = {
  clients: { name: string; line?: boolean }[];
  clientType: string;
  clientTypeClass?: string;
  cabinet: { name: string; city: string };
  ingenieur: { avatar: string; name: string };
  studyType: { label: string; cls: string };
  start: string;
  due: string;
  dueMeta: string;
  dueAlert?: boolean;
  dueMetaStyle?: React.CSSProperties;
  progress: number;
  progressText: string;
  progressAlert?: boolean;
  rowStyle?: React.CSSProperties;
  late?: boolean;
  filters: string[];
};

const ROWS: StudyRow[] = [
  {
    clients: [
      { name: "Bertrand DUPONT", line: true },
      { name: "Monique TOPIN", line: true },
    ],
    clientType: "Couple",
    clientTypeClass: "couple",
    cabinet: { name: "Luc THILLIEZ", city: "Dirigeant-praticien" },
    ingenieur: { avatar: "JV", name: "Julien VASSEUR" },
    studyType: { label: "Étude patrimoniale", cls: "patrimoine" },
    start: "04/05/2026",
    due: "10/06/2026",
    dueMeta: "Dans 32 jours",
    progress: 25,
    progressText: "Phase 1/4 · analyse des documents",
    filters: ["patrimoniales"],
  },
  {
    clients: [{ name: "Stéphane MOREAU" }],
    clientType: "Personne seule",
    cabinet: { name: "Julien VASSEUR", city: "Senior · 8 ans" },
    ingenieur: { avatar: "RB", name: "Romain BERTHIER" },
    studyType: { label: "Invest. immobilier direct", cls: "immo-direct" },
    start: "28/04/2026",
    due: "28/05/2026",
    dueMeta: "Dans 19 jours",
    progress: 60,
    progressText: "Phase 2/4 · réalisation du bilan",
    filters: ["immo-direct", "sous30"],
  },
  {
    clients: [{ name: "Marie DUBOIS", line: true }],
    clientType: "Personne seule",
    cabinet: { name: "Julien VASSEUR", city: "Senior · 8 ans" },
    ingenieur: { avatar: "AR", name: "Antoine ROSSI" },
    studyType: { label: "Étude patrimoniale", cls: "patrimoine" },
    start: "15/04/2026",
    due: "15/05/2026",
    dueMeta: "Dans 6 jours",
    progress: 90,
    progressText: "Phase 4/4 · validation pour envoi",
    filters: ["patrimoniales", "sous30"],
  },
  {
    clients: [{ name: "Camille DURIEZ" }],
    clientType: "Personne seule",
    cabinet: { name: "Thomas LEROY", city: "5 ans" },
    ingenieur: { avatar: "OM", name: "Olivier MARTIN" },
    studyType: { label: "Immatriculation société", cls: "societe" },
    start: "10/03/2026",
    due: "10/04/2026",
    dueMeta: "En retard de 29 j",
    dueAlert: true,
    dueMetaStyle: { color: "var(--red-text)", fontWeight: 600 },
    progress: 65,
    progressText: "Phase 3/4 · réalisation des préconisations",
    progressAlert: true,
    rowStyle: { background: "rgba(245,221,215,0.3)" },
    late: true,
    filters: ["societe", "late"],
  },
];

const QUICK_FILTERS: { key: string; label: string; count: number; alert?: boolean }[] = [
  { key: "all", label: "Toutes", count: 41 },
  { key: "sous30", label: "Restitution sous 30 j", count: 22 },
  { key: "patrimoniales", label: "Études patrimoniales", count: 28 },
  { key: "immo-direct", label: "Investissement immobilier direct", count: 8 },
  { key: "financier-direct", label: "Investissement financier direct", count: 3 },
  { key: "assurance-direct", label: "Mise en place assurance direct", count: 2 },
  { key: "late", label: "En retard", count: 3, alert: true },
];

const STEPPER = [
  {
    step: "01",
    label: "Prospects actifs",
    count: "187",
    href: "/espace-dirigeant/parcours/prospects",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
        <circle cx="13" cy="13" r="8.5" strokeWidth="1.8" />
        <circle cx="13" cy="13" r="5.5" strokeWidth="0.9" opacity="0.5" strokeDasharray="1 1.5" />
        <path d="M13 8.5 L 14 11.5 L 17 12 L 14.5 14 L 15 17 L 13 15.5 L 11 17 L 11.5 14 L 9 12 L 12 11.5 Z" fill="currentColor" stroke="none" />
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
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
        <path d="M16 3 L 6 6 L 6 15 C 6 21 11 26 16 28 C 21 26 26 21 26 15 L 26 6 Z" strokeWidth="1.8" />
        <path d="M16 6 L 9 8 L 9 15 C 9 19.5 12.5 23 16 24.5 C 19.5 23 23 19.5 23 15 L 23 8 Z" strokeWidth="0.8" opacity="0.5" strokeDasharray="1.5 1.5" />
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
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
        <path d="M4 9 L 13 9 L 15.5 12 L 28 12 L 28 25 C 28 26 27 27 26 27 L 6 27 C 5 27 4 26 4 25 Z" strokeWidth="1.8" />
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
    active: true,
    icon: (
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
    ),
  },
  {
    step: "05",
    label: "Études restituées",
    count: "28",
    href: "/espace-dirigeant/parcours/restituees",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
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
      <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
        <circle cx="16" cy="16" r="13" strokeWidth="0.7" opacity="0.4" strokeDasharray="0.8 1.8" />
        <circle cx="16" cy="16" r="10.5" strokeWidth="1.8" />
        <circle cx="16" cy="16" r="7" strokeWidth="1.4" />
        <circle cx="16" cy="16" r="3.5" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function EtudesClient() {
  const [filter, setFilter] = useState("all");

  const visibleRows =
    filter === "all" ? ROWS : ROWS.filter((r) => r.filters.includes(filter));

  return (
    <>
      <div className="pipeline-stepper-v1">
        {STEPPER.map((s) =>
          s.active ? (
            <div className="stepper-item-v1 active" key={s.step}>
              <div className="stepper-badge-v1" data-step={s.step}>
                {s.icon}
              </div>
              <div className="stepper-label-v1">{s.label}</div>
              <div className="stepper-count-v1">{s.count}</div>
            </div>
          ) : (
            <Link className="stepper-item-v1" href={s.href} key={s.step}>
              <div className="stepper-badge-v1" data-step={s.step}>
                {s.icon}
              </div>
              <div className="stepper-label-v1">{s.label}</div>
              <div className="stepper-count-v1">{s.count}</div>
            </Link>
          )
        )}
      </div>

      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 04</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">Études en cours</h1>
          <p className="hero-sub">
            Études patrimoniales en cours de réalisation par les ingénieurs du
            Cabinet Paris Étoile. Suivi avancement, délai de restitution, type
            d&#39;accompagnement.
          </p>
        </div>
      </section>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Études en cours</div>
          <div className="kpi-value">7</div>
          <div className="kpi-meta">démarrées sur la période</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Restitution sous 30 jours</div>
          <div className="kpi-value">4</div>
          <div className="kpi-meta">livrables proches</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">En retard</div>
          <div className="kpi-value" style={{ color: "var(--orange-text)" }}>
            2
          </div>
          <div className="kpi-meta">dépassement délai contractuel</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Délai moyen de réalisation</div>
          <div className="kpi-value">
            32 <span className="unit">jours</span>
          </div>
          <div className="kpi-meta">depuis l&apos;étape 03</div>
        </div>
      </div>

      <div className="qf-bar-v1">
        {QUICK_FILTERS.map((qf) => (
          <button
            key={qf.key}
            type="button"
            onClick={() => setFilter(qf.key)}
            className={`qf-v1${filter === qf.key ? " active" : ""}${
              qf.alert ? " alert" : ""
            }`}
          >
            {qf.label} <span className="qf-count">{qf.count}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>Client</th>
              <th>Ingénieur</th>
              <th>Ingénieur patrimonial</th>
              <th>Type d&apos;accompagnement</th>
              <th>Date début</th>
              <th>Restitution prévue</th>
              <th>Avancement</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r, i) => (
              <tr
                key={i}
                className={r.clientType === "Couple" ? "pipe-row-couple" : undefined}
                style={r.rowStyle}
              >
                <td>
                  <div className="client-cell">
                    {r.clients.map((c, ci) => (
                      <span
                        key={ci}
                        className={c.line ? "client-name-line" : "client-name"}
                      >
                        {c.name}
                      </span>
                    ))}
                    <span
                      className={`client-type${
                        r.clientTypeClass ? ` ${r.clientTypeClass}` : ""
                      }`}
                    >
                      {r.clientType}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">{r.cabinet.name}</span>
                    <span className="city">{r.cabinet.city}</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">{r.ingenieur.avatar}</div>
                    <span className="ingenieur-name">{r.ingenieur.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`study-type ${r.studyType.cls}`}>
                    {r.studyType.label}
                  </span>
                </td>
                <td className="nowrap">
                  <div className="date-cell">{r.start}</div>
                </td>
                <td className="nowrap">
                  <div className={`date-cell${r.dueAlert ? " alert" : ""}`}>
                    {r.due}
                  </div>
                  <div className="date-cell-meta" style={r.dueMetaStyle}>
                    {r.dueMeta}
                  </div>
                </td>
                <td>
                  <div className="progress-cell">
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill${
                          r.progressAlert ? " alert" : ""
                        }`}
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      <span>{r.progressText}</span>
                      <span className="pct">{r.progress} %</span>
                    </div>
                  </div>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button type="button" className="action-btn">
                      <svg>
                        <use href={r.late ? "#i-alert" : "#i-eye"} />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filter === "all" && (
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
                  … 37 autres études en cours ·{" "}
                  <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                    Voir l&apos;intégralité (41)
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
