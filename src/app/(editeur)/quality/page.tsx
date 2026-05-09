import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";

const ticketKpis: KpiBlock[] = [
  { phase: "1", label: "Tickets ouverts", value: "12", meta: "4 critiques · 8 standards" },
  {
    phase: "1",
    label: "Temps moyen de première réponse",
    value: "2,4",
    unit: "h",
    meta: "objectif < 4h",
  },
  {
    phase: "1",
    label: "Temps moyen de résolution",
    value: "8,2",
    unit: "h",
    meta: "objectif < 24h",
  },
  { phase: "1", label: "Satisfaction support", value: "4,7", unit: "/5", meta: "CSAT moyen" },
];

const stabilityKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Bugs critiques ouverts",
    value: "2",
    meta: "à corriger sous 48h",
    trend: "down",
  },
  {
    phase: "1",
    label: "Incidents de plateforme",
    value: "0",
    meta: "30 derniers jours · 100 % stable",
  },
  {
    phase: "1",
    label: "Niveau de service garanti",
    value: "99,8",
    unit: "%",
    meta: "disponibilité contractuelle (SLA)",
  },
];

const resolutionKpis: KpiBlock[] = [
  {
    label: "Cette semaine",
    value: "82",
    unit: "%",
    meta: "28 résolus / 34 tickets",
    compares: [
      { period: "S-1", value: "▲ 78 %", direction: "up" },
      { period: "S-2", value: "▲ 76 %", direction: "up" },
    ],
  },
  {
    label: "Ce mois",
    value: "79",
    unit: "%",
    meta: "112 / 142 tickets",
    compares: [
      { period: "M-1", value: "▲ 74 %", direction: "up" },
      { period: "M-2", value: "▲ 71 %", direction: "up" },
    ],
  },
  {
    label: "Ce trimestre",
    value: "76",
    unit: "%",
    meta: "324 / 426 tickets",
    compares: [
      { period: "T-1", value: "▲ 68 %", direction: "up" },
      { period: "N-1", value: "▲ 58 %", direction: "up" },
    ],
  },
  {
    label: "Cette année",
    value: "73",
    unit: "%",
    meta: "986 / 1 350 tickets",
    compares: [
      { period: "N-1", value: "▲ 61 %", direction: "up" },
      { period: "N-2", value: "▲ 52 %", direction: "up" },
    ],
  },
];

export default function QualityPage() {
  return (
    <>
      <Topbar current="07 · Support & qualité" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 07 · Support & qualité"
          title="Support & qualité"
          description="Mesurer la qualité du support et la stabilité produit — gestion des tickets, résolution de bugs, suivi des incidents de plateforme et satisfaction client."
          actions={<GhostButton>Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader eyebrow="Charge support" title="Tickets & délais" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ticketKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Stabilité produit" title="Bugs & incidents" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stabilityKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Premier niveau de support"
            title="Taux de résolution niveau 1 · évolution temporelle"
          />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
            <span>ℹ️</span>
            <div>
              Pourcentage de tickets résolus directement par l'équipe support de premier niveau,
              sans escalade vers le développement.
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {resolutionKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
