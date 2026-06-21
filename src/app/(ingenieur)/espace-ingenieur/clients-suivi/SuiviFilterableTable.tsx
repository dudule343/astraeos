"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  suiviRowMatchesFilter,
  type SuiviFilter,
  type SuiviFilterKey,
  type SuiviRow,
} from "../../_data/clients-suivi";

/* Barre de filtres rapides + tableau « Clients en suivi », rendus côté client.
 * Les pastilles de la maquette (qf-v1) étaient inertes ; elles pilotent
 * désormais réellement le filtrage du tableau via suiviRowMatchesFilter
 * (source unique de la logique, dans _data). Le rendu d'une ligne est
 * identique à la maquette d'origine. */

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

function StatusBadge({ row }: { row: SuiviRow }) {
  switch (row.statusTone) {
    case "gold":
      return <span className="badge badge-gold">{row.statusLabel}</span>;
    case "orange":
      return <span className="badge badge-orange">{row.statusLabel}</span>;
    default:
      return <span className="badge badge-success">{row.statusLabel}</span>;
  }
}

function SuiviTableRow({ row }: { row: SuiviRow }) {
  const rowClass = row.rowVariant ? `pipe-row-${row.rowVariant}` : undefined;
  const isCouple = row.clientNames.length > 1;
  return (
    <tr
      className={rowClass}
      style={row.rowHighlight ? { background: row.rowHighlight } : undefined}
    >
      <td>
        <div className="client-cell">
          {isCouple ? (
            row.clientNames.map((n) => (
              <span key={n} className="client-name-line">
                {n}
              </span>
            ))
          ) : (
            <span className="client-name">{row.clientNames[0]}</span>
          )}
          <span
            className={`client-type${
              row.clientTypeStyle === "couple"
                ? " couple"
                : row.clientTypeStyle === "morale"
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
          <div className="ingenieur-avatar">{row.superviseInitials}</div>
          <span className="ingenieur-name">{row.superviseName}</span>
        </div>
      </td>
      <td className={`num cell-money${row.encoursGold ? " gold" : ""}`}>
        {row.encours}
      </td>
      <td className="nowrap">
        <div className={`date-cell${row.lastAlert ? " alert" : ""}`}>{row.lastDate}</div>
        <div className={`date-cell-meta${row.lastMetaAlert ? " alert" : ""}`}>{row.lastMeta}</div>
      </td>
      <td className="nowrap">
        <div className={`date-cell${row.nextDateMuted ? " muted" : ""}`}>{row.nextDate}</div>
        <div className={`date-cell-meta${row.nextMetaTone === "orange" ? " orange" : ""}`}>
          {row.nextMeta}
        </div>
      </td>
      <td>
        <div className={`precos-cell${row.preconisationsMuted ? " muted" : ""}`}>
          {row.preconisations.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      </td>
      <td>
        <StatusBadge row={row} />
      </td>
      <td className="center">
        <div className="actions-cell">
          <Link
            href={`/espace-ingenieur/clients/${row.id}`}
            className="action-btn"
            title="Consulter la fiche client"
          >
            {row.actionIcon === "alert" ? <AlertIcon /> : <EyeIcon />}
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default function SuiviFilterableTable({
  filters,
  rows,
  remaining,
}: {
  filters: SuiviFilter[];
  rows: SuiviRow[];
  remaining: { count: number; total: number };
}) {
  const initial =
    filters.find((f) => f.active)?.key ?? filters[0]?.key ?? "all";
  const [activeKey, setActiveKey] = useState<SuiviFilterKey>(initial);

  const visibleRows = useMemo(
    () => rows.filter((row) => suiviRowMatchesFilter(row, activeKey)),
    [rows, activeKey],
  );

  return (
    <>
      <div className="qf-bar-v1">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`qf-v1${f.key === activeKey ? " active" : ""}${f.alert ? " alert" : ""}`}
            type="button"
            aria-pressed={f.key === activeKey}
            onClick={() => setActiveKey(f.key)}
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
              <th>Supervisé par</th>
              <th className="num">Encours du client</th>
              <th>Dernier rendez-vous</th>
              <th>Prochaine entrevue</th>
              <th>Préconisations réalisées</th>
              <th>Statut du client</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => <SuiviTableRow key={row.id} row={row} />)
            ) : (
              <tr className="dt-more-row">
                <td colSpan={9}>Aucun client ne correspond à ce filtre.</td>
              </tr>
            )}
            {activeKey === "all" && (
              <tr className="dt-more-row">
                <td colSpan={9}>
                  … {remaining.count} autres clients en suivi ·{" "}
                  <Link href="/espace-ingenieur/clients">
                    Voir l&apos;intégralité ({remaining.total})
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
