"use server";

import { DER_PDF_INPUT } from "../../../_data/fiche-conformite";
import { buildDerPdf } from "@/lib/conformite-pdf";

/**
 * Génère RÉELLEMENT le PDF du DER (pdf-lib via lib/conformite-pdf.ts) à partir
 * des vraies données du dossier de référence, et renvoie un data: URI prêt à
 * être ouvert / téléchargé côté client. Pas de stub : le document est produit.
 */
export async function genererDerPdf(): Promise<string> {
  const bytes = await buildDerPdf(DER_PDF_INPUT);
  const base64 = Buffer.from(bytes).toString("base64");
  return `data:application/pdf;base64,${base64}`;
}
