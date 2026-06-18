import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getClientContext } from "../../../../../_data/client";

const BUCKET = "depots";

// =========================================================================
// Téléchargement d'une étude restituée — AUTH-GATÉ role='client'.
//
// GET /espace-client/suivi/etude/[etudeId]/[kind]
//   kind ∈ { complete | summary | interactive }.
//
// Le scope est RE-RÉSOLU à chaque appel via getClientContext() : on part
// TOUJOURS du dossier du client connecté, jamais d'un identifiant fourni.
// L'etudeId d'URL n'est qu'un filtre supplémentaire : il DOIT appartenir au
// dossier résolu ET l'étude doit être délivrée. Sinon 404.
//
// Pour chaque kind on lit la colonne correspondante :
//   - chemin Storage (bucket privé `depots`)   → URL signée (1 h) + redirect
//   - URL http(s) externe validée               → redirect direct
//   - vide / inconnu                             → 404
// =========================================================================

// kind d'URL → colonne de la table `etudes`.
const KIND_COLUMNS = {
  complete: "complete_pdf_url",
  summary: "summary_pdf_url",
  interactive: "interactive_web_url",
} as const;

type Kind = keyof typeof KIND_COLUMNS;

function isKind(value: string): value is Kind {
  return value === "complete" || value === "summary" || value === "interactive";
}

/** Détecte une URL http(s) absolue valide (sinon on traite comme chemin Storage). */
function asHttpUrl(value: string): string | null {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

// Next 16 : params est une Promise.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ etudeId: string; kind: string }> },
) {
  const { etudeId, kind } = await params;

  if (!isKind(kind)) {
    return NextResponse.json({ error: "Type de document invalide" }, { status: 404 });
  }

  // Re-scope : on ne fait JAMAIS confiance à etudeId seul, tout part du dossier
  // du client connecté.
  const client = await getClientContext();
  if (!client) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const column = KIND_COLUMNS[kind];

    const { data: etude, error } = await supabase
      .from("etudes")
      .select(`id, status, delivered_at, dossier_id, ${column}`)
      .eq("id", etudeId)
      .eq("dossier_id", client.dossierId) // garde de scope : étude du dossier du client
      .maybeSingle();

    // Introuvable, hors-scope, ou non délivrée → 404 (on n'expose rien avant remise).
    if (error || !etude) {
      return NextResponse.json({ error: "Étude introuvable" }, { status: 404 });
    }

    const delivered =
      (etude.status as string) === "delivered" && Boolean(etude.delivered_at);
    if (!delivered) {
      return NextResponse.json({ error: "Étude indisponible" }, { status: 404 });
    }

    const raw = (etude as Record<string, unknown>)[column];
    const value = typeof raw === "string" ? raw.trim() : "";
    if (!value) {
      return NextResponse.json({ error: "Document indisponible" }, { status: 404 });
    }

    // URL externe validée → redirect direct (version interactive hébergée ailleurs).
    const external = asHttpUrl(value);
    if (external) {
      return NextResponse.redirect(external);
    }

    // Sinon : chemin dans le bucket privé `depots` → URL signée 1 h + redirect.
    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(value, 3600);

    if (signError || !signed?.signedUrl) {
      return NextResponse.json({ error: "Document indisponible" }, { status: 404 });
    }

    return NextResponse.redirect(signed.signedUrl);
  } catch (err) {
    console.error("[suivi/etude/[etudeId]/[kind]] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
