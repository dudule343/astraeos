import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../../(editeur)/_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../../(editeur)/_components/PageHeader";
import {
  fetchCabinetCommissions,
  fetchCabinetEngineers,
  computeRevenusPercus,
  fmtEur,
  fmtEurCell,
} from "../_data/cabinet";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Accueil",
};

function metaLine(honoraires: number, apports: number): string {
  return `Honoraires études ${fmtEurCell(honoraires)} · Apports d'affaires ${fmtEurCell(apports)}`;
}

const MOIS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export default async function DirigeantAccueilPage() {
  const now = new Date();
  const commissions = await fetchCabinetCommissions();
  const engineers = await fetchCabinetEngineers();
  const rev = computeRevenusPercus(commissions);

  const moisLabel = `${MOIS_FR[now.getMonth()]} ${now.getFullYear()}`;
  const trimestreLabel = `T${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;

  const revenusKpis: KpiBlock[] = [
    {
      label: "Total perçu · cumul",
      value: fmtEur(rev.cumulTotal.total),
      unit: rev.cumulTotal.total > 0 ? "€" : undefined,
      meta: metaLine(rev.cumulTotal.honoraires, rev.cumulTotal.apports),
      valueTone: "gold",
    },
    {
      label: "Revenu perçu · mois en cours",
      value: fmtEur(rev.mois.total),
      unit: rev.mois.total > 0 ? "€" : undefined,
      meta: `${moisLabel} · commissions encaissées`,
    },
    {
      label: "Revenu perçu · trimestre en cours",
      value: fmtEur(rev.trimestre.total),
      unit: rev.trimestre.total > 0 ? "€" : undefined,
      meta: `${trimestreLabel} · commissions encaissées`,
    },
    {
      label: "Revenu perçu · année cumulée",
      value: fmtEur(rev.annee.total),
      unit: rev.annee.total > 0 ? "€" : undefined,
      meta: `janv → ${MOIS_FR[now.getMonth()]} cumulé`,
    },
  ];

  const nbIngenieurs = engineers.length;

  // Santé du cabinet : pas de table dédiée. Seul nb ingénieurs est dérivable.
  // Satisfaction / Conformité / Formation / Activité → placeholders explicites.
  const sante = [
    {
      label: "Ingénieurs actifs",
      value: nbIngenieurs > 0 ? String(nbIngenieurs) : "—",
      meta: "users · role engineer · actifs",
      placeholder: false,
    },
    { label: "Satisfaction client", value: "—", meta: "donnée non disponible", placeholder: true },
    { label: "Conformité réglementaire", value: "—", meta: "donnée non disponible", placeholder: true },
    { label: "Formation continue", value: "—", meta: "donnée non disponible", placeholder: true },
  ];

  return (
    <>
      <Topbar current="Accueil cabinet" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Tableau de bord · Cabinet Paris Étoile · 8e arrondissement"
          title="Bienvenue Luc"
          description="Luc THILLIEZ dirige le Cabinet Paris Étoile accompagné de ses ingénieurs patrimoniaux. Cette vue donne accès aux indicateurs de performance, au compte de résultat, à la trésorerie et au pilotage de l'équipe."
          actions={
            <>
              <GhostButton>Comité hebdo</GhostButton>
              <GoldButton>Exporter la synthèse</GoldButton>
            </>
          }
        />

        <section className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Synthèse · revenus perçus par le cabinet
        </section>
        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {revenusKpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {/* Part dans le top 5 réseau : non calculable sans vue réseau multi-cabinets. */}
        <div className="mb-8 flex items-start gap-2 rounded-md border border-dashed border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy-300)]">
          <span>ℹ️</span>
          <div>
            <strong className="text-[var(--navy)]">Part dans le top 5 réseau · à venir.</strong>{" "}
            Le classement du cabinet dans le réseau PRIVEOS nécessite une vue consolidée
            multi-cabinets, non disponible dans le périmètre actuel.
          </div>
        </div>

        <section className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Vue 360° · santé du cabinet
        </section>
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[var(--navy-100)] bg-white p-6 text-center">
            <div className="text-[44px] font-bold leading-none text-[var(--navy-300)]">—</div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              / 100 · Cabinet
            </div>
            <div className="mt-2 text-[11px] text-[var(--navy-300)]">
              Score composite non disponible
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {sante.map((s) => (
              <div
                key={s.label}
                className={`rounded-md border bg-white p-4 ${s.placeholder ? "border-dashed border-[var(--navy-100)]" : "border-[var(--navy-100)]"}`}
              >
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  {s.label}
                </div>
                <div
                  className={`my-1 text-[22px] font-bold leading-none ${s.placeholder ? "text-[var(--navy-300)]" : "text-[var(--navy)]"}`}
                >
                  {s.value}
                </div>
                <div className="text-[11px] text-[var(--navy-300)]">{s.meta}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
