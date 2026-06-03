import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo
const BUCKET = "depots";

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

  const rawIndex = form.get("item_index");
  const itemIndex = Number(rawIndex);
  if (rawIndex === null || !Number.isInteger(itemIndex) || itemIndex < 0) {
    return NextResponse.json({ error: "item_index invalide" }, { status: 400 });
  }

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

    fileName = file.name;
    fileSize = file.size;
    mime = file.type || "application/octet-stream";
    storagePath = `${collecte.id}/${itemIndex}-${sanitizeFileName(file.name)}`;

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

  const { count } = await supabase
    .from("collecte_depots")
    .select("id", { count: "exact", head: true })
    .eq("collecte_id", collecte.id);

  return NextResponse.json({
    ok: true,
    progress: { done: count ?? 0, total: structure.length },
  });
}
