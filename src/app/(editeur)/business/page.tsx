import { Topbar } from "../_components/Topbar";

type Compare = { period: string; value: string; direction: "up" | "down" | "neutral" };

type KpiBlock = {
  phase: "1" | "2";
  label: string;
  value: string;
  unit?: string;
  meta: string;
  trend?: "up" | "down";
  compares?: Compare[];
};

const growthKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Revenu mensuel récurrent",
    value: "128 400",
    unit: "€",
    meta: "projeté · mai 2026",
    compares: [
      { period: "M-1 · avr 2026", value: "▲ 114 200 €", direction: "up" },
      { period: "N-1 · mai 2025", value: "▲ 41 200 €", direction: "up" },
    ],
  },
  {
    phase: "1",
    label: "Revenu annuel récurrent",
    value: "1,54",
    unit: "M€",
    meta: "projection 12 mois glissants",
    compares: [
      { period: "M-1", value: "▲ 1,37 M€", direction: "up" },
      { period: "N-1", value: "▲ 494 K€", direction: "up" },
    ],
  },
  {
    phase: "1",
    label: "Croissance mensuelle des revenus récurrents",
    value: "+12,4",
    unit: "%",
    meta: "vs mois précédent",
    trend: "up",
    compares: [
      { period: "M-1", value: "▲ +9,8 %", direction: "up" },
      { period: "N-1", value: "▲ +5,2 %", direction: "up" },
    ],
  },
];

const volumeKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Acquisitions",
    value: "+3",
    unit: "comptes",
    meta: "nouveaux clients sur la période",
    trend: "up",
  },
  {
    phase: "1",
    label: "Désabonnements",
    value: "-1",
    unit: "compte",
    meta: "départ sur la période",
    trend: "down",
  },
  {
    phase: "1",
    label: "Mouvement net",
    value: "+2",
    unit: "comptes",
    meta: "acquisitions − désabonnements",
    trend: "up",
  },
  {
    phase: "2",
    label: "Durée moyenne d'utilisation",
    value: "22",
    unit: "mois",
    meta: "temps moyen d'un client sur ASTRAEOS",
  },
];

const ltvKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Valeur de vie client moyenne",
    value: "42 800",
    unit: "€",
    meta: "sur 36 mois en moyenne",
    compares: [
      { period: "T-1", value: "▲ 38 200 €", direction: "up" },
      { period: "N-1", value: "▲ 24 800 €", direction: "up" },
    ],
  },
  {
    phase: "1",
    label: "Coût d'acquisition client",
    value: "3 200",
    unit: "€",
    meta: "marketing + ventes amorti sur les acquisitions",
    compares: [
      { period: "T-1", value: "▲ 2 800 €", direction: "down" },
      { period: "N-1", value: "▼ 4 200 €", direction: "up" },
    ],
  },
  {
    phase: "1",
    label: "Ratio valeur de vie / coût d'acquisition",
    value: "13,4",
    unit: "x",
    meta: "excellent · seuil sain > 3x",
    compares: [
      { period: "T-1", value: "▼ 13,6 x", direction: "neutral" },
      { period: "N-1", value: "▲ 5,9 x", direction: "up" },
    ],
  },
];

const chartData = [
  { month: "Juin", height: 32 },
  { month: "Juil", height: 38 },
  { month: "Août", height: 46 },
  { month: "Sept", height: 52 },
  { month: "Oct", height: 58 },
  { month: "Nov", height: 64 },
  { month: "Déc", height: 71 },
  { month: "Jan", height: 76 },
  { month: "Fév", height: 79 },
  { month: "Mars", height: 84 },
  { month: "Avr", height: 89 },
  { month: "Mai", height: 100 },
];

type ExpansionRow = {
  rank: number;
  name: string;
  initials: string;
  type: "Marque" | "Cabinet" | "Autre pro";
  subscription: string;
  packs: string;
  total: string;
  m1: { value: string; tone: "success" | "warning" | "neutral" };
  n1: { value: string; tone: "success" | "warning" | "neutral" };
};

const expansionRows: ExpansionRow[] = [
  {
    rank: 1,
    name: "PRIVEOS Capital",
    initials: "P",
    type: "Marque",
    subscription: "12 800 €",
    packs: "3 400 €",
    total: "198 200 €",
    m1: { value: "▲ +18 %", tone: "success" },
    n1: { value: "▲ +210 %", tone: "success" },
  },
  {
    rank: 2,
    name: "Cabinet Dupont & Associés",
    initials: "D",
    type: "Cabinet",
    subscription: "2 400 €",
    packs: "2 800 €",
    total: "36 200 €",
    m1: { value: "▲ +24 %", tone: "success" },
    n1: { value: "▲ +145 %", tone: "success" },
  },
  {
    rank: 3,
    name: "Mont-Blanc Patrimoine",
    initials: "MB",
    type: "Cabinet",
    subscription: "2 100 €",
    packs: "1 600 €",
    total: "28 400 €",
    m1: { value: "▲ +12 %", tone: "success" },
    n1: { value: "▲ +88 %", tone: "success" },
  },
  {
    rank: 4,
    name: "Notaire Mercier & Cie",
    initials: "N",
    type: "Autre pro",
    subscription: "1 200 €",
    packs: "3 200 €",
    total: "21 600 €",
    m1: { value: "▲ +32 %", tone: "success" },
    n1: { value: "N/A", tone: "neutral" },
  },
  {
    rank: 5,
    name: "Cabinet Lyonnais",
    initials: "L",
    type: "Cabinet",
    subscription: "1 800 €",
    packs: "800 €",
    total: "19 800 €",
    m1: { value: "▲ +4 %", tone: "warning" },
    n1: { value: "▲ +62 %", tone: "success" },
  },
];

const compareDirectionClass = {
  up: "text-[var(--green-text)]",
  down: "text-[var(--red-text)]",
  neutral: "text-[var(--navy-300)]",
} as const;

const typeBadgeClass: Record<ExpansionRow["type"], string> = {
  Marque: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  Cabinet: "bg-[var(--light-blue)] text-[var(--navy)]",
  "Autre pro": "bg-[var(--navy-100)] text-[var(--navy-300)]",
};

const badgeToneClass = {
  success: "bg-[var(--green-bg)] text-[var(--green-text)]",
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  neutral: "bg-[var(--navy-100)] text-[var(--navy-300)]",
} as const;

function PhaseTag({ phase }: { phase: "1" | "2" }) {
  const isP1 = phase === "1";
  return (
    <span
      className={`absolute right-3 top-3 rounded-sm px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] ${
        isP1
          ? "bg-[var(--gold-200)] text-[var(--medium-400)]"
          : "bg-[var(--navy-100)] text-[var(--navy-300)]"
      }`}
    >
      Phase {phase}
    </span>
  );
}

function KpiCard({ kpi }: { kpi: KpiBlock }) {
  const valueClass =
    kpi.trend === "up"
      ? "text-[var(--green-text)]"
      : kpi.trend === "down"
        ? "text-[var(--red-text)]"
        : "text-[var(--navy)]";

  return (
    <div className="relative rounded-md border border-[var(--navy-100)] bg-white p-4">
      <PhaseTag phase={kpi.phase} />
      <div className="mb-2 mt-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
        {kpi.label}
      </div>
      <div className={`mb-1 text-[24px] font-bold leading-none ${valueClass}`}>
        {kpi.value}
        {kpi.unit && (
          <span className="ml-1 text-[14px] font-semibold text-[var(--navy-300)]">
            {kpi.unit}
          </span>
        )}
      </div>
      <div className="mb-3 text-[11px] text-[var(--navy-300)]">{kpi.meta}</div>

      {kpi.compares && (
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--navy-100)] pt-2">
          {kpi.compares.map((c) => (
            <div key={c.period}>
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                {c.period}
              </div>
              <div className={`text-[11px] font-semibold ${compareDirectionClass[c.direction]}`}>
                {c.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          {eyebrow}
        </div>
        <div className="text-[15px] font-semibold text-[var(--navy)]">{title}</div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export default function BusinessPage() {
  return (
    <>
      <Topbar current="01 · Pilotage business" />

      <div className="px-10 py-8">
        <section className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Bloc 01 · Pilotage business
            </div>
            <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
              Pilotage business
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
              Suivi de la croissance financière et commerciale de la plateforme ASTRAEOS — revenus
              récurrents des abonnements, expansion, valeur à long terme.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              Export
            </button>
            <button
              type="button"
              className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
            >
              Ajouter widget
            </button>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Revenus récurrents" title="Croissance des abonnements" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {growthKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Tendance"
            title="Évolution du revenu mensuel récurrent"
            right={
              <button
                type="button"
                className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                12 mois ▾
              </button>
            }
          />
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            <div className="flex h-[220px] items-end gap-2">
              {chartData.map((bar) => (
                <div key={bar.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-[var(--gold)] to-[var(--gold-300)]"
                    style={{ height: `${bar.height}%` }}
                  />
                  <div className="text-[10px] font-semibold text-[var(--navy-300)]">
                    {bar.month}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center text-[11.5px] text-[var(--navy-300)]">
              Croissance constante depuis 12 mois · multiplié par 3,1
            </div>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Volumétrie"
            title="Mouvement net du portefeuille clients"
            right={
              <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--navy-300)]">
                <span className="text-[var(--gold)]">📅</span>
                Période : mai 2026 · ajustable via le sélecteur de date
              </div>
            }
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {volumeKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Top performers"
            title="Top 5 des comptes en expansion ce trimestre"
          />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
            <span>ℹ️</span>
            <div>
              Pour chaque compte : ce qu'il <strong>paie en abonnement</strong>, ce qu'il a{" "}
              <strong>dépensé chez nous</strong> (packs unitaires), ce qu'il{" "}
              <strong>nous a apporté</strong> (revenu total) et sa <strong>progression</strong> vs
              M-1 et N-1.
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Compte</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Abonnement /mois</th>
                  <th className="px-4 py-3 text-right">Dépensé en packs</th>
                  <th className="px-4 py-3 text-right">Revenu total apporté</th>
                  <th className="px-4 py-3 text-center">vs M-1</th>
                  <th className="px-4 py-3 text-center">vs N-1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {expansionRows.map((row) => (
                  <tr
                    key={row.rank}
                    className="cursor-pointer text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                  >
                    <td className="px-4 py-3 font-bold text-[var(--navy-300)]">{row.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--navy)] text-[11px] font-bold text-white">
                          {row.initials}
                        </div>
                        <span className="font-semibold">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${typeBadgeClass[row.type]}`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.subscription}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.packs}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--gold)]">
                      {row.total}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeToneClass[row.m1.tone]}`}
                      >
                        {row.m1.value}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeToneClass[row.n1.tone]}`}
                      >
                        {row.n1.value}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Rentabilité long terme" title="Valeur à long terme" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ltvKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
