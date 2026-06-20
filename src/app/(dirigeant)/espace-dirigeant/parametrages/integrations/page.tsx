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
