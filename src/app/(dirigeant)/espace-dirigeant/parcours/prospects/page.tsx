// Espace dirigeant — Parcours 01 · Prospects actifs.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 6746-6923). Route : /espace-dirigeant/parcours/prospects
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { ProspectsClient } from "./ProspectsClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Prospects actifs",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Prospects actifs" />
      <div className="content">
        <ProspectsClient />
      </div>
    </>
  );
}
