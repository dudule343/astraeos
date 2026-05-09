"use client";

import { useState, useTransition } from "react";
import { deleteClientsAction } from "../client-new/actions";

export type DbClient = {
  id: string;
  created_at: string;
  household_address: string | null;
  cabinet_name: string | null;
  representant: string | null;
  representant_email: string | null;
  raison_sociale: string | null;
  siren: string | null;
};

export function DbClientsTable({ clients }: { clients: DbClient[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allChecked = clients.length > 0 && selected.size === clients.length;
  const someChecked = selected.size > 0 && selected.size < clients.length;

  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(clients.map((c) => c.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = () => {
    if (selected.size === 0) return;
    const label =
      selected.size === 1
        ? "Supprimer ce client ? Cette action est irréversible."
        : `Supprimer ces ${selected.size} clients ? Cette action est irréversible.`;
    if (!confirm(label)) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      try {
        await deleteClientsAction(ids);
        setSelected(new Set());
      } catch (e) {
        alert("Erreur : " + (e instanceof Error ? e.message : String(e)));
      }
    });
  };

  return (
    <section className="mb-8 rounded-md border border-[var(--gold-300)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] bg-[var(--gold-200)]/30 px-4 py-3">
        <div className="text-[13px] font-semibold text-[var(--navy)]">
          ✨ Clients créés via le wizard ({clients.length})
          {selected.size > 0 && (
            <span className="ml-2 text-[12px] font-normal text-[var(--navy-300)]">
              · {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="rounded-md border border-[var(--red-text)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--red-text)] transition-opacity hover:bg-[var(--red-bg)] disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Suppression…" : `🗑 Supprimer ${selected.size} client${selected.size > 1 ? "s" : ""}`}
            </button>
          )}
          <span className="text-[10.5px] text-[var(--navy-300)]">
            Données réelles · Supabase
          </span>
        </div>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={toggleAll}
                className="h-4 w-4 cursor-pointer accent-[var(--gold)]"
                aria-label="Tout sélectionner"
              />
            </th>
            <th className="px-4 py-3">Raison sociale</th>
            <th className="px-4 py-3">SIREN</th>
            <th className="px-4 py-3">Représentant légal</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Cabinet</th>
            <th className="px-4 py-3">Adresse</th>
            <th className="px-4 py-3 text-right">Créé le</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--navy-100)]">
          {clients.map((c) => {
            const isChecked = selected.has(c.id);
            return (
              <tr
                key={c.id}
                className={`text-[12px] text-[var(--navy)] ${
                  isChecked ? "bg-[var(--light-blue)]" : "hover:bg-[var(--light-blue)]"
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOne(c.id)}
                    className="h-4 w-4 cursor-pointer accent-[var(--gold)]"
                    aria-label={`Sélectionner ${c.raison_sociale ?? c.id}`}
                  />
                </td>
                <td className="px-4 py-3 font-semibold">{c.raison_sociale ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums text-[var(--navy-300)]">{c.siren ?? "—"}</td>
                <td className="px-4 py-3">{c.representant ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--navy-300)]">{c.representant_email ?? "—"}</td>
                <td className="px-4 py-3">{c.cabinet_name ?? "—"}</td>
                <td className="px-4 py-3 text-[11px] text-[var(--navy-300)]">{c.household_address ?? "—"}</td>
                <td className="px-4 py-3 text-right text-[11px] text-[var(--navy-300)]">
                  {new Date(c.created_at).toLocaleDateString("fr-FR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
