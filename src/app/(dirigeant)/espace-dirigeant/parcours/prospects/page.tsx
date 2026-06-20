import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { ProspectsClient } from "./ProspectsClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Prospects actifs",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Prospects actifs" />
      <div className="content">
        <ProspectsClient />
      </div>
    </>
  );
}
