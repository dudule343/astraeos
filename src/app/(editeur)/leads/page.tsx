import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";

const kpis: KpiBlock[] = [
  { label: "Leads totaux", value: "312", meta: "qualifiés actifs" },
  { label: "Nouveaux ce mois", value: "68", meta: "▲ +14 % vs M-1" },
  { label: "RDV planifiés", value: "22", meta: "cette semaine" },
  { label: "Essais proposés", value: "9", meta: "en attente acceptation" },
  { label: "Taux qualification", value: "42", unit: "%", meta: "contact → qualifié" },
  { label: "Délai moyen", value: "14", unit: "j", meta: "contact → essai" },
];

type Step = {
  label: string;
  count: number;
  meta: string;
  active?: boolean;
};

const steps: Step[] = [
  { label: "À CONTACTER", count: 182, meta: "~5 460 €/mois potentiels" },
  { label: "CONTACTÉS", count: 88, meta: "~2 640 €/mois potentiels" },
  { label: "QUALIFIÉS", count: 42, meta: "en attente de passer à l'action", active: true },
  { label: "RDV PLANIFIÉ", count: 22, meta: "~660 €/mois potentiels" },
  { label: "RDV FAIT", count: 14, meta: "démonstrations réalisées" },
  { label: "ESSAI PROPOSÉ", count: 9, meta: "→ vers Période d'essai" },
];

type Lead = {
  name: string;
  email: string;
  phone: string;
  cabinet: string;
  source: { value: string; tone: "success" | "info" | "warning" | "purple" };
  step: { value: string; tone: "warning" | "success" | "info" };
  lastContact: string;
  nextAction: string;
  assignee: string;
  cta: { label: string; primary: boolean };
};

const leads: Lead[] = [
  {
    name: "Bertrand FOURNIER",
    email: "b.fournier@fournier-conseil.fr",
    phone: "06 12 34 56 78",
    cabinet: "Fournier Conseil Patrimonial",
    source: { value: "Recommandation", tone: "success" },
    step: { value: "Qualifié", tone: "warning" },
    lastContact: "Hier",
    nextAction: "Appel J+2",
    assignee: "Marc DUPRE",
    cta: { label: "Appeler", primary: true },
  },
  {
    name: "Caroline DAVAL",
    email: "c.daval@daval-patrimoine.fr",
    phone: "06 23 45 67 89",
    cabinet: "Daval Patrimoine",
    source: { value: "Recherche organique", tone: "info" },
    step: { value: "RDV planifié", tone: "success" },
    lastContact: "Avant-hier",
    nextAction: "RDV demain 14h00",
    assignee: "Marc DUPRE",
    cta: { label: "Préparer RDV", primary: false },
  },
  {
    name: "Étienne ALLARD",
    email: "e.allard@allard-cgp.fr",
    phone: "06 34 56 78 90",
    cabinet: "Allard CGP",
    source: { value: "LinkedIn Ads", tone: "warning" },
    step: { value: "Contacté", tone: "info" },
    lastContact: "il y a 4 jours",
    nextAction: "Email de relance",
    assignee: "Hugues CARTIER",
    cta: { label: "Email", primary: false },
  },
  {
    name: "Maître Catherine NORMANT",
    email: "c.normant@normant-notaires.fr",
    phone: "04 56 78 90 12",
    cabinet: "Étude Normant Notaires",
    source: { value: "Salon", tone: "purple" },
    step: { value: "RDV fait", tone: "success" },
    lastContact: "il y a 2 jours",
    nextAction: "Proposer un essai",
    assignee: "Marc DUPRE",
    cta: { label: "Proposer essai", primary: true },
  },
];

const sourceClass = {
  success: "bg-[var(--green-bg)] text-[var(--green-text)]",
  info: "bg-[var(--light-blue)] text-[var(--navy)]",
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  purple: "bg-[#E5DCEB] text-[#5B3A6E]",
} as const;

const stepClass = {
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  success: "bg-[var(--green-bg)] text-[var(--green-text)]",
  info: "bg-[var(--light-blue)] text-[var(--navy)]",
} as const;

export default function LeadsPage() {
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
              <GhostButton>Export</GhostButton>
              <GoldButton>＋ Nouveau lead</GoldButton>
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
            <GhostButton>Vue kanban ↗</GhostButton>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-6">
            {steps.map((step) => (
              <div
                key={step.label}
                className={`cursor-pointer rounded-md border p-3 transition-all ${
                  step.active
                    ? "border-[var(--gold)] bg-[var(--gold-200)]/30"
                    : "border-[var(--navy-100)] bg-[var(--ivory)] hover:border-[var(--gold-300)]"
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
                <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">{step.meta}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Tous", count: 312, active: true },
                { label: "Hot leads", count: 28 },
                { label: "À relancer", count: 42 },
                { label: "Sans suite", count: 14 },
              ].map((f) => (
                <button
                  type="button"
                  key={f.label}
                  className={`rounded-md px-3 py-1.5 text-[11.5px] font-semibold ${
                    f.active
                      ? "bg-[var(--navy)] text-white"
                      : "border border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            <input
              type="search"
              placeholder="Rechercher un lead..."
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[12px] placeholder:text-[var(--navy-300)] focus:border-[var(--gold)] focus:outline-none"
            />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Cabinet</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Étape</th>
                <th className="px-4 py-3">Dernier contact</th>
                <th className="px-4 py-3">Prochain action</th>
                <th className="px-4 py-3">Affecté à</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              {leads.map((lead) => (
                <tr
                  key={lead.email}
                  className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-[10.5px] font-normal text-[var(--navy-300)]">
                      {lead.email} · {lead.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3">{lead.cabinet}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${sourceClass[lead.source.tone]}`}
                    >
                      {lead.source.value}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${stepClass[lead.step.tone]}`}
                    >
                      {lead.step.value}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--navy-300)]">{lead.lastContact}</td>
                  <td className="px-4 py-3">{lead.nextAction}</td>
                  <td className="px-4 py-3 text-[var(--navy-300)]">{lead.assignee}</td>
                  <td className="px-4 py-3 text-center">
                    {lead.cta.primary ? (
                      <GoldButton>{lead.cta.label}</GoldButton>
                    ) : (
                      <GhostButton>{lead.cta.label}</GhostButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
