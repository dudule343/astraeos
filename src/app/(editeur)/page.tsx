// Espace éditeur — page « Accueil » (route /).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-home">, lignes 900-1229. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import Link from "next/link";
import { EditeurTopbar } from "./_components/EditeurTopbar";

type Compare = { period: string; value: string; cls: "up" | "down" };

type Kpi = {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  href: string;
  compares: [Compare, Compare];
};

const kpis: Kpi[] = [
  {
    label: "Chiffre d'affaires généré",
    value: "142 800",
    unit: "€",
    meta: "facturé en mai 2026",
    href: "/finance",
    compares: [
      { period: "M-1", value: "▲ 128 400 €", cls: "up" },
      { period: "N-1", value: "▲ 41 200 €", cls: "up" },
    ],
  },
  {
    label: "Chiffre d'affaires encaissé",
    value: "128 400",
    unit: "€",
    meta: "trésorerie réellement perçue",
    href: "/finance",
    compares: [
      { period: "M-1", value: "▲ 118 200 €", cls: "up" },
      { period: "N-1", value: "▲ 38 600 €", cls: "up" },
    ],
  },
  {
    label: "Charges du mois",
    value: "42 600",
    unit: "€",
    meta: "cloud + IA + équipe + licences",
    href: "/finance",
    compares: [
      { period: "M-1", value: "▲ 38 200 €", cls: "down" },
      { period: "N-1", value: "▲ 22 400 €", cls: "down" },
    ],
  },
  {
    label: "Base prospects",
    value: "312",
    meta: "leads qualifiés actifs",
    href: "/leads",
    compares: [
      { period: "M-1", value: "▲ +42", cls: "up" },
      { period: "N-1", value: "▲ +180", cls: "up" },
    ],
  },
  {
    label: "Clients actifs",
    value: "23",
    meta: "3 marques · 17 cabinets · 3 autres pros",
    href: "/clients",
    compares: [
      { period: "M-1", value: "▲ +2", cls: "up" },
      { period: "N-1", value: "▲ +14", cls: "up" },
    ],
  },
  {
    label: "Taux de désabonnement",
    value: "2,4",
    unit: "%",
    meta: "trimestre en cours",
    href: "/business",
    compares: [
      { period: "T-1", value: "▼ 5,0 %", cls: "up" },
      { period: "N-1", value: "▼ 8,3 %", cls: "up" },
    ],
  },
];

type ScoreBlock = {
  href: string;
  icon: string;
  name: string;
  num: string;
  color: "green" | "orange";
  width: string;
};

const scoreBlocks: ScoreBlock[] = [
  { href: "/business", icon: "#i-business", name: "01 · Pilotage business", num: "92", color: "green", width: "92%" },
  { href: "/acquisition", icon: "#i-acquisition", name: "02 · Acquisition & conversion", num: "85", color: "green", width: "85%" },
  { href: "/adoption", icon: "#i-adoption", name: "03 · Adoption produit", num: "72", color: "orange", width: "72%" },
  { href: "/ttv", icon: "#i-ttv", name: "04 · Première valeur", num: "68", color: "orange", width: "68%" },
  { href: "/health", icon: "#i-health", name: "05 · Santé clients", num: "88", color: "green", width: "88%" },
  { href: "/product", icon: "#i-product", name: "06 · Analyse produit", num: "74", color: "orange", width: "74%" },
  { href: "/quality", icon: "#i-quality", name: "07 · Support & qualité", num: "94", color: "green", width: "94%" },
  { href: "/infra", icon: "#i-infra", name: "08 · Infrastructure", num: "99", color: "green", width: "99%" },
];

type Alert = {
  href: string;
  badgeCls: string;
  badgeLabel: string;
  time: string;
  title: string;
  sub: string;
};

const alerts: Alert[] = [
  {
    href: "/health",
    badgeCls: "badge badge-danger badge-dot",
    badgeLabel: "Critique",
    time: "il y a 12 min",
    title: "ASTRAEOS Capital · usage IA dépasse quota",
    sub: "112 % du plan · escalader pack ou ajuster facturation",
  },
  {
    href: "/trial",
    badgeCls: "badge badge-warning badge-dot",
    badgeLabel: "Important",
    time: "il y a 2h",
    title: "3 essais arrivent à échéance dans < 7 jours",
    sub: "Pierre VAUBAN · Antoine BERNARD · clore l'essai",
  },
  {
    href: "/quality",
    badgeCls: "badge badge-warning badge-dot",
    badgeLabel: "Important",
    time: "hier 19h",
    title: "12 tickets dépassent 24h sans réponse",
    sub: "SLA en risque · 4 tickets critiques",
  },
  {
    href: "/health",
    badgeCls: "badge badge-info badge-dot",
    badgeLabel: "Info",
    time: "il y a 4h",
    title: "Cabinet Lyonnais · score santé en baisse",
    sub: "-12 pts en 30 jours · responsable relation client à alerter",
  },
];

type Prospect = { name: string; meta: string; amount: string };

const prospects: Prospect[] = [
  { name: "Pierre VAUBAN — Vauban Patrimoine", meta: "Échéance 6j · 18 sessions", amount: "~580 €/mois" },
  { name: "Antoine BERNARD — Bernard & Cie", meta: "Échéance 9j · 14 sessions", amount: "~820 €/mois" },
  { name: "Mathilde AUVERGNE — Auvergne Wealth", meta: "Échéance 16j · 6 sessions", amount: "~680 €/mois" },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Accueil" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Tableau de bord exécutif</div>
            <h1 className="hero-title">Accueil</h1>
            <p className="hero-sub">
              Vue exécutive synthétique du SaaS ASTRAEOS — pour le détail de chaque métrique,
              utilisez les sections numérotées 01 à 08 dans la sidebar.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Rapport hebdo">
              <svg>
                <use href="#i-download" />
              </svg>
              Rapport hebdo
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Personnaliser">
              Personnaliser
            </button>
          </div>
        </div>

        {/* 6 KPIs exécutifs avec comparaison M-1 / N-1 */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">KPIs exécutifs</div>
              <div className="section-title">Indicateurs financiers et commerciaux</div>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
              État système · 06 mai 2026 · 14h32
            </div>
          </div>

          <div className="kpis kpis-6">
            {kpis.map((kpi) => (
              <Link key={kpi.label} href={kpi.href} className="kpi clickable">
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">
                  {kpi.value}
                  {kpi.unit && <span className="unit">{kpi.unit}</span>}
                </div>
                <div className="kpi-meta">{kpi.meta}</div>
                <div className="kpi-compare">
                  {kpi.compares.map((c) => (
                    <div key={c.period} className="kpi-compare-cell">
                      <div className="kpi-compare-period">{c.period}</div>
                      <div className={`kpi-compare-value ${c.cls}`}>{c.value}</div>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Score santé global */}
        <div className="grid-1-2 mb-24">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-quality" />
                </svg>
                Score santé global
              </div>
              <span className="badge badge-success">Excellent</span>
            </div>
            <div className="card-body" style={{ textAlign: "center", padding: "24px 20px" }}>
              <div className="score-premium">
                <svg viewBox="0 0 160 160">
                  <circle className="score-premium-track" cx="80" cy="80" r="68" />
                  <circle
                    className="score-premium-fill"
                    cx="80"
                    cy="80"
                    r="68"
                    strokeDasharray="427"
                    strokeDashoffset="55"
                  />
                </svg>
                <div className="score-premium-center">
                  <div className="score-premium-num">
                    87<span className="unit-small">/100</span>
                  </div>
                  <div className="score-premium-label">Santé SaaS</div>
                </div>
              </div>
              <div
                style={{
                  marginTop: "18px",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  lineHeight: "1.5",
                }}
              >
                Voyants verts sur tous les blocs sauf usage IA
                <br />
                <span style={{ color: "var(--orange-text)", fontWeight: 600 }}>
                  ASTRAEOS Capital en dépassement quota
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-chart" />
                </svg>
                Score par bloc cockpit
              </div>
              <span className="card-subtitle">Cliquez pour creuser</span>
            </div>
            <div className="score-block-list">
              {scoreBlocks.map((block) => (
                <Link key={block.num} href={block.href} className="score-block-item">
                  <div className="score-block-icon">
                    <svg>
                      <use href={block.icon} />
                    </svg>
                  </div>
                  <div className="score-block-content">
                    <div className="score-block-row">
                      <span className="score-block-name">{block.name}</span>
                      <span className={`score-block-num ${block.color}`}>{block.num}</span>
                    </div>
                    <div className="score-block-bar">
                      <div
                        className={`score-block-bar-fill ${block.color}`}
                        style={{ width: block.width }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Alertes (moitié) + Pipeline (moitié) */}
        <div className="grid-2 mb-24">
          {/* Alertes urgentes */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-alert" />
                </svg>
                Alertes & actions urgentes
              </div>
              <button className="btn btn-ghost btn-sm" data-stub="Toutes les alertes">
                Toutes
              </button>
            </div>
            <div style={{ padding: 0 }}>
              {alerts.map((alert, i) => (
                <Link key={i} href={alert.href} className="alert-item">
                  <div className="alert-meta">
                    <span className={alert.badgeCls}>{alert.badgeLabel}</span>
                    <span>{alert.time}</span>
                  </div>
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-sub">{alert.sub}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Pipeline commercial intégré */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-business" />
                </svg>
                Pipeline commercial
              </div>
              <Link href="/clients" className="btn btn-ghost btn-sm">
                Détails
              </Link>
            </div>
            <div className="card-body" style={{ padding: "14px 16px" }}>
              {/* Stepper compact 2 étapes */}
              <div className="pipeline-stepper" style={{ marginBottom: "12px" }}>
                <div className="stepper-item active">
                  <div className="stepper-badge">
                    <svg>
                      <use href="#i-trial" />
                    </svg>
                  </div>
                  <div className="stepper-label">EN PÉRIODE D&apos;ESSAI</div>
                  <div className="stepper-count">4</div>
                  <div className="stepper-meta">2 850 € MRR potentiel</div>
                </div>
                <div className="stepper-item">
                  <div className="stepper-badge">
                    <svg>
                      <use href="#i-success" />
                    </svg>
                  </div>
                  <div className="stepper-label">SIGNÉS CE MOIS</div>
                  <div className="stepper-count">3</div>
                  <div className="stepper-meta">+14 200 € MRR</div>
                </div>
              </div>

              {/* Cards mini de prospects */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {prospects.map((p) => (
                  <Link key={p.name} href="/trial" className="kb-card" style={{ margin: 0 }}>
                    <div className="kb-card-title">{p.name}</div>
                    <div className="kb-card-meta">
                      {p.meta}{" "}
                      <span
                        style={{ color: "var(--gold)", fontWeight: 700, marginLeft: "auto" }}
                      >
                        {p.amount}
                      </span>
                    </div>
                  </Link>
                ))}
                <div style={{ textAlign: "center", padding: "8px", fontSize: "11px" }}>
                  <Link
                    href="/trial"
                    style={{
                      color: "var(--gold)",
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    Voir le 4ème prospect & clients signés →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
