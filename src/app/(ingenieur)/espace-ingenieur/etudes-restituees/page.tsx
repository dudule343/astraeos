import Link from "next/link";

import "../../_styles/maquette.css";
import "../../_styles/etudes-restituees.css";
import {
  fetchEtudesRestituees,
  isValidFilter,
  type EtudeRestituee,
  type FilterKey,
} from "../../_data/etudes-restituees";

export const dynamic = "force-dynamic";

const BASE = "/espace-ingenieur";

/** Pictos du stepper, copiés tels quels depuis la maquette (par numéro d'étape). */
const STEP_ICONS: Record<string, React.ReactNode> = {
  "01": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
      <circle cx="13" cy="13" r="8.5" strokeWidth={1.8} />
      <circle cx="13" cy="13" r="5.5" strokeWidth={0.9} opacity={0.5} strokeDasharray="1 1.5" />
      <path d="M13 8.5 L 14 11.5 L 17 12 L 14.5 14 L 15 17 L 13 15.5 L 11 17 L 11.5 14 L 9 12 L 12 11.5 Z" fill="currentColor" stroke="none" />
      <line x1="19.2" y1="19.2" x2="25" y2="25" strokeWidth={2.2} />
      <circle cx="25" cy="25" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  "02": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M16 3 L 6 6 L 6 15 C 6 21 11 26 16 28 C 21 26 26 21 26 15 L 26 6 Z" strokeWidth={1.8} />
      <path d="M16 6 L 9 8 L 9 15 C 9 19.5 12.5 23 16 24.5 C 19.5 23 23 19.5 23 15 L 23 8 Z" strokeWidth={0.8} opacity={0.5} strokeDasharray="1.5 1.5" />
      <polyline points="11.5 15.5 14.5 18.5 20.5 12" strokeWidth={2.4} />
      <circle cx="16" cy="5" r="0.9" fill="currentColor" />
      <circle cx="11" cy="9" r="0.6" fill="currentColor" />
      <circle cx="21" cy="9" r="0.6" fill="currentColor" />
    </svg>
  ),
  "03": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M4 9 L 13 9 L 15.5 12 L 28 12 L 28 25 C 28 26 27 27 26 27 L 6 27 C 5 27 4 26 4 25 Z" strokeWidth={1.8} />
      <line x1="4" y1="14" x2="28" y2="14" strokeWidth={0.8} opacity={0.5} />
      <rect x="11" y="6" width="10" height="12" rx="0.8" fill="white" strokeWidth={1.5} />
      <line x1="13" y1="9" x2="19" y2="9" strokeWidth={1} />
      <line x1="13" y1="11.5" x2="19" y2="11.5" strokeWidth={1} />
      <line x1="13" y1="14" x2="17" y2="14" strokeWidth={1} />
    </svg>
  ),
  "04": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <rect x="3" y="3" width="26" height="26" rx="2" strokeWidth={1.8} />
      <line x1="6" y1="11" x2="26" y2="11" strokeWidth={0.6} opacity={0.4} />
      <line x1="6" y1="17" x2="26" y2="17" strokeWidth={0.6} opacity={0.4} />
      <line x1="6" y1="23" x2="26" y2="23" strokeWidth={0.6} opacity={0.4} />
      <polyline points="6 22 11 17 14 19 18 13 22 14 26 8" strokeWidth={2} />
      <circle cx="11" cy="17" r="1.6" fill="currentColor" />
      <circle cx="14" cy="19" r="1.6" fill="currentColor" />
      <circle cx="18" cy="13" r="1.6" fill="currentColor" />
      <circle cx="22" cy="14" r="1.6" fill="currentColor" />
      <circle cx="26" cy="8" r="2" fill="currentColor" />
    </svg>
  ),
  "05": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M7 4 L 19 4 L 25 10 L 25 28 L 7 28 Z" strokeWidth={1.8} />
      <polyline points="19 4 19 10 25 10" strokeWidth={1.5} />
      <line x1="11" y1="14" x2="21" y2="14" strokeWidth={0.9} opacity={0.7} />
      <line x1="11" y1="17" x2="21" y2="17" strokeWidth={0.9} opacity={0.7} />
      <line x1="11" y1="20" x2="17" y2="20" strokeWidth={0.9} opacity={0.7} />
      <circle cx="22" cy="24" r="4.2" fill="white" strokeWidth={1.6} />
      <polyline points="20 24 21.5 25.5 24 22.5" strokeWidth={1.8} />
    </svg>
  ),
  "06": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
      <circle cx="16" cy="16" r="13" strokeWidth={0.7} opacity={0.4} strokeDasharray="0.8 1.8" />
      <circle cx="16" cy="16" r="10.5" strokeWidth={1.8} />
      <circle cx="16" cy="16" r="7" strokeWidth={1.4} />
      <circle cx="16" cy="16" r="3.5" strokeWidth={1.2} />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

function ClientCell({ row }: { row: EtudeRestituee }) {
  const typeClass =
    row.clientType === "couple"
      ? "client-type couple"
      : row.clientType === "morale"
        ? "client-type personne-morale"
        : "client-type";
  return (
    <div className="client-cell">
      {row.clientLines.length > 1 ? (
        row.clientLines.map((line) => (
          <span key={line} className="client-name-line">
            {line}
          </span>
        ))
      ) : (
        <span className="client-name">{row.clientLines[0]}</span>
      )}
      {row.clientRepr ? (
        <span
          className="client-name-line"
          style={{ fontSize: "10.5px", color: "var(--navy-300)", fontWeight: 500 }}
        >
          {row.clientRepr}
        </span>
      ) : null}
      <span className={typeClass}>{row.clientTypeLabel}</span>
    </div>
  );
}

/** Construit le href d'un filtre rapide : "toutes" = URL nue, sinon ?filtre=clé. */
function filterHref(key: FilterKey): string {
  return key === "toutes"
    ? `${BASE}/etudes-restituees`
    : `${BASE}/etudes-restituees?filtre=${key}`;
}

export default async function EtudesRestitueesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const filter: FilterKey = isValidFilter(filtre) ? filtre : "toutes";
  const data = await fetchEtudesRestituees(filter);

  return (
    <div className="maquette-ing px-10 py-8">
      {/* STEPPER PIPELINE 6 ÉTAPES */}
      <div className="pipeline-stepper-v1">
        {data.steps.map((step) => (
          <Link
            key={step.num}
            href={`${BASE}/${step.page}`}
            className={`stepper-item-v1 ${step.active ? "active" : ""}`}
          >
            <div className="stepper-badge-v1" data-step={step.num}>
              {STEP_ICONS[step.num]}
            </div>
            <div className="stepper-label-v1">{step.label}</div>
            <div className="stepper-count-v1">{step.count}</div>
          </Link>
        ))}
      </div>

      {/* HERO */}
      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 05</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">
            Études <strong>restituées</strong>
          </h1>
          <p className="hero-sub">
            Vos études patrimoniales restituées aux clients. Suivi de la suite à
            donner (signature de placements, missions complémentaires, abandon)
            et de la satisfaction client.
          </p>
        </div>
      </section>

      {/* KPIs */}
      <div className="kpis kpis-4 mb-20">
        {data.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className={`kpi-value${kpi.tone === "gold" ? " gold" : ""}`}>
              {kpi.value}
              {kpi.unit ? <span className="unit"> {kpi.unit}</span> : null}
            </div>
            <div className="kpi-meta">
              {kpi.label === "Avis Trustpilot reçus" ? (
                <>
                  <strong>79 %</strong> de retour client
                </>
              ) : (
                kpi.meta
              )}
            </div>
          </div>
        ))}
      </div>

      {/* QUICK FILTERS — filtrage réel par query param (Server Component) */}
      <div className="qf-bar-v1">
        {data.filters.map((f) => (
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

      {/* TABLE */}
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
            {data.rows.map((row, i) => {
              const rowClass =
                row.clientType === "couple"
                  ? "pipe-row-couple"
                  : row.clientType === "morale"
                    ? "pipe-row-pm"
                    : undefined;
              return (
                <tr key={`${row.clientLines[0]}-${i}`} className={rowClass}>
                  <td>
                    <ClientCell row={row} />
                  </td>
                  <td>
                    <div className="cabinet-cell">
                      <span className="name">{row.cabinetName}</span>
                      <span className="city">{row.cabinetCity}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ingenieur-cell">
                      <div className="ingenieur-avatar">{row.ingenieurInitials}</div>
                      <span className="ingenieur-name">{row.ingenieurName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`study-type ${row.studyTone}`}>
                      {row.studyLabel}
                    </span>
                  </td>
                  <td>
                    <span
                      className="trustpilot-stars"
                      style={{ color: "#00B67A", fontWeight: 700, whiteSpace: "nowrap" }}
                    >
                      {row.trustpilot}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill-v1 ${row.suiteTone}`}>
                      {row.suiteLabel}
                    </span>
                    {row.suiteDetail ? (
                      <div className="suite-detail">{row.suiteDetail}</div>
                    ) : null}
                  </td>
                  <td className="nowrap">
                    {row.nextDate ? (
                      <>
                        <div className="date-cell">{row.nextDate}</div>
                        <div className="date-cell-meta">{row.nextMeta}</div>
                      </>
                    ) : (
                      <div style={{ color: "var(--navy-300)" }}>—</div>
                    )}
                  </td>
                  <td className="center">
                    <div className="actions-cell">
                      <Link
                        href={`${BASE}/clients`}
                        className="action-btn"
                        title="Voir la fiche client"
                      >
                        <EyeIcon />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
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
                {data.moreCount > 0 ? (
                  <>… {data.moreCount} autres études restituées · </>
                ) : null}
                <Link href={`${BASE}/clients-suivi`} className="dt-more-link">
                  Voir l&apos;intégralité ({data.totalCount})
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="pipe-legend">
          <strong style={{ color: "var(--navy)" }}>
            Statuts possibles « Suite à donner » :
          </strong>{" "}
          <span style={{ color: "var(--green-text)" }}>
            Investissements validés client
          </span>{" "}
          · <span style={{ color: "var(--gold)" }}>Validation client investissement immobilier</span>{" "}
          · <span style={{ color: "var(--gold)" }}>Validation client investissement financier</span>{" "}
          · <span style={{ color: "var(--gold)" }}>Validation client immatriculation société</span>{" "}
          · <span style={{ color: "var(--orange-text)" }}>Client en cours de réflexion</span>{" "}
          · <span style={{ color: "var(--red-text)" }}>Refus des propositions</span>. La{" "}
          <strong>date du prochain entretien</strong> oblige l&apos;ingénieur à
          prévoir un rendez-vous de mise en place.
        </div>
      </div>
    </div>
  );
}
