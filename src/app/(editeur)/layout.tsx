import { SpaceSwitcher } from "../_components/SpaceSwitcher";
import { StubShell } from "../_components/StubShell";
import { Sidebar } from "./_components/Sidebar";
import { blockClients } from "@/lib/auth/guards";

export default async function EditeurLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await blockClients();
  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SpaceSwitcher active="editeur" />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <StubShell />
    </div>
  );
}
