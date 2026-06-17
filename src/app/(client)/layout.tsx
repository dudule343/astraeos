import { StubShell } from "../_components/StubShell";
import { Topbar } from "./_components/Topbar";
import { getClientIdentity } from "./_data/client-identity";

export const metadata = {
  title: "ASTRAEOS · Espace Client",
};

export default async function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Identité scopée au client connecté (état vide honnête si non résolu).
  const { fullName, initials } = await getClientIdentity();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <Topbar clientName={fullName} initials={initials} />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-8">{children}</main>
      <StubShell />
    </div>
  );
}
