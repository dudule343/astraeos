export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur",
};

// L'Espace Ingénieur = le cockpit complet (la maquette riche déjà câblée :
// tableau de bord, collectes, DCI, entretiens/visio, agenda, portefeuille…).
// Servi en iframe sous l'onglet "Espace Ingénieur" (SpaceSwitcher du layout).
export default function IngenieurCockpit() {
  return (
    <iframe
      src="/wireframes/ingenieur.html"
      title="Espace Ingénieur"
      className="block w-full flex-1 border-0"
      style={{ height: "calc(100vh - 40px)" }}
    />
  );
}
