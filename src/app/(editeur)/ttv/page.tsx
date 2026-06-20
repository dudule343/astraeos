import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "@/app/_components/shared/PageHeader";
import { fetchTtv } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Vitesse première valeur",
};

export default async function TtvPage() {
  const ttv = await fetchTtv();

  const milestoneKpis: KpiBlock[] = ttv.milestones.map((m) => ({
    phase: "1",
    label: m.label,
    value: m.value,
    unit: m.unit,
    meta: m.meta,
  }));

  return (
    <>
      <Topbar current="04 · Vitesse première valeur" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 04 · Vitesse première valeur"
          title="Vitesse première valeur"
          description="Mesurer combien de temps un nouvel utilisateur met avant d'obtenir une première valeur tangible — court = plus de chances de conversion et rétention."
          actions={<GhostButton dataStub="Export Time-to-value">Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader eyebrow="Délais médians" title="Temps moyen jusqu'aux jalons clés" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {milestoneKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Onboarding"
            title={`Progression des ingénieurs (${ttv.cohort} ${ttv.cohort > 1 ? "ingénieurs" : "ingénieur"})`}
          />
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            {ttv.hasData ? (
              <div className="flex flex-col gap-5">
                {ttv.funnel.map((step) => (
                  <div key={step.label}>
                    <div className="mb-1.5 flex justify-between text-[11.5px] text-[var(--navy-300)]">
                      <span>{step.label}</span>
                      {step.tracked && step.pct != null ? (
                        <span>
                          <strong className="text-[var(--navy)]">{step.pct} %</strong> ·{" "}
                          {step.reached}/{step.cohort}
                        </span>
                      ) : (
                        <span className="italic">non suivi</span>
                      )}
                    </div>
                    <div className="h-3 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                      {step.tracked && step.pct != null && (
                        <div
                          className="h-full bg-[var(--navy)]"
                          style={{ width: `${step.pct}%` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[12.5px] text-[var(--navy-300)]">
                Aucun ingénieur rattaché à ce cabinet pour l&apos;instant. La progression
                d&apos;onboarding s&apos;affichera dès qu&apos;une équipe sera constituée.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
