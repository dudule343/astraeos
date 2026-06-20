import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { ReferentielClient } from "./ReferentielClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Process & méthodologie" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Process & méthodologie" />
      <div className="content">
        <ReferentielClient />
      </div>
    </>
  );
}
