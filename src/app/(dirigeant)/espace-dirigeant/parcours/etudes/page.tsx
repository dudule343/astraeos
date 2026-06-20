import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { EtudesClient } from "./EtudesClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Études en cours",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Études en cours" />
      <div className="content">
        <EtudesClient />
      </div>
    </>
  );
}
