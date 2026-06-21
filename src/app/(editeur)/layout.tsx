// Coquille de l'espace éditeur. Voir ./README.md pour l'architecture complète.
// - importe UNE fois le CSS porté de la maquette (généré, scopé sous .maquette-edit) ;
// - enveloppe tout dans <div className="maquette-edit"> : ce wrapper scope les
//   styles de la maquette à l'éditeur (ils ne fuient pas vers les autres espaces) ;
// - rend le sprite SVG (icônes #i-*), la sidebar portée, et la structure .app/.main.
// Chaque page rend ensuite <EditeurTopbar current="…" /> + <div className="content">.
import "./_styles/maquette.css";
import { SpaceSwitcher } from "../_components/SpaceSwitcher";
import { StubShell } from "../_components/StubShell";
import { EditeurSidebar } from "./_components/EditeurSidebar";
import { EditeurSprite } from "./_components/EditeurSprite";
import { blockClients } from "@/lib/auth/guards";

export default async function EditeurLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await blockClients();
  return (
    <div className="maquette-edit">
      <EditeurSprite />
      <SpaceSwitcher active="editeur" />
      <div className="app">
        <EditeurSidebar />
        <main className="main">{children}</main>
      </div>
      <StubShell />
    </div>
  );
}
