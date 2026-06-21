// Espace dirigeant — Parcours 05 · Études restituées.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 7347-7478). Route : /espace-dirigeant/parcours/restituees
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { RestitueesClient } from "./RestitueesClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Études restituées",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Études restituées" />
      <div className="content">
        <RestitueesClient />
      </div>
    </>
  );
}
