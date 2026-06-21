// Espace ingénieur — Créer un espace client (route /espace-ingenieur/client-new).
//
// Bug corrigé (21/06) : cette page faisait `export { default } from
// "@/app/(editeur)/client-new/page"`. Elle ré-exportait donc la PAGE éditeur, dont
// le CSS (scopé `.maquette-edit`) est importé par le layout ÉDITEUR — jamais chargé
// dans le layout ingénieur (`.maquette-ing`). Résultat : rendu totalement brut
// (topbar « ASTRAEOS Admin » en texte, wizard sans styles).
//
// Correctif : on réutilise le VRAI wizard de l'éditeur (ClientNewWizard +
// createClientAction, insert Supabase réel), on charge explicitement le CSS éditeur,
// et on enveloppe le wizard dans `.maquette-edit` (CSS scopé, aucune fuite hors de
// ce bloc). On n'inclut PAS la topbar éditeur : le wizard s'affiche proprement dans
// l'espace ingénieur, sous sa propre sidebar.
import "@/app/(editeur)/_styles/maquette.css";
import { ClientNewWizard } from "@/app/(editeur)/client-new/ClientNewWizard";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Créer un espace client",
};

export default function Page() {
  return (
    <div className="maquette-edit">
      <div className="content">
        <ClientNewWizard />
      </div>
    </div>
  );
}
