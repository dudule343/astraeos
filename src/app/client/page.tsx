import { SpaceSwitcher } from "../_components/SpaceSwitcher";

export const metadata = {
  title: "ASTRAEOS · Espace Client",
};

export default function ClientPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <SpaceSwitcher active="client" />
      <iframe
        src="/wireframes/client.html"
        title="Espace Client"
        className="block w-full flex-1 border-0"
        style={{ height: "calc(100vh - 40px)" }}
      />
    </div>
  );
}
