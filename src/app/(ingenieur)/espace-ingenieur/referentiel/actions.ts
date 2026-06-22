"use server";

import { buildDerPdf, buildLettreMissionPdf, type ConformitePdfInput } from "@/lib/conformite-pdf";

import {
  buildFondEcranPdf,
  buildRefModelePdf,
  modeleFilename,
  type RefModeleType,
} from "./modeles-pdf";

/**
 * Identifiant d'une ressource téléchargeable du référentiel. Tout bouton de
 * l'écran « Process & méthodologie » pointe sur l'un de ces identifiants et
 * produit un vrai fichier (PDF ou SVG) — jamais un stub.
 *
 * - der / lettre_mission : builders réglementaires partagés (lib/conformite-pdf).
 * - manuel … charte_graphique : modèles PDF co-localisés (modeles-pdf.ts).
 * - fond_ecran : visuel de présentation PDF paysage.
 * - logo_principal / logo_or_blanc : logotype SVG vectoriel.
 */
export type RefAssetType =
  | "der"
  | "lettre_mission"
  | RefModeleType
  | "fond_ecran"
  | "logo_principal"
  | "logo_or_blanc";

type AssetResult =
  | { ok: true; filename: string; mime: string; base64: string }
  | { ok: false; reason: string };

/**
 * Entrée « modèle » neutre pour les builders réglementaires : aucune donnée
 * client réelle, identité ASTRAEOS générique. C'est le gabarit vierge remis à un
 * licencié, conforme à la bibliothèque du référentiel.
 */
function modelInput(): ConformitePdfInput {
  return {
    dossierId: "MODELE00",
    clientName: null,
    conjointName: null,
    honoraires: null,
    perimetre: null,
    cabinet: {
      name: "Cabinet ASTRAEOS",
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

/** Logotype ASTRAEOS vectoriel (or sur navy / or sur blanc), fichier SVG réel. */
function logoSvg(variant: "principal" | "or_blanc"): string {
  const bg = variant === "principal" ? "#0B1834" : "#FFFFFF";
  const sub = variant === "principal" ? "#C9A24B" : "#7A6A4A";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="180" viewBox="0 0 480 180">
  <rect width="480" height="180" fill="${bg}"/>
  <text x="240" y="100" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="64" font-weight="600" fill="#B48E51" letter-spacing="4">ASTRAEOS</text>
  <text x="240" y="132" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="6" fill="${sub}">INGENIERIE PATRIMONIALE</text>
</svg>
`;
}

const PDF_MIME = "application/pdf";

/**
 * Génère la ressource demandée et la renvoie encodée en base64 pour
 * téléchargement / aperçu côté client. Source unique pour tous les boutons du
 * référentiel.
 */
export async function getRefAssetBase64(type: RefAssetType): Promise<AssetResult> {
  try {
    if (type === "der" || type === "lettre_mission") {
      const input = modelInput();
      const pdf = type === "der" ? await buildDerPdf(input) : await buildLettreMissionPdf(input);
      const filename =
        type === "der"
          ? "modele-document-entree-en-relation.pdf"
          : "modele-lettre-de-mission.pdf";
      return { ok: true, filename, mime: PDF_MIME, base64: Buffer.from(pdf).toString("base64") };
    }

    if (type === "logo_principal" || type === "logo_or_blanc") {
      const svg = logoSvg(type === "logo_principal" ? "principal" : "or_blanc");
      const filename =
        type === "logo_principal" ? "logo-priveos-principal.svg" : "logo-priveos-or-sur-blanc.svg";
      return {
        ok: true,
        filename,
        mime: "image/svg+xml",
        base64: Buffer.from(svg, "utf8").toString("base64"),
      };
    }

    if (type === "fond_ecran") {
      const pdf = await buildFondEcranPdf();
      return {
        ok: true,
        filename: "fond-ecran-presentation-priveos.pdf",
        mime: PDF_MIME,
        base64: Buffer.from(pdf).toString("base64"),
      };
    }

    // Tous les autres types sont des modèles PDF co-localisés.
    const pdf = await buildRefModelePdf(type);
    return {
      ok: true,
      filename: modeleFilename(type),
      mime: PDF_MIME,
      base64: Buffer.from(pdf).toString("base64"),
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Génération de la ressource impossible",
    };
  }
}
