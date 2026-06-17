// Wrappers fetch typés du cockpit. On en ajoute au fil des phases (transcription,
// conseils, persistance). Pour l'instant : chargement du DCI client complet.
import { validateDciCanonical } from "@/lib/dci-schema";

import type { DciSnapshot } from "./types";

/**
 * Charge le DCI client canonique d'un prospect.
 * GET /api/dci/complet renvoie { source, kind, submission }, où
 * submission.payload = { sections:[...] }. On valide via le schéma canonique
 * partagé avant de l'injecter (jamais de snapshot corrompu dans le store).
 * Renvoie null si pas de prospect, pas de DCI, ou payload invalide.
 */
export async function loadDciComplet(prospect: string): Promise<DciSnapshot | null> {
  if (!prospect) return null;
  try {
    const res = await fetch(`/api/dci/complet?prospect=${encodeURIComponent(prospect)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const payload = (json as { submission?: { payload?: unknown } } | null)?.submission?.payload;
    const check = validateDciCanonical(payload);
    if (!check.ok) return null;
    return check.value as DciSnapshot;
  } catch {
    return null;
  }
}
