import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";
import { fetchAcquisition, fmtInt, fmtPct, fmtEur } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Acquisition & conversion",
};

export default async function AcquisitionPage() {
  const a = await fetchAcquisition();

  const volumeKpis: KpiBlock[] = [
    {
      phase: "1",
      label: "Dossiers ouverts",
      value: a.dossiersOuverts30j > 0 ? String(a.dossiersOuverts30j) : "—",
      meta: "30 derniers jours",
    },
    {
      phase: "1",
      label: "Nouveaux prospects",
      value: a.nouveauxProspects > 0 ? String(a.nouveauxProspects) : "—",
      meta: "au stade prospect",
    },
    {
      phase: "1",
      label: "Dossiers en collecte",
      value: a.dossiersCollecte > 0 ? String(a.dossiersCollecte) : "—",
      meta: "collecte en cours",
    },
    {
      phase: "1",
      label: "Clients convertis",
      value: a.clientsConvertisMois > 0 ? String(a.clientsConvertisMois) : "—",
      meta: `signés en ${a.moisLabel}`,
    },
  ];

  const conversionKpis: KpiBlock[] = [
    {
      phase: "1",
      label: "Coût d'acquisition par canal",
      value: "—",
      meta: "donnée non disponible",
    },
    {
      phase: "1",
      label: "Durée moyenne de conversion",
      value: a.dureeConversionJours != null ? String(a.dureeConversionJours) : "—",
      unit: a.dureeConversionJours != null ? "jours" : undefined,
      meta: "entrée pipeline → étude livrée",
    },
    {
      phase: "1",
      label: "Taux de conversion global",
      value: fmtPct(a.tauxConversion),
      unit: a.tauxConversion != null ? "%" : undefined,
      meta: "dossiers convertis / total",
    },
  ];

  return (
    <>
      <Topbar current="02 · Acquisition & conversion" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 02 · Acquisition & conversion"
          title="Acquisition & conversion"
          description="Comprendre comment les prospects deviennent clients : du dossier prospect jusqu'à la signature, suivi des origines d'acquisition et de leur conversion."
          actions={<GhostButton>Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader
            eyebrow="Entonnoir de conversion"
            title="Du prospect au client signé"
          />
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-4">
            {a.dossiersActifs > 0 ? (
              <div className="flex flex-col gap-2">
                {a.funnel.map((stage) => (
                  <div
                    key={stage.stage}
                    className={`grid grid-cols-[180px_1fr_80px_60px] items-center gap-3 rounded-md border px-3 py-2 ${
                      stage.highlight
                        ? "border-[var(--gold)] bg-[var(--gold-200)]/30"
                        : "border-[var(--navy-100)] bg-[var(--ivory)]"
                    }`}
                  >
                    <span
                      className={`text-[12px] font-semibold ${stage.highlight ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}
                    >
                      {stage.label}
                    </span>
                    <div className="h-3 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                      <div
                        className={`h-full rounded-sm ${
                          stage.highlight ? "bg-[var(--gold)]" : "bg-[var(--navy)]"
                        }`}
                        style={{ width: `${stage.width}%` }}
                      />
                    </div>
                    <span
                      className={`text-right text-[14px] font-bold tabular-nums ${stage.highlight ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}
                    >
                      {stage.count > 0 ? fmtInt(stage.count) : "—"}
                    </span>
                    <span className="text-right text-[11px] font-semibold text-[var(--navy-300)]">
                      {stage.count > 0 ? `${stage.pct} %` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[12.5px] text-[var(--navy-300)]">
                Aucun dossier sur la période.
              </div>
            )}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Volumétrie de conversion"
            title="Indicateurs d'acquisition"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {volumeKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {conversionKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Origine des dossiers"
            title="Performance par source d'acquisition"
          />
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 text-right">Dossiers</th>
                  <th className="px-4 py-3 text-right">Convertis</th>
                  <th className="px-4 py-3 text-right">Taux de conversion</th>
                  <th className="px-4 py-3 text-right">AUM généré</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {a.sources.length > 0 ? (
                  a.sources.map((row) => (
                    <tr
                      key={row.key}
                      className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                    >
                      <td className="px-4 py-3 font-semibold">{row.label}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {fmtInt(row.dossiers)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {row.converted > 0 ? fmtInt(row.converted) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {row.convRate != null ? `${fmtPct(row.convRate)} %` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--gold)]">
                        {fmtEur(row.aum)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-[12.5px] text-[var(--navy-300)]"
                    >
                      Aucune origine d&apos;acquisition renseignée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
