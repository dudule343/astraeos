import { Topbar } from "../../_components/Topbar";
import { EmptyState } from "../../_components/EmptyState";
import { KpiCard, type KpiBlock } from "../../../(editeur)/_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../../../(editeur)/_components/PageHeader";
import {
  fetchCabinetCommissions,
  fetchCabinetDossiers,
  fetchEtudesByEngineer,
  fetchPipelineStages,
  fetchCabinetProfile,
  computeFinanceResultat,
  fmtEur,
} from "../../_data/cabinet";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Performance",
};

export default async function PerformancePage() {
  const [commissions, dossiers, pipeline, profile] = await Promise.all([
    fetchCabinetCommissions(),
    fetchCabinetDossiers(),
    fetchPipelineStages(),
    fetchCabinetProfile(),
  ]);
  const etudesByEngineer = await fetchEtudesByEngineer(dossiers);

  const resultat = computeFinanceResultat(commissions);
  const etudesLivrees = [...etudesByEngineer.values()].reduce((a, n) => a + n, 0);
  const totalDossiers = pipeline.reduce((acc, s) => acc + s.count, 0);
  const restituees = pipeline.find((s) => s.stage === "05_restituee")?.count ?? 0;
  const suivi = pipeline.find((s) => s.stage === "06_suivi")?.count ?? 0;
  const conversion =
    totalDossiers > 0 ? Math.round(((restituees + suivi) / totalDossiers) * 100) : 0;

  const maxStage = Math.max(1, ...pipeline.map((s) => s.count));
  const hasData = totalDossiers > 0 || resultat.totalGenere > 0;

  const kpis: KpiBlock[] = [
    {
      label: "CA généré · part cabinet",
      value: fmtEur(resultat.totalGenere),
      unit: resultat.totalGenere > 0 ? "€" : undefined,
      meta: "commissions revenant au cabinet",
      valueTone: "gold",
    },
    {
      label: "Études livrées",
      value: etudesLivrees > 0 ? String(etudesLivrees) : "—",
      meta: "études patrimoniales produites",
    },
    {
      label: "Dossiers en cours",
      value: totalDossiers > 0 ? String(totalDossiers) : "—",
      meta: "dossiers actifs dans le pipeline",
    },
    {
      label: "Taux de conversion",
      value: totalDossiers > 0 ? `${conversion}%` : "—",
      meta: "dossiers restitués / suivis",
    },
  ];

  return (
    <>
      <Topbar current="Performance" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Analyse de performance"
          title="Performance du cabinet"
          description="Chiffre d'affaires généré, volume d'études livrées et conversion du pipeline. Calculé en temps réel à partir des dossiers et commissions du cabinet."
          actions={<GhostButton>Export performance</GhostButton>}
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {hasData ? (
          <section className="mb-8">
            <SectionHeader
              eyebrow="Pipeline"
              title="Conversion par étape"
              right={
                profile?.network_rank_cached ? (
                  <span className="rounded-full bg-[var(--gold-200)] px-3 py-1 text-[11px] font-bold text-[var(--medium-400)]">
                    Rang réseau #{profile.network_rank_cached}
                  </span>
                ) : undefined
              }
            />
            <div className="space-y-2 rounded-md border border-[var(--navy-100)] bg-white p-5">
              {pipeline.map((s) => {
                const pct = Math.round((s.count / maxStage) * 100);
                return (
                  <div key={s.stage} className="flex items-center gap-3">
                    <div className="w-28 flex-shrink-0 text-[12px] font-semibold text-[var(--navy)]">
                      {s.label}
                    </div>
                    <div className="h-6 flex-1 overflow-hidden rounded-[4px] bg-[var(--ivory)]">
                      <div
                        className="flex h-full items-center justify-end rounded-[4px] bg-gradient-to-r from-[var(--gold)] to-[var(--medium-400)] px-2"
                        style={{ width: `${Math.max(pct, s.count > 0 ? 8 : 0)}%` }}
                      >
                        {s.count > 0 && (
                          <span className="text-[10.5px] font-bold text-white">{s.count}</span>
                        )}
                      </div>
                    </div>
                    <div className="w-8 flex-shrink-0 text-right text-[12px] font-semibold tabular-nums text-[var(--navy-300)]">
                      {s.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <EmptyState
            icon="📈"
            title="Pas encore de performance à analyser"
            hint="Les indicateurs de performance se construisent à mesure que les dossiers avancent dans le pipeline et que les commissions sont enregistrées. Créez un dossier pour démarrer le suivi."
          />
        )}
      </div>
    </>
  );
}
