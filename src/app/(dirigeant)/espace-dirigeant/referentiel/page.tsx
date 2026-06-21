// Espace dirigeant — Référentiel · Process & méthodologie.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 8173-8359). Route : /espace-dirigeant/referentiel
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { ReferentielClient } from "./ReferentielClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Process & méthodologie" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Process & méthodologie" />
      <div className="content">
        <ReferentielClient />
      </div>
    </>
  );
}
