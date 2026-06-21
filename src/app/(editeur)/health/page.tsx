// Espace éditeur — page « Santé clients » (route /health).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-health">, lignes 1713-1842. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";

type RiskRow = {
  logoClass: string;
  initial: string;
  name: string;
  typeClass: string;
  typeLabel: string;
  badgeClass: string;
  score: string;
  signal: string;
  lastSeen: string;
  mrr: string;
  actionLabel: string;
};

const riskRows: RiskRow[] = [
  {
    logoClass: "tlogo tlogo-2",
    initial: "L",
    name: "Cabinet Lyonnais",
    typeClass: "tt tt-cabinet",
    typeLabel: "Cabinet",
    badgeClass: "badge badge-warning",
    score: "58",
    signal: "Usage en chute · -42 % vs M-1",
    lastSeen: "il y a 12 jours",
    mrr: "1 800 €",
    actionLabel: "Briefer la relation client",
  },
  {
    logoClass: "tlogo tlogo-1",
    initial: "B",
    name: "Bordeaux Patrimoine",
    typeClass: "tt tt-cabinet",
    typeLabel: "Cabinet",
    badgeClass: "badge badge-danger",
    score: "42",
    signal: "Aucune étude créée < 30j · 1 ticket support critique",
    lastSeen: "il y a 18 jours",
    mrr: "1 200 €",
    actionLabel: "Briefer la relation client",
  },
  {
    logoClass: "tlogo tlogo-pro",
    initial: "N",
    name: "Notaire Pollet",
    typeClass: "tt tt-pro",
    typeLabel: "Autre pro",
    badgeClass: "badge badge-warning",
    score: "54",
    signal: "Facture impayée · 32 jours",
    lastSeen: "il y a 24 jours",
    mrr: "820 €",
    actionLabel: "Relance",
  },
];

type ScoreComponent = {
  icon: string;
  label: string;
  detail: string;
};

const scoreComponents: ScoreComponent[] = [
  {
    icon: "#i-adoption",
    label: "Usage produit · 40 %",
    detail: "Sessions par mois · études créées · ratio quotidien/mensuel",
  },
  {
    icon: "#i-team",
    label: "Engagement équipe · 25 %",
    detail: "% ingénieurs actifs · profondeur d'usage",
  },
  {
    icon: "#i-finance",
    label: "Paiement · 20 %",
    detail: "Délai de règlement · taux de retard · impayés",
  },
  {
    icon: "#i-quality",
    label: "Support · 15 %",
    detail: "Tickets ouverts · satisfaction · résolution",
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Santé clients" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Bloc 05 · Santé clients</div>
            <h1 className="hero-title">Santé clients</h1>
            <p className="hero-sub">
              Score composite basé sur usage, engagement, paiement et support —
              détection précoce des risques de désabonnement.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Distribution du portefeuille</div>
              <div className="section-title">Répartition par état de santé</div>
            </div>
          </div>
          <div className="kpis">
            <div className="kpi clickable">
              <span className="phase-tag p2">PHASE 2</span>
              <div className="kpi-label">Comptes en bonne santé</div>
              <div className="kpi-value" style={{ color: "var(--green-text)" }}>
                15
              </div>
              <div className="kpi-meta">65 % du portefeuille · score &gt; 80</div>
            </div>
            <div className="kpi clickable">
              <span className="phase-tag p2">PHASE 2</span>
              <div className="kpi-label">Comptes en croissance</div>
              <div className="kpi-value" style={{ color: "var(--gold)" }}>
                5
              </div>
              <div className="kpi-meta">22 % · expansion en cours</div>
            </div>
            <div className="kpi clickable">
              <span className="phase-tag p2">PHASE 2</span>
              <div className="kpi-label">Comptes à risque</div>
              <div className="kpi-value" style={{ color: "var(--red-text)" }}>
                3
              </div>
              <div className="kpi-meta">13 % · score &lt; 60 ou usage en chute</div>
            </div>
            <div className="kpi clickable">
              <span className="phase-tag p2">PHASE 2</span>
              <div className="kpi-label">Score santé moyen</div>
              <div className="kpi-value">82</div>
              <div className="kpi-meta">tous comptes confondus</div>
              <div className="kpi-compare">
                <div className="kpi-compare-cell">
                  <div className="kpi-compare-period">M-1</div>
                  <div className="kpi-compare-value up">▲ 78</div>
                </div>
                <div className="kpi-compare-cell">
                  <div className="kpi-compare-period">N-1</div>
                  <div className="kpi-compare-value up">▲ 71</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">À surveiller</div>
              <div className="section-title">Comptes à risque de désabonnement</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>Compte</th>
                  <th>Type</th>
                  <th className="num">Score santé</th>
                  <th>Signal d&apos;alerte</th>
                  <th>Dernière connexion</th>
                  <th className="num">MRR à risque</th>
                  <th className="center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {riskRows.map((row) => (
                  <tr className="dt-clickable" key={row.name}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                        }}
                      >
                        <div className={row.logoClass}>{row.initial}</div>
                        <div className="cell-primary">{row.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className={row.typeClass}>{row.typeLabel}</span>
                    </td>
                    <td className="num">
                      <span className={row.badgeClass}>{row.score}</span>
                    </td>
                    <td>{row.signal}</td>
                    <td>{row.lastSeen}</td>
                    <td className="num cell-money">{row.mrr}</td>
                    <td className="center">
                      <button
                        className="btn btn-gold btn-sm"
                        data-stub={row.actionLabel}
                      >
                        {row.actionLabel}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Méthodologie</div>
              <div className="section-title">Composantes du score santé</div>
            </div>
          </div>
          <div className="info-bar">
            <svg>
              <use href="#i-info" />
            </svg>
            <div>
              Le score santé d&apos;un compte est la{" "}
              <strong>moyenne pondérée de 4 dimensions</strong> — usage produit
              (40 %), engagement de l&apos;équipe (25 %), historique de paiement
              (20 %), satisfaction support (15 %).
            </div>
          </div>
          <div className="grid-4">
            {scoreComponents.map((c) => (
              <div className="card" key={c.label}>
                <div className="card-body">
                  <div className="icon-badge lg" style={{ marginBottom: "10px" }}>
                    <svg>
                      <use href={c.icon} />
                    </svg>
                  </div>
                  <div className="kpi-label" style={{ marginBottom: "4px" }}>
                    {c.label}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--navy-300)",
                      lineHeight: "1.5",
                    }}
                  >
                    {c.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
