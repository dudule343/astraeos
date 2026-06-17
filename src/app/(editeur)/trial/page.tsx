import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";
import { fetchTrials, type TrialData } from "./data";

export const dynamic = "force-dynamic";

const DASH = "—";

function buildKpis(data: TrialData): KpiBlock[] {
  return [
    {
      label: "Essais en cours",
      value: String(data.enCours),
      meta: "comptes en période d'essai",
    },
    {
      label: "Démarrés ces 30 jours",
      value: String(data.demarres30j),
      meta: "nouveaux essais < 30 jours",
    },
    {
      // Aucune date de fin d'essai en base → pas de source.
      label: "Échéance dans < 7 jours",
      value: DASH,
      meta: "échéance d'essai non suivie en base",
    },
    {
      // Aucun historique de conversion essai→payant tracé.
      label: "Taux de conversion historique",
      value: DASH,
      meta: "non suivi",
    },
  ];
}

// Durée moyenne, ouverture d'emails de relance, conversions avec offre :
// aucune table de relance, d'offres ou d'événements de conversion → "—".
const moreKpis: KpiBlock[] = [
  { label: "Durée moyenne d'essai", value: DASH, meta: "non suivi en base" },
  { label: "Emails de relance ouverts", value: DASH, meta: "relances non suivies en base" },
  { label: "Conversions avec offre", value: DASH, meta: "non suivi en base" },
];

// Contenu produit assumé (config d'offres), pas une donnée live.
const offers = [
  {
    label: { v: "Souple", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    title: "Réduction 10 %",
    value: "-10 % sur le 1er mois",
    desc: "Pour les essais qui ne se convertissent pas naturellement",
  },
  {
    label: { v: "Standard", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" },
    title: "Réduction 30 %",
    value: "-30 % sur le 1er mois",
    desc: "Si engagement à 3 mois minimum",
  },
  {
    label: { v: "Forte", cls: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
    title: "Réduction 50 %",
    value: "-50 % sur le 1er mois",
    desc: "Cabinets stratégiques · validation manuelle",
  },
];

export default async function TrialPage() {
  const data = await fetchTrials();
  const kpis = buildKpis(data);

  return (
    <>
      <Topbar current="Période d'essai" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Opérations clients"
          title="Période d'essai"
          description="Suivi des prospects en période d'essai gratuite — coordonnées complètes, étape du parcours, offre proposée, conversion vers un abonnement payant."
          actions={
            <>
              <GhostButton>📧 Templates email</GhostButton>
              <GoldButton>Démarrer un essai</GoldButton>
            </>
          }
        />

        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {moreKpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
            <div className="text-[13px] font-semibold text-[var(--navy)]">
              📋 Parcours d&apos;un essai · 3 étapes principales
            </div>
            <span className="text-[11px] text-[var(--navy-300)]">
              Démarrage et essais actifs lus en base
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 p-4">
            <div className="rounded-md border border-[var(--green-text)]/40 bg-gradient-to-br from-[var(--ivory)] to-[var(--green-bg)] p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--green-text)]">
                Démarrage
              </div>
              <div className="text-[24px] font-bold leading-none text-[var(--navy)]">
                {data.demarres30j}
              </div>
              <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">essais démarrés ces 30j</div>
            </div>
            <div className="rounded-md border border-[var(--gold)] bg-[var(--gold-200)]/30 p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">
                En période d&apos;essai
              </div>
              <div className="text-[24px] font-bold leading-none text-[var(--gold)]">
                {data.enCours}
              </div>
              <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">essais actifs en cours</div>
            </div>
            <div className="rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                Conversion
              </div>
              <div className="text-[24px] font-bold leading-none text-[var(--navy)]">{DASH}</div>
              <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">conversion non suivie en base</div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {[{ label: "Tous", count: data.enCours, active: true }].map((f) => (
                <button
                  type="button"
                  key={f.label}
                  data-stub={`Filtre essais · ${f.label}`}
                  className={`rounded-md px-3 py-1.5 text-[11.5px] font-semibold ${
                    f.active
                      ? "bg-[var(--navy)] text-white"
                      : "border border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
                  }`}
                >
                  {f.label}
                  {typeof f.count === "number" ? ` (${f.count})` : ""}
                </button>
              ))}
            </div>
            <input
              type="search"
              placeholder="Rechercher..."
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[12px] placeholder:text-[var(--navy-300)] focus:border-[var(--gold)] focus:outline-none"
            />
          </div>
          {data.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                    <th className="px-4 py-3">Contact (Prénom Nom)</th>
                    <th className="px-4 py-3">Fonction</th>
                    <th className="px-4 py-3">Cabinet</th>
                    <th className="px-4 py-3">Coordonnées</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Démarré le</th>
                    <th className="px-4 py-3">Reste</th>
                    <th className="px-4 py-3">Étape parcours</th>
                    <th className="px-4 py-3">Offre proposée</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--navy-100)]">
                  {data.rows.map((t) => (
                    <tr
                      key={t.id}
                      className="text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                    >
                      <td className="px-4 py-3 font-semibold">{t.name ?? DASH}</td>
                      <td className="px-4 py-3 text-[var(--navy-300)]">{t.role ?? DASH}</td>
                      <td className="px-4 py-3">{t.cabinet ?? DASH}</td>
                      <td className="px-4 py-3 text-[11px] leading-tight">
                        {t.email || t.phone ? (
                          <>
                            {t.email && <div>📧 {t.email}</div>}
                            {t.phone && <div>📞 {t.phone}</div>}
                          </>
                        ) : (
                          <span className="text-[var(--navy-300)]">{DASH}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.type.cls}`}
                        >
                          {t.type.v}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--navy-300)]">{t.startedOn ?? DASH}</td>
                      <td className="px-4 py-3 text-[var(--navy-300)]">{t.remaining ?? DASH}</td>
                      <td className="px-4 py-3 text-[var(--navy-300)]">{t.step ?? DASH}</td>
                      <td className="px-4 py-3 text-[var(--navy-300)]">{t.offer ?? DASH}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <GhostButton>📞 Appeler</GhostButton>
                          <GhostButton>📧 Email</GhostButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mb-3 text-[40px] leading-none">📋</div>
              <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
                Aucun essai en cours
              </div>
              <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
                Les comptes clients en période d&apos;essai apparaîtront ici dès qu&apos;un compte
                passera au statut « essai ».
              </p>
            </div>
          )}
        </section>

        <section>
          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
              ⚡ Offres incitatives configurables
            </div>
            <div className="p-4">
              <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--green-text)]/30 bg-[var(--green-bg)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
                <span>✓</span>
                <div>
                  3 offres incitatives configurables, à activer au cas par cas sur les comptes
                  en période d&apos;essai.
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {offers.map((o) => (
                  <div
                    key={o.title}
                    className="rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-4"
                  >
                    <span
                      className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${o.label.cls}`}
                    >
                      {o.label.v}
                    </span>
                    <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                      {o.title}
                    </div>
                    <div className="text-[18px] font-bold text-[var(--gold)]">{o.value}</div>
                    <div className="mt-1 text-[11.5px] text-[var(--navy-300)]">{o.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
