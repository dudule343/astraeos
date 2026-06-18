import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero } from "../_components/PageHeader";
import { fetchTeam } from "./data";
import { TeamRoster } from "./TeamRoster";
import { TeamExportButton } from "./TeamExportButton";
import { AddCollaboratorButton } from "./AddCollaboratorButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Équipe interne",
};

export default async function TeamPage() {
  const team = await fetchTeam();

  // Effectif : total + un KPI par rôle réellement présent (max 4 rôles affichés
  // après le total pour rester sur une grille de 5 colonnes).
  const kpisCount: KpiBlock[] = [
    {
      label: "Effectif total",
      value: team.total > 0 ? String(team.total) : "—",
      meta: "collaborateurs actifs",
    },
    ...team.byRole.slice(0, 4).map(
      (r): KpiBlock => ({
        label: r.label,
        value: String(r.count),
        meta: r.count > 1 ? "personnes" : "personne",
      }),
    ),
  ];

  return (
    <>
      <Topbar current="Équipe interne" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Pilotage interne"
          title="Équipe interne"
          description="Collaborateurs rattachés au cabinet, organisés par rôle. Activité par membre (clients, rendez-vous, études, CA) dérivée des dossiers en cours."
          actions={
            <>
              <TeamExportButton categories={team.categories} />
              <AddCollaboratorButton />
            </>
          }
        />

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpisCount.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
          <span>ℹ️</span>
          <div>
            Cliquez sur un ingénieur patrimonial pour ouvrir sa fiche — activité de la semaine
            (rendez-vous, clients, études livrées et CA généré), dérivée de ses dossiers.
          </div>
        </div>

        <TeamRoster
          categories={team.categories}
          total={team.total}
          weekLabel={team.weekLabel}
        />
      </div>
    </>
  );
}
