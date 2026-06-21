"use server";

// Confirmation d'une prise de rendez-vous prospect depuis /parcours/rendez-vous.
// Rend le flux RÉEL (la maquette ne faisait qu'afficher un écran) :
//  - génère une salle visio déterministe (Jitsi auto-hébergé, via /visio/[room]) ;
//  - envoie un e-mail de confirmation au prospect (Resend, depuis astraeos.fr) avec
//    le lien de visioconférence + le lien du DCI à compléter.
// Public (prospect non connecté) : aucune session requise.

import { buildRdvConfirmationEmail } from "@/lib/rdv-email";

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
      emailSent: boolean;
      emailError: string | null;
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

  let emailSent = false;
  let emailError: string | null = null;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";
  if (!apiKey) {
    emailError = "E-mail non configuré (RESEND_API_KEY manquant).";
  } else {
    const { subject, html } = buildRdvConfirmationEmail({
      prenomNom: nom,
      typeLabel: "Entretien initial",
      dateLabel: input.dateLabel,
      heure: input.timeLabel,
      duree: "1 heure",
      lieu: "Visioconférence sécurisée (lien ci-dessous)",
      joinUrl: visioUrl,
      documents: [
        { label: "Compléter mon document de collecte (DCI)", url: dciUrl },
      ],
      message: `Bonjour ${input.firstName.trim()},\n\nVotre rendez-vous est confirmé. Le jour de l'entretien, cliquez sur le bouton ci-dessous pour rejoindre la visioconférence (aucune installation nécessaire). Merci de compléter au préalable le document de collecte pour préparer notre échange.`,
    });
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: email, subject, html }),
      });
      const payload = (await resp.json().catch(() => ({}))) as { message?: string; name?: string };
      if (resp.ok) emailSent = true;
      else emailError = payload.message || payload.name || `Resend HTTP ${resp.status}`;
    } catch {
      emailError = "Échec de l'envoi de l'e-mail.";
    }
  }

  return { ok: true, room, visioUrl, dciUrl, emailSent, emailError };
}
