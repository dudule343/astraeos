// Espace éditeur — page « Équipe interne » (route /team).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-team">, lignes 4240-4509. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";
import { TeamRosterDrawer } from "./TeamRosterDrawer";

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Équipe interne" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Pilotage interne</div>
            <h1 className="hero-title">Équipe interne</h1>
            <p className="hero-sub">
              Effectif d&apos;ASTRAEOS organisé en 4 catégories : Direction, Technique, Support,
              Commerciaux. Coût et charge sur le CA suivis en temps réel.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export RH">
              <svg>
                <use href="#i-download" />
              </svg>
              Export RH
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Nouveau collaborateur">
              <svg>
                <use href="#i-new" />
              </svg>
              Nouveau collaborateur
            </button>
          </div>
        </div>

        <div className="kpis kpis-5 mb-20">
          <div className="kpi">
            <div className="kpi-label">Effectif total</div>
            <div className="kpi-value">11</div>
            <div className="kpi-meta">salariés + prestataires</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Direction</div>
            <div className="kpi-value">2</div>
            <div className="kpi-meta">Présidente fondatrice + Dir. des opérations</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Technique</div>
            <div className="kpi-value">4</div>
            <div className="kpi-meta">resp. tech + 3 développeurs</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Support &amp; relation</div>
            <div className="kpi-value">3</div>
            <div className="kpi-meta">2 resp. relation client + 1 N1</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Commerciaux</div>
            <div className="kpi-value">2</div>
            <div className="kpi-meta">1 commercial senior + 1 jr</div>
          </div>
        </div>

        <div className="kpis kpis-3 mb-20">
          <div className="kpi">
            <div className="kpi-label">Coût total mensuel</div>
            <div className="kpi-value">
              82 400 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">salaires + charges + prestataires</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Charge sur le CA</div>
            <div className="kpi-value">
              33 <span className="unit">%</span>
            </div>
            <div className="kpi-meta">cible &lt; 35 % · OK</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Coût moyen par collaborateur</div>
            <div className="kpi-value">
              7 490 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">coût mensuel chargé moyen</div>
          </div>
        </div>

        <div className="info-bar">
          <svg>
            <use href="#i-info" />
          </svg>
          <div>
            Cliquez sur un collaborateur (hors direction) pour ouvrir sa fiche détaillée — activité
            de la semaine, indicateurs adaptés à son rôle (technique, support ou commercial).
          </div>
        </div>

        <TeamRosterDrawer />
      </div>
    </>
  );
}
