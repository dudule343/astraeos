"use server";

// Dépôt réel des pièces justificatives par le prospect depuis /parcours/documents.
// Upload best-effort dans le bucket privé "depots", préfixe "prospects/<slug>/".
// Public (prospect non connecté) : pas de session requise, écriture via service_role.
// Les fichiers sont relus côté ingénieur par loadProspectDocuments().

import { createAdminClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = "depots";
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo (aligné sur le flux collecte client)
const MAX_FILES = 20;

const MIME_AUTORISES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);
const EXT_AUTORISEES = new Set(["pdf", "jpg", "jpeg", "png", "heic", "heif"]);

/** Assainit un slug prospect pour un préfixe de stockage sûr. */
function sanitizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Assainit un nom de fichier pour un chemin de stockage (idem flux collecte). */
function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "fichier";
}

export async function uploadProspectDocument(
  prospectSlug: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const slug = sanitizeSlug(prospectSlug);
    if (!slug) return { ok: false, error: "Lien invalide : prospect manquant." };

    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      return { ok: false, error: "Sélectionnez au moins un fichier à déposer." };
    }
    if (files.length > MAX_FILES) {
      return { ok: false, error: `Trop de fichiers (${MAX_FILES} maximum).` };
    }

    const supabase = createAdminClient();
    let uploaded = 0;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return {
          ok: false,
          error: `« ${file.name} » dépasse 15 Mo.`,
        };
      }

      const safeName = sanitizeFileName(file.name);
      const ext = safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : "";
      const declaredType = (file.type || "").toLowerCase();
      const typeOk = declaredType !== "" && MIME_AUTORISES.has(declaredType);
      const extOk = EXT_AUTORISEES.has(ext);
      if (!typeOk && !extOk) {
        return {
          ok: false,
          error: `« ${file.name} » : type non autorisé (PDF, JPG, PNG ou HEIC uniquement).`,
        };
      }

      const mime = file.type || "application/octet-stream";
      const path = `prospects/${slug}/${safeName}`;
      const bytes = new Uint8Array(await file.arrayBuffer());

      const { error: uploadErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, bytes, { contentType: mime, upsert: true });

      if (uploadErr) {
        return { ok: false, error: `Échec du dépôt de « ${file.name} ».` };
      }
      uploaded += 1;
    }

    if (uploaded === 0) {
      return { ok: false, error: "Aucun fichier n'a pu être déposé." };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Une erreur est survenue pendant le dépôt." };
  }
}
