import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { PerformanceClient } from "./PerformanceClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Performance",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Performance" />
      <div className="content">
        <PerformanceClient />
      </div>
    </>
  );
}
