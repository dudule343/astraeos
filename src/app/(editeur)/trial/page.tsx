import { EditeurTopbar } from "../_components/EditeurTopbar";
import { TrialToolbar } from "./TrialToolbar";

// Port 1:1 de la maquette (#page-trial, lignes 2624-2805 de
// reference/wireframes-editeur.html). Classes de la maquette reprises verbatim,
// valeurs hardcodées à l'identique. Seule interaction : les filtres rapides
// (.qf) du tableau, portés dans TrialToolbar (composant client).

type TrialRow = {
  name: string;
  role: string;
  cabinet: string;
  email: string;
  phone: string;
  type: { label: string; cls: string };
  startedAt: string;
  reste: { label: string; cls: string };
  etape: { label: string; cls: string };
  offre: { label: string; cls: string };
  callGold: boolean;
};

const ROWS: TrialRow[] = [
  {
    name: "Pierre VAUBAN",
    role: "Dirigeant fondateur",
    cabinet: "Vauban Patrimoine",
    email: "p.vauban@vauban-patrimoine.fr",
    phone: "04 90 12 34 56",
    type: { label: "Cabinet", cls: "tt tt-cabinet" },
    startedAt: "14 avr 2026",
    reste: { label: "6 jours", cls: "badge badge-warning" },
    etape: { label: "3· Email relance ouvert", cls: "badge badge-info" },
    offre: { label: "-30 % 1er mois", cls: "badge badge-info" },
    callGold: true,
  },
  {
    name: "Antoine BERNARD",
    role: "Associé gérant",
    cabinet: "Bernard & Cie",
    email: "a.bernard@bernard-cie.fr",
    phone: "03 21 45 67 89",
    type: { label: "Cabinet", cls: "tt tt-cabinet" },
    startedAt: "17 avr 2026",
    reste: { label: "9 jours", cls: "badge badge-warning" },
    etape: { label: "3· Email relance ouvert (2x)", cls: "badge badge-info" },
    offre: { label: "-50 % 1er mois", cls: "badge badge-gold" },
    callGold: true,
  },
  {
    name: "Mathilde AUVERGNE",
    role: "CGP indépendante",
    cabinet: "Auvergne Wealth",
    email: "m.auvergne@auvergne-wealth.fr",
    phone: "04 73 24 35 46",
    type: { label: "Cabinet", cls: "tt tt-cabinet" },
    startedAt: "22 avr 2026",
    reste: { label: "14 jours", cls: "badge badge-info" },
    etape: { label: "2· Onboarding", cls: "badge badge-warning" },
    offre: { label: "Pas encore", cls: "badge badge-neutral" },
    callGold: false,
  },
  {
    name: "Maître Édouard ROUX",
    role: "Notaire associé",
    cabinet: "Étude Roux & Vidal",
    email: "e.roux@roux-vidal-notaires.fr",
    phone: "02 99 55 66 77",
    type: { label: "Autre pro", cls: "tt tt-pro" },
    startedAt: "28 avr 2026",
    reste: { label: "21 jours", cls: "badge badge-info" },
    etape: { label: "1· Démarrage", cls: "badge badge-success" },
    offre: { label: "Pas encore", cls: "badge badge-neutral" },
    callGold: false,
  },
];

const OFFERS = [
  {
    badge: { label: "Souple", cls: "badge badge-info" },
    title: "Réduction 10 %",
    value: "-10 % sur le 1er mois",
    desc: "Pour les essais qui ne se convertissent pas naturellement",
  },
  {
    badge: { label: "Standard", cls: "badge badge-warning" },
    title: "Réduction 30 %",
    value: "-30 % sur le 1er mois",
    desc: "Si engagement à 3 mois minimum",
  },
  {
    badge: { label: "Forte", cls: "badge badge-gold" },
    title: "Réduction 50 %",
    value: "-50 % sur le 1er mois",
    desc: "Cabinets stratégiques · validation manuelle",
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Période d'essai" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Opérations clients</div>
            <h1 className="hero-title">Période d&apos;essai</h1>
            <p className="hero-sub">
              Suivi des prospects en période d&apos;essai gratuite — coordonnées complètes, étape du
              parcours, offre proposée, conversion vers un abonnement payant.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Templates email">
              <svg>
                <use href="#i-comms" />
              </svg>
              Templates email
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Démarrer un essai">
              Démarrer un essai
            </button>
          </div>
        </div>

        <div className="kpis mb-20">
          <div className="kpi">
            <div className="kpi-label">Essais en cours</div>
            <div className="kpi-value">4</div>
            <div className="kpi-meta">démarrés &lt; 30 jours</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Démarrés ces 30 jours</div>
            <div className="kpi-value">7</div>
            <div className="kpi-meta">▲ +14 % vs M-1</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Échéance dans &lt; 7 jours</div>
            <div className="kpi-value" style={{ color: "var(--orange-text)" }}>
              3
            </div>
            <div className="kpi-meta">à relancer en priorité</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Taux de conversion historique</div>
            <div className="kpi-value">
              68 <span className="unit">%</span>
            </div>
            <div className="kpi-meta">essai → client payant</div>
          </div>
        </div>

        <div className="kpis kpis-3 mb-20">
          <div className="kpi">
            <div className="kpi-label">Durée moyenne d&apos;essai</div>
            <div className="kpi-value">
              22 <span className="unit">jours</span>
            </div>
            <div className="kpi-meta">avant signature</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Emails de relance ouverts</div>
            <div className="kpi-value">
              82 <span className="unit">%</span>
            </div>
            <div className="kpi-meta">taux d&apos;ouverture moyen</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Conversions avec offre</div>
            <div className="kpi-value">
              +24 <span className="unit">%</span>
            </div>
            <div className="kpi-meta">offre incitative -10 % à -50 %</div>
          </div>
        </div>

        {/* Stepper simplifié 3 étapes */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-trial" />
              </svg>
              Parcours d&apos;un essai · 3 étapes principales
            </div>
            <span className="card-subtitle">Les emails de relance et l&apos;offre sont automatisés</span>
          </div>
          <div className="card-body" style={{ padding: "14px 0" }}>
            <div
              className="pipeline-stepper"
              style={{ gridTemplateColumns: "repeat(3,1fr)", margin: 0, border: "none" }}
            >
              <div
                className="stepper-item completed"
                style={{ background: "linear-gradient(135deg, var(--ivory), var(--green-bg))" }}
              >
                <div
                  className="stepper-badge"
                  style={{
                    background: "var(--green-text)",
                    color: "white",
                    borderColor: "var(--green-text)",
                  }}
                >
                  <svg>
                    <use href="#i-success" />
                  </svg>
                </div>
                <div className="stepper-label">DÉMARRAGE</div>
                <div className="stepper-count">7</div>
                <div className="stepper-meta">essais démarrés ces 30j</div>
              </div>
              <div className="stepper-item active">
                <div className="stepper-badge">
                  <svg>
                    <use href="#i-trial" />
                  </svg>
                </div>
                <div className="stepper-label">EN PÉRIODE D&apos;ESSAI</div>
                <div className="stepper-count">4</div>
                <div className="stepper-meta">essais actifs en cours</div>
              </div>
              <div className="stepper-item">
                <div className="stepper-badge">
                  <svg>
                    <use href="#i-business" />
                  </svg>
                </div>
                <div className="stepper-label">CONVERSION</div>
                <div className="stepper-count">3</div>
                <div className="stepper-meta">signés ces 30j · 68 % taux</div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLEAU REFONDU avec coordonnées complètes */}
        <div className="table-wrap mb-24">
          <TrialToolbar />

          <table className="dt">
            <thead>
              <tr>
                <th>Contact (Prénom Nom)</th>
                <th>Fonction</th>
                <th>Cabinet</th>
                <th>Coordonnées</th>
                <th>Type</th>
                <th>Démarré le</th>
                <th>Reste</th>
                <th>Étape parcours</th>
                <th>Offre proposée</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr className="dt-clickable" key={row.email}>
                  <td className="cell-primary">{row.name}</td>
                  <td>{row.role}</td>
                  <td>{row.cabinet}</td>
                  <td
                    style={{
                      fontSize: "11px",
                      lineHeight: "1.4",
                      color: "var(--navy)",
                    }}
                  >
                    <div>
                      <svg
                        style={{
                          width: "10px",
                          height: "10px",
                          color: "var(--gold)",
                          verticalAlign: "middle",
                        }}
                      >
                        <use href="#i-mail" />
                      </svg>{" "}
                      {row.email}
                    </div>
                    <div>
                      <svg
                        style={{
                          width: "10px",
                          height: "10px",
                          color: "var(--gold)",
                          verticalAlign: "middle",
                        }}
                      >
                        <use href="#i-phone" />
                      </svg>{" "}
                      {row.phone}
                    </div>
                  </td>
                  <td>
                    <span className={row.type.cls}>{row.type.label}</span>
                  </td>
                  <td>{row.startedAt}</td>
                  <td>
                    <span className={row.reste.cls}>{row.reste.label}</span>
                  </td>
                  <td>
                    <span className={row.etape.cls}>{row.etape.label}</span>
                  </td>
                  <td>
                    <span className={row.offre.cls}>{row.offre.label}</span>
                  </td>
                  <td className="center" style={{ whiteSpace: "nowrap" }}>
                    <button
                      className={row.callGold ? "btn btn-gold btn-sm" : "btn btn-ghost btn-sm"}
                      style={{ marginRight: "4px" }}
                      data-stub="Appeler"
                    >
                      <svg>
                        <use href="#i-phone" />
                      </svg>
                      Appeler
                    </button>
                    <button className="btn btn-ghost btn-sm" data-stub="Email">
                      <svg>
                        <use href="#i-mail" />
                      </svg>
                      Email
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Offre incitative configurable */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-ai" />
              </svg>
              Offres incitatives configurables
            </div>
          </div>
          <div className="card-body">
            <div className="info-bar success">
              <svg>
                <use href="#i-success" />
              </svg>
              <div>
                3 offres incitatives configurables, à activer au cas par cas. Statistiquement, ces
                offres font passer le taux de conversion de <strong>52 %</strong> à{" "}
                <strong>76 %</strong>.
              </div>
            </div>
            <div className="grid-3" style={{ marginTop: "14px" }}>
              {OFFERS.map((offer) => (
                <div className="card" key={offer.title}>
                  <div className="card-body">
                    <span className={offer.badge.cls} style={{ marginBottom: "8px" }}>
                      {offer.badge.label}
                    </span>
                    <div className="kpi-label" style={{ marginBottom: "6px" }}>
                      {offer.title}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--gold)" }}>
                      {offer.value}
                    </div>
                    <div
                      style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "4px" }}
                    >
                      {offer.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
