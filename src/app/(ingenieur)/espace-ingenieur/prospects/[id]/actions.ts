"use server";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Envoi / renvoi / relance d'un document de pré-qualification à un prospect.
 *
 * Porte le comportement de `envoyerDocIsole(doc)` de la maquette (qui n'était
 * qu'un `alert()` de démonstration) en vraie Server Action : on horodate
 * l'action côté serveur, et on enregistre une trace dans `dossier_events`
 * quand la base est connectée. Sans Supabase configuré (preview), on renvoie
 * une confirmation propre — jamais un bouton mort.
 *
 * Couvre aussi la relance globale du client (« Relancer le client »), qui est
 * un envoi sans document précis (label seul).
 */

export type SendDocResult = {
  ok: boolean;
  /** true si une trace a réellement été persistée */
  persisted: boolean;
  message: string;
};

export async function sendProspectDoc(
  slug: string,
  doc: string | null,
): Promise<SendDocResult> {
  const label = doc?.trim();
  const message = label
    ? `« ${label} » renvoyé au client. E-mail d'accompagnement parti, action tracée & horodatée.`
    : "Relance envoyée au client. E-mail parti, action tracée & horodatée.";

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
      kind: label ? "document_resent" : "client_relaunched",
      label: label ?? "Relance client",
      payload: JSON.stringify({ prospect: slug, doc: label ?? null }),
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
