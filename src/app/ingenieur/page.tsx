import { SpaceSwitcher } from "../_components/SpaceSwitcher";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur",
};

export default function IngenieurPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <SpaceSwitcher active="ingenieur" />
      <iframe
        src="/wireframes/ingenieur.html"
        title="Espace Ingénieur"
        className="block w-full flex-1 border-0"
        style={{ height: "calc(100vh - 40px)" }}
      />
    </div>
  );
}
