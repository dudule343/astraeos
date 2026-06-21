// Espace dirigeant — Paramétrages · Intégrations & connecteurs.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 8772-8974). Route : /espace-dirigeant/parametrages/integrations
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { IntegrationsClient } from "./IntegrationsClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Intégrations & connecteurs",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Intégrations & connecteurs" />
      <div className="content">
        <IntegrationsClient />
      </div>
    </>
  );
}
