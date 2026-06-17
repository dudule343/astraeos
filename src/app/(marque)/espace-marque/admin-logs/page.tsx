import { PlaceholderPage } from "../../_components/PlaceholderPage";

export const metadata = {
  title: "ASTRAEOS · Espace Marque · Logs application",
};

export default function AdminLogsPage() {
  return (
    <PlaceholderPage
      current="Logs application"
      eyebrow="Administration · Gestion réseau"
      title="Logs application"
      description="Journal d&apos;activité applicatif à l&apos;échelle du réseau : connexions, actions et événements des cabinets du tenant, pour le suivi et l&apos;audit par la tête de réseau."
    />
  );
}
