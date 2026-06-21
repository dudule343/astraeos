// Espace éditeur — page « Adoption produit » (route /adoption).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-adoption">, lignes 1605-1656. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";

type TopUser = {
  rank: number;
  engineer: string;
  cabinet: string;
  sessions: string;
  time: string;
  studies: string;
  stars: string;
};

const TOP_USERS: TopUser[] = [
  {
    rank: 1,
    engineer: "Julien VASSEUR",
    cabinet: "PRIVEOS Capital · Paris Étoile",
    sessions: "42",
    time: "18h 24min",
    studies: "14",
    stars: "★★★★★",
  },
  {
    rank: 2,
    engineer: "Marie SOREL",
    cabinet: "PRIVEOS Capital · Lyon",
    sessions: "38",
    time: "16h 12min",
    studies: "12",
    stars: "★★★★★",
  },
  {
    rank: 3,
    engineer: "Thomas BERNARD",
    cabinet: "Cabinet Dupont & Associés",
    sessions: "34",
    time: "14h 48min",
    studies: "9",
    stars: "★★★★☆",
  },
  {
    rank: 4,
    engineer: "Sophie MARCHAND",
    cabinet: "Mont-Blanc Patrimoine",
    sessions: "31",
    time: "13h 02min",
    studies: "8",
    stars: "★★★★☆",
  },
  {
    rank: 5,
    engineer: "Pierre LAMBERT",
    cabinet: "Cabinet Lyonnais",
    sessions: "28",
    time: "12h 18min",
    studies: "7",
    stars: "★★★★☆",
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Adoption produit" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Bloc 03 · Adoption produit</div>
            <h1 className="hero-title">Adoption produit</h1>
            <p className="hero-sub">
              Mesurer combien d&apos;utilisateurs utilisent réellement la plateforme et à quelle
              fréquence — qui se connecte, qui revient, qui est dormant.
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
              <div className="section-eyebrow">Utilisateurs actifs</div>
              <div className="section-title">Volumétrie d&apos;utilisation</div>
            </div>
          </div>
          <div className="kpis">
            <div className="kpi">
              <span className="phase-tag p1">PHASE 1</span>
              <div className="kpi-label">Utilisateurs actifs jour</div>
              <div className="kpi-value">62</div>
              <div className="kpi-meta">
                aujourd&apos;hui · <strong className="up">▲ +14 %</strong>
              </div>
            </div>
            <div className="kpi">
              <span className="phase-tag p1">PHASE 1</span>
              <div className="kpi-label">Utilisateurs actifs semaine</div>
              <div className="kpi-value">158</div>
              <div className="kpi-meta">7 derniers jours</div>
            </div>
            <div className="kpi">
              <span className="phase-tag p1">PHASE 1</span>
              <div className="kpi-label">Utilisateurs actifs mois</div>
              <div className="kpi-value">214</div>
              <div className="kpi-meta">sur ~280 ingénieurs créés</div>
            </div>
            <div className="kpi">
              <span className="phase-tag p1">PHASE 1</span>
              <div className="kpi-label">Ratio quotidien / mensuel</div>
              <div className="kpi-value">
                29 <span className="unit">%</span>
              </div>
              <div className="kpi-meta">stickiness · seuil sain &gt; 20 %</div>
            </div>
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Engagement</div>
              <div className="section-title">Profondeur d&apos;usage</div>
            </div>
          </div>
          <div className="kpis kpis-3">
            <div className="kpi">
              <span className="phase-tag p1">PHASE 1</span>
              <div className="kpi-label">Sessions par utilisateur actif</div>
              <div className="kpi-value">14,2</div>
              <div className="kpi-meta">
                par mois · <strong className="up">▲ +8 %</strong>
              </div>
            </div>
            <div className="kpi">
              <span className="phase-tag p1">PHASE 1</span>
              <div className="kpi-label">Durée moyenne par session</div>
              <div className="kpi-value">
                22 <span className="unit">min</span>
              </div>
              <div className="kpi-meta">temps engagé</div>
            </div>
            <div className="kpi">
              <span className="phase-tag p1">PHASE 1</span>
              <div className="kpi-label">Utilisateurs dormants</div>
              <div className="kpi-value">68</div>
              <div className="kpi-meta">aucune connexion 30 jours</div>
            </div>
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Top engagés</div>
              <div className="section-title">Top 10 utilisateurs ce mois</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="dt">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ingénieur</th>
                  <th>Cabinet</th>
                  <th className="num">Sessions</th>
                  <th className="num">Temps cumulé</th>
                  <th className="num">Études créées</th>
                  <th className="center">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {TOP_USERS.map((u) => (
                  <tr key={u.rank}>
                    <td>{u.rank}</td>
                    <td className="cell-primary">{u.engineer}</td>
                    <td>{u.cabinet}</td>
                    <td className="num">{u.sessions}</td>
                    <td className="num">{u.time}</td>
                    <td className="num">{u.studies}</td>
                    <td className="center">
                      <span className="badge badge-success">{u.stars}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
