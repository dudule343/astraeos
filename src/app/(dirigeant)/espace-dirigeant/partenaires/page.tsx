// Espace dirigeant — Partenaires & apporteurs.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 8360-8470). Route : /espace-dirigeant/partenaires
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { PartenairesClient } from "./PartenairesClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Partenaires & apporteurs",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Partenaires & apporteurs" />
      <div className="content">
        <PartenairesClient />
      </div>
    </>
  );
}
