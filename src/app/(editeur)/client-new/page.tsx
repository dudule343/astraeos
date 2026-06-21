// Espace éditeur — page « Nouveau client » (route /client-new).
// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,
// <div id="page-client-new">, lignes 2811-3055. Données EN DUR = valeurs d'exemple
// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.
import { EditeurTopbar } from "../_components/EditeurTopbar";
import { ClientNewWizard } from "./ClientNewWizard";

export const metadata = {
  title: "ASTRAEOS · Nouveau client",
};

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Nouveau client" />
      <div className="content">
        <ClientNewWizard />
      </div>
    </>
  );
}
