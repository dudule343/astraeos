import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton, GoldButton } from "../_components/PageHeader";
import { fetchReferralData, fmtCount, fmtEur, REFERRAL_COMMISSION_RATE } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Programme de parrainage",
};

export default async function ReferralPage() {
  const data = await fetchReferralData();
  const { program } = data;
  const ratePct = Math.round(REFERRAL_COMMISSION_RATE * 100);

  // Programme SaaS de parrainage : aucune source en base. Chaque KPI dégrade
  // honnêtement à "—" avec une méta neutre — jamais de chiffre inventé.
  const kpis: KpiBlock[] = [
    { label: "Parrains actifs", value: fmtCount(program.parrainsActifs), meta: "Programme à venir" },
    { label: "Filleuls reçus", value: fmtCount(program.filleulsRecus), meta: "Programme à venir" },
    { label: "Filleuls payants", value: fmtCount(program.filleulsPayants), meta: "Programme à venir" },
    { label: "CA récurrent généré", value: fmtEur(program.caRecurrent), meta: "Programme à venir" },
    { label: "Commissions versées", value: fmtEur(program.commissionsVersees), meta: "Programme à venir" },
  ];

  // Exemple illustratif paramétrique : sert à expliquer la règle des 20 %.
  // Aucun client réel impliqué — montant de base assumé comme illustration.
  const exempleAbonnement = 87;
  const exempleCommissionMois = exempleAbonnement * REFERRAL_COMMISSION_RATE;
  const example = [
    { label: "Abonnement filleul (illustratif)", value: `${exempleAbonnement} €/mois` },
    { label: "Taux de commission", value: `${ratePct} %` },
    {
      label: "Commission mensuelle parrain",
      value: `${exempleCommissionMois.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €/mois`,
      highlight: true,
    },
    {
      label: "Sur 12 mois (filleul fidèle)",
      value: `${(exempleCommissionMois * 12).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €/an`,
      gold: true,
    },
    {
      label: "Sur 36 mois (LTV moyenne)",
      value: `${(exempleCommissionMois * 36).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`,
      gold: true,
    },
  ];

  return (
    <>
      <Topbar current="Programme de parrainage" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Acquisition · Programme à venir"
          title="Programme de parrainage"
          description="Permettre aux clients (marques, cabinets directs, mandataires, autres pros) de recommander ASTRAEOS à leur réseau — modèle de rémunération récurrente : 20 % du montant de l'abonnement du filleul, versé chaque mois tant que le filleul reste actif."
          actions={
            <>
              <GhostButton>Modifier le %</GhostButton>
              <GoldButton>🔗 Inviter un parrain</GoldButton>
            </>
          }
        />

        <div className="mb-6 flex items-start gap-2 rounded-md border border-[var(--green-text)]/30 bg-[var(--green-bg)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
          <span>✓</span>
          <div>
            <strong>Modèle économique simple :</strong> le filleul devient client payant → le
            parrain perçoit <strong>{ratePct} % du montant de l&apos;abonnement</strong> chaque mois, tant que
            le filleul reste actif. La commission ne s&apos;applique qu&apos;à{" "}
            <strong>l&apos;abonnement à la solution ASTRAEOS</strong> (pas sur les packs ponctuels ni les
            commissions partenaires).
          </div>
        </div>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <div className="mb-6 flex gap-1 border-b border-[var(--navy-100)]">
          {["Vue d'ensemble", "Parrains", "Filleuls", "Configuration commission"].map((t, i) => (
            <button
              type="button"
              key={t}
              data-stub={`Onglet · ${t}`}
              className={`-mb-px border-b-2 px-4 py-2 text-[12px] font-semibold ${
                i === 0
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "border-transparent text-[var(--navy-300)] hover:text-[var(--navy)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                👥 Top 5 parrains performants
              </div>
              <GhostButton>Tous les parrains</GhostButton>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">Parrain</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Filleuls</th>
                  <th className="px-4 py-3 text-right">Payants</th>
                  <th className="px-4 py-3 text-right">CA récurrent</th>
                  <th className="px-4 py-3 text-right">Commission /mois</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {program.sponsors.length > 0 ? null : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-[12px] text-[var(--navy-300)]"
                    >
                      Aucun parrain — programme à venir.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
              <span>✓ Activité récente</span>
              <GhostButton>Tout voir</GhostButton>
            </div>
            <div className="divide-y divide-[var(--navy-100)]">
              {program.activity.length > 0 ? null : (
                <div className="px-4 py-10 text-center text-[12px] text-[var(--navy-300)]">
                  Aucune activité — programme à venir.
                </div>
              )}
            </div>
          </div>
        </section>

        {data.hasClientReferralData && (
          <section className="mb-8">
            <SectionHeader
              eyebrow="Donnée réelle disponible"
              title="Recommandation entre clients finaux"
              right={
                <span className="rounded-full bg-[var(--light-blue)] px-2 py-0.5 text-[10px] font-bold text-[var(--navy)]">
                  Distinct du programme parrainage
                </span>
              }
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <KpiCard
                kpi={{
                  label: "Clients acquis par recommandation",
                  value: fmtCount(data.clientReferral.recommandationCount),
                  meta: "origine d'acquisition = recommandation",
                }}
              />
              <KpiCard
                kpi={{
                  label: "Clients rattachés à un parrain",
                  value: fmtCount(data.clientReferral.parrainesCount),
                  meta: "client recommandé par un autre client",
                }}
              />
              <KpiCard
                kpi={{
                  label: "Clients prescripteurs",
                  value: fmtCount(data.clientReferral.parrainsDistincts),
                  meta: "ont recommandé au moins un client",
                }}
              />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
              Ces chiffres mesurent la <strong className="text-[var(--navy)]">recommandation
              entre vos clients finaux</strong> (donnée réelle de votre portefeuille), et non le
              programme de parrainage de la solution ASTRAEOS décrit ci-dessus.
            </p>
          </section>
        )}

        <section className="mb-8">
          <SectionHeader
            eyebrow="Configuration du programme"
            title="Modèle de commission en vigueur"
            right={<GhostButton>Modifier le pourcentage</GhostButton>}
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-[var(--gold-300)] bg-gradient-to-br from-[var(--ivory)] to-[var(--gold-200)] p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--gold)] text-2xl text-white">
                  ✓
                </div>
                <div>
                  <div className="text-[14px] font-bold text-[var(--navy)]">Commission récurrente</div>
                  <div className="text-[11.5px] text-[var(--navy-300)]">
                    Versée chaque mois tant que le filleul reste actif
                  </div>
                </div>
              </div>
              <div className="mb-2 text-[32px] font-bold leading-none text-[var(--gold)]">{ratePct} %</div>
              <div className="text-[12.5px] leading-relaxed text-[var(--navy)]">
                de l&apos;abonnement mensuel à la solution ASTRAEOS payé par le filleul.
              </div>
              <div className="mt-3.5 border-t border-[var(--gold-300)] pt-3.5 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                <strong className="text-[var(--navy)]">Périmètre :</strong> uniquement l&apos;abonnement
                à la solution. Aucune commission n&apos;est versée sur les packs ponctuels ni sur les
                commissions partenaires.
              </div>
            </div>

            <div className="rounded-md border border-[var(--navy-100)] bg-white">
              <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
                ℹ️ Exemple illustratif de calcul
              </div>
              <div className="p-4">
                <div className="mb-3 text-[13px] font-semibold text-[var(--navy)]">
                  Exemple : un filleul souscrit l&apos;abonnement à {exempleAbonnement} €/mois.
                </div>
                {example.map((e) => (
                  <div
                    key={e.label}
                    className={`flex justify-between border-b border-[var(--navy-100)] py-2 text-[12.5px] last:border-0 ${e.highlight ? "bg-[var(--ivory)] -mx-4 px-4" : ""}`}
                  >
                    <span
                      className={
                        e.highlight ? "font-bold text-[var(--gold)]" : "text-[var(--navy-300)]"
                      }
                    >
                      {e.label}
                    </span>
                    <span
                      className={`font-semibold ${e.highlight || e.gold ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}
                    >
                      {e.value}
                    </span>
                  </div>
                ))}
                <div className="mt-3 rounded-md bg-[var(--green-bg)] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--green-text)]">
                  <strong>Note :</strong> commission interrompue automatiquement si le filleul
                  résilie son abonnement. Chiffres illustratifs, à titre d&apos;exemple.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                🔗 Espace parrain · vue côté client (à concevoir)
              </div>
              <span className="rounded-full bg-[#E5DCEB] px-2 py-0.5 text-[10px] font-bold text-[#5B3A6E]">
                Aperçu de ce que verra le parrain
              </span>
            </div>
            <div className="p-4">
              <div className="mb-3 text-[13px] font-semibold text-[var(--navy)]">
                Chaque client aura un lien de parrainage personnalisé dans son espace :
              </div>
              <div className="flex items-center gap-2 rounded-md border border-[var(--gold-300)] bg-[var(--ivory)] px-3 py-2">
                <span className="text-[var(--gold)]">🔗</span>
                <span className="flex-1 font-mono text-[12px] text-[var(--navy-300)]">
                  https://astraeos.fr/parrainage/&lt;code-parrain&gt;
                </span>
                <GhostButton>📋 Copier</GhostButton>
              </div>
              <div className="mt-3.5 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                Le parrain pourra suivre dans son espace :{" "}
                <strong className="text-[var(--navy)]">filleuls invités</strong> ·{" "}
                <strong className="text-[var(--navy)]">filleuls qui ont démarré l&apos;essai</strong> ·{" "}
                <strong className="text-[var(--navy)]">filleuls devenus payants</strong> ·{" "}
                <strong className="text-[var(--navy)]">commissions mensuelles cumulées</strong> ·{" "}
                <strong className="text-[var(--navy)]">historique des virements perçus</strong>.
              </div>
              <div className="mt-3.5 rounded-md bg-[#E5DCEB] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[#5B3A6E]">
                <strong>À concevoir dans un wireframe ultérieur :</strong> espace parrain côté client.
                Le lien et le code ci-dessus sont des exemples de présentation.
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
