// Wrappers fetch typés du cockpit (chargement DCI + persistance entretien).
import { validateDciCanonical } from "@/lib/dci-schema";

import type { DciSnapshot } from "./types";

/**
 * Crée (ou reprend, upsert par salle) l'entretien serveur. Renvoie son id et,
 * s'il existe, le dci_snapshot de session (édité par l'ingénieur) — prioritaire
 * sur le DCI client brut. Null si la création échoue.
 */
export async function openEntretien(
  room: string,
  prospect: string,
  nom: string,
): Promise<{ id: string; snapshot: DciSnapshot | null } | null> {
  try {
    const res = await fetch("/api/entretiens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room,
        prospect_slug: prospect || undefined,
        display_name: nom || undefined,
      }),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { id?: string; dci_snapshot?: unknown };
    if (!j?.id) return null;
    const check = validateDciCanonical(j.dci_snapshot);
    return { id: j.id, snapshot: check.ok ? (check.value as DciSnapshot) : null };
  } catch {
    return null;
  }
}

/**
 * Persiste le DCI édité par l'ingénieur dans entretiens.dci_snapshot
 * (PATCH atomique côté serveur). true si sauvegardé.
 */
export async function saveDciSnapshot(
  entretienId: string,
  snapshot: DciSnapshot,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/entretiens/${encodeURIComponent(entretienId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dci_snapshot: snapshot }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

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
