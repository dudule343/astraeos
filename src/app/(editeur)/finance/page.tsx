import { EditeurTopbar } from "../_components/EditeurTopbar";
import { FinanceConsolidee } from "./FinanceConsolidee";

export const metadata = {
  title: "ASTRAEOS · Finance consolidée",
};

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Finance consolidée" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Pilotage interne</div>
            <h1 className="hero-title">Finance consolidée</h1>
            <p className="hero-sub">
              Pilotage financier complet d&apos;ASTRAEOS — compte de résultat avec évolution N/N-1,
              détail du CA généré, détail des charges par poste, trésorerie multi-comptes,
              prévisionnel et marge par client.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export comptable">
              <svg>
                <use href="#i-download" />
              </svg>
              Export comptable
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Connexion Qonto">
              Connexion Qonto
            </button>
          </div>
        </div>

        <FinanceConsolidee />
      </div>
    </>
  );
}
