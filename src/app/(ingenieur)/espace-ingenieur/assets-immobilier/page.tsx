import Link from "next/link";

import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";

import { EmptyState, PageScaffold } from "../../_components/PageScaffold";

/**
 * Investissement immobilier (assets du portefeuille).
 *
 * La maquette présente des données de portefeuille (KPIs chiffrés, projets
 * nominatifs, répartition par programme). Aucune source de projets immobiliers
 * client n'est branchée à ce jour : on conserve la STRUCTURE et le contenu
 * statique (types de programmes, libellés, méthodologie) mais on affiche un
 * état honnête à la place des chiffres et des lignes clients fabriqués.
 */

// Libellés statiques des KPIs repris de la maquette (sans valeur fabriquée).
const KPIS: KpiBlock[] = [
  {
    label: "Montant des investissements immobiliers traités",
    value: "—",
    unit: "€",
    meta: "cumul 2026 · projets réalisés",
    valueTone: "gold",
  },
  {
    label: "Projets réalisés",
    value: "—",
    meta: "aucun projet rattaché à votre portefeuille",
  },
  {
    label: "Ticket moyen par projet",
    value: "—",
    unit: "€",
    meta: "moyenne du portefeuille",
  },
];

// Catalogue statique des types de programme immobilier (info, pas de la donnée).
const PROGRAMMES = [
  "LMNP résidence services",
  "Projet Denormandie",
  "Ancien rénové",
  "Location nue",
];

export default function AssetsImmobilierPage() {
  return (
    <PageScaffold
      eyebrow="Assets du portefeuille · investissement immobilier"
      title="Investissement immobilier"
      description="Détail des projets immobiliers de votre portefeuille (LMNP, ancien rénové, Projet Denormandie, location nue)."
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
            title="En cours de construction · aucune donnée à exporter"
            className="cursor-not-allowed rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy-300)] opacity-50"
          >
            Exporter
          </button>
        </>
      }
    >
      <div className="mb-5 grid grid-cols-3 gap-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <section className="mb-5">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div className="text-[15px] font-semibold text-[var(--navy)]">
            Détail de mes projets immobiliers
          </div>
          <span className="text-[11px] text-[var(--navy-300)]">
            cliquez sur un client pour le détail
          </span>
        </div>
        <EmptyState>
          Aucun projet immobilier n&apos;est rattaché à votre portefeuille pour le
          moment. Les projets (LMNP, ancien rénové, Projet Denormandie, location
          nue) apparaîtront ici dès qu&apos;une mise en relation sera concrétisée.
        </EmptyState>
      </section>

      <section>
        <div className="mb-3 text-[15px] font-semibold text-[var(--navy)]">
          Répartition par type de programme du portefeuille
        </div>
        <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
          <div className="grid grid-cols-4 gap-4">
            {PROGRAMMES.map((p) => (
              <div
                key={p}
                className="rounded-lg bg-[var(--ivory)] p-4 text-center opacity-60"
              >
                <div className="text-[24px] font-bold leading-none text-[var(--navy-300)]">
                  —
                </div>
                <div className="mt-2 text-[11.5px] font-semibold text-[var(--navy-300)]">
                  {p}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-[var(--navy-300)]">
            La répartition par programme se calculera à partir des projets de votre
            portefeuille. Aucun projet n&apos;est encore comptabilisé.
          </p>
        </div>
      </section>
    </PageScaffold>
  );
}
