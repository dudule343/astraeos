// Espace dirigeant — Performance des ingénieurs.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 6144-6538). Route : /espace-dirigeant/performance
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { PerformanceClient } from "./PerformanceClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Performance",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Performance" />
      <div className="content">
        <PerformanceClient />
      </div>
    </>
  );
}
