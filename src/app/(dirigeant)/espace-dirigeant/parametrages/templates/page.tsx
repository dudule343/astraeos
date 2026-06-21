// Espace dirigeant — Paramétrages · Templates & communication.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 9185-9470). Route : /espace-dirigeant/parametrages/templates
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { TemplatesClient } from "./TemplatesClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Templates & communication" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Templates & communication" />
      <div className="content">
        <TemplatesClient />
      </div>
    </>
  );
}
