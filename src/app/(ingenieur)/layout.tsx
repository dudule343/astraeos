import { SpaceSwitcher } from "../_components/SpaceSwitcher";
import { StubShell } from "../_components/StubShell";
import { Sidebar } from "./_components/Sidebar";
import { getSidebarIdentity } from "./_data/sidebar-identity-server";
import { blockClients } from "@/lib/auth/guards";
import "./_styles/maquette.css";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur",
};

export default async function IngenieurLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Accessible à tout le staff (l'ingénieur, mais aussi le dirigeant/éditeur en
  // mode legacy où le rôle de session est "cabinet_director") ; seuls les clients
  // sont renvoyés vers leur portail.
  await blockClients();
  const identity = await getSidebarIdentity();
  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SpaceSwitcher active="ingenieur" />
      <div className="flex">
        <Sidebar identity={identity} />
        <main className="min-w-0 flex-1">
          <div className="maquette-ing">{children}</div>
        </main>
      </div>
      <StubShell />
    </div>
  );
}
