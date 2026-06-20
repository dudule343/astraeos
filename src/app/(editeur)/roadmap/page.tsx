import { EditeurTopbar } from "../_components/EditeurTopbar";

type RoadmapCard = {
  title: string;
  meta: string;
  style?: React.CSSProperties;
};

type RoadmapColumn = {
  header: string;
  badge: { label: string; style: React.CSSProperties };
  cards: RoadmapCard[];
};

const KPIS = [
  { label: "Releases livrées 2026", value: "14", meta: "en moyenne 3 / mois" },
  { label: "Fonctionnalités en cours", value: "8", meta: "dont 3 bloquantes" },
  { label: "Tickets en recette", value: "5", meta: "prêts à valider" },
  { label: "Bugs critiques ouverts", value: "2", meta: "SLA < 24h" },
];

const COLUMNS: RoadmapColumn[] = [
  {
    header: "Backlog · 24",
    badge: {
      label: "P1: 8",
      style: {
        background: "var(--navy-100)",
        padding: "1px 8px",
        borderRadius: "10px",
        fontSize: "9.5px",
      },
    },
    cards: [
      { title: "Module RDV intégré", meta: "Q3 2026 · 12j estimés" },
      { title: "Notifications mobiles iOS", meta: "Q3 2026 · 18j estimés" },
      { title: "Connecteur Salesforce", meta: "Q4 2026 · 24j estimés" },
      { title: "Dashboard analytics avancé", meta: "Q4 2026 · 16j estimés" },
    ],
  },
  {
    header: "En cours · 8",
    badge: {
      label: "3 bloq.",
      style: {
        background: "var(--gold-200)",
        color: "var(--medium-400)",
        padding: "1px 8px",
        borderRadius: "10px",
        fontSize: "9.5px",
      },
    },
    cards: [
      {
        title: "⚠ Refonte module immobilier",
        meta: "~70 % · BLOQUANT",
        style: { borderLeft: "3px solid var(--red-text)" },
      },
      { title: "Programme de parrainage", meta: "~50 % · 6j restants" },
      { title: "Recettes assurance Predica", meta: "~80 % · 2j restants" },
      { title: "Optimisation perf API", meta: "~30 % · 8j restants" },
    ],
  },
  {
    header: "En recette · 5",
    badge: {
      label: "À valider",
      style: {
        background: "var(--orange-bg)",
        color: "var(--orange-text)",
        padding: "1px 8px",
        borderRadius: "10px",
        fontSize: "9.5px",
      },
    },
    cards: [
      { title: "Module SCPI v2", meta: "Recette client · 3 jours" },
      { title: "Export PDF étude", meta: "Recette client · 1 jour" },
      { title: "Filtres tableau clients", meta: "Recette interne · prête" },
    ],
  },
  {
    header: "Livré · ce mois",
    badge: {
      label: "14",
      style: {
        background: "var(--green-bg)",
        color: "var(--green-text)",
        padding: "1px 8px",
        borderRadius: "10px",
        fontSize: "9.5px",
      },
    },
    cards: [
      { title: "✓ Sélecteur de date global", meta: "04 mai · v2.4.1" },
      { title: "✓ Support 2FA", meta: "02 mai · v2.4.0" },
      { title: "✓ Connecteur Qonto v2", meta: "28 avr · v2.3.5" },
      { title: "✓ Bibliothèque docs · MAJ", meta: "22 avr · v2.3.4" },
    ],
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Roadmap & releases" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Pilotage interne</div>
            <h1 className="hero-title">Roadmap &amp; releases</h1>
            <p className="hero-sub">
              Vue produit consolidée — fonctionnalités en backlog, en cours de
              développement, en recette, livrées en production. Pilotée par le
              Responsable Technique.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Voir Linear">
              <svg>
                <use href="#i-doc" />
              </svg>
              Voir Linear
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Nouvelle release">
              Nouvelle release
            </button>
          </div>
        </div>

        <div className="kpis mb-20">
          {KPIS.map((kpi) => (
            <div className="kpi" key={kpi.label}>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-meta">{kpi.meta}</div>
            </div>
          ))}
        </div>

        <div className="grid-4 mb-24">
          {COLUMNS.map((col) => (
            <div className="roadmap-col" key={col.header}>
              <div className="roadmap-col-header">
                {col.header}
                <span style={col.badge.style}>{col.badge.label}</span>
              </div>
              {col.cards.map((card) => (
                <div className="roadmap-card" key={card.title} style={card.style}>
                  <div className="roadmap-card-title">{card.title}</div>
                  <div className="roadmap-card-meta">{card.meta}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
