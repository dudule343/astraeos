"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useState } from "react";
import Link from "next/link";

type Cat = "all" | "ready" | "active" | "inactive";

type Row = {
  type: "couple" | "personne-morale" | "seul";
  names: string[];
  rep?: string;
  typeLabel: string;
  typeClass?: string;
  conseiller: string;
  conseillerCity: string;
  ingAvatar: string;
  ingName: string;
  date: string;
  dateMeta: string;
  dateAlert?: boolean;
  dateMetaAlert?: boolean;
  pct: number;
  docs: string;
  fillClass?: string;
  statusClass: string;
  status: string;
  detail: string;
  cats: Cat[];
  rowClass?: string;
  rowStyle?: React.CSSProperties;
  refreshIcon?: boolean;
};

const ROWS: Row[] = [
  {
    type: "couple",
    names: ["Bertrand DUPONT", "Monique TOPIN"],
    typeLabel: "Couple",
    typeClass: "couple",
    conseiller: "Luc THILLIEZ",
    conseillerCity: "Dirigeant-praticien",
    ingAvatar: "JV",
    ingName: "Julien VASSEUR",
    date: "29/04/2026",
    dateMeta: "Il y a 10 jours",
    pct: 100,
    docs: "142/142 docs",
    fillClass: "complete",
    statusClass: "signed",
    status: "Prêt à commencer l'étude",
    detail:
      "Détail : 142 documents collectés sur 142 attendus. Cliquez ici pour ouvrir la liste des documents (CNI, RIB, avis imposition, contrats existants, statuts société, etc.).",
    cats: ["ready"],
    rowClass: "pipe-row-couple",
  },
  {
    type: "seul",
    names: ["Stéphane MOREAU"],
    typeLabel: "Personne seule",
    conseiller: "Julien VASSEUR",
    conseillerCity: "Senior · 8 ans",
    ingAvatar: "RB",
    ingName: "Romain BERTHIER",
    date: "02/05/2026",
    dateMeta: "Il y a 7 jours",
    pct: 76,
    docs: "65/85 docs",
    statusClass: "sent",
    status: "En collecte",
    detail:
      "Détail : 65/85 documents collectés. Documents manquants : 3 derniers bulletins de salaire, attestation de propriété, RIB compte épargne...",
    cats: ["active"],
  },
  {
    type: "couple",
    names: ["Anne LEROY", "Pierre LEROY"],
    typeLabel: "Couple",
    typeClass: "couple",
    conseiller: "Julien VASSEUR",
    conseillerCity: "Senior · 8 ans",
    ingAvatar: "AR",
    ingName: "Antoine ROSSI",
    date: "04/05/2026",
    dateMeta: "Il y a 5 jours",
    pct: 45,
    docs: "84/186 docs",
    statusClass: "sent",
    status: "En collecte",
    detail:
      "Détail : 84/186 documents collectés. Couple avec patrimoine complexe : 2 SCI, plusieurs immobiliers locatifs, 4 contrats AV, 1 PER...",
    cats: ["active"],
    rowClass: "pipe-row-couple",
  },
  {
    type: "personne-morale",
    names: ["SAS GROUPE LEFEBVRE"],
    rep: "Représentant : Pierre LEFEBVRE",
    typeLabel: "Personne morale",
    typeClass: "personne-morale",
    conseiller: "Luc THILLIEZ",
    conseillerCity: "Dirigeant-praticien",
    ingAvatar: "JV",
    ingName: "Julien VASSEUR",
    date: "06/05/2026",
    dateMeta: "Il y a 3 jours",
    pct: 35,
    docs: "95/268 docs",
    statusClass: "sent",
    status: "En collecte",
    detail:
      "Détail : 95/268 documents. Personne morale : statuts, K-bis, bilans 3 dernières années, déclarations fiscales, pacte associés, comptes courants associés...",
    cats: ["active"],
    rowClass: "pipe-row-pm",
  },
  {
    type: "couple",
    names: ["Christian ROCHE", "Marie ROCHE"],
    typeLabel: "Couple",
    typeClass: "couple",
    conseiller: "Sophie MERCIER",
    conseillerCity: "5 ans",
    ingAvatar: "CF",
    ingName: "Caroline FAURE",
    date: "28/04/2026",
    dateMeta: "Il y a 11 jours",
    pct: 62,
    docs: "74/120 docs",
    statusClass: "sent",
    status: "En collecte",
    detail:
      "Détail : 74/120 documents collectés. Cliquez ici pour ouvrir la liste des documents collectés et manquants.",
    cats: ["active"],
    rowClass: "pipe-row-couple",
  },
  {
    type: "seul",
    names: ["Camille JOUBERT"],
    typeLabel: "Personne seule",
    conseiller: "Camille BERTRAND",
    conseillerCity: "Junior · 2 ans",
    ingAvatar: "LR",
    ingName: "Léa RICCI",
    date: "06/05/2026",
    dateMeta: "Il y a 3 jours",
    pct: 88,
    docs: "54/61 docs",
    statusClass: "sent",
    status: "En collecte",
    detail:
      "Détail : 54/61 documents collectés. Cliquez ici pour ouvrir la liste des documents collectés et manquants.",
    cats: ["active"],
  },
  {
    type: "couple",
    names: ["François BONNET", "Isabelle BONNET"],
    typeLabel: "Couple",
    typeClass: "couple",
    conseiller: "Luc THILLIEZ",
    conseillerCity: "Dirigeant-praticien",
    ingAvatar: "MK",
    ingName: "Mathieu KELLER",
    date: "03/05/2026",
    dateMeta: "Il y a 6 jours",
    pct: 100,
    docs: "118/118 docs",
    fillClass: "complete",
    statusClass: "signed",
    status: "Prêt à commencer l'étude",
    detail:
      "Détail : 118 documents collectés sur 118 attendus. Cliquez ici pour ouvrir la liste des documents.",
    cats: ["ready"],
    rowClass: "pipe-row-couple",
  },
  {
    type: "seul",
    names: ["Élise BARDET"],
    typeLabel: "Personne seule",
    conseiller: "Camille BERTRAND",
    conseillerCity: "Junior · 2 ans",
    ingAvatar: "LR",
    ingName: "Léa RICCI",
    date: "12/04/2026",
    dateMeta: "Il y a 27 jours · inactif",
    dateAlert: true,
    dateMetaAlert: true,
    pct: 28,
    docs: "22/78 docs",
    fillClass: "alert",
    statusClass: "dormant",
    status: "Inactif > 14j",
    detail:
      "Détail : 22/78 documents collectés. Dossier inactif depuis 27 jours, à relancer en priorité.",
    cats: ["inactive"],
    rowStyle: { background: "rgba(245,221,215,0.3)" },
    refreshIcon: true,
  },
  {
    type: "couple",
    names: ["Olivier CHARPENTIER", "Nathalie CHARPENTIER"],
    typeLabel: "Couple",
    typeClass: "couple",
    conseiller: "Julien VASSEUR",
    conseillerCity: "Senior · 8 ans",
    ingAvatar: "PM",
    ingName: "Paul MARTINEZ",
    date: "07/05/2026",
    dateMeta: "Il y a 2 jours",
    pct: 18,
    docs: "16/92 docs",
    statusClass: "sent",
    status: "En collecte",
    detail:
      "Détail : 16/92 documents collectés. Cliquez ici pour ouvrir la liste des documents collectés et manquants.",
    cats: ["active"],
    rowClass: "pipe-row-couple",
  },
  {
    type: "seul",
    names: ["Maxime ROUX"],
    typeLabel: "Personne seule",
    conseiller: "Sophie MERCIER",
    conseillerCity: "5 ans",
    ingAvatar: "HC",
    ingName: "Hélène CARRÈRE",
    date: "28/04/2026",
    dateMeta: "Il y a 11 jours",
    pct: 55,
    docs: "72/130 docs",
    statusClass: "sent",
    status: "En collecte",
    detail:
      "Détail : 72/130 documents collectés. Cliquez ici pour ouvrir la liste des documents collectés et manquants.",
    cats: ["active"],
  },
];

const FILTERS: { key: Cat; label: string; count: number; alert?: boolean }[] = [
  { key: "all", label: "Tous", count: 24 },
  { key: "ready", label: "Prêts pour étape 04", count: 6 },
  { key: "active", label: "En collecte active", count: 13 },
  { key: "inactive", label: "Inactifs > 14 j", count: 5, alert: true },
];

export function CollecteClient() {
  const [filter, setFilter] = useState<Cat>("all");

  const rows =
    filter === "all" ? ROWS : ROWS.filter((r) => r.cats.includes(filter));

  return (
    <>
      <div className="pipeline-stepper-v1">
        <Link href="/espace-dirigeant/parcours/prospects" className="stepper-item-v1">
          <div className="stepper-badge-v1" data-step="01">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
              <circle cx="13" cy="13" r="8.5" strokeWidth="1.8" />
              <circle cx="13" cy="13" r="5.5" strokeWidth="0.9" opacity="0.5" strokeDasharray="1 1.5" />
              <path d="M13 8.5 L 14 11.5 L 17 12 L 14.5 14 L 15 17 L 13 15.5 L 11 17 L 11.5 14 L 9 12 L 12 11.5 Z" fill="currentColor" stroke="none" />
              <line x1="19.2" y1="19.2" x2="25" y2="25" strokeWidth="2.2" />
              <circle cx="25" cy="25" r="1.4" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="stepper-label-v1">Prospects actifs</div>
          <div className="stepper-count-v1">187</div>
        </Link>
        <Link href="/espace-dirigeant/parcours/compliance" className="stepper-item-v1">
          <div className="stepper-badge-v1" data-step="02">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="M16 3 L 6 6 L 6 15 C 6 21 11 26 16 28 C 21 26 26 21 26 15 L 26 6 Z" strokeWidth="1.8" />
              <path d="M16 6 L 9 8 L 9 15 C 9 19.5 12.5 23 16 24.5 C 19.5 23 23 19.5 23 15 L 23 8 Z" strokeWidth="0.8" opacity="0.5" strokeDasharray="1.5 1.5" />
              <polyline points="11.5 15.5 14.5 18.5 20.5 12" strokeWidth="2.4" />
              <circle cx="16" cy="5" r="0.9" fill="currentColor" />
              <circle cx="11" cy="9" r="0.6" fill="currentColor" />
              <circle cx="21" cy="9" r="0.6" fill="currentColor" />
            </svg>
          </div>
          <div className="stepper-label-v1">Compliance validée</div>
          <div className="stepper-count-v1">18</div>
        </Link>
        <Link href="/espace-dirigeant/parcours/collecte" className="stepper-item-v1 active">
          <div className="stepper-badge-v1" data-step="03">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="M4 9 L 13 9 L 15.5 12 L 28 12 L 28 25 C 28 26 27 27 26 27 L 6 27 C 5 27 4 26 4 25 Z" strokeWidth="1.8" />
              <line x1="4" y1="14" x2="28" y2="14" strokeWidth="0.8" opacity="0.5" />
              <rect x="11" y="6" width="10" height="12" rx="0.8" fill="white" strokeWidth="1.5" />
              <line x1="13" y1="9" x2="19" y2="9" strokeWidth="1" />
              <line x1="13" y1="11.5" x2="19" y2="11.5" strokeWidth="1" />
              <line x1="13" y1="14" x2="17" y2="14" strokeWidth="1" />
            </svg>
          </div>
          <div className="stepper-label-v1">Collecte docs</div>
          <div className="stepper-count-v1">24</div>
        </Link>
        <Link href="/espace-dirigeant/parcours/etudes" className="stepper-item-v1">
          <div className="stepper-badge-v1" data-step="04">
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
          </div>
          <div className="stepper-label-v1">Études en cours</div>
          <div className="stepper-count-v1">41</div>
        </Link>
        <Link href="/espace-dirigeant/parcours/restituees" className="stepper-item-v1">
          <div className="stepper-badge-v1" data-step="05">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="M7 4 L 19 4 L 25 10 L 25 28 L 7 28 Z" strokeWidth="1.8" />
              <polyline points="19 4 19 10 25 10" strokeWidth="1.5" />
              <line x1="11" y1="14" x2="21" y2="14" strokeWidth="0.9" opacity="0.7" />
              <line x1="11" y1="17" x2="21" y2="17" strokeWidth="0.9" opacity="0.7" />
              <line x1="11" y1="20" x2="17" y2="20" strokeWidth="0.9" opacity="0.7" />
              <circle cx="22" cy="24" r="4.2" fill="white" strokeWidth="1.6" />
              <polyline points="20 24 21.5 25.5 24 22.5" strokeWidth="1.8" />
            </svg>
          </div>
          <div className="stepper-label-v1">Études restituées</div>
          <div className="stepper-count-v1">28</div>
        </Link>
        <Link href="/espace-dirigeant/parcours/suivi" className="stepper-item-v1">
          <div className="stepper-badge-v1" data-step="06">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
              <circle cx="16" cy="16" r="13" strokeWidth="0.7" opacity="0.4" strokeDasharray="0.8 1.8" />
              <circle cx="16" cy="16" r="10.5" strokeWidth="1.8" />
              <circle cx="16" cy="16" r="7" strokeWidth="1.4" />
              <circle cx="16" cy="16" r="3.5" strokeWidth="1.2" />
              <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="stepper-label-v1">Clients en suivi</div>
          <div className="stepper-count-v1">142</div>
        </Link>
      </div>

      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 03</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">Collecte des documents et informations</h1>
          <p className="hero-sub">
            Collecte des pièces justificatives nécessaires à l&apos;étude patrimoniale :
            justificatifs d&apos;identité, fiscalité, patrimoine, charges, projets. Espace
            client ouvert pour upload sécurisé.
          </p>
        </div>
      </section>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Inactifs &gt; 14 jours</div>
          <div className="kpi-value" style={{ color: "var(--orange-text)" }}>1</div>
          <div className="kpi-meta">à relancer en priorité</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">En collecte</div>
          <div className="kpi-value">5 <span className="unit">clients</span></div>
          <div className="kpi-meta">en attente de collecte des documents</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Complétion moyenne</div>
          <div className="kpi-value">68 <span className="unit">%</span></div>
          <div className="kpi-meta">dossiers à 100 % : 6</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Prêts pour étape 04</div>
          <div className="kpi-value" style={{ color: "var(--gold)" }}>2</div>
          <div className="kpi-meta">complets · à lancer</div>
        </div>
      </div>

      <div className="qf-bar-v1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`qf-v1${filter === f.key ? " active" : ""}${f.alert ? " alert" : ""}`}
            onClick={() => setFilter(f.key)}
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
              <th>Conseiller</th>
              <th>Date ouverture espace</th>
              <th>Complétion · cliquez pour voir docs</th>
              <th>Statut</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={r.rowClass} style={r.rowStyle}>
                <td>
                  <div className="client-cell">
                    {r.type === "couple" ? (
                      <>
                        {r.names.map((n) => (
                          <span key={n} className="client-name-line">{n}</span>
                        ))}
                        <span className="client-type couple">{r.typeLabel}</span>
                      </>
                    ) : r.type === "personne-morale" ? (
                      <>
                        <span className="client-name">{r.names[0]}</span>
                        <span
                          className="client-name-line"
                          style={{ fontSize: "10.5px", color: "var(--navy-300)", fontWeight: 500 }}
                        >
                          {r.rep}
                        </span>
                        <span className="client-type personne-morale">{r.typeLabel}</span>
                      </>
                    ) : (
                      <>
                        <span className="client-name">{r.names[0]}</span>
                        <span className="client-type">{r.typeLabel}</span>
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">{r.conseiller}</span>
                    <span className="city">{r.conseillerCity}</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">{r.ingAvatar}</div>
                    <span className="ingenieur-name">{r.ingName}</span>
                  </div>
                </td>
                <td className="nowrap">
                  <div className={`date-cell${r.dateAlert ? " alert" : ""}`}>{r.date}</div>
                  <div
                    className="date-cell-meta"
                    style={r.dateMetaAlert ? { color: "var(--red-text)", fontWeight: 600 } : undefined}
                  >
                    {r.dateMeta}
                  </div>
                </td>
                <td style={{ cursor: "pointer" }} onClick={() => alert(r.detail)}>
                  <div className="progress-cell">
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill${r.fillClass ? " " + r.fillClass : ""}`}
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      <span>{r.docs}</span>
                      <span className="pct">{r.pct} %</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-pill-v1 ${r.statusClass}`}>{r.status}</span>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <button className="action-btn" onClick={() => alert(r.detail)}>
                      {r.refreshIcon ? (
                        <svg viewBox="0 0 24 24">
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                      ) : (
                        <svg>
                          <use href="#i-eye" />
                        </svg>
                      )}
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
                … 1 autre client en collecte · 4 dossiers prêts pour étape 04 · documents par
                dossier : 60 à 300 selon complexité patrimoniale
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
