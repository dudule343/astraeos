import Link from "next/link";

import {
  BANK_BANNER,
  KPIS,
  ROWS,
  STEPPER,
  TOTAL_DOSSIERS,
  type ConformiteRow,
  type DocStatus,
  type StepperItem,
} from "../../_data/conformite";
import "../../_styles/conformite.css";

export const metadata = {
  title: "ASTRAEOS · Conformité en cours",
};

/** Icônes inline (la maquette les tire d'un sprite #i-*, on les porte ici). */
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

/** SVG du badge de chaque étape du stepper, identiques à la maquette. */
function StepperBadgeIcon({ step }: { step: string }) {
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
    case "06":
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

function StepperCard({ item }: { item: StepperItem }) {
  return (
    <Link href={item.href} className={`stepper-item-v1${item.active ? " active" : ""}`}>
      <div className="stepper-badge-v1" data-step={item.step}>
        <StepperBadgeIcon step={item.step} />
      </div>
      <div className="stepper-label-v1">{item.label}</div>
      <div className="stepper-count-v1">{item.count}</div>
    </Link>
  );
}

function DocLine({ doc }: { doc: DocStatus }) {
  return (
    <span className="doc-status-line">
      <strong>{doc.code}</strong> <span className={`tone-${doc.tone}`}>{doc.text}</span>
    </span>
  );
}

function rowClassName(row: ConformiteRow): string {
  const classes: string[] = [];
  if (row.kind === "couple") classes.push("pipe-row-couple");
  if (row.kind === "personne-morale") classes.push("pipe-row-pm");
  if (row.highlighted) classes.push("pipe-row-highlight");
  return classes.join(" ");
}

function ConformiteTableRow({ row }: { row: ConformiteRow }) {
  return (
    <tr className={rowClassName(row)}>
      <td>
        <div className="client-cell">
          {row.names.map((name, i) =>
            row.names.length > 1 || row.kind === "personne-morale" ? (
              <span className="client-name-line" key={i}>
                {name}
              </span>
            ) : (
              <span className="client-name" key={i}>
                {name}
              </span>
            ),
          )}
          {row.legalRep ? (
            <span
              className="client-name-line"
              style={{ fontSize: "10.5px", color: "var(--navy-300)", fontWeight: 500 }}
            >
              {row.legalRep}
            </span>
          ) : null}
          <span className={`client-type${row.kind === "couple" ? " couple" : row.kind === "personne-morale" ? " personne-morale" : ""}`}>
            {row.typeLabel}
          </span>
        </div>
      </td>
      <td>
        <div className="cabinet-cell">
          <span className="name">{row.cabinet.name}</span>
          <span className="city">{row.cabinet.sub}</span>
        </div>
      </td>
      <td>
        <div className="ingenieur-cell">
          <div className="ingenieur-avatar">{row.supervisor.initials}</div>
          <span className="ingenieur-name">{row.supervisor.name}</span>
        </div>
      </td>
      <td>
        <div className="doc-status-cell">
          {row.docs.map((doc) => (
            <DocLine doc={doc} key={doc.code} />
          ))}
        </div>
      </td>
      <td className="nowrap">
        <span className={`s1c-pay-pill ${row.payment.tone}`}>{row.payment.label}</span>
        <div className="pay-amount">{row.payment.meta}</div>
      </td>
      <td>
        <span className={`status-pill-v1 ${row.status.tone}`}>{row.status.label}</span>
      </td>
      <td className="center">
        <div className="actions-cell">
          {row.ficheReady ? (
            <Link
              href={`/espace-ingenieur/conformite/${row.id}`}
              className="action-btn"
              title="Ouvrir la fiche conformité"
            >
              <IconEye />
            </Link>
          ) : (
            <button
              type="button"
              className="action-btn"
              disabled
              title="Fiche conformité · en cours de construction"
            >
              <IconEye />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function ConformitePage() {
  return (
    <div className="pipe-page-wrap">
      {/* STEPPER PARCOURS */}
      <div className="pipeline-stepper-v1">
        {STEPPER.map((item) => (
          <StepperCard item={item} key={item.step} />
        ))}
      </div>

      {/* HERO */}
      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 02</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">
            Conformité <strong>en cours</strong>
          </h1>
          <p className="hero-sub">
            Vos prospects ayant retourné les documents d&apos;entrée en relation
            signés et validés par les équipes conformité. Suivi du paiement de
            l&apos;acompte d&apos;étude et passage à l&apos;étape 03 (collecte).
          </p>
        </div>
      </section>

      {/* BANDEAU BANQUE */}
      <div className="s1c-bank-banner-ing">
        <div className="s1c-bank-banner-ing-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <div>
          <div className="s1c-bank-banner-ing-title">{BANK_BANNER.title}</div>
          <div className="s1c-bank-banner-ing-meta">{BANK_BANNER.meta}</div>
        </div>
        <span className="s1c-bank-banner-ing-status">{BANK_BANNER.status}</span>
      </div>

      {/* KPIs */}
      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">En attente signature</div>
          <div className="kpi-value">
            {KPIS.aSigner.count} <span className="unit">{KPIS.aSigner.unit}</span>
          </div>
          <div className="kpi-meta">{KPIS.aSigner.meta}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">En conformité</div>
          <div className="kpi-value">
            {KPIS.enConformite.count} <span className="unit">{KPIS.enConformite.unit}</span>
          </div>
          <div className="kpi-meta">{KPIS.enConformite.meta}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Paiement reçu</div>
          <div className="kpi-value">
            {KPIS.paiement.recu}
            <span style={{ fontSize: "16px", color: "var(--navy-300)" }}> / {KPIS.paiement.total}</span>
          </div>
          <div className="kpi-meta">
            <strong>{KPIS.paiement.pct}</strong> ·{" "}
            <strong style={{ color: "var(--orange-text)" }}>{KPIS.paiement.attente}</strong>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Délai moyen</div>
          <div className="kpi-value">
            {KPIS.delai.value} <span className="unit">{KPIS.delai.unit}</span>
          </div>
          <div className="kpi-meta">{KPIS.delai.meta}</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-wrap">
              <IconSearch />
              <input className="search-input" placeholder="Rechercher..." />
            </div>
          </div>
          <div className="table-toolbar-right">
            <button className="btn btn-ghost btn-sm" type="button" disabled title="En cours de construction">
              Filtres
            </button>
            <button className="btn btn-ghost btn-sm" type="button" disabled title="En cours de construction">
              Exporter
            </button>
          </div>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Client</th>
              <th>Ingénieur</th>
              <th>Supervisé par</th>
              <th>Documents</th>
              <th>Paiement</th>
              <th>Statut global</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <ConformiteTableRow row={row} key={row.id} />
            ))}
            <tr className="pipe-more-row">
              <td colSpan={7}>
                … {TOTAL_DOSSIERS - ROWS.length} autres dossiers ·{" "}
                <Link href="/espace-ingenieur/conformite" className="pipe-more-link">
                  Voir l&apos;intégralité ({TOTAL_DOSSIERS})
                </Link>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="pipe-legend">
          <strong>3 documents par client :</strong> <strong>DER</strong> (Document
          d&apos;Entrée en Relation) · <strong>KYC</strong> (Know Your Customer ·
          questionnaire de qualification client intégré) · <strong>LM</strong>{" "}
          (Lettre de Mission). Sous-statut par doc :{" "}
          <span className="tone-navy">Envoyé</span> →{" "}
          <span className="tone-navy">Vu</span> →{" "}
          <span className="tone-green">Signé</span>.
        </div>
      </div>
    </div>
  );
}
