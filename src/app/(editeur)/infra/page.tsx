import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";
import { fetchInfra, fmtEur, fmtBytes } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Infrastructure",
};

// Métriques supervisées hors application (Supabase Platform / Cloudflare / APM) :
// aucune table métier ne les stocke → état vide honnête, jamais de chiffre inventé.
const SUPERVISED = "supervisé hors application";

export default async function InfraPage() {
  const infra = await fetchInfra();
  const stockage = fmtBytes(infra.stockageBytes);

  // Bloc 1 — Stabilité / disponibilité. Aucune source en base : tout en "—".
  const stabilityKpis: KpiBlock[] = [
    { phase: "1", label: "Disponibilité 30 jours", value: "—", meta: SUPERVISED },
    { phase: "1", label: "Temps de réponse moyen", value: "—", meta: SUPERVISED },
    { phase: "1", label: "Erreurs serveur 5xx", value: "—", meta: SUPERVISED },
    { phase: "1", label: "Incidents 30j", value: "—", meta: SUPERVISED },
  ];

  // Bloc 2 — Consommation IA. Seul le coût mensuel est dérivable (etudes.total_ai_cost_eur).
  const aiKpis: KpiBlock[] = [
    {
      phase: "1",
      label: "Tokens consommés ce mois",
      value: "—",
      meta: "non mesuré en base",
    },
    {
      phase: "1",
      label: "Coût IA mensuel",
      value: fmtEur(infra.coutIaMois),
      meta:
        infra.coutIaMois != null
          ? `${infra.etudesMoisCount} étude${infra.etudesMoisCount > 1 ? "s" : ""} ce mois`
          : "aucune étude facturée ce mois",
      valueTone: infra.coutIaMois != null ? "gold" : undefined,
    },
    { phase: "1", label: "Marge IA brute", value: "—", meta: "revenus IA non modélisés" },
  ];

  // Bloc 3 — Infrastructure cloud. Seul le stockage documents est dérivable.
  const cloudKpis: KpiBlock[] = [
    { phase: "1", label: "Coût cloud mensuel", value: "—", meta: SUPERVISED },
    {
      phase: "1",
      label: "Stockage documents",
      value: stockage.value,
      unit: stockage.unit || undefined,
      meta:
        infra.stockageBytes != null
          ? `${infra.documentsCount} document${infra.documentsCount > 1 ? "s" : ""} client${infra.documentsCount > 1 ? "s" : ""}`
          : "aucun document stocké",
    },
    { phase: "1", label: "Bande passante", value: "—", meta: SUPERVISED },
  ];

  return (
    <>
      <Topbar current="08 · Infrastructure" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 08 · Infrastructure"
          title="Infrastructure"
          description="Superviser la stabilité technique de la plateforme — disponibilité, temps de réponse serveur, consommation IA et cloud, jobs automatiques."
          actions={<GhostButton dataStub="Export Infrastructure">Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader eyebrow="Stabilité" title="Disponibilité de la plateforme" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stabilityKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[var(--navy-300)]">
            Disponibilité, latence, erreurs serveur et incidents sont supervisés au niveau
            de l&apos;hébergement (Supabase, Cloudflare) et ne sont pas exposés dans
            l&apos;application.
          </p>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Consommation IA"
            title="Usage des modèles d'intelligence artificielle"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {aiKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[var(--navy-300)]">
            Coût IA dérivé du coût cumulé des études produites ce mois. Le détail tokens et
            la marge ne sont pas suivis en base.
          </p>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Infrastructure cloud"
            title="Consommation des ressources serveur"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {cloudKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[var(--navy-300)]">
            Le stockage reflète le volume réel des documents clients du cabinet. Coût cloud
            et bande passante sont facturés par l&apos;hébergeur, hors application.
          </p>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Automatisations"
            title="Tâches planifiées de la plateforme · jobs automatiques"
          />
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">Job automatique</th>
                  <th className="px-4 py-3">Fréquence</th>
                  <th className="px-4 py-3">Dernière exécution</th>
                  <th className="px-4 py-3 text-right">Durée</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-[12.5px] text-[var(--navy-300)]"
                  >
                    Aucune tâche planifiée enregistrée. Le suivi des jobs automatiques
                    (cron, exécutions, durées) n&apos;est pas instrumenté en base.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
