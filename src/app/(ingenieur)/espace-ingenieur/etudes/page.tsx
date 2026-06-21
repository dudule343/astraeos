import Link from "next/link";

import {
  pipelineSteps,
  isValidFilter,
  type PipelineStep,
  type EtudeRow,
  type FilterKey,
} from "../../_data/etudes";
import { fetchEtudesLive } from "../../_data/etudes-server";
import "../../_styles/etudes.css";

export const metadata = {
  title: "ASTRAEOS · Études en cours",
};

export const dynamic = "force-dynamic";

const BASE = "/espace-ingenieur/etudes";

/** href d'un filtre rapide : « toutes » = URL nue, sinon ?filtre=clé. */
function filterHref(key: FilterKey): string {
  return key === "toutes" ? BASE : `${BASE}?filtre=${key}`;
}

/** Icônes des badges du stepper, identiques à la maquette (une par étape). */
function StepIcon({ step }: { step: string }) {
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
      return (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
          <circle cx="16" cy="16" r="13" strokeWidth="0.7" opacity="0.4" strokeDasharray="0.8 1.8" />
          <circle cx="16" cy="16" r="10.5" strokeWidth="1.8" />
          <circle cx="16" cy="16" r="7" strokeWidth="1.4" />
          <circle cx="16" cy="16" r="3.5" strokeWidth="1.2" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l10 17H2L12 3z" />
      <path d="M12 10v4M12 17v.5" />
    </svg>
  );
}

function StepperItem({ step }: { step: PipelineStep }) {
  return (
    <Link
      href={step.href}
      className={`stepper-item-v1${step.active ? " active" : ""}`}
    >
      <div className="stepper-badge-v1" data-step={step.step}>
        <StepIcon step={step.step} />
      </div>
      <div className="stepper-label-v1">{step.label}</div>
      <div className="stepper-count-v1">{step.count}</div>
    </Link>
  );
}

function EtudeTableRow({ row }: { row: EtudeRow }) {
  const rowClass = row.rowVariant
    ? `pipe-row-${row.rowVariant}`
    : undefined;
  return (
    <tr
      className={rowClass}
      style={row.rowHighlight ? { background: row.rowHighlight } : undefined}
    >
      <td>
        <div className="client-cell">
          {row.clientNames.length > 1 ? (
            row.clientNames.map((n) => (
              <span key={n} className="client-name-line">
                {n}
              </span>
            ))
          ) : (
            <span className="client-name">{row.clientNames[0]}</span>
          )}
          {row.representant ? (
            <span
              className="client-name-line"
              style={{ fontSize: "10.5px", color: "var(--navy-300)", fontWeight: 500 }}
            >
              {row.representant}
            </span>
          ) : null}
          <span
            className={`client-type${
              row.clientType === "Couple"
                ? " couple"
                : row.clientType === "Personne morale"
                  ? " personne-morale"
                  : ""
            }`}
          >
            {row.clientType}
          </span>
        </div>
      </td>
      <td>
        <div className="cabinet-cell">
          <span className="name">{row.cabinetName}</span>
          <span className="city">{row.cabinetMeta}</span>
        </div>
      </td>
      <td>
        <div className="ingenieur-cell">
          <div className="ingenieur-avatar">{row.patrimonialInitials}</div>
          <span className="ingenieur-name">{row.patrimonialName}</span>
        </div>
      </td>
      <td>
        <span className={`study-type ${row.studyType}`}>{row.studyLabel}</span>
      </td>
      <td className="nowrap">
        <div className="date-cell">{row.startDate}</div>
      </td>
      <td className="nowrap">
        <div className={`date-cell${row.restitAlert ? " alert" : ""}`}>{row.restitDate}</div>
        <div
          className="date-cell-meta"
          style={
            row.restitMetaAlert
              ? { color: "var(--red-text)", fontWeight: 600 }
              : undefined
          }
        >
          {row.restitMeta}
        </div>
      </td>
      <td>
        <div className="progress-cell">
          <div className="progress-bar">
            <div
              className={`progress-bar-fill${row.progressAlert ? " alert" : ""}`}
              style={{ width: `${row.progressPct}%` }}
            />
          </div>
          <div className="progress-text">
            <span>{row.progressLabel}</span>
            <span className="pct">{row.progressPct} %</span>
          </div>
        </div>
      </td>
      <td className="center">
        <div className="actions-cell">
          <Link
            href={`/espace-ingenieur/dossiers/${row.id}`}
            className="action-btn"
            title="Consulter le dossier"
          >
            {row.actionIcon === "alert" ? <AlertIcon /> : <EyeIcon />}
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default async function EtudesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const filter: FilterKey = isValidFilter(filtre) ? filtre : "toutes";
  const { filters, rows, remaining, kpis } = await fetchEtudesLive(filter);

  return (
    <div className="etudes-page-wrap">
      <div className="pipeline-stepper-v1">
        {pipelineSteps.map((step) => (
          <StepperItem key={step.step} step={step} />
        ))}
      </div>

      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 04</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">
            Mes études <strong>en cours</strong>
          </h1>
          <p className="hero-sub">
            Vos études patrimoniales en cours de réalisation. Suivi avancement,
            délai de restitution, type d&#39;accompagnement.
          </p>
        </div>
      </section>

      <div className="kpis kpis-4 mb-20">
        {kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div
              className="kpi-value"
              style={
                kpi.valueColor
                  ? { color: `var(--${kpi.valueColor}-text)` }
                  : undefined
              }
            >
              {kpi.value}
              {kpi.unit ? <span className="unit"> {kpi.unit}</span> : null}
            </div>
            <div className="kpi-meta">{kpi.meta}</div>
          </div>
        ))}
      </div>

      <div className="qf-bar-v1">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={filterHref(f.key)}
            scroll={false}
            aria-pressed={f.active}
            className={`qf-v1${f.active ? " active" : ""}${f.alert ? " alert" : ""}`}
          >
            {f.label} <span className="qf-count">{f.count}</span>
          </Link>
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
            {rows.length > 0 ? (
              rows.map((row) => <EtudeTableRow key={row.id} row={row} />)
            ) : (
              <tr className="dt-empty-row">
                <td colSpan={8}>Aucune étude pour ce filtre.</td>
              </tr>
            )}
            <tr className="dt-more-row">
              <td colSpan={8}>
                {remaining.count > 0 ? (
                  <>… {remaining.count} autres études en cours · </>
                ) : null}
                <Link href="/espace-ingenieur/dossiers">
                  Voir l&apos;intégralité ({remaining.total})
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
