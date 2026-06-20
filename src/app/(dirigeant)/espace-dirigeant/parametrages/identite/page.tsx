import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { IdentiteClient } from "./IdentiteClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Identité de la marque",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Identité de la marque" />
      <div className="content">
        <IdentiteClient />
      </div>
    </>
  );
}
