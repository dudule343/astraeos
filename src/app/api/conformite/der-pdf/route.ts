import { NextResponse, type NextRequest } from "next/server";

import { getSessionContext } from "@/lib/auth/context";
import { buildDerPdf, buildLettreMissionPdf, type ConformitePdfInput } from "@/lib/conformite-pdf";
import { DER_PDF_INPUT } from "../../../(ingenieur)/_data/fiche-conformite";

/**
 * POST /api/conformite/der-pdf
 * Body : { kind?: "der" | "lettre_mission", personnes?, lieu?, date? }
 *
 * Génère RÉELLEMENT le PDF du DER (ou de la lettre de mission) via pdf-lib
 * (lib/conformite-pdf.ts) à partir des vraies données du dossier de référence,
 * enrichies des 3 champs éditables de la modale (mode personne/personnes, lieu
 * et date de signature). Renvoie un flux application/pdf en pièce jointe : le
 * navigateur déclenche un vrai téléchargement, contrairement à un data: URI que
 * Chrome bloque en navigation de premier niveau.
 */
export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // Corps absent ou invalide : on retombe sur les valeurs par défaut du dossier.
  }

  const kind = body.kind === "lettre_mission" ? "lettre_mission" : "der";
  const personnes = typeof body.personnes === "string" ? body.personnes.trim() : "";
  const lieu = typeof body.lieu === "string" ? body.lieu.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";

  // Les 3 champs éditables enrichissent la ligne de périmètre rendue dans le PDF
  // (signature : « des Clients / du Client », fait à <lieu> le <date> »).
  const signatureLine = [
    personnes ? `Signature ${personnes}` : null,
    lieu || date ? `fait à ${lieu || "—"}${date ? `, le ${date}` : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const input: ConformitePdfInput = {
    ...DER_PDF_INPUT,
    perimetre: signatureLine
      ? `${DER_PDF_INPUT.perimetre ?? ""}${DER_PDF_INPUT.perimetre ? " — " : ""}${signatureLine}`.trim()
      : DER_PDF_INPUT.perimetre,
  };

  const bytes =
    kind === "lettre_mission" ? await buildLettreMissionPdf(input) : await buildDerPdf(input);

  const filename =
    kind === "lettre_mission"
      ? `Lettre-de-mission-${input.dossierId}.pdf`
      : `DER-${input.dossierId}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
