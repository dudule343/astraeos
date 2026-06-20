/**
 * Génération RÉELLE des documents réglementaires en PDF (pdf-lib).
 *
 * Produit le DER (Document d'Entrée en Relation) et la Lettre de mission à
 * partir des vraies données dossier / client / cabinet. Texte FR professionnel,
 * en-tête cabinet, pagination minimale par retour à la ligne.
 *
 * Aucune dépendance externe hors pdf-lib (déjà installée). Les fonctions
 * renvoient un Uint8Array, prêt à être encodé en base64 (pièce jointe e-mail),
 * uploadé en Storage, ou renvoyé en téléchargement.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import type { ConformiteType } from "@/lib/conformite";

/** Données nécessaires à la génération d'une pièce réglementaire. */
export type ConformitePdfInput = {
  /** Dossier (les 8 premiers caractères de l'UUID servent de référence). */
  dossierId: string;
  /** Représentant principal du client (« Monsieur Dupont »), ou null. */
  clientName: string | null;
  /** Conjoint / co-souscripteur, ou null. */
  conjointName: string | null;
  /** Honoraires déjà formatés (« 3 900 € TTC »), ou null. */
  honoraires: string | null;
  /** Périmètre de conseil (ligne libre), facultatif. */
  perimetre?: string | null;
  cabinet: {
    name: string;
    addressStreet: string | null;
    addressZipcode: string | null;
    addressCity: string | null;
    phone: string | null;
    email: string | null;
    oriasNumber: string | null;
    rcProInsurer: string | null;
  };
};

const MARGIN = 56;
const PAGE_W = 595.28; // A4 portrait (points)
const PAGE_H = 841.89;
const NAVY = rgb(0.043, 0.094, 0.204); // ~#0B1834
const GOLD = rgb(0.706, 0.557, 0.318);
const GREY = rgb(0.36, 0.4, 0.46);
const BLACK = rgb(0.1, 0.12, 0.16);

/** Curseur d'écriture vertical partagé entre les helpers de mise en page. */
type Cursor = { page: PDFPage; y: number };

type Fonts = { regular: PDFFont; bold: PDFFont };

function fmtToday(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function dossierRef(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/**
 * pdf-lib (WinAnsi) ne sait pas encoder certains caractères typographiques
 * (apostrophe courbe, tirets longs, espaces fines…). On les replie sur leurs
 * équivalents ASCII pour éviter une exception à l'encodage.
 */
function sanitize(text: string): string {
  return text
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[…]/g, "...")
    .replace(/[   ]/g, " ")
    .replace(/[•]/g, "-");
}

/** Découpe un paragraphe en lignes qui tiennent dans la largeur utile. */
function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

/** Ajoute une page vierge et réinitialise le curseur sous l'en-tête. */
function addPage(doc: PDFDocument): Cursor {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  return { page, y: PAGE_H - MARGIN };
}

/** Écrit un paragraphe justifié à gauche, gère le saut de page automatique. */
function writeParagraph(
  doc: PDFDocument,
  cur: Cursor,
  fonts: Fonts,
  text: string,
  opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number } = {},
): void {
  const size = opts.size ?? 10.5;
  const font = opts.bold ? fonts.bold : fonts.regular;
  const color = opts.color ?? BLACK;
  const lineHeight = size * 1.45;
  const maxWidth = PAGE_W - MARGIN * 2;

  for (const line of wrapLines(text, font, size, maxWidth)) {
    if (cur.y < MARGIN + lineHeight) {
      const next = addPage(doc);
      cur.page = next.page;
      cur.y = next.y;
    }
    cur.page.drawText(line, { x: MARGIN, y: cur.y, size, font, color });
    cur.y -= lineHeight;
  }
  cur.y -= opts.gap ?? 6;
}

/** En-tête cabinet (bandeau navy + coordonnées) en haut de la première page. */
function drawHeader(cur: Cursor, fonts: Fonts, input: ConformitePdfInput, docTitle: string): void {
  const { page } = cur;
  const c = input.cabinet;

  page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: NAVY });
  page.drawText(sanitize(c.name || "Cabinet"), {
    x: MARGIN,
    y: PAGE_H - 46,
    size: 16,
    font: fonts.bold,
    color: rgb(1, 1, 1),
  });

  const addr = [c.addressStreet, [c.addressZipcode, c.addressCity].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const contact = [c.phone, c.email].filter(Boolean).join("  ·  ");
  const sub = [addr, contact].filter(Boolean).join("   |   ");
  if (sub) {
    page.drawText(sanitize(sub), {
      x: MARGIN,
      y: PAGE_H - 66,
      size: 8.5,
      font: fonts.regular,
      color: rgb(0.78, 0.82, 0.88),
    });
  }
  if (c.oriasNumber) {
    page.drawText(sanitize(`ORIAS n° ${c.oriasNumber}`), {
      x: MARGIN,
      y: PAGE_H - 82,
      size: 8.5,
      font: fonts.regular,
      color: GOLD,
    });
  }

  cur.y = PAGE_H - 130;
  page.drawText(sanitize(docTitle), { x: MARGIN, y: cur.y, size: 18, font: fonts.bold, color: NAVY });
  cur.y -= 20;
  page.drawText(sanitize(`Référence dossier ${dossierRef(input.dossierId)} · ${fmtToday()}`), {
    x: MARGIN,
    y: cur.y,
    size: 9,
    font: fonts.regular,
    color: GREY,
  });
  cur.y -= 8;
  page.drawLine({
    start: { x: MARGIN, y: cur.y },
    end: { x: PAGE_W - MARGIN, y: cur.y },
    thickness: 1.5,
    color: GOLD,
  });
  cur.y -= 22;
}

/** Bloc de signature en bas de la dernière page. */
function drawSignatureBlock(
  doc: PDFDocument,
  cur: Cursor,
  fonts: Fonts,
  input: ConformitePdfInput,
): void {
  if (cur.y < MARGIN + 130) {
    const next = addPage(doc);
    cur.page = next.page;
    cur.y = next.y;
  }
  cur.y -= 10;
  cur.page.drawLine({
    start: { x: MARGIN, y: cur.y },
    end: { x: PAGE_W - MARGIN, y: cur.y },
    thickness: 0.5,
    color: rgb(0.8, 0.82, 0.86),
  });
  cur.y -= 26;

  const colW = (PAGE_W - MARGIN * 2 - 30) / 2;
  const left = MARGIN;
  const right = MARGIN + colW + 30;
  const labelY = cur.y;

  cur.page.drawText("Le client", { x: left, y: labelY, size: 10, font: fonts.bold, color: NAVY });
  cur.page.drawText("Le cabinet", { x: right, y: labelY, size: 10, font: fonts.bold, color: NAVY });

  const who = [input.clientName, input.conjointName].filter(Boolean).join(" & ") || "Le client";
  cur.page.drawText(sanitize(who), {
    x: left,
    y: labelY - 16,
    size: 9,
    font: fonts.regular,
    color: GREY,
  });
  cur.page.drawText(sanitize(input.cabinet.name || "Le cabinet"), {
    x: right,
    y: labelY - 16,
    size: 9,
    font: fonts.regular,
    color: GREY,
  });

  cur.page.drawText("Date et signature précédées de la mention « Lu et approuvé »", {
    x: left,
    y: labelY - 40,
    size: 8,
    font: fonts.regular,
    color: GREY,
  });
}

async function initDoc(input: ConformitePdfInput, title: string): Promise<{
  doc: PDFDocument;
  cur: Cursor;
  fonts: Fonts;
}> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${title} - ${dossierRef(input.dossierId)}`);
  doc.setProducer("Astraeos");
  doc.setCreator(input.cabinet.name || "Astraeos");
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const cur = addPage(doc);
  drawHeader(cur, fonts, input, title);
  return { doc, cur, fonts };
}

/* ------------------------------------------------------------------------- *
 * DER — Document d'Entrée en Relation
 * ------------------------------------------------------------------------- */

export async function buildDerPdf(input: ConformitePdfInput): Promise<Uint8Array> {
  const { doc, cur, fonts } = await initDoc(input, "Document d'Entrée en Relation (DER)");
  const c = input.cabinet;
  const who = [input.clientName, input.conjointName].filter(Boolean).join(" & ") || "le client";

  const P = (t: string, o?: Parameters<typeof writeParagraph>[4]) =>
    writeParagraph(doc, cur, fonts, t, o);

  P(`À l'attention de ${who}`, { bold: true, size: 11 });
  P(
    "Le présent document vous est remis préalablement à la fourniture de tout conseil, conformément aux dispositions des articles L.541-1 et suivants du Code monétaire et financier applicables aux conseillers en investissements financiers.",
  );

  P("1. Identité et statut du cabinet", { bold: true, size: 12, color: NAVY, gap: 8 });
  P(
    `${c.name || "Le cabinet"} exerce l'activité de Conseiller en Investissements Financiers (CIF).${
      c.oriasNumber ? ` Il est immatriculé au registre unique des intermédiaires (ORIAS) sous le numéro ${c.oriasNumber}.` : ""
    }`,
  );
  const coord = [
    c.addressStreet,
    [c.addressZipcode, c.addressCity].filter(Boolean).join(" "),
    c.phone ? `Téléphone : ${c.phone}` : null,
    c.email ? `Courriel : ${c.email}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  if (coord) P(`Coordonnées : ${coord}.`);

  P("2. Autorité de contrôle et association professionnelle", {
    bold: true,
    size: 12,
    color: NAVY,
    gap: 8,
  });
  P(
    "Le cabinet est soumis au contrôle de l'Autorité des Marchés Financiers (AMF), 17 place de la Bourse, 75082 Paris Cedex 02. Il adhère à une association professionnelle agréée par l'AMF chargée du suivi de l'activité de ses membres.",
  );

  P("3. Assurance de responsabilité civile professionnelle", {
    bold: true,
    size: 12,
    color: NAVY,
    gap: 8,
  });
  P(
    `Le cabinet est couvert par une assurance de responsabilité civile professionnelle${
      c.rcProInsurer ? ` souscrite auprès de ${c.rcProInsurer}` : ""
    }, conforme aux exigences réglementaires en vigueur.`,
  );

  P("4. Nature des prestations et périmètre de conseil", {
    bold: true,
    size: 12,
    color: NAVY,
    gap: 8,
  });
  P(
    input.perimetre ||
      "Le cabinet fournit un conseil en investissements financiers de nature patrimoniale : audit de la situation du client, élaboration de préconisations adaptées à ses objectifs, et accompagnement dans la mise en œuvre des solutions retenues.",
  );

  P("5. Rémunération et honoraires", { bold: true, size: 12, color: NAVY, gap: 8 });
  P(
    input.honoraires
      ? `La mission de conseil donne lieu à des honoraires d'un montant de ${input.honoraires}, détaillés dans la lettre de mission qui vous est remise conjointement.`
      : "Les modalités de rémunération du cabinet sont détaillées dans la lettre de mission qui vous est remise conjointement.",
  );

  P("6. Traitement des réclamations et médiation", {
    bold: true,
    size: 12,
    color: NAVY,
    gap: 8,
  });
  P(
    "Toute réclamation peut être adressée par écrit au cabinet. En l'absence de réponse satisfaisante, le client peut saisir le médiateur de l'AMF, dont les coordonnées seront communiquées sur simple demande.",
  );

  drawSignatureBlock(doc, cur, fonts, input);
  return doc.save();
}

/* ------------------------------------------------------------------------- *
 * Lettre de mission
 * ------------------------------------------------------------------------- */

export async function buildLettreMissionPdf(input: ConformitePdfInput): Promise<Uint8Array> {
  const { doc, cur, fonts } = await initDoc(input, "Lettre de mission");
  const c = input.cabinet;
  const who = [input.clientName, input.conjointName].filter(Boolean).join(" & ") || "le client";

  const P = (t: string, o?: Parameters<typeof writeParagraph>[4]) =>
    writeParagraph(doc, cur, fonts, t, o);

  P(`Entre les soussignés,`, { bold: true, size: 11 });
  P(
    `${c.name || "Le cabinet"}, exerçant l'activité de Conseiller en Investissements Financiers, ci-après « le Cabinet »,`,
  );
  P(`et ${who}, ci-après « le Client »,`);
  P("il a été convenu et arrêté ce qui suit.", { gap: 10 });

  P("Article 1 — Objet de la mission", { bold: true, size: 12, color: NAVY, gap: 8 });
  P(
    input.perimetre ||
      "Le Cabinet réalise pour le Client une étude patrimoniale complète : analyse de sa situation civile, professionnelle, patrimoniale et fiscale, identification de ses objectifs, et formulation de préconisations écrites et personnalisées.",
  );

  P("Article 2 — Déroulement et livrables", { bold: true, size: 12, color: NAVY, gap: 8 });
  P(
    "La mission donne lieu à la remise d'une étude patrimoniale détaillée et d'une synthèse exécutive reprenant le plan d'action recommandé. Le délai de réalisation est de cinq semaines à compter de la signature des documents contractuels et du règlement intégral des honoraires.",
  );

  P("Article 3 — Honoraires", { bold: true, size: 12, color: NAVY, gap: 8 });
  P(
    input.honoraires
      ? `En contrepartie de la mission, le Client s'acquitte d'honoraires forfaitaires d'un montant de ${input.honoraires}. Ce montant est exigible avant l'ouverture de l'espace sécurisé et le lancement de l'étude.`
      : "Les honoraires de la mission sont précisés en annexe et exigibles avant le lancement de l'étude.",
  );

  P("Article 4 — Obligations des parties", { bold: true, size: 12, color: NAVY, gap: 8 });
  P(
    "Le Client s'engage à transmettre l'ensemble des documents et informations nécessaires à la bonne réalisation de la mission. Le Cabinet s'engage à un devoir de conseil, de loyauté et de confidentialité, dans le respect de la réglementation applicable aux CIF.",
  );

  P("Article 5 — Confidentialité et protection des données", {
    bold: true,
    size: 12,
    color: NAVY,
    gap: 8,
  });
  P(
    "Les données personnelles collectées sont traitées dans le strict cadre de la mission, conformément au Règlement Général sur la Protection des Données (RGPD). Le Client dispose d'un droit d'accès, de rectification et d'effacement de ses données.",
  );

  P("Article 6 — Durée et résiliation", { bold: true, size: 12, color: NAVY, gap: 8 });
  P(
    "La présente lettre de mission prend effet à sa signature par les deux parties et prend fin à la remise des livrables. Elle peut être résiliée par l'une ou l'autre des parties dans les conditions du droit commun.",
  );

  drawSignatureBlock(doc, cur, fonts, input);
  return doc.save();
}

/* ------------------------------------------------------------------------- *
 * Dispatch par type de pièce
 * ------------------------------------------------------------------------- */

/** Type → libellé de fichier (sans extension). */
export function pdfFileLabel(type: ConformiteType): string {
  switch (type) {
    case "der":
      return "DER";
    case "lettre_mission":
      return "Lettre-de-mission";
    case "kyc":
      return "KYC";
    case "mandat":
      return "Mandat-de-conseil";
    default:
      return "Document";
  }
}

/** Les types pour lesquels un PDF réel est généré. */
export const PDF_GENERATED_TYPES: ConformiteType[] = ["der", "lettre_mission"];

/**
 * Génère le PDF correspondant au type de pièce, ou null si le type n'a pas
 * (encore) de générateur dédié (KYC / mandat restent des enveloppes externes).
 */
export async function buildConformitePdf(
  type: ConformiteType,
  input: ConformitePdfInput,
): Promise<Uint8Array | null> {
  switch (type) {
    case "der":
      return buildDerPdf(input);
    case "lettre_mission":
      return buildLettreMissionPdf(input);
    default:
      return null;
  }
}
