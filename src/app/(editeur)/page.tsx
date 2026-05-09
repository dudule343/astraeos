import { Topbar } from "./_components/Topbar";

type Compare = {
  period: string;
  value: string;
  direction: "up" | "down";
};

type Kpi = {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  compares: Compare[];
};

type CockpitBlock = {
  num: string;
  label: string;
  score: number;
  tone: "green" | "orange" | "red";
};

type AlertItem = {
  level: "danger" | "warning" | "info";
  levelLabel: string;
  time: string;
  title: string;
  sub: string;
};

type Prospect = {
  name: string;
  meta: string;
  amount: string;
};

const kpis: Kpi[] = [
  {
    label: "Chiffre d'affaires généré",
    value: "142 800",
    unit: "€",
    meta: "facturé en mai 2026",
    compares: [
      { period: "M-1", value: "▲ 128 400 €", direction: "up" },
      { period: "N-1", value: "▲ 41 200 €", direction: "up" },
    ],
  },
  {
    label: "Chiffre d'affaires encaissé",
    value: "128 400",
    unit: "€",
    meta: "trésorerie réellement perçue",
    compares: [
      { period: "M-1", value: "▲ 118 200 €", direction: "up" },
      { period: "N-1", value: "▲ 38 600 €", direction: "up" },
    ],
  },
  {
    label: "Charges du mois",
    value: "42 600",
    unit: "€",
    meta: "cloud + IA + équipe + licences",
    compares: [
      { period: "M-1", value: "▲ 38 200 €", direction: "down" },
      { period: "N-1", value: "▲ 22 400 €", direction: "down" },
    ],
  },
  {
    label: "Base prospects",
    value: "312",
    meta: "leads qualifiés actifs",
    compares: [
      { period: "M-1", value: "▲ +42", direction: "up" },
      { period: "N-1", value: "▲ +180", direction: "up" },
    ],
  },
  {
    label: "Clients actifs",
    value: "23",
    meta: "3 marques · 17 cabinets · 3 autres pros",
    compares: [
      { period: "M-1", value: "▲ +2", direction: "up" },
      { period: "N-1", value: "▲ +14", direction: "up" },
    ],
  },
  {
    label: "Taux de désabonnement",
    value: "2,4",
    unit: "%",
    meta: "trimestre en cours",
    compares: [
      { period: "T-1", value: "▼ 5,0 %", direction: "up" },
      { period: "N-1", value: "▼ 8,3 %", direction: "up" },
    ],
  },
];

const cockpitBlocks: CockpitBlock[] = [
  { num: "01", label: "Pilotage business", score: 92, tone: "green" },
  { num: "02", label: "Acquisition & conversion", score: 85, tone: "green" },
  { num: "03", label: "Adoption produit", score: 72, tone: "orange" },
  { num: "04", label: "Première valeur", score: 68, tone: "orange" },
  { num: "05", label: "Santé clients", score: 88, tone: "green" },
  { num: "06", label: "Analyse produit", score: 74, tone: "orange" },
  { num: "07", label: "Support & qualité", score: 94, tone: "green" },
  { num: "08", label: "Infrastructure", score: 99, tone: "green" },
];

const alerts: AlertItem[] = [
  {
    level: "danger",
    levelLabel: "Critique",
    time: "il y a 12 min",
    title: "PRIVEOS Capital · usage IA dépasse quota",
    sub: "112 % du plan · escalader pack ou ajuster facturation",
  },
  {
    level: "warning",
    levelLabel: "Important",
    time: "il y a 2h",
    title: "3 essais arrivent à échéance dans < 7 jours",
    sub: "Pierre VAUBAN · Antoine BERNARD · clore l'essai",
  },
  {
    level: "warning",
    levelLabel: "Important",
    time: "hier 19h",
    title: "12 tickets dépassent 24h sans réponse",
    sub: "SLA en risque · 4 tickets critiques",
  },
  {
    level: "info",
    levelLabel: "Info",
    time: "il y a 4h",
    title: "Cabinet Lyonnais · score santé en baisse",
    sub: "-12 pts en 30 jours · responsable relation client à alerter",
  },
];

const prospects: Prospect[] = [
  {
    name: "Pierre VAUBAN — Vauban Patrimoine",
    meta: "Échéance 6j · 18 sessions",
    amount: "~580 €/mois",
  },
  {
    name: "Antoine BERNARD — Bernard & Cie",
    meta: "Échéance 9j · 14 sessions",
    amount: "~820 €/mois",
  },
  {
    name: "Mathilde AUVERGNE — Auvergne Wealth",
    meta: "Échéance 16j · 6 sessions",
    amount: "~680 €/mois",
  },
];

const SCORE_RADIUS = 68;
const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_RADIUS;
const SCORE_VALUE = 87;
const SCORE_OFFSET = SCORE_CIRCUMFERENCE * (1 - SCORE_VALUE / 100);

const toneClasses = {
  green: { num: "text-[var(--green-text)]", bar: "bg-[var(--green-text)]" },
  orange: { num: "text-[var(--orange-text)]", bar: "bg-[var(--orange-text)]" },
  red: { num: "text-[var(--red-text)]", bar: "bg-[var(--red-text)]" },
} as const;

const alertLevelClasses = {
  danger: "bg-[var(--red-bg)] text-[var(--red-text)]",
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  info: "bg-[var(--light-blue)] text-[var(--navy)]",
} as const;

export default function HomePage() {
  return (
    <>
      <Topbar current="Accueil" />

      <div className="px-10 py-8">
        <section className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Tableau de bord exécutif
            </div>
            <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
              Accueil
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
              Vue exécutive synthétique du SaaS ASTRAEOS — pour le détail de chaque
              métrique, utilisez les sections numérotées 01 à 08 dans la sidebar.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              Rapport hebdo
            </button>
            <button
              type="button"
              className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
            >
              Personnaliser
            </button>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                KPIs exécutifs
              </div>
              <div className="text-[15px] font-semibold text-[var(--navy)]">
                Indicateurs financiers et commerciaux
              </div>
            </div>
            <div className="text-[11.5px] text-[var(--navy-300)]">
              État système · 06 mai 2026 · 14h32
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="cursor-pointer rounded-md border border-[var(--navy-100)] bg-white p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  {kpi.label}
                </div>
                <div className="mb-1 text-[24px] font-bold leading-none text-[var(--navy)]">
                  {kpi.value}
                  {kpi.unit && (
                    <span className="ml-1 text-[14px] font-semibold text-[var(--navy-300)]">
                      {kpi.unit}
                    </span>
                  )}
                </div>
                <div className="mb-3 text-[11px] text-[var(--navy-300)]">{kpi.meta}</div>

                <div className="grid grid-cols-2 gap-2 border-t border-[var(--navy-100)] pt-2">
                  {kpi.compares.map((c) => (
                    <div key={c.period}>
                      <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                        {c.period}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          c.direction === "up"
                            ? "text-[var(--green-text)]"
                            : "text-[var(--red-text)]"
                        }`}
                      >
                        {c.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                Score santé global
              </div>
              <span className="rounded-full bg-[var(--green-bg)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--green-text)]">
                Excellent
              </span>
            </div>
            <div className="p-6 text-center">
              <div className="relative mx-auto h-40 w-40">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r={SCORE_RADIUS}
                    fill="none"
                    stroke="var(--navy-100)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={SCORE_RADIUS}
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={SCORE_CIRCUMFERENCE}
                    strokeDashoffset={SCORE_OFFSET}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[34px] font-bold leading-none text-[var(--navy)]">
                    {SCORE_VALUE}
                    <span className="text-[14px] font-semibold text-[var(--navy-300)]">
                      /100
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                    Santé SaaS
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                Voyants verts sur tous les blocs sauf usage IA
                <br />
                <span className="font-semibold text-[var(--orange-text)]">
                  PRIVEOS Capital en dépassement quota
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                Score par bloc cockpit
              </div>
              <span className="text-[11px] text-[var(--navy-300)]">
                Cliquez pour creuser
              </span>
            </div>
            <div className="divide-y divide-[var(--navy-100)]">
              {cockpitBlocks.map((block) => (
                <div
                  key={block.num}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[var(--light-blue)]"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12.5px] text-[var(--navy)]">
                        {block.num} · {block.label}
                      </span>
                      <span
                        className={`text-[14px] font-bold ${toneClasses[block.tone].num}`}
                      >
                        {block.score}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--navy-100)]">
                      <div
                        className={`h-full ${toneClasses[block.tone].bar}`}
                        style={{ width: `${block.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                Alertes & actions urgentes
              </div>
              <button
                type="button"
                className="rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                Toutes
              </button>
            </div>
            <div className="divide-y divide-[var(--navy-100)]">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="cursor-pointer px-4 py-3 hover:bg-[var(--light-blue)]"
                >
                  <div className="mb-1 flex items-center gap-2 text-[10.5px]">
                    <span
                      className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${alertLevelClasses[alert.level]}`}
                    >
                      {alert.levelLabel}
                    </span>
                    <span className="text-[var(--navy-300)]">{alert.time}</span>
                  </div>
                  <div className="text-[12.5px] font-semibold text-[var(--navy)]">
                    {alert.title}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-[var(--navy-300)]">
                    {alert.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                Pipeline commercial
              </div>
              <button
                type="button"
                className="rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                Détails
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-[var(--gold-300)] bg-[var(--gold-200)]/40 p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--medium-400)]">
                    En période d'essai
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[22px] font-bold text-[var(--navy)]">4</span>
                    <span className="text-[10.5px] text-[var(--navy-300)]">
                      2 850 € MRR potentiel
                    </span>
                  </div>
                </div>
                <div className="rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--navy-300)]">
                    Signés ce mois
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[22px] font-bold text-[var(--navy)]">3</span>
                    <span className="text-[10.5px] text-[var(--green-text)] font-semibold">
                      +14 200 € MRR
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                {prospects.map((p) => (
                  <div
                    key={p.name}
                    className="cursor-pointer rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] px-3 py-2 hover:border-[var(--gold-300)]"
                  >
                    <div className="text-[12px] font-semibold text-[var(--navy)]">
                      {p.name}
                    </div>
                    <div className="flex items-center text-[11px] text-[var(--navy-300)]">
                      <span>{p.meta}</span>
                      <span className="ml-auto font-bold text-[var(--gold)]">
                        {p.amount}
                      </span>
                    </div>
                  </div>
                ))}
                <a
                  href="/trial"
                  className="mt-1 text-center text-[11px] font-semibold text-[var(--gold)] hover:underline"
                >
                  Voir le 4ème prospect & clients signés →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
