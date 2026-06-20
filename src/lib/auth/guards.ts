import { redirect } from "next/navigation";

import { getSessionContext } from "./context";

/** Auth réellement appliquée seulement si le flag vaut "1" (sinon app ouverte). */
function authEnforced(): boolean {
  return process.env.ASTRAEOS_AUTH_ENFORCE === "1";
}

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

/**
 * Restreint l'accès d'un layout STAFF à une liste blanche de rôles.
 * - Pas de session → /login.
 * - Rôle hors liste → /espace-client pour un client (son portail), /login sinon.
 * À appeler en tête des layouts dont l'accès dépend du rôle exact.
 */
export async function requireRole(allowed: string[]): Promise<void> {
  // App ouverte tant que l'auth n'est pas appliquée : aucun gating de rôle.
  if (!authEnforced()) return;
  const ctx = await getSessionContext();
  if (!ctx || !allowed.includes(ctx.role)) {
    redirect(ctx?.role === "client" ? "/espace-client" : "/login");
  }
}
