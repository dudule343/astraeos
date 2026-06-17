import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";
import { fetchAdoption, fmtCount } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Adoption produit",
};

export default async function AdoptionPage() {
  const a = await fetchAdoption();

  // Volumétrie d'utilisation. Les "actifs" sont dérivés de l'activité datée
  // (timeline_events) ou, à défaut, de last_login_at — jamais inventés. Si
  // l'usage n'est pas instrumenté, on le dit dans la meta plutôt que d'afficher
  // un chiffre faux.
  const activityMeta = a.activityInstrumented
    ? "activité tracée"
    : "estimé via dernière connexion";

  const userKpis: KpiBlock[] = [
    {
      label: "Utilisateurs actifs semaine",
      value: fmtCount(a.actifs7j),
      meta: `7 derniers jours · ${activityMeta}`,
    },
    {
      label: "Utilisateurs actifs mois",
      value: fmtCount(a.actifs30j),
      meta:
        a.usersCrees > 0
          ? `sur ${a.usersCrees} utilisateur${a.usersCrees > 1 ? "s" : ""} créé${a.usersCrees > 1 ? "s" : ""}`
          : "30 derniers jours",
    },
    {
      label: "Utilisateurs créés",
      value: a.usersCrees > 0 ? String(a.usersCrees) : "—",
      meta: "ingénieurs & dirigeants du périmètre",
    },
    {
      label: "Ratio semaine / mois",
      value: a.stickiness != null ? String(a.stickiness) : "—",
      unit: a.stickiness != null ? "%" : undefined,
      meta: "stickiness · seuil sain > 20 %",
    },
  ];

  // Profondeur d'usage. Les "sessions par utilisateur" et la "durée moyenne de
  // session" n'ont aucune source dans le schéma : on les remplace par des proxys
  // d'usage réels et datés (dossiers créés, études livrées), et on garde les
  // dormants (vraie donnée via last_login_at).
  const engagementKpis: KpiBlock[] = [
    {
      label: "Dossiers créés",
      value: fmtCount(a.dossiersCrees30j),
      meta: "30 derniers jours",
    },
    {
      label: "Études livrées",
      value: fmtCount(a.etudesLivrees30j),
      meta: "30 derniers jours",
    },
    {
      label: "Utilisateurs dormants",
      value: fmtCount(a.dormants),
      meta: "aucune connexion 30 jours",
    },
  ];

  return (
    <>
      <Topbar current="03 · Adoption produit" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 03 · Adoption produit"
          title="Adoption produit"
          description="Mesurer combien d'utilisateurs utilisent réellement la plateforme et à quelle fréquence — qui se connecte, qui revient, qui est dormant."
          actions={<GhostButton dataStub="Export Adoption">Export</GhostButton>}
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
          {a.topUsers.length > 0 ? (
            <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Ingénieur</th>
                    <th className="px-4 py-3">Cabinet</th>
                    <th className="px-4 py-3 text-right">Entretiens réalisés</th>
                    <th className="px-4 py-3 text-right">Études livrées</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--navy-100)]">
                  {a.topUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                    >
                      <td className="px-4 py-3 font-bold text-[var(--navy-300)]">{user.rank}</td>
                      <td className="px-4 py-3 font-semibold">{user.name}</td>
                      <td className="px-4 py-3 text-[var(--navy-300)]">{user.cabinet ?? "—"}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {user.entretiens > 0 ? user.entretiens : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {user.etudesLivrees > 0 ? user.etudesLivrees : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
              <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
                Aucune activité utilisateur sur la période
              </div>
              <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
                Le classement se construit à mesure que les ingénieurs livrent des études et
                réalisent des entretiens.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
