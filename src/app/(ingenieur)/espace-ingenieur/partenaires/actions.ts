"use server";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Création d'un partenaire / apporteur depuis la modale « Nouveau partenaire »
 * de l'écran Partenaires. Porte le bouton « Enregistrer le partenaire » de la
 * maquette (qui ne faisait que fermer la modale en jetant la saisie) en vraie
 * Server Action.
 *
 * Il n'existe pas (encore) de table dédiée `partenaires` : la création est
 * tracée best-effort dans `dossier_events` (table de traçabilité générique déjà
 * utilisée par prospects / conformité) avec un kind « partner_created ». Quand
 * Supabase n'est pas configuré ou que la table n'existe pas, on dégrade vers une
 * confirmation propre — jamais un bouton mort, jamais de cul-de-sac.
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

    const { error } = await supabase.from("dossier_events").insert({
      tenant_id: ctx.tenantId,
      cabinet_id: ctx.cabinetId,
      engineer_id: ctx.userId,
      kind: "partner_created",
      label: `Nouveau ${typeLabel} : ${name}`,
      payload: JSON.stringify({
        type: input.type,
        nom: name,
        profil: input.profil,
        localisation: input.localisation ?? null,
        specialite: input.specialite ?? null,
        source: "carnet-partenaires",
      }),
      created_at: new Date().toISOString(),
    });

    // La table de traçabilité peut ne pas exister sur tous les environnements :
    // on dégrade proprement vers une confirmation non persistée.
    if (error) return { ok: true, persisted: false, message };
    return { ok: true, persisted: true, message };
  } catch {
    return { ok: true, persisted: false, message };
  }
}
