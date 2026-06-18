"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Rôles qu'un cabinet peut attribuer à un collaborateur (pas brand_owner).
const ASSIGNABLE_ROLES = new Set(["engineer", "compliance", "editor", "cabinet_director"]);

export type AddCollaboratorResult =
  | { ok: true; email: string; tempPassword: string }
  | { ok: false; error: string };

/** Génère un mot de passe temporaire lisible (≥ 6 car., politique Supabase). */
function tempPassword(): string {
  const part = Math.random().toString(36).slice(2, 8);
  return `Astra-${part}`;
}

/**
 * Crée un collaborateur : utilisateur Supabase Auth (confirmé, mot de passe
 * temporaire) + profil public.users scopé au tenant/cabinet courant. Renvoie le
 * mot de passe temporaire à transmettre au collaborateur.
 */
export async function addCollaborator(formData: FormData): Promise<AddCollaboratorResult> {
  const ctx = await getSessionContext();
  if (!ctx) return { ok: false, error: "Authentification requise." };

  const firstName = String(formData.get("first_name") ?? "").trim().slice(0, 80);
  const lastName = String(formData.get("last_name") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "engineer");

  if (!firstName || !lastName) return { ok: false, error: "Prénom et nom requis." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Adresse e-mail invalide." };
  if (!ASSIGNABLE_ROLES.has(role)) return { ok: false, error: "Rôle invalide." };

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
      const msg = data.msg ?? `Création impossible (HTTP ${resp.status}).`;
      return { ok: false, error: msg.includes("already") ? "Cet e-mail a déjà un compte." : msg };
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
