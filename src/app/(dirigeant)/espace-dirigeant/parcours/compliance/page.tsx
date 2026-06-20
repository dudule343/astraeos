import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { ComplianceClient } from "./ComplianceClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Compliance validée",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Compliance validée" />
      <div className="content">
        <ComplianceClient />
      </div>
    </>
  );
}
