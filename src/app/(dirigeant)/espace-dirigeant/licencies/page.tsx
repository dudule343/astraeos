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
