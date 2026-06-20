import { EditeurTopbar } from "../_components/EditeurTopbar";
import { PackTabs } from "./PackTabs";
import { RankingPeriodFilter } from "./RankingPeriodFilter";

// Classement des packs porté verbatim de la maquette (9 lignes + ligne total).
const RANKING = [
  {
    num: "1",
    name: "Pack Investissements · Abonnement portefeuille",
    sub: "18 souscriptions actives · 87 €/mois récurrent",
    width: "31%",
    pct: "31 %",
    ca: "78 300 €",
  },
  {
    num: "2",
    name: "Pack Abonnements packs autres (mise en relation incluse)",
    sub: "23 souscriptions cumulées",
    width: "25%",
    pct: "25 %",
    ca: "63 700 €",
  },
  {
    num: "3",
    name: "Pack Investissements · Constitution portefeuille",
    sub: "22 prestations vendues · 1 000 € unique",
    width: "9%",
    pct: "9 %",
    ca: "22 000 €",
  },
  {
    num: "4",
    name: "Pack Supervision d'études",
    sub: "22 entretiens réalisés · 800 €/étude",
    width: "7%",
    pct: "7 %",
    ca: "17 600 €",
  },
  {
    num: "5",
    name: "Bibliothèque de documents actualisés",
    sub: "14 ventes · 990 € unique",
    width: "5.5%",
    pct: "5,5 %",
    ca: "13 860 €",
  },
  {
    num: "6",
    name: "Pack Formation",
    sub: "11 formations délivrées · 1 000 €/formation",
    width: "4.5%",
    pct: "4,5 %",
    ca: "11 000 €",
  },
  {
    num: "7",
    name: "Pack Immobilier patrimonial · Mise en relation",
    sub: "8 dossiers · ~1 400 € commission moyenne",
    width: "4.5%",
    pct: "4,5 %",
    ca: "11 200 €",
  },
  {
    num: "8",
    name: "Rédaction et immatriculation de société",
    sub: "8 statuts rédigés · 1 200 € unique",
    width: "4%",
    pct: "4 %",
    ca: "9 600 €",
  },
  {
    num: "9",
    name: "Pack Assurances de personnes · Mise en relation",
    sub: "14 dossiers · ~500 € commission moyenne",
    width: "2.5%",
    pct: "2,5 %",
    ca: "7 000 €",
  },
];

type PackCard = {
  tag: "recur" | "once" | "partner" | "unit";
  tagLabel: string;
  icon: string;
  name: string;
  desc: string;
  bullets: string[];
  metaLabel: string;
  price: string;
  priceSmall?: boolean;
  period: React.ReactNode;
};

const PACKS: PackCard[] = [
  {
    tag: "recur",
    tagLabel: "Récurrent",
    icon: "#i-invest",
    name: "Pack Investissements · Abonnement portefeuille",
    desc: "Accès au portefeuille actualisé en continu et aux recommandations personnalisées.",
    bullets: [
      "Portefeuille actualisé en continu",
      "Recommandations d'investissement",
      "Fiches produits à jour (UC, SCPI…)",
    ],
    metaLabel: "Abonnement mensuel",
    price: "87 €",
    period: "par mois",
  },
  {
    tag: "once",
    tagLabel: "Paiement unique",
    icon: "#i-portfolio",
    name: "Pack Investissements · Constitution portefeuille",
    desc: "Construction sur mesure d'un portefeuille d'investissement initial pour le client final.",
    bullets: [
      "Allocation cible personnalisée",
      "Sélection des supports adaptés",
      "Stratégie d'arbitrage à 12 mois",
    ],
    metaLabel: "Prestation ponctuelle",
    price: "1 000 €",
    period: "paiement unique",
  },
  {
    tag: "partner",
    tagLabel: "Mise en relation",
    icon: "#i-estate",
    name: "Pack Immobilier patrimonial",
    desc: "Mise en relation avec les partenaires immobiliers pour des programmes off-market exclusifs.",
    bullets: [
      "Programmes off-market exclusifs",
      "Accès direct aux partenaires sélectionnés",
      "Commission négociée si client souscrit",
    ],
    metaLabel: "Mise en relation partenaires",
    price: "Mise en relation",
    priceSmall: true,
    period: "commission partenaire",
  },
  {
    tag: "partner",
    tagLabel: "Mise en relation",
    icon: "#i-insurance",
    name: "Pack Assurances de personnes",
    desc: "Mise en relation avec nos partenaires assureurs · comparateur de prévoyance intégré.",
    bullets: [
      "Comparateur prévoyance temps réel",
      "Tarification automatique multi-assureurs",
      "Intégré nativement à la fiche client",
    ],
    metaLabel: "Mise en relation partenaires",
    price: "Mise en relation",
    priceSmall: true,
    period: "commission assureur",
  },
  {
    tag: "once",
    tagLabel: "Paiement unique",
    icon: "#i-book",
    name: "Bibliothèque de documents actualisés",
    desc: "Accès intégral à la bibliothèque de documents commerciaux et juridiques actualisés (DCI).",
    bullets: [
      "Documents Commerciaux d'Information",
      "Modèles de courriers, notices, rapports",
      "Mise à jour réglementaire automatique",
    ],
    metaLabel: "Accès à vie · sans renouvellement",
    price: "990 €",
    period: "paiement unique",
  },
  {
    tag: "once",
    tagLabel: "Paiement unique",
    icon: "#i-company",
    name: "Rédaction et immatriculation de société",
    desc: "Rédaction des statuts sur mesure par juriste expert (hors formalisme).",
    bullets: [
      "Statuts sur mesure par juriste expert",
      "Conseils de structuration juridique",
      "Hors formalisme administratif",
    ],
    metaLabel: "Délai 7-10 jours ouvrés",
    price: "1 200 €",
    period: (
      <>
        paiement unique <span style={{ color: "var(--navy-300)" }}>(hors formalisme)</span>
      </>
    ),
  },
  {
    tag: "unit",
    tagLabel: "À l'unité",
    icon: "#i-eye",
    name: "Pack Supervision d'études",
    desc: "Entretien de 2 heures avec un expert ASTRAEOS pour valider votre stratégie patrimoniale.",
    bullets: [
      "Compréhension de l'environnement client",
      "Validation de la stratégie la plus adaptée",
      "Recommandations de pistes d'optimisation",
    ],
    metaLabel: "Entretien 2 heures · visio ou présentiel",
    price: "800 €",
    period: "par étude",
  },
  {
    tag: "unit",
    tagLabel: "À l'unité",
    icon: "#i-training",
    name: "Pack Formation",
    desc: "Formations certifiantes pour ingénieurs patrimoniaux.",
    bullets: [
      "Conduite d'un entretien",
      "Pour proposer une étude",
      "Prospection · Analyse de statut",
    ],
    metaLabel: "Présentiel ou distanciel",
    price: "1 000 €",
    period: "par formation",
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Catalogue des packs" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Opérations clients</div>
            <h1 className="hero-title">Catalogue des packs</h1>
            <p className="hero-sub">
              Modules complémentaires proposés aux clients ASTRAEOS — abonnements récurrents,
              paiements uniques, mises en relation avec partenaires, services à l&apos;unité.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export tarifs">
              <svg>
                <use href="#i-download" />
              </svg>
              Export tarifs
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Créer un pack">
              Créer un pack
            </button>
          </div>
        </div>

        <div className="kpis kpis-3 mb-20">
          <div className="kpi">
            <div className="kpi-label">Revenus mensuels packs récurrents</div>
            <div className="kpi-value">
              28 400 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">▲ +14 % vs M-1</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Revenus packs unitaires ce mois</div>
            <div className="kpi-value">
              12 600 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">14 packs vendus</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Pack le plus souscrit</div>
            <div className="kpi-value" style={{ fontSize: "18px" }}>
              Investissements · Abonnement
            </div>
            <div className="kpi-meta">18 souscriptions actives</div>
          </div>
        </div>

        {/* Classement des 8 packs par usage et CA généré */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-chart" />
              </svg>
              Classement des 8 packs · cumul depuis janvier 2026
            </div>
            <RankingPeriodFilter />
          </div>
          <div style={{ padding: "0" }}>
            {RANKING.map((row) => (
              <div className="pack-rank-row" key={row.num}>
                <div className="pack-rank-num">{row.num}</div>
                <div>
                  <div className="pack-rank-name">{row.name}</div>
                  <div
                    style={{
                      fontSize: "10.5px",
                      color: "var(--navy-300)",
                      marginTop: "2px",
                    }}
                  >
                    {row.sub}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="pack-rank-bar">
                    <div className="pack-rank-bar-fill" style={{ width: row.width }} />
                  </div>
                  <div className="pack-rank-pct">{row.pct}</div>
                </div>
                <div className="pack-rank-ca">{row.ca}</div>
              </div>
            ))}
            <div
              style={{
                background: "linear-gradient(90deg, var(--gold-200), var(--ivory))",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "2px solid var(--gold)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--medium-400)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Total cumulé · cumul depuis janvier 2026
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--gold)" }}>
                234 260 €
              </div>
            </div>
          </div>
        </div>

        <PackTabs />

        <div className="grid-4">
          {PACKS.map((pack, i) => (
            <div className="pack-card" key={i}>
              <span className={`pack-pricing-tag ${pack.tag}`}>{pack.tagLabel}</span>
              <div className="pack-card-icon">
                <svg>
                  <use href={pack.icon} />
                </svg>
              </div>
              <div className="pack-card-name">{pack.name}</div>
              <div className="pack-card-desc">{pack.desc}</div>
              <ul className="pack-card-bullets">
                {pack.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              <div className="pack-card-meta">
                <span>{pack.metaLabel}</span>
                <div style={{ textAlign: "right" }}>
                  <div
                    className="pack-card-price"
                    style={pack.priceSmall ? { fontSize: "13px" } : undefined}
                  >
                    {pack.price}
                  </div>
                  <div className="pack-card-price-period">{pack.period}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
