import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";
import { fetchQuality, fmtCount, fmtScore } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Support & qualité",
};

// Encart "état vide honnête" : utilisé pour les blocs dont la source n'existe
// pas encore en base (support, incidents). On n'affiche aucun chiffre inventé.
function EmptyNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-dashed border-[var(--navy-100)] bg-white px-4 py-4 text-[12px] text-[var(--navy-300)]">
      <span aria-hidden>ℹ️</span>
      <div>{children}</div>
    </div>
  );
}

export default async function QualityPage() {
  const q = await fetchQuality();

  // Bloc "Dossiers en attente / en retard" — dérivé de dossiers.stage_entered_at,
  // last_activity_at, days_in_stage_cached, priority (seules vraies données de
  // cette page). Pas de comparatifs temporels : aucun historique de snapshots
  // en base, donc on ne fabrique pas de flèches d'évolution.
  const dossierKpis: KpiBlock[] = [
    {
      label: "Dossiers suivis",
      value: fmtCount(q.dossiersActifs),
      meta: "dossiers actifs du cabinet",
    },
    {
      label: "En retard",
      value: fmtCount(q.enRetard),
      meta: "plus de 14 jours dans l'étape",
      trend: q.enRetard > 0 ? "down" : undefined,
    },
    {
      label: "Sans activité récente",
      value: fmtCount(q.sansActivite),
      meta: "aucune activité depuis 14 jours",
    },
    {
      label: "Prioritaires bloqués",
      value: fmtCount(q.prioritairesBloques),
      meta: "priorité haute/urgente en retard",
      trend: q.prioritairesBloques > 0 ? "down" : undefined,
    },
  ];

  return (
    <>
      <Topbar current="07 · Support & qualité" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Bloc 07 · Support & qualité"
          title="Support & qualité"
          description="Mesurer la qualité du support et la stabilité produit — gestion des tickets, résolution de bugs, suivi des incidents de plateforme et satisfaction client."
          actions={<GhostButton dataStub="Export Support & qualité">Export</GhostButton>}
        />

        <section className="mb-8">
          <SectionHeader eyebrow="Charge support" title="Tickets & délais" />
          <EmptyNotice>
            Module de support non encore instrumenté — aucune donnée de ticket, de délai de
            réponse ou de résolution n&apos;est disponible. Ces indicateurs s&apos;afficheront
            lorsque le suivi des demandes de support sera branché.
          </EmptyNotice>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Stabilité produit" title="Bugs & incidents" />
          <EmptyNotice>
            Suivi des incidents plateforme et des bugs non disponible — aucune source de
            supervision (incidents, disponibilité, SLA) n&apos;est connectée. Aucune mesure de
            fiabilité n&apos;est affichée tant qu&apos;elle n&apos;est pas réellement collectée.
          </EmptyNotice>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Suivi de production"
            title="Dossiers en attente / en retard"
          />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
            <span>ℹ️</span>
            <div>
              Dossiers du cabinet qui stagnent dans leur étape ou sans activité récente, dérivés
              du temps passé dans chaque étape du pipeline. Indicateur de la charge à traiter en
              priorité.
            </div>
          </div>
          {q.hasDossiers ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dossierKpis.map((kpi) => (
                <KpiCard key={kpi.label} kpi={kpi} />
              ))}
            </div>
          ) : (
            <EmptyNotice>Aucun dossier suivi pour l&apos;instant.</EmptyNotice>
          )}
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Retour client"
            title="Satisfaction des études livrées"
          />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
            <span>ℹ️</span>
            <div>
              Note moyenne attribuée par les clients aux études patrimoniales livrées (échelle de
              1 à 10). Distincte d&apos;une satisfaction support : elle mesure la qualité perçue du
              livrable, pas du service d&apos;assistance.
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              kpi={{
                label: "Satisfaction étude (moyenne)",
                value: fmtScore(q.satisfactionMoyenne),
                unit: q.satisfactionMoyenne != null ? "/10" : undefined,
                meta:
                  q.satisfactionCount > 0
                    ? `sur ${q.satisfactionCount} étude${q.satisfactionCount > 1 ? "s" : ""} notée${q.satisfactionCount > 1 ? "s" : ""}`
                    : "aucune étude notée pour l'instant",
              }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
