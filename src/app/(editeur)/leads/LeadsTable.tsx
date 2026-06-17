"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LeadRow } from "./data";

const sourceClass = {
  success: "bg-[var(--green-bg)] text-[var(--green-text)]",
  info: "bg-[var(--light-blue)] text-[var(--navy)]",
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  purple: "bg-[#E5DCEB] text-[#5B3A6E]",
} as const;

const stepClass = {
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  success: "bg-[var(--green-bg)] text-[var(--green-text)]",
  info: "bg-[var(--light-blue)] text-[var(--navy)]",
} as const;

// Toolbar (recherche réelle) + table des leads, en client pour filtrer les
// lignes déjà chargées côté serveur. Aucun appel réseau supplémentaire : on
// filtre en mémoire le portefeuille (≤ 50 lignes). Un seul filtre "Tous" reste
// affiché — les catégories Hot/À relancer/Sans suite n'ont aucune source en
// base, on ne simule pas un tri qui n'existe pas.
export function LeadsTable({ leads, totalCount }: { leads: LeadRow[]; totalCount: number }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.email, l.phone, l.assignee, l.stageLabel, l.source?.value]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q)),
    );
  }, [leads, query]);

  return (
    <section className="rounded-md border border-[var(--navy-100)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="rounded-md bg-[var(--navy)] px-3 py-1.5 text-[11.5px] font-semibold text-white"
          >
            {`Tous (${query ? filtered.length : totalCount})`}
          </button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un lead..."
          className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[12px] placeholder:text-[var(--navy-300)] focus:border-[var(--gold)] focus:outline-none"
        />
      </div>
      {filtered.length > 0 ? (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Cabinet</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Étape</th>
              <th className="px-4 py-3">Dernier contact</th>
              <th className="px-4 py-3">Prochaine action</th>
              <th className="px-4 py-3">Affecté à</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--navy-100)]">
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold">{lead.name ?? "—"}</div>
                  <div className="text-[10.5px] font-normal text-[var(--navy-300)]">
                    {lead.email ?? "—"} · {lead.phone ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--navy-300)]">—</td>
                <td className="px-4 py-3">
                  {lead.source ? (
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${sourceClass[lead.source.tone]}`}
                    >
                      {lead.source.value}
                    </span>
                  ) : (
                    <span className="text-[var(--navy-300)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${stepClass[lead.stageTone]}`}
                  >
                    {lead.stageLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--navy-300)]">{lead.lastContact}</td>
                <td className="px-4 py-3 text-[var(--navy-300)]">—</td>
                <td className="px-4 py-3 text-[var(--navy-300)]">{lead.assignee ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/dossiers/${lead.id}`}
                    className={
                      lead.cta.primary
                        ? "rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
                        : "rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                    }
                  >
                    {lead.cta.label}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : leads.length > 0 ? (
        <div className="px-4 py-12 text-center">
          <div className="mb-2 text-[14px] font-semibold text-[var(--navy)]">
            Aucun lead ne correspond à « {query} »
          </div>
          <p className="mx-auto max-w-md text-[12px] leading-relaxed text-[var(--navy-300)]">
            Affinez votre recherche ou videz le champ pour revoir tout le portefeuille.
          </p>
        </div>
      ) : (
        <div className="px-4 py-12 text-center">
          <div className="mb-2 text-[14px] font-semibold text-[var(--navy)]">Aucun lead en amont</div>
          <p className="mx-auto max-w-md text-[12px] leading-relaxed text-[var(--navy-300)]">
            Les leads apparaissent ici dès qu&apos;un dossier est ouvert en étape prospect ou
            conformité pour ce cabinet.
          </p>
        </div>
      )}
    </section>
  );
}
