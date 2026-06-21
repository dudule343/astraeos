// Espace dirigeant — Outils · Simulateurs & calculateurs.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 9585-9674). Route : /espace-dirigeant/outils/simulateurs
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { SimulateursClient } from "./SimulateursClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Simulateurs & calculateurs" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Simulateurs & calculateurs" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Outils · simulateurs · consultation &amp; calculateurs</div>
            <h1 className="hero-title">
              Simulateurs &amp; <strong>calculateurs</strong>
            </h1>
            <p className="hero-sub">
              Outils mis à disposition des cabinets licenciés et des clients : simulations fiscales,
              financières et immobilières.
            </p>
          </div>
        </div>

        {/* 6 cartes alignées avec hauteur fixe + boutons alignés en bas */}
        <SimulateursClient />
      </div>
    </>
  );
}
