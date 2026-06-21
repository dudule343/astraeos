// Espace dirigeant — Parcours 04 · Études en cours.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 7235-7346). Route : /espace-dirigeant/parcours/etudes
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { EtudesClient } from "./EtudesClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Études en cours",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Études en cours" />
      <div className="content">
        <EtudesClient />
      </div>
    </>
  );
}
