"use server";

import { buildDerPdf, buildLettreMissionPdf, type ConformitePdfInput } from "@/lib/conformite-pdf";

/** Modèles de la bibliothèque qui ont une génération PDF réelle. */
export type ModeleType = "der" | "lettre_mission";

/**
 * Entrée « modèle » neutre : aucune donnée client réelle. Les champs nominatifs
 * sont laissés à null (les builders retombent sur « le client »), et le cabinet
 * porte l'identité PRIVEOS générique. Ce n'est donc PAS un faux dossier : c'est
 * le gabarit vierge tel qu'il serait remis à un licencié, conforme à la
 * bibliothèque de modèles du référentiel.
 */
function modelInput(): ConformitePdfInput {
  return {
    dossierId: "MODELE00",
    clientName: null,
    conjointName: null,
    honoraires: null,
    perimetre: null,
    cabinet: {
      name: "Cabinet PRIVEOS",
      addressStreet: null,
      addressZipcode: null,
      addressCity: null,
      phone: null,
      email: null,
      oriasNumber: null,
      rcProInsurer: null,
    },
  };
}

/**
 * Génère le PDF d'un modèle (DER ou Lettre de mission) à partir des vrais
 * builders réglementaires, avec des valeurs de gabarit neutres. Renvoie le
 * document en base64 pour téléchargement / aperçu côté client.
 */
export async function getModelePdfBase64(
  type: ModeleType,
): Promise<{ ok: true; filename: string; base64: string } | { ok: false; reason: string }> {
  try {
    const input = modelInput();
    const pdf =
      type === "der" ? await buildDerPdf(input) : await buildLettreMissionPdf(input);
    const filename =
      type === "der"
        ? "modele-document-entree-en-relation.pdf"
        : "modele-lettre-de-mission.pdf";
    return { ok: true, filename, base64: Buffer.from(pdf).toString("base64") };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Génération du modèle impossible",
    };
  }
}
