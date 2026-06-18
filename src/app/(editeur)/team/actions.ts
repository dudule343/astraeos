"use server";

import { randomBytes } from "crypto";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Rôles autorisés à CRÉER un collaborateur (action privilégiée).
const CREATOR_ROLES = new Set(["cabinet_director", "brand_owner"]);
// Ce que chaque créateur peut attribuer (pas d'escalade : un directeur ne crée
// pas un directeur/propriétaire). Le propriétaire réseau peut nommer un directeur.
const ASSIGNABLE_BY: Record<string, Set<string>> = {
  cabinet_director: new Set(["engineer", "compliance", "editor"]),
  brand_owner: new Set(["engineer", "compliance", "editor", "cabinet_director"]),
};

export type AddCollaboratorResult =
  | { ok: true; email: string; tempPassword: string }
  | { ok: false; error: string };

/** Mot de passe temporaire fort (entropie crypto). */
function tempPassword(): string {
  return `Astra-${randomBytes(9).toString("base64url")}`;
}

/**
 * Crée un collaborateur : utilisateur Supabase Auth (confirmé, mot de passe
 * temporaire) + profil public.users scopé au tenant/cabinet courant. Renvoie le
 * mot de passe temporaire à transmettre au collaborateur.
 */
export async function addCollaborator(formData: FormData): Promise<AddCollaboratorResult> {
  // Action privilégiée : on exige une VRAIE session admin (authUserId non-null),
  // jamais le contexte legacy (sinon création de compte sans authentification).
  const ctx = await getSessionContext();
  if (!ctx || !ctx.authUserId || !CREATOR_ROLES.has(ctx.role)) {
    return { ok: false, error: "Accès refusé." };
  }
  // Rate-limit par cabinet (création de compte = sensible).
  if (!rateLimit(rateLimitKey("team/add", ctx.cabinetId, "server"), 10, 60_000)) {
    return { ok: false, error: "Trop de créations, réessayez dans un instant." };
  }

  const firstName = String(formData.get("first_name") ?? "").trim().slice(0, 80);
  const lastName = String(formData.get("last_name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "engineer");

  if (!firstName || !lastName) return { ok: false, error: "Prénom et nom requis." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Adresse e-mail invalide." };
  // Anti-escalade : on ne peut attribuer qu'un rôle permis par SON rôle.
  if (!(ASSIGNABLE_BY[ctx.role]?.has(role) ?? false)) {
    return { ok: false, error: "Rôle non autorisé pour votre profil." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, error: "Service indisponible." };
  }

  const pwd = tempPassword();

  // 1. Création de l'utilisateur Auth (API admin).
  let authUserId: string;
  try {
    const resp = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, password: pwd, email_confirm: true }),
    });
    const data = (await resp.json().catch(() => ({}))) as { id?: string; msg?: string };
    if (!resp.ok || !data.id) {
      // Message générique (anti-énumération de comptes) ; détail loggé serveur.
      console.error("[team/add] création auth échouée:", resp.status, data.msg);
      return { ok: false, error: "Création impossible. Vérifiez l'adresse et réessayez." };
    }
    authUserId = data.id;
  } catch {
    return { ok: false, error: "Impossible de joindre le service d'authentification." };
  }

  // 2. Profil public.users scopé tenant/cabinet.
  const supabase = createAdminClient();
  const { error } = await supabase.from("users").insert({
    auth_user_id: authUserId,
    tenant_id: ctx.tenantId,
    cabinet_id: ctx.cabinetId,
    role,
    first_name: firstName,
    last_name: lastName,
    email,
    is_active: true,
  });
  if (error) {
    return { ok: false, error: "Compte créé mais profil non enregistré : " + error.message };
  }

  revalidatePath("/team");
  return { ok: true, email, tempPassword: pwd };
}
