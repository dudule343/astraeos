"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminClient,
  DEFAULT_TENANT_ID,
  DEFAULT_CABINET_ID,
  DEFAULT_ENGINEER_ID,
} from "@/lib/supabase/admin";
import {
  CONFORMITE_TYPES,
  STATUS_LABELS,
  labelForType,
  nextStatus,
  timestampColumnFor,
  type ConformiteItem,
  type ConformiteStatus,
  type ConformiteType,
} from "@/lib/conformite";

/**
 * Charge les lignes `conformite_items` d'un dossier.
 *
 * Dégradation gracieuse : renvoie un tableau vide si la clé service_role
 * manque, si la table n'existe pas encore (migration non appliquée en prod)
 * ou en cas d'erreur. mergeChecklist() reconstruit alors les 4 lignes au
 * statut « à faire » par défaut — la page s'affiche à l'identique que la
 * migration soit appliquée ou non.
 */
export async function loadConformiteItems(dossierId: string): Promise<ConformiteItem[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("conformite_items")
      .select(
        "id, tenant_id, cabinet_id, dossier_id, type, label, status, sent_at, signed_at, validated_at, created_at, updated_at",
      )
      .eq("dossier_id", dossierId);
    if (error) return [];
    return (data as ConformiteItem[] | null) ?? [];
  } catch {
    // Table absente ou erreur Postgres : checklist vierge côté affichage.
    return [];
  }
}

/**
 * Fait avancer une pièce de conformité au statut suivant
 * (à faire → envoyé → signé → validé). Avancement unidirectionnel, miroir des
 * boutons Envoyer / Signé / Valider du wireframe. Liée via .bind dans la page.
 *
 * L'UPSERT sur (dossier_id, type) rend l'opération idempotente : au premier
 * clic la ligne est créée ('a_faire' → 'envoye'), aux suivants elle avance.
 *
 * Dégradation gracieuse : tout est encapsulé dans un try/catch global. Si la
 * table n'existe pas encore en prod, l'erreur Postgres est avalée et l'action
 * devient un no-op silencieux (même esprit que loadFactsForProspect), sans
 * jamais remonter d'exception vers l'UI.
 */
export async function advanceConformiteItem(dossierId: string, type: ConformiteType) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  if (!CONFORMITE_TYPES.includes(type)) return;

  try {
    const supabase = createAdminClient();

    // tenant_id / cabinet_id du dossier (fallback seed si absent).
    const { data: d } = await supabase
      .from("dossiers")
      .select("tenant_id, cabinet_id")
      .eq("id", dossierId)
      .maybeSingle();

    const dossier = (d ?? null) as { tenant_id: string | null; cabinet_id: string | null } | null;
    const tenantId = dossier?.tenant_id ?? DEFAULT_TENANT_ID;
    const cabinetId = dossier?.cabinet_id ?? DEFAULT_CABINET_ID;

    // État actuel de la pièce (absente = 'a_faire').
    const { data: existing } = await supabase
      .from("conformite_items")
      .select("status")
      .eq("dossier_id", dossierId)
      .eq("type", type)
      .maybeSingle();

    const current: ConformiteStatus =
      (existing as { status: ConformiteStatus } | null)?.status ?? "a_faire";
    const target = nextStatus(current);
    if (!target) return; // déjà validée : état terminal.

    const now = new Date().toISOString();
    const tsColumn = timestampColumnFor(target);

    const { error: upsertError } = await supabase.from("conformite_items").upsert(
      {
        tenant_id: tenantId,
        cabinet_id: cabinetId,
        dossier_id: dossierId,
        type,
        label: labelForType(type),
        status: target,
        updated_at: now,
        ...(tsColumn ? { [tsColumn]: now } : {}),
      },
      { onConflict: "dossier_id,type" },
    );
    if (upsertError) return;

    // Journalise l'événement (non bloquant : un échec n'annule pas l'avancement).
    await supabase.from("timeline_events").insert({
      tenant_id: tenantId,
      cabinet_id: cabinetId,
      dossier_id: dossierId,
      event_type: "compliance_review",
      actor_user_id: DEFAULT_ENGINEER_ID,
      actor_type: "engineer",
      title: `${labelForType(type)} · ${STATUS_LABELS[target]}`,
      description: `La pièce « ${labelForType(type)} » est passée à l'état « ${STATUS_LABELS[target]} ».`,
      visibility: "internal_only",
      linked_entity_type: "conformite_item",
    });

    revalidatePath(`/dossiers/${dossierId}/conformite`);
    revalidatePath(`/dossiers/${dossierId}`);
  } catch {
    // Table absente ou erreur Postgres : no-op silencieux, pas d'exception UI.
  }
}
