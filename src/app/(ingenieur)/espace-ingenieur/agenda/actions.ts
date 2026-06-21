"use server";

import { getSessionContext, type SessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildRdvConfirmationEmail } from "@/lib/rdv-email";
import { saveSubmission } from "@/lib/dci-store";
import { engineerSlugFromContext, getValidAccessToken } from "@/lib/google-oauth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Origine canonique serveur (jamais dérivée des en-têtes, anti-phishing). */
function canonicalOrigin(): string {
  const env = process.env.ASTRAEOS_PUBLIC_ORIGIN?.trim();
  return (env || "https://app.astraeos.fr").replace(/\/+$/, "");
}

/** Mappe un libellé de document (coché dans la modale) vers l'écran /parcours
 *  que le client ouvre depuis l'e-mail. null si pas d'écran dédié. */
const DOC_ROUTES: Record<string, string> = {
  "DCI Simplifié": "/parcours/dci-simplifie",
  "Questionnaire de qualification client": "/parcours/qualification",
  "DCI Complet": "/parcours/dci-complet",
};
function parcoursUrlFor(label: string): string | null {
  const route = DOC_ROUTES[label];
  return route ? `${canonicalOrigin()}${route}` : null;
}

/**
 * Création d'un rendez-vous depuis la modale « Nouveau RDV » de l'agenda
 * ingénieur. Le bouton « Créer le RDV + envoyer » appelle réellement cette
 * action : insert dans la table `rdv` (scope tenant/cabinet/engineer legacy,
 * comme les autres `_data/`), et génération d'une salle visio déterministe
 * quand le format est visio.
 *
 * Contrainte schéma : `rdv.dossier_id` est NOT NULL avec FK vers `dossiers`.
 * On rattache donc le RDV au dossier le plus récent du cabinet. S'il n'existe
 * aucun dossier (ou pas de Supabase configuré), l'insert est impossible
 * proprement : on retourne alors `persisted:false` et la modale confirme
 * visuellement la validation des champs (toast) au lieu d'un bouton mort.
 */

export type RdvFormat = "visio" | "presentiel" | "telephone";
export type RdvType = "initial" | "intermediaire" | "restitution" | "suivi";

export type CreateRdvInput = {
  type: RdvType;
  format: RdvFormat;
  /** libellé date affiché dans la modale, ex "Mardi 12 mai 2026" */
  dateLabel: string;
  /** heure de début, ex "14h00" */
  heureDebut: string;
  /** durée, ex "1h00", "30 min", "2h00" */
  duree: string;
  /** nom du client / prospect (existant ou nouveau) */
  clientNom: string;
  /** e-mail du client destinataire de la confirmation (vide si inconnu) */
  clientEmail: string;
  /** libellé du type de RDV affiché ("Entretien initial") */
  typeLabel: string;
  /** libellé du lieu affiché ("Cabinet · Paris 8e", "Visioconférence…") */
  lieuLabel: string;
  /** documents à envoyer/joindre, sélectionnés dans la modale */
  documents: string[];
  /** message d'accompagnement saisi par l'ingénieur */
  message: string;
  attendees: { nom: string; email: string }[];
};

export type CreateRdvResult =
  | {
      ok: true;
      /** true si la ligne a réellement été insérée en base */
      persisted: boolean;
      /** salle visio déterministe (null si format non visio) */
      room: string | null;
      /** true si l'e-mail de confirmation a réellement été envoyé via Resend */
      emailSent: boolean;
      /** destinataire de l'e-mail (null si aucune adresse) */
      emailTo: string | null;
      /** raison si l'e-mail n'a pas pu être envoyé (null si envoyé) */
      emailError: string | null;
      /** true si l'événement a réellement été créé dans le Google Agenda de l'ingénieur */
      googleSynced: boolean;
      message: string;
    }
  | { ok: false; reason: string };

/** Mappe le type métier de la modale sur l'enum DB `rdv_type`. */
const TYPE_TO_DB: Record<RdvType, string> = {
  initial: "decouverte",
  intermediaire: "collecte",
  restitution: "restitution",
  suivi: "suivi_annuel",
};

/** Durée affichée ("1h00", "30 min", "2h00", "1h30") → minutes. */
function dureeToMinutes(duree: string): number {
  const d = duree.toLowerCase().trim();
  const min = d.match(/(\d+)\s*min/);
  if (min && !d.includes("h")) return Number(min[1]);
  const h = d.match(/(\d+)\s*h\s*(\d+)?/);
  if (h) {
    const hours = Number(h[1]);
    const mins = h[2] ? Number(h[2]) : 0;
    return hours * 60 + mins;
  }
  return 60;
}

const MOIS_RDV: Record<string, number> = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
  décembre: 11, decembre: 11,
};

/** Normalise une heure de la modale ("14h00" ou "14:00") en {hh, mm}. */
function parseHeure(heure: string): { hh: number; mm: number } | null {
  const m = heure.replace("h", ":").match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { hh: Number(m[1]), mm: Number(m[2]) };
}

/** "Mardi 12 mai 2026" + heure début + durée → dateTime locaux Europe/Paris
 *  (sans Z : Google interprète avec le timeZone fourni). null si non parsable. */
function slotToGoogleTimes(
  dateLabel: string,
  heureDebut: string,
  durationMinutes: number,
): { start: string; end: string } | null {
  const md = dateLabel.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/);
  const t = parseHeure(heureDebut);
  if (!md || !t) return null;
  const month = MOIS_RDV[md[2].toLowerCase()];
  if (month === undefined) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  const ymd = `${md[3]}-${pad(month + 1)}-${pad(Number(md[1]))}`;
  const startMin = t.hh * 60 + t.mm;
  const endMin = startMin + durationMinutes;
  return {
    start: `${ymd}T${pad(t.hh)}:${pad(t.mm)}:00`,
    end: `${ymd}T${pad(Math.floor(endMin / 60))}:${pad(endMin % 60)}:00`,
  };
}

/** Libellé horaire "HH:MM – HH:MM" attendu par la grille agenda
 *  (parseRdvDate/loadRealRdvsByDate lisent ce format dans payload.timeLabel). */
function timeLabelFor(heureDebut: string, durationMinutes: number): string | null {
  const t = parseHeure(heureDebut);
  if (!t) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  const startMin = t.hh * 60 + t.mm;
  const endMin = startMin + durationMinutes;
  return `${pad(t.hh)}:${pad(t.mm)} – ${pad(Math.floor(endMin / 60))}:${pad(endMin % 60)}`;
}

/** Crée l'événement dans le Google Agenda de l'ingénieur connecté (sync façon
 *  Calendly). Best-effort : false si Google non connecté / erreur. Jamais throw. */
async function syncToGoogleCalendar(
  ctx: SessionContext,
  input: CreateRdvInput,
  room: string | null,
  durationMinutes: number,
): Promise<boolean> {
  try {
    const accessToken = await getValidAccessToken(engineerSlugFromContext(ctx), ctx.tenantId);
    if (!accessToken || accessToken === "demo-token-not-real") return false;
    const times = slotToGoogleTimes(input.dateLabel, input.heureDebut, durationMinutes);
    if (!times) return false;

    const visioUrl = room ? `${canonicalOrigin()}/visio/${room}?role=client` : null;
    const descLines = [`Rendez-vous : ${input.typeLabel} · ${input.clientNom}`];
    if (visioUrl) descLines.push(`Visioconférence : ${visioUrl}`);
    if (input.message.trim()) descLines.push("", input.message.trim());

    const clientEmail = input.clientEmail.trim();
    const attendees: { email: string }[] = [];
    if (clientEmail && EMAIL_RE.test(clientEmail)) attendees.push({ email: clientEmail });
    for (const a of input.attendees) {
      const e = a.email.trim();
      if (e && EMAIL_RE.test(e)) attendees.push({ email: e });
    }

    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: `${input.typeLabel} · ${input.clientNom}`,
          description: descLines.join("\n"),
          ...(input.format === "visio" && visioUrl ? { location: visioUrl } : {}),
          start: { dateTime: times.start, timeZone: "Europe/Paris" },
          end: { dateTime: times.end, timeZone: "Europe/Paris" },
          ...(attendees.length ? { attendees } : {}),
        }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** Slug salle : [a-z0-9-], borné à 64 chars (même règle que VisioLobby). */
function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/**
 * Salle visio déterministe à partir du client et du type. Même forme que les
 * salles des fiches RDV (`rdv-<slug>-<type>`), pour que « Rejoindre » retombe
 * sur une salle stable et lisible.
 */
function roomForRdv(clientNom: string, type: RdvType): string {
  const base = sanitizeSlug(clientNom) || "client";
  return `rdv-${base}-${type}`;
}

/**
 * Envoi de l'e-mail de confirmation au client via Resend (best-effort, jamais
 * bloquant pour la création du RDV). Reprend le pattern de /api/visio/invite
 * (POST api.resend.com/emails, RESEND_API_KEY + RESEND_FROM). Le destinataire
 * est l'adresse explicitement choisie par l'ingénieur dans la modale.
 */
async function sendConfirmationEmail(
  input: CreateRdvInput,
  room: string | null,
): Promise<{ emailSent: boolean; emailTo: string | null; emailError: string | null }> {
  const to = input.clientEmail.trim();
  if (!to) {
    return { emailSent: false, emailTo: null, emailError: "Aucune adresse e-mail connue pour ce client." };
  }
  if (!EMAIL_RE.test(to)) {
    return { emailSent: false, emailTo: to, emailError: "Adresse e-mail invalide." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";
  if (!apiKey) {
    return { emailSent: false, emailTo: to, emailError: "E-mail non configuré (RESEND_API_KEY manquant)." };
  }

  const joinUrl = room ? `${canonicalOrigin()}/visio/${room}?role=client` : null;
  const { subject, html } = buildRdvConfirmationEmail({
    prenomNom: input.clientNom,
    typeLabel: input.typeLabel,
    dateLabel: input.dateLabel,
    heure: input.heureDebut,
    duree: input.duree,
    lieu: input.lieuLabel,
    joinUrl,
    documents: input.documents.map((label) => ({ label, url: parcoursUrlFor(label) })),
    message: input.message,
  });

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const payload = (await resp.json().catch(() => ({}))) as {
      message?: string;
      name?: string;
    };
    if (!resp.ok) {
      return { emailSent: false, emailTo: to, emailError: payload.message || payload.name || `Resend HTTP ${resp.status}` };
    }
    return { emailSent: true, emailTo: to, emailError: null };
  } catch {
    return { emailSent: false, emailTo: to, emailError: "Échec de l'envoi e-mail." };
  }
}

export async function createRdv(input: CreateRdvInput): Promise<CreateRdvResult> {
  const clientNom = input.clientNom.trim();
  if (!clientNom) {
    return { ok: false, reason: "Renseignez le client ou le prospect du rendez-vous." };
  }

  const room = input.format === "visio" ? roomForRdv(clientNom, input.type) : null;
  const videoRoomUrl = room ? `/visio/${room}?role=engineer` : null;
  const durationMinutes = dureeToMinutes(input.duree);

  // Contexte de session résolu une seule fois : sert à la persistance `rdv`,
  // à la sync Google Agenda et à la persistance `dci_submissions` (grille).
  const ctx = await getSessionContext();

  // 1. Persistance best-effort en base (inchangée). On ne bloque PAS l'envoi de
  //    l'e-mail là-dessus : un RDV peut être confirmé au client même si la base
  //    n'est pas connectée ou qu'aucun dossier n'est encore rattachable.
  let persisted = false;
  let persistNote = "base non connectée";
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      if (!ctx) {
        persistNote = "session non résolue";
      } else {
        const supabase = createAdminClient();
        // `rdv.dossier_id` est NOT NULL : on rattache au dossier le plus récent
        // du cabinet. S'il n'y en a pas, l'insert ne peut pas respecter la FK.
        const { data: dossier } = await supabase
          .from("dossiers")
          .select("id")
          .eq("tenant_id", ctx.tenantId)
          .eq("cabinet_id", ctx.cabinetId)
          .order("stage_entered_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!dossier?.id) {
          persistNote = "aucun dossier ouvert à rattacher";
        } else {
          const attendees = input.attendees
            .filter((a) => a.nom.trim() || a.email.trim())
            .map((a) => ({ nom: a.nom.trim(), email: a.email.trim() }));

          const { error } = await supabase.from("rdv").insert({
            tenant_id: ctx.tenantId,
            cabinet_id: ctx.cabinetId,
            dossier_id: dossier.id,
            engineer_id: ctx.userId,
            type: TYPE_TO_DB[input.type],
            format: input.format,
            scheduled_at: new Date().toISOString(),
            duration_minutes: durationMinutes,
            status: "scheduled",
            video_room_url: videoRoomUrl,
            attendees: JSON.stringify([{ nom: clientNom, role: "client" }, ...attendees]),
          });
          if (error) {
            return { ok: false, reason: error.message };
          }
          persisted = true;
        }
      }
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : "Création du RDV impossible." };
    }
  }

  // 2. Synchronisation Google Agenda de l'ingénieur (façon Calendly), si connecté.
  //    Best-effort : un échec ne bloque ni l'e-mail ni la confirmation.
  let googleSynced = false;
  if (ctx) {
    googleSynced = await syncToGoogleCalendar(ctx, input, room, durationMinutes);
  }

  // 3. Persistance dans dci_submissions (kind='rdv') pour que le RDV apparaisse
  //    dans la grille agenda (loadRealRdvsByDate) et l'espace /prospects. La
  //    grille lit payload.dateLabel + payload.timeLabel ("HH:MM – HH:MM").
  //    Best-effort, indépendant de la persistance `rdv` ci-dessus.
  const timeLabel = timeLabelFor(input.heureDebut, durationMinutes);
  if (timeLabel) {
    try {
      await saveSubmission({
        prospect_slug: sanitizeSlug(clientNom) || "client",
        kind: "rdv",
        payload: {
          dateLabel: input.dateLabel,
          timeLabel,
          email: input.clientEmail.trim(),
          format: input.format,
          visioRoom: room,
          source: "agenda/nouveau-rdv",
        },
        display_name: clientNom,
        submitted_at: new Date().toISOString(),
        tenant_id: ctx?.tenantId ?? null,
        cabinet_id: ctx?.cabinetId ?? null,
      });
    } catch {
      // best-effort : un échec de persistance ne bloque pas la confirmation.
    }
  }

  // 4. Envoi de l'e-mail de confirmation au client (Resend), indépendant.
  const email = await sendConfirmationEmail(input, room);

  // 5. Résultat unique : statut de persistance + statut d'envoi + sync Google.
  const message = persisted
    ? `RDV ${clientNom} créé et ajouté à votre agenda.`
    : `RDV ${clientNom} validé (non enregistré : ${persistNote}).`;

  return { ok: true, persisted, room, message, googleSynced, ...email };
}
