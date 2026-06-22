import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  getPartenairesScreen as getPartenairesMock,
  type Apporteur,
  type PartenaireReco,
  type PartenairesScreen,
  type ProfilVariant,
} from "./partenaires";

/**
 * Module SERVEUR de l'écran « Partenaires & apporteurs d'affaires ».
 *
 * Lit la table RÉELLE `public.partenaires` (carnet du cabinet, scope tenant +
 * cabinet) et fusionne les entrées persistées dans l'écran de la maquette : les
 * partenaires créés via la modale « Nouveau partenaire » réapparaissent en tête
 * de la bonne section (recommandables vs apporteurs).
 *
 * Best-effort : si Supabase n'est pas configuré, si la session manque, ou si la
 * table n'existe pas encore (migration 20260622_partenaires.sql non appliquée),
 * on dégrade proprement vers l'écran de maquette — jamais un plantage.
 */

export type PartenaireRecord = {
  id: string;
  nom: string | null;
  type: string | null;
  email: string | null;
  telephone: string | null;
  note: string | null;
  created_at: string;
};

/** Le `profil` saisi côté UI est l'un des ProfilVariant connus. */
function asProfilVariant(value: string | null): ProfilVariant {
  switch (value) {
    case "notaire":
    case "avocat":
    case "expert-comptable":
    case "agent-immo":
    case "ambassadeur":
    case "media":
      return value;
    default:
      return "notaire";
  }
}

const PROFIL_LABEL: Record<ProfilVariant, string> = {
  notaire: "Notaire",
  avocat: "Avocat",
  "expert-comptable": "Expert-comptable",
  "agent-immo": "Agent immo",
  ambassadeur: "Client ambassadeur",
  media: "Média / influence",
};

/**
 * Le formulaire encode `type` ("reco" | "apporteur") + `profil` (ProfilVariant)
 * dans la colonne libre `partenaires.type`, sous la forme "reco:notaire". On
 * décode ici pour router la ligne vers la bonne section avec le bon badge.
 */
function decodeType(raw: string | null): { section: "reco" | "apporteur"; profil: ProfilVariant } {
  const [section, profil] = (raw ?? "").split(":");
  return {
    section: section === "apporteur" ? "apporteur" : "reco",
    profil: asProfilVariant(profil ?? null),
  };
}

/**
 * `note` regroupe « localisation · spécialité » (cf. buildNote côté action).
 * On déplie en best-effort : 1er segment = localisation, reste = spécialité.
 */
function splitNote(note: string | null): { localisation: string; specialite: string } {
  const segments = (note ?? "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return { localisation: "—", specialite: "—" };
  if (segments.length === 1) return { localisation: "—", specialite: segments[0] };
  return { localisation: segments[0], specialite: segments.slice(1).join(" · ") };
}

function toReco(rec: PartenaireRecord, profil: ProfilVariant): PartenaireReco {
  const { localisation, specialite } = splitNote(rec.note);
  return {
    nom: rec.nom?.trim() || "Nouveau partenaire",
    structure: "Ajouté au carnet du cabinet",
    profession: PROFIL_LABEL[profil],
    professionVariant: profil,
    localisation,
    specialite,
    dossiersTraites2026: "0",
    dossiersGold: false,
  };
}

function toApporteur(rec: PartenaireRecord, profil: ProfilVariant): Apporteur {
  return {
    nom: rec.nom?.trim() || "Nouvel apporteur",
    sousTitre: rec.note?.trim() || "Ajouté au carnet du cabinet",
    profil: PROFIL_LABEL[profil],
    profilVariant: profil,
    dossiers: [{ label: "Aucun dossier rattaché pour l'instant" }],
    affairesTotales: "0",
    affairesDepuis: "nouvel apporteur",
    affairesGold: false,
    caGenereCumul: "0 €",
    statutLabel: "Émergent",
    statutVariant: "info",
  };
}

function mergeScreen(base: PartenairesScreen, records: PartenaireRecord[]): PartenairesScreen {
  if (records.length === 0) return base;

  const reco: PartenaireReco[] = [];
  const apporteurs: Apporteur[] = [];

  for (const rec of records) {
    const { section, profil } = decodeType(rec.type);
    if (section === "apporteur") apporteurs.push(toApporteur(rec, profil));
    else reco.push(toReco(rec, profil));
  }

  return {
    ...base,
    reco: {
      ...base.reco,
      partenaires: [...reco, ...base.reco.partenaires],
    },
    apporteurs: {
      ...base.apporteurs,
      liste: [...apporteurs, ...base.apporteurs.liste],
    },
  };
}

export async function getPartenairesScreen(): Promise<PartenairesScreen> {
  const base = getPartenairesMock();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return base;

  try {
    const ctx = await getSessionContext();
    if (!ctx) return base;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("partenaires")
      .select("id, nom, type, email, telephone, note, created_at")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("created_at", { ascending: false });

    // Table absente (migration non appliquée) ou erreur → repli propre.
    if (error || !data) return base;

    return mergeScreen(base, data as PartenaireRecord[]);
  } catch {
    return base;
  }
}
