import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero, SectionHeader, GhostButton, GoldButton } from "@/app/_components/shared/PageHeader";
import {
  fetchSanteClients,
  fmtJoursDepuis,
  fmtNombre,
  pct,
  type CabinetHealth,
} from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Santé clients",
};

const typeBadgeClass = "bg-[var(--light-blue)] text-[var(--navy)]";

// Tonalité du badge "jours d'inactivité" : >30j = danger, sinon avertissement.
function inactiviteTone(days: number | null): "warning" | "danger" {
  if (days === null) return "danger";
  return days > 30 ? "danger" : "warning";
}

const inactiviteToneClass = {
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  danger: "bg-[var(--red-bg)] text-[var(--red-text)]",
} as const;

export default async function HealthPage() {
  const s = await fetchSanteClients();

  // KPIs dérivés de signaux réels (fraîcheur d'activité des cabinets du réseau).
  // Pas de "score santé composite" : aucune source en base — on mesure l'activité.
  const distributionKpis: KpiBlock[] = [
    {
      label: "Comptes en bonne santé",
      value: s.hasData && s.sains > 0 ? String(s.sains) : "—",
      meta: s.hasData
        ? `${pct(s.sains, s.totalCabinets)} du réseau · actif < 14 j`
        : "actif < 14 j",
      trend: s.sains > 0 ? "up" : undefined,
    },
    {
      label: "Comptes à surveiller",
      value: s.hasData && s.surveiller > 0 ? String(s.surveiller) : "—",
      meta: s.hasData
        ? `${pct(s.surveiller, s.totalCabinets)} · activité 14–30 j`
        : "activité 14–30 j",
    },
    {
      label: "Comptes à risque",
      value: s.hasData && s.risque > 0 ? String(s.risque) : "—",
      meta: s.hasData
        ? `${pct(s.risque, s.totalCabinets)} · inactif > 30 j ou sans signal`
        : "inactif > 30 j ou sans signal",
      trend: s.risque > 0 ? "down" : undefined,
    },
    {
      label: "Cabinets actifs",
      value: s.hasData && s.totalCabinets > 0 ? `${s.actifs}/${s.totalCabinets}` : "—",
      meta: "comptes actifs sur le réseau",
    },
  ];

  const aRisque: CabinetHealth[] = s.aRisque;

  return (
    <>
      <Topbar current="05 · Santé clients" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 05 · Santé clients"
          title="Santé clients"
          description="Activité et fraîcheur des cabinets du réseau — détection précoce des comptes inactifs à partir des dossiers, études et connexions réelles."
          actions={<GhostButton dataStub="Export Santé clients">Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader
            eyebrow="Distribution du portefeuille"
            title="Répartition par état d'activité"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {distributionKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="À surveiller" title="Comptes inactifs à risque" />
          {aRisque.length > 0 ? (
            <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                    <th className="px-4 py-3">Compte</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-center">Inactivité</th>
                    <th className="px-4 py-3">Signal d&apos;alerte</th>
                    <th className="px-4 py-3">Dernière activité</th>
                    <th className="px-4 py-3 text-right">Dossiers actifs</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--navy-100)]">
                  {aRisque.map((row) => {
                    const tone = inactiviteTone(row.daysSinceActivity);
                    return (
                      <tr
                        key={row.id}
                        className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--navy)] text-[11px] font-bold text-white">
                              {row.initials}
                            </div>
                            <span className="font-semibold">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${typeBadgeClass}`}
                          >
                            Cabinet
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${inactiviteToneClass[tone]}`}
                          >
                            {row.daysSinceActivity === null
                              ? "—"
                              : `${row.daysSinceActivity} j`}
                          </span>
                        </td>
                        <td className="px-4 py-3">{row.signal}</td>
                        <td className="px-4 py-3 text-[var(--navy-300)]">
                          {fmtJoursDepuis(row.daysSinceActivity)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {fmtNombre(row.dossiersActifs)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <GoldButton
                            dataStub="Briefer la relation client"
                            dataStubBody="Le déclenchement d'un brief relation client (création d'une tâche de suivi pour ce compte à risque) sera disponible dans une prochaine itération."
                          >
                            Briefer la relation client
                          </GoldButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
              <div className="mb-3 text-[34px] leading-none">✅</div>
              <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
                {s.hasData ? "Aucun compte à risque détecté" : "Aucune donnée d'activité"}
              </div>
              <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
                {s.hasData
                  ? "Tous les cabinets du réseau ont une activité récente (dossiers, études ou connexions). Aucun compte inactif depuis plus de 30 jours."
                  : "Les indicateurs de santé se construisent à partir de l'activité réelle des cabinets — dossiers, études livrées et connexions. Aucun signal disponible pour l'instant."}
              </p>
            </div>
          )}
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Méthodologie" title="Comment l'état d'activité est calculé" />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
            <span>ℹ️</span>
            <div>
              L&apos;état d&apos;un compte est dérivé de sa <strong>fraîcheur d&apos;activité
              réelle</strong> — date de dernière activité des dossiers, dernière connexion des
              utilisateurs, et études créées sur 30 jours. Aucun score composite ni indicateur de
              paiement n&apos;est calculé tant que ces sources ne sont pas disponibles en base.
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--gold-200)] text-xl">
                🟢
              </div>
              <div className="mb-1 text-[12px] font-semibold text-[var(--navy)]">
                Bonne santé · activité &lt; 14 j
              </div>
              <div className="text-[12px] leading-relaxed text-[var(--navy-300)]">
                Dernière activité (dossier, étude ou connexion) il y a moins de 14 jours.
              </div>
            </div>
            <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--gold-200)] text-xl">
                🟠
              </div>
              <div className="mb-1 text-[12px] font-semibold text-[var(--navy)]">
                À surveiller · 14 à 30 j
              </div>
              <div className="text-[12px] leading-relaxed text-[var(--navy-300)]">
                Activité ralentie : aucun signal entre 14 et 30 jours.
              </div>
            </div>
            <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--gold-200)] text-xl">
                🔴
              </div>
              <div className="mb-1 text-[12px] font-semibold text-[var(--navy)]">
                À risque · &gt; 30 j ou sans signal
              </div>
              <div className="text-[12px] leading-relaxed text-[var(--navy-300)]">
                Inactif depuis plus de 30 jours, ou aucune activité enregistrée.
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
