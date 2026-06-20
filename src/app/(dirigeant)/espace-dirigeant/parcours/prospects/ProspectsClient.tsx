"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type StatusKind = "dormant" | "waiting" | "relance" | "sent" | "met";

type ProspectRow = {
  rowClass: string;
  rowStyle?: React.CSSProperties;
  client: {
    kind: "single" | "couple" | "pm";
    names: string[];
    typeLabel: string;
    typeClass: string;
    pmRep?: string;
  };
  conseiller: { name: string; meta: string };
  ingenieur: { initials: string; name: string };
  date: { value: string; meta: string; alert?: boolean; metaAlert?: boolean };
  docs: { value: string; meta: string };
  status: { kind: StatusKind; label: string };
  filters: string[];
};

const STEPS = [
  {
    step: "01",
    label: "Prospects actifs",
    count: "187",
    href: "/espace-dirigeant/parcours/prospects",
    active: true,
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
    active: false,
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
    active: false,
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
    active: false,
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
    active: false,
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
    active: false,
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

const QUICK_FILTERS = [
  { id: "all", label: "Tous", count: "187", alert: false },
  { id: "nouveaux", label: "Nouveaux cette semaine", count: "24", alert: false },
  { id: "sans-docs", label: "Sans documents envoyés", count: "31", alert: false },
  { id: "dormants", label: "Dormants > 30 jours", count: "17", alert: true },
  { id: "relancer", label: "À relancer", count: "42", alert: false },
];

const ROWS: ProspectRow[] = [
  {
    rowClass: "pipe-row-couple",
    rowStyle: { background: "rgba(245,221,215,0.3)" },
    client: { kind: "couple", names: ["Jean AUBERT", "Martine AUBERT"], typeLabel: "Couple", typeClass: "couple" },
    conseiller: { name: "Julien VASSEUR", meta: "Senior · 8 ans" },
    ingenieur: { initials: "RB", name: "Romain BERTHIER" },
    date: { value: "14/03/2026", meta: "Il y a 56 jours · dormant", alert: true, metaAlert: true },
    docs: { value: "—", meta: "Non envoyés" },
    status: { kind: "dormant", label: "Dormant" },
    filters: ["all", "sans-docs", "dormants"],
  },
  {
    rowClass: "",
    client: { kind: "single", names: ["Nicolas MERCIER"], typeLabel: "Personne seule", typeClass: "" },
    conseiller: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
    ingenieur: { initials: "JV", name: "Julien VASSEUR" },
    date: { value: "22/03/2026", meta: "Il y a 48 jours" },
    docs: { value: "25/03/2026", meta: "3 jours après rencontre" },
    status: { kind: "waiting", label: "En attente retour" },
    filters: ["all"],
  },
  {
    rowClass: "pipe-row-couple",
    client: { kind: "couple", names: ["Philippe LEFRANC", "Sylvie LEFRANC"], typeLabel: "Couple", typeClass: "couple" },
    conseiller: { name: "Sophie MERCIER", meta: "5 ans" },
    ingenieur: { initials: "CF", name: "Caroline FAURE" },
    date: { value: "28/03/2026", meta: "Il y a 42 jours" },
    docs: { value: "02/04/2026", meta: "5 jours après rencontre" },
    status: { kind: "relance", label: "À relancer" },
    filters: ["all", "relancer"],
  },
  {
    rowClass: "",
    client: { kind: "single", names: ["Camille JOUBERT"], typeLabel: "Personne seule", typeClass: "" },
    conseiller: { name: "Thomas LEROY", meta: "3 ans" },
    ingenieur: { initials: "TR", name: "Thomas RENARD" },
    date: { value: "02/04/2026", meta: "Il y a 37 jours" },
    docs: { value: "06/04/2026", meta: "4 jours après rencontre" },
    status: { kind: "sent", label: "Docs envoyés" },
    filters: ["all"],
  },
  {
    rowClass: "pipe-row-couple",
    client: { kind: "couple", names: ["Bernard TESSIER", "Catherine TESSIER"], typeLabel: "Couple", typeClass: "couple" },
    conseiller: { name: "Camille BERTRAND", meta: "Junior · 2 ans" },
    ingenieur: { initials: "LR", name: "Léa RICCI" },
    date: { value: "08/04/2026", meta: "Il y a 31 jours" },
    docs: { value: "—", meta: "Non envoyés" },
    status: { kind: "met", label: "Rencontré" },
    filters: ["all", "sans-docs", "dormants"],
  },
  {
    rowClass: "pipe-row-couple",
    client: { kind: "couple", names: ["Olivier CHARPENTIER", "Nathalie CHARPENTIER"], typeLabel: "Couple", typeClass: "couple" },
    conseiller: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
    ingenieur: { initials: "MK", name: "Mathieu KELLER" },
    date: { value: "12/04/2026", meta: "Il y a 27 jours" },
    docs: { value: "15/04/2026", meta: "3 jours après rencontre" },
    status: { kind: "relance", label: "À relancer" },
    filters: ["all", "relancer"],
  },
  {
    rowClass: "",
    client: { kind: "single", names: ["Maxime ROUX"], typeLabel: "Personne seule", typeClass: "" },
    conseiller: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
    ingenieur: { initials: "EL", name: "Émilie LAMBERT" },
    date: { value: "14/04/2026", meta: "Il y a 25 jours" },
    docs: { value: "16/04/2026", meta: "2 jours après rencontre" },
    status: { kind: "sent", label: "Docs envoyés" },
    filters: ["all", "nouveaux"],
  },
  {
    rowClass: "pipe-row-couple",
    client: { kind: "couple", names: ["François BONNET", "Isabelle BONNET"], typeLabel: "Couple", typeClass: "couple" },
    conseiller: { name: "Julien VASSEUR", meta: "Senior · 8 ans" },
    ingenieur: { initials: "RB", name: "Romain BERTHIER" },
    date: { value: "16/04/2026", meta: "Il y a 23 jours" },
    docs: { value: "19/04/2026", meta: "3 jours après rencontre" },
    status: { kind: "waiting", label: "En attente retour" },
    filters: ["all", "nouveaux"],
  },
  {
    rowClass: "",
    client: { kind: "single", names: ["Léa BRUNET"], typeLabel: "Personne seule", typeClass: "" },
    conseiller: { name: "Thomas LEROY", meta: "3 ans" },
    ingenieur: { initials: "TR", name: "Thomas RENARD" },
    date: { value: "18/04/2026", meta: "Il y a 21 jours" },
    docs: { value: "—", meta: "Non envoyés" },
    status: { kind: "met", label: "Rencontré" },
    filters: ["all", "nouveaux", "sans-docs"],
  },
  {
    rowClass: "pipe-row-couple",
    client: { kind: "couple", names: ["Christian ROCHE", "Marie ROCHE"], typeLabel: "Couple", typeClass: "couple" },
    conseiller: { name: "Sophie MERCIER", meta: "5 ans" },
    ingenieur: { initials: "CF", name: "Caroline FAURE" },
    date: { value: "20/04/2026", meta: "Il y a 19 jours" },
    docs: { value: "22/04/2026", meta: "2 jours après rencontre" },
    status: { kind: "sent", label: "Docs envoyés" },
    filters: ["all", "nouveaux"],
  },
  {
    rowClass: "pipe-row-pm",
    client: {
      kind: "pm",
      names: ["SAS GROUPE LEFEBVRE"],
      typeLabel: "Personne morale",
      typeClass: "personne-morale",
      pmRep: "Représentant légal · signataire : Pierre LEFEBVRE",
    },
    conseiller: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
    ingenieur: { initials: "JV", name: "Julien VASSEUR" },
    date: { value: "25/04/2026", meta: "Il y a 14 jours" },
    docs: { value: "28/04/2026", meta: "3 jours après rencontre" },
    status: { kind: "sent", label: "Docs envoyés" },
    filters: ["all", "nouveaux"],
  },
];

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

export function ProspectsClient() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROWS.filter((row) => {
      if (!row.filters.includes(activeFilter)) return false;
      if (!q) return true;
      const haystack = [
        ...row.client.names,
        row.client.typeLabel,
        row.client.pmRep ?? "",
        row.conseiller.name,
        row.conseiller.meta,
        row.ingenieur.name,
        row.status.label,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [activeFilter, search]);

  return (
    <>
      {/* STEPPER V1 */}
      <div className="pipeline-stepper-v1">
        {STEPS.map((s) => (
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

      {/* HERO V1 avec period control */}
      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 01</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">Prospects actifs</h1>
          <p className="hero-sub">
            Liste des prospects identifiés par les ingénieurs du Cabinet Paris Étoile. Pour chaque
            prospect, la date du 1er contact, l&apos;état d&apos;envoi des documents d&apos;entrée en
            relation, et l&apos;ingénieur qui le porte.
          </p>
        </div>
      </section>

      {/* KPIs */}
      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Prospects actifs</div>
          <div className="kpi-value">24</div>
          <div className="kpi-meta">
            <strong>+ 5</strong> nouveaux cette semaine
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Convertis cette semaine</div>
          <div className="kpi-value">2</div>
          <div className="kpi-meta">Passés à l&apos;étape 02 · compliance</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Documents envoyés</div>
          <div className="kpi-value">
            19<span style={{ fontSize: "16px", color: "var(--navy-300)" }}> / 24</span>
          </div>
          <div className="kpi-meta">
            <strong>79 %</strong> du portefeuille couvert
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Délai moyen avant compliance</div>
          <div className="kpi-value">
            8 <span className="unit">jours</span>
          </div>
          <div className="kpi-meta">De l&apos;étape 01 à l&apos;étape 02</div>
        </div>
      </div>

      {/* Quick filters */}
      <div className="qf-bar-v1">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`qf-v1${activeFilter === f.id ? " active" : ""}${f.alert ? " alert" : ""}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label} <span className="qf-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Tableau prospects */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-wrap">
              <svg>
                <use href="#i-search" />
              </svg>
              <input
                className="search-input"
                placeholder="Rechercher un prospect, un cabinet, un conseiller…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="table-toolbar-right">
            <button className="btn btn-ghost btn-sm">Filtres avancés</button>
            <button className="btn btn-ghost btn-sm">
              Trier par : Date 1<sup>re</sup> rencontre
            </button>
            <button className="btn btn-ghost btn-sm">Exporter</button>
          </div>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Prospect</th>
              <th>Ingénieur</th>
              <th>Conseiller</th>
              <th>
                Date 1<sup>re</sup> rencontre
              </th>
              <th>Documents envoyés</th>
              <th>Statut</th>
              <th className="center" style={{ width: "100px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} className={row.rowClass || undefined} style={row.rowStyle}>
                <td>
                  <div className="client-cell">
                    {row.client.kind === "single" ? (
                      <span className="client-name">{row.client.names[0]}</span>
                    ) : row.client.kind === "pm" ? (
                      <>
                        <span className="client-name">{row.client.names[0]}</span>
                        <span
                          className="client-name-line"
                          style={{ fontSize: "10.5px", color: "var(--navy-300)", fontWeight: 500 }}
                        >
                          {row.client.pmRep}
                        </span>
                      </>
                    ) : (
                      row.client.names.map((n, j) => (
                        <span key={j} className="client-name-line">
                          {n}
                        </span>
                      ))
                    )}
                    <span className={`client-type${row.client.typeClass ? ` ${row.client.typeClass}` : ""}`}>
                      {row.client.typeLabel}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">{row.conseiller.name}</span>
                    <span className="city">{row.conseiller.meta}</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">{row.ingenieur.initials}</div>
                    <span className="ingenieur-name">{row.ingenieur.name}</span>
                  </div>
                </td>
                <td className="nowrap">
                  <div className={`date-cell${row.date.alert ? " alert" : ""}`}>{row.date.value}</div>
                  <div
                    className="date-cell-meta"
                    style={
                      row.date.metaAlert
                        ? { color: "var(--red-text)", fontWeight: 600 }
                        : undefined
                    }
                  >
                    {row.date.meta}
                  </div>
                </td>
                <td className="nowrap">
                  <div className="date-cell">{row.docs.value}</div>
                  <div className="date-cell-meta">{row.docs.meta}</div>
                </td>
                <td>
                  <span className={`status-pill-v1 ${row.status.kind}`}>{row.status.label}</span>
                </td>
                <td>
                  <div className="actions-cell">
                    <button className="action-btn">
                      <svg>
                        <use href="#i-eye" />
                      </svg>
                    </button>
                    <button className="action-btn">
                      <svg>
                        <use href="#i-edit" />
                      </svg>
                    </button>
                    <button className="action-btn">
                      <RefreshIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <tr style={{ background: "var(--ivory)" }}>
              <td
                colSpan={7}
                style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy-300)", padding: "14px" }}
              >
                … 177 autres prospects ·{" "}
                <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                  Voir l&apos;intégralité du pipeline (187)
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
