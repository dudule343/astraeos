import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { RestitueesClient } from "./RestitueesClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Études restituées",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Études restituées" />
      <div className="content">
        <RestitueesClient />
      </div>
    </>
  );
}
