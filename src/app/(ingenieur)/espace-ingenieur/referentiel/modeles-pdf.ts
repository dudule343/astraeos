import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

/**
 * Générateurs PDF RÉELS des ressources du référentiel qui n'ont pas (encore) de
 * builder réglementaire dédié dans lib/conformite-pdf.ts : manuel opératoire,
 * contrat-cadre / DIP, KYC, questionnaire de qualification, étude patrimoniale
 * anonymisée, dossier client anonymisé, charte graphique. Chaque document est un
 * gabarit vierge ASTRAEOS, conforme à la bibliothèque du référentiel : aucune
 * donnée client réelle, mais un vrai PDF téléchargeable (jamais un bouton mort).
 *
 * Co-localisé dans l'écran référentiel et autonome (pdf-lib uniquement) pour ne
 * pas toucher au module lib partagé.
 */

const MARGIN = 56;
const PAGE_W = 595.28; // A4 portrait (points)
const PAGE_H = 841.89;
const NAVY = rgb(0.043, 0.094, 0.204);
const GOLD = rgb(0.706, 0.557, 0.318);
const GREY = rgb(0.36, 0.4, 0.46);
const BLACK = rgb(0.1, 0.12, 0.16);

type Cursor = { page: PDFPage; y: number };
type Fonts = { regular: PDFFont; bold: PDFFont };

function fmtToday(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** pdf-lib (WinAnsi) n'encode pas certains caractères typographiques. */
function sanitize(text: string): string {
  return text
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[…]/g, "...")
    .replace(/[   ]/g, " ")
    .replace(/[•]/g, "-");
}

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

function addPage(doc: PDFDocument): Cursor {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  return { page, y: PAGE_H - MARGIN };
}

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

function drawHeader(cur: Cursor, fonts: Fonts, docTitle: string, subtitle: string): void {
  const { page } = cur;

  page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: NAVY });
  page.drawText("Cabinet ASTRAEOS", {
    x: MARGIN,
    y: PAGE_H - 46,
    size: 16,
    font: fonts.bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Modele de reference - reseau ASTRAEOS", {
    x: MARGIN,
    y: PAGE_H - 66,
    size: 8.5,
    font: fonts.regular,
    color: rgb(0.78, 0.82, 0.88),
  });
  page.drawText("Document type - a personnaliser par le cabinet licencie", {
    x: MARGIN,
    y: PAGE_H - 82,
    size: 8.5,
    font: fonts.regular,
    color: GOLD,
  });

  cur.y = PAGE_H - 130;
  page.drawText(sanitize(docTitle), { x: MARGIN, y: cur.y, size: 18, font: fonts.bold, color: NAVY });
  cur.y -= 20;
  page.drawText(sanitize(`${subtitle} · ${fmtToday()}`), {
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

async function initDoc(title: string, subtitle: string): Promise<{
  doc: PDFDocument;
  cur: Cursor;
  fonts: Fonts;
}> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${title} - Modele ASTRAEOS`);
  doc.setProducer("Astraeos");
  doc.setCreator("Cabinet ASTRAEOS");
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const cur = addPage(doc);
  drawHeader(cur, fonts, title, subtitle);
  return { doc, cur, fonts };
}

/** Spécification déclarative d'un document modèle : titre + sections + corps. */
type ModeleSpec = {
  title: string;
  subtitle: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  signature?: boolean;
};

function drawSignatureBlock(doc: PDFDocument, cur: Cursor, fonts: Fonts): void {
  if (cur.y < MARGIN + 120) {
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
  cur.page.drawText("Date et signature precedees de la mention « Lu et approuve »", {
    x: left,
    y: labelY - 36,
    size: 8,
    font: fonts.regular,
    color: GREY,
  });
}

async function buildFromSpec(spec: ModeleSpec): Promise<Uint8Array> {
  const { doc, cur, fonts } = await initDoc(spec.title, spec.subtitle);
  const P = (t: string, o?: Parameters<typeof writeParagraph>[4]) =>
    writeParagraph(doc, cur, fonts, t, o);

  P(spec.intro, { size: 11 });
  for (const section of spec.sections) {
    P(section.heading, { bold: true, size: 12, color: NAVY, gap: 8 });
    for (const para of section.body) P(para);
  }
  if (spec.signature) drawSignatureBlock(doc, cur, fonts);
  return doc.save();
}

/** Tous les modèles documentaires générables côté référentiel. */
export type RefModeleType =
  | "manuel"
  | "contrat_cadre"
  | "kyc"
  | "questionnaire"
  | "etude_patrimoniale"
  | "dossier_client"
  | "charte_graphique";

const SPECS: Record<RefModeleType, ModeleSpec> = {
  manuel: {
    title: "Manuel operatoire",
    subtitle: "Document maitre des process operationnels - 168 pages (extrait modele)",
    intro:
      "Le present manuel decrit l'ensemble des process operationnels du reseau ASTRAEOS, de l'entree en relation au suivi recurrent. Il sert de reference unique a chaque ingenieur patrimonial.",
    sections: [
      {
        heading: "Section 1 - Onboarding client (etapes 01 a 03)",
        body: [
          "Prise de contact, qualification du prospect et premier rendez-vous decouverte. Remise du document d'entree en relation (DER) et recueil des informations KYC.",
          "Ouverture de l'espace client securise, collecte des pieces justificatives et controle de conformite LCB-FT avant lancement de l'etude.",
        ],
      },
      {
        heading: "Section 2 - Etude patrimoniale (etape 04)",
        body: [
          "Analyse civile, professionnelle, patrimoniale et fiscale du client. Identification des objectifs et de l'horizon de placement, evaluation de la tolerance au risque.",
          "Elaboration des preconisations ecrites et personnalisees, chiffrage des scenarios et constitution du livrable d'etude.",
        ],
      },
      {
        heading: "Section 3 - Restitution & signature (etape 05)",
        body: [
          "Presentation de l'etude au client, recueil de son adequation, signature des actes et mise en oeuvre des solutions retenues.",
        ],
      },
      {
        heading: "Section 4 - Suivi recurrent (etape 06)",
        body: [
          "Points de suivi periodiques, mise a jour de la situation, reporting et actualisation des preconisations dans la duree.",
        ],
      },
    ],
  },
  contrat_cadre: {
    title: "Contrat-cadre licencies - licence de marque",
    subtitle: "Contrat unique de licence de marque + documents precontractuels (modele v3.1)",
    intro:
      "Le present contrat-cadre regit la licence de marque ASTRAEOS consentie au cabinet licencie. Il est accompagne des documents precontractuels obligatoires (DIP, etat general du marche).",
    sections: [
      {
        heading: "Article 1 - Objet de la licence",
        body: [
          "La tete de reseau concede au licencie le droit d'exploiter la marque ASTRAEOS et son referentiel methodologique, dans les conditions definies au present contrat.",
        ],
      },
      {
        heading: "Article 2 - Document d'Information Precontractuelle (DIP)",
        body: [
          "Le DIP est remis au licencie au moins vingt jours avant la signature, conformement a la loi Doubin. Il presente le reseau, son anciennete, ses comptes et l'etat general du marche.",
        ],
      },
      {
        heading: "Article 3 - Etat general du marche",
        body: [
          "Le marche du conseil patrimonial independant connait une croissance soutenue portee par la transmission des patrimoines et la recherche de conseil objectif.",
        ],
      },
      {
        heading: "Article 4 - Redevances et obligations",
        body: [
          "Le licencie s'acquitte d'une redevance de licence et respecte le referentiel methodologique, la charte graphique et les obligations de conformite du reseau.",
        ],
      },
    ],
    signature: true,
  },
  kyc: {
    title: "KYC - Know Your Customer",
    subtitle: "Formulaire LCB-FT - identification complete (modele vierge)",
    intro:
      "Le present formulaire permet l'identification du client et la verification de son identite au titre des obligations de lutte contre le blanchiment et le financement du terrorisme (LCB-FT).",
    sections: [
      {
        heading: "1 - Identite du client",
        body: [
          "Nom, prenoms, date et lieu de naissance, nationalite, adresse de residence fiscale. Piece d'identite en cours de validite a joindre.",
        ],
      },
      {
        heading: "2 - Situation professionnelle et patrimoniale",
        body: [
          "Profession, employeur, revenus annuels, composition et origine du patrimoine. Justificatifs de revenus et de domicile a joindre.",
        ],
      },
      {
        heading: "3 - Origine des fonds",
        body: [
          "Description de l'origine economique des fonds (epargne, cession, succession, revenus professionnels). Justificatifs correspondants a joindre.",
        ],
      },
      {
        heading: "4 - Personne politiquement exposee (PPE)",
        body: [
          "Le client declare s'il exerce ou a exerce une fonction publique importante, ou s'il est lie a une personne politiquement exposee.",
        ],
      },
    ],
    signature: true,
  },
  questionnaire: {
    title: "Questionnaire de qualification",
    subtitle: "Profil patrimonial - objectifs - horizon - tolerance au risque (modele vierge)",
    intro:
      "Ce questionnaire recueille les elements necessaires a l'evaluation du profil du client et a la formulation de preconisations adaptees a sa situation et a ses objectifs.",
    sections: [
      {
        heading: "1 - Objectifs patrimoniaux",
        body: [
          "Constitution d'un capital, preparation de la retraite, transmission, optimisation fiscale, generation de revenus complementaires : hierarchiser les priorites du client.",
        ],
      },
      {
        heading: "2 - Horizon de placement",
        body: ["Court terme (moins de 3 ans), moyen terme (3 a 8 ans) ou long terme (plus de 8 ans)."],
      },
      {
        heading: "3 - Tolerance au risque",
        body: [
          "Capacite et appetence du client a accepter une fluctuation de la valeur de ses placements, evaluees sur une echelle prudente a dynamique.",
        ],
      },
      {
        heading: "4 - Connaissance et experience",
        body: [
          "Niveau de connaissance des instruments financiers et experience d'investissement du client, afin d'adapter le conseil et les supports presentes.",
        ],
      },
    ],
  },
  etude_patrimoniale: {
    title: "Etude patrimoniale anonymisee",
    subtitle: "Modele d'etude type - structure - diagnostic - preconisations",
    intro:
      "La presente etude type illustre la structure d'un livrable patrimonial ASTRAEOS, a des fins de formation. Toutes les donnees sont anonymisees.",
    sections: [
      {
        heading: "1 - Synthese de la situation",
        body: [
          "Presentation de la situation civile, professionnelle, patrimoniale et fiscale du client, et rappel de ses objectifs prioritaires.",
        ],
      },
      {
        heading: "2 - Diagnostic",
        body: [
          "Analyse de la repartition du patrimoine (immobilier d'usage, immobilier locatif, financier, atypique), de la fiscalite et des risques identifies.",
        ],
      },
      {
        heading: "3 - Preconisations",
        body: [
          "Plan d'action chiffre et hierarchise : optimisation de la detention, diversification, prevoyance, transmission. Chaque preconisation est justifiee et son impact estime.",
        ],
      },
      {
        heading: "4 - Mise en oeuvre et suivi",
        body: [
          "Calendrier de deploiement des solutions retenues et modalites de suivi periodique de l'etude.",
        ],
      },
    ],
  },
  dossier_client: {
    title: "Dossier client anonymise",
    subtitle: "Dossier complet anonymise - exemple type pour la formation",
    intro:
      "Ce dossier anonymise reconstitue l'ensemble des pieces d'un dossier client complet, de l'entree en relation au suivi, comme support de formation.",
    sections: [
      {
        heading: "1 - Pieces d'entree en relation",
        body: ["DER signe, KYC complet, justificatifs d'identite et de domicile, questionnaire de qualification."],
      },
      {
        heading: "2 - Etude et restitution",
        body: ["Lettre de mission, etude patrimoniale, synthese executive, rapport d'adequation et actes signes."],
      },
      {
        heading: "3 - Suivi",
        body: ["Comptes-rendus de rendez-vous de suivi, mises a jour de situation et reporting periodique."],
      },
    ],
  },
  charte_graphique: {
    title: "Charte graphique ASTRAEOS",
    subtitle: "Identite visuelle du reseau - 24 pages (extrait modele)",
    intro:
      "La presente charte definit l'identite visuelle du reseau ASTRAEOS : logotype, couleurs, typographies et regles d'usage applicables a tous les cabinets licencies.",
    sections: [
      {
        heading: "1 - Logotype",
        body: [
          "Le logotype ASTRAEOS se decline en version principale (or sur navy), version doree sur blanc et version monochrome. Une zone de protection minimale est respectee autour du logo.",
        ],
      },
      {
        heading: "2 - Couleurs",
        body: [
          "Navy #0B1834, Or #B48E51, Ivoire #F7F3EC. Le navy structure les fonds, l'or souligne les elements premium, l'ivoire apporte la respiration.",
        ],
      },
      {
        heading: "3 - Typographies",
        body: [
          "Cormorant Garamond pour les titres serif premium, une sans-serif lisible pour les textes courants. Hierarchie typographique stricte sur tous les supports.",
        ],
      },
      {
        heading: "4 - Regles d'usage",
        body: [
          "Interdiction de deformer, recolorer ou ajouter un effet au logotype. Respect des contrastes et des espaces de protection sur tous les documents et ecrans.",
        ],
      },
    ],
  },
};

export function modeleFilename(type: RefModeleType): string {
  const map: Record<RefModeleType, string> = {
    manuel: "modele-manuel-operatoire.pdf",
    contrat_cadre: "modele-contrat-cadre-licence-marque.pdf",
    kyc: "modele-kyc.pdf",
    questionnaire: "modele-questionnaire-qualification.pdf",
    etude_patrimoniale: "modele-etude-patrimoniale-anonymisee.pdf",
    dossier_client: "modele-dossier-client-anonymise.pdf",
    charte_graphique: "charte-graphique-priveos.pdf",
  };
  return map[type];
}

export function buildRefModelePdf(type: RefModeleType): Promise<Uint8Array> {
  return buildFromSpec(SPECS[type]);
}

/** Fond d'écran de présentation ASTRAEOS (paysage navy + halo doré), PDF réel. */
export async function buildFondEcranPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Fond d'ecran de presentation - ASTRAEOS");
  doc.setProducer("Astraeos");
  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const W = 1280;
  const H = 720;
  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: NAVY });
  // Halo doré (cercles concentriques translucides simulés par opacité décroissante).
  for (let i = 6; i >= 1; i -= 1) {
    page.drawCircle({
      x: W - 120,
      y: H - 90,
      size: i * 60,
      color: GOLD,
      opacity: 0.04,
    });
  }
  page.drawText("ASTRAEOS", {
    x: 90,
    y: H / 2 + 10,
    size: 96,
    font: serif,
    color: rgb(0.88, 0.74, 0.45),
  });
  page.drawText("Ingenierie patrimoniale", {
    x: 94,
    y: H / 2 - 40,
    size: 26,
    font: sans,
    color: rgb(0.82, 0.86, 0.92),
  });
  return doc.save();
}
