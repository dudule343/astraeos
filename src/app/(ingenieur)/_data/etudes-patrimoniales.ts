/**
 * Module PUR de l'outil « Études patrimoniales » (espace ingénieur).
 *
 * AUCUN import serveur ici (pas de next/headers, getSessionContext,
 * createAdminClient, supabase/server) : ce fichier est importé par les
 * composants client (ex. CreerEtudeButton) ET par le module serveur. Il porte
 * les types du jeu de données de l'audit, les types de liste/détail/bloc, les
 * libellés et helpers purs, ainsi que la fabrique d'un jeu de données vide
 * (état honnête : tout ce qui n'existe pas en base reste à compléter).
 *
 * Les vraies données sont lues par `etudes-patrimoniales-server.ts` (module
 * serveur) et écrites par les server actions (etudes-patrimoniales/actions.ts).
 */

// ---------------------------------------------------------------------------
// Statut de l'étude (enum DB : etudes_patrimoniales.statut)
// ---------------------------------------------------------------------------

export type EtudeStatut = "brouillon" | "en_cours" | "validee" | "restituee";

export const ETUDE_STATUT_LABELS: Record<EtudeStatut, string> = {
  brouillon: "Brouillon",
  en_cours: "En cours",
  validee: "Validée",
  restituee: "Restituée",
};

/** Style de badge par statut (couplets repris de la charte ingénieur). */
export type EtudeStatutVariant = "info" | "goldStrong" | "gold" | "green";

export const ETUDE_STATUT_VARIANT: Record<EtudeStatut, EtudeStatutVariant> = {
  brouillon: "info",
  en_cours: "goldStrong",
  validee: "gold",
  restituee: "green",
};

export function statutLabel(statut: string): string {
  return ETUDE_STATUT_LABELS[statut as EtudeStatut] ?? statut;
}

// ---------------------------------------------------------------------------
// Jeu de données de l'audit (colonne JSONB `donnees`)
// ---------------------------------------------------------------------------

/** Une personne physique du foyer (rôle A ou B), valeurs DB exactes. */
export type EtudePersonne = {
  role: "person_a" | "person_b";
  prenom: string;
  nom: string;
  birthName: string | null;
  birthDate: string | null; // ISO yyyy-mm-dd
  birthCity: string | null;
  nationality: string | null;
  profession: string | null;
  employer: string | null;
  employmentStatus: string | null;
  tmi: number | null;
  phone: string | null;
  email: string | null;
};

/** Composition et régime du foyer (pré-rempli depuis `clients`). */
export type EtudeFoyer = {
  householdType: string | null;
  maritalRegime: string | null;
  marriageDate: string | null; // ISO yyyy-mm-dd
  adresse: string | null;
  nbChildren: number | null;
  nbDependents: number | null;
  taxResidency: string | null;
  personnes: EtudePersonne[];
};

/** Un objectif patrimonial (3 par étude). Titre/description édités par l'ingénieur. */
export type EtudeObjectif = {
  titre: string;
  description: string | null;
};

/** Profil de risque du client (depuis le questionnaire de qualification). */
export type EtudeRisque = {
  profil: string | null;
  horizon: string | null;
  esgActif: boolean | null;
  esgPrivilegier: string[];
  esgEviter: string[];
};

/** Un produit placé au cabinet pour ce client (depuis les souscriptions). */
export type EtudeProduit = {
  souscriptionId: string | null;
  nom: string | null;
  /** catégorie DB (av_multisupport, scpi, per, …) — libellée à l'affichage. */
  categorie: string;
  partenaire: string | null;
  montantInitial: number | null;
  dateSouscription: string | null; // ISO
  statut: string | null;
};

/**
 * Jeu de données complet de l'audit.
 * - foyer / risque / produits : pré-remplis depuis le réel quand il existe.
 * - objectifs : 3 cadres à compléter par l'ingénieur.
 * - valeurs : dictionnaire des MONTANTS du patrimoine (brut/net/passif/budget…)
 *   qui n'existent pas en base — nuls par défaut, l'ingénieur les saisit.
 */
export type EtudeDonnees = {
  foyer: EtudeFoyer;
  objectifs: EtudeObjectif[];
  risque: EtudeRisque;
  produits: EtudeProduit[];
  valeurs: Record<string, string | number | null>;
};

// ---------------------------------------------------------------------------
// Liste / détail / état de bloc
// ---------------------------------------------------------------------------

/** Ligne de la liste « Études patrimoniales ». */
export type EtudeListItem = {
  id: string;
  clientId: string | null;
  clientNom: string;
  titre: string;
  statut: EtudeStatut;
  createdAt: string | null; // ISO
  updatedAt: string | null; // ISO
  /** date d'affichage « jj/mm/aaaa » dérivée de createdAt. */
  dateLabel: string;
};

/** État d'un bloc d'audit (validation horodatée + contenu édité). */
export type BlocState = {
  blocKey: string;
  contenuEdite: string | null;
  valide: boolean;
  validePar: string | null;
  valideAt: string | null; // ISO
};

/** Étude complète : entête + jeu de données + état des blocs. */
export type EtudeDetail = {
  id: string;
  clientId: string | null;
  dossierId: string | null;
  titre: string;
  statut: EtudeStatut;
  donnees: EtudeDonnees;
  blocs: BlocState[];
  createdAt: string | null;
  updatedAt: string | null;
};

/** Élément sélectionnable dans le flux « Créer une étude ». */
export type EtudeClientPickerItem = {
  id: string;
  nom: string;
  /** détail du foyer (adresse · situation) pour distinguer deux homonymes. */
  foyer: string;
};

// ---------------------------------------------------------------------------
// Montants éditables du patrimoine — clés par défaut (état vide)
// ---------------------------------------------------------------------------

/**
 * Clés du dictionnaire `valeurs`. Ces montants ne sont pas en base : ils sont
 * nuls à la création et saisis par l'ingénieur dans le document d'audit. La
 * liste sert de socle commun entre le seed et le document.
 */
export const DEFAULT_VALEUR_KEYS = [
  "patrimoine_brut",
  "patrimoine_net",
  "passif_total",
  "residence_principale",
  "immobilier_locatif",
  "immobilier_professionnel",
  "actifs_financiers",
  "assurance_vie",
  "liquidites",
  "epargne_disponible",
  "actifs_professionnels",
  "revenus_annuels_foyer",
  "charges_annuelles",
  "capacite_epargne_mensuelle",
  "credit_capital_restant",
  "credit_mensualite",
] as const;

/** Dictionnaire de montants vide (toutes les clés par défaut à null). */
export function emptyValeurs(): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const key of DEFAULT_VALEUR_KEYS) out[key] = null;
  return out;
}

/** Trois cadres d'objectifs vides (titre + description à compléter). */
export function emptyObjectifs(): EtudeObjectif[] {
  return [
    { titre: "", description: null },
    { titre: "", description: null },
    { titre: "", description: null },
  ];
}

/** Foyer vide (aucune personne, tous les champs nuls). */
export function emptyFoyer(): EtudeFoyer {
  return {
    householdType: null,
    maritalRegime: null,
    marriageDate: null,
    adresse: null,
    nbChildren: null,
    nbDependents: null,
    taxResidency: null,
    personnes: [],
  };
}

/** Jeu de données entièrement vide (étude sans client réel rattaché). */
export function emptyEtudeDonnees(): EtudeDonnees {
  return {
    foyer: emptyFoyer(),
    objectifs: emptyObjectifs(),
    risque: {
      profil: null,
      horizon: null,
      esgActif: null,
      esgPrivilegier: [],
      esgEviter: [],
    },
    produits: [],
    valeurs: emptyValeurs(),
  };
}

// ---------------------------------------------------------------------------
// Normalisation du JSONB lu en base
// ---------------------------------------------------------------------------

function asString(v: unknown): string | null {
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  return null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function normalizePersonne(raw: unknown): EtudePersonne {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    role: r.role === "person_b" ? "person_b" : "person_a",
    prenom: asString(r.prenom) ?? "",
    nom: asString(r.nom) ?? "",
    birthName: asString(r.birthName),
    birthDate: asString(r.birthDate),
    birthCity: asString(r.birthCity),
    nationality: asString(r.nationality),
    profession: asString(r.profession),
    employer: asString(r.employer),
    employmentStatus: asString(r.employmentStatus),
    tmi: asNumber(r.tmi),
    phone: asString(r.phone),
    email: asString(r.email),
  };
}

function normalizeFoyer(raw: unknown): EtudeFoyer {
  const r = (raw ?? {}) as Record<string, unknown>;
  const personnes = Array.isArray(r.personnes) ? r.personnes.map(normalizePersonne) : [];
  return {
    householdType: asString(r.householdType),
    maritalRegime: asString(r.maritalRegime),
    marriageDate: asString(r.marriageDate),
    adresse: asString(r.adresse),
    nbChildren: asNumber(r.nbChildren),
    nbDependents: asNumber(r.nbDependents),
    taxResidency: asString(r.taxResidency),
    personnes,
  };
}

function normalizeObjectifs(raw: unknown): EtudeObjectif[] {
  if (!Array.isArray(raw)) return emptyObjectifs();
  const out = raw.map((o) => {
    const r = (o ?? {}) as Record<string, unknown>;
    return { titre: asString(r.titre) ?? "", description: asString(r.description) };
  });
  // L'audit attend toujours trois cadres.
  while (out.length < 3) out.push({ titre: "", description: null });
  return out.slice(0, 3);
}

function normalizeProduit(raw: unknown): EtudeProduit {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    souscriptionId: asString(r.souscriptionId),
    nom: asString(r.nom),
    categorie: asString(r.categorie) ?? "autre",
    partenaire: asString(r.partenaire),
    montantInitial: asNumber(r.montantInitial),
    dateSouscription: asString(r.dateSouscription),
    statut: asString(r.statut),
  };
}

function normalizeValeurs(raw: unknown): Record<string, string | number | null> {
  const out = emptyValeurs();
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
      else if (typeof value === "string") out[key] = value;
      else if (value === null) out[key] = null;
    }
  }
  return out;
}

/**
 * Reconstruit un EtudeDonnees sûr depuis le JSONB stocké (qui peut être partiel
 * ou plus ancien que la forme courante). Toute valeur manquante retombe sur
 * l'état vide — jamais d'exception.
 */
export function normalizeEtudeDonnees(raw: unknown): EtudeDonnees {
  if (!raw || typeof raw !== "object") return emptyEtudeDonnees();
  const r = raw as Record<string, unknown>;
  return {
    foyer: normalizeFoyer(r.foyer),
    objectifs: normalizeObjectifs(r.objectifs),
    risque: {
      profil: asString((r.risque as Record<string, unknown> | undefined)?.profil),
      horizon: asString((r.risque as Record<string, unknown> | undefined)?.horizon),
      esgActif:
        typeof (r.risque as Record<string, unknown> | undefined)?.esgActif === "boolean"
          ? ((r.risque as Record<string, unknown>).esgActif as boolean)
          : null,
      esgPrivilegier: asStringArray((r.risque as Record<string, unknown> | undefined)?.esgPrivilegier),
      esgEviter: asStringArray((r.risque as Record<string, unknown> | undefined)?.esgEviter),
    },
    produits: Array.isArray(r.produits) ? r.produits.map(normalizeProduit) : [],
    valeurs: normalizeValeurs(r.valeurs),
  };
}

// ---------------------------------------------------------------------------
// Helpers purs d'affichage
// ---------------------------------------------------------------------------

/** Date ISO → « jj/mm/aaaa », « — » si absente / invalide. */
export function formatEtudeDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Nom d'affichage du foyer à partir des personnes du jeu de données. */
export function householdNameFromDonnees(donnees: EtudeDonnees): string {
  const personnes = donnees.foyer.personnes;
  if (personnes.length === 0) return "Foyer sans nom";
  const a = personnes.find((p) => p.role === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role === "person_b");
  const lastName = (a.nom ?? "").trim();
  const aFirst = (a.prenom ?? "").trim();
  if (b) {
    const lead = [aFirst, (b.prenom ?? "").trim()].filter(Boolean).join(" & ");
    return `${lead} ${lastName}`.trim() || "Foyer sans nom";
  }
  return `${aFirst} ${lastName}`.trim() || "Foyer sans nom";
}
