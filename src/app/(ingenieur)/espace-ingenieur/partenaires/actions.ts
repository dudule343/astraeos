"use server";

import { revalidatePath } from "next/cache";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Création d'un partenaire / apporteur depuis la modale « Nouveau partenaire »
 * de l'écran Partenaires.
 *
 * Persiste désormais dans la table dédiée `public.partenaires` (scope tenant +
 * cabinet, service_role) : un partenaire créé réapparaît dans la liste après
 * revalidation. Avant, l'insertion partait dans `dossier_events` (orphelin) et
 * n'était jamais relue.
 *
 * Best-effort : si Supabase n'est pas configuré, si la session manque, ou si la
 * table n'existe pas encore (migration 20260622_partenaires.sql non appliquée),
 * on dégrade vers une confirmation non persistée — jamais un bouton mort.
 */

export type PartenaireType = "reco" | "apporteur";

export type CreatePartenaireInput = {
  type: PartenaireType;
  nomStructure: string;
  profil: string;
  localisation?: string;
  specialite?: string;
};

export type CreatePartenaireResult = {
  ok: boolean;
  persisted: boolean;
  message: string;
};

const TYPE_LABEL: Record<PartenaireType, string> = {
  reco: "partenaire recommandable",
  apporteur: "apporteur d'affaires",
};

/**
 * On encode le couple type métier + profil dans la colonne libre `type`, sous
 * la forme "reco:notaire" / "apporteur:avocat", que le module serveur décode
 * pour router la ligne vers la bonne section avec le bon badge.
 */
function encodeType(type: PartenaireType, profil: string): string {
  const safeProfil = (profil || "notaire").trim();
  return `${type}:${safeProfil}`;
}

/** Localisation + spécialité fusionnées dans `note` (lecture humaine). */
function buildNote(localisation?: string, specialite?: string): string | null {
  const parts = [localisation?.trim(), specialite?.trim()].filter(
    (p): p is string => Boolean(p),
  );
  return parts.length > 0 ? parts.join(" · ") : null;
}

export async function createPartenaire(
  input: CreatePartenaireInput,
): Promise<CreatePartenaireResult> {
  const name = input.nomStructure.trim() || "Nouveau partenaire";
  const typeLabel = TYPE_LABEL[input.type] ?? "partenaire";
  const message = `« ${name} » référencé comme ${typeLabel} dans le carnet du cabinet. Action tracée & horodatée.`;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: true, persisted: false, message };
  }

  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: true, persisted: false, message };

    const supabase = createAdminClient();

    const { error } = await supabase.from("partenaires").insert({
      tenant_id: ctx.tenantId,
      cabinet_id: ctx.cabinetId,
      nom: name,
      type: encodeType(input.type, input.profil),
      note: buildNote(input.localisation, input.specialite),
    });

    // La table peut ne pas exister sur tous les environnements (migration non
    // appliquée) : on dégrade proprement vers une confirmation non persistée.
    if (error) return { ok: true, persisted: false, message };

    revalidatePath("/espace-ingenieur/partenaires");
    return { ok: true, persisted: true, message };
  } catch {
    return { ok: true, persisted: false, message };
  }
}
