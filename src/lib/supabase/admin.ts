import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase server-side avec la clé service_role.
 * Bypasse les policies RLS — à utiliser UNIQUEMENT côté serveur (server actions, route handlers).
 * Pour l'instant utilisé par le wizard de création de client tant que l'auth n'est pas branchée.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant");
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// IDs du seed (cf. db/seed/0001_minimal_seed.sql)
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000010"; // PRIVEOS Capital
export const DEFAULT_CABINET_ID = "00000000-0000-0000-0000-000000000100"; // Cabinet Paris Étoile
export const DEFAULT_ENGINEER_ID = "00000000-0000-0000-0000-000000001000"; // Sarah KAUFMANN
