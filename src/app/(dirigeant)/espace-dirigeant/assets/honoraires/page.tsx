import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { HonorairesClient } from "./HonorairesClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Honoraires de conseil",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Honoraires de conseil" />
      <div className="content">
        <HonorairesClient />
      </div>
    </>
  );
}
