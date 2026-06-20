import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { TemplatesClient } from "./TemplatesClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Templates & communication" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Templates & communication" />
      <div className="content">
        <TemplatesClient />
      </div>
    </>
  );
}
