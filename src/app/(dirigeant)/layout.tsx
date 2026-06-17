import { SpaceSwitcher } from "../_components/SpaceSwitcher";
import { StubShell } from "../_components/StubShell";
import { Sidebar } from "./_components/Sidebar";
import { requireRole } from "@/lib/auth/guards";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant",
};

export default async function DirigeantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole(["cabinet_director", "brand_owner", "editor", "compliance"]);
  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SpaceSwitcher active="dirigeant" />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <StubShell />
    </div>
  );
}
