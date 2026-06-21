"use client";

// Helper client : récupère l'identité prospect portée par le lien e-mail
// (?prospect=<slug>&name=<nom>) et déclenche la persistance via le server action.
// Appelé par le bouton d'envoi final de chaque écran /parcours.

import type { DciKind } from "@/lib/dci-store";
import { submitDci } from "./submit-actions";

const DEFAULT_NAME = "Bertrand DUPONT-TOPIN";

export function persistParcours(kind: DciKind, payload?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const prospectSlug = params.get("prospect") || "prospect-demo";
  const displayName = params.get("name") || DEFAULT_NAME;
  void submitDci({ kind, prospectSlug, displayName, payload });
}
