"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminClient,
  DEFAULT_TENANT_ID,
  DEFAULT_CABINET_ID,
  DEFAULT_ENGINEER_ID,
} from "@/lib/supabase/admin";

const STAGE_ORDER = [
  "01_prospect",
  "02_compliance",
  "03_collecte",
  "04_etudes",
  "05_restituee",
  "06_suivi",
] as const;

const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Études",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
};

/**
 * Fait avancer ou reculer un dossier d'une étape du parcours.
 * Écrit pipeline_stage + stage_entered_at et journalise un timeline_events
 * (stage_changed). Server action liée via .bind dans la fiche dossier.
 */
export async function moveDossierStage(dossierId: string, direction: "next" | "prev") {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const supabase = createAdminClient();

  const { data: d } = await supabase
    .from("dossiers")
    .select("pipeline_stage, tenant_id, cabinet_id")
    .eq("id", dossierId)
    .maybeSingle();

  if (!d) return;

  const row = d as { pipeline_stage: string; tenant_id: string | null; cabinet_id: string | null };
  const current = STAGE_ORDER.indexOf(row.pipeline_stage as (typeof STAGE_ORDER)[number]);
  if (current < 0) return;

  const target =
    direction === "next"
      ? Math.min(current + 1, STAGE_ORDER.length - 1)
      : Math.max(current - 1, 0);
  if (target === current) return;

  const fromStage = STAGE_ORDER[current];
  const toStage = STAGE_ORDER[target];
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("dossiers")
    .update({ pipeline_stage: toStage, stage_entered_at: now })
    .eq("id", dossierId);

  if (updateError) return;

  // Journalise l'événement (non bloquant : un échec ne doit pas annuler le passage).
  await supabase.from("timeline_events").insert({
    tenant_id: row.tenant_id ?? DEFAULT_TENANT_ID,
    cabinet_id: row.cabinet_id ?? DEFAULT_CABINET_ID,
    dossier_id: dossierId,
    event_type: "stage_changed",
    actor_user_id: DEFAULT_ENGINEER_ID,
    actor_type: "engineer",
    title: `Passage à l'étape ${STAGE_LABELS[toStage] ?? toStage}`,
    description: `Le dossier est passé de « ${STAGE_LABELS[fromStage] ?? fromStage} » à « ${STAGE_LABELS[toStage] ?? toStage} ».`,
    visibility: "internal_only",
  });

  revalidatePath(`/dossiers/${dossierId}`);
  revalidatePath("/dossiers");
}
