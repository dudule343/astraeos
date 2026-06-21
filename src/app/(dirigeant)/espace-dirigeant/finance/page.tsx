// Espace dirigeant — Vue d'ensemble financière.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 2661-4202). Route : /espace-dirigeant/finance
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { FinanceOverviewClient } from "./FinanceOverviewClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Vue d'ensemble financière",
};

export default function FinanceOverviewPage() {
  return (
    <>
      <DirigeantTopbar current="Vue d'ensemble financière" />
      <div className="content">
        <FinanceOverviewClient />
      </div>
    </>
  );
}
