import { SpaceSwitcher } from "../_components/SpaceSwitcher";
import { blockClients } from "@/lib/auth/guards";

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
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <SpaceSwitcher active="ingenieur" />
      {children}
    </div>
  );
}
