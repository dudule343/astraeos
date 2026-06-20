"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ProspectRow } from "../../_data/prospects";
import NouveauProspectModal from "./NouveauProspectModal";

/* Tableau « Mes prospects actifs » porté de page-ing-pipe-01 (maquette
 * ingénieur v28). Client Component : les lignes Aubert / Mercier / Joubert
 * sont cliquables (onclick="goToPage(...)" de la maquette -> router.push),
 * la barre d'outils porte la modale « Nouveau prospect ». Les autres lignes
 * restent statiques, exactement comme la maquette. */

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
      <span className="status-pill-v1" style={{ background: row.status.bg, color: row.status.color }}>
        {row.status.label}
      </span>
    );
  }
  return <span className={`status-pill-v1 ${row.status.tone}`}>{row.status.label}</span>;
}

export default function ProspectsTable({
  rows,
  reste,
}: {
  rows: ProspectRow[];
  reste: { count: number; total: number };
}) {
  const router = useRouter();

  return (
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
          <NouveauProspectModal />
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
          {rows.map((row, i) => {
            const clickable = Boolean(row.href);
            const rowClasses = [
              row.type === "personne-morale"
                ? "pipe-row-pm"
                : row.type === "couple" || row.type === "couple-pacs"
                  ? "pipe-row-couple"
                  : "",
              clickable ? "pipe-row-clickable" : "",
              row.highlight ? "pipe-row-highlight" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <tr
                key={`${row.names[0]}-${i}`}
                className={rowClasses}
                onClick={clickable ? () => router.push(row.href as string) : undefined}
              >
                <td>
                  {clickable ? (
                    <Link
                      href={row.href as string}
                      onClick={(e) => e.stopPropagation()}
                      style={{ textDecoration: "none" }}
                    >
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
                  <div className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    {clickable ? (
                      <Link
                        href={row.href as string}
                        className="action-btn"
                        title="Voir la fiche"
                      >
                        <IconEye />
                      </Link>
                    ) : (
                      <button className="action-btn" title="Voir la fiche">
                        <IconEye />
                      </button>
                    )}
                    <button className="action-btn" title="Éditer">
                      <IconEdit />
                    </button>
                    <button className="action-btn" title="Relancer">
                      <IconRelance />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          <tr className="dt-foot-row">
            <td colSpan={7}>
              … {reste.count} autres prospects ·{" "}
              <a>Voir l&#39;intégralité du pipeline ({reste.total})</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
