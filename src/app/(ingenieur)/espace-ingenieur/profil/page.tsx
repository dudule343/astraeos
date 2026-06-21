import { fetchProfilScreen } from "../../_data/profil-server";
import "../../_styles/profil.css";
import ProfilInteractive from "./ProfilInteractive";

export const metadata = {
  title: "ASTRAEOS · Profil & agréments",
};

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const screen = await fetchProfilScreen();
  return <ProfilInteractive screen={screen} />;
}
