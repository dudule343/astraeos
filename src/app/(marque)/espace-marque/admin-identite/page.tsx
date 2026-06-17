import { PlaceholderPage } from "../../_components/PlaceholderPage";

export const metadata = {
  title: "ASTRAEOS · Espace Marque · Identité de la marque",
};

export default function AdminIdentitePage() {
  return (
    <PlaceholderPage
      current="Identité de la marque"
      eyebrow="Administration · Paramétrages tête de réseau"
      title="Identité de la marque"
      description="Configuration de l&apos;identité de la marque au niveau du tenant : raison sociale, logo, coordonnées et informations légales de la tête de réseau."
    />
  );
}
