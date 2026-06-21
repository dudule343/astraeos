// Espace dirigeant — Outils · Bibliothèque marketing.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 9675-9759). Route : /espace-dirigeant/outils/marketing
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { MarketingClient } from "./MarketingClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Bibliothèque marketing" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Bibliothèque marketing" />
      <div className="content">
        <MarketingClient />
      </div>
    </>
  );
}
