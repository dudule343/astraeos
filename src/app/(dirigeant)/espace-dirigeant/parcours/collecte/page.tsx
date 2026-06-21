// Espace dirigeant — Parcours 03 · Collecte docs & infos.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 7076-7234). Route : /espace-dirigeant/parcours/collecte
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { CollecteClient } from "./CollecteClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Collecte docs & infos",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Collecte docs & infos" />
      <div className="content">
        <CollecteClient />
      </div>
    </>
  );
}
