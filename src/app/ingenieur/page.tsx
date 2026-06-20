import { redirect } from "next/navigation";

// L'ancien wireframe ingénieur (maquette figée, boutons morts) est remplacé par
// le vrai Espace Ingénieur : on redirige vers son accueil (habillage ingénieur).
export default function IngenieurRedirect() {
  redirect("/espace-ingenieur");
}
