import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { ImmobilierClient } from "./ImmobilierClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Investissement immobilier" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Investissement immobilier" />
      <div className="content">
        <ImmobilierClient />
      </div>
    </>
  );
}
