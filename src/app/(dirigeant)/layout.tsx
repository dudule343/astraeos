import "./_styles/maquette.css";
import { SpaceSwitcher } from "../_components/SpaceSwitcher";
import { StubShell } from "../_components/StubShell";
import { Sidebar } from "./_components/Sidebar";
import { DirigeantSprite } from "./_components/DirigeantSprite";
import { blockClients } from "@/lib/auth/guards";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant",
};

export default async function DirigeantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await blockClients();
  return (
    <div className="maquette-dir">
      <DirigeantSprite />
      <SpaceSwitcher active="dirigeant" />
      <div className="app">
        <Sidebar />
        <main className="main">{children}</main>
      </div>
      <StubShell />
    </div>
  );
}
