// Espace dirigeant — Recrutement des ingénieurs.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 6621-6745). Route : /espace-dirigeant/ingenieurs/recrutement
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { RecrutementClient } from "./RecrutementClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Recrutement des ingénieurs",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Recrutement des ingénieurs" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">
              Acquisition · pipeline candidatures · Cabinet Paris Étoile
            </div>
            <h1 className="hero-title">
              Recrutement des <strong>ingénieurs</strong>
            </h1>
            <p className="hero-sub">
              Candidatures d&apos;ingénieurs patrimoniaux souhaitant rejoindre le Cabinet Paris
              Étoile. Suivi du parcours de recrutement de la candidature initiale à la signature du
              contrat de travail.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
            <button className="btn btn-gold btn-sm">
              <svg>
                <use href="#i-new" />
              </svg>
              Saisir une candidature
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpis kpis-5 mb-20">
          <div className="kpi">
            <div className="kpi-label">Candidatures actives</div>
            <div className="kpi-value">9</div>
            <div className="kpi-meta">en cours d&apos;instruction</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">À auditionner</div>
            <div className="kpi-value" style={{ color: "var(--gold)" }}>
              3
            </div>
            <div className="kpi-meta">RDV à planifier</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">En audit dossier</div>
            <div className="kpi-value">4</div>
            <div className="kpi-meta">vérification ORIAS / RC</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">À signer</div>
            <div className="kpi-value" style={{ color: "var(--green-text)" }}>
              2
            </div>
            <div className="kpi-meta">prêts pour souscription</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Délai moyen</div>
            <div className="kpi-value">
              42 <span className="unit">jours</span>
            </div>
            <div className="kpi-meta">candidature → souscription</div>
          </div>
        </div>

        {/* Tableau candidatures */}
        <RecrutementClient />
      </div>
    </>
  );
}
