"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  KPIS,
  ROWS,
  TOTAL_DOSSIERS,
  type ConformiteRow,
  type DocStatus,
} from "../../_data/conformite";

type KpiFilter = "a-signer" | "signe-attente" | "paye";

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

function DocLine({ doc }: { doc: DocStatus }) {
  return (
    <span className="doc-status-line">
      <strong>{doc.code}</strong>{" "}
      <span className={`tone-${doc.tone}`}>
        {doc.text}
        {doc.em ? <em>{doc.em}</em> : null}
      </span>
    </span>
  );
}

function rowClassName(row: ConformiteRow): string {
  const classes: string[] = [];
  if (row.kind === "couple") classes.push("pipe-row-couple");
  if (row.kind === "personne-morale") classes.push("pipe-row-pm");
  if (row.highlighted) classes.push("pipe-row-highlight");
  if (row.ficheReady) classes.push("pipe-row-clickable");
  return classes.join(" ");
}

function ConformiteTableRow({ row }: { row: ConformiteRow }) {
  const router = useRouter();
  const ficheHref = `/espace-ingenieur/conformite/${row.id}`;

  return (
    <tr
      className={rowClassName(row)}
      onClick={row.ficheReady ? () => router.push(ficheHref) : undefined}
    >
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
      <td className="center" onClick={(e) => e.stopPropagation()}>
        <div className="actions-cell">
          {row.ficheReady ? (
            <Link href={ficheHref} className="action-btn" title="Ouvrir la fiche conformité">
              <IconEye />
            </Link>
          ) : (
            <button type="button" className="action-btn">
              <IconEye />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ConformiteInteractive() {
  const [filter, setFilter] = useState<KpiFilter | null>(null);
  const [query, setQuery] = useState("");

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROWS.filter((row) => {
      if (filter && row.dataStatus !== filter) return false;
      if (q && !row.names.join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  const toggleFilter = (next: KpiFilter) =>
    setFilter((current) => (current === next ? null : next));

  const exportCsv = () => {
    const headers = [
      "Client",
      "Type",
      "Ingénieur",
      "Supervisé par",
      "DER",
      "KYC",
      "LM",
      "Paiement",
      "Montant",
      "Statut global",
    ];
    const docText = (doc?: ConformiteRow["docs"][number]) =>
      doc ? `${doc.code} ${doc.text}${doc.em ?? ""}`.trim() : "";
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const lines = visibleRows.map((row) =>
      [
        row.names.join(" & "),
        row.legalRep ? `${row.typeLabel} · ${row.legalRep}` : row.typeLabel,
        row.cabinet.name,
        row.supervisor.name,
        docText(row.docs[0]),
        docText(row.docs[1]),
        docText(row.docs[2]),
        row.payment.label,
        row.payment.meta,
        row.status.label,
      ]
        .map(escape)
        .join(";"),
    );
    const csv = "﻿" + [headers.map(escape).join(";"), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conformite-en-cours.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* KPIs */}
      <div className="kpis kpis-4 mb-20">
        <div
          className={`kpi clickable${filter === "a-signer" ? " kpi-active" : ""}`}
          onClick={() => toggleFilter("a-signer")}
        >
          <div className="kpi-label">En attente signature</div>
          <div className="kpi-value">
            {KPIS.aSigner.count} <span className="unit">{KPIS.aSigner.unit}</span>
          </div>
          <div className="kpi-meta">{KPIS.aSigner.meta}</div>
        </div>
        <div
          className={`kpi clickable${filter === "signe-attente" ? " kpi-active" : ""}`}
          onClick={() => toggleFilter("signe-attente")}
        >
          <div className="kpi-label">En conformité</div>
          <div className="kpi-value">
            {KPIS.enConformite.count} <span className="unit">{KPIS.enConformite.unit}</span>
          </div>
          <div className="kpi-meta">{KPIS.enConformite.meta}</div>
        </div>
        <div
          className={`kpi clickable${filter === "paye" ? " kpi-active" : ""}`}
          onClick={() => toggleFilter("paye")}
        >
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
              <input
                className="search-input"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="table-toolbar-right">
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              disabled
              title="En cours"
            >
              Filtres
            </button>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={exportCsv}
            >
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
            {visibleRows.map((row) => (
              <ConformiteTableRow row={row} key={row.id} />
            ))}
            <tr className="pipe-more-row">
              <td colSpan={7}>
                … {TOTAL_DOSSIERS - ROWS.length} autres dossiers ·{" "}
                <button type="button" className="pipe-more-link" onClick={() => setFilter(null)}>
                  Voir l&apos;intégralité ({TOTAL_DOSSIERS})
                </button>
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
    </>
  );
}
