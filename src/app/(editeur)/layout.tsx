import { SpaceSwitcher } from "../_components/SpaceSwitcher";
import { Sidebar } from "./_components/Sidebar";

export default function EditeurLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <SpaceSwitcher active="editeur" />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
