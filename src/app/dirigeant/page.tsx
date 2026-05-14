import { SpaceSwitcher } from "../_components/SpaceSwitcher";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant",
};

export default function DirigeantPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <SpaceSwitcher active="dirigeant" />
      <iframe
        src="/wireframes/dirigeant.html"
        title="Espace Dirigeant"
        className="block w-full flex-1 border-0"
        style={{ height: "calc(100vh - 40px)" }}
      />
    </div>
  );
}
