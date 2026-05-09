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

        <section>
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
      </div>
    </>
  );
}
