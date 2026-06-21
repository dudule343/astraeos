// Espace dirigeant — Parcours 02 · Compliance validée.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 6924-7075). Route : /espace-dirigeant/parcours/compliance
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { ComplianceClient } from "./ComplianceClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Compliance validée",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Compliance validée" />
      <div className="content">
        <ComplianceClient />
      </div>
    </>
  );
}
