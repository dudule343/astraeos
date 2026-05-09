import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";

const userKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Utilisateurs actifs jour",
    value: "62",
    meta: "aujourd'hui ·",
    metaHighlight: { text: "▲ +14 %", tone: "up" },
  },
  { phase: "1", label: "Utilisateurs actifs semaine", value: "158", meta: "7 derniers jours" },
  {
    phase: "1",
    label: "Utilisateurs actifs mois",
    value: "214",
    meta: "sur ~280 ingénieurs créés",
  },
  {
    phase: "1",
    label: "Ratio quotidien / mensuel",
    value: "29",
    unit: "%",
    meta: "stickiness · seuil sain > 20 %",
  },
];

const engagementKpis: KpiBlock[] = [
  {
    phase: "1",
    label: "Sessions par utilisateur actif",
    value: "14,2",
    meta: "par mois ·",
    metaHighlight: { text: "▲ +8 %", tone: "up" },
  },
  {
    phase: "1",
    label: "Durée moyenne par session",
    value: "22",
    unit: "min",
    meta: "temps engagé",
  },
  {
    phase: "1",
    label: "Utilisateurs dormants",
    value: "68",
    meta: "aucune connexion 30 jours",
  },
];

type TopUser = {
  rank: number;
  name: string;
  cabinet: string;
  sessions: string;
  time: string;
  studies: string;
  stars: string;
};

const topUsers: TopUser[] = [
  {
    rank: 1,
    name: "Julien VASSEUR",
    cabinet: "PRIVEOS Capital · Paris Étoile",
    sessions: "42",
    time: "18h 24min",
    studies: "14",
    stars: "★★★★★",
  },
  {
    rank: 2,
    name: "Marie SOREL",
    cabinet: "PRIVEOS Capital · Lyon",
    sessions: "38",
    time: "16h 12min",
    studies: "12",
    stars: "★★★★★",
  },
  {
    rank: 3,
    name: "Thomas BERNARD",
    cabinet: "Cabinet Dupont & Associés",
    sessions: "34",
    time: "14h 48min",
    studies: "9",
    stars: "★★★★☆",
  },
  {
    rank: 4,
    name: "Sophie MARCHAND",
    cabinet: "Mont-Blanc Patrimoine",
    sessions: "31",
    time: "13h 02min",
    studies: "8",
    stars: "★★★★☆",
  },
  {
    rank: 5,
    name: "Pierre LAMBERT",
    cabinet: "Cabinet Lyonnais",
    sessions: "28",
    time: "12h 18min",
    studies: "7",
    stars: "★★★★☆",
  },
];

export default function AdoptionPage() {
  return (
    <>
      <Topbar current="03 · Adoption produit" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 03 · Adoption produit"
          title="Adoption produit"
          description="Mesurer combien d'utilisateurs utilisent réellement la plateforme et à quelle fréquence — qui se connecte, qui revient, qui est dormant."
          actions={<GhostButton>Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader eyebrow="Utilisateurs actifs" title="Volumétrie d'utilisation" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {userKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Engagement" title="Profondeur d'usage" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {engagementKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Top engagés" title="Top 10 utilisateurs ce mois" />
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Ingénieur</th>
                  <th className="px-4 py-3">Cabinet</th>
                  <th className="px-4 py-3 text-right">Sessions</th>
                  <th className="px-4 py-3 text-right">Temps cumulé</th>
                  <th className="px-4 py-3 text-right">Études créées</th>
                  <th className="px-4 py-3 text-center">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {topUsers.map((user) => (
                  <tr
                    key={user.rank}
                    className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                  >
                    <td className="px-4 py-3 font-bold text-[var(--navy-300)]">{user.rank}</td>
                    <td className="px-4 py-3 font-semibold">{user.name}</td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{user.cabinet}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{user.sessions}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{user.time}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{user.studies}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block rounded-full bg-[var(--green-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--green-text)]">
                        {user.stars}
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
