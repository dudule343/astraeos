import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { SuiviClient } from "./SuiviClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Clients en suivi",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Clients en suivi" />
      <div className="content">
        <SuiviClient />
      </div>
    </>
  );
}
