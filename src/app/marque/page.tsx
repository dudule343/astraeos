import { redirect } from "next/navigation";

// L'ancien wireframe statique est remplacé par le vrai espace marque (route
// group (marque)/espace-marque). On redirige pour ne plus jamais servir la maquette.
export default function MarqueRedirect() {
  redirect("/espace-marque");
}
