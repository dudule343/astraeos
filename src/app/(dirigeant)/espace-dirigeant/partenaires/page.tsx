import { Topbar } from "../../_components/Topbar";
import { ExportButton } from "../../_components/ExportButton";
import { EmptyState } from "../../_components/EmptyState";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero, SectionHeader } from "@/app/_components/shared/PageHeader";
import {
  fetchCabinetCommissions,
  computeBreakdownByPartner,
  fmtEur,
  fmtEurCell,
} from "../../_data/cabinet";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Partenaires & apporteurs",
};

export default async function PartenairesPage() {
  const commissions = await fetchCabinetCommissions();
  const byPartner = computeBreakdownByPartner(commissions);

  const totalVolume = byPartner.reduce((acc, p) => acc + p.generated, 0);
  const totalSubs = byPartner.reduce((acc, p) => acc + p.subs, 0);
  const named = byPartner.filter((p) => p.key !== "Sans partenaire");

  const hasData = totalVolume > 0 && named.length > 0;

  const exportRows: (string | number)[][] = named.map((p) => [
    p.label,
    p.subs,
    Math.round(p.generated),
    totalVolume > 0 ? `${Math.round((p.generated / totalVolume) * 100)}%` : "—",
  ]);

  const kpis: KpiBlock[] = [
    {
      label: "Partenaires actifs",
      value: named.length > 0 ? String(named.length) : "—",
      meta: "producteurs avec volume généré",
    },
    {
      label: "Volume d'affaires",
      value: fmtEur(totalVolume),
      unit: totalVolume > 0 ? "€" : undefined,
      meta: "commissions générées via partenaires",
      valueTone: "gold",
    },
    {
      label: "Souscriptions",
      value: totalSubs > 0 ? String(totalSubs) : "—",
      meta: "contrats placés chez des partenaires",
    },
  ];

  return (
    <>
      <Topbar current="Partenaires & apporteurs" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Développement"
          title="Partenaires & apporteurs d'affaires"
          description="Volume d'affaires généré par partenaire producteur, dérivé des produits souscrits dans les dossiers du cabinet."
          actions={
            <ExportButton
              label="Export partenaires"
              filename="partenaires-cabinet"
              headers={["Partenaire", "Souscriptions", "Volume généré (€)", "Part"]}
              rows={hasData ? exportRows : []}
            />
          }
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {hasData ? (
          <section>
            <SectionHeader eyebrow="Classement" title="Volume par partenaire" />
            <div className="overflow-x-auto rounded-md border border-[var(--navy-100)] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                    <th className="px-4 py-3">Partenaire</th>
                    <th className="px-4 py-3 text-right">Souscriptions</th>
                    <th className="px-4 py-3 text-right">Volume généré</th>
                    <th className="px-4 py-3 text-right">Part</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--navy-100)]">
                  {named.map((p) => (
                    <tr key={p.key} className="text-[12px] text-[var(--navy)]">
                      <td className="px-4 py-3 font-semibold">{p.label}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{p.subs}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtEurCell(p.generated)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {totalVolume > 0 ? `${Math.round((p.generated / totalVolume) * 100)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <EmptyState
            icon="🤝"
            title="Aucun partenaire avec volume"
            hint="Le volume par partenaire se construit à partir des produits (partner_name) souscrits dans les dossiers. Dès qu'un contrat est placé chez un producteur, il remonte ici avec son volume d'affaires."
          />
        )}
      </div>
    </>
  );
}
