// Espace éditeur — page « Pipeline acquisition » (route /leads).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-leads">, lignes 2056-2195. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";
import { LeadsPipeline } from "./LeadsPipeline";
import { LeadsToolbar } from "./LeadsToolbar";

const KPIS: { label: string; value: string; unit?: string; meta: string }[] = [
  { label: "Leads totaux", value: "312", meta: "qualifiés actifs" },
  { label: "Nouveaux ce mois", value: "68", meta: "▲ +14 % vs M-1" },
  { label: "RDV planifiés", value: "22", meta: "cette semaine" },
  { label: "Essais proposés", value: "9", meta: "en attente acceptation" },
  { label: "Taux qualification", value: "42 ", unit: "%", meta: "contact → qualifié" },
  { label: "Délai moyen", value: "14 ", unit: "j", meta: "contact → essai" },
];

type Badge = { label: string; variant: "success" | "warning" | "info" | "purple" };

type ActionBtn = { label: string; gold: boolean; icon?: string };

const LEAD_ROWS: {
  name: string;
  contact: string;
  cabinet: string;
  source: Badge;
  etape: Badge;
  dernierContact: string;
  prochaineAction: string;
  affecte: string;
  action: ActionBtn;
}[] = [
  {
    name: "Bertrand FOURNIER",
    contact: "b.fournier@fournier-conseil.fr · 06 12 34 56 78",
    cabinet: "Fournier Conseil Patrimonial",
    source: { label: "Recommandation", variant: "success" },
    etape: { label: "Qualifié", variant: "warning" },
    dernierContact: "Hier",
    prochaineAction: "Appel J+2",
    affecte: "Marc DUPRE",
    action: { label: "Appeler", gold: true, icon: "#i-phone" },
  },
  {
    name: "Caroline DAVAL",
    contact: "c.daval@daval-patrimoine.fr · 06 23 45 67 89",
    cabinet: "Daval Patrimoine",
    source: { label: "Recherche organique", variant: "info" },
    etape: { label: "RDV planifié", variant: "success" },
    dernierContact: "Avant-hier",
    prochaineAction: "RDV demain 14h00",
    affecte: "Marc DUPRE",
    action: { label: "Préparer RDV", gold: false },
  },
  {
    name: "Étienne ALLARD",
    contact: "e.allard@allard-cgp.fr · 06 34 56 78 90",
    cabinet: "Allard CGP",
    source: { label: "LinkedIn Ads", variant: "warning" },
    etape: { label: "Contacté", variant: "info" },
    dernierContact: "il y a 4 jours",
    prochaineAction: "Email de relance",
    affecte: "Hugues CARTIER",
    action: { label: "Email", gold: false, icon: "#i-mail" },
  },
  {
    name: "Maître Catherine NORMANT",
    contact: "c.normant@normant-notaires.fr · 04 56 78 90 12",
    cabinet: "Étude Normant Notaires",
    source: { label: "Salon", variant: "purple" },
    etape: { label: "RDV fait", variant: "success" },
    dernierContact: "il y a 2 jours",
    prochaineAction: "Proposer un essai",
    affecte: "Marc DUPRE",
    action: { label: "Proposer essai", gold: true },
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Pipeline acquisition" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Acquisition · Pipeline opérationnel</div>
            <h1 className="hero-title">Pipeline acquisition</h1>
            <p className="hero-sub">
              Gestion opérationnelle des leads commerciaux en amont de la période d&apos;essai —
              qualification, prise de contact, RDV planifiés, propositions d&apos;essai. Vue
              commerciale du portefeuille.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Nouveau lead">
              <svg>
                <use href="#i-new" />
              </svg>
              Nouveau lead
            </button>
          </div>
        </div>

        {/* KPIs commerciaux */}
        <div className="kpis kpis-6 mb-20">
          {KPIS.map((kpi) => (
            <div className="kpi" key={kpi.label}>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">
                {kpi.value}
                {kpi.unit ? <span className="unit">{kpi.unit}</span> : null}
              </div>
              <div className="kpi-meta">{kpi.meta}</div>
            </div>
          ))}
        </div>

        {/* Pipeline 6 colonnes */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-business" />
              </svg>
              Pipeline commercial · 6 étapes
            </div>
            <button className="btn btn-ghost btn-sm" data-stub="Vue kanban">
              Vue kanban ↗
            </button>
          </div>
          <LeadsPipeline />
        </div>

        {/* Top leads à traiter */}
        <div className="table-wrap mb-24">
          <LeadsToolbar />
          <table className="dt">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Cabinet</th>
                <th>Source</th>
                <th>Étape</th>
                <th>Dernier contact</th>
                <th>Prochain action</th>
                <th>Affecté à</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {LEAD_ROWS.map((row) => (
                <tr className="dt-clickable" key={row.name}>
                  <td className="cell-primary">
                    {row.name}
                    <br />
                    <span
                      style={{
                        fontSize: "10.5px",
                        color: "var(--navy-300)",
                        fontWeight: 400,
                      }}
                    >
                      {row.contact}
                    </span>
                  </td>
                  <td>{row.cabinet}</td>
                  <td>
                    <span className={`badge badge-${row.source.variant}`}>{row.source.label}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${row.etape.variant}`}>{row.etape.label}</span>
                  </td>
                  <td>{row.dernierContact}</td>
                  <td>{row.prochaineAction}</td>
                  <td>{row.affecte}</td>
                  <td className="center">
                    <button
                      className={`btn ${row.action.gold ? "btn-gold" : "btn-ghost"} btn-sm`}
                      data-stub={row.action.label}
                    >
                      {row.action.icon ? (
                        <svg>
                          <use href={row.action.icon} />
                        </svg>
                      ) : null}
                      {row.action.label}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
