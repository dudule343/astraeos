"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  KPIS,
  type ConformiteRow,
  type DocStatus,
  type PayTone,
} from "../../_data/conformite";

type KpiFilter = "a-signer" | "signe-attente" | "paye";

type ConformiteInteractiveProps = {
  rows: ConformiteRow[];
  kpis: typeof KPIS;
  total: number;
  /**
   * En mode maquette (repli), la fiche détaillée n'existe que pour le dossier
   * de référence Joubert. En données réelles, chaque ligne porte un id de
   * dossier réel et ouvre sa propre fiche.
   */
  realData: boolean;
};

// Modèle de référence de la maquette : seule fiche détaillée disponible hors
// données réelles (les autres exemples ouvriraient un nom incohérent).
const FICHE_REFERENCE_ID = "joubert";

function hasFiche(row: ConformiteRow, realData: boolean): boolean {
  if (!row.ficheReady) return false;
  return realData || row.id === FICHE_REFERENCE_ID;
}

const PAY_FILTER_OPTIONS: { value: PayTone; label: string }[] = [
  { value: "attente", label: "En attente" },
  { value: "partiel", label: "Partiel" },
  { value: "recu", label: "Reçu" },
  { value: "offert", label: "Offert" },
];

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

function rowClassName(row: ConformiteRow, realData: boolean): string {
  const classes: string[] = [];
  if (row.kind === "couple") classes.push("pipe-row-couple");
  if (row.kind === "personne-morale") classes.push("pipe-row-pm");
  if (row.highlighted) classes.push("pipe-row-highlight");
  if (hasFiche(row, realData)) classes.push("pipe-row-clickable");
  return classes.join(" ");
}

function ConformiteTableRow({ row, realData }: { row: ConformiteRow; realData: boolean }) {
  const router = useRouter();
  const ficheHref = `/espace-ingenieur/conformite/${row.id}`;

  return (
    <tr
      className={rowClassName(row, realData)}
      onClick={hasFiche(row, realData) ? () => router.push(ficheHref) : undefined}
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
          {hasFiche(row, realData) ? (
            <Link href={ficheHref} className="action-btn" title="Ouvrir la fiche conformité">
              <IconEye />
            </Link>
          ) : (
            <button
              type="button"
              className="action-btn"
              disabled
              title={
                row.ficheReady
                  ? "Fiche conformité détaillée indisponible pour ce dossier"
                  : "Fiche conformité indisponible · documents non encore signés"
              }
            >
              <IconEye />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ConformiteInteractive({
  rows,
  kpis,
  total,
  realData,
}: ConformiteInteractiveProps) {
  const [filter, setFilter] = useState<KpiFilter | null>(null);
  const [query, setQuery] = useState("");
  const [payFilters, setPayFilters] = useState<PayTone[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Ferme le panneau de filtres au clic extérieur / touche Échap.
  useEffect(() => {
    if (!filterOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter && row.dataStatus !== filter) return false;
      if (payFilters.length > 0 && !payFilters.includes(row.payment.tone)) return false;
      if (q && !row.names.join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, payFilters, query, rows]);

  const toggleFilter = (next: KpiFilter) =>
    setFilter((current) => (current === next ? null : next));

  const togglePayFilter = (tone: PayTone) =>
    setPayFilters((current) =>
      current.includes(tone)
        ? current.filter((t) => t !== tone)
        : [...current, tone],
    );

  const hasActiveView =
    filter !== null || query.trim() !== "" || payFilters.length > 0;

  // « Voir l'intégralité » : retire tout filtre/recherche pour afficher
  // l'ensemble des dossiers chargés, plutôt que de promettre des lignes
  // inexistantes. En données réelles, total === rows.length (rien de caché).
  const showAll = () => {
    setFilter(null);
    setQuery("");
    setPayFilters([]);
  };

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
            {kpis.aSigner.count} <span className="unit">{kpis.aSigner.unit}</span>
          </div>
          <div className="kpi-meta">{kpis.aSigner.meta}</div>
        </div>
        <div
          className={`kpi clickable${filter === "signe-attente" ? " kpi-active" : ""}`}
          onClick={() => toggleFilter("signe-attente")}
        >
          <div className="kpi-label">En conformité</div>
          <div className="kpi-value">
            {kpis.enConformite.count} <span className="unit">{kpis.enConformite.unit}</span>
          </div>
          <div className="kpi-meta">{kpis.enConformite.meta}</div>
        </div>
        <div
          className={`kpi clickable${filter === "paye" ? " kpi-active" : ""}`}
          onClick={() => toggleFilter("paye")}
        >
          <div className="kpi-label">Paiement reçu</div>
          <div className="kpi-value">
            {kpis.paiement.recu}
            <span style={{ fontSize: "16px", color: "var(--navy-300)" }}> / {kpis.paiement.total}</span>
          </div>
          <div className="kpi-meta">
            <strong>{kpis.paiement.pct}</strong> ·{" "}
            <strong style={{ color: "var(--orange-text)" }}>{kpis.paiement.attente}</strong>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Délai moyen</div>
          <div className="kpi-value">
            {kpis.delai.value} <span className="unit">{kpis.delai.unit}</span>
          </div>
          <div className="kpi-meta">{kpis.delai.meta}</div>
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
            <div className="conf-filter-wrap" ref={filterRef}>
              <button
                className={`btn btn-ghost btn-sm${payFilters.length > 0 ? " conf-filter-active" : ""}`}
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                aria-expanded={filterOpen}
                aria-haspopup="true"
              >
                Filtres
                {payFilters.length > 0 ? (
                  <span className="conf-filter-count">{payFilters.length}</span>
                ) : null}
              </button>
              {filterOpen ? (
                <div className="conf-filter-pop" role="menu">
                  <div className="conf-filter-pop-title">Filtrer par paiement</div>
                  {PAY_FILTER_OPTIONS.map((opt) => (
                    <label className="conf-filter-opt" key={opt.value}>
                      <input
                        type="checkbox"
                        checked={payFilters.includes(opt.value)}
                        onChange={() => togglePayFilter(opt.value)}
                      />
                      <span className={`s1c-pay-pill ${opt.value}`}>{opt.label}</span>
                    </label>
                  ))}
                  {payFilters.length > 0 ? (
                    <button
                      type="button"
                      className="conf-filter-clear"
                      onClick={() => setPayFilters([])}
                    >
                      Réinitialiser
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
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
              <ConformiteTableRow row={row} key={row.id} realData={realData} />
            ))}
            {visibleRows.length === 0 ? (
              <tr className="conf-empty-row">
                <td colSpan={7}>Aucun dossier ne correspond à ces filtres.</td>
              </tr>
            ) : null}
            {total > rows.length ? (
              <tr className="pipe-more-row">
                <td colSpan={7}>
                  … {total - rows.length} autres dossiers ·{" "}
                  <button
                    type="button"
                    className="pipe-more-link"
                    onClick={showAll}
                    disabled={!hasActiveView}
                    title={
                      hasActiveView
                        ? "Afficher tous les dossiers chargés"
                        : `${rows.length} dossiers synchronisés sur ${total} · les autres arrivent depuis la banque`
                    }
                  >
                    Voir l&apos;intégralité ({total})
                  </button>
                </td>
              </tr>
            ) : null}
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
