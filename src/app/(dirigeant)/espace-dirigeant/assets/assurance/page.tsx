// Espace dirigeant — Assets · Assurance.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 7848-7922). Route : /espace-dirigeant/assets/assurance
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { AssuranceClient } from "./AssuranceClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Assurance" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Assurance" />
      <div className="content">
        <AssuranceClient />
      </div>
    </>
  );
}
