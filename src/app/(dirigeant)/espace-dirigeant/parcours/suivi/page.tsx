// Espace dirigeant — Parcours 06 · Clients en suivi.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 7479-7608). Route : /espace-dirigeant/parcours/suivi
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { SuiviClient } from "./SuiviClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Clients en suivi",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Clients en suivi" />
      <div className="content">
        <SuiviClient />
      </div>
    </>
  );
}
