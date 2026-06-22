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
import {
  buildConformitePdf,
  pdfFileLabel,
  PDF_GENERATED_TYPES,
  type ConformitePdfInput,
} from "@/lib/conformite-pdf";
import { isYousignConfigured, sendPdfForSignature, type YousignResult } from "@/lib/yousign";

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

/** Honoraires bruts → format FR « 3 900 € TTC », ou null si indéfini. */
function formatHonoraires(raw: unknown): string | null {
  if (raw == null) return null;
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n === 0) return null;
  return `${n.toLocaleString("fr-FR")} € TTC`;
}

/** Préfixe « Monsieur / Madame » + nom complet pour l'éditorial réglementaire. */
function fullName(p?: { first_name?: string | null; last_name?: string | null }): string | null {
  if (!p) return null;
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return name || null;
}

type DossierBundle = {
  clientName: string | null;
  conjointName: string | null;
  /** Premier e-mail client exploitable (destinataire des envois). */
  clientEmail: string | null;
  pdfInput: ConformitePdfInput;
};

/**
 * Charge en une requête tout ce qu'il faut pour générer les PDF et envoyer les
 * e-mails : personnes du client (noms + e-mail), honoraires, et profil cabinet
 * (en-tête réglementaire). Réutilise le pattern fetchHeader de la page.
 * Renvoie null si le dossier est hors scope (resolveOwner a déjà validé l'accès).
 */
async function loadDossierBundle(
  supabase: AdminClient,
  dossierId: string,
  cabinetId: string,
): Promise<DossierBundle | null> {
  const { data: d } = await supabase
    .from("dossiers")
    .select(
      `
        total_revenue_cached,
        internal_notes,
        clients ( personnes ( first_name, last_name, email ) )
      `,
    )
    .eq("id", dossierId)
    .maybeSingle();
  if (!d) return null;
  const row = d as Record<string, unknown>;

  const clientRaw = row.clients as
    | { personnes?: Array<{ first_name?: string; last_name?: string; email?: string }> }
    | Array<{ personnes?: Array<{ first_name?: string; last_name?: string; email?: string }> }>
    | null
    | undefined;
  const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
  const personnes = client?.personnes ?? [];

  const clientName = fullName(personnes[0]);
  const conjointName = fullName(personnes[1]);
  const clientEmail =
    personnes.map((p) => p.email).find((e): e is string => Boolean(e && e.includes("@"))) ?? null;

  // Honoraires : colonne cachée, fallback sur internal_notes.revenue.
  let honoraires = formatHonoraires(row.total_revenue_cached);
  if (!honoraires && typeof row.internal_notes === "string") {
    try {
      const notes = JSON.parse(row.internal_notes) as { revenue?: string };
      honoraires = formatHonoraires(notes.revenue);
    } catch {
      // notes illisibles : honoraires restent null.
    }
  }

  const { data: cab } = await supabase
    .from("cabinets")
    .select(
      "name, address_street, address_city, address_zipcode, phone, email, orias_number, rc_pro_insurer",
    )
    .eq("id", cabinetId)
    .maybeSingle();
  const c = (cab ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (v != null ? String(v) : null);

  const pdfInput: ConformitePdfInput = {
    dossierId,
    clientName,
    conjointName,
    honoraires,
    cabinet: {
      name: str(c.name) ?? "Cabinet ASTRAEOS",
      addressStreet: str(c.address_street),
      addressZipcode: str(c.address_zipcode),
      addressCity: str(c.address_city),
      phone: str(c.phone),
      email: str(c.email),
      oriasNumber: str(c.orias_number),
      rcProInsurer: str(c.rc_pro_insurer),
    },
  };

  return { clientName, conjointName, clientEmail, pdfInput };
}

type EmailAttachment = { filename: string; content: string };

/**
 * Envoie un e-mail via l'API REST Resend (même pattern que collecte/send).
 * Dégradation gracieuse : renvoie un message d'erreur clair (jamais d'exception)
 * si la clé est absente ou si Resend répond une erreur.
 */
async function sendResendEmail(args: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<{ ok: boolean; error: string | null; id: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY manquant", id: null };
  }
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        ...(args.attachments && args.attachments.length > 0
          ? { attachments: args.attachments }
          : {}),
      }),
    });
    const payload = (await resp.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };
    if (!resp.ok) {
      return {
        ok: false,
        error: payload.message || payload.name || `Resend HTTP ${resp.status}`,
        id: null,
      };
    }
    return { ok: true, error: null, id: payload.id ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Échec de l'envoi e-mail",
      id: null,
    };
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

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

/** Résultat structuré de l'envoi du pack (surfacé par PackSend côté client). */
export type SendPackResult = {
  ok: boolean;
  /** Nombre de pièces passées au statut « envoyé ». */
  sentCount: number;
  /** Vrai si un e-mail a réellement été remis à Resend. */
  emailSent: boolean;
  /** Message d'erreur clair, ou null. */
  error: string | null;
};

/**
 * Envoi RÉEL du pack de contractualisation au client.
 *
 * 1. Génère les PDF (DER, Lettre de mission) avec les vraies données dossier.
 * 2. Envoie un e-mail Resend au client avec les PDF en pièces jointes (base64).
 * 3. Passe les pièces sélectionnées encore « à faire » au statut « envoyé ».
 * 4. Journalise un timeline_event récapitulatif (« Pack de contractualisation envoyé »).
 *
 * Dégradation gracieuse : sans clé service_role ou e-mail client, renvoie un
 * SendPackResult { ok:false } avec un message clair, sans jamais lever d'exception.
 */
export async function sendConformitePack(
  dossierId: string,
  selectedTypes: ConformiteType[],
): Promise<SendPackResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, sentCount: 0, emailSent: false, error: "Base de données non configurée" };
  }

  const types = selectedTypes.filter((t) => CONFORMITE_TYPES.includes(t));
  if (types.length === 0) {
    return { ok: false, sentCount: 0, emailSent: false, error: "Aucune pièce sélectionnée" };
  }

  try {
    const supabase = createAdminClient();
    const owner = await resolveOwner(supabase, dossierId);
    if (!owner) {
      return { ok: false, sentCount: 0, emailSent: false, error: "Dossier introuvable" };
    }
    const { tenantId, cabinetId, userId } = owner;

    const bundle = await loadDossierBundle(supabase, dossierId, cabinetId);
    if (!bundle?.clientEmail) {
      return {
        ok: false,
        sentCount: 0,
        emailSent: false,
        error: "Aucune adresse e-mail client connue : renseignez l'e-mail du client avant l'envoi.",
      };
    }

    // 1. Génère les PDF réels des pièces contractuelles concernées.
    const attachments: EmailAttachment[] = [];
    for (const type of types) {
      if (!PDF_GENERATED_TYPES.includes(type)) continue;
      const pdf = await buildConformitePdf(type, bundle.pdfInput);
      if (pdf) {
        attachments.push({
          filename: `${pdfFileLabel(type)}.pdf`,
          content: bytesToBase64(pdf),
        });
      }
    }

    // 2. E-mail Resend au client avec les PDF en pièces jointes.
    const honoraires = bundle.pdfInput.honoraires ?? "honoraires à définir";
    const greeting = bundle.clientName ? `Bonjour ${bundle.clientName},` : "Madame, Monsieur,";
    const html = `
      <p>${greeting}</p>
      <p>Faisant suite à notre échange, vous trouverez en pièces jointes les éléments de
      contractualisation de notre accompagnement patrimonial : le document d'entrée en relation
      (DER) et la lettre de mission reprenant nos honoraires (${honoraires}).</p>
      <p>La prochaine étape consiste à signer électroniquement ces documents et à régler les
      honoraires. Dès réception, nous ouvrirons votre espace sécurisé et lancerons votre étude.</p>
      <p>Je reste à votre entière disposition.<br>Bien à vous,<br>
      <strong>${bundle.pdfInput.cabinet.name}</strong></p>
    `;
    const emailResult = await sendResendEmail({
      to: bundle.clientEmail,
      subject: "Éléments de contractualisation de notre accompagnement patrimonial",
      html,
      attachments,
    });

    // 3. Passe les pièces à « envoyé » (uniquement celles encore à préparer).
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

    // 4. Timeline récapitulatif « pack_envoye ».
    await supabase.from("timeline_events").insert({
      tenant_id: tenantId,
      cabinet_id: cabinetId,
      dossier_id: dossierId,
      event_type: "compliance_review",
      actor_user_id: userId,
      actor_type: "engineer",
      title: "Pack de contractualisation envoyé",
      description: emailResult.ok
        ? `Pack envoyé à ${bundle.clientEmail} · ${attachments.length} PDF joint(s) · ${sent.length} pièce(s) passée(s) en « envoyé ».`
        : `Pièces passées en « envoyé » (${sent.length}) · e-mail NON remis : ${emailResult.error}.`,
      visibility: "internal_only",
    });

    revalidatePath(`/dossiers/${dossierId}/conformite`);
    revalidatePath(`/dossiers/${dossierId}`);

    return {
      ok: emailResult.ok,
      sentCount: sent.length,
      emailSent: emailResult.ok,
      error: emailResult.ok ? null : emailResult.error,
    };
  } catch (err) {
    return {
      ok: false,
      sentCount: 0,
      emailSent: false,
      error: err instanceof Error ? err.message : "Échec de l'envoi du pack",
    };
  }
}

/**
 * Relance RÉELLE du client : envoie un e-mail de relance via Resend puis
 * journalise le timeline_event. Dégradation gracieuse si l'e-mail client ou la
 * clé Resend manque (le timeline_event reflète l'issue réelle).
 */
export async function relancerClient(dossierId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const supabase = createAdminClient();
    const owner = await resolveOwner(supabase, dossierId);
    if (!owner) return;
    const { tenantId, cabinetId, userId } = owner;

    const bundle = await loadDossierBundle(supabase, dossierId, cabinetId);

    let emailOutcome: string;
    if (!bundle?.clientEmail) {
      emailOutcome = "e-mail NON envoyé : aucune adresse client connue.";
    } else {
      const honoraires = bundle.pdfInput.honoraires ?? "vos honoraires";
      const greeting = bundle.clientName ? `Bonjour ${bundle.clientName},` : "Madame, Monsieur,";
      const html = `
        <p>${greeting}</p>
        <p>Nous revenons vers vous concernant les documents de contractualisation de notre
        accompagnement patrimonial. Pour lancer votre étude, il nous reste à recueillir la
        signature électronique de vos documents (DER, KYC et lettre de mission) ainsi que le
        règlement de ${honoraires}.</p>
        <p>N'hésitez pas à nous contacter si vous rencontrez la moindre difficulté.</p>
        <p>Bien à vous,<br><strong>${bundle.pdfInput.cabinet.name}</strong></p>
      `;
      const r = await sendResendEmail({
        to: bundle.clientEmail,
        subject: "Relance · signature et règlement de votre accompagnement patrimonial",
        html,
      });
      emailOutcome = r.ok
        ? `relance envoyée à ${bundle.clientEmail}.`
        : `e-mail NON remis : ${r.error}.`;
    }

    await supabase.from("timeline_events").insert({
      tenant_id: tenantId,
      cabinet_id: cabinetId,
      dossier_id: dossierId,
      event_type: "compliance_review",
      actor_user_id: userId,
      actor_type: "engineer",
      title: "Relance client · conformité",
      description: `Relance pour la signature des documents et le règlement des honoraires · ${emailOutcome}`,
      visibility: "internal_only",
    });

    revalidatePath(`/dossiers/${dossierId}/conformite`);
  } catch {
    // No-op silencieux.
  }
}

/** Résultat structuré de l'envoi en signature (surfacé côté UI). */
export type SignatureResult =
  | { ok: true; status: ConformiteStatus; signatureRequestId: string }
  | { ok: false; reason: string };

/**
 * Envoi RÉEL d'une pièce en signature électronique via Yousign (BYOK par ENV).
 *
 * - Si YOUSIGN_API_KEY est absente : renvoie { ok:false, reason:"yousign_non_configure" }
 *   SANS rien modifier en base (l'UI propose alors l'envoi e-mail classique).
 * - Sinon : génère le PDF de la pièce, crée et active une signature request
 *   Yousign auprès du client, puis passe la pièce au statut « envoyé »
 *   (= « en signature » dans le cycle de vie) et journalise un timeline_event.
 *
 * Ne lève jamais d'exception : toute erreur est renvoyée dans `reason`.
 */
export async function sendForSignature(
  dossierId: string,
  type: ConformiteType,
): Promise<SignatureResult> {
  if (!CONFORMITE_TYPES.includes(type)) {
    return { ok: false, reason: "Type de pièce inconnu" };
  }
  if (!isYousignConfigured()) {
    return { ok: false, reason: "yousign_non_configure" };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, reason: "Base de données non configurée" };
  }
  if (!PDF_GENERATED_TYPES.includes(type)) {
    return { ok: false, reason: "Cette pièce n'a pas de PDF signable généré" };
  }

  try {
    const supabase = createAdminClient();
    const owner = await resolveOwner(supabase, dossierId);
    if (!owner) return { ok: false, reason: "Dossier introuvable" };
    const { tenantId, cabinetId, userId } = owner;

    const bundle = await loadDossierBundle(supabase, dossierId, cabinetId);
    if (!bundle?.clientEmail) {
      return { ok: false, reason: "Aucune adresse e-mail client pour la signature" };
    }

    const pdf = await buildConformitePdf(type, bundle.pdfInput);
    if (!pdf) return { ok: false, reason: "Génération du PDF impossible" };

    const [firstName, ...rest] = (bundle.clientName ?? "Client").split(/\s+/);
    const yResult: YousignResult = await sendPdfForSignature({
      pdf,
      fileName: `${pdfFileLabel(type)}.pdf`,
      requestName: `${labelForType(type)} · ${dossierId.slice(0, 8).toUpperCase()}`,
      signer: {
        firstName: firstName || "Client",
        lastName: rest.join(" ") || "Client",
        email: bundle.clientEmail,
      },
    });

    if (!yResult.ok) {
      return { ok: false, reason: yResult.reason };
    }

    // Pièce passée à « envoyé » = en attente de signature côté client.
    await setItemStatus(supabase, {
      dossierId,
      tenantId,
      cabinetId,
      userId,
      type,
      target: "envoye",
    });

    await supabase.from("timeline_events").insert({
      tenant_id: tenantId,
      cabinet_id: cabinetId,
      dossier_id: dossierId,
      event_type: "compliance_review",
      actor_user_id: userId,
      actor_type: "engineer",
      title: `${labelForType(type)} · envoyée en signature électronique`,
      description: `Signature Yousign demandée à ${bundle.clientEmail} (réf. ${yResult.signatureRequestId}).`,
      visibility: "internal_only",
    });

    revalidatePath(`/dossiers/${dossierId}/conformite`);
    revalidatePath(`/dossiers/${dossierId}`);

    return { ok: true, status: "envoye", signatureRequestId: yResult.signatureRequestId };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Échec de la mise en signature",
    };
  }
}

/**
 * Renvoie le PDF généré d'une pièce (DER / Lettre de mission) en base64, pour
 * l'aperçu / téléchargement « Consulter ». Renvoie null si le type n'a pas de
 * PDF généré ou si le dossier est hors scope.
 */
export async function getConformitePdfBase64(
  dossierId: string,
  type: ConformiteType,
): Promise<{ ok: true; filename: string; base64: string } | { ok: false; reason: string }> {
  if (!CONFORMITE_TYPES.includes(type)) return { ok: false, reason: "Type inconnu" };
  if (!PDF_GENERATED_TYPES.includes(type)) {
    return { ok: false, reason: "Aperçu PDF indisponible pour cette pièce" };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, reason: "Base de données non configurée" };
  }
  try {
    const supabase = createAdminClient();
    const owner = await resolveOwner(supabase, dossierId);
    if (!owner) return { ok: false, reason: "Dossier introuvable" };

    const bundle = await loadDossierBundle(supabase, dossierId, owner.cabinetId);
    if (!bundle) return { ok: false, reason: "Données dossier introuvables" };

    const pdf = await buildConformitePdf(type, bundle.pdfInput);
    if (!pdf) return { ok: false, reason: "Génération du PDF impossible" };

    return {
      ok: true,
      filename: `${pdfFileLabel(type)}-${dossierId.slice(0, 8).toUpperCase()}.pdf`,
      base64: bytesToBase64(pdf),
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Échec de la génération",
    };
  }
}
