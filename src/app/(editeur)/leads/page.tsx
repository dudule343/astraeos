import Link from "next/link";

import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero } from "@/app/_components/shared/PageHeader";
import { fetchLeads } from "./data";
import { LeadsTable } from "./LeadsTable";
import { ExportLeadsButton } from "./ExportLeadsButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Pipeline acquisition",
};

export default async function LeadsPage() {
  const data = await fetchLeads();
  const k = data.kpis;

  const nouveauxMeta =
    k.nouveauxMoisDelta != null
      ? `${k.nouveauxMoisDelta >= 0 ? "▲ +" : "▼ "}${k.nouveauxMoisDelta} % vs M-1`
      : "ce mois-ci";

  const kpis: KpiBlock[] = [
    {
      label: "Leads totaux",
      value: k.leadsTotal > 0 ? String(k.leadsTotal) : "—",
      meta: "en amont de l'étude",
    },
    {
      label: "Nouveaux ce mois",
      value: k.nouveauxMois > 0 ? String(k.nouveauxMois) : "—",
      meta: nouveauxMeta,
    },
    {
      label: "RDV planifiés",
      value: k.rdvPlanifies > 0 ? String(k.rdvPlanifies) : "—",
      meta: "entretiens à venir",
    },
    {
      label: "Essais proposés",
      value: "—",
      meta: "non suivi",
    },
    {
      label: "Taux qualification",
      value: k.tauxQualif != null ? String(k.tauxQualif) : "—",
      unit: k.tauxQualif != null ? "%" : undefined,
      meta: "prospect → conformité",
    },
    {
      label: "Délai moyen",
      value: k.delaiMoyenJours != null ? String(k.delaiMoyenJours) : "—",
      unit: k.delaiMoyenJours != null ? "j" : undefined,
      meta: "dans l'étape courante",
    },
  ];

  return (
    <>
      <Topbar current="Pipeline acquisition" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Acquisition · Pipeline opérationnel"
          title="Pipeline acquisition"
          description="Gestion opérationnelle des leads commerciaux en amont de la période d'essai — qualification, prise de contact, RDV planifiés, propositions d'essai. Vue commerciale du portefeuille."
          actions={
            <>
              <ExportLeadsButton leads={data.leads} />
              <Link
                href="/clients"
                className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
              >
                ＋ Nouveau lead
              </Link>
            </>
          }
        />

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </section>

        <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
            <div className="text-[13px] font-semibold text-[var(--navy)]">
              Pipeline commercial · 6 étapes
            </div>
            <button
              type="button"
              disabled
              title="Vue kanban à venir"
              className="cursor-not-allowed rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy-300)] opacity-60"
            >
              Vue kanban · à venir
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-6">
            {data.pipeline.map((step) => (
              <div
                key={step.stage}
                className={`rounded-md border p-3 ${
                  step.active
                    ? "border-[var(--gold)] bg-[var(--gold-200)]/30"
                    : "border-[var(--navy-100)] bg-[var(--ivory)]"
                }`}
              >
                <div
                  className={`mb-1 text-[9px] font-bold uppercase tracking-[0.12em] ${step.active ? "text-[var(--gold)]" : "text-[var(--navy-300)]"}`}
                >
                  {step.label}
                </div>
                <div
                  className={`text-[24px] font-bold leading-none ${step.active ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}
                >
                  {step.count}
                </div>
                <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">
                  {step.count > 0 ? "dossiers à cette étape" : "—"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <LeadsTable leads={data.leads} totalCount={data.totalCount} />
      </div>
    </>
  );
}
