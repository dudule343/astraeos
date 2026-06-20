import Link from "next/link";

import { fetchProspectsView, type ProspectRow } from "../../_data/prospects";
import "../../_styles/prospects.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Mes prospects actifs",
};

/* SVG des badges du stepper, portés tels quels depuis la maquette (un par étape). */
const STEPPER_ICONS: Record<string, React.ReactNode> = {
  "01": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
      <circle cx="13" cy="13" r="8.5" strokeWidth="1.8" />
      <circle cx="13" cy="13" r="5.5" strokeWidth="0.9" opacity="0.5" strokeDasharray="1 1.5" />
      <path d="M13 8.5 L 14 11.5 L 17 12 L 14.5 14 L 15 17 L 13 15.5 L 11 17 L 11.5 14 L 9 12 L 12 11.5 Z" fill="currentColor" stroke="none" />
      <line x1="19.2" y1="19.2" x2="25" y2="25" strokeWidth="2.2" />
      <circle cx="25" cy="25" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  "02": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M16 3 L 6 6 L 6 15 C 6 21 11 26 16 28 C 21 26 26 21 26 15 L 26 6 Z" strokeWidth="1.8" />
      <path d="M16 6 L 9 8 L 9 15 C 9 19.5 12.5 23 16 24.5 C 19.5 23 23 19.5 23 15 L 23 8 Z" strokeWidth="0.8" opacity="0.5" strokeDasharray="1.5 1.5" />
      <polyline points="11.5 15.5 14.5 18.5 20.5 12" strokeWidth="2.4" />
      <circle cx="16" cy="5" r="0.9" fill="currentColor" />
      <circle cx="11" cy="9" r="0.6" fill="currentColor" />
      <circle cx="21" cy="9" r="0.6" fill="currentColor" />
    </svg>
  ),
  "03": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M4 9 L 13 9 L 15.5 12 L 28 12 L 28 25 C 28 26 27 27 26 27 L 6 27 C 5 27 4 26 4 25 Z" strokeWidth="1.8" />
      <line x1="4" y1="14" x2="28" y2="14" strokeWidth="0.8" opacity="0.5" />
      <rect x="11" y="6" width="10" height="12" rx="0.8" fill="white" strokeWidth="1.5" />
      <line x1="13" y1="9" x2="19" y2="9" strokeWidth="1" />
      <line x1="13" y1="11.5" x2="19" y2="11.5" strokeWidth="1" />
      <line x1="13" y1="14" x2="17" y2="14" strokeWidth="1" />
    </svg>
  ),
  "04": (
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
  "05": (
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
  "06": (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
      <circle cx="16" cy="16" r="13" strokeWidth="0.7" opacity="0.4" strokeDasharray="0.8 1.8" />
      <circle cx="16" cy="16" r="10.5" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="7" strokeWidth="1.4" />
      <circle cx="16" cy="16" r="3.5" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.5-4.5" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const IconRelance = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

function ClientCell({ row }: { row: ProspectRow }) {
  if (row.type === "personne-morale") {
    return (
      <div className="client-cell">
        <span className="client-name">{row.names[0]}</span>
        {row.pmMention && (
          <span
            className="client-name-line"
            style={{ fontSize: "10.5px", color: "var(--navy-300)", fontWeight: 500 }}
          >
            {row.pmMention}
          </span>
        )}
        <span className="client-type personne-morale">{row.typeLabel}</span>
      </div>
    );
  }
  if (row.names.length > 1) {
    return (
      <div className="client-cell">
        {row.names.map((n) => (
          <span key={n} className="client-name-line">
            {n}
          </span>
        ))}
        <span className="client-type couple">{row.typeLabel}</span>
      </div>
    );
  }
  return (
    <div className="client-cell">
      <span className="client-name">{row.names[0]}</span>
      <span className="client-type">{row.typeLabel}</span>
    </div>
  );
}

function StatusPill({ row }: { row: ProspectRow }) {
  if (row.status.kind === "custom") {
    return (
      <span
        className="status-pill-v1"
        style={{ background: row.status.bg, color: row.status.color }}
      >
        {row.status.label}
      </span>
    );
  }
  return <span className={`status-pill-v1 ${row.status.tone}`}>{row.status.label}</span>;
}

export default async function MesProspectsActifs() {
  const view = await fetchProspectsView();
  const { kpis } = view;

  return (
    <div className="pipe-page-wrap">
      {/* STEPPER V1 */}
      <div className="pipeline-stepper-v1">
        {view.stepper.map((s) => (
          <Link
            key={s.step}
            href={s.href}
            className={`stepper-item-v1 ${s.active ? "active" : ""}`}
          >
            <div className="stepper-badge-v1" data-step={s.step}>
              {STEPPER_ICONS[s.step]}
            </div>
            <div className="stepper-label-v1">{s.label}</div>
            <div className="stepper-count-v1">{s.count}</div>
          </Link>
        ))}
      </div>

      {/* HERO V1 */}
      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 01</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">
            Mes <strong>prospects</strong> actifs
          </h1>
          <p className="hero-sub">
            Liste des prospects que vous avez identifiés. Pour chaque prospect, la date du 1er
            contact, l&#39;état d&#39;envoi des documents d&#39;entrée en relation et l&#39;étape de
            votre parcours patrimonial.
          </p>
        </div>
      </section>

      {/* KPIs */}
      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Prospects actifs</div>
          <div className="kpi-value">{kpis.actifs.value}</div>
          <div className="kpi-meta">
            <strong>+ 5</strong> {kpis.actifs.meta}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Convertis cette semaine</div>
          <div className="kpi-value">{kpis.convertis.value}</div>
          <div className="kpi-meta">{kpis.convertis.meta}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Documents envoyés</div>
          <div className="kpi-value">
            {kpis.documents.value}
            <span className="frac"> / {kpis.documents.total}</span>
          </div>
          <div className="kpi-meta">
            <strong>79 %</strong> {kpis.documents.meta}
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Délai moyen avant conformité</div>
          <div className="kpi-value">
            {kpis.delai.value} <span className="unit">{kpis.delai.unit}</span>
          </div>
          <div className="kpi-meta">{kpis.delai.meta}</div>
        </div>
      </div>

      {/* Quick filters */}
      <div className="qf-bar-v1">
        {view.quickFilters.map((qf) => (
          <button
            key={qf.label}
            className={`qf-v1 ${qf.active ? "active" : ""} ${qf.alert ? "alert" : ""}`}
          >
            {qf.label} <span className="qf-count">{qf.count}</span>
          </button>
        ))}
      </div>

      {/* Tableau prospects */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-wrap">
              <IconSearch />
              <input
                className="search-input"
                placeholder="Rechercher un prospect, un ingénieur, un superviseur…"
              />
            </div>
          </div>
          <div className="table-toolbar-right">
            <button className="btn btn-ghost btn-sm" disabled title="En cours">
              Filtres avancés
            </button>
            <button className="btn btn-ghost btn-sm" disabled title="En cours">
              Trier par : Date 1<sup>re</sup> rencontre
            </button>
            <button className="btn btn-ghost btn-sm" disabled title="En cours">
              Exporter
            </button>
            <button className="btn btn-sm btn-nouveau-prospect" disabled title="En cours">
              Nouveau prospect
            </button>
          </div>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Prospect</th>
              <th>Ingénieur</th>
              <th>Supervisé par</th>
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
            {view.rows.map((row, i) => {
              const rowClasses = [
                row.type === "personne-morale"
                  ? "pipe-row-pm"
                  : row.type === "couple" || row.type === "couple-pacs"
                    ? "pipe-row-couple"
                    : "",
                row.href ? "pipe-row-clickable" : "",
                row.highlight ? "pipe-row-highlight" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <tr key={`${row.names[0]}-${i}`} className={rowClasses}>
                  <td>
                    {row.href ? (
                      <Link href={row.href} style={{ textDecoration: "none" }}>
                        <ClientCell row={row} />
                      </Link>
                    ) : (
                      <ClientCell row={row} />
                    )}
                  </td>
                  <td>
                    <div className="cabinet-cell">
                      <span className="name">{row.cabinet.name}</span>
                      <span className="city">{row.cabinet.meta}</span>
                    </div>
                  </td>
                  <td>
                    {row.ingenieur ? (
                      <div className="ingenieur-cell">
                        <div className="ingenieur-avatar">{row.ingenieur.initials}</div>
                        <span className="ingenieur-name">{row.ingenieur.name}</span>
                      </div>
                    ) : (
                      <div className="ing-none">—</div>
                    )}
                  </td>
                  <td className="nowrap">
                    <div className="date-cell">{row.rencontre.date}</div>
                    <div className="date-cell-meta">{row.rencontre.meta}</div>
                  </td>
                  <td className="nowrap">
                    <div className="date-cell">{row.documents.date}</div>
                    <div className="date-cell-meta">{row.documents.meta}</div>
                  </td>
                  <td>
                    <StatusPill row={row} />
                  </td>
                  <td className="center">
                    <div className="actions-cell">
                      {row.href ? (
                        <Link href={row.href} className="action-btn" title="Voir la fiche">
                          <IconEye />
                        </Link>
                      ) : (
                        <button className="action-btn" disabled title="En cours">
                          <IconEye />
                        </button>
                      )}
                      <button className="action-btn" disabled title="En cours">
                        <IconEdit />
                      </button>
                      <button className="action-btn" disabled title="En cours">
                        <IconRelance />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className="dt-foot-row">
              <td colSpan={7}>
                … {view.reste.count} autres prospects ·{" "}
                <a>Voir l&#39;intégralité du pipeline ({view.reste.total})</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
