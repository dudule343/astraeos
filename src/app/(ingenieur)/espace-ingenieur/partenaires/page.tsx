import type { ReactNode } from "react";

import { GhostButton, GoldButton, SectionHeader } from "@/app/_components/shared/PageHeader";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";

import { PageScaffold } from "../../_components/PageScaffold";

const KPIS: KpiBlock[] = [
  { label: "Partenaires actifs", value: "—", meta: "recommandables + apporteurs" },
  {
    label: "Recommandés au client",
    value: "—",
    meta: "notaires, avocats, comptables identifiés",
  },
  { label: "Apporteurs d'affaires", value: "—", meta: "amènent des clients au cabinet" },
  { label: "Affaires apportées 2026", value: "—", meta: "clients entrés via apporteurs" },
];

const RECO_FILTERS = ["Tous", "Notaires", "Avocats", "Experts-comptables"];
const RECO_COLS = [
  "Partenaire",
  "Profession",
  "Localisation",
  "Spécialité",
  "Dossiers traités 2026",
  "Actions",
];

const APPORTEUR_FILTERS = [
  "Tous",
  "Pros (avocat·notaire·EC)",
  "Agents immobiliers",
  "Clients ambassadeurs",
  "Médias / influence",
];
const APPORTEUR_COLS = [
  "Apporteur",
  "Profil",
  "Dossier concerné",
  "Affaires totales apportées",
  "CA généré cumul",
  "Statut",
  "Actions",
];

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      data-stub={`Filtre · ${label}`}
      data-stub-mode="toast"
      className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${
        active
          ? "border border-[var(--gold)] bg-[var(--gold-100)] text-[var(--gold-deep)]"
          : "border border-[var(--navy-100)] bg-white text-[var(--navy-300)] hover:border-[var(--gold)]"
      }`}
    >
      {label}
    </button>
  );
}

function PartnerTable({
  count,
  filters,
  columns,
  emptyLabel,
}: {
  count: string;
  filters: string[];
  columns: string[];
  emptyLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--navy-100)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[13px] font-bold text-[var(--navy)]">{count}</span>
          {filters.map((f, i) => (
            <FilterChip key={f} label={f} active={i === 0} />
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[12px] text-[var(--navy-300)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3.5 w-3.5"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            disabled
            placeholder="Rechercher..."
            title="En cours de construction"
            className="w-32 bg-transparent text-[12px] text-[var(--navy)] placeholder:text-[var(--navy-300)] focus:outline-none"
          />
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)]">
            {columns.map((c, i) => (
              <th
                key={c}
                className={`px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)] ${
                  i === columns.length - 1 ? "text-center" : "text-left"
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} className="px-4 py-12 text-center">
              <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
                {emptyLabel}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function SectionBlock({ children }: { children: ReactNode }) {
  return <section className="mb-8">{children}</section>;
}

export default function PartenairesPage() {
  return (
    <PageScaffold
      eyebrow="Partenaires · environnement professionnel · Cabinet Paris Étoile"
      title="Partenaires & apporteurs d'affaires"
      description="Deux populations distinctes : les partenaires recommandables que PRIVEOS active pour ses clients (notaires, avocats, experts comptables identifiés et qualifiés), et les apporteurs d'affaires qui amènent des clients à notre réseau (avocats, notaires, comptables, agents immo, clients satisfaits, podcasteurs...)."
      actions={
        <>
          <GhostButton dataStub="Exporter le carnet">Exporter</GhostButton>
          <GoldButton dataStub="Nouveau partenaire">Nouveau partenaire</GoldButton>
        </>
      }
    >
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <SectionBlock>
        <SectionHeader
          eyebrow="1 · Partenaires identifiés et qualifiés par PRIVEOS"
          title="Partenaires à qui je transmets des clients"
          right={
            <span className="text-[11.5px] text-[var(--navy-300)]">
              Notaires · Avocats · Experts-comptables que les ingénieurs peuvent activer pour un
              dossier
            </span>
          }
        />
        <PartnerTable
          count="Partenaires recommandables"
          filters={RECO_FILTERS}
          columns={RECO_COLS}
          emptyLabel="Aucun partenaire recommandable enregistré pour le moment. Ajoutez vos notaires, avocats et experts-comptables qualifiés via « Nouveau partenaire »."
        />
      </SectionBlock>

      <SectionBlock>
        <SectionHeader
          eyebrow="2 · Personnes qui amènent des clients à PRIVEOS et au cabinet"
          title="Apporteurs d'affaires"
          right={
            <span className="text-[11.5px] text-[var(--navy-300)]">
              Avocats · Notaires · Comptables · Agents immo · Clients satisfaits · Podcasteurs ·
              Influenceurs
            </span>
          }
        />
        <PartnerTable
          count="Apporteurs d'affaires"
          filters={APPORTEUR_FILTERS}
          columns={APPORTEUR_COLS}
          emptyLabel="Aucun apporteur d'affaires enregistré pour le moment. Les apporteurs apparaîtront ici dès qu'un dossier leur sera rattaché."
        />

        <div className="mt-4 rounded-md border-l-[3px] border-[var(--gold)] bg-[var(--ivory)] px-4 py-3 text-[11px] leading-relaxed text-[var(--navy-300)]">
          <strong className="text-[var(--navy)]">Lecture :</strong> chaque apporteur peut amener
          plusieurs dossiers. La colonne{" "}
          <strong className="text-[var(--gold-deep)]">Affaires totales apportées</strong> donne la
          vue cumulée pour identifier les apporteurs récurrents et fidéliser la relation.
        </div>
      </SectionBlock>
    </PageScaffold>
  );
}
