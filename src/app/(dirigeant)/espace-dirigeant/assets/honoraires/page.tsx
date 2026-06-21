// Espace dirigeant — Assets · Honoraires de conseil.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 8098-8172). Route : /espace-dirigeant/assets/honoraires
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { HonorairesClient } from "./HonorairesClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Honoraires de conseil",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Honoraires de conseil" />
      <div className="content">
        <HonorairesClient />
      </div>
    </>
  );
}
