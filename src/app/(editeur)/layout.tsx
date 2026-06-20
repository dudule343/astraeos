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
