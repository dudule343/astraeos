// Espace dirigeant — Outils · Catalogue produits.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 9471-9584). Route : /espace-dirigeant/outils/catalogue
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import CatalogueClient from "./CatalogueClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Catalogue produits" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Catalogue produits" />
      <div className="content">
        <CatalogueClient />
      </div>
    </>
  );
}
