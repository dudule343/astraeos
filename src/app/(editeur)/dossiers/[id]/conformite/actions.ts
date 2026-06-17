"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
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
    const ctx = await getSessionContext();
    if (!ctx) return [];
    const supabase = createAdminClient();

    // Vérifie d'abord l'appartenance du dossier au tenant/cabinet courant :
    // un dossier d'un autre tenant ne doit jamais exposer ses pièces.
    const { data: dossier } = await supabase
      .from("dossiers")
      .select("id")
      .eq("id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    if (!dossier) return [];

    const { data, error } = await supabase
      .from("conformite_items")
      .select(
        "id, tenant_id, cabinet_id, dossier_id, type, label, status, sent_at, signed_at, validated_at, created_at, updated_at",
      )
      .eq("dossier_id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);
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
    const owner = await resolveOwner(supabase, dossierId);
    if (!owner) return;
    const { tenantId, cabinetId, userId } = owner;

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

    const ok = await setItemStatus(supabase, {
      dossierId,
      tenantId,
      cabinetId,
      userId,
      type,
      target,
    });
    if (!ok) return;

    revalidatePath(`/dossiers/${dossierId}/conformite`);
    revalidatePath(`/dossiers/${dossierId}`);
  } catch {
    // Table absente ou erreur Postgres : no-op silencieux, pas d'exception UI.
  }
}

/* ------------------------------------------------------------------------- *
 * Helpers internes partagés (avancement isolé + envoi groupé du pack).
 * ------------------------------------------------------------------------- */

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * tenant_id / cabinet_id du dossier validés contre le contexte de session +
 * acteur courant (userId). Renvoie null si pas de contexte de session, si le
 * dossier est introuvable, ou s'il appartient à un autre tenant/cabinet
 * (no-op / refus côté appelant). On NE retombe JAMAIS sur le tenant du ctx pour
 * une ligne d'un autre tenant : isolation stricte.
 */
async function resolveOwner(
  supabase: AdminClient,
  dossierId: string,
): Promise<{ tenantId: string; cabinetId: string; userId: string } | null> {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const { data: d } = await supabase
    .from("dossiers")
    .select("tenant_id, cabinet_id")
    .eq("id", dossierId)
    .eq("tenant_id", ctx.tenantId)
    .eq("cabinet_id", ctx.cabinetId)
    .maybeSingle();
  const dossier = (d ?? null) as { tenant_id: string | null; cabinet_id: string | null } | null;
  // Dossier hors tenant/cabinet (ou introuvable) : refus, pas d'adoption.
  if (!dossier || dossier.tenant_id !== ctx.tenantId || dossier.cabinet_id !== ctx.cabinetId) {
    return null;
  }
  return {
    tenantId: ctx.tenantId,
    cabinetId: ctx.cabinetId,
    userId: ctx.userId,
  };
}

/**
 * Upsert idempotent d'une pièce au statut cible + journalisation timeline.
 * Factorise la logique commune à advanceConformiteItem et sendConformitePack.
 * Retourne false si l'upsert échoue (no-op silencieux pour l'appelant).
 */
async function setItemStatus(
  supabase: AdminClient,
  args: {
    dossierId: string;
    tenantId: string;
    cabinetId: string;
    userId: string;
    type: ConformiteType;
    target: ConformiteStatus;
  },
): Promise<boolean> {
  const { dossierId, tenantId, cabinetId, userId, type, target } = args;
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
  if (upsertError) return false;

  // Journalise l'événement (non bloquant : un échec n'annule pas l'avancement).
  await supabase.from("timeline_events").insert({
    tenant_id: tenantId,
    cabinet_id: cabinetId,
    dossier_id: dossierId,
    event_type: "compliance_review",
    actor_user_id: userId,
    actor_type: "engineer",
    title: `${labelForType(type)} · ${STATUS_LABELS[target]}`,
    description: `La pièce « ${labelForType(type)} » est passée à l'état « ${STATUS_LABELS[target]} ».`,
    visibility: "internal_only",
    linked_entity_type: "conformite_item",
  });

  return true;
}

/**
 * Envoi groupé du pack de contractualisation (v40 · espace d'envoi du pack).
 *
 * Pour chaque pièce sélectionnée encore « à faire », passe son statut à
 * « envoyé » (sent_at horodaté) — mock Yousign, PAS d'appel API externe,
 * cohérent avec l'esprit mock du projet (DCI_DATA). Journalise un seul
 * timeline_event récapitulatif du pack envoyé.
 *
 * Dégradation gracieuse identique : no-op silencieux sans clé service_role
 * ou si la table conformite_items est absente.
 */
export async function sendConformitePack(dossierId: string, selectedTypes: ConformiteType[]) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const types = selectedTypes.filter((t) => CONFORMITE_TYPES.includes(t));
  if (types.length === 0) return;

  try {
    const supabase = createAdminClient();
    const owner = await resolveOwner(supabase, dossierId);
    if (!owner) return;
    const { tenantId, cabinetId, userId } = owner;

    // Statuts actuels des pièces sélectionnées (absentes = 'a_faire').
    const { data: rows } = await supabase
      .from("conformite_items")
      .select("type, status")
      .eq("dossier_id", dossierId)
      .in("type", types);

    const byType = new Map(
      ((rows as Array<{ type: string; status: ConformiteStatus }> | null) ?? []).map((r) => [
        r.type,
        r.status,
      ]),
    );

    const sent: ConformiteType[] = [];
    for (const type of types) {
      const current = byType.get(type) ?? "a_faire";
      // Seules les pièces encore à préparer sont « envoyées » par le pack.
      if (current !== "a_faire") continue;
      const ok = await setItemStatus(supabase, {
        dossierId,
        tenantId,
        cabinetId,
        userId,
        type,
        target: "envoye",
      });
      if (ok) sent.push(type);
    }

    if (sent.length === 0) return; // rien à envoyer : pas de timeline ni revalidate.

    // Événement récapitulatif unique du pack envoyé (au-dessus des events par pièce).
    await supabase.from("timeline_events").insert({
      tenant_id: tenantId,
      cabinet_id: cabinetId,
      dossier_id: dossierId,
      event_type: "compliance_review",
      actor_user_id: userId,
      actor_type: "engineer",
      title: "Pack de contractualisation envoyé",
      description: `Pack envoyé au client · ${sent.length} pièce(s) en signature électronique (Yousign) + demande de règlement.`,
      visibility: "internal_only",
    });

    revalidatePath(`/dossiers/${dossierId}/conformite`);
    revalidatePath(`/dossiers/${dossierId}`);
  } catch {
    // Table absente ou erreur Postgres : no-op silencieux.
  }
}

/**
 * Relance client (placeholder v40) : journalise un timeline_event de relance.
 * Pas d'envoi d'e-mail réel pour le MVP.
 */
export async function relancerClient(dossierId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const supabase = createAdminClient();
    const owner = await resolveOwner(supabase, dossierId);
    if (!owner) return;
    const { tenantId, cabinetId, userId } = owner;

    await supabase.from("timeline_events").insert({
      tenant_id: tenantId,
      cabinet_id: cabinetId,
      dossier_id: dossierId,
      event_type: "compliance_review",
      actor_user_id: userId,
      actor_type: "engineer",
      title: "Relance client · conformité",
      description: "Relance envoyée au client pour la signature des documents et le règlement des honoraires.",
      visibility: "internal_only",
    });

    revalidatePath(`/dossiers/${dossierId}/conformite`);
  } catch {
    // No-op silencieux.
  }
}
