import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";
import { fetchAnalyseProduit, fmtEur } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Analyse produit",
};

export default async function ProductPage() {
  const data = await fetchAnalyseProduit();

  const kpis: KpiBlock[] = [
    {
      label: "Souscriptions",
      value: data.totalSouscriptions > 0 ? String(data.totalSouscriptions) : "—",
      meta: "placées par le cabinet",
    },
    {
      label: "Encours total",
      value: fmtEur(data.totalAum),
      meta: "AUM courant des souscriptions",
      valueTone: "gold",
    },
    {
      label: "Produits actifs",
      value: data.produitsActifs > 0 ? String(data.produitsActifs) : "—",
      meta: "au catalogue du cabinet",
    },
    {
      label: "Partenaires",
      value: data.partenairesDistincts > 0 ? String(data.partenairesDistincts) : "—",
      meta: "fournisseurs distincts",
    },
  ];

  return (
    <>
      <Topbar current="06 · Analyse produit" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 06 · Analyse produit"
          title="Analyse produit"
          description="Comprendre comment les utilisateurs utilisent réellement la plateforme — détecter les frictions et identifier les fonctionnalités à valeur. Bloc essentiel mais nécessite le tracking comportemental (Phase 2)."
          actions={<GhostButton dataStub="Export Analyse produit">Export</GhostButton>}
        />

        <div className="mb-6 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
          <span>ℹ️</span>
          <div>
            <strong>Distinction Adoption vs Analyse :</strong> le bloc 03 mesure{" "}
            <strong>qui</strong> utilise la plateforme (volumétrie). Le bloc 06 mesure{" "}
            <strong>comment</strong> ils l&apos;utilisent (parcours, frictions, fonctionnalités
            plébiscitées ou délaissées).
          </div>
        </div>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Mix produit"
            title="Répartition par catégorie de produit"
          />
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            {data.parCategorie.length > 0 ? (
              <div className="flex flex-col gap-4">
                {data.parCategorie.map((c) => (
                  <div key={c.category}>
                    <div className="mb-1.5 flex justify-between text-[12px] text-[var(--navy)]">
                      <span>{c.label}</span>
                      <span>
                        <strong className="text-[var(--gold)]">
                          {c.count} souscription{c.count > 1 ? "s" : ""}
                        </strong>{" "}
                        · {fmtEur(c.montant)} · {c.pct} %
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-300)]"
                        style={{ width: `${c.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[12px] text-[var(--navy-300)]">
                Aucune souscription enregistrée pour ce cabinet.
              </div>
            )}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Distribution" title="Répartition par partenaire" />
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            {data.parPartenaire.length > 0 ? (
              <div className="flex flex-col gap-4">
                {data.parPartenaire.map((p) => (
                  <div key={p.partner}>
                    <div className="mb-1.5 flex justify-between text-[12px] text-[var(--navy)]">
                      <span>{p.partner}</span>
                      <span>
                        <strong className="text-[var(--gold)]">
                          {p.count} souscription{p.count > 1 ? "s" : ""}
                        </strong>{" "}
                        · {fmtEur(p.montant)} · {p.pct} %
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-300)]"
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[12px] text-[var(--navy-300)]">
                Aucune souscription enregistrée pour ce cabinet.
              </div>
            )}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Frictions détectées" title="Points de friction et abandons" />
          <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
            <div className="mb-3 text-[34px] leading-none">📊</div>
            <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
              Analyse des frictions disponible en Phase 2
            </div>
            <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Identifier les abandons par étape de parcours et les fonctionnalités délaissées
              nécessite le tracking comportemental (sessions, événements, funnels), non encore
              instrumenté. Aucun chiffre n&apos;est affiché tant que cette donnée n&apos;existe pas.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
