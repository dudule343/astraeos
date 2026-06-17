import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";
import { fetchLeads } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Pipeline acquisition",
};

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
            {data.pipeline.map((step) => (
              <div
                key={step.stage}
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
                <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">
                  {step.count > 0 ? "dossiers à cette étape" : "—"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Tous", count: data.totalCount, active: true },
                { label: "Hot leads", count: null },
                { label: "À relancer", count: null },
                { label: "Sans suite", count: null },
              ].map((f) => (
                <button
                  type="button"
                  key={f.label}
                  data-stub={`Filtre · ${f.label}`}
                  className={`rounded-md px-3 py-1.5 text-[11.5px] font-semibold ${
                    f.active
                      ? "bg-[var(--navy)] text-white"
                      : "border border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
                  }`}
                >
                  {f.count != null ? `${f.label} (${f.count})` : f.label}
                </button>
              ))}
            </div>
            <input
              type="search"
              placeholder="Rechercher un lead..."
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[12px] placeholder:text-[var(--navy-300)] focus:border-[var(--gold)] focus:outline-none"
            />
          </div>
          {data.leads.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Cabinet</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Étape</th>
                  <th className="px-4 py-3">Dernier contact</th>
                  <th className="px-4 py-3">Prochaine action</th>
                  <th className="px-4 py-3">Affecté à</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {data.leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold">{lead.name ?? "—"}</div>
                      <div className="text-[10.5px] font-normal text-[var(--navy-300)]">
                        {lead.email ?? "—"} · {lead.phone ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">—</td>
                    <td className="px-4 py-3">
                      {lead.source ? (
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${sourceClass[lead.source.tone]}`}
                        >
                          {lead.source.value}
                        </span>
                      ) : (
                        <span className="text-[var(--navy-300)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${stepClass[lead.stageTone]}`}
                      >
                        {lead.stageLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{lead.lastContact}</td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">—</td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{lead.assignee ?? "—"}</td>
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
          ) : (
            <div className="px-4 py-12 text-center">
              <div className="mb-2 text-[14px] font-semibold text-[var(--navy)]">
                Aucun lead en amont
              </div>
              <p className="mx-auto max-w-md text-[12px] leading-relaxed text-[var(--navy-300)]">
                Les leads apparaissent ici dès qu&apos;un dossier est ouvert en étape prospect ou
                conformité pour ce cabinet.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
