"use server";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server Actions de l'écran « Mes types de rendez-vous » (#page-ing-types-rdv).
 *
 * La configuration des types de RDV (création, édition, activation,
 * disponibilités globales) n'a pas encore de table dédiée dans le schéma
 * (`rdv_types` n'existe pas). Comme la modale « Nouveau RDV » de l'agenda, on
 * valide réellement la saisie côté serveur et on retourne un résultat honnête :
 * `persisted:false` tant qu'aucune table n'est branchée, plutôt qu'un bouton
 * mort. Le scope tenant/cabinet/engineer est résolu comme dans les autres
 * actions de l'espace ingénieur.
 */

export type RdvVisibility = "public" | "private";

export type SaveRdvTypeInput = {
  /** id existant en cas d'édition, vide/absent en création. */
  id?: string;
  name: string;
  durationLabel: string;
  visibility: RdvVisibility;
  desc: string;
  delaiMini: string;
  tampon: string;
  message: string;
};

export type SaveResult =
  | { ok: true; persisted: boolean; message: string }
  | { ok: false; reason: string };

async function resolveScope(): Promise<{ persisted: boolean }> {
  // Pas de table de config des types de RDV : on ne persiste pas, mais on
  // garde la résolution de session pour rester cohérent avec le reste.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { persisted: false };
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { persisted: false };
    // Touche la base en lecture seule pour confirmer la connexion réelle.
    const supabase = createAdminClient();
    await supabase
      .from("dossiers")
      .select("id")
      .eq("tenant_id", ctx.tenantId)
      .limit(1);
    return { persisted: false };
  } catch {
    return { persisted: false };
  }
}

export async function saveRdvType(input: SaveRdvTypeInput): Promise<SaveResult> {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, reason: "Donnez un nom à ce type de rendez-vous." };
  }
  if (!input.durationLabel.trim()) {
    return { ok: false, reason: "Renseignez la durée du rendez-vous." };
  }
  if (!input.message.trim()) {
    return {
      ok: false,
      reason: "Le message d'accompagnement client ne peut pas être vide.",
    };
  }

  const { persisted } = await resolveScope();
  const verb = input.id ? "mis à jour" : "créé";
  return {
    ok: true,
    persisted,
    message: persisted
      ? `Type « ${name} » ${verb}.`
      : `Type « ${name} » ${verb}. La persistance sera active une fois la table de configuration branchée.`,
  };
}

export async function toggleRdvTypeActive(input: {
  id: string;
  name: string;
  /** état cible : true = on désactive, false = on réactive. */
  disable: boolean;
}): Promise<SaveResult> {
  if (!input.id) {
    return { ok: false, reason: "Type de rendez-vous introuvable." };
  }
  const { persisted } = await resolveScope();
  const action = input.disable ? "désactivé" : "réactivé";
  return {
    ok: true,
    persisted,
    message: persisted
      ? `Type « ${input.name} » ${action}.`
      : `Type « ${input.name} » ${action}. La persistance sera active une fois la table de configuration branchée.`,
  };
}

export type SavePlagesInput = {
  jours: string;
  heureDebut: string;
  heureFin: string;
  dejeunerDebut: string;
  dejeunerFin: string;
};

export async function saveDispoPlages(
  input: SavePlagesInput,
): Promise<SaveResult> {
  if (!input.heureDebut.trim() || !input.heureFin.trim()) {
    return { ok: false, reason: "Renseignez l'amplitude horaire (début et fin)." };
  }
  const { persisted } = await resolveScope();
  return {
    ok: true,
    persisted,
    message: persisted
      ? "Plages de disponibilité mises à jour."
      : "Plages de disponibilité validées. La persistance sera active une fois la table de configuration branchée.",
  };
}
