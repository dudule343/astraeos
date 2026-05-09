import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton, GoldButton } from "../_components/PageHeader";

const distributionKpis: KpiBlock[] = [
  {
    phase: "2",
    label: "Comptes en bonne santé",
    value: "15",
    meta: "65 % du portefeuille · score > 80",
    trend: "up",
  },
  {
    phase: "2",
    label: "Comptes en croissance",
    value: "5",
    meta: "22 % · expansion en cours",
  },
  {
    phase: "2",
    label: "Comptes à risque",
    value: "3",
    meta: "13 % · score < 60 ou usage en chute",
    trend: "down",
  },
  {
    phase: "2",
    label: "Score santé moyen",
    value: "82",
    meta: "tous comptes confondus",
    compares: [
      { period: "M-1", value: "▲ 78", direction: "up" },
      { period: "N-1", value: "▲ 71", direction: "up" },
    ],
  },
];

type RiskRow = {
  name: string;
  initials: string;
  type: "Cabinet" | "Autre pro";
  score: { value: string; tone: "warning" | "danger" };
  signal: string;
  lastConnection: string;
  mrr: string;
  action: string;
};

const risks: RiskRow[] = [
  {
    name: "Cabinet Lyonnais",
    initials: "L",
    type: "Cabinet",
    score: { value: "58", tone: "warning" },
    signal: "Usage en chute · -42 % vs M-1",
    lastConnection: "il y a 12 jours",
    mrr: "1 800 €",
    action: "Briefer la relation client",
  },
  {
    name: "Bordeaux Patrimoine",
    initials: "B",
    type: "Cabinet",
    score: { value: "42", tone: "danger" },
    signal: "Aucune étude créée < 30j · 1 ticket support critique",
    lastConnection: "il y a 18 jours",
    mrr: "1 200 €",
    action: "Briefer la relation client",
  },
  {
    name: "Notaire Pollet",
    initials: "N",
    type: "Autre pro",
    score: { value: "54", tone: "warning" },
    signal: "Facture impayée · 32 jours",
    lastConnection: "il y a 24 jours",
    mrr: "820 €",
    action: "Relance",
  },
];

const components = [
  {
    icon: "📊",
    label: "Usage produit · 40 %",
    desc: "Sessions par mois · études créées · ratio quotidien/mensuel",
  },
  {
    icon: "👥",
    label: "Engagement équipe · 25 %",
    desc: "% ingénieurs actifs · profondeur d'usage",
  },
  {
    icon: "💶",
    label: "Paiement · 20 %",
    desc: "Délai de règlement · taux de retard · impayés",
  },
  {
    icon: "🛟",
    label: "Support · 15 %",
    desc: "Tickets ouverts · satisfaction · résolution",
  },
];

const scoreToneClass = {
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  danger: "bg-[var(--red-bg)] text-[var(--red-text)]",
} as const;

const typeBadgeClass = {
  Cabinet: "bg-[var(--light-blue)] text-[var(--navy)]",
  "Autre pro": "bg-[var(--navy-100)] text-[var(--navy-300)]",
} as const;

export default function HealthPage() {
  return (
    <>
      <Topbar current="05 · Santé clients" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 05 · Santé clients"
          title="Santé clients"
          description="Score composite basé sur usage, engagement, paiement et support — détection précoce des risques de désabonnement."
          actions={<GhostButton>Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader
            eyebrow="Distribution du portefeuille"
            title="Répartition par état de santé"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {distributionKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="À surveiller" title="Comptes à risque de désabonnement" />
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">Compte</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-center">Score santé</th>
                  <th className="px-4 py-3">Signal d'alerte</th>
                  <th className="px-4 py-3">Dernière connexion</th>
                  <th className="px-4 py-3 text-right">MRR à risque</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {risks.map((row) => (
                  <tr
                    key={row.name}
                    className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                  >
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
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${scoreToneClass[row.score.tone]}`}
                      >
                        {row.score.value}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.signal}</td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{row.lastConnection}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.mrr}</td>
                    <td className="px-4 py-3 text-center">
                      <GoldButton>{row.action}</GoldButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Méthodologie" title="Composantes du score santé" />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
            <span>ℹ️</span>
            <div>
              Le score santé d'un compte est la <strong>moyenne pondérée de 4 dimensions</strong> —
              usage produit (40 %), engagement de l'équipe (25 %), historique de paiement (20 %),
              satisfaction support (15 %).
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {components.map((c) => (
              <div
                key={c.label}
                className="rounded-md border border-[var(--navy-100)] bg-white p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--gold-200)] text-xl">
                  {c.icon}
                </div>
                <div className="mb-1 text-[12px] font-semibold text-[var(--navy)]">{c.label}</div>
                <div className="text-[12px] leading-relaxed text-[var(--navy-300)]">{c.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
