import { redirect } from "next/navigation";

// L'ancien wireframe ingénieur (maquette figée, boutons morts) est remplacé par
// le vrai workspace : on redirige vers le tableau de bord personnel réel.
export default function IngenieurRedirect() {
  redirect("/mon-activite");
}
