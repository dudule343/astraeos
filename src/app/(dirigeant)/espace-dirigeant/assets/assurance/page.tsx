import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { AssuranceClient } from "./AssuranceClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Assurance" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Assurance" />
      <div className="content">
        <AssuranceClient />
      </div>
    </>
  );
}
