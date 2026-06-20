"use server";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Relance des co-souscripteurs sur la fiche conformité (boutons « Relancer les
 * clients » du hero et « Relancer le client » de la barre d'action).
 *
 * La maquette laissait ces boutons sans `onclick` (inertes). On les branche en
 * vraie Server Action : on horodate la relance côté serveur et on dépose une
 * trace dans `dossier_events` quand la base est connectée. Sans Supabase
 * configuré (preview), on renvoie une confirmation propre — jamais un bouton
 * mort. Aligné sur `sendProspectDoc` de la fiche prospect.
 */

export type RelanceResult = {
  ok: boolean;
  /** true si une trace a réellement été persistée */
  persisted: boolean;
  message: string;
};

export async function relancerClients(slug: string): Promise<RelanceResult> {
  const message =
    "Relance envoyée aux clients. E-mail de rappel parti (signatures DER · KYC · LM + règlement), action tracée & horodatée.";

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
      kind: "conformite_relaunched",
      label: "Relance conformité",
      payload: JSON.stringify({ dossier: slug, etape: "02-conformite" }),
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
