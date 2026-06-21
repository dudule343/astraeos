// Espace éditeur — page « Programme de parrainage » (route /referral).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-referral">, lignes 2196-2423. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";
import { ReferralTabs } from "./ReferralTabs";
import { CopyLinkButton } from "./CopyLinkButton";

type Sponsor = {
  logo: string;
  logoClass: string;
  name: string;
  typeLabel: string;
  typeClass: string;
  filleuls: string;
  payants: string;
  payantsGold: boolean;
  caRecurrent: string;
  commission: string;
  commissionGold: boolean;
};

const SPONSORS: Sponsor[] = [
  {
    logo: "P",
    logoClass: "tlogo-priveos",
    name: "PRIVEOS Capital",
    typeLabel: "Marque",
    typeClass: "tt-marque",
    filleuls: "12",
    payants: "4",
    payantsGold: true,
    caRecurrent: "348 €/mois",
    commission: "69,60 €/mois",
    commissionGold: true,
  },
  {
    logo: "D",
    logoClass: "tlogo-dupont",
    name: "Cabinet Dupont",
    typeLabel: "Cabinet",
    typeClass: "tt-cabinet",
    filleuls: "8",
    payants: "2",
    payantsGold: true,
    caRecurrent: "174 €/mois",
    commission: "34,80 €/mois",
    commissionGold: true,
  },
  {
    logo: "JV",
    logoClass: "tlogo-1",
    name: "Julien VASSEUR",
    typeLabel: "Mandataire PRIVEOS",
    typeClass: "tt-cabinet",
    filleuls: "6",
    payants: "2",
    payantsGold: true,
    caRecurrent: "174 €/mois",
    commission: "34,80 €/mois",
    commissionGold: true,
  },
  {
    logo: "M",
    logoClass: "tlogo-pro",
    name: "Notaire Mercier",
    typeLabel: "Autre pro",
    typeClass: "tt-pro",
    filleuls: "5",
    payants: "1",
    payantsGold: true,
    caRecurrent: "87 €/mois",
    commission: "17,40 €/mois",
    commissionGold: true,
  },
  {
    logo: "MB",
    logoClass: "tlogo-montblanc",
    name: "Mont-Blanc Patrimoine",
    typeLabel: "Cabinet",
    typeClass: "tt-cabinet",
    filleuls: "3",
    payants: "0",
    payantsGold: true,
    caRecurrent: "— €",
    commission: "— €",
    commissionGold: false,
  },
];

type Activity = {
  badgeClass: string;
  badgeLabel: string;
  time: string;
  title: string;
  sub: React.ReactNode;
};

const ACTIVITY: Activity[] = [
  {
    badgeClass: "badge-success",
    badgeLabel: "Conversion",
    time: "il y a 2h",
    title: "Filleul de PRIVEOS Capital → signature client",
    sub: "Cabinet Voltaire (Marseille) · abonnement 87 €/mois → 17,40 €/mois pour PRIVEOS",
  },
  {
    badgeClass: "badge-info",
    badgeLabel: "Nouveau filleul",
    time: "hier 14h",
    title: "Cabinet Dupont a parrainé Maxime SOULIER",
    sub: "Soulier Patrimoine (Bordeaux) · démarrage essai prévu",
  },
  {
    badgeClass: "badge-info",
    badgeLabel: "Nouveau filleul",
    time: "il y a 2 jours",
    title: "Julien VASSEUR a parrainé Notaire LERAY",
    sub: "Étude Leray & Cie (Nantes) · qualification en cours",
  },
  {
    badgeClass: "badge-gold",
    badgeLabel: "Commission mensuelle",
    time: "1er mai",
    title: "Versement mensuel des commissions parrainage",
    sub: "9 commissions versées · total 156,60 €",
  },
];

export const metadata = {
  title: "ASTRAEOS · Programme de parrainage",
};

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Programme de parrainage" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Acquisition · Programme NEW</div>
            <h1 className="hero-title">Programme de parrainage</h1>
            <p className="hero-sub">
              Permettre aux clients (marques, cabinets directs, mandataires, autres pros) de
              recommander ASTRAEOS à leur réseau — modèle de rémunération récurrente :{" "}
              <strong>20 % du montant de l&apos;abonnement</strong> du filleul, versé chaque mois tant
              que le filleul reste actif.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Modifier le %">
              Modifier le %
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Inviter un parrain">
              <svg>
                <use href="#i-link" />
              </svg>
              Inviter un parrain
            </button>
          </div>
        </div>

        {/* Encadré pédagogique du modèle économique */}
        <div className="info-bar success">
          <svg>
            <use href="#i-success" />
          </svg>
          <div>
            <strong>Modèle économique simple :</strong> le filleul devient client payant → le parrain
            perçoit <strong>20 % du montant de l&apos;abonnement</strong> chaque mois, tant que le
            filleul reste actif. La commission ne s&apos;applique qu&apos;à{" "}
            <strong>l&apos;abonnement à la solution ASTRAEOS</strong> (pas sur les packs ponctuels ni
            les commissions partenaires).
          </div>
        </div>

        {/* KPIs parrainage : 5 KPIs (sans coût d'acquisition) */}
        <div className="kpis kpis-5 mb-20">
          <div className="kpi">
            <div className="kpi-label">Parrains actifs</div>
            <div className="kpi-value">14</div>
            <div className="kpi-meta">sur 23 clients · 61 %</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Filleuls reçus</div>
            <div className="kpi-value">42</div>
            <div className="kpi-meta">
              leads parrainés <span className="ytd-pill">cumul depuis janv.</span>
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Filleuls payants</div>
            <div className="kpi-value">9</div>
            <div className="kpi-meta">21 % de conversion · vs 7 % autres canaux</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">CA récurrent généré</div>
            <div className="kpi-value">
              9 460 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">9 abonnements actifs · ~1 050 €/mois</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Commissions versées</div>
            <div className="kpi-value">
              1 892 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">20 % du CA récurrent · cumulé</div>
          </div>
        </div>

        {/* Tabs */}
        <ReferralTabs />

        {/* Top parrains */}
        <div className="grid-2 mb-24">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-team" />
                </svg>
                Top 5 parrains performants
              </div>
              <button className="btn btn-ghost btn-sm" data-stub="Tous les parrains">
                Tous les parrains
              </button>
            </div>
            <table className="dt">
              <thead>
                <tr>
                  <th>Parrain</th>
                  <th>Type</th>
                  <th className="num">Filleuls</th>
                  <th className="num">Payants</th>
                  <th className="num">CA récurrent</th>
                  <th className="num">Commission /mois</th>
                </tr>
              </thead>
              <tbody>
                {SPONSORS.map((s) => (
                  <tr className="dt-clickable" key={s.name}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <div className={`tlogo tlogo-sm ${s.logoClass}`}>{s.logo}</div>
                        <div className="cell-primary">{s.name}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`tt ${s.typeClass}`}>{s.typeLabel}</span>
                    </td>
                    <td className="num">{s.filleuls}</td>
                    <td className={`num cell-money${s.payantsGold ? " gold" : ""}`}>{s.payants}</td>
                    <td className="num cell-money">{s.caRecurrent}</td>
                    <td className={`num cell-money${s.commissionGold ? " gold" : ""}`}>
                      {s.commission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-success" />
                </svg>
                Activité récente
              </div>
              <button className="btn btn-ghost btn-sm" data-stub="Tout voir">
                Tout voir
              </button>
            </div>
            <div style={{ padding: 0 }}>
              {ACTIVITY.map((a) => (
                <div className="alert-item" key={a.title}>
                  <div className="alert-meta">
                    <span className={`badge ${a.badgeClass} badge-dot`}>{a.badgeLabel}</span>
                    <span>{a.time}</span>
                  </div>
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-sub">{a.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration commission (modèle 20 % unique) */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Configuration du programme</div>
              <div className="section-title">Modèle de commission en vigueur</div>
            </div>
            <button className="btn btn-ghost btn-sm" data-stub="Modifier le pourcentage">
              Modifier le pourcentage
            </button>
          </div>

          <div className="grid-2">
            {/* Carte explication modèle */}
            <div
              className="referral-card"
              style={{
                background: "linear-gradient(135deg, var(--ivory) 0%, var(--gold-200) 100%)",
                borderColor: "var(--gold-300)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "14px",
                }}
              >
                <div
                  className="icon-badge lg"
                  style={{ background: "var(--gold)", color: "white", borderColor: "var(--gold)" }}
                >
                  <svg>
                    <use href="#i-success" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)" }}>
                    Commission récurrente
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
                    Versée chaque mois tant que le filleul reste actif
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "var(--gold)",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                20 %
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--navy)", lineHeight: 1.6 }}>
                de l&apos;abonnement mensuel à la solution ASTRAEOS payé par le filleul.
              </div>
              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--gold-300)",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: "var(--navy)" }}>Périmètre :</strong> uniquement
                l&apos;abonnement à la solution (Pack Investissements financiers · Abonnement
                portefeuille). Aucune commission n&apos;est versée sur les packs ponctuels
                (constitution portefeuille, formation, supervision, immatriculation) ni sur les
                commissions partenaires (immobilier, assurance).
              </div>
            </div>

            {/* Exemple concret */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <svg>
                    <use href="#i-info" />
                  </svg>
                  Exemple concret de calcul
                </div>
              </div>
              <div className="card-body">
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--navy)",
                    fontWeight: 600,
                    marginBottom: "14px",
                  }}
                >
                  Cabinet Voltaire (filleul de PRIVEOS Capital) souscrit l&apos;abonnement à 87
                  €/mois.
                </div>
                <div className="finance-detail-row">
                  <span className="finance-detail-label">Abonnement filleul</span>
                  <span className="finance-detail-value">87 €/mois</span>
                </div>
                <div className="finance-detail-row">
                  <span className="finance-detail-label">Taux de commission</span>
                  <span className="finance-detail-value">20 %</span>
                </div>
                <div className="finance-detail-row" style={{ background: "var(--ivory)" }}>
                  <span
                    className="finance-detail-label"
                    style={{ fontWeight: 700, color: "var(--gold)" }}
                  >
                    Commission mensuelle parrain
                  </span>
                  <span className="finance-detail-value" style={{ color: "var(--gold)" }}>
                    17,40 €/mois
                  </span>
                </div>
                <div className="finance-detail-row">
                  <span className="finance-detail-label">Sur 12 mois (filleul fidèle)</span>
                  <span className="finance-detail-value gold">208,80 €/an</span>
                </div>
                <div className="finance-detail-row">
                  <span className="finance-detail-label">Sur 36 mois (LTV moyenne)</span>
                  <span className="finance-detail-value gold">626,40 €</span>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px 12px",
                    background: "var(--green-bg)",
                    borderRadius: "6px",
                    fontSize: "11.5px",
                    color: "var(--green-text)",
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Note :</strong> commission interrompue automatiquement si le filleul résilie
                  son abonnement.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lien personnalisé exemple */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-link" />
              </svg>
              Espace parrain · vue côté client (à concevoir)
            </div>
            <span className="badge badge-purple">Aperçu de ce que verra le parrain</span>
          </div>
          <div className="card-body">
            <div
              style={{
                fontSize: "13px",
                color: "var(--navy)",
                marginBottom: "10px",
                fontWeight: 600,
              }}
            >
              Chaque client a un lien de parrainage personnalisé dans son espace :
            </div>
            <div className="referral-card-link">
              <svg style={{ color: "var(--gold)" }}>
                <use href="#i-link" />
              </svg>
              <span>https://astraeos.fr/parrainage/PRIVEOS-A2K9X8</span>
              <CopyLinkButton value="https://astraeos.fr/parrainage/PRIVEOS-A2K9X8" />
            </div>
            <div
              style={{
                fontSize: "11.5px",
                color: "var(--navy-300)",
                marginTop: "14px",
                lineHeight: 1.6,
              }}
            >
              Le parrain pourra suivre dans son espace :{" "}
              <strong style={{ color: "var(--navy)" }}>filleuls invités</strong> ·{" "}
              <strong style={{ color: "var(--navy)" }}>filleuls qui ont démarré l&apos;essai</strong>{" "}
              · <strong style={{ color: "var(--navy)" }}>filleuls devenus payants</strong> ·{" "}
              <strong style={{ color: "var(--navy)" }}>commissions mensuelles cumulées</strong> ·{" "}
              <strong style={{ color: "var(--navy)" }}>historique des virements perçus</strong>.
            </div>
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                background: "var(--purple-bg)",
                borderRadius: "6px",
                fontSize: "11.5px",
                color: "var(--purple-text)",
                lineHeight: 1.5,
              }}
            >
              <strong>À concevoir dans un wireframe ultérieur :</strong> espace parrain côté client
              (sera traité dans un Doc Phase 2 dédié à l&apos;espace utilisateur).
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
