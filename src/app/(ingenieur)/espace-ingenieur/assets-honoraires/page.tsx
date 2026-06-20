import Link from "next/link";

import { PageScaffold } from "../../_components/PageScaffold";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { GoldButton, SectionHeader } from "@/app/_components/shared/PageHeader";
import { fetchHonoraires, formatEuros, type HonoraireRow } from "./honoraires-data";
import { TemplateDownloads } from "./TemplateDownloads";

export const dynamic = "force-dynamic";

function formatDateFr(date: string | null): string {
  if (!date) return "—";
  const t = new Date(date);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default async function AssetsHonorairesPage() {
  const { rows, studyCount, totalHt, averageHt } = await fetchHonoraires();
  const hasData = rows.length > 0;

  const kpis: KpiBlock[] = [
    {
      label: "Études et missions réalisées",
      value: hasData ? String(studyCount) : "—",
      valueTone: "gold",
      meta: "cumul 2026 · portefeuille",
    },
    {
      label: "Honoraires HT facturés",
      value: hasData ? formatEuros(totalHt).replace(" €", "") : "—",
      unit: hasData ? "€" : undefined,
      meta: "cumul 2026 · portefeuille",
    },
    {
      label: "Honoraire moyen",
      value: hasData && averageHt != null ? formatEuros(averageHt).replace(" €", "") : "—",
      unit: hasData && averageHt != null ? "€" : undefined,
      meta: "moyenne du portefeuille",
    },
  ];

  return (
    <PageScaffold
      eyebrow="Assets du portefeuille · honoraires de conseil"
      title="Honoraires de conseil"
      description="Détail de vos études patrimoniales facturées : études réalisées, frais d'études, honoraires moyens."
      actions={
        <>
          <Link
            href="/espace-ingenieur/assets"
            className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
          >
            ← Retour vue d&apos;ensemble
          </Link>
          <GoldButton
            dataStub="Export des honoraires"
            dataStubBody="L'export du détail des honoraires sera disponible prochainement."
          >
            Exporter
          </GoldButton>
        </>
      }
    >
      <div className="mb-5 grid grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <section className="mb-5">
        <SectionHeader
          eyebrow="Détail"
          title="Détail de mes études patrimoniales"
          right={
            <span className="text-[11px] text-[var(--navy-300)]">
              {hasData
                ? `${studyCount} étude${studyCount > 1 ? "s" : ""} réalisée${studyCount > 1 ? "s" : ""} · cliquez pour le détail client`
                : "aucune étude facturée pour le moment"}
            </span>
          }
        />
        {hasData ? (
          <DetailTable rows={rows} totalHt={totalHt} studyCount={studyCount} />
        ) : (
          <EmptyCard>
            Aucune étude patrimoniale facturée pour le moment. Les études restituées à vos
            clients apparaîtront ici avec leurs honoraires.
          </EmptyCard>
        )}
      </section>

      <section className="mb-5">
        <SectionHeader eyebrow="Analyse" title="Répartition par type de mission du portefeuille" />
        <EmptyCard>
          La répartition par type de mission (étude patrimoniale, optimisation de la
          rémunération du gérant, immatriculation de société…) sera disponible dès que la
          qualification des missions sera renseignée sur vos dossiers.
        </EmptyCard>
      </section>

      <section>
        <SectionHeader eyebrow="Documents" title="Modèles contractuels" />
        <TemplateDownloads />
      </section>
    </PageScaffold>
  );
}

function DetailTable({
  rows,
  totalHt,
  studyCount,
}: {
  rows: HonoraireRow[];
  totalHt: number;
  studyCount: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--navy-100)] bg-white">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-[var(--navy)] text-left text-[10.5px] uppercase tracking-[0.06em] text-white">
            <th className="px-4 py-2.5 font-semibold">Clients</th>
            <th className="px-4 py-2.5 font-semibold">Entrée en relation</th>
            <th className="px-4 py-2.5 font-semibold">Date de l&apos;étude</th>
            <th className="px-4 py-2.5 text-right font-semibold">Honoraires facturés</th>
            <th className="px-4 py-2.5 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={i % 2 === 1 ? "bg-[var(--ivory)]" : "bg-white"}>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5">
                <Link
                  href={`/dossiers/${r.id}`}
                  className="flex items-center gap-2.5 hover:text-[var(--gold)]"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--gold-300)] bg-[var(--light-blue)] text-[10px] font-bold text-[var(--navy)]">
                    {initials(r.clientName)}
                  </span>
                  <span className="font-semibold text-[var(--navy)]">{r.clientName}</span>
                </Link>
              </td>
              <td className="whitespace-nowrap border-b border-[var(--navy-100)] px-4 py-2.5 text-[11px] text-[var(--navy-300)]">
                {formatDateFr(r.entryDate)}
              </td>
              <td className="whitespace-nowrap border-b border-[var(--navy-100)] px-4 py-2.5 text-[11px] text-[var(--navy-300)]">
                {formatDateFr(r.studyDate)}
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-right font-semibold text-[var(--gold-deep)]">
                {formatEuros(r.honoraires)}
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-center">
                <Link
                  href={`/dossiers/${r.id}`}
                  className="inline-block rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                >
                  Voir →
                </Link>
              </td>
            </tr>
          ))}
          <tr className="bg-[var(--gold-200)] font-bold text-[var(--navy)]">
            <td className="px-4 py-2.5">Total portefeuille</td>
            <td className="px-4 py-2.5 text-center text-[11.5px]" colSpan={2}>
              {studyCount} étude{studyCount > 1 ? "s" : ""} facturée{studyCount > 1 ? "s" : ""}
            </td>
            <td className="px-4 py-2.5 text-right text-[var(--gold-deep)]">
              {formatEuros(totalHt)}
            </td>
            <td className="px-4 py-2.5" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--navy-100)] bg-white p-10 text-center">
      <div className="mb-1 text-[13px] font-semibold text-[var(--navy)]">
        Aucune donnée pour le moment
      </div>
      <p className="mx-auto max-w-lg text-[12px] leading-relaxed text-[var(--navy-300)]">
        {children}
      </p>
    </div>
  );
}
