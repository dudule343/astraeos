import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { FinanceOverviewClient } from "./FinanceOverviewClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Vue d'ensemble financière",
};

export default function FinanceOverviewPage() {
  return (
    <>
      <DirigeantTopbar current="Vue d'ensemble financière" />
      <div className="content">
        <FinanceOverviewClient />
      </div>
    </>
  );
}
