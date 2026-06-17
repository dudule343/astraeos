// Types du cockpit visio React. Source de vérité des données DCI : @/lib/dci-schema
// (forme canonique partagée avec /api/dci/complet et la validation serveur).
// On étend ici avec les champs "de session" que l'IA ajoute en direct pendant
// l'entretien (confiance, note, surlignage live) — non persistés au schéma canonique.
import type {
  DciCanonical,
  DciField,
  DciGroup,
  DciGroupBlock,
  DciGroupPerson,
  DciGroupRepeat,
  DciSection,
  DciFieldStatus,
} from "@/lib/dci-schema";

export type {
  DciCanonical,
  DciField,
  DciGroup,
  DciGroupBlock,
  DciGroupPerson,
  DciGroupRepeat,
  DciSection,
  DciFieldStatus,
};

/** Champ enrichi en session : l'IA peut joindre une confiance, une note de
 *  divergence, et un drapeau `live` (champ tout juste mis à jour → animation). */
export type SessionField = DciField & {
  conf?: number | string;
  note?: string;
  live?: boolean;
};

/** Section enrichie : `isFinal` insère un séparateur « Clôture » dans la nav ;
 *  `stub` = section présente mais sans champs comptabilisés. */
export type SessionSection = DciSection & {
  isFinal?: boolean;
  stub?: boolean;
};

/** Snapshot complet rendu par le cockpit (mute en place dans le HTML d'origine). */
export type DciSnapshot = { sections: SessionSection[] };

/** État d'enregistrement de l'entretien. */
export type RecState = "active" | "paused" | "stopped";

/** Filtre de mise en évidence des champs DCI. */
export type DciFilter = "all" | "validated" | "ai-suggest" | "ai-disagree" | "empty";

/** Référence d'un champ en cours d'édition (indices group/field/item). */
export type EditingRef = {
  groupIdx: number;
  fieldIdx: number;
  itemIdx: number | null;
};

/** Paramètres de salle dérivés de l'URL (déjà assainis côté page.tsx). */
export type CockpitParams = {
  room: string;
  role: "engineer" | "client";
  prospect: string;
  nom: string;
  tool: "" | "meet" | "zoom";
  lien: string;
  /** URL + clé publique Supabase, pour le canal Realtime de la salle. */
  sb: string;
  sbk: string;
};
