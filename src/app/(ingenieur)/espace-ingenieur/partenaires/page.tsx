import { getPartenairesScreen } from "../../_data/partenaires";
import "../../_styles/partenaires.css";
import PartenairesInteractive from "./PartenairesInteractive";

export const metadata = {
  title: "ASTRAEOS · Partenaires & apporteurs d'affaires",
};

export const dynamic = "force-dynamic";

export default function PartenairesPage() {
  const screen = getPartenairesScreen();

  return (
    <div className="px-10 py-8">
      <PartenairesInteractive screen={screen} />
    </div>
  );
}
