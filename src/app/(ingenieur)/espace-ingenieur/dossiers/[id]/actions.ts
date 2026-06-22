"use server";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

import { getFicheDossier } from "../../../_data/fiche-dossier";

export type EtudePdfResult =
  | { ok: true; filename: string; base64: string }
  | { ok: false; reason: string };

const MARGIN = 56;
const PAGE_W = 595.28; // A4 portrait (points)
const PAGE_H = 841.89;
const NAVY = rgb(0.043, 0.094, 0.204);
const GOLD = rgb(0.706, 0.557, 0.318);
const GREY = rgb(0.36, 0.4, 0.46);
const BLACK = rgb(0.1, 0.12, 0.16);

type Cursor = { page: PDFPage; y: number };
type Fonts = { regular: PDFFont; bold: PDFFont };

/**
 * En-tête réglementaire : on lit le vrai cabinet courant (nom + ORIAS) avec
 * repli neutre si la session ou la table manquent.
 */
async function cabinetHeader(): Promise<{ name: string; orias: string | null }> {
  const fallback = { name: "Cabinet ASTRAEOS", orias: null as string | null };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return fallback;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return fallback;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("cabinets")
      .select("name, orias_number")
      .eq("id", ctx.cabinetId)
      .maybeSingle();
    const c = (data ?? {}) as Record<string, unknown>;
    return {
      name: c.name != null ? String(c.name) : fallback.name,
      orias: c.orias_number != null ? String(c.orias_number) : null,
    };
  } catch {
    return fallback;
  }
}

/** pdf-lib (WinAnsi) ne sait pas encoder certains caractères typographiques. */
function sanitize(text: string): string {
  return text
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[…]/g, "...")
    .replace(/[   ]/g, " ")
    .replace(/[•·]/g, "-")
    .replace(/[€]/g, "EUR")
    .replace(/[✓✔]/g, "");
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

/**
 * Génère le PDF RÉEL de l'étude patrimoniale du dossier (couverture + sommaire
 * + 4 parties), à partir des vraies données de la fiche dossier (parcours
 * étape 5). pdf-lib, sans dépendance supplémentaire. Renvoie un base64 prêt à
 * être téléchargé côté navigateur.
 */
export async function generateEtudePdf(dossierId: string): Promise<EtudePdfResult> {
  try {
    const dossier = await getFicheDossier(dossierId);
    const cabinet = await cabinetHeader();
    const clientName = `${dossier.heroNameLead}${dossier.heroNameStrong}`.trim();

    const etape5 = dossier.parcours.find((e) => e.rich);
    const parties = etape5?.rich?.parties ?? [];
    const livraison = etape5?.rich?.livraison;

    const doc = await PDFDocument.create();
    doc.setTitle(`Etude patrimoniale - ${dossier.id}`);
    doc.setProducer("Astraeos");
    doc.setCreator(cabinet.name);

    const fonts: Fonts = {
      regular: await doc.embedFont(StandardFonts.Helvetica),
      bold: await doc.embedFont(StandardFonts.HelveticaBold),
    };

    // ── Couverture ───────────────────────────────────────────────────────
    const cover = doc.addPage([PAGE_W, PAGE_H]);
    cover.drawRectangle({ x: 0, y: PAGE_H - 220, width: PAGE_W, height: 220, color: NAVY });
    cover.drawText(sanitize(cabinet.name), {
      x: MARGIN,
      y: PAGE_H - 60,
      size: 15,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });
    if (cabinet.orias) {
      cover.drawText(sanitize(`ORIAS n° ${cabinet.orias}`), {
        x: MARGIN,
        y: PAGE_H - 82,
        size: 9,
        font: fonts.regular,
        color: GOLD,
      });
    }
    cover.drawText("ETUDE PATRIMONIALE", {
      x: MARGIN,
      y: PAGE_H - 150,
      size: 26,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });
    cover.drawText(sanitize(`Reference ${dossier.id}`), {
      x: MARGIN,
      y: PAGE_H - 178,
      size: 11,
      font: fonts.regular,
      color: rgb(0.78, 0.82, 0.88),
    });

    cover.drawText("Etablie pour", {
      x: MARGIN,
      y: PAGE_H - 300,
      size: 10,
      font: fonts.bold,
      color: GOLD,
    });
    cover.drawText(sanitize(clientName), {
      x: MARGIN,
      y: PAGE_H - 326,
      size: 20,
      font: fonts.bold,
      color: NAVY,
    });
    for (const [i, line] of wrapLines(
      dossier.heroSub,
      fonts.regular,
      10.5,
      PAGE_W - MARGIN * 2,
    ).entries()) {
      cover.drawText(line, {
        x: MARGIN,
        y: PAGE_H - 356 - i * 16,
        size: 10.5,
        font: fonts.regular,
        color: GREY,
      });
    }

    if (livraison) {
      cover.drawText(sanitize(livraison.eyebrow), {
        x: MARGIN,
        y: MARGIN + 40,
        size: 10,
        font: fonts.bold,
        color: GOLD,
      });
      cover.drawText(sanitize(livraison.meta), {
        x: MARGIN,
        y: MARGIN + 22,
        size: 9.5,
        font: fonts.regular,
        color: GREY,
      });
    }

    // ── Contenu ──────────────────────────────────────────────────────────
    const cur = addPage(doc);
    const P = (t: string, o?: Parameters<typeof writeParagraph>[4]) =>
      writeParagraph(doc, cur, fonts, t, o);

    P("Sommaire", { bold: true, size: 16, color: NAVY, gap: 10 });
    parties.forEach((part, i) => P(`${i + 1}. ${part.lead}`, { size: 11, gap: 4 }));
    cur.y -= 10;

    parties.forEach((part) => {
      P(part.lead, { bold: true, size: 13, color: NAVY, gap: 8 });
      P(part.rest.replace(/^[\s:·-]+/, "").trim(), { gap: 14 });
    });

    P("Conditions de remise", { bold: true, size: 12, color: NAVY, gap: 8 });
    P(
      "Le present document constitue la synthese de l'etude patrimoniale conduite par le cabinet. Il est strictement confidentiel et destine au seul client. Les preconisations qu'il contient sont personnalisees et ne sauraient etre transposees sans une nouvelle analyse.",
    );

    const bytes = await doc.save();
    const safeClient = sanitize(clientName).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return {
      ok: true,
      filename: `Etude-patrimoniale-${safeClient || dossier.id}.pdf`,
      base64: Buffer.from(bytes).toString("base64"),
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Generation de l'etude impossible",
    };
  }
}
