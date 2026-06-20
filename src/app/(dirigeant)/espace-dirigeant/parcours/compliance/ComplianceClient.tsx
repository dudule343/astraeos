"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

// Écran dir-pipe-02 « Compliance validée » porté 1:1 depuis
// reference/wireframes-dirigeant.html (lignes 6924-7072). Interactions reconstruites :
// la barre de filtres rapides (qf-bar) filtre réellement les lignes, et la recherche
// filtre sur le nom du client. Le stepper du parcours patrimonial pointe vers les routes
// frères /espace-dirigeant/parcours/{prospects|compliance|collecte|etudes|restituees|suivi}.

type DocState = "signed" | "warn" | "muted";

type DocLine = {
  doc: string;
  text: string;
  emphasis?: string;
  state: DocState;
};

type Row = {
  id: string;
  couple: boolean;
  names: string[];
  type: string;
  conseiller: { name: string; sub: string };
  ingenieur: { initials: string; name: string };
  docs: DocLine[];
  paymentMain: string;
  paymentMainColor: string;
  paymentSub: string;
  status: { label: string; variant: "paid" | "signed" | "waiting" };
  // catégories pour les filtres rapides
  filters: Array<"all" | "to-sign" | "signed-waiting" | "paid">;
};

const DOC_COLOR: Record<DocState, string> = {
  signed: "var(--green-text)",
  warn: "var(--orange-text)",
  muted: "var(--navy-300)",
};

const ROWS: Row[] = [
  {
    id: "dupont-topin",
    couple: true,
    names: ["Bertrand DUPONT", "Monique TOPIN"],
    type: "Couple",
    conseiller: { name: "Luc THILLIEZ", sub: "Dirigeant-praticien" },
    ingenieur: { initials: "JV", name: "Julien VASSEUR" },
    docs: [
      { doc: "DER", text: "✓ Envoyé · Vu · Signé", state: "signed" },
      { doc: "KYC", text: "✓ Envoyé · Vu · Signé", state: "signed" },
      { doc: "LM", text: "✓ Envoyé · Vu · Signé", state: "signed" },
    ],
    paymentMain: "2 800 € reçus",
    paymentMainColor: "var(--green-text)",
    paymentSub: "28/04/2026",
    status: { label: "Paiement reçu", variant: "paid" },
    filters: ["all", "paid"],
  },
  {
    id: "moreau",
    couple: false,
    names: ["Stéphane MOREAU"],
    type: "Personne seule",
    conseiller: { name: "Julien VASSEUR", sub: "Senior · 8 ans" },
    ingenieur: { initials: "RB", name: "Romain BERTHIER" },
    docs: [
      { doc: "DER", text: "✓ Envoyé · Vu · Signé", state: "signed" },
      { doc: "KYC", text: "✓ Envoyé · Vu · Signé", state: "signed" },
      { doc: "LM", text: "✓ Envoyé · Vu · Signé", state: "signed" },
    ],
    paymentMain: "1 600 € reçus",
    paymentMainColor: "var(--green-text)",
    paymentSub: "02/05/2026",
    status: { label: "Paiement reçu", variant: "paid" },
    filters: ["all", "paid"],
  },
  {
    id: "leroy",
    couple: true,
    names: ["Anne LEROY", "Pierre LEROY"],
    type: "Couple",
    conseiller: { name: "Julien VASSEUR", sub: "Senior · 8 ans" },
    ingenieur: { initials: "AR", name: "Antoine ROSSI" },
    docs: [
      { doc: "DER", text: "✓ Envoyé · Vu · Signé", state: "signed" },
      { doc: "KYC", text: "✓ Envoyé · Vu · Signé", state: "signed" },
      { doc: "LM", text: "✓ Envoyé · Vu · Signé", state: "signed" },
    ],
    paymentMain: "En attente",
    paymentMainColor: "var(--orange-text)",
    paymentSub: "paiement non reçu",
    status: { label: "Tous signés · attente paiement", variant: "signed" },
    filters: ["all", "signed-waiting"],
  },
  {
    id: "guyot",
    couple: false,
    names: ["Hélène GUYOT"],
    type: "Personne seule",
    conseiller: { name: "Sophie MERCIER", sub: "5 ans" },
    ingenieur: { initials: "CF", name: "Caroline FAURE" },
    docs: [
      { doc: "DER", text: "✓ Envoyé · Vu · Signé", state: "signed" },
      { doc: "KYC", text: "▸ Envoyé · Vu · ", emphasis: "Non signé", state: "warn" },
      { doc: "LM", text: "▸ Envoyé · ", emphasis: "Non vu", state: "muted" },
    ],
    paymentMain: "En attente",
    paymentMainColor: "var(--orange-text)",
    paymentSub: "paiement non reçu",
    status: { label: "À signer", variant: "waiting" },
    filters: ["all", "to-sign"],
  },
  {
    id: "delacroix",
    couple: true,
    names: ["Marc DELACROIX", "Sandra DELACROIX"],
    type: "Couple",
    conseiller: { name: "Luc THILLIEZ", sub: "Dirigeant-praticien" },
    ingenieur: { initials: "MK", name: "Mathieu KELLER" },
    docs: [
      { doc: "DER", text: "▸ Envoyé · Vu · ", emphasis: "Non signé", state: "warn" },
      { doc: "KYC", text: "▸ Envoyé · Vu · ", emphasis: "Non signé", state: "warn" },
      { doc: "LM", text: "▸ Envoyé · Vu · ", emphasis: "Non signé", state: "warn" },
    ],
    paymentMain: "En attente",
    paymentMainColor: "var(--orange-text)",
    paymentSub: "paiement non reçu",
    status: { label: "À signer", variant: "waiting" },
    filters: ["all", "to-sign"],
  },
];

const QUICK_FILTERS = [
  { key: "all" as const, label: "Tous", count: 25 },
  { key: "to-sign" as const, label: "À signer", count: 7 },
  { key: "signed-waiting" as const, label: "Signés en attente paiement", count: 4 },
  { key: "paid" as const, label: "Paiement reçu", count: 14 },
];

type FilterKey = (typeof QUICK_FILTERS)[number]["key"];

const STEPPER: Array<{
  href: string;
  step: string;
  label: string;
  count: string;
  active: boolean;
  icon: React.ReactNode;
}> = [
  {
    href: "/espace-dirigeant/parcours/prospects",
    step: "01",
    label: "Prospects actifs",
    count: "187",
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
    href: "/espace-dirigeant/parcours/compliance",
    step: "02",
    label: "Compliance validée",
    count: "18",
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
    href: "/espace-dirigeant/parcours/collecte",
    step: "03",
    label: "Collecte docs",
    count: "24",
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
    href: "/espace-dirigeant/parcours/etudes",
    step: "04",
    label: "Études en cours",
    count: "41",
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
    href: "/espace-dirigeant/parcours/restituees",
    step: "05",
    label: "Études restituées",
    count: "28",
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
    href: "/espace-dirigeant/parcours/suivi",
    step: "06",
    label: "Clients en suivi",
    count: "142",
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

export function ComplianceClient() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROWS.filter((row) => {
      const matchFilter = row.filters.includes(filter);
      const matchQuery =
        q === "" || row.names.some((name) => name.toLowerCase().includes(q));
      return matchFilter && matchQuery;
    });
  }, [filter, query]);

  return (
    <>
      <div className="pipeline-stepper-v1">
        {STEPPER.map((item) => (
          <Link
            key={item.step}
            href={item.href}
            className={`stepper-item-v1 ${item.active ? "active" : ""}`}
          >
            <div className="stepper-badge-v1" data-step={item.step}>
              {item.icon}
            </div>
            <div className="stepper-label-v1">{item.label}</div>
            <div className="stepper-count-v1">{item.count}</div>
          </Link>
        ))}
      </div>

      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 02</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">Compliance validée</h1>
          <p className="hero-sub">
            Prospects ayant retourné les documents d&apos;entrée en relation signés et validés par
            les équipes compliance. Suivi du paiement de l&apos;acompte d&apos;étude et passage à
            l&apos;étape 03 (collecte).
          </p>
        </div>
      </section>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi clickable">
          <div className="kpi-label">En attente signature</div>
          <div className="kpi-value">
            1 <span className="unit">client</span>
          </div>
          <div className="kpi-meta">3 documents à signer (DER · KYC · LM)</div>
        </div>
        <div className="kpi clickable">
          <div className="kpi-label">En compliance validée</div>
          <div className="kpi-value">
            3 <span className="unit">clients</span>
          </div>
          <div className="kpi-meta">2 docs en attente validation interne</div>
        </div>
        <div className="kpi clickable">
          <div className="kpi-label">Paiement reçu</div>
          <div className="kpi-value">
            2<span style={{ fontSize: 16, color: "var(--navy-300)" }}> / 3</span>
          </div>
          <div className="kpi-meta">
            <strong>67 %</strong> ·{" "}
            <strong style={{ color: "var(--orange-text)" }}>1 en attente</strong>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Délai moyen</div>
          <div className="kpi-value">
            12 <span className="unit">jours</span>
          </div>
          <div className="kpi-meta">signature ensemble docs + paiement</div>
        </div>
      </div>

      <div className="qf-bar-v1">
        {QUICK_FILTERS.map((qf) => (
          <button
            key={qf.key}
            className={`qf-v1 ${filter === qf.key ? "active" : ""}`}
            onClick={() => setFilter(qf.key)}
          >
            {qf.label} <span className="qf-count">{qf.count}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-wrap">
              <svg>
                <use href="#i-search" />
              </svg>
              <input
                className="search-input"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="table-toolbar-right">
            <button className="btn btn-ghost btn-sm">Filtres</button>
            <button className="btn btn-ghost btn-sm">Exporter</button>
          </div>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Client</th>
              <th>Ingénieur</th>
              <th>Conseiller</th>
              <th>Documents</th>
              <th>Paiement</th>
              <th>Statut global</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={row.couple ? "pipe-row-couple" : undefined}>
                <td>
                  <div className="client-cell">
                    {row.couple ? (
                      row.names.map((name) => (
                        <span key={name} className="client-name-line">
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="client-name">{row.names[0]}</span>
                    )}
                    <span className={`client-type${row.couple ? " couple" : ""}`}>{row.type}</span>
                  </div>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">{row.conseiller.name}</span>
                    <span className="city">{row.conseiller.sub}</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">{row.ingenieur.initials}</div>
                    <span className="ingenieur-name">{row.ingenieur.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {row.docs.map((d) => (
                      <span key={d.doc} style={{ fontSize: 10.5 }}>
                        <strong>{d.doc}</strong>{" "}
                        <span style={{ color: DOC_COLOR[d.state] }}>
                          {d.text}
                          {d.emphasis ? <em>{d.emphasis}</em> : null}
                        </span>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="nowrap">
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: row.paymentMainColor,
                      lineHeight: 1.2,
                    }}
                  >
                    {row.paymentMain}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--navy-300)", marginTop: 2 }}>
                    {row.paymentSub}
                  </div>
                </td>
                <td>
                  <span className={`status-pill-v1 ${row.status.variant}`}>{row.status.label}</span>
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
            ))}
            <tr style={{ background: "var(--ivory)" }}>
              <td
                colSpan={7}
                style={{
                  textAlign: "center",
                  fontSize: 11.5,
                  color: "var(--navy-300)",
                  padding: 14,
                }}
              >
                … 13 autres dossiers ·{" "}
                <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                  Voir l&apos;intégralité (18)
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            background: "var(--ivory)",
            borderLeft: "3px solid var(--gold)",
            borderRadius: 5,
            fontSize: 11,
            color: "var(--navy-300)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "var(--navy)" }}>3 documents par client :</strong>{" "}
          <strong>DER</strong> (Document d&apos;Entrée en Relation) · <strong>KYC</strong> (Know Your
          Customer · questionnaire de qualification client intégré) · <strong>LM</strong> (Lettre de
          Mission). Sous-statut par doc :{" "}
          <span style={{ color: "var(--navy-300)" }}>Envoyé</span> →{" "}
          <span style={{ color: "var(--navy-300)" }}>Vu</span> →{" "}
          <span style={{ color: "var(--green-text)" }}>Signé</span>.
        </div>
      </div>
    </>
  );
}
