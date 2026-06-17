"use client";

import { useMemo, useState } from "react";
import type { TrialRow } from "./data";

const DASH = "—";

// Toolbar (recherche réelle) + table des essais, en client pour filtrer les
// lignes déjà chargées côté serveur. Les actions par ligne deviennent de vrais
// liens tel:/mailto: quand la coordonnée existe, désactivés sinon.
export function TrialTable({ rows, enCours }: { rows: TrialRow[]; enCours: number }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t) =>
      [t.name, t.role, t.cabinet, t.email, t.phone, t.type.v]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="rounded-md bg-[var(--navy)] px-3 py-1.5 text-[11.5px] font-semibold text-white"
          >
            {`Tous (${query ? filtered.length : enCours})`}
          </button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher..."
          className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[12px] placeholder:text-[var(--navy-300)] focus:border-[var(--gold)] focus:outline-none"
        />
      </div>
      {filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-4 py-3">Contact (Prénom Nom)</th>
                <th className="px-4 py-3">Fonction</th>
                <th className="px-4 py-3">Cabinet</th>
                <th className="px-4 py-3">Coordonnées</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Démarré le</th>
                <th className="px-4 py-3">Reste</th>
                <th className="px-4 py-3">Étape parcours</th>
                <th className="px-4 py-3">Offre proposée</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              {filtered.map((t) => (
                <tr key={t.id} className="text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)]">
                  <td className="px-4 py-3 font-semibold">{t.name ?? DASH}</td>
                  <td className="px-4 py-3 text-[var(--navy-300)]">{t.role ?? DASH}</td>
                  <td className="px-4 py-3">{t.cabinet ?? DASH}</td>
                  <td className="px-4 py-3 text-[11px] leading-tight">
                    {t.email || t.phone ? (
                      <>
                        {t.email && <div>📧 {t.email}</div>}
                        {t.phone && <div>📞 {t.phone}</div>}
                      </>
                    ) : (
                      <span className="text-[var(--navy-300)]">{DASH}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.type.cls}`}
                    >
                      {t.type.v}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--navy-300)]">{t.startedOn ?? DASH}</td>
                  <td className="px-4 py-3 text-[var(--navy-300)]">{t.remaining ?? DASH}</td>
                  <td className="px-4 py-3 text-[var(--navy-300)]">{t.step ?? DASH}</td>
                  <td className="px-4 py-3 text-[var(--navy-300)]">{t.offer ?? DASH}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1.5">
                      {t.phone ? (
                        <a
                          href={`tel:${t.phone.replace(/\s/g, "")}`}
                          className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                        >
                          📞 Appeler
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Aucun téléphone renseigné"
                          className="cursor-not-allowed rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy-300)] opacity-50"
                        >
                          📞 Appeler
                        </button>
                      )}
                      {t.email ? (
                        <a
                          href={`mailto:${t.email}`}
                          className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                        >
                          📧 Email
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Aucun email renseigné"
                          className="cursor-not-allowed rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy-300)] opacity-50"
                        >
                          📧 Email
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length > 0 ? (
        <div className="p-12 text-center">
          <div className="mb-3 text-[40px] leading-none">🔍</div>
          <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
            Aucun essai ne correspond à « {query} »
          </div>
          <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
            Affinez votre recherche ou videz le champ pour revoir tous les essais en cours.
          </p>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="mb-3 text-[40px] leading-none">📋</div>
          <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
            Aucun essai en cours
          </div>
          <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
            Les comptes clients en période d&apos;essai apparaîtront ici dès qu&apos;un compte
            passera au statut « essai ».
          </p>
        </div>
      )}
    </section>
  );
}
