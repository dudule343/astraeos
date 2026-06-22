import Link from "next/link";

import {
  type CollecteFilterKey,
  type CollecteRow,
  filterCollecteRows,
  isCollecteFilter,
} from "../../_data/collectes";
import { getCollectesScreen } from "../../_data/collectes-server";
import "../../_styles/collectes.css";
import ProgressCell from "./ProgressCell";

export const metadata = {
  title: "ASTRAEOS · Collecte docs & infos",
};

export const dynamic = "force-dynamic";

const BASE = "/espace-ingenieur";

/**
 * Cible de l'action « œil/relance » : la fiche du client de la ligne. Les slugs
 * connus (cf. _data/clients) ouvrent la vraie fiche ; les autres retombent sur la
 * fiche modèle via getFicheClient (aucun 404), comme le reste de l'espace pipe.
 */
function clientFicheHref(row: CollecteRow): string {
  return `${BASE}/clients/${row.id}`;
}

/** Cible du constructeur de collecte (moteur conditionnel) pour le prospect. */
function constructeurHref(row: CollecteRow): string {
  return `${BASE}/collectes/${row.id}`;
}

/** href d'un filtre rapide : « tous » = URL nue, sinon ?filtre=clé. */
function filterHref(key: CollecteFilterKey): string {
  return key === "tous" ? `${BASE}/collectes` : `${BASE}/collectes?filtre=${key}`;
}

/** Routes réelles de l'espace ingénieur pour chaque étape du parcours. */
const STEPPER_ROUTES: Record<string, string> = {
  "ing-pipe-01": "/espace-ingenieur/prospects",
  "ing-pipe-02": "/espace-ingenieur/conformite",
  "ing-pipe-03": "/espace-ingenieur/collectes",
  "ing-pipe-04": "/espace-ingenieur/etudes",
  "ing-pipe-05": "/espace-ingenieur/etudes-restituees",
  "ing-pipe-06": "/espace-ingenieur/clients-suivi",
};

const STEP_ICONS: Record<string, React.ReactNode> = {
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

/** Picto œil, identique au symbole #i-eye de la maquette (viewBox + géométrie). */
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function RelanceIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function clientTypeClass(row: CollecteRow): string {
  if (row.clientType === "couple" || row.clientType === "couple-pacs") return "client-type couple";
  if (row.clientType === "personne-morale") return "client-type personne-morale";
  return "client-type";
}

function rowClass(row: CollecteRow): string | undefined {
  if (row.clientType === "couple") return "pipe-row-couple";
  if (row.clientType === "personne-morale") return "pipe-row-pm";
  return undefined;
}

/** Cellule client : 1 ou 2 lignes de nom + type. */
function ClientCell({ row }: { row: CollecteRow }) {
  const single = row.nameLines.length === 1 && !row.representant;
  return (
    <div className="client-cell">
      {single ? (
        <span className="client-name">{row.nameLines[0]}</span>
      ) : (
        row.nameLines.map((line, i) => (
          <span key={i} className={i === 0 && row.representant ? "client-name" : "client-name-line"}>
            {line}
          </span>
        ))
      )}
      {row.representant ? (
        <span
          className="client-name-line"
          style={{ fontSize: "10.5px", color: "var(--navy-300)", fontWeight: 500 }}
        >
          {row.representant}
        </span>
      ) : null}
      <span className={clientTypeClass(row)}>{row.clientTypeLabel}</span>
    </div>
  );
}

export default async function CollectesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const activeFilter: CollecteFilterKey = isCollecteFilter(filtre) ? filtre : "tous";
  const screen = await getCollectesScreen();
  const rows = filterCollecteRows(screen.rows, activeFilter);

  return (
    <div className="maquette-ing px-10 py-8">
      <div className="pipeline-stepper-v1">
        {screen.stepper.map((s) => (
          <Link
            key={s.step}
            href={STEPPER_ROUTES[s.page]}
            className={`stepper-item-v1${s.active ? " active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <div className="stepper-badge-v1" data-step={s.step}>
              {STEP_ICONS[s.step]}
            </div>
            <div className="stepper-label-v1">{s.label}</div>
            <div className="stepper-count-v1">{s.count}</div>
          </Link>
        ))}
      </div>

      <section className="hero-v1">
        <div>
          <div className="hero-eyebrow-v1">
            <span className="step-pill-v1">ÉTAPE 03</span> Parcours patrimonial
          </div>
          <h1 className="hero-title">
            Collecte <strong>docs &amp; infos</strong>
          </h1>
          <p className="hero-sub">
            Vos dossiers en collecte de pièces justificatives : justificatifs d&apos;identité,
            fiscalité, patrimoine, charges, projets. Espace client ouvert pour upload sécurisé.
          </p>
        </div>
        {rows[0] ? (
          <Link
            href={constructeurHref(rows[0])}
            className="rounded-md bg-[var(--gold)] px-4 py-2.5 text-[12.5px] font-bold text-white no-underline transition hover:brightness-110"
          >
            Envoyer une demande de collecte
          </Link>
        ) : null}
      </section>

      <div className="kpis kpis-4 mb-20">
        {screen.kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={k.valueColor ? { color: k.valueColor } : undefined}>
              {k.value}
              {k.unit ? <span className="unit"> {k.unit}</span> : null}
            </div>
            <div className="kpi-meta">{k.meta}</div>
          </div>
        ))}
      </div>

      <div className="qf-bar-v1">
        {screen.filters.map((f) => {
          const active = f.key === activeFilter;
          return (
            <Link
              key={f.key}
              href={filterHref(f.key)}
              scroll={false}
              aria-pressed={active}
              className={`qf-v1${active ? " active" : ""}${f.alert ? " alert" : ""}`}
            >
              {f.label} <span className="qf-count">{f.count}</span>
            </Link>
          );
        })}
      </div>

      <div className="table-wrap">
        <table className="dt">
          <thead>
            <tr>
              <th>Client</th>
              <th>Ingénieur</th>
              <th>Supervisé par</th>
              <th>Date ouverture espace</th>
              <th>Complétion · cliquez pour voir docs</th>
              <th>Statut</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={rowClass(row)}
                style={row.highlightRow ? { background: "rgba(245,221,215,0.3)" } : undefined}
              >
                <td>
                  <Link
                    href={constructeurHref(row)}
                    className="block no-underline"
                    title="Ouvrir le constructeur de collecte"
                  >
                    <ClientCell row={row} />
                  </Link>
                </td>
                <td>
                  <div className="cabinet-cell">
                    <span className="name">{row.cabinetName}</span>
                    <span className="city">{row.cabinetCity}</span>
                  </div>
                </td>
                <td>
                  <div className="ingenieur-cell">
                    <div className="ingenieur-avatar">{row.superviseurInitials}</div>
                    <span className="ingenieur-name">{row.superviseurName}</span>
                  </div>
                </td>
                <td className="nowrap">
                  <div className={`date-cell${row.openingAlert ? " alert" : ""}`}>{row.openingDate}</div>
                  <div
                    className="date-cell-meta"
                    style={row.openingAlert ? { color: "var(--red-text)", fontWeight: 600 } : undefined}
                  >
                    {row.openingMeta}
                  </div>
                </td>
                <ProgressCell row={row} />
                <td>
                  <span className={`status-pill-v1 ${row.status}`}>{row.statusLabel}</span>
                </td>
                <td className="center">
                  <div className="actions-cell">
                    <Link
                      href={clientFicheHref(row)}
                      className="action-btn"
                      title={
                        row.action === "relance"
                          ? "Relancer le client"
                          : "Voir la fiche client"
                      }
                    >
                      {row.action === "relance" ? <RelanceIcon /> : <EyeIcon />}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {screen.footnote ? (
              <tr className="dt-footnote">
                <td colSpan={7}>{screen.footnote}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
