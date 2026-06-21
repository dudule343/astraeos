// Espace dirigeant — Assets · Investissement immobilier.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 7923-8097). Route : /espace-dirigeant/assets/immobilier
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { ImmobilierClient } from "./ImmobilierClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Investissement immobilier" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Investissement immobilier" />
      <div className="content">
        <ImmobilierClient />
      </div>
    </>
  );
}
