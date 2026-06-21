"use server";

// Confirmation d'une prise de rendez-vous prospect depuis /parcours/rendez-vous.
// Rend le flux RÉEL (la maquette ne faisait qu'afficher un écran) :
//  - persiste le prospect + son RDV dans `dci_submissions` (kind='rdv'), scopé au
//    cabinet → visible dans l'espace /prospects de l'ingénieur ;
//  - génère une salle visio déterministe (Jitsi auto-hébergé, via /visio/[room]) ;
//  - envoie une confirmation au CLIENT et une notification à l'INGÉNIEUR (Resend,
//    depuis astraeos.fr) avec le lien de visioconférence + le lien du DCI.
// Public (prospect non connecté) : pas de session requise.

import { buildRdvConfirmationEmail } from "@/lib/rdv-email";
import { getSessionContext } from "@/lib/auth/context";
import { saveSubmission } from "@/lib/dci-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function canonicalOrigin(): string {
  const env = process.env.ASTRAEOS_PUBLIC_ORIGIN?.trim();
  return (env || "https://app.astraeos.fr").replace(/\/+$/, "");
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ sent: boolean; error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";
  if (!apiKey) return { sent: false, error: "E-mail non configuré (RESEND_API_KEY manquant)." };
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const payload = (await resp.json().catch(() => ({}))) as { message?: string; name?: string };
    if (resp.ok) return { sent: true, error: null };
    return { sent: false, error: payload.message || payload.name || `Resend HTTP ${resp.status}` };
  } catch {
    return { sent: false, error: "Échec de l'envoi de l'e-mail." };
  }
}

export type BookRdvInput = {
  firstName: string;
  lastName: string;
  email: string;
  referral?: string;
  dateLabel: string;
  timeLabel: string;
};

export type BookRdvResult =
  | {
      ok: true;
      room: string;
      visioUrl: string;
      dciUrl: string;
      persisted: boolean;
      emailSent: boolean;
      emailError: string | null;
      ingenieurNotified: boolean;
    }
  | { ok: false; reason: string };

export async function bookRdv(input: BookRdvInput): Promise<BookRdvResult> {
  const email = input.email.trim();
  const nom = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  if (!nom) return { ok: false, reason: "Renseignez votre nom." };
  if (!EMAIL_RE.test(email)) return { ok: false, reason: "Adresse e-mail invalide." };

  const room = `rdv-${slug(nom) || "prospect"}-initial`;
  const visioUrl = `${canonicalOrigin()}/visio/${room}?role=client`;
  const dciUrl = `${canonicalOrigin()}/parcours/dci-complet`;

  // 1. Persistance : le prospect + son RDV dans dci_submissions (kind='rdv'),
  //    scopé au cabinet (legacy/contexte par défaut) → apparaît dans /prospects.
  let persisted = false;
  try {
    const ctx = await getSessionContext();
    await saveSubmission({
      prospect_slug: slug(nom) || "prospect",
      kind: "rdv",
      payload: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        referral: input.referral?.trim() || null,
        dateLabel: input.dateLabel,
        timeLabel: input.timeLabel,
        format: "visio",
        visioRoom: room,
        visioUrl,
        source: "parcours/rendez-vous",
      },
      display_name: nom,
      submitted_at: new Date().toISOString(),
      tenant_id: ctx?.tenantId ?? null,
      cabinet_id: ctx?.cabinetId ?? null,
    });
    persisted = true;
  } catch {
    // best-effort : un échec de persistance ne bloque pas la confirmation client.
  }

  // 2. E-mail de confirmation au CLIENT.
  const client = buildRdvConfirmationEmail({
    prenomNom: nom,
    typeLabel: "Entretien initial",
    dateLabel: input.dateLabel,
    heure: input.timeLabel,
    duree: "1 heure",
    lieu: "Visioconférence sécurisée (lien ci-dessous)",
    joinUrl: visioUrl,
    documents: [{ label: "Compléter mon document de collecte (DCI)", url: dciUrl }],
    message: `Bonjour ${input.firstName.trim()},\n\nVotre rendez-vous est confirmé. Le jour de l'entretien, cliquez sur le bouton ci-dessous pour rejoindre la visioconférence (aucune installation nécessaire). Merci de compléter au préalable le document de collecte pour préparer notre échange.`,
  });
  const c = await sendEmail(email, client.subject, client.html);

  // 3. Notification à l'INGÉNIEUR (adresse configurée RDV_NOTIFY_EMAIL).
  let ingenieurNotified = false;
  const notify = process.env.RDV_NOTIFY_EMAIL?.trim();
  if (notify && EMAIL_RE.test(notify)) {
    const ing = buildRdvConfirmationEmail({
      prenomNom: "Luc THILLIEZ",
      typeLabel: "Entretien initial",
      dateLabel: input.dateLabel,
      heure: input.timeLabel,
      duree: "1 heure",
      lieu: "Visioconférence",
      joinUrl: visioUrl,
      documents: [{ label: "Voir le DCI du prospect", url: dciUrl }],
      message: `Nouvelle prise de rendez-vous par un prospect.\n\nProspect : ${nom}\nE-mail : ${email}${input.referral?.trim() ? `\nRecommandé par : ${input.referral.trim()}` : ""}\n\nLe prospect a reçu sa confirmation et le lien de visioconférence. Le RDV est enregistré dans votre espace prospects.`,
    });
    const i = await sendEmail(notify, `PRIVEOS · Nouveau RDV prospect · ${nom}`, ing.html);
    ingenieurNotified = i.sent;
  }

  return {
    ok: true,
    room,
    visioUrl,
    dciUrl,
    persisted,
    emailSent: c.sent,
    emailError: c.error,
    ingenieurNotified,
  };
}
