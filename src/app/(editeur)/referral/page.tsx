import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton, GoldButton } from "../_components/PageHeader";

const kpis: KpiBlock[] = [
  { label: "Parrains actifs", value: "14", meta: "sur 23 clients · 61 %" },
  { label: "Filleuls reçus", value: "42", meta: "leads parrainés · cumul depuis janv." },
  { label: "Filleuls payants", value: "9", meta: "21 % de conversion · vs 7 % autres canaux" },
  { label: "CA récurrent généré", value: "9 460", unit: "€", meta: "9 abonnements actifs · ~1 050 €/mois" },
  { label: "Commissions versées", value: "1 892", unit: "€", meta: "20 % du CA récurrent · cumulé" },
];

type Sponsor = {
  name: string;
  initials: string;
  type: "Marque" | "Cabinet" | "Mandataire PRIVEOS" | "Autre pro";
  filleuls: string;
  payants: string;
  ca: string;
  commission: string;
};

const sponsors: Sponsor[] = [
  { name: "PRIVEOS Capital", initials: "P", type: "Marque", filleuls: "12", payants: "4", ca: "348 €/mois", commission: "69,60 €/mois" },
  { name: "Cabinet Dupont", initials: "D", type: "Cabinet", filleuls: "8", payants: "2", ca: "174 €/mois", commission: "34,80 €/mois" },
  { name: "Julien VASSEUR", initials: "JV", type: "Mandataire PRIVEOS", filleuls: "6", payants: "2", ca: "174 €/mois", commission: "34,80 €/mois" },
  { name: "Notaire Mercier", initials: "M", type: "Autre pro", filleuls: "5", payants: "1", ca: "87 €/mois", commission: "17,40 €/mois" },
  { name: "Mont-Blanc Patrimoine", initials: "MB", type: "Cabinet", filleuls: "3", payants: "0", ca: "— €", commission: "— €" },
];

const typeBadge: Record<Sponsor["type"], string> = {
  Marque: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  Cabinet: "bg-[var(--light-blue)] text-[var(--navy)]",
  "Mandataire PRIVEOS": "bg-[var(--light-blue)] text-[var(--navy)]",
  "Autre pro": "bg-[var(--navy-100)] text-[var(--navy-300)]",
};

const activity = [
  {
    label: { v: "Conversion", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" },
    time: "il y a 2h",
    title: "Filleul de PRIVEOS Capital → signature client",
    sub: "Cabinet Voltaire (Marseille) · abonnement 87 €/mois → 17,40 €/mois pour PRIVEOS",
  },
  {
    label: { v: "Nouveau filleul", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    time: "hier 14h",
    title: "Cabinet Dupont a parrainé Maxime SOULIER",
    sub: "Soulier Patrimoine (Bordeaux) · démarrage essai prévu",
  },
  {
    label: { v: "Nouveau filleul", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    time: "il y a 2 jours",
    title: "Julien VASSEUR a parrainé Notaire LERAY",
    sub: "Étude Leray & Cie (Nantes) · qualification en cours",
  },
  {
    label: { v: "Commission mensuelle", cls: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
    time: "1er mai",
    title: "Versement mensuel des commissions parrainage",
    sub: "9 commissions versées · total 156,60 €",
  },
];

const example = [
  { label: "Abonnement filleul", value: "87 €/mois" },
  { label: "Taux de commission", value: "20 %" },
  { label: "Commission mensuelle parrain", value: "17,40 €/mois", highlight: true },
  { label: "Sur 12 mois (filleul fidèle)", value: "208,80 €/an", gold: true },
  { label: "Sur 36 mois (LTV moyenne)", value: "626,40 €", gold: true },
];

export default function ReferralPage() {
  return (
    <>
      <Topbar current="Programme de parrainage" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Acquisition · Programme NEW"
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
            parrain perçoit <strong>20 % du montant de l'abonnement</strong> chaque mois, tant que
            le filleul reste actif. La commission ne s'applique qu'à{" "}
            <strong>l'abonnement à la solution ASTRAEOS</strong> (pas sur les packs ponctuels ni les
            commissions partenaires).
          </div>
        </div>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <div className="mb-6 flex gap-1 border-b border-[var(--navy-100)]">
          {["Vue d'ensemble", "Parrains (14)", "Filleuls (42)", "Configuration commission"].map(
            (t, i) => (
              <button
                type="button"
                key={t}
                className={`-mb-px border-b-2 px-4 py-2 text-[12px] font-semibold ${
                  i === 0
                    ? "border-[var(--gold)] text-[var(--gold)]"
                    : "border-transparent text-[var(--navy-300)] hover:text-[var(--navy)]"
                }`}
              >
                {t}
              </button>
            ),
          )}
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
                {sponsors.map((s) => (
                  <tr key={s.name} className="text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--navy)] text-[10px] font-bold text-white">
                          {s.initials}
                        </div>
                        <span className="font-semibold">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${typeBadge[s.type]}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.filleuls}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--gold)]">{s.payants}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.ca}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--gold)]">{s.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
              <span>✓ Activité récente</span>
              <GhostButton>Tout voir</GhostButton>
            </div>
            <div className="divide-y divide-[var(--navy-100)]">
              {activity.map((a) => (
                <div key={a.title} className="cursor-pointer px-4 py-3 hover:bg-[var(--light-blue)]">
                  <div className="mb-1 flex items-center gap-2 text-[10.5px]">
                    <span className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${a.label.cls}`}>
                      {a.label.v}
                    </span>
                    <span className="text-[var(--navy-300)]">{a.time}</span>
                  </div>
                  <div className="text-[12.5px] font-semibold text-[var(--navy)]">{a.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-[var(--navy-300)]">{a.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
              <div className="mb-2 text-[32px] font-bold leading-none text-[var(--gold)]">20 %</div>
              <div className="text-[12.5px] leading-relaxed text-[var(--navy)]">
                de l'abonnement mensuel à la solution ASTRAEOS payé par le filleul.
              </div>
              <div className="mt-3.5 border-t border-[var(--gold-300)] pt-3.5 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                <strong className="text-[var(--navy)]">Périmètre :</strong> uniquement l'abonnement
                à la solution. Aucune commission n'est versée sur les packs ponctuels ni sur les
                commissions partenaires.
              </div>
            </div>

            <div className="rounded-md border border-[var(--navy-100)] bg-white">
              <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
                ℹ️ Exemple concret de calcul
              </div>
              <div className="p-4">
                <div className="mb-3 text-[13px] font-semibold text-[var(--navy)]">
                  Cabinet Voltaire (filleul de PRIVEOS Capital) souscrit l'abonnement à 87 €/mois.
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
                  résilie son abonnement.
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
                Chaque client a un lien de parrainage personnalisé dans son espace :
              </div>
              <div className="flex items-center gap-2 rounded-md border border-[var(--gold-300)] bg-[var(--ivory)] px-3 py-2">
                <span className="text-[var(--gold)]">🔗</span>
                <span className="flex-1 font-mono text-[12px] text-[var(--navy)]">
                  https://astraeos.fr/parrainage/PRIVEOS-A2K9X8
                </span>
                <GhostButton>📋 Copier</GhostButton>
              </div>
              <div className="mt-3.5 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                Le parrain pourra suivre dans son espace :{" "}
                <strong className="text-[var(--navy)]">filleuls invités</strong> ·{" "}
                <strong className="text-[var(--navy)]">filleuls qui ont démarré l'essai</strong> ·{" "}
                <strong className="text-[var(--navy)]">filleuls devenus payants</strong> ·{" "}
                <strong className="text-[var(--navy)]">commissions mensuelles cumulées</strong> ·{" "}
                <strong className="text-[var(--navy)]">historique des virements perçus</strong>.
              </div>
              <div className="mt-3.5 rounded-md bg-[#E5DCEB] px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[#5B3A6E]">
                <strong>À concevoir dans un wireframe ultérieur :</strong> espace parrain côté client.
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
