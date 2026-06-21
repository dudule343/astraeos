"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { ProspectRow } from "../../_data/prospects";
import { sendProspectDoc } from "./[id]/actions";
import NouveauProspectModal from "./NouveauProspectModal";

/* Tableau « Mes prospects actifs » porté de page-ing-pipe-01 (maquette
 * ingénieur v28). Client Component : recherche, filtres rapides, lignes
 * cliquables, et actions de ligne (voir / éditer / relancer) toutes branchées
 * sur du réel (router.push vers la fiche, Server Action de relance + toast). */

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

/* Slug déterministe à partir du premier nom : la route /prospects/[id] sert la
 * fiche de référence quel que soit le slug, donc chaque ligne peut ouvrir une
 * fiche réelle même quand la maquette ne fournit pas de href dédié. */
function slugFor(row: ProspectRow): string {
  if (row.href) return row.href;
  const base = row.names[0]
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `/espace-ingenieur/prospects/${base || "prospect"}`;
}

/* Mapping label de filtre rapide → prédicat sur une ligne. « Tous » et les
 * filtres dont le critère n'est pas dérivable des données portées ne filtrent
 * pas la liste (ils restent sélectionnables et mettent à jour le compteur
 * visuel), exactement comme une vue par défaut. */
function filterPredicate(label: string): ((row: ProspectRow) => boolean) | null {
  switch (label) {
    case "Sans documents envoyés":
      return (r) => r.documents.date === "—";
    case "À relancer":
      return (r) => r.status.label.toLowerCase().includes("relanc");
    default:
      return null;
  }
}

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

type QuickFilter = { label: string; count: number; active?: boolean; alert?: boolean };
type SortKey = "rencontre" | "nom";

export default function ProspectsTable({
  rows,
  reste,
  quickFilters,
}: {
  rows: ProspectRow[];
  reste: { count: number; total: number };
  quickFilters: QuickFilter[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>(
    quickFilters.find((q) => q.active)?.label ?? "Tous",
  );
  const [sortKey, setSortKey] = useState<SortKey>("rencontre");
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const predicate = filterPredicate(activeFilter);
    let result = rows.filter((row) => {
      if (predicate && !predicate(row)) return false;
      if (!q) return true;
      const haystack = [
        ...row.names,
        row.cabinet.name,
        row.ingenieur?.name ?? "",
        row.typeLabel,
        row.status.label,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    result = [...result].sort((a, b) => {
      if (sortKey === "nom") return a.names[0].localeCompare(b.names[0], "fr");
      // « Date 1re rencontre » : on trie sur la date JJ/MM/AAAA portée.
      const toTime = (d: string) => {
        const m = d.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : 0;
      };
      return toTime(b.rencontre.date) - toTime(a.rencontre.date);
    });

    return result;
  }, [rows, query, activeFilter, sortKey]);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4500);
  };

  const relancer = async (row: ProspectRow) => {
    const key = `${row.names[0]}`;
    setBusy(key);
    try {
      const slug = slugFor(row).split("/").pop() ?? "prospect";
      const res = await sendProspectDoc(slug, null);
      flash(res.message);
    } finally {
      setBusy(null);
    }
  };

  const exporter = () => {
    const header = ["Prospect", "Ingénieur", "Supervisé par", "1re rencontre", "Documents", "Statut"];
    const lines = visibleRows.map((r) =>
      [
        r.names.join(" & "),
        r.cabinet.name,
        r.ingenieur?.name ?? "—",
        r.rencontre.date,
        r.documents.date,
        r.status.label,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(";"),
    );
    const csv = [header.join(";"), ...lines].join("\r\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prospects-actifs.csv";
    a.click();
    URL.revokeObjectURL(url);
    flash(`${visibleRows.length} prospect(s) exporté(s) au format CSV.`);
  };

  return (
    <div className="table-wrap">
      <div className="qf-bar-v1">
        {quickFilters.map((qf) => {
          const isActive = qf.label === activeFilter;
          return (
            <button
              key={qf.label}
              type="button"
              className={`qf-v1 ${isActive ? "active" : ""} ${qf.alert ? "alert" : ""}`}
              onClick={() => {
                setActiveFilter(qf.label);
                setShowAll(false);
              }}
            >
              {qf.label} <span className="qf-count">{qf.count}</span>
            </button>
          );
        })}
      </div>

      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <div className="search-wrap">
            <IconSearch />
            <input
              className="search-input"
              placeholder="Rechercher un prospect, un ingénieur, un superviseur…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="table-toolbar-right">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSortKey((k) => (k === "rencontre" ? "nom" : "rencontre"))}
          >
            Trier par : {sortKey === "rencontre" ? <>Date 1<sup>re</sup> rencontre</> : "Nom"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={exporter}>
            Exporter
          </button>
          <NouveauProspectModal onCreated={flash} />
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
          {visibleRows.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "26px", color: "var(--navy-300)" }}>
                Aucun prospect ne correspond à votre recherche.
              </td>
            </tr>
          ) : (
            visibleRows.map((row, i) => {
              const fiche = slugFor(row);
              const rowClasses = [
                row.type === "personne-morale"
                  ? "pipe-row-pm"
                  : row.type === "couple" || row.type === "couple-pacs"
                    ? "pipe-row-couple"
                    : "",
                "pipe-row-clickable",
                row.highlight ? "pipe-row-highlight" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <tr
                  key={`${row.names[0]}-${i}`}
                  className={rowClasses}
                  onClick={() => router.push(fiche)}
                >
                  <td>
                    <Link
                      href={fiche}
                      onClick={(e) => e.stopPropagation()}
                      style={{ textDecoration: "none" }}
                    >
                      <ClientCell row={row} />
                    </Link>
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
                      <Link href={fiche} className="action-btn" title="Voir la fiche">
                        <IconEye />
                      </Link>
                      <Link href={fiche} className="action-btn" title="Éditer la fiche">
                        <IconEdit />
                      </Link>
                      <button
                        type="button"
                        className="action-btn"
                        title="Relancer le prospect"
                        disabled={busy === row.names[0]}
                        onClick={() => relancer(row)}
                      >
                        <IconRelance />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
          {!query && activeFilter === "Tous" && !showAll && (
            <tr className="dt-foot-row">
              <td colSpan={7}>
                … {reste.count} autres prospects ·{" "}
                <button
                  type="button"
                  className="dt-foot-link"
                  onClick={() => {
                    setShowAll(true);
                    flash(
                      `Vue complète : ${rows.length} prospects chargés sur ${reste.total}. La pagination du pipeline complet n'est pas encore disponible.`,
                    );
                  }}
                >
                  Voir l&#39;intégralité du pipeline ({reste.total})
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {toast ? (
        <div className="rdv-toast" role="status">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      ) : null}
    </div>
  );
}
