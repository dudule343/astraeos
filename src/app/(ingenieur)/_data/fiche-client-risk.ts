import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import { decodeRiskProfile, type RiskProfile } from "./risk-profile";

/**
 * Profil de risque d'un CLIENT pour la fiche ingénieur.
 *
 * Le client remplit le questionnaire depuis son espace ; la réponse est
 * persistée dans `dci_submissions` (kind='qualification') sous le slug
 * `dossier-<dossierId>` (cf. (client)/actions.ts › saveRiskProfile). On part de
 * l'id du foyer (`clients.id`), on retrouve son dossier le plus récent (scope
 * tenant/cabinet), puis on lit et décode la soumission de qualification.
 *
 * Best-effort : sans base, sans session, ou en l'absence de dossier/soumission,
 * renvoie null — la fiche reste rendue sans la carte.
 */
export async function getFicheClientRiskProfile(
  clientId: string,
): Promise<RiskProfile | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return null;

    const supabase = createAdminClient();

    // Dossier le plus récent du foyer (scope cabinet). On ordonne sur l'entrée
    // dans le pipeline puis l'entrée d'étape pour prendre le plus actuel.
    const { data: dossiers, error: dErr } = await supabase
      .from("dossiers")
      .select("id, pipeline_entry_date, stage_entered_at")
      .eq("client_id", clientId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("pipeline_entry_date", { ascending: false, nullsFirst: false })
      .order("stage_entered_at", { ascending: false, nullsFirst: false })
      .limit(1);

    if (dErr || !dossiers || dossiers.length === 0) return null;
    const dossierId = dossiers[0].id as string;

    const { data, error } = await supabase
      .from("dci_submissions")
      .select("payload")
      .eq("tenant_id", ctx.tenantId)
      .eq("prospect_slug", `dossier-${dossierId}`)
      .eq("kind", "qualification")
      .order("submitted_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return decodeRiskProfile(
      (data as { payload: Record<string, unknown> | null }).payload,
    );
  } catch {
    return null;
  }
}
