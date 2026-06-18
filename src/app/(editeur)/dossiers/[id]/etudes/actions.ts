"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import {
  ETUDE_PHASES,
  nextPhase,
  progressFromPhase,
  type Etude,
  type EtudePhaseKey,
} from "@/lib/etudes";

const STORAGE_BUCKET = "depots";
const MAX_ETUDE_FILE_SIZE = 30 * 1024 * 1024; // 30 Mo (PDF d'étude complet)

// kind d'upload → colonne de la table `etudes` qui reçoit le chemin Storage.
const ETUDE_KIND_COLUMNS = {
  complete: "complete_pdf_url",
  summary: "summary_pdf_url",
} as const;

type EtudeUploadKind = keyof typeof ETUDE_KIND_COLUMNS;

export type UploadEtudeResult =
  | { ok: true; storagePath: string }
  | { ok: false; error: string };

/** Assainit un nom de fichier pour un chemin de stockage. */
function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "etude";
}

/** Charge l'étude la plus récente d'un dossier. Dégradation gracieuse. */
export async function loadEtude(dossierId: string): Promise<Etude | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return null;
    const supabase = createAdminClient();

    // Vérifier l'appartenance du dossier au tenant/cabinet courant.
    const { data: dossier } = await supabase
      .from("dossiers")
      .select("id")
      .eq("id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    if (!dossier) return null;

    const { data } = await supabase
      .from("etudes")
      .select("id, dossier_id, version, status, current_phase, phase_progress_pct, delivered_at")
      .eq("dossier_id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data as Etude | null) ?? null;
  } catch {
    return null;
  }
}

/**
 * Avance l'étude d'une phase. Crée l'étude au 1er clic (phase 1). À la dernière
 * phase, l'étude passe en "delivered" et le dossier en étape 05 (restituée).
 * No-op silencieux si Supabase indisponible.
 */
export async function advanceEtudePhase(dossierId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return;
    const supabase = createAdminClient();

    // Vérifier l'appartenance du dossier AVANT toute écriture. On n'adopte
    // jamais le tenant de la ligne : on utilise ctx.* et on refuse si mismatch.
    const { data: dossier } = await supabase
      .from("dossiers")
      .select("id")
      .eq("id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    if (!dossier) return;
    const tenant_id = ctx.tenantId;
    const cabinet_id = ctx.cabinetId;

    const { data: existing } = await supabase
      .from("etudes")
      .select("id, current_phase")
      .eq("dossier_id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentPhase = (existing?.current_phase ?? null) as EtudePhaseKey | null;
    if (currentPhase === "completed") return; // déjà terminée

    const target = nextPhase(currentPhase);
    const done = target === "completed";
    const now = new Date().toISOString();
    const progress = done ? 100 : progressFromPhase(target, null);

    if (!existing?.id) {
      await supabase.from("etudes").insert({
        dossier_id: dossierId,
        tenant_id,
        cabinet_id,
        version: 1,
        status: "in_progress",
        current_phase: target,
        phase_progress_pct: progress,
      });
    } else {
      await supabase
        .from("etudes")
        .update({
          current_phase: target,
          status: done ? "delivered" : "in_progress",
          phase_progress_pct: progress,
          delivered_at: done ? now : null,
          updated_at: now,
        })
        .eq("id", existing.id)
        .eq("tenant_id", ctx.tenantId)
        .eq("cabinet_id", ctx.cabinetId);
    }

    const targetLabel = ETUDE_PHASES.find((p) => p.key === target)?.label ?? "Étude";
    await supabase.from("timeline_events").insert({
      tenant_id,
      cabinet_id,
      dossier_id: dossierId,
      event_type: done ? "study_delivered" : "ai_phase_validated",
      actor_user_id: ctx.userId,
      actor_type: "engineer",
      title: done ? "Étude restituée au client" : `Phase validée · ${targetLabel}`,
      visibility: "internal_only",
    });

    if (done) {
      await supabase
        .from("dossiers")
        .update({ pipeline_stage: "05_restituee", stage_entered_at: now })
        .eq("id", dossierId)
        .eq("tenant_id", ctx.tenantId)
        .eq("cabinet_id", ctx.cabinetId);
    }

    revalidatePath(`/dossiers/${dossierId}/etudes`);
    revalidatePath(`/dossiers/${dossierId}`);
  } catch {
    /* dégradation gracieuse : ne jamais throw vers l'UI */
  }
}

/**
 * PRODUCTEUR — dépose un PDF d'étude (complète ou synthèse) dans le bucket privé
 * `depots` et écrit le chemin Storage dans la colonne correspondante de l'étude
 * la plus récente du dossier (complete_pdf_url / summary_pdf_url).
 *
 * Scope strict tenant/cabinet : le dossier ET l'étude doivent appartenir au
 * cabinet courant (on n'adopte jamais le tenant d'une ligne, on borne par ctx.*).
 * C'est ce qui rend les liens du portail client réels et signés à la lecture.
 *
 * FormData attendu : dossierId, kind ∈ {complete|summary}, file (PDF).
 */
export async function uploadEtudeDocument(formData: FormData): Promise<UploadEtudeResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Stockage indisponible." };
  }
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: false, error: "Authentification requise." };

    const dossierId = String(formData.get("dossierId") ?? "").trim();
    if (!dossierId) return { ok: false, error: "Dossier manquant." };

    const rawKind = String(formData.get("kind") ?? "");
    if (rawKind !== "complete" && rawKind !== "summary") {
      return { ok: false, error: "Type de livrable invalide." };
    }
    const kind = rawKind as EtudeUploadKind;
    const column = ETUDE_KIND_COLUMNS[kind];

    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      return { ok: false, error: "Aucun fichier fourni." };
    }
    const file = fileEntry;
    if (file.size > MAX_ETUDE_FILE_SIZE) {
      return { ok: false, error: "Fichier trop volumineux (30 Mo maximum)." };
    }

    const safeName = sanitizeFileName(file.name);
    const ext = safeName.includes(".") ? safeName.split(".").pop()!.toLowerCase() : "";
    const declaredType = (file.type || "").toLowerCase();
    if (declaredType !== "application/pdf" && ext !== "pdf") {
      return { ok: false, error: "Le livrable doit être un PDF." };
    }

    const supabase = createAdminClient();

    // Scope : le dossier doit appartenir au tenant/cabinet courant.
    const { data: dossier } = await supabase
      .from("dossiers")
      .select("id")
      .eq("id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    if (!dossier) return { ok: false, error: "Dossier introuvable." };

    // L'étude la plus récente du dossier (celle qu'on enrichit du livrable).
    // Le scope cabinet est garanti par le contrôle de propriété du dossier
    // ci-dessus : etudes n'a pas de tenant_id/cabinet_id, on borne par dossier_id.
    const { data: etude } = await supabase
      .from("etudes")
      .select("id")
      .eq("dossier_id", dossierId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!etude?.id) return { ok: false, error: "Aucune étude à compléter." };

    const storagePath = `etudes/${dossierId}/${etude.id}/${Date.now()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, bytes, { contentType: "application/pdf", upsert: false });
    if (uploadErr) {
      return { ok: false, error: `Échec de l'upload : ${uploadErr.message}` };
    }

    const { error: updateErr } = await supabase
      .from("etudes")
      .update({ [column]: storagePath, updated_at: new Date().toISOString() })
      .eq("id", etude.id)
      .eq("dossier_id", dossierId);

    if (updateErr) {
      // Best-effort cleanup du blob orphelin si l'écriture métier a échoué.
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]).catch(() => {});
      return { ok: false, error: `Enregistrement impossible : ${updateErr.message}` };
    }

    revalidatePath(`/dossiers/${dossierId}/etudes`);
    revalidatePath(`/dossiers/${dossierId}`);

    return { ok: true, storagePath };
  } catch (err) {
    console.error("[etudes/uploadEtudeDocument] erreur:", err);
    return { ok: false, error: "Une erreur est survenue lors du dépôt." };
  }
}
