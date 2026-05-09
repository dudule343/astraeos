import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";

const kpis: KpiBlock[] = [
  { label: "Revenus mensuels packs récurrents", value: "28 400", unit: "€", meta: "▲ +14 % vs M-1" },
  { label: "Revenus packs unitaires ce mois", value: "12 600", unit: "€", meta: "14 packs vendus" },
  {
    label: "Pack le plus souscrit",
    value: "Investissements",
    meta: "18 souscriptions actives",
  },
];

type Ranking = { num: number; name: string; sub: string; pct: number; ca: string };

const ranking: Ranking[] = [
  { num: 1, name: "Pack Investissements · Abonnement portefeuille", sub: "18 souscriptions actives · 87 €/mois récurrent", pct: 31, ca: "78 300 €" },
  { num: 2, name: "Pack Abonnements packs autres (mise en relation incluse)", sub: "23 souscriptions cumulées", pct: 25, ca: "63 700 €" },
  { num: 3, name: "Pack Investissements · Constitution portefeuille", sub: "22 prestations vendues · 1 000 € unique", pct: 9, ca: "22 000 €" },
  { num: 4, name: "Pack Supervision d'études", sub: "22 entretiens réalisés · 800 €/étude", pct: 7, ca: "17 600 €" },
  { num: 5, name: "Bibliothèque de documents actualisés", sub: "14 ventes · 990 € unique", pct: 5.5, ca: "13 860 €" },
  { num: 6, name: "Pack Formation", sub: "11 formations délivrées · 1 000 €/formation", pct: 4.5, ca: "11 000 €" },
  { num: 7, name: "Pack Immobilier patrimonial · Mise en relation", sub: "8 dossiers · ~1 400 € commission moyenne", pct: 4.5, ca: "11 200 €" },
  { num: 8, name: "Rédaction et immatriculation de société", sub: "8 statuts rédigés · 1 200 € unique", pct: 4, ca: "9 600 €" },
  { num: 9, name: "Pack Assurances de personnes · Mise en relation", sub: "14 dossiers · ~500 € commission moyenne", pct: 2.5, ca: "7 000 €" },
];

type Pack = {
  tag: { v: string; cls: string };
  icon: string;
  name: string;
  desc: string;
  bullets: string[];
  metaLeft: string;
  price: string;
  period: string;
  smallPrice?: boolean;
};

const recurrent = "bg-[var(--gold-200)] text-[var(--medium-400)]";
const once = "bg-[#E5DCEB] text-[#5B3A6E]";
const partner = "bg-[var(--green-bg)] text-[var(--green-text)]";
const unit = "bg-[var(--light-blue)] text-[var(--navy)]";

const packs: Pack[] = [
  {
    tag: { v: "Récurrent", cls: recurrent },
    icon: "📈",
    name: "Pack Investissements · Abonnement portefeuille",
    desc: "Accès au portefeuille actualisé en continu et aux recommandations personnalisées.",
    bullets: ["Portefeuille actualisé en continu", "Recommandations d'investissement", "Fiches produits à jour (UC, SCPI…)"],
    metaLeft: "Abonnement mensuel",
    price: "87 €",
    period: "par mois",
  },
  {
    tag: { v: "Paiement unique", cls: once },
    icon: "💼",
    name: "Pack Investissements · Constitution portefeuille",
    desc: "Construction sur mesure d'un portefeuille d'investissement initial pour le client final.",
    bullets: ["Allocation cible personnalisée", "Sélection des supports adaptés", "Stratégie d'arbitrage à 12 mois"],
    metaLeft: "Prestation ponctuelle",
    price: "1 000 €",
    period: "paiement unique",
  },
  {
    tag: { v: "Mise en relation", cls: partner },
    icon: "🏢",
    name: "Pack Immobilier patrimonial",
    desc: "Mise en relation avec les partenaires immobiliers pour des programmes off-market exclusifs.",
    bullets: ["Programmes off-market exclusifs", "Accès direct aux partenaires sélectionnés", "Commission négociée si client souscrit"],
    metaLeft: "Mise en relation partenaires",
    price: "Mise en relation",
    period: "commission partenaire",
    smallPrice: true,
  },
  {
    tag: { v: "Mise en relation", cls: partner },
    icon: "🛡️",
    name: "Pack Assurances de personnes",
    desc: "Mise en relation avec nos partenaires assureurs · comparateur de prévoyance intégré.",
    bullets: ["Comparateur prévoyance temps réel", "Tarification automatique multi-assureurs", "Intégré nativement à la fiche client"],
    metaLeft: "Mise en relation partenaires",
    price: "Mise en relation",
    period: "commission assureur",
    smallPrice: true,
  },
  {
    tag: { v: "Paiement unique", cls: once },
    icon: "📚",
    name: "Bibliothèque de documents actualisés",
    desc: "Accès intégral à la bibliothèque de documents commerciaux et juridiques actualisés (DCI).",
    bullets: ["Documents Commerciaux d'Information", "Modèles de courriers, notices, rapports", "Mise à jour réglementaire automatique"],
    metaLeft: "Accès à vie · sans renouvellement",
    price: "990 €",
    period: "paiement unique",
  },
  {
    tag: { v: "Paiement unique", cls: once },
    icon: "🏛️",
    name: "Rédaction et immatriculation de société",
    desc: "Rédaction des statuts sur mesure par juriste expert (hors formalisme).",
    bullets: ["Statuts sur mesure par juriste expert", "Conseils de structuration juridique", "Hors formalisme administratif"],
    metaLeft: "Délai 7-10 jours ouvrés",
    price: "1 200 €",
    period: "paiement unique (hors formalisme)",
  },
  {
    tag: { v: "À l'unité", cls: unit },
    icon: "👁️",
    name: "Pack Supervision d'études",
    desc: "Entretien de 2 heures avec un expert ASTRAEOS pour valider votre stratégie patrimoniale.",
    bullets: ["Compréhension de l'environnement client", "Validation de la stratégie la plus adaptée", "Recommandations de pistes d'optimisation"],
    metaLeft: "Entretien 2 heures · visio ou présentiel",
    price: "800 €",
    period: "par étude",
  },
  {
    tag: { v: "À l'unité", cls: unit },
    icon: "🎓",
    name: "Pack Formation",
    desc: "Formations certifiantes pour ingénieurs patrimoniaux.",
    bullets: ["Conduite d'un entretien", "Pour proposer une étude", "Prospection · Analyse de statut"],
    metaLeft: "Présentiel ou distanciel",
    price: "1 000 €",
    period: "par formation",
  },
];

export default function MarketplacePage() {
  return (
    <>
      <Topbar current="Catalogue des packs" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Opérations clients"
          title="Catalogue des packs"
          description="Modules complémentaires proposés aux clients ASTRAEOS — abonnements récurrents, paiements uniques, mises en relation avec partenaires, services à l'unité."
          actions={
            <>
              <GhostButton>Export tarifs</GhostButton>
              <GoldButton>＋ Créer un pack</GoldButton>
            </>
          }
        />

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
            <div className="text-[13px] font-semibold text-[var(--navy)]">
              📊 Classement des 8 packs · cumul depuis janvier 2026
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { label: "Mois" },
                { label: "Trimestre" },
                { label: "Cumul depuis janv.", active: true },
                { label: "12 derniers mois" },
              ].map((p) => (
                <button
                  type="button"
                  key={p.label}
                  className={`rounded-md px-3 py-1 text-[11px] font-semibold ${
                    p.active
                      ? "bg-[var(--navy)] text-white"
                      : "border border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            {ranking.map((r) => (
              <div
                key={r.num}
                className="grid grid-cols-[40px_1fr_180px_100px] items-center gap-4 border-b border-[var(--navy-100)] px-4 py-3 last:border-0 hover:bg-[var(--light-blue)]"
              >
                <div className="text-[18px] font-bold text-[var(--navy-300)]">{r.num}</div>
                <div>
                  <div className="text-[12.5px] font-semibold text-[var(--navy)]">{r.name}</div>
                  <div className="mt-0.5 text-[10.5px] text-[var(--navy-300)]">{r.sub}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-300)]"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-[11px] font-semibold text-[var(--navy)]">
                    {r.pct} %
                  </div>
                </div>
                <div className="text-right text-[13px] font-bold text-[var(--gold)]">{r.ca}</div>
              </div>
            ))}
            <div className="flex items-center justify-between border-t-2 border-[var(--gold)] bg-gradient-to-r from-[var(--gold-200)] to-[var(--ivory)] px-4 py-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--medium-400)]">
                Total cumulé · cumul depuis janvier 2026
              </div>
              <div className="text-[16px] font-bold text-[var(--gold)]">234 260 €</div>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--navy-100)]">
          {[
            "Tous les packs (8)",
            "Récurrents (1)",
            "Mise en relation (2)",
            "Paiements uniques (3)",
            "À l'unité (2)",
          ].map((t, i) => (
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
          ))}
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((p) => (
            <div
              key={p.name}
              className="relative flex flex-col rounded-md border border-[var(--navy-100)] bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <span className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${p.tag.cls}`}>
                {p.tag.v}
              </span>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-[var(--gold-200)] text-2xl">
                {p.icon}
              </div>
              <div className="mb-2 text-[13px] font-bold leading-tight text-[var(--navy)]">
                {p.name}
              </div>
              <div className="mb-3 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                {p.desc}
              </div>
              <ul className="mb-4 flex flex-1 flex-col gap-1.5 text-[11.5px] text-[var(--navy)]">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-1.5">
                    <span className="text-[var(--gold)]">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-end justify-between border-t border-[var(--navy-100)] pt-3">
                <span className="text-[10.5px] text-[var(--navy-300)]">{p.metaLeft}</span>
                <div className="text-right">
                  <div
                    className={`font-bold text-[var(--gold)] ${p.smallPrice ? "text-[13px]" : "text-[18px]"}`}
                  >
                    {p.price}
                  </div>
                  <div className="text-[10px] text-[var(--navy-300)]">{p.period}</div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
