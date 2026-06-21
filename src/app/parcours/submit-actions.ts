"use server";

// Soumission systématique des écrans /parcours (DCI simplifié, qualification, DCI
// complet) vers `dci_submissions`. Même scope cabinet que le booking (via le
// contexte legacy) → les soumissions apparaissent dans l'espace /prospects de
// l'ingénieur. Public (prospect non connecté) : pas de session requise.

import { getSessionContext } from "@/lib/auth/context";
import { saveSubmission, type DciKind } from "@/lib/dci-store";

export type SubmitDciInput = {
  kind: DciKind;
  /** identifiant logique du prospect (slug), porté par le lien e-mail ?prospect= */
  prospectSlug: string;
  /** nom affichable côté ingénieur */
  displayName: string;
  /** données soumises (libres) */
  payload?: Record<string, unknown>;
};

export async function submitDci(
  input: SubmitDciInput,
): Promise<{ ok: boolean }> {
  const prospect_slug = (input.prospectSlug || "prospect-demo").slice(0, 64);
  try {
    const ctx = await getSessionContext();
    await saveSubmission({
      prospect_slug,
      kind: input.kind,
      payload: { ...(input.payload ?? {}), completed: true, source: "parcours" },
      display_name: input.displayName || prospect_slug,
      submitted_at: new Date().toISOString(),
      tenant_id: ctx?.tenantId ?? null,
      cabinet_id: ctx?.cabinetId ?? null,
    });
    return { ok: true };
  } catch {
    // best-effort : un échec de persistance ne bloque pas l'écran de remerciement.
    return { ok: false };
  }
}
