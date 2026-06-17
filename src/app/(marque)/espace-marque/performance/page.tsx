import { Topbar } from "../../_components/Topbar";
import { EmptyState } from "../../_components/EmptyState";
import { KpiCard, type KpiBlock } from "../../../(editeur)/_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../../../(editeur)/_components/PageHeader";
import {
  fetchNetworkCabinets,
  computeNetworkPerfKpis,
  rankNetworkCabinets,
  fmtEur,
  fmtEurCell,
  fmtCount,
  cabinetInitials,
} from "../../_data/network";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Marque · Performance des licenciés",
};

export default async function PerformanceLicenciesPage() {
  const cabinets = await fetchNetworkCabinets();
  const kpis = computeNetworkPerfKpis(cabinets);
  const ranked = rankNetworkCabinets(cabinets);

  const hasCabinets = cabinets.length > 0;
  const hasActivity = kpis.caTotal > 0 || kpis.encoursTotal > 0;

  const kpiBlocks: KpiBlock[] = [
    {
      label: "Cabinets licenciés",
      value: kpis.cabinetsCount > 0 ? String(kpis.cabinetsCount) : "—",
      meta: "cabinets actifs du réseau",
    },
    {
      label: "CA cumul réseau",
      value: fmtEur(kpis.caTotal),
      unit: kpis.caTotal > 0 ? "€" : undefined,
      meta: "commissions encaissées · part cabinets",
      valueTone: "gold",
    },
    {
      label: "Encours sous gestion",
      value: fmtEur(kpis.encoursTotal),
      unit: kpis.encoursTotal > 0 ? "€" : undefined,
      meta: "encours cumulé des licenciés",
    },
    {
      label: "Clients servis",
      value: fmtCount(kpis.clientsTotal),
      meta: "portefeuille servi par le réseau",
    },
  ];

  return (
    <>
      <Topbar current="Performance des licenciés" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Tableau de bord · pilotage des cabinets licenciés"
          title="Performance des licenciés"
          description="Classement des cabinets licenciés du réseau par chiffre d'affaires généré, encours sous gestion et rang réseau. Calculé en temps réel à partir des commissions et des cabinets du tenant."
          actions={<GhostButton>Exporter</GhostButton>}
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpiBlocks.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {hasCabinets ? (
          <section className="mb-8">
            <SectionHeader
              eyebrow="Classement"
              title="Performance par cabinet"
              right={
                <span className="rounded-full bg-[var(--gold-200)] px-3 py-1 text-[11px] font-bold text-[var(--medium-400)]">
                  {kpis.cabinetsCount} cabinet{kpis.cabinetsCount > 1 ? "s" : ""}
                </span>
              }
            />
            <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-left">
                    <th className="w-12 px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                      Rang
                    </th>
                    <th className="px-4 py-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                      Cabinet
                    </th>
                    <th className="px-4 py-3 text-right text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                      CA généré
                    </th>
                    <th className="px-4 py-3 text-right text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                      Encours
                    </th>
                    <th className="px-4 py-3 text-right text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                      Clients
                    </th>
                    <th className="px-4 py-3 text-right text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                      Rang réseau
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-[var(--navy-100)] last:border-0 hover:bg-[var(--ivory)]"
                    >
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-bold tabular-nums text-[var(--navy-300)]">
                          {c.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--navy)] text-[10px] font-bold text-white">
                            {cabinetInitials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[12.5px] font-semibold text-[var(--navy)]">
                              {c.name}
                            </div>
                            <div className="truncate text-[10.5px] text-[var(--navy-300)]">
                              {[c.city, c.director].filter(Boolean).join(" · ") || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--gold-deep)]">
                        {fmtEurCell(c.caGenere)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--navy)]">
                        {fmtEurCell(c.encours)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--navy-300)]">
                        {fmtCount(c.clients)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--navy-300)]">
                        {c.networkRank != null ? `#${c.networkRank}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!hasActivity && (
              <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                Les cabinets du réseau sont listés, mais aucune activité financière n&apos;est
                encore enregistrée (CA, encours et rang réseau apparaîtront à mesure que les
                commissions et souscriptions sont saisies).
              </p>
            )}
          </section>
        ) : (
          <EmptyState
            icon="🏆"
            title="Aucun cabinet licencié à classer"
            hint="Le classement de performance se construit dès qu'au moins un cabinet licencié est actif dans le réseau. Les rangs s'établissent ensuite à partir du CA généré, des encours et du rang réseau calculé."
          />
        )}
      </div>
    </>
  );
}
