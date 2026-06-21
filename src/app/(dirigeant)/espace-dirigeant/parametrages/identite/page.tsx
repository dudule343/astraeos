// Espace dirigeant — Paramétrages · Identité de la marque.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 8471-8569). Route : /espace-dirigeant/parametrages/identite
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { IdentiteClient } from "./IdentiteClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Identité de la marque",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Identité de la marque" />
      <div className="content">
        <IdentiteClient />
      </div>
    </>
  );
}
