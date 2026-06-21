import { getProfilScreen } from "../../_data/profil";
import "../../_styles/profil.css";
import ProfilInteractive from "./ProfilInteractive";

export const metadata = {
  title: "ASTRAEOS · Profil & agréments",
};

export const dynamic = "force-dynamic";

export default function ProfilPage() {
  const screen = getProfilScreen();
  return <ProfilInteractive screen={screen} />;
}
