"use client";

import { useState } from "react";

export type IngenieurRow = {
  initials: string;
  name: string;
  clients: number;
  ca: number;
  etudes: number;
  nouveaux: number;
  anciennete: string;
  orias: string | null;
};

const SORTS = [
  { id: "ca", label: "CA généré" },
  { id: "etudes", label: "Études générées" },
  { id: "nouveaux", label: "Nouveaux clients" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

const eur = (n: number) => (n > 0 ? `${Math.round(n).toLocaleString("fr-FR")} €` : "—");

export function IngenieursTable({ rows }: { rows: IngenieurRow[] }) {
  const [sort, setSort] = useState<SortId>("ca");

  const sorted = [...rows].sort((a, b) => {
    if (sort === "etudes") return b.etudes - a.etudes;
    if (sort === "nouveaux") return b.nouveaux - a.nouveaux;
    return b.ca - a.ca;
  });

  return (
    <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
        <span className="text-[13px] font-bold text-[var(--navy)]">
          Classement · {rows.length} ingénieur{rows.length > 1 ? "s" : ""}
        </span>
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--navy-100)] bg-white p-1">
          <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--navy-300)]">
            Trier par
          </span>
          {SORTS.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`rounded-md px-3.5 py-1.5 text-[12px] font-semibold ${
                sort === s.id ? "bg-[var(--navy)] text-white" : "text-[var(--navy)] hover:bg-[var(--ivory)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-10 text-center text-[12.5px] text-[var(--navy-300)]">
          Aucun ingénieur actif rattaché à ce cabinet.
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              <th className="px-4 py-3 text-right">Rang</th>
              <th className="px-4 py-3">Ingénieur</th>
              <th className="px-4 py-3 text-right">Clients servis</th>
              <th className="px-4 py-3 text-right">CA généré · cumul</th>
              <th className="px-4 py-3 text-right">Études</th>
              <th className="px-4 py-3 text-right">Nouveaux clients</th>
              <th className="px-4 py-3">Ancienneté</th>
              <th className="px-4 py-3">ORIAS</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--navy-100)]">
            {sorted.map((ing, i) => {
              const rank = i + 1;
              const isPodium = rank <= 3;
              return (
                <tr key={ing.name} className="text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)]">
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    <span className={isPodium ? "font-bold text-[var(--gold)]" : ""}>{rank}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-white">
                        {ing.initials}
                      </div>
                      <span className="font-semibold">{ing.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{ing.clients || "—"}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${isPodium ? "text-[var(--gold)]" : ""}`}>
                    {eur(ing.ca)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{ing.etudes || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{ing.nouveaux || "—"}</td>
                  <td className="px-4 py-2.5">{ing.anciennete}</td>
                  <td className="px-4 py-2.5">
                    {ing.orias ? (
                      <span className="font-mono text-[11px] text-[var(--navy)]">{ing.orias}</span>
                    ) : (
                      <span className="text-[11px] text-[var(--navy-300)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      data-stub={`Fiche ingénieur · ${ing.name}`}
                      data-stub-body="La fiche détaillée d'un ingénieur (production dans le temps, portefeuille clients, historique de formation) n'est pas encore modélisée. Elle sera disponible dans une prochaine itération."
                      className="rounded-md border border-[var(--navy-100)] bg-white px-2 py-1 text-[11px] text-[var(--navy)] hover:border-[var(--gold)]"
                    >
                      Voir la fiche
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
