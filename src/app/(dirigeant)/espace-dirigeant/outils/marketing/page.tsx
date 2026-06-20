import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { MarketingClient } from "./MarketingClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Bibliothèque marketing" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Bibliothèque marketing" />
      <div className="content">
        <MarketingClient />
      </div>
    </>
  );
}
