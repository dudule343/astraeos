import Link from "next/link";

import { PageScaffold, EmptyState } from "../../_components/PageScaffold";
import { GoldButton, SectionHeader } from "@/app/_components/shared/PageHeader";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import {
  fetchAssetsFinancier,
  fmtDateFr,
  fmtEur,
  type FinancierClient,
  type TopProduct,
} from "../../_data/assets-financier";

export const dynamic = "force-dynamic";

export default async function AssetsFinancierPage() {
  const data = await fetchAssetsFinancier();

  const kpis: KpiBlock[] = [
    {
      label: "Encours sous gestion",
      value: data.encoursTotal > 0 ? Math.round(data.encoursTotal).toLocaleString("fr-FR") : "—",
      unit: data.encoursTotal > 0 ? "€" : undefined,
      valueTone: "gold",
      meta:
        data.contratsActifs > 0
          ? `cumul placé via votre portefeuille · ${data.contratsActifs} contrat${data.contratsActifs > 1 ? "s" : ""} actif${data.contratsActifs > 1 ? "s" : ""}`
          : "aucun contrat financier actif pour le moment",
    },
    {
      label: "Clients investissement financier",
      value: data.clientsFinancier > 0 ? String(data.clientsFinancier) : "—",
      unit: data.clientsServis > 0 ? `/ ${data.clientsServis}` : undefined,
      meta: "clients en portefeuille concernés",
    },
  ];

  return (
    <PageScaffold
      eyebrow="Assets du portefeuille · investissement financier"
      title="Investissement financier"
      description="Détail de votre portefeuille financier · contrats placés, encours porté, clients concernés."
      actions={
        <>
          <Link
            href="/espace-ingenieur/assets"
            className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
          >
            ← Retour vue d&apos;ensemble
          </Link>
          <GoldButton
            dataStub="Export du portefeuille financier"
            dataStubBody="L'export du détail de vos placements en investissement financier sera disponible dans une prochaine itération."
          >
            Exporter
          </GoldButton>
        </>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>

      <section className="mb-5">
        <SectionHeader
          eyebrow="Portefeuille"
          title="Détail de mes placements en investissement financier"
          right={
            data.contratsActifs > 0 ? (
              <span className="text-[11px] text-[var(--navy-300)]">
                {data.contratsActifs} contrat{data.contratsActifs > 1 ? "s" : ""} actif
                {data.contratsActifs > 1 ? "s" : ""}
              </span>
            ) : undefined
          }
        />
        {data.clients.length > 0 ? (
          <PlacementsTable clients={data.clients} encoursTotal={data.encoursTotal} contrats={data.contratsActifs} clientsFinancier={data.clientsFinancier} clientsServis={data.clientsServis} />
        ) : (
          <EmptyState>
            Aucun placement en investissement financier dans votre portefeuille pour le moment.
            Les contrats apparaîtront ici dès qu&apos;une souscription financière sera enregistrée.
          </EmptyState>
        )}
      </section>

      <section>
        <SectionHeader eyebrow="Synthèse" title="Top produits placés par l'ingénieur" />
        {data.topProducts.length > 0 ? (
          <TopProductsTable products={data.topProducts} />
        ) : (
          <EmptyState>Aucun produit financier placé pour le moment.</EmptyState>
        )}
      </section>
    </PageScaffold>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--gold-300)] bg-[var(--light-blue)] text-[10px] font-bold text-[var(--navy)]">
      {initials}
    </span>
  );
}

function GoldBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-sm bg-[var(--gold-200)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--gold-deep)]">
      {children}
    </span>
  );
}

function PlacementsTable({
  clients,
  encoursTotal,
  contrats,
  clientsFinancier,
  clientsServis,
}: {
  clients: FinancierClient[];
  encoursTotal: number;
  contrats: number;
  clientsFinancier: number;
  clientsServis: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--navy-100)] bg-white">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-[var(--navy)] text-left text-[10.5px] uppercase tracking-[0.06em] text-white">
            <th className="px-4 py-2.5 font-semibold">Clients</th>
            <th className="px-4 py-2.5 text-right font-semibold">Contrats actifs</th>
            <th className="px-4 py-2.5 font-semibold">Types souscrits</th>
            <th className="px-4 py-2.5 font-semibold">Dates de souscription</th>
            <th className="px-4 py-2.5 text-right font-semibold">Encours total</th>
            <th className="px-4 py-2.5 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c, i) => (
            <tr key={c.clientId} className={i % 2 === 1 ? "bg-[var(--ivory)]" : "bg-white"}>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 align-middle">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={c.initials} />
                  <span className="font-semibold text-[var(--navy)]">{c.name}</span>
                </div>
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-right align-middle text-[var(--navy)]">
                {c.contracts.length}
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 align-middle leading-[1.9]">
                <div className="flex flex-col gap-1">
                  {c.contracts.map((ct, j) => (
                    <span key={j}>
                      <GoldBadge>{ct.categoryLabel}</GoldBadge>
                    </span>
                  ))}
                </div>
              </td>
              <td className="border-b border-[var(--navy-100)] whitespace-nowrap px-4 py-2.5 align-middle text-[11px] leading-[1.9] text-[var(--navy-300)]">
                <div className="flex flex-col">
                  {c.contracts.map((ct, j) => (
                    <span key={j}>{fmtDateFr(ct.subscriptionDate)}</span>
                  ))}
                </div>
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-right align-middle font-semibold text-[var(--gold-deep)]">
                {fmtEur(c.totalEncours)}
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-center align-middle">
                <Link
                  href={`/clients/${c.clientId}`}
                  className="inline-block rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                >
                  Voir →
                </Link>
              </td>
            </tr>
          ))}
          <tr className="bg-[var(--gold-200)] font-bold text-[var(--navy)]">
            <td className="px-4 py-2.5">Total portefeuille</td>
            <td className="px-4 py-2.5 text-right">{contrats}</td>
            <td className="px-4 py-2.5 text-center text-[11.5px]" colSpan={2}>
              {clientsFinancier} client{clientsFinancier > 1 ? "s" : ""}
              {clientsServis > 0 ? ` sur ${clientsServis}` : ""} · cumul
            </td>
            <td className="px-4 py-2.5 text-right text-[var(--gold-deep)]">{fmtEur(encoursTotal)}</td>
            <td className="px-4 py-2.5" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function TopProductsTable({ products }: { products: TopProduct[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--navy-100)] bg-white">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="bg-[var(--navy)] text-left text-[10.5px] uppercase tracking-[0.06em] text-white">
            <th className="px-4 py-2.5 font-semibold">Produit</th>
            <th className="px-4 py-2.5 text-right font-semibold">Placements</th>
            <th className="px-4 py-2.5 text-right font-semibold">Encours</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.label} className={i % 2 === 1 ? "bg-[var(--ivory)]" : "bg-white"}>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 font-semibold text-[var(--navy)]">
                {p.label}
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-right text-[var(--navy)]">
                {p.count}
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-right text-[var(--navy-300)]">
                {fmtEur(p.encours)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
