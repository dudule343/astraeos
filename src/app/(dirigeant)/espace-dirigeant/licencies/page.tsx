// Espace dirigeant — Licenciés (réseau).
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 5841-6143). Route : /espace-dirigeant/licencies
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { LicenciesClient } from "./LicenciesClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Licenciés" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Licenciés" />
      <div className="content">
        <LicenciesClient />
      </div>
    </>
  );
}
