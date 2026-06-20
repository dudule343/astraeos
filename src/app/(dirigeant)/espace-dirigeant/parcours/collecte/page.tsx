import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { CollecteClient } from "./CollecteClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Collecte docs & infos",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Collecte docs & infos" />
      <div className="content">
        <CollecteClient />
      </div>
    </>
  );
}
