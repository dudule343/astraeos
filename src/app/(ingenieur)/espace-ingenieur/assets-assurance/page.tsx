import Link from "next/link";

import { PageScaffold, EmptyState } from "../../_components/PageScaffold";

export const dynamic = "force-dynamic";

/**
 * Assets du portefeuille · Assurance.
 *
 * La maquette présente 3 KPIs (contrats actifs, clients concernés, frais de dossier),
 * un tableau détaillé des contrats par client, et un tableau « top produits ».
 * Ces chiffres et lignes sont des données dynamiques par client/contrat : il n'existe
 * aucune table de contrats d'assurance dans la base. On reproduit donc fidèlement la
 * structure (hero, KPIs, tableaux, libellés de colonnes et de produits) mais on affiche
 * un état vide honnête tant que la source n'est pas branchée — jamais de fausse donnée.
 */

// Libellés informatifs des KPIs de la maquette (structure, pas la donnée chiffrée).
const KPI_LABELS = [
  { label: "Contrats actifs", meta: "tous types confondus · portefeuille" },
  { label: "Clients concernés", meta: "clients du portefeuille avec assurance" },
  {
    label: "Frais de dossier appliqués au client",
    meta: "cumul 2026 · facturés directement par vous",
  },
] as const;

// Familles de produits d'assurance distribuables (information de la maquette).
const PRODUITS = [
  "Mutuelle dirigeant",
  "Prévoyance pro",
  "Emprunteur immobilier",
  "Assurance pro",
  "Homme clé",
] as const;

function KpiPlaceholder({ label, meta }: { label: string; meta: string }) {
  return (
    <div className="rounded-md border border-[var(--navy-100)] bg-white p-4">
      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
        {label}
      </div>
      <div className="mb-1 text-[24px] font-bold leading-none text-[var(--navy-300)]">—</div>
      <div className="text-[11px] text-[var(--navy-300)]">{meta}</div>
    </div>
  );
}

export default function AssetsAssurancePage() {
  return (
    <PageScaffold
      eyebrow="Assets du portefeuille · assurance"
      title="Assurance"
      description="Détail des contrats d'assurance distribués via votre portefeuille (emprunteur immo, prêt conso, prévoyance pro, mutuelle dirigeant, homme clé). Frais de dossier appliqués au client."
      actions={
        <>
          <Link
            href="/espace-ingenieur/assets"
            className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
          >
            ← Retour vue d&apos;ensemble
          </Link>
          <button
            type="button"
            disabled
            title="En cours de construction · disponible une fois les contrats d'assurance branchés"
            className="cursor-not-allowed rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white opacity-50"
          >
            Exporter
          </button>
        </>
      }
    >
      {/* 3 KPIs : Contrats actifs · Clients concernés · Frais appliqués clients */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {KPI_LABELS.map((k) => (
          <KpiPlaceholder key={k.label} label={k.label} meta={k.meta} />
        ))}
      </div>

      {/* Détail de mes contrats d'assurance */}
      <div className="mb-5 rounded-lg border border-[var(--navy-100)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-5 py-3.5">
          <div className="text-[13.5px] font-bold text-[var(--navy)]">
            Détail de mes contrats d&apos;assurance
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-5 py-2.5">Clients</th>
                <th className="px-5 py-2.5 text-right">Contrats actifs</th>
                <th className="px-5 py-2.5">Types souscrits</th>
                <th className="px-5 py-2.5">Dates de souscription</th>
                <th className="px-5 py-2.5 text-right">Frais de dossier perçus</th>
                <th className="px-5 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[12.5px] text-[var(--navy-300)]"
                >
                  Aucun contrat d&apos;assurance pour le moment. Les contrats de vos clients
                  apparaîtront ici dès que cette rubrique sera branchée sur leurs données.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top produits d'assurance placés par le portefeuille */}
      <div className="rounded-lg border border-[var(--navy-100)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-5 py-3.5">
          <div className="text-[13.5px] font-bold text-[var(--navy)]">
            Top produits d&apos;assurance placés par le portefeuille
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-5 py-2.5">Produit</th>
                <th className="px-5 py-2.5 text-right">Contrats</th>
                <th className="px-5 py-2.5 text-right">Frais perçus</th>
              </tr>
            </thead>
            <tbody>
              {PRODUITS.map((p) => (
                <tr key={p} className="border-t border-[var(--navy-100)]">
                  <td className="px-5 py-3 font-semibold text-[var(--navy)]">{p}</td>
                  <td className="px-5 py-3 text-right text-[var(--navy-300)]">—</td>
                  <td className="px-5 py-3 text-right text-[var(--navy-300)]">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[var(--navy-100)] px-5 py-3">
          <EmptyState>
            Le volume placé par famille de produit s&apos;affichera ici une fois les contrats
            d&apos;assurance de votre portefeuille connectés.
          </EmptyState>
        </div>
      </div>
    </PageScaffold>
  );
}
