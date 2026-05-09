import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";

const kpis: KpiBlock[] = [
  { label: "Essais en cours", value: "4", meta: "démarrés < 30 jours" },
  { label: "Démarrés ces 30 jours", value: "7", meta: "▲ +14 % vs M-1" },
  { label: "Échéance dans < 7 jours", value: "3", meta: "à relancer en priorité", trend: "down" },
  { label: "Taux de conversion historique", value: "68", unit: "%", meta: "essai → client payant" },
];

const moreKpis: KpiBlock[] = [
  { label: "Durée moyenne d'essai", value: "22", unit: "jours", meta: "avant signature" },
  { label: "Emails de relance ouverts", value: "82", unit: "%", meta: "taux d'ouverture moyen" },
  {
    label: "Conversions avec offre",
    value: "+24",
    unit: "%",
    meta: "offre incitative -10 % à -50 %",
  },
];

type Trial = {
  name: string;
  role: string;
  cabinet: string;
  email: string;
  phone: string;
  type: { v: string; cls: string };
  startedOn: string;
  remaining: { v: string; cls: string };
  step: { v: string; cls: string };
  offer: { v: string; cls: string };
  primary: boolean;
};

const trials: Trial[] = [
  {
    name: "Pierre VAUBAN",
    role: "Dirigeant fondateur",
    cabinet: "Vauban Patrimoine",
    email: "p.vauban@vauban-patrimoine.fr",
    phone: "04 90 12 34 56",
    type: { v: "Cabinet", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    startedOn: "14 avr 2026",
    remaining: { v: "6 jours", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" },
    step: { v: "3· Email relance ouvert", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    offer: { v: "-30 % 1er mois", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    primary: true,
  },
  {
    name: "Antoine BERNARD",
    role: "Associé gérant",
    cabinet: "Bernard & Cie",
    email: "a.bernard@bernard-cie.fr",
    phone: "03 21 45 67 89",
    type: { v: "Cabinet", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    startedOn: "17 avr 2026",
    remaining: { v: "9 jours", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" },
    step: { v: "3· Email relance ouvert (2x)", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    offer: { v: "-50 % 1er mois", cls: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
    primary: true,
  },
  {
    name: "Mathilde AUVERGNE",
    role: "CGP indépendante",
    cabinet: "Auvergne Wealth",
    email: "m.auvergne@auvergne-wealth.fr",
    phone: "04 73 24 35 46",
    type: { v: "Cabinet", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    startedOn: "22 avr 2026",
    remaining: { v: "14 jours", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    step: { v: "2· Onboarding", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" },
    offer: { v: "Pas encore", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
    primary: false,
  },
  {
    name: "Maître Édouard ROUX",
    role: "Notaire associé",
    cabinet: "Étude Roux & Vidal",
    email: "e.roux@roux-vidal-notaires.fr",
    phone: "02 99 55 66 77",
    type: { v: "Autre pro", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
    startedOn: "28 avr 2026",
    remaining: { v: "21 jours", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    step: { v: "1· Démarrage", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" },
    offer: { v: "Pas encore", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
    primary: false,
  },
];

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

export default function TrialPage() {
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
              📋 Parcours d'un essai · 3 étapes principales
            </div>
            <span className="text-[11px] text-[var(--navy-300)]">
              Les emails de relance et l'offre sont automatisés
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 p-4">
            <div className="rounded-md border border-[var(--green-text)]/40 bg-gradient-to-br from-[var(--ivory)] to-[var(--green-bg)] p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--green-text)]">
                Démarrage
              </div>
              <div className="text-[24px] font-bold leading-none text-[var(--navy)]">7</div>
              <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">essais démarrés ces 30j</div>
            </div>
            <div className="rounded-md border border-[var(--gold)] bg-[var(--gold-200)]/30 p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">
                En période d'essai
              </div>
              <div className="text-[24px] font-bold leading-none text-[var(--gold)]">4</div>
              <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">essais actifs en cours</div>
            </div>
            <div className="rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                Conversion
              </div>
              <div className="text-[24px] font-bold leading-none text-[var(--navy)]">3</div>
              <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">signés ces 30j · 68 % taux</div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Tous", count: 4, active: true },
                { label: "Échéance < 7j", count: 3 },
                { label: "Email ouvert" },
                { label: "Sans offre proposée" },
              ].map((f) => (
                <button
                  type="button"
                  key={f.label}
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
                {trials.map((t) => (
                  <tr key={t.email} className="text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)]">
                    <td className="px-4 py-3 font-semibold">{t.name}</td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{t.role}</td>
                    <td className="px-4 py-3">{t.cabinet}</td>
                    <td className="px-4 py-3 text-[11px] leading-tight">
                      <div>📧 {t.email}</div>
                      <div>📞 {t.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.type.cls}`}>
                        {t.type.v}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{t.startedOn}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.remaining.cls}`}>
                        {t.remaining.v}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.step.cls}`}>
                        {t.step.v}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${t.offer.cls}`}>
                        {t.offer.v}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1.5">
                        {t.primary ? <GoldButton>📞 Appeler</GoldButton> : <GhostButton>📞 Appeler</GhostButton>}
                        <GhostButton>📧 Email</GhostButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  3 offres incitatives configurables, à activer au cas par cas. Statistiquement, ces
                  offres font passer le taux de conversion de <strong>52 %</strong> à{" "}
                  <strong>76 %</strong>.
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {offers.map((o) => (
                  <div
                    key={o.title}
                    className="rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-4"
                  >
                    <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${o.label.cls}`}>
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
