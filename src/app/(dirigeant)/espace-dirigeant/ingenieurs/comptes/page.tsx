// Espace dirigeant — Comptes ingénieurs.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 8570-8610). Route : /espace-dirigeant/ingenieurs/comptes
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { ComptesIngenieursClient } from "./ComptesIngenieursClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Comptes ingénieurs",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Comptes ingénieurs" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Gestion du cabinet · accès &amp; utilisation ASTRAEOS</div>
            <h1 className="hero-title">
              Comptes <strong>ingénieurs</strong>
            </h1>
            <p className="hero-sub">
              Vue d&apos;ensemble des accès des 5 ingénieurs du Cabinet Paris Étoile à la plateforme
              ASTRAEOS. Suspension, réactivation, statistiques d&apos;utilisation.{" "}
              <strong>Cliquez sur un ingénieur</strong> pour ouvrir le détail des 10 dernières
              connexions et le temps moyen passé en activité.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-gold btn-sm">
              <svg>
                <use href="#i-new" />
              </svg>
              Activer un compte
            </button>
          </div>
        </div>

        <div className="kpis kpis-4 mb-20">
          <div className="kpi">
            <div className="kpi-label">Ingénieurs total</div>
            <div className="kpi-value">5</div>
            <div className="kpi-meta">4 ingénieurs + vous (dirigeant-praticien)</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Connexions par jour</div>
            <div className="kpi-value">12</div>
            <div className="kpi-meta">moyenne sur 30 jours</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Temps moyen / session</div>
            <div className="kpi-value">
              2 <span className="unit">h 48 min</span>
            </div>
            <div className="kpi-meta">activité par session</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Espace stockage</div>
            <div className="kpi-value">
              4,2 <span className="unit">GB</span>
            </div>
            <div className="kpi-meta">/ 20 GB alloués au cabinet</div>
          </div>
        </div>

        <ComptesIngenieursClient />
      </div>
    </>
  );
}
