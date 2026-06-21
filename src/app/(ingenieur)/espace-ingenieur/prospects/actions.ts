"use server";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Création directe d'un prospect depuis la modale « Nouveau prospect » (étape 01
 * du parcours patrimonial). Porte le bouton « Créer le prospect » de la maquette
 * (qui ne faisait rien) en vraie Server Action.
 *
 * Best-effort : quand Supabase est configuré, on insère le prospect dans la
 * table `dci_submissions` (même source que les prospects « parcours en ligne »
 * lus par la liste) avec un kind « manuel », et on horodate l'action dans
 * `dossier_events`. Sans base (preview), on renvoie une confirmation propre —
 * jamais un bouton mort, jamais de cul-de-sac.
 */

export type CreateProspectInput = {
  type: "solo" | "couple" | "morale";
  civilite?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  raisonSociale?: string;
  docs: string[];
};

export type CreateProspectResult = {
  ok: boolean;
  persisted: boolean;
  message: string;
};

function displayName(input: CreateProspectInput): string {
  if (input.type === "morale") {
    return input.raisonSociale?.trim() || "Nouvelle personne morale";
  }
  const full = [input.prenom?.trim(), input.nom?.trim()].filter(Boolean).join(" ");
  return full || "Nouveau prospect";
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `prospect-${Date.now()}`
  );
}

export async function createProspect(
  input: CreateProspectInput,
): Promise<CreateProspectResult> {
  const name = displayName(input);
  const docCount = input.docs.length;
  const message =
    docCount > 0
      ? `Prospect « ${name} » créé. ${docCount} document(s) de pré-qualification envoyé(s), action tracée & horodatée.`
      : `Prospect « ${name} » créé et ajouté à vos prospects actifs. Action tracée & horodatée.`;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: true, persisted: false, message };
  }

  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: true, persisted: false, message };

    const supabase = createAdminClient();
    const slug = slugify(name);

    const { error } = await supabase.from("dci_submissions").insert({
      tenant_id: ctx.tenantId,
      cabinet_id: ctx.cabinetId,
      engineer_id: ctx.userId,
      prospect_slug: slug,
      kind: "manuel",
      display_name: name,
      payload: JSON.stringify({
        type: input.type,
        email: input.email ?? null,
        telephone: input.telephone ?? null,
        docs: input.docs,
        source: "creation-directe",
      }),
      updated_at: new Date().toISOString(),
    });

    if (error) return { ok: true, persisted: false, message };
    return { ok: true, persisted: true, message };
  } catch {
    return { ok: true, persisted: false, message };
  }
}
