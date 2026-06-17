import { SpaceSwitcher } from "../_components/SpaceSwitcher";
import { StubShell } from "../_components/StubShell";
import { Sidebar } from "./_components/Sidebar";

export const metadata = {
  title: "ASTRAEOS · Espace Marque",
};

export default function MarqueLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SpaceSwitcher active="marque" />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <StubShell />
    </div>
  );
}
