// Module SERVEUR de l'écran « Profil & agréments ».
//
// IMPORTÉ UNIQUEMENT par la page serveur (profil/page.tsx). JAMAIS par un
// composant client : il importe getSessionContext + createAdminClient.
//
// Source unique : la ligne `users` de l'ingénieur connecté (identité, ORIAS,
// spécialités, rôle, dernière connexion) ⨝ son `cabinet` (raison sociale,
// adresse, RC pro). On dérive de ces données réelles le bandeau identité,
// l'identité personnelle, les agréments, les spécialités et la signature.
//
// Les blocs sans colonne dédiée en base (formation/diplômes, préférences de
// notifications) gardent les valeurs de la maquette : ils restent honnêtes et
// éditables côté client le temps de la session. Dégrade proprement sur la
// maquette v28 complète quand la base n'est pas configurée, sans session, ou
// si l'ingénieur n'est pas retrouvé.

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import { getProfilScreen, type ProfilScreen } from "./profil";

type RawUser = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  orias_number: string | null;
  specialties: string[] | null;
  last_login_at: string | null;
  created_at: string | null;
};

type RawCabinet = {
  name: string | null;
  address_street: string | null;
  address_city: string | null;
  address_zipcode: string | null;
  orias_number: string | null;
  rc_pro_insurer: string | null;
  rc_pro_expiry_date: string | null;
} | null;

const ROLE_LABELS: Record<string, string> = {
  engineer: "Ingénieur patrimonial",
  cabinet_director: "Dirigeant-praticien",
  cabinet_admin: "Administrateur de cabinet",
  network_admin: "Administrateur réseau",
};

function initialsOf(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return `${a}${b}`.toUpperCase() || "??";
}

function fullNameOf(first: string, last: string): string {
  const f = first.trim();
  const l = last.trim().toUpperCase();
  return `${f} ${l}`.trim();
}

function formatDateFr(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatDateTimeFr(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const date = formatDateFr(iso);
  const heure = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(d)
    .replace(":", "h");
  return `${date} · ${heure}`;
}

/**
 * Écran « Profil & agréments » construit à partir de l'ingénieur réellement
 * connecté. Retombe sur la maquette complète (getProfilScreen) si la base
 * n'est pas joignable ou l'utilisateur introuvable.
 */
export async function fetchProfilScreen(): Promise<ProfilScreen> {
  const fallback = getProfilScreen();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return fallback;

  const ctx = await getSessionContext();
  if (!ctx) return fallback;

  try {
    const supabase = createAdminClient();

    const [{ data: userRow }, { data: cabinetRow }] = await Promise.all([
      supabase
        .from("users")
        .select(
          "first_name, last_name, email, phone, role, orias_number, specialties, last_login_at, created_at",
        )
        .eq("id", ctx.userId)
        .maybeSingle(),
      supabase
        .from("cabinets")
        .select(
          "name, address_street, address_city, address_zipcode, orias_number, rc_pro_insurer, rc_pro_expiry_date",
        )
        .eq("id", ctx.cabinetId)
        .maybeSingle(),
    ]);

    const user = userRow as RawUser | null;
    if (!user || !user.first_name || !user.last_name) return fallback;

    const cabinet = cabinetRow as RawCabinet;

    return buildScreen(user, cabinet, fallback);
  } catch {
    return fallback;
  }
}

function buildScreen(
  user: RawUser,
  cabinet: RawCabinet,
  fallback: ProfilScreen,
): ProfilScreen {
  const first = user.first_name ?? "";
  const last = user.last_name ?? "";
  const initiales = initialsOf(first, last);
  const nomComplet = fullNameOf(first, last);
  const roleLabel = ROLE_LABELS[user.role ?? ""] ?? fallback.identite.role;
  const cabinetName = cabinet?.name?.trim() || "";

  const role = cabinetName
    ? `${roleLabel} · ${cabinetName}`
    : roleLabel;

  const membreDepuis = (() => {
    const since = formatDateFr(user.created_at);
    return since
      ? `Membre PRIVEOS depuis le ${since}`
      : fallback.identite.membreDepuis;
  })();

  const derniereConnexion =
    formatDateTimeFr(user.last_login_at) ?? fallback.identite.derniereConnexion;

  // ── Adresse du cabinet ───────────────────────────────────────────────────
  const adresseCabinet = (() => {
    const street = cabinet?.address_street?.trim();
    const cp = cabinet?.address_zipcode?.trim();
    const ville = cabinet?.address_city?.trim();
    const ligne2 = [cp, ville].filter(Boolean).join(" ");
    const lignes = [street, ligne2].filter(Boolean);
    return lignes.length ? lignes.join("\n") : null;
  })();

  // ── Identité personnelle ─────────────────────────────────────────────────
  const identitePersonnelle: ProfilScreen["identitePersonnelle"] = [
    { label: "Nom", value: last.toUpperCase() },
    { label: "Prénom", value: first },
    user.email ? { label: "Email professionnel", value: user.email } : null,
    user.phone ? { label: "Téléphone", value: user.phone } : null,
    adresseCabinet ? { label: "Adresse cabinet", value: adresseCabinet } : null,
  ].filter((x): x is { label: string; value: string } => x !== null);

  // ── Agréments réglementaires (dérivés des n° ORIAS réels) ────────────────
  const oriasNum = user.orias_number?.trim() || cabinet?.orias_number?.trim();
  const agrements: ProfilScreen["agrements"] = [];
  if (oriasNum) {
    agrements.push({
      titre: "CIF · Conseiller en investissements financiers",
      detail: `Enregistré ORIAS n° ${oriasNum} · délivré sous le contrôle de l'AMF`,
      statut: "Valide",
    });
    agrements.push({
      titre: "IAS · Intermédiaire en assurance",
      detail: `N° ORIAS ${oriasNum}`,
      statut: "Valide",
    });
  }
  if (cabinet?.rc_pro_insurer) {
    const expiry = formatDateFr(cabinet.rc_pro_expiry_date);
    agrements.push({
      titre: "RC Pro · Responsabilité civile professionnelle",
      detail: expiry
        ? `${cabinet.rc_pro_insurer} · valide jusqu'au ${expiry}`
        : `${cabinet.rc_pro_insurer}`,
      statut: "Valide",
    });
  }

  // Quand l'ingénieur réel est retrouvé mais que ses agréments ne sont pas
  // encore renseignés en base, on N'EMPRUNTE PAS ceux de la maquette : on
  // afficherait sinon des n° CIF/IAS inventés sous une vraie identité. On
  // dégrade vers un repère neutre, à compléter par le référent PRIVEOS.
  if (agrements.length === 0) {
    agrements.push({
      titre: "Agréments réglementaires",
      detail:
        "Aucun n° CIF / IAS / ORIAS renseigné · à compléter auprès de votre référent PRIVEOS",
      statut: "À renseigner",
    });
  }

  // ── Spécialités (tableau users.specialties) ──────────────────────────────
  // Même principe : pas de spécialités fictives héritées de la maquette quand
  // l'ingénieur réel n'en a pas encore déclaré. Liste vide → la carte le montre.
  const specialites =
    user.specialties && user.specialties.length > 0 ? user.specialties : [];

  // ── Signature email (dérivée de l'identité réelle) ───────────────────────
  const contactParts = [
    user.email ? `📧 ${user.email}` : null,
    user.phone ? `📞 ${user.phone}` : null,
  ].filter(Boolean);

  const piedLignes = [
    cabinetName || null,
    adresseCabinet ? adresseCabinet.replace("\n", " · ") : null,
    oriasNum ? `ORIAS ${oriasNum} · membre PRIVEOS` : "membre PRIVEOS",
  ].filter(Boolean);

  const signature: ProfilScreen["signature"] = {
    initiales,
    nom: nomComplet,
    titre: role,
    contact: contactParts.length
      ? contactParts.join(" · ")
      : fallback.signature.contact,
    lienRdv: fallback.signature.lienRdv,
    pied: piedLignes.join("\n"),
  };

  return {
    ...fallback,
    identite: {
      initiales,
      nomComplet,
      role,
      membreDepuis,
      statutBadge: fallback.identite.statutBadge,
      derniereConnexion,
    },
    identitePersonnelle:
      identitePersonnelle.length > 0
        ? identitePersonnelle
        : fallback.identitePersonnelle,
    agrements,
    specialites,
    signature,
  };
}
