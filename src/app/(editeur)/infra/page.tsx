import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";

const stabilityKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Disponibilité 30 jours",
    value: "99,98",
    unit: "%",
    meta: "2 min d'indisponibilité",
  },
  { phase: "1", label: "Temps de réponse moyen", value: "142", unit: "ms", meta: "P95 : 380 ms" },
  {
    phase: "1",
    label: "Erreurs serveur 5xx",
    value: "0,03",
    unit: "%",
    meta: "stable · seuil < 0,1 %",
  },
  { phase: "1", label: "Incidents 30j", value: "0", meta: "aucun depuis 47 jours" },
];

const aiKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Tokens consommés ce mois",
    value: "42,6",
    unit: "M",
    meta: "42,6 millions ·",
    metaHighlight: { text: "▲ +18 %", tone: "up" },
  },
  {
    phase: "1",
    label: "Coût IA mensuel",
    value: "3 480",
    unit: "€",
    meta: "refacturé aux clients via packs",
  },
  { phase: "1", label: "Marge IA brute", value: "68", unit: "%", meta: "revenus IA / coûts IA" },
];

const cloudKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Coût cloud mensuel",
    value: "1 240",
    unit: "€",
    meta: "AWS + Cloudflare + Supabase",
  },
  {
    phase: "1",
    label: "Stockage utilisé",
    value: "428",
    unit: "Go",
    meta: "documents clients + backups",
  },
  { phase: "1", label: "Bande passante", value: "2,4", unit: "To", meta: "trafic sortant 30 jours" },
];

type Job = {
  name: string;
  frequency: string;
  lastRun: string;
  duration: string;
};

const jobs: Job[] = [
  {
    name: "Synchronisation ORIAS",
    frequency: "Quotidien · 03h00",
    lastRun: "06 mai · 03h00",
    duration: "42 s",
  },
  {
    name: "Recalcul scores santé",
    frequency: "Quotidien · 04h00",
    lastRun: "06 mai · 04h00",
    duration: "18 s",
  },
  {
    name: "Backup base de données",
    frequency: "Quotidien · 02h00",
    lastRun: "06 mai · 02h00",
    duration: "8 min",
  },
  {
    name: "Génération rapports hebdo",
    frequency: "Hebdomadaire · lun 06h00",
    lastRun: "05 mai · 06h00",
    duration: "2 min",
  },
  {
    name: "Relances facturation",
    frequency: "Hebdomadaire · jeu 09h00",
    lastRun: "02 mai · 09h00",
    duration: "14 s",
  },
  {
    name: "Nettoyage logs > 90 jours",
    frequency: "Mensuel · 1er du mois",
    lastRun: "01 mai · 03h30",
    duration: "3 min",
  },
];

export default function InfraPage() {
  return (
    <>
      <Topbar current="08 · Infrastructure" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 08 · Infrastructure"
          title="Infrastructure"
          description="Superviser la stabilité technique de la plateforme — disponibilité, temps de réponse serveur, consommation IA et cloud, jobs automatiques."
          actions={<GhostButton>Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader eyebrow="Stabilité" title="Disponibilité de la plateforme" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stabilityKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
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
              <tbody className="divide-y divide-[var(--navy-100)]">
                {jobs.map((job) => (
                  <tr
                    key={job.name}
                    className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                  >
                    <td className="px-4 py-3 font-semibold">{job.name}</td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{job.frequency}</td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{job.lastRun}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{job.duration}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block rounded-full bg-[var(--green-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--green-text)]">
                        OK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
