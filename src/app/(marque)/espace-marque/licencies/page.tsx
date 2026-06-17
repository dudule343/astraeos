import { Topbar } from "../../_components/Topbar";
import { EmptyState } from "../../../(dirigeant)/_components/EmptyState";
import { KpiCard, type KpiBlock } from "../../../(editeur)/_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../../../(editeur)/_components/PageHeader";
import {
  fetchNetworkCabinets,
  computeNetworkPerfKpis,
  rankNetworkCabinets,
  fmtEurCell,
  fmtCount,
  cabinetInitials,
} from "../../_data/network";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Marque · Licenciés",
};

export default async function LicenciesPage() {
  // Scope RÉSEAU : tous les cabinets actifs du tenant (fetchNetworkCabinets
  // filtre is_active et trie déjà par CA généré décroissant).
  const cabinets = await fetchNetworkCabinets();
  const kpis = computeNetworkPerfKpis(cabinets);
  const ranked = rankNetworkCabinets(cabinets);

  const hasCabinets = cabinets.length > 0;
  const hasActivity = kpis.caTotal > 0 || kpis.encoursTotal > 0;

  const kpiBlocks: KpiBlock[] = [
    {
      label: "Licenciés actifs",
      value: kpis.cabinetsCount > 0 ? String(kpis.cabinetsCount) : "—",
      meta: "cabinets actifs du tenant · is_active",
    },
    {
      label: "Clients · réseau",
      value: fmtCount(kpis.clientsTotal),
      meta: "total_clients_cached cumulé",
    },
    {
      label: "CA généré · réseau",
      value: fmtEurCell(kpis.caTotal).replace(" €", ""),
      unit: kpis.caTotal > 0 ? "€" : undefined,
      meta: "commissions encaissées · part cabinets",
      valueTone: "gold",
    },
    {
      label: "Encours sous gestion",
      value: fmtEurCell(kpis.encoursTotal).replace(" €", ""),
      unit: kpis.encoursTotal > 0 ? "€" : undefined,
      meta: "total_aum_cached cumulé · réseau",
    },
  ];

  return (
    <>
      <Topbar current="Licenciés" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow={`Réseau · ${kpis.cabinetsCount} licencié${kpis.cabinetsCount > 1 ? "s" : ""}`}
          title="Les licenciés du réseau"
          description="Portefeuille des cabinets de gestion de patrimoine du réseau : implantation, dirigeant, clients servis, chiffre d'affaires généré, encours sous gestion et rang réseau. Tous les cabinets actifs du tenant, classés par chiffre d'affaires généré."
          actions={<GhostButton>Export</GhostButton>}
        />

        <section className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Synthèse · portefeuille de licenciés
        </section>
        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpiBlocks.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <SectionHeader
          eyebrow="Détail · cabinets licenciés"
          title="Portefeuille du réseau"
          right={
            hasCabinets ? (
              <span className="rounded-full bg-[var(--gold-200)] px-3 py-1 text-[11px] font-bold text-[var(--medium-400)]">
                {kpis.cabinetsCount} cabinet{kpis.cabinetsCount > 1 ? "s" : ""}
              </span>
            ) : undefined
          }
        />

        {hasCabinets ? (
          <>
            <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                    <th className="w-12 px-4 py-3">Rang</th>
                    <th className="px-4 py-3">Cabinet</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Dirigeant</th>
                    <th className="px-4 py-3 text-right">Clients</th>
                    <th className="px-4 py-3 text-right">CA généré</th>
                    <th className="px-4 py-3 text-right">Encours</th>
                    <th className="px-4 py-3 text-right">Rang réseau</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((c) => {
                    const isPodium = c.rank <= 3;
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-[var(--navy-100)] last:border-0 hover:bg-[var(--light-blue)]"
                      >
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`text-[13px] font-bold tabular-nums ${
                              isPodium ? "text-[var(--gold)]" : "text-[var(--navy-300)]"
                            }`}
                          >
                            {c.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--navy)] text-[10px] font-bold text-white">
                              {cabinetInitials(c.name)}
                            </div>
                            <span className="font-semibold text-[var(--navy)]">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--navy-300)]">{c.city ?? "—"}</td>
                        <td className="px-4 py-3 text-[var(--navy)]">
                          {c.director ?? <span className="text-[var(--navy-300)]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--navy)]">
                          {fmtCount(c.clients)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold tabular-nums ${
                            c.caGenere > 0 ? "text-[var(--gold-deep)]" : "text-[var(--navy-300)]"
                          }`}
                        >
                          {fmtEurCell(c.caGenere)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold tabular-nums ${
                            isPodium && c.encours > 0 ? "text-[var(--gold)]" : "text-[var(--navy)]"
                          }`}
                        >
                          {fmtEurCell(c.encours)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--navy-300)]">
                          {c.rankCached != null ? `#${c.rankCached}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-sm bg-[var(--gold-200)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--medium-400)]">
                            Licence
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!hasActivity && (
              <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                Les cabinets du réseau sont listés, mais aucune activité financière n&apos;est encore
                enregistrée — le CA généré, les encours et le rang réseau apparaîtront à mesure que
                les commissions et souscriptions sont saisies.
              </p>
            )}
          </>
        ) : (
          <EmptyState
            icon="🏢"
            title="Aucun cabinet licencié sur le réseau"
            hint="Dès qu'un cabinet sera rattaché à ce tenant, il apparaîtra ici avec son dirigeant, ses clients, son chiffre d'affaires généré et son encours sous gestion."
          />
        )}
      </div>
    </>
  );
}
