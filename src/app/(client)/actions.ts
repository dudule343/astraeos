"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import { CLIENT_BASE } from "./_components/nav";
import {
  DCI_CATEGORY_COLUMNS,
  DCI_CATEGORY_KEYS,
  type DciCategoryKey,
} from "./_data/client";

// =========================================================================
// Server actions du portail client — AUTH-GATÉ role='client'.
//
// Règle d'or de scope : AVANT toute écriture, on revérifie que le dossier visé
// appartient bien au client connecté (chaîne user → personnes.client_id →
// dossiers.client_id). Jamais d'écriture sur le dossier d'un autre client.
//
// On écrit via createAdminClient (service_role) car dci_responses n'a pas de
// policy RLS d'écriture pour un client ; le scope est garanti côté code.
// =========================================================================

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

/** Réponse d'upload : on renvoie l'id du document créé pour l'UI optimiste. */
export type UploadResult =
  | { ok: true; documentId: string }
  | { ok: false; error: string };

const STORAGE_BUCKET = "depots";
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo (aligné sur le flux collecte)

const MIME_AUTORISES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);
const EXT_AUTORISEES = new Set(["pdf", "jpg", "jpeg", "png", "heic", "heif"]);

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

/**
 * Résout le scope du client connecté et garantit la propriété du dossier visé.
 * Renvoie le contexte minimal (clientId + dossierId réellement possédé) ou
 * une erreur. C'est LE garde-fou anti-fuite : on ne fait confiance à aucun
 * dossierId reçu en paramètre tant qu'il n'a pas été confronté au client.
 */
async function resolveOwnedDossier(
  dossierId: string,
): Promise<
  | { ok: true; clientId: string; dossierId: string; userId: string; tenantId: string; cabinetId: string }
  | { ok: false; error: string }
> {
  const ctx = await getSessionContext();
  if (!ctx || ctx.role !== "client") {
    return { ok: false, error: "Accès non autorisé." };
  }

  const supabase = createAdminClient();

  const { data: personne, error: pErr } = await supabase
    .from("personnes")
    .select("client_id")
    .eq("user_id", ctx.userId)
    .limit(1)
    .maybeSingle();

  if (pErr || !personne?.client_id) {
    return { ok: false, error: "Aucun dossier rattaché à votre compte." };
  }

  const clientId = personne.client_id as string;

  // Le dossier visé DOIT appartenir à ce client. Sinon : refus net.
  const { data: dossier, error: dErr } = await supabase
    .from("dossiers")
    .select("id, client_id, tenant_id, cabinet_id")
    .eq("id", dossierId)
    .maybeSingle();

  if (dErr || !dossier || dossier.client_id !== clientId) {
    return { ok: false, error: "Ce dossier ne vous appartient pas." };
  }

  return {
    ok: true,
    clientId,
    dossierId: dossier.id as string,
    userId: ctx.userId,
    tenantId: dossier.tenant_id as string,
    cabinetId: dossier.cabinet_id as string,
  };
}

// ---------------------------------------------------------------------------
// saveDciCategory — upsert d'une catégorie de réponses du DCI
// ---------------------------------------------------------------------------

/**
 * Enregistre les réponses d'UNE catégorie du DCI dans dci_responses.
 *
 * - Scope : vérifie que `dossierId` appartient au client connecté AVANT d'écrire.
 * - Upsert sur dossier_id (relation 1-1) → crée la ligne si absente.
 * - Met à jour le timestamp de cycle pertinent :
 *     status passe de 'draft' → 'simplified_completed' au 1er enregistrement,
 *     puis 'full_in_progress' dès qu'on enrichit (sans régresser un statut plus
 *     avancé : full_validated / signed ne sont jamais rétrogradés ici).
 * - Recalcule completion_pct_cached + completion_by_cat_cached à partir des
 *   13 catégories réellement remplies, et propage dossiers.dci_completion_pct.
 */
export async function saveDciCategory(
  dossierId: string,
  categoryKey: DciCategoryKey,
  payload: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    if (!DCI_CATEGORY_KEYS.includes(categoryKey)) {
      return { ok: false, error: "Catégorie inconnue." };
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return { ok: false, error: "Réponses invalides." };
    }

    const owned = await resolveOwnedDossier(dossierId);
    if (!owned.ok) return owned;

    const supabase = createAdminClient();
    const column = DCI_CATEGORY_COLUMNS[categoryKey];

    // État courant (pour ne pas rétrograder un statut avancé et pour recalculer
    // la complétion sur l'ensemble des catégories après écriture).
    const allColumns = DCI_CATEGORY_KEYS.map((k) => DCI_CATEGORY_COLUMNS[k]);
    const { data: existing } = await supabase
      .from("dci_responses")
      .select(["status", "simplified_completed_at", ...allColumns].join(", "))
      .eq("dossier_id", owned.dossierId)
      .maybeSingle();

    const prev = (existing as unknown as Record<string, unknown> | null) ?? {};
    const prevStatus = (prev.status as string) ?? "draft";

    // Statut : on n'avance jamais au-delà de simplified/full_in_progress depuis
    // ici, et on ne rétrograde jamais full_validated / signed.
    const FROZEN = new Set(["full_validated", "signed"]);
    let nextStatus = prevStatus;
    if (!FROZEN.has(prevStatus)) {
      nextStatus = prevStatus === "draft" ? "simplified_completed" : "full_in_progress";
    }

    const now = new Date().toISOString();

    // Recalcul de la complétion : une catégorie "remplie" = au moins une clé.
    // On part de l'état précédent et on applique le nouveau payload.
    const filledByCat: Record<string, number> = {};
    let filledCount = 0;
    for (const k of DCI_CATEGORY_KEYS) {
      const col = DCI_CATEGORY_COLUMNS[k];
      const value =
        k === categoryKey ? payload : ((prev[col] as Record<string, unknown>) ?? {});
      const filled = value && typeof value === "object" && Object.keys(value).length > 0;
      filledByCat[k] = filled ? 100 : 0;
      if (filled) filledCount += 1;
    }
    const completionPct = Math.round((filledCount / DCI_CATEGORY_KEYS.length) * 100);

    const row: Record<string, unknown> = {
      dossier_id: owned.dossierId,
      [column]: payload,
      status: nextStatus,
      completion_pct_cached: completionPct,
      completion_by_cat_cached: filledByCat,
      updated_at: now,
    };
    // Horodate le passage en "simplifié complété" la première fois seulement.
    if (prevStatus === "draft" && nextStatus === "simplified_completed" && !prev.simplified_completed_at) {
      row.simplified_completed_at = now;
    }

    const { error: upsertErr } = await supabase
      .from("dci_responses")
      .upsert(row, { onConflict: "dossier_id" });

    if (upsertErr) {
      return { ok: false, error: `Enregistrement impossible : ${upsertErr.message}` };
    }

    // Propage la complétion sur le dossier (source de vérité du KPI portail).
    await supabase
      .from("dossiers")
      .update({ dci_completion_pct: completionPct, last_activity_at: now, updated_at: now })
      .eq("id", owned.dossierId);

    revalidatePath(CLIENT_BASE);
    revalidatePath(`${CLIENT_BASE}/questionnaire`);

    return { ok: true };
  } catch {
    return { ok: false, error: "Une erreur est survenue. Réessayez." };
  }
}

// ---------------------------------------------------------------------------
// uploadClientDocument — dépôt d'une pièce par le client
// ---------------------------------------------------------------------------

/**
 * Le client dépose un document rattaché à SON dossier. Réutilise le moteur du
 * flux collecte (validation MIME/taille + Storage privé `depots`) mais écrit
 * dans la table métier `documents` (et non collecte_depots, découplée du
 * modèle), avec :
 *   - category 'collecte', document_type déduit ('autre' par défaut),
 *   - status 'pending_validation' (le CGP valide ensuite),
 *   - visibility 'shared_with_client' (le client revoit sa propre pièce).
 *
 * Scope vérifié AVANT upload : le dossierId doit appartenir au client.
 * Le FormData attendu : `file` (File), `dossierId` (string), `label` (optionnel),
 * `documentType` (optionnel, parmi document_type).
 */
const DOCUMENT_TYPES = new Set([
  "avis_imposition",
  "fiche_paie",
  "k_bis",
  "livret_famille",
  "etude_complete",
  "synthese_restitution",
  "lettre_mission",
  "kyc",
  "contrat_produit",
  "autre",
]);

export async function uploadClientDocument(formData: FormData): Promise<UploadResult> {
  try {
    const dossierId = String(formData.get("dossierId") ?? "").trim();
    if (!dossierId) {
      return { ok: false, error: "Dossier manquant." };
    }

    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      return { ok: false, error: "Aucun fichier fourni." };
    }
    const file = fileEntry;

    if (file.size > MAX_FILE_SIZE) {
      return { ok: false, error: "Fichier trop volumineux (15 Mo maximum)." };
    }

    const safeName = sanitizeFileName(file.name);
    const ext = safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : "";
    const declaredType = (file.type || "").toLowerCase();
    const typeOk = declaredType !== "" && MIME_AUTORISES.has(declaredType);
    const extOk = EXT_AUTORISEES.has(ext);
    if (!typeOk && !extOk) {
      return {
        ok: false,
        error: "Type de fichier non autorisé (PDF, JPG, PNG ou HEIC uniquement).",
      };
    }

    const rawType = String(formData.get("documentType") ?? "autre");
    const documentType = DOCUMENT_TYPES.has(rawType) ? rawType : "autre";
    const label = String(formData.get("label") ?? "").trim() || file.name;

    // Scope : le dossier doit appartenir au client connecté.
    const owned = await resolveOwnedDossier(dossierId);
    if (!owned.ok) return owned;

    const supabase = createAdminClient();
    const mime = file.type || "application/octet-stream";
    const storagePath = `dossiers/${owned.dossierId}/${Date.now()}-${safeName}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, bytes, { contentType: mime, upsert: false });

    if (uploadErr) {
      return { ok: false, error: `Échec de l'upload : ${uploadErr.message}` };
    }

    // Ligne métier dans `documents`. storage_url = chemin dans le bucket privé
    // `depots` (signature à la lecture côté CGP/portail).
    const { data: inserted, error: insertErr } = await supabase
      .from("documents")
      .insert({
        tenant_id: owned.tenantId,
        cabinet_id: owned.cabinetId,
        dossier_id: owned.dossierId,
        category: "collecte",
        document_type: documentType,
        filename: label,
        file_size_bytes: file.size,
        mime_type: mime,
        storage_url: storagePath,
        uploaded_by_user_id: owned.userId,
        status: "pending_validation",
        visibility: "shared_with_client",
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      // Best-effort cleanup du blob orphelin si la ligne n'a pas pu être créée.
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]).catch(() => {});
      return {
        ok: false,
        error: `Enregistrement impossible : ${insertErr?.message ?? "inconnu"}`,
      };
    }

    await supabase
      .from("dossiers")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", owned.dossierId);

    revalidatePath(`${CLIENT_BASE}/documents`);
    revalidatePath(CLIENT_BASE);

    return { ok: true, documentId: inserted.id as string };
  } catch {
    return { ok: false, error: "Une erreur est survenue lors du dépôt." };
  }
}

// ---------------------------------------------------------------------------
// deleteClientDocument — le client retire une pièce qu'il a déposée
// ---------------------------------------------------------------------------

/**
 * Supprime un document déposé par le client (blob Storage + ligne métier).
 * Scope strict : le document doit appartenir à un dossier du client connecté
 * ET avoir été déposé par lui (uploaded_by_user_id). On ne touche jamais aux
 * pièces générées par le cabinet ni à celles d'un autre client.
 */
export async function deleteClientDocument(documentId: string): Promise<ActionResult> {
  try {
    const id = String(documentId ?? "").trim();
    if (!id) return { ok: false, error: "Document manquant." };

    const supabase = createAdminClient();
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("id, dossier_id, storage_url, uploaded_by_user_id")
      .eq("id", id)
      .maybeSingle();

    if (docErr || !doc || !doc.dossier_id) {
      return { ok: false, error: "Document introuvable." };
    }

    // Le dossier du document doit appartenir au client connecté.
    const owned = await resolveOwnedDossier(doc.dossier_id as string);
    if (!owned.ok) return owned;

    // On ne peut retirer QUE ses propres dépôts.
    if (doc.uploaded_by_user_id !== owned.userId) {
      return { ok: false, error: "Vous ne pouvez retirer que vos propres pièces." };
    }

    if (doc.storage_url) {
      await supabase.storage.from(STORAGE_BUCKET).remove([doc.storage_url as string]).catch(() => {});
    }
    const { error: delErr } = await supabase.from("documents").delete().eq("id", id);
    if (delErr) return { ok: false, error: `Suppression impossible : ${delErr.message}` };

    revalidatePath(`${CLIENT_BASE}/documents`);
    revalidatePath(CLIENT_BASE);
    return { ok: true };
  } catch {
    return { ok: false, error: "Une erreur est survenue lors de la suppression." };
  }
}
