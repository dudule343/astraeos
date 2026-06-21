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
import { engineerSlugFromContext, getValidAccessToken } from "@/lib/google-oauth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MOIS_RDV: Record<string, number> = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
  décembre: 11, decembre: 11,
};

/** "Vendredi 15 mai 2026" + "09:00 – 10:00" → dateTime locaux Europe/Paris pour
 *  l'event Google (sans Z : Google interprète avec le timeZone fourni). */
function slotToGoogleTimes(
  dateLabel: string,
  timeLabel: string,
): { start: string; end: string } | null {
  const md = dateLabel.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/);
  const mt = timeLabel.match(/(\d{1,2}):(\d{2})/);
  if (!md || !mt) return null;
  const month = MOIS_RDV[md[2].toLowerCase()];
  if (month === undefined) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  const ymd = `${md[3]}-${pad(month + 1)}-${pad(Number(md[1]))}`;
  const hh = Number(mt[1]);
  return {
    start: `${ymd}T${pad(hh)}:${mt[2]}:00`,
    end: `${ymd}T${pad(hh + 1)}:${mt[2]}:00`,
  };
}

/** Crée l'événement dans le Google Agenda de l'ingénieur connecté (sync façon
 *  Calendly). Best-effort : false si Google non connecté / erreur. */
async function syncToGoogleCalendar(
  ctx: { userId: string; tenantId: string },
  args: { nom: string; email: string; dateLabel: string; timeLabel: string; visioUrl: string; dciUrl: string },
): Promise<boolean> {
  try {
    const engineer = engineerSlugFromContext(ctx);
    const accessToken = await getValidAccessToken(engineer, ctx.tenantId);
    if (!accessToken || accessToken === "demo-token-not-real") return false;
    const times = slotToGoogleTimes(args.dateLabel, args.timeLabel);
    if (!times) return false;
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: `Entretien initial · ${args.nom}`,
          description: `Rendez-vous pris en ligne.\nProspect : ${args.nom} (${args.email})\nVisioconférence : ${args.visioUrl}\nDocument de collecte (DCI) : ${args.dciUrl}`,
          location: args.visioUrl,
          start: { dateTime: times.start, timeZone: "Europe/Paris" },
          end: { dateTime: times.end, timeZone: "Europe/Paris" },
          attendees: [{ email: args.email }],
        }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

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
      googleSynced: boolean;
    }
  | { ok: false; reason: string };

export async function bookRdv(input: BookRdvInput): Promise<BookRdvResult> {
  const email = input.email.trim();
  const nom = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
  if (!nom) return { ok: false, reason: "Renseignez votre nom." };
  if (!EMAIL_RE.test(email)) return { ok: false, reason: "Adresse e-mail invalide." };

  const prospectSlug = slug(nom) || "prospect";
  const room = `rdv-${prospectSlug}-initial`;
  const visioUrl = `${canonicalOrigin()}/visio/${room}?role=client`;
  // Le lien DCI porte l'identité prospect (?prospect=&name=) pour que la
  // soumission soit rattachée au bon prospect dans dci_submissions.
  const dciUrl = `${canonicalOrigin()}/parcours/dci-complet?prospect=${encodeURIComponent(
    prospectSlug,
  )}&name=${encodeURIComponent(nom)}`;

  const ctx = await getSessionContext();

  // 1. Persistance : le prospect + son RDV dans dci_submissions (kind='rdv'),
  //    scopé au cabinet (legacy/contexte par défaut) → apparaît dans /prospects.
  let persisted = false;
  try {
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

  // 2. Synchronisation Google Agenda de l'ingénieur (façon Calendly), si connecté.
  let googleSynced = false;
  if (ctx) {
    googleSynced = await syncToGoogleCalendar(ctx, {
      nom,
      email,
      dateLabel: input.dateLabel,
      timeLabel: input.timeLabel,
      visioUrl,
      dciUrl,
    });
  }

  // 3. E-mail de confirmation au CLIENT.
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
    googleSynced,
  };
}
