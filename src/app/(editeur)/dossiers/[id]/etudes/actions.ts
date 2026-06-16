"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminClient,
  DEFAULT_TENANT_ID,
  DEFAULT_CABINET_ID,
  DEFAULT_ENGINEER_ID,
} from "@/lib/supabase/admin";
import {
  ETUDE_PHASES,
  nextPhase,
  progressFromPhase,
  type Etude,
  type EtudePhaseKey,
} from "@/lib/etudes";

/** Charge l'étude la plus récente d'un dossier. Dégradation gracieuse. */
export async function loadEtude(dossierId: string): Promise<Etude | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("etudes")
      .select("id, dossier_id, version, status, current_phase, phase_progress_pct, delivered_at")
      .eq("dossier_id", dossierId)
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
    const supabase = createAdminClient();

    const { data: dossier } = await supabase
      .from("dossiers")
      .select("tenant_id, cabinet_id")
      .eq("id", dossierId)
      .maybeSingle();
    const tenant_id = (dossier?.tenant_id as string | null) ?? DEFAULT_TENANT_ID;
    const cabinet_id = (dossier?.cabinet_id as string | null) ?? DEFAULT_CABINET_ID;

    const { data: existing } = await supabase
      .from("etudes")
      .select("id, current_phase")
      .eq("dossier_id", dossierId)
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
        .eq("id", existing.id);
    }

    const targetLabel = ETUDE_PHASES.find((p) => p.key === target)?.label ?? "Étude";
    await supabase.from("timeline_events").insert({
      tenant_id,
      cabinet_id,
      dossier_id: dossierId,
      event_type: done ? "study_delivered" : "ai_phase_validated",
      actor_user_id: DEFAULT_ENGINEER_ID,
      actor_type: "engineer",
      title: done ? "Étude restituée au client" : `Phase validée · ${targetLabel}`,
      visibility: "internal_only",
    });

    if (done) {
      await supabase
        .from("dossiers")
        .update({ pipeline_stage: "05_restituee", stage_entered_at: now })
        .eq("id", dossierId);
    }

    revalidatePath(`/dossiers/${dossierId}/etudes`);
    revalidatePath(`/dossiers/${dossierId}`);
  } catch {
    /* dégradation gracieuse : ne jamais throw vers l'UI */
  }
}
