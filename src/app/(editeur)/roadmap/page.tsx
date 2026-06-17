import { Topbar } from "../_components/Topbar";
import { PageHero } from "../_components/PageHeader";
import { fetchRoadmap } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Roadmap & releases",
};

// Libellés de colonnes conservés comme structure éditoriale du pilotage produit.
// Aucun compteur, aucune carte inventée : tant qu'aucune source ne les alimente,
// chaque colonne reste vide (état honnête) plutôt que d'afficher de fausses
// fonctionnalités / versions / pourcentages d'avancement.
const COLUMN_TITLES = ["Backlog", "En cours", "En recette", "Livré"] as const;

export default async function RoadmapPage() {
  const roadmap = await fetchRoadmap();

  // Une colonne par intitulé, alimentée uniquement par la source réelle (vide pour l'instant).
  const columns = COLUMN_TITLES.map((title) => ({
    title,
    cards: roadmap.columns.find((c) => c.title === title)?.cards ?? [],
  }));

  return (
    <>
      <Topbar current="Roadmap & releases" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Pilotage interne"
          title="Roadmap & releases"
          description="Vue produit consolidée — fonctionnalités en backlog, en cours de développement, en recette, livrées en production. Pilotée par le Responsable Technique."
        />

        {roadmap.hasData ? (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title} className="rounded-md border border-[var(--navy-100)] bg-white">
                <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
                  <div className="text-[12.5px] font-bold uppercase tracking-wider text-[var(--navy)]">
                    {col.title}
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-3">
                  {col.cards.length > 0 ? (
                    col.cards.map((c) => (
                      <div
                        key={c.title}
                        className={`rounded-md border bg-[var(--ivory)] p-3 hover:border-[var(--gold-300)] ${
                          c.tone === "blocker"
                            ? "border-l-[3px] border-l-[var(--red-text)] border-[var(--navy-100)]"
                            : "border-[var(--navy-100)]"
                        }`}
                      >
                        <div className="text-[12px] font-semibold text-[var(--navy)]">{c.title}</div>
                        <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">{c.meta}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-[var(--ivory)] p-4 text-center text-[10.5px] text-[var(--navy-300)]">
                      Aucun élément
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
            <div className="mb-3 text-[34px] leading-none">🗺️</div>
            <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
              Roadmap produit non connectée
            </div>
            <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Le pilotage produit (backlog, fonctionnalités en cours, recettes, releases livrées)
              n&apos;est pas encore relié à une source de données. Les colonnes ci-dessous
              s&apos;alimenteront automatiquement dès qu&apos;un outil de suivi sera branché.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
              {columns.map((col) => (
                <div
                  key={col.title}
                  className="rounded-md border border-[var(--navy-100)] bg-white"
                >
                  <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[12.5px] font-bold uppercase tracking-wider text-[var(--navy)]">
                    {col.title}
                  </div>
                  <div className="p-3">
                    <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-[var(--ivory)] p-4 text-center text-[10.5px] text-[var(--navy-300)]">
                      —
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
