import { Sidebar } from "./_components/Sidebar";

export default function EditeurLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-[var(--ivory)]">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
