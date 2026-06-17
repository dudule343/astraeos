import "server-only";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Identité du client connecté, résolue pour le chrome du portail.
 * Scope manuel : personnes.user_id = userId de la session → la personne,
 * puis son client_id. Jamais la donnée d'un autre client.
 *
 * Renvoie un état vide honnête (champs vides) si la session est absente,
 * si aucune personne n'est reliée, ou en cas d'erreur réseau/DB.
 */
export type ClientIdentity = {
  /** id public.clients du client connecté, ou null si non résolu. */
  clientId: string | null;
  fullName: string;
  initials: string;
};

const EMPTY: ClientIdentity = { clientId: null, fullName: "", initials: "" };

function buildInitials(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return `${a}${b}`.toUpperCase();
}

export async function getClientIdentity(): Promise<ClientIdentity> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;

    const admin = createAdminClient();

    const { data: personne, error } = await admin
      .from("personnes")
      .select("client_id, first_name, last_name")
      .eq("user_id", ctx.userId)
      .limit(1)
      .maybeSingle();

    if (error || !personne) return EMPTY;

    const first = (personne.first_name ?? "").trim();
    const last = (personne.last_name ?? "").trim();

    return {
      clientId: personne.client_id ?? null,
      fullName: `${first} ${last}`.trim(),
      initials: buildInitials(first, last),
    };
  } catch {
    return EMPTY;
  }
}
