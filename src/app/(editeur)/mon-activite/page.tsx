import Link from "next/link";

import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero, SectionHeader } from "@/app/_components/shared/PageHeader";
import { fetchMonActivite, fmtEur, fmtDate } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Mon activité",
};

export default async function MonActivitePage() {
  const a = await fetchMonActivite();
  const maxStage = Math.max(1, ...a.pipeline.map((s) => s.count));

  const kpis: KpiBlock[] = [
    {
      label: "CA généré",
      value: fmtEur(a.caGenere),
      meta: "souscriptions à mon nom",
      valueTone: "gold",
    },
    {
      label: "Études livrées",
      value: a.etudesLivrees > 0 ? String(a.etudesLivrees) : "—",
      meta: "sur mes dossiers",
    },
    {
      label: "Mes clients",
      value: a.clientsServis > 0 ? String(a.clientsServis) : "—",
      meta: "clients suivis",
    },
    {
      label: "RDV à venir",
      value: a.rdvAVenir > 0 ? String(a.rdvAVenir) : "—",
      meta: "entretiens planifiés",
    },
  ];

  return (
    <>
      <Topbar current="Mon activité" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Tableau de bord personnel"
          title="Mon activité"
          description="Votre activité d'ingénieur patrimonial : chiffre d'affaires généré, études livrées, clients suivis et avancement de vos dossiers."
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {a.hasData ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2">
              <SectionHeader eyebrow="Pipeline" title={`Mes dossiers (${a.dossiersActifs})`} />
              <div className="space-y-2 rounded-md border border-[var(--navy-100)] bg-white p-5">
                {a.pipeline.map((s) => {
                  const pct = Math.round((s.count / maxStage) * 100);
                  return (
                    <div key={s.stage} className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0 text-[12px] font-semibold text-[var(--navy)]">
                        {s.label}
                      </div>
                      <div className="h-6 flex-1 overflow-hidden rounded-[4px] bg-[var(--ivory)]">
                        <div
                          className="flex h-full items-center justify-end rounded-[4px] bg-gradient-to-r from-[var(--gold)] to-[var(--medium-400)] px-2"
                          style={{ width: `${Math.max(pct, s.count > 0 ? 8 : 0)}%` }}
                        >
                          {s.count > 0 && (
                            <span className="text-[10.5px] font-bold text-white">{s.count}</span>
                          )}
                        </div>
                      </div>
                      <div className="w-7 flex-shrink-0 text-right text-[12px] font-semibold tabular-nums text-[var(--navy-300)]">
                        {s.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionHeader eyebrow="Récents" title="Derniers dossiers" />
              {a.recent.length > 0 ? (
                <div className="space-y-2">
                  {a.recent.map((d) => (
                    <Link
                      key={d.id}
                      href={`/dossiers/${d.id}`}
                      className="block rounded-md border border-[var(--navy-100)] bg-white px-4 py-3 transition hover:border-[var(--gold)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-semibold text-[var(--navy)]">
                          {d.clientName ?? "Client"}
                        </span>
                        <span className="rounded-full bg-[var(--gold-200)] px-2 py-0.5 text-[10px] font-bold text-[var(--medium-400)]">
                          {d.stageLabel}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">
                        ouvert le {fmtDate(d.createdAt)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-6 text-center text-[12px] text-[var(--navy-300)]">
                  Aucun dossier récent.
                </div>
              )}
            </section>
          </div>
        ) : (
          <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
            <div className="mb-3 text-[34px] leading-none">📂</div>
            <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
              Aucune activité pour l&apos;instant
            </div>
            <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Vos indicateurs se construisent à mesure que vous créez des dossiers, livrez des études
              et placez des souscriptions. Commencez par créer un client.
            </p>
            <Link
              href="/client-new"
              className="mt-4 inline-block rounded-md bg-[var(--gold)] px-4 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
            >
              Nouveau client
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
