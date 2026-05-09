"use client";

import { useState, useTransition } from "react";
import { deleteClientsAction } from "../client-new/actions";
import { EditClientModal } from "./EditClientModal";

export type DbClient = {
  id: string;
  created_at: string;
  household_address: string | null;
  cabinet_name: string | null;
  representant: string | null;
  representant_email: string | null;
  representant_phone: string | null;
  raison_sociale: string | null;
  siren: string | null;
  category: string | null;
  sub_category: string | null;
  pack: string | null;
  revenue: string | null;
  engineers: string | null;
  end_clients: string | null;
  status: string | null;
  health: string | null;
  is_demo: boolean;
};

const categoryBadge: Record<string, string> = {
  marque: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  cabinet_direct: "bg-[var(--light-blue)] text-[var(--navy)]",
  autre_pro: "bg-[var(--navy-100)] text-[var(--navy-300)]",
};

const packBadge: Record<string, string> = {
  Premium: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  Standard: "bg-[var(--light-blue)] text-[var(--navy)]",
};

function statusBadge(status: string | null): { label: string; cls: string } {
  if (status === "a_risque") {
    return { label: "À risque", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" };
  }
  return { label: "Actif", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" };
}

function healthBadge(health: string | null): string {
  if (!health) return "bg-[var(--navy-100)] text-[var(--navy-300)]";
  const n = parseInt(health, 10);
  if (n >= 80) return "bg-[var(--green-bg)] text-[var(--green-text)]";
  if (n >= 60) return "bg-[var(--orange-bg)] text-[var(--orange-text)]";
  return "bg-[var(--red-bg)] text-[var(--red-text)]";
}

export function DbClientsTable({ clients }: { clients: DbClient[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<DbClient | null>(null);
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
    <>
      <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
          <div className="text-[13px] font-semibold text-[var(--navy)]">
            Liste des clients ({clients.length})
            {selected.size > 0 && (
              <span className="ml-2 text-[12px] font-normal text-[var(--navy-300)]">
                · {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="rounded-md border border-[var(--red-text)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--red-text)] transition-opacity hover:bg-[var(--red-bg)] disabled:cursor-wait disabled:opacity-60"
            >
              {pending
                ? "Suppression…"
                : `🗑 Supprimer ${selected.size} client${selected.size > 1 ? "s" : ""}`}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
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
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-right">Ingénieurs</th>
                <th className="px-4 py-3 text-right">Clients finaux</th>
                <th className="px-4 py-3 text-right">Revenu /mois</th>
                <th className="px-4 py-3">Pack</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-center">Santé</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              {clients.map((c) => {
                const isChecked = selected.has(c.id);
                const status = statusBadge(c.status);
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
                    <td className="px-4 py-3">
                      <div className="font-semibold">{c.raison_sociale ?? "—"}</div>
                      {c.representant && (
                        <div className="mt-0.5 text-[10.5px] text-[var(--navy-300)]">
                          {c.representant}
                        </div>
                      )}
                      {(c.representant_email || c.representant_phone) && (
                        <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-[var(--navy-300)]">
                          {c.representant_email && <span>📧 {c.representant_email}</span>}
                          {c.representant_phone && <span>📞 {c.representant_phone}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.sub_category && c.category ? (
                        <span
                          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${categoryBadge[c.category] ?? ""}`}
                        >
                          {c.sub_category}
                        </span>
                      ) : (
                        <span className="text-[var(--navy-300)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.engineers ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.end_clients ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {c.revenue ? `${parseInt(c.revenue, 10).toLocaleString("fr-FR")} €` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.pack ? (
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${packBadge[c.pack] ?? "bg-[var(--navy-100)] text-[var(--navy-300)]"}`}
                        >
                          {c.pack}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.health ? (
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${healthBadge(c.health)}`}
                        >
                          {c.health}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1 text-[10.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                      >
                        ✏️ Modifier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {editing && <EditClientModal client={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
