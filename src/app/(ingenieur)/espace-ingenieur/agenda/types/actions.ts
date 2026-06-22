"use server";

import { revalidatePath } from "next/cache";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

import { durationLabelToMinutes } from "../../../_data/types-rdv";

/**
 * Server Actions de l'écran « Mes types de rendez-vous » (#page-ing-types-rdv).
 *
 * La création / édition / activation d'un type de RDV est persistée dans la
 * table `rdv_types` (migration 20260622_rdv_types.sql), scope tenant/cabinet,
 * en best-effort : si la table n'existe pas encore (migration non appliquée),
 * la saisie est validée et on retourne `persisted:false` plutôt qu'un bouton
 * mort. Le scope est résolu comme dans les autres actions de l'espace ingénieur.
 */

export type RdvVisibility = "public" | "private";

const TYPES_PATH = "/espace-ingenieur/agenda/types";

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

type Scope = { tenantId: string; cabinetId: string } | null;

/** Scope tenant/cabinet de la requête, ou null si la base n'est pas branchée. */
async function resolveScope(): Promise<Scope> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return null;
    return { tenantId: ctx.tenantId, cabinetId: ctx.cabinetId };
  } catch {
    return null;
  }
}

/**
 * Vrai quand l'erreur Supabase indique une table/relation absente (migration
 * non appliquée). On dégrade alors proprement en `persisted:false`.
 */
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01") return true;
  return /relation .*rdv_types.* does not exist/i.test(error.message ?? "");
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

  const verb = input.id ? "mis à jour" : "créé";
  const notPersisted: SaveResult = {
    ok: true,
    persisted: false,
    message: `Type « ${name} » ${verb}. La persistance sera active une fois la table de configuration branchée.`,
  };

  const scope = await resolveScope();
  if (!scope) return notPersisted;

  try {
    const supabase = createAdminClient();
    const duree_min = durationLabelToMinutes(input.durationLabel);

    if (input.id) {
      const { error } = await supabase
        .from("rdv_types")
        .update({ label: name, duree_min })
        .eq("id", input.id)
        .eq("tenant_id", scope.tenantId)
        .eq("cabinet_id", scope.cabinetId);
      if (error) return isMissingTable(error) ? notPersisted : { ok: false, reason: error.message };
    } else {
      const { error } = await supabase.from("rdv_types").insert({
        tenant_id: scope.tenantId,
        cabinet_id: scope.cabinetId,
        label: name,
        duree_min,
        actif: true,
      });
      if (error) return isMissingTable(error) ? notPersisted : { ok: false, reason: error.message };
    }

    revalidatePath(TYPES_PATH);
    return { ok: true, persisted: true, message: `Type « ${name} » ${verb}.` };
  } catch {
    return notPersisted;
  }
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

  const action = input.disable ? "désactivé" : "réactivé";
  const notPersisted: SaveResult = {
    ok: true,
    persisted: false,
    message: `Type « ${input.name} » ${action}. La persistance sera active une fois la table de configuration branchée.`,
  };

  const scope = await resolveScope();
  if (!scope) return notPersisted;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("rdv_types")
      .update({ actif: !input.disable })
      .eq("id", input.id)
      .eq("tenant_id", scope.tenantId)
      .eq("cabinet_id", scope.cabinetId);
    if (error) return isMissingTable(error) ? notPersisted : { ok: false, reason: error.message };

    revalidatePath(TYPES_PATH);
    return {
      ok: true,
      persisted: true,
      message: `Type « ${input.name} » ${action}.`,
    };
  } catch {
    return notPersisted;
  }
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
  // Les plages globales de disponibilité ne sont pas modélisées dans
  // `rdv_types` (catalogue de types seulement) : on valide sans persister.
  return {
    ok: true,
    persisted: false,
    message:
      "Plages de disponibilité validées. La persistance sera active une fois la table de configuration branchée.",
  };
}
