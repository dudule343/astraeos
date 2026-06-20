import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import CatalogueClient from "./CatalogueClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Catalogue produits" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Catalogue produits" />
      <div className="content">
        <CatalogueClient />
      </div>
    </>
  );
}
