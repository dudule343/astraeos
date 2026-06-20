"use server";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

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
  attendees: { nom: string; email: string }[];
};

export type CreateRdvResult =
  | {
      ok: true;
      /** true si la ligne a réellement été insérée en base */
      persisted: boolean;
      /** salle visio déterministe (null si format non visio) */
      room: string | null;
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

export async function createRdv(input: CreateRdvInput): Promise<CreateRdvResult> {
  const clientNom = input.clientNom.trim();
  if (!clientNom) {
    return { ok: false, reason: "Renseignez le client ou le prospect du rendez-vous." };
  }

  const room = input.format === "visio" ? roomForRdv(clientNom, input.type) : null;
  const videoRoomUrl = room ? `/visio/${room}?role=engineer` : null;

  // Sans Supabase configuré : pas d'insert possible, on valide quand même.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: true,
      persisted: false,
      room,
      message: `RDV ${clientNom} validé. La persistance sera active une fois la base connectée.`,
    };
  }

  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return {
        ok: true,
        persisted: false,
        room,
        message: `RDV ${clientNom} validé (session non résolue, non enregistré en base).`,
      };
    }

    const supabase = createAdminClient();

    // `rdv.dossier_id` est NOT NULL : on rattache au dossier le plus récent du
    // cabinet. S'il n'y en a pas, l'insert ne peut pas respecter la FK.
    const { data: dossier } = await supabase
      .from("dossiers")
      .select("id")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("stage_entered_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!dossier?.id) {
      return {
        ok: true,
        persisted: false,
        room,
        message: `RDV ${clientNom} validé. Aucun dossier ouvert à rattacher : crée d'abord un espace client pour l'enregistrer.`,
      };
    }

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
      duration_minutes: dureeToMinutes(input.duree),
      status: "scheduled",
      video_room_url: videoRoomUrl,
      attendees: JSON.stringify([{ nom: clientNom, role: "client" }, ...attendees]),
    });

    if (error) {
      return { ok: false, reason: error.message };
    }

    return {
      ok: true,
      persisted: true,
      room,
      message: room
        ? `RDV ${clientNom} créé · salle visio prête.`
        : `RDV ${clientNom} créé et ajouté à votre agenda.`,
    };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Création du RDV impossible.",
    };
  }
}
