import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";

const milestoneKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Connexion initiale",
    value: "4",
    unit: "min",
    meta: "après création compte",
  },
  { phase: "1", label: "Premier client ajouté", value: "2,4", unit: "jours", meta: "médiane" },
  {
    phase: "1",
    label: "Première étude patrimoniale",
    value: "5,8",
    unit: "jours",
    meta: "médiane",
  },
  { phase: "1", label: "Première simulation", value: "7,2", unit: "jours", meta: "médiane" },
  {
    phase: "1",
    label: "Premier rapport généré",
    value: "9,4",
    unit: "jours",
    meta: "médiane · révèle la valeur",
  },
];

const onboardingSteps = [
  { label: "Connexion initiale", pct: 100, ratio: "18/18" },
  { label: "Premier client ajouté", pct: 94, ratio: "17/18" },
  { label: "Première étude patrimoniale", pct: 78, ratio: "14/18" },
  { label: "Première simulation", pct: 61, ratio: "11/18" },
  { label: "Premier rapport généré", pct: 44, ratio: "8/18" },
];

export default function TtvPage() {
  return (
    <>
      <Topbar current="04 · Vitesse première valeur" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 04 · Vitesse première valeur"
          title="Vitesse première valeur"
          description="Mesurer combien de temps un nouvel utilisateur met avant d'obtenir une première valeur tangible — court = plus de chances de conversion et rétention."
          actions={<GhostButton>Export</GhostButton>}
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
            title="Progression des nouveaux ingénieurs (30 derniers jours)"
          />
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            <div className="flex flex-col gap-5">
              {onboardingSteps.map((step) => (
                <div key={step.label}>
                  <div className="mb-1.5 flex justify-between text-[11.5px] text-[var(--navy-300)]">
                    <span>{step.label}</span>
                    <span>
                      <strong className="text-[var(--navy)]">{step.pct} %</strong> · {step.ratio}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                    <div
                      className="h-full bg-[var(--navy)]"
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
