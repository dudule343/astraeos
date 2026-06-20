import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { PartenairesClient } from "./PartenairesClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Partenaires & apporteurs",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Partenaires & apporteurs" />
      <div className="content">
        <PartenairesClient />
      </div>
    </>
  );
}
