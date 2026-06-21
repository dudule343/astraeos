// Lecture best-effort des pièces déposées par un prospect via /parcours/documents.
// Source : Supabase Storage, bucket privé "depots", préfixe "prospects/<slug>/".
// Renvoie des URLs signées (~1h) pour affichage dans la fiche prospect côté ingénieur.
// Server-only — utilise createAdminClient (service_role).

import { createAdminClient } from "@/lib/supabase/admin";

const STORAGE_BUCKET = "depots";
const SIGNED_URL_TTL = 60 * 60; // 1 heure

export type ProspectUploadedDoc = {
  name: string;
  url: string;
  sizeLabel?: string;
  uploadedAt?: string;
};

/** Formate une taille en octets en libellé lisible (Ko / Mo). */
function formatSize(bytes: number | null | undefined): string | undefined {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) return undefined;
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Normalise un slug prospect pour construire un chemin de stockage sûr. */
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

/**
 * Liste les documents déposés par un prospect et renvoie pour chacun une URL
 * signée prête à l'affichage. Best-effort : renvoie [] si le bucket est vide,
 * le slug invalide, ou en cas d'erreur Supabase (jamais throw).
 */
export async function loadProspectDocuments(
  prospectSlug: string,
): Promise<ProspectUploadedDoc[]> {
  const slug = sanitizeSlug(prospectSlug);
  if (!slug) return [];

  try {
    const supabase = createAdminClient();
    const prefix = `prospects/${slug}`;

    const { data: entries, error: listErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(prefix, { limit: 200, sortBy: { column: "name", order: "asc" } });

    if (listErr || !entries) return [];

    // On ne garde que les fichiers réels (les dossiers n'ont pas de metadata/id).
    const files = entries.filter((e) => e.id !== null && e.name);
    if (files.length === 0) return [];

    const docs = await Promise.all(
      files.map(async (file): Promise<ProspectUploadedDoc | null> => {
        const path = `${prefix}/${file.name}`;
        const { data: signed } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(path, SIGNED_URL_TTL);
        if (!signed?.signedUrl) return null;

        const meta = file.metadata as { size?: number } | null;
        return {
          name: file.name,
          url: signed.signedUrl,
          sizeLabel: formatSize(meta?.size),
          uploadedAt: file.created_at ?? undefined,
        };
      }),
    );

    return docs.filter((d): d is ProspectUploadedDoc => d !== null);
  } catch {
    return [];
  }
}
