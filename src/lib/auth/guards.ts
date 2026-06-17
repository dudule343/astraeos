import { redirect } from "next/navigation";

import { getSessionContext } from "./context";

/**
 * Empêche un utilisateur de rôle `client` d'accéder aux espaces STAFF
 * (éditeur / dirigeant / marque) : il est renvoyé vers son portail client.
 * À appeler en tête des layouts de ces espaces.
 *
 * No-op pour les autres rôles. En mode legacy (flag d'auth OFF), getSessionContext
 * renvoie un contexte non-client → aucun effet.
 */
export async function blockClients(): Promise<void> {
  const ctx = await getSessionContext();
  if (ctx?.role === "client") {
    redirect("/espace-client");
  }
}
