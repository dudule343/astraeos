import { SpaceSwitcher } from "../_components/SpaceSwitcher";

export const metadata = {
  title: "ASTRAEOS · Espace Marque",
};

export default function MarquePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <SpaceSwitcher active="marque" />
      <iframe
        src="/wireframes/marque.html"
        title="Espace Marque"
        className="block w-full flex-1 border-0"
        style={{ height: "calc(100vh - 40px)" }}
      />
    </div>
  );
}
