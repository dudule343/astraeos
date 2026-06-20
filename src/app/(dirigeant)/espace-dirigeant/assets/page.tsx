import { Topbar } from "../../_components/Topbar";
import { ExportButton } from "../../_components/ExportButton";
import { EmptyState } from "../../_components/EmptyState";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero, SectionHeader } from "@/app/_components/shared/PageHeader";
import {
  fetchCabinetCommissions,
  fetchCabinetDossiers,
  fetchCabinetProfile,
  computeAumByCategory,
  computeAumByAssetClass,
  fmtEur,
  fmtEurCell,
} from "../../_data/cabinet";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Encours & assets",
};

export default async function AssetsPage() {
  const [commissions, dossiers, profile] = await Promise.all([
    fetchCabinetCommissions(),
    fetchCabinetDossiers(),
    fetchCabinetProfile(),
  ]);

  const byCategory = computeAumByCategory(commissions);
  const byClass = computeAumByAssetClass(byCategory);
  const totalAum = byCategory.reduce((acc, r) => acc + r.aum, 0);
  const totalSubs = byCategory.reduce((acc, r) => acc + r.subs, 0);
  const clientsServed = new Set(dossiers.map((d) => d.client_id)).size;

  const hasData = totalAum > 0;

  const exportRows: (string | number)[][] = byCategory.map((r) => [
    r.label,
    r.subs,
    Math.round(r.aum),
    totalAum > 0 ? `${Math.round((r.aum / totalAum) * 100)}%` : "—",
  ]);

  const kpis: KpiBlock[] = [
    {
      label: "Encours total (AUM)",
      value: fmtEur(totalAum || profile?.total_aum_cached || 0),
      unit: totalAum > 0 || profile?.total_aum_cached ? "€" : undefined,
      meta: "somme des souscriptions du cabinet",
      valueTone: "gold",
    },
    {
      label: "Contrats actifs",
      value: totalSubs > 0 ? String(totalSubs) : "—",
      meta: "souscriptions en portefeuille",
    },
    {
      label: "Clients servis",
      value: clientsServed > 0 ? String(clientsServed) : "—",
      meta: "clients avec au moins un dossier",
    },
    {
      label: "Rang réseau",
      value: profile?.network_rank_cached ? `#${profile.network_rank_cached}` : "—",
      meta: "classement du cabinet dans le réseau",
    },
  ];

  return (
    <>
      <Topbar current="Encours & assets" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Développement"
          title="Encours & assets sous gestion"
          description="Encours total sous gestion (AUM) du cabinet, répartition par classe d'actifs et par produit. Calculé à partir des souscriptions enregistrées."
          actions={
            <ExportButton
              label="Export encours"
              filename="encours-cabinet"
              headers={["Produit", "Contrats", "Encours (€)", "Part"]}
              rows={hasData ? exportRows : []}
            />
          }
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {hasData ? (
          <>
            <section className="mb-8">
              <SectionHeader eyebrow="Répartition" title="Par classe d'actifs" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {byClass.map((c) => {
                  const pct = totalAum > 0 ? Math.round((c.aum / totalAum) * 100) : 0;
                  return (
                    <div
                      key={c.key}
                      className="rounded-md border border-[var(--navy-100)] bg-white p-4"
                    >
                      <div className="mb-1 flex items-baseline justify-between">
                        <div className="text-[13px] font-semibold text-[var(--navy)]">{c.label}</div>
                        <div className="text-[11px] font-semibold text-[var(--navy-300)]">{pct}%</div>
                      </div>
                      <div className="mb-2 text-[22px] font-bold leading-none text-[var(--gold-deep)]">
                        {fmtEurCell(c.aum)}
                      </div>
                      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[var(--navy-100)]">
                        <div
                          className="h-full rounded-full bg-[var(--gold)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <ul className="space-y-1">
                        {c.cats.map((cat) => (
                          <li
                            key={cat.key}
                            className="flex items-center justify-between text-[11.5px] text-[var(--navy-300)]"
                          >
                            <span>
                              {cat.label}{" "}
                              <span className="text-[10px]">
                                · {cat.subs} contrat{cat.subs > 1 ? "s" : ""}
                              </span>
                            </span>
                            <span className="tabular-nums text-[var(--navy)]">{fmtEurCell(cat.aum)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionHeader eyebrow="Détail" title="Encours par produit" />
              <div className="overflow-x-auto rounded-md border border-[var(--navy-100)] bg-white">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                      <th className="px-4 py-3">Produit</th>
                      <th className="px-4 py-3 text-right">Contrats</th>
                      <th className="px-4 py-3 text-right">Encours</th>
                      <th className="px-4 py-3 text-right">Part</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--navy-100)]">
                    {byCategory.map((r) => (
                      <tr key={r.key} className="text-[12px] text-[var(--navy)]">
                        <td className="px-4 py-3 font-semibold">{r.label}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{r.subs}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmtEurCell(r.aum)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {totalAum > 0 ? `${Math.round((r.aum / totalAum) * 100)}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[var(--navy-100)] bg-[var(--ivory)] text-[12px] font-bold text-[var(--navy)]">
                      <td className="px-4 py-3">Total</td>
                      <td className="px-4 py-3 text-right tabular-nums">{totalSubs}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtEurCell(totalAum)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </>
        ) : (
          <EmptyState
            icon="📊"
            title="Aucun encours enregistré"
            hint="L'encours sous gestion se calcule à partir des souscriptions des clients du cabinet. Dès qu'un produit est souscrit dans un dossier, il apparaît ici réparti par classe d'actifs."
          />
        )}
      </div>
    </>
  );
}
