import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CABINET_ID,
  DEFAULT_ENGINEER_ID,
  DEFAULT_TENANT_ID,
} from "@/lib/supabase/admin";

/**
 * Contexte d'identité du requêteur, résolu à partir de la session Supabase
 * (ou du seed en mode legacy, tant que le mur d'auth n'est pas activé).
 */
export type SessionContext = {
  /** id de la ligne public.users (clé métier) */
  userId: string;
  /** id de auth.users (Supabase Auth) — null en mode legacy */
  authUserId: string | null;
  tenantId: string;
  cabinetId: string;
  role: string;
};

/** Active le vrai gating d'auth uniquement quand le flag vaut exactement "1". */
function authEnforced(): boolean {
  return process.env.ASTRAEOS_AUTH_ENFORCE === "1";
}

/**
 * Contexte du seed (état actuel de la prod). Renvoyé tant que le flag
 * ASTRAEOS_AUTH_ENFORCE n'est pas à "1" — comportement inchangé.
 */
const LEGACY_CONTEXT: SessionContext = {
  userId: DEFAULT_ENGINEER_ID,
  authUserId: null,
  tenantId: DEFAULT_TENANT_ID,
  cabinetId: DEFAULT_CABINET_ID,
  // Valeur réelle de l'enum DB user_role (pas "director", qui n'existe pas).
  role: "cabinet_director",
};

/**
 * Utilisateur Supabase Auth de la requête courante, ou null.
 * Utilisé par le gate du proxy et par getSessionContext().
 */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    // Réseau / config invalide — on traite comme non connecté.
    return null;
  }
}

/**
 * Contexte d'identité du requêteur.
 *
 * - Flag OFF (défaut) : renvoie le contexte legacy du seed → prod inchangée.
 * - Flag ON : lit la session Supabase, retrouve la ligne public.users via
 *   auth_user_id, et renvoie le vrai contexte ; null si pas de session ou
 *   pas de ligne users correspondante.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  if (!authEnforced()) {
    return LEGACY_CONTEXT;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, tenant_id, cabinet_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !profile || !profile.cabinet_id) {
    return null;
  }

  return {
    userId: profile.id,
    authUserId: user.id,
    tenantId: profile.tenant_id,
    cabinetId: profile.cabinet_id,
    role: profile.role,
  };
}
