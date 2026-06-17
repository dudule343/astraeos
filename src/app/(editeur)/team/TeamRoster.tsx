"use client";

import { useState } from "react";

import type { TeamCategory, TeamMember } from "./data";
import { fmtCount, fmtEur, initialsOf } from "./format";

type Props = {
  categories: TeamCategory[];
  total: number;
  weekLabel: string;
};

export function TeamRoster({ categories, total, weekLabel }: Props) {
  const [openMember, setOpenMember] = useState<TeamMember | null>(null);

  if (categories.length === 0) {
    return (
      <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
        <div className="mb-3 text-[34px] leading-none">👥</div>
        <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
          Aucun collaborateur
        </div>
        <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
          Aucun utilisateur actif n&apos;est rattaché à ce cabinet pour le moment.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="rounded-md border border-[var(--navy-100)] bg-white">
        {categories.map((cat) => (
          <div key={cat.role}>
            <div className="flex items-center gap-3 border-y border-[var(--navy-100)] bg-[var(--ivory)] px-4 py-2.5 first:border-t-0">
              <span className="text-base">{cat.icon}</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--navy)]">
                {cat.title}
              </span>
              <span className="ml-auto text-[10.5px] text-[var(--navy-300)]">
                {cat.count} {cat.count > 1 ? "personnes" : "personne"}
              </span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-2.5">Prénom Nom</th>
                  <th className="px-4 py-2.5">Rôle</th>
                  <th className="px-4 py-2.5">Email interne</th>
                  <th className="px-4 py-2.5">Téléphone</th>
                  <th className="px-4 py-2.5">Spécialités</th>
                  <th className="px-4 py-2.5 text-right">Clients affectés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {cat.members.map((m) => {
                  const clickable = m.hasActivity;
                  return (
                    <tr
                      key={m.id}
                      onClick={clickable ? () => setOpenMember(m) : undefined}
                      className={`text-[12px] text-[var(--navy)] ${
                        clickable ? "cursor-pointer hover:bg-[var(--light-blue)]" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5 font-semibold">{m.name}</td>
                      <td className="px-4 py-2.5">{m.roleLabel}</td>
                      <td className="px-4 py-2.5 text-[11px] text-[var(--navy-300)]">
                        {m.email ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-[var(--navy-300)]">
                        {m.phone ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-[var(--navy-300)]">
                        {m.specialties.length > 0 ? m.specialties.join(", ") : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {m.activity.clientsAffectes == null
                          ? "—"
                          : fmtCount(m.activity.clientsAffectes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        <div className="flex items-center justify-between border-t-2 border-[var(--gold)] bg-gradient-to-r from-[var(--gold-200)] to-[var(--ivory)] px-5 py-3.5">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--navy-300)]">
              Effectif du cabinet
            </div>
            <div className="text-[13px] text-[var(--navy)]">
              {total} collaborateur{total > 1 ? "s" : ""} actif{total > 1 ? "s" : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[24px] font-bold text-[var(--gold)]">{total}</div>
            <div className="mt-1 text-[12px] text-[var(--navy-300)]">
              utilisateurs rattachés à ce cabinet
            </div>
          </div>
        </div>
      </section>

      {openMember && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[rgba(16,45,80,0.45)]"
            onClick={() => setOpenMember(null)}
          />
          <aside className="fixed right-0 top-0 z-50 flex h-screen w-[440px] flex-col overflow-y-auto bg-white shadow-xl">
            <div className="relative bg-gradient-to-br from-[var(--navy)] to-[#1a3866] px-6 py-7 text-white">
              <button
                type="button"
                onClick={() => setOpenMember(null)}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ×
              </button>
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-[20px] font-bold">
                {initialsOf(openMember.name)}
              </div>
              <div className="text-[18px] font-bold">{openMember.name}</div>
              <div className="text-[12px] text-[var(--gold-300)]">{openMember.roleLabel}</div>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-white/80">
                <span>📧 {openMember.email ?? "—"}</span>
                <span>📞 {openMember.phone ?? "—"}</span>
              </div>
            </div>

            <div className="flex-1 px-5 py-5">
              <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">
                Activité de la semaine en cours
              </div>
              <div className="mb-4 text-[11px] text-[var(--navy-300)]">{weekLabel}</div>

              <div className="mb-5">
                <div className="flex justify-between border-b border-[var(--navy-100)] py-2 text-[12px]">
                  <span className="text-[var(--navy-300)]">RDV cette semaine</span>
                  <span className="font-semibold text-[var(--navy)]">
                    {fmtCount(openMember.activity.rdvSemaine)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--navy-100)] py-2 text-[12px]">
                  <span className="text-[var(--navy-300)]">Clients affectés</span>
                  <span className="font-semibold text-[var(--navy)]">
                    {fmtCount(openMember.activity.clientsAffectes)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[var(--navy-100)] py-2 text-[12px]">
                  <span className="text-[var(--navy-300)]">Études livrées</span>
                  <span className="font-semibold text-[var(--navy)]">
                    {fmtCount(openMember.activity.etudesLivrees)}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-[12px]">
                  <span className="text-[var(--navy-300)]">CA généré</span>
                  <span className="font-semibold text-[var(--gold)]">
                    {fmtEur(openMember.activity.caGenere)}
                  </span>
                </div>
              </div>

              <div className="rounded-md bg-[var(--ivory)] px-3.5 py-2.5 text-[11px] leading-relaxed text-[var(--navy-300)]">
                <strong className="text-[var(--navy)]">Note :</strong> indicateurs dérivés des
                dossiers, rendez-vous et souscriptions rattachés à ce collaborateur. «&nbsp;—&nbsp;»
                signifie qu&apos;aucune donnée n&apos;est encore enregistrée.
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
