"use client";

import { useState, useTransition } from "react";
import { updateClientAction } from "../client-new/actions";
import type { DbClient } from "./DbClientsTable";

const inputClass =
  "w-full rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[12.5px] text-[var(--navy)] focus:border-[var(--gold)] focus:outline-none";

const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]";

// Catégories disponibles, groupées par type (sub_category → category parent)
type CategoryOption = { value: string; label: string; parent: "marque" | "cabinet_direct" | "autre_pro" };

const CATEGORY_OPTIONS: { groupLabel: string; options: CategoryOption[] }[] = [
  {
    groupLabel: "Marques",
    options: [
      { value: "Marque · Licence", label: "Marque · Licence", parent: "marque" },
      { value: "Marque · Réseau", label: "Marque · Réseau", parent: "marque" },
      { value: "Marque · Franchise", label: "Marque · Franchise", parent: "marque" },
    ],
  },
  {
    groupLabel: "Cabinets directs",
    options: [
      { value: "Cabinet direct", label: "Cabinet direct", parent: "cabinet_direct" },
      { value: "Cabinet affilié", label: "Cabinet affilié", parent: "cabinet_direct" },
      { value: "Mandataire", label: "Mandataire (d'une marque)", parent: "cabinet_direct" },
    ],
  },
  {
    groupLabel: "Autres professionnels",
    options: [
      { value: "Notaire", label: "Notaire", parent: "autre_pro" },
      { value: "Avocat", label: "Avocat", parent: "autre_pro" },
      { value: "Expert-comptable", label: "Expert-comptable", parent: "autre_pro" },
      { value: "Autre pro", label: "Autre professionnel", parent: "autre_pro" },
    ],
  },
];

function findParentCategory(subCategory: string): "marque" | "cabinet_direct" | "autre_pro" | null {
  for (const group of CATEGORY_OPTIONS) {
    const opt = group.options.find((o) => o.value === subCategory);
    if (opt) return opt.parent;
  }
  return null;
}

export function EditClientModal({
  client,
  onClose,
}: {
  client: DbClient;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    raison_sociale: client.raison_sociale ?? "",
    representant: client.representant ?? "",
    email: client.representant_email ?? "",
    sub_category: client.sub_category ?? "",
    pack: client.pack ?? "Standard",
    revenue: client.revenue ?? "",
    engineers: client.engineers ?? "",
    end_clients: client.end_clients ?? "",
    status: client.status ?? "actif",
    health: client.health ?? "",
  });

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        // Déduire la catégorie parente à partir de la sous-catégorie sélectionnée
        const parent = form.sub_category ? findParentCategory(form.sub_category) : null;
        await updateClientAction({
          id: client.id,
          ...form,
          category: parent ?? client.category ?? undefined,
        });
        onClose();
      } catch (err) {
        alert("Erreur : " + (err instanceof Error ? err.message : String(err)));
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,45,80,0.45)] p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--navy-100)] bg-[var(--ivory)] px-6 py-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Modifier le client
            </div>
            <div className="text-[16px] font-semibold text-[var(--navy)]">
              {client.raison_sociale ?? "Client"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[18px] text-[var(--navy-300)] hover:bg-[var(--navy-100)]"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Raison sociale</label>
              <input
                className={inputClass}
                value={form.raison_sociale}
                onChange={(e) => set("raison_sociale", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Représentant légal</label>
              <input
                className={inputClass}
                value={form.representant}
                onChange={(e) => set("representant", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Catégorie</label>
              <select
                className={inputClass}
                value={form.sub_category}
                onChange={(e) => set("sub_category", e.target.value)}
              >
                <option value="">— Choisir une catégorie —</option>
                {CATEGORY_OPTIONS.map((group) => (
                  <optgroup key={group.groupLabel} label={group.groupLabel}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Pack</label>
              <select
                className={inputClass}
                value={form.pack}
                onChange={(e) => set("pack", e.target.value)}
              >
                <option>Premium</option>
                <option>Standard</option>
                <option>Hérité</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Revenu /mois (€)</label>
              <input
                type="number"
                className={inputClass}
                value={form.revenue}
                onChange={(e) => set("revenue", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Ingénieurs</label>
              <input
                className={inputClass}
                placeholder="Ex: 6 ou ~32"
                value={form.engineers}
                onChange={(e) => set("engineers", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Clients finaux</label>
              <input
                className={inputClass}
                value={form.end_clients}
                onChange={(e) => set("end_clients", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Score santé (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className={inputClass}
                value={form.health}
                onChange={(e) => set("health", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="actif">Actif</option>
                <option value="a_risque">À risque</option>
              </select>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[var(--navy-100)] bg-[var(--ivory)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:opacity-60"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white transition-opacity hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Enregistrement…" : "✓ Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
