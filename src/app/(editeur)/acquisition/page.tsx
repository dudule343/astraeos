import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";

type FunnelStage = {
  label: string;
  count: string;
  pct: string;
  width: number;
  highlight?: boolean;
};

const funnel: FunnelStage[] = [
  { label: "Visiteurs site web", count: "4 280", pct: "100 %", width: 100 },
  { label: "Leads qualifiés", count: "312", pct: "7,3 %", width: 18 },
  { label: "Essais gratuits démarrés", count: "42", pct: "1,0 %", width: 9 },
  { label: "Clients convertis", count: "23", pct: "0,5 %", width: 5, highlight: true },
];

const volumeKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Visiteurs site web",
    value: "4 280",
    meta: "30 derniers jours ·",
    metaHighlight: { text: "▲ +14 %", tone: "up" },
  },
  {
    phase: "1",
    label: "Leads qualifiés",
    value: "312",
    meta: "contactables ·",
    metaHighlight: { text: "▲ +8 %", tone: "up" },
  },
  {
    phase: "1",
    label: "Essais gratuits en cours",
    value: "4",
    meta: "démarrés < 30 jours",
  },
  {
    phase: "1",
    label: "Clients convertis",
    value: "3",
    meta: "signés en mai 2026",
  },
];

const conversionKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Coût d'acquisition par canal",
    value: "3 200",
    unit: "€",
    meta: "moyenne pondérée tous canaux",
  },
  {
    phase: "1",
    label: "Durée moyenne de conversion",
    value: "28",
    unit: "jours",
    meta: "premier contact → signature",
  },
  {
    phase: "1",
    label: "Taux de conversion global",
    value: "7,4",
    unit: "%",
    meta: "essai → client payant",
  },
];

type SourceRow = {
  source: string;
  visitors: string;
  leads: string;
  trials: string;
  converted: string;
  cost: string;
  costPer: string;
  rentability: { value: string; tone: "success" | "warning" };
};

const sources: SourceRow[] = [
  {
    source: "Recommandation client",
    visitors: "312",
    leads: "68",
    trials: "14",
    converted: "9",
    cost: "0 €",
    costPer: "0 €",
    rentability: { value: "Excellent", tone: "success" },
  },
  {
    source: "Recherche organique",
    visitors: "1 480",
    leads: "112",
    trials: "12",
    converted: "6",
    cost: "2 400 €",
    costPer: "400 €",
    rentability: { value: "Excellent", tone: "success" },
  },
  {
    source: "LinkedIn Ads",
    visitors: "1 240",
    leads: "82",
    trials: "10",
    converted: "5",
    cost: "12 800 €",
    costPer: "2 560 €",
    rentability: { value: "Correct", tone: "warning" },
  },
  {
    source: "Salons & événements",
    visitors: "680",
    leads: "38",
    trials: "4",
    converted: "2",
    cost: "9 600 €",
    costPer: "4 800 €",
    rentability: { value: "Élevé", tone: "warning" },
  },
  {
    source: "Direct",
    visitors: "568",
    leads: "12",
    trials: "2",
    converted: "1",
    cost: "0 €",
    costPer: "0 €",
    rentability: { value: "Excellent", tone: "success" },
  },
];

const badgeToneClass = {
  success: "bg-[var(--green-bg)] text-[var(--green-text)]",
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
} as const;

export default function AcquisitionPage() {
  return (
    <>
      <Topbar current="02 · Acquisition & conversion" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 02 · Acquisition & conversion"
          title="Acquisition & conversion"
          description="Comprendre comment les prospects deviennent clients : visiteur anonyme jusqu'à la signature, suivi des canaux d'acquisition et de leur rentabilité."
          actions={<GhostButton>Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader
            eyebrow="Entonnoir de conversion"
            title="Du visiteur au client signé"
            right={<GhostButton>30 jours ▾</GhostButton>}
          />
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-4">
            <div className="flex flex-col gap-2">
              {funnel.map((stage) => (
                <div
                  key={stage.label}
                  className={`grid grid-cols-[180px_1fr_80px_60px] items-center gap-3 rounded-md border px-3 py-2 ${
                    stage.highlight
                      ? "border-[var(--gold)] bg-[var(--gold-200)]/30"
                      : "border-[var(--navy-100)] bg-[var(--ivory)]"
                  }`}
                >
                  <span
                    className={`text-[12px] font-semibold ${stage.highlight ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}
                  >
                    {stage.label}
                  </span>
                  <div className="h-3 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                    <div
                      className={`h-full rounded-sm ${
                        stage.highlight ? "bg-[var(--gold)]" : "bg-[var(--navy)]"
                      }`}
                      style={{ width: `${stage.width}%` }}
                    />
                  </div>
                  <span
                    className={`text-right text-[14px] font-bold tabular-nums ${stage.highlight ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}
                  >
                    {stage.count}
                  </span>
                  <span className="text-right text-[11px] font-semibold text-[var(--navy-300)]">
                    {stage.pct}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Volumétrie de conversion"
            title="Indicateurs d'acquisition"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {volumeKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {conversionKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Rentabilité par canal"
            title="Performance par source d'acquisition"
            right={<GhostButton>Comparer périodes</GhostButton>}
          />
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Visiteurs</th>
                  <th className="px-4 py-3 text-right">Leads</th>
                  <th className="px-4 py-3 text-right">Essais</th>
                  <th className="px-4 py-3 text-right">Convertis</th>
                  <th className="px-4 py-3 text-right">Coût total</th>
                  <th className="px-4 py-3 text-right">Coût / client</th>
                  <th className="px-4 py-3 text-center">Rentabilité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {sources.map((row) => (
                  <tr
                    key={row.source}
                    className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                  >
                    <td className="px-4 py-3 font-semibold">{row.source}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.visitors}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.leads}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.trials}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {row.converted}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.cost}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--gold)]">
                      {row.costPer}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeToneClass[row.rentability.tone]}`}
                      >
                        {row.rentability.value}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
