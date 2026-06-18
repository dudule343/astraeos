import { NextResponse, type NextRequest, after } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { analyserDepot } from "@/lib/ia-analyse";
import { clientIp, rateLimit, rateLimitKey } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo
const BUCKET = "depots";

// L'analyse IA tourne via `after()` après la réponse : on laisse la fonction
// vivre assez longtemps pour ne pas être coupée en plein appel modèle (sinon
// le dépôt reste bloqué en 'en_cours').
export const maxDuration = 60;

// Liste blanche cohérente avec l'attribut accept côté client.
const TYPES_AUTORISES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);
const EXTENSIONS_AUTORISEES = new Set(["pdf", "jpg", "jpeg", "png", "heic", "heif"]);

/** Assainit un nom de fichier pour un chemin de stockage. */
function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents combinés
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "fichier";
}

// Next 16 : params est une Promise.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token || token.length > 40) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  // Rate-limit (endpoint PUBLIC, anti-DoS) : 10/min par token+IP.
  const ip = clientIp(req);
  if (!rateLimit(rateLimitKey("collecte/depot", token, ip), 10, 60_000)) {
    return NextResponse.json(
      { error: "Trop de dépôts, réessayez dans un instant." },
      { status: 429 },
    );
  }

  const supabase = createAdminClient();

  const { data: collecte, error: collecteError } = await supabase
    .from("collectes")
    .select("id, structure")
    .eq("token", token)
    .maybeSingle();

  if (collecteError || !collecte) {
    return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête multipart attendue" }, { status: 400 });
  }

  // Validation de la CHAÎNE brute : Number("") et Number("  ") valent 0 → une
  // requête au item_index vide écraserait silencieusement le dépôt de l'item 0
  // (aggravé par l'upsert onConflict collecte_id,item_index). On exige des chiffres.
  const rawIndex = form.get("item_index");
  if (typeof rawIndex !== "string" || !/^\d+$/.test(rawIndex.trim())) {
    return NextResponse.json({ error: "item_index invalide" }, { status: 400 });
  }
  const itemIndex = Number(rawIndex.trim());

  const structure = Array.isArray(collecte.structure) ? collecte.structure : [];
  if (itemIndex >= structure.length) {
    return NextResponse.json({ error: "item_index hors structure" }, { status: 400 });
  }

  const label = String(form.get("label") ?? "").trim();
  if (!label) {
    return NextResponse.json({ error: "label requis" }, { status: 400 });
  }

  const fileEntry = form.get("file");
  const reponseEntry = form.get("reponse");
  const hasFile = fileEntry instanceof File && fileEntry.size > 0;
  const reponse =
    typeof reponseEntry === "string" && reponseEntry.trim() ? reponseEntry.trim() : null;

  if (!hasFile && !reponse) {
    return NextResponse.json(
      { error: "Un fichier ou une réponse texte est requis" },
      { status: 400 },
    );
  }

  // Champs du dépôt (valeurs par défaut pour le cas Question)
  let fileName: string | null = null;
  let fileSize: number | null = null;
  let mime: string | null = null;
  let storagePath: string | null = null;

  if (hasFile) {
    const file = fileEntry as File;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (15 Mo maximum)" },
        { status: 400 },
      );
    }

    const safeName = sanitizeFileName(file.name);
    const ext = safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : "";
    const declaredType = (file.type || "").toLowerCase();
    // On accepte si le type MIME déclaré est dans la liste blanche
    // OU si l'extension assainie est autorisée (certains navigateurs n'envoient
    // pas de type fiable pour HEIC). Sinon rejet 400.
    const typeOk = declaredType !== "" && TYPES_AUTORISES.has(declaredType);
    const extOk = EXTENSIONS_AUTORISEES.has(ext);
    if (!typeOk && !extOk) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé (PDF, JPG, PNG ou HEIC uniquement)" },
        { status: 400 },
      );
    }

    fileName = file.name;
    fileSize = file.size;
    mime = file.type || "application/octet-stream";
    storagePath = `${collecte.id}/${itemIndex}-${safeName}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, { contentType: mime, upsert: true });

    if (uploadError) {
      return NextResponse.json(
        { error: `Échec de l'upload : ${uploadError.message}` },
        { status: 500 },
      );
    }
  }

  // Upsert du dépôt (un seul par item).
  const { error: upsertError } = await supabase
    .from("collecte_depots")
    .upsert(
      {
        collecte_id: collecte.id,
        item_index: itemIndex,
        label,
        file_name: fileName,
        file_size: fileSize,
        mime,
        storage_path: storagePath,
        reponse,
      },
      { onConflict: "collecte_id,item_index" },
    );

  if (upsertError) {
    return NextResponse.json(
      { error: `Enregistrement impossible : ${upsertError.message}` },
      { status: 500 },
    );
  }

  // Analyse IA en post-réponse, uniquement pour un dépôt de FICHIER.
  // `after` (Next 16, exporté par next/server) laisse répondre le client sans
  // attendre l'analyse. Si la clé IA n'est pas branchée, analyserDepot ne fait rien.
  //
  // Garde-fou coût IA : on borne le NOMBRE d'analyses déclenchées par token+IP
  // (plus serré que le débit de dépôt). Au-delà, le dépôt reste enregistré mais
  // l'analyse IA est sautée — le flux client n'est pas cassé.
  const analyseAutorisee =
    !hasFile ||
    rateLimit(rateLimitKey("collecte/depot:ia", token, ip), 20, 60_000);

  if (hasFile && analyseAutorisee) {
    after(
      analyserDepot({ collecteId: collecte.id, itemIndex }).catch(() => {
        /* silencieux : l'analyse ne doit jamais impacter le dépôt client */
      }),
    );
  }

  const { count } = await supabase
    .from("collecte_depots")
    .select("id", { count: "exact", head: true })
    .eq("collecte_id", collecte.id);

  return NextResponse.json({
    ok: true,
    progress: { done: count ?? 0, total: structure.length },
  });
}
