/**
 * Moteur de collecte conditionnelle déterministe.
 *
 * Trois fonctions pures, sans IA :
 *   - deriveFacts(payload)   : DCI structuré -> Facts (situation du foyer).
 *   - selectDocuments(facts) : Facts -> sous-ensemble du CATALOG à demander.
 *   - toCollecteStructure(e) : CatalogEntry[] -> items prêts pour /api/collecte/send.
 *
 * RÈGLE D'OR (répétée partout) : DANS LE DOUTE, NE POSE PAS false.
 * Un fait n'est posé à true qu'avec une preuve de présence, à false qu'avec une
 * preuve d'absence ; sinon il reste ABSENT (inconnu) et le moteur INCLUT la pièce.
 * Conséquence : un foyer vide => toutes les pièces ressortent (collecte maximale).
 */
import type { DciCanonical, DciField, DciGroup } from "@/lib/dci-schema";

import { CATALOG } from "./collecte-catalog";
import type { CatalogEntry, FactKey, Facts } from "./collecte-catalog/types";

/* ------------------------------------------------------------------ */
/* deriveFacts                                                         */
/* ------------------------------------------------------------------ */

/** Statuts sur lesquels on accepte de FONDER un fait. */
const TRUSTED_STATUSES = new Set(["validated", "ai-agree", "ai-suggest"]);
/**
 * Statuts qui ne fixent JAMAIS un fait :
 *  - 'empty'       : champ non renseigné, on ne sait rien.
 *  - 'ai-disagree' : l'IA conteste la valeur => on reste inclusif, donc absent.
 */
const IGNORED_STATUSES = new Set(["empty", "ai-disagree"]);

/** Normalise une clé de field pour l'indexation (insensible casse/accents). */
function normKey(key: string): string {
  return key
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** value non vide après trim. */
function hasValue(field: DciField): boolean {
  return typeof field.value === "string" && field.value.trim() !== "";
}

/** Un field exploitable : statut de confiance ET non ignoré. */
function isTrusted(field: DciField): boolean {
  return TRUSTED_STATUSES.has(field.status) && !IGNORED_STATUSES.has(field.status);
}

/**
 * Preuve de PRÉSENCE : la valeur est renseignée et le statut est exploitable.
 * Ex : un IBAN saisi => detient_comptes_bancaires=true.
 */
function isFilled(field: DciField): boolean {
  return isTrusted(field) && hasValue(field);
}

const YES = new Set(["oui", "true", "vrai", "1", "yes"]);
const NO = new Set(["non", "false", "faux", "0", "no"]);

/**
 * Lecture ternaire d'un select oui/non :
 *   true  => oui explicite et exploitable (preuve de présence),
 *   false => non explicite et exploitable (preuve d'absence),
 *   undefined => vide, statut non fiable, ou valeur non interprétable (inconnu).
 */
function asBool(field: DciField): boolean | undefined {
  if (!isTrusted(field) || !hasValue(field)) return undefined;
  const v = field.value.trim().toLowerCase();
  if (YES.has(v)) return true;
  if (NO.has(v)) return false;
  return undefined;
}

interface IndexedField {
  field: DciField;
  sectionId: string;
  group: DciGroup;
}

/** Aplatit tous les fields d'un group en gardant la trace du group. */
function fieldsOf(group: DciGroup): DciField[] {
  if (group.type === "repeatable") {
    return group.items.flatMap((it) => it.fields);
  }
  return group.fields;
}

/**
 * Index des fields : map normKey -> occurrences (un même key peut exister dans
 * plusieurs sections, d'où le tableau). On garde sectionId pour lever les
 * ambiguïtés de clés homonymes (ex: "type" présent dans plusieurs rubriques).
 */
function indexFields(payload: DciCanonical): Map<string, IndexedField[]> {
  const map = new Map<string, IndexedField[]>();
  for (const section of payload.sections ?? []) {
    for (const group of section.groups ?? []) {
      for (const field of fieldsOf(group)) {
        const k = normKey(field.key);
        const entry: IndexedField = { field, sectionId: section.id, group };
        const bucket = map.get(k);
        if (bucket) bucket.push(entry);
        else map.set(k, [entry]);
      }
    }
  }
  return map;
}

/**
 * Table de correspondance field.key (normalisé) -> FactKey, pour les selects
 * oui/non interprétés en ternaire (oui=>true, non=>false, vide=>absent).
 *
 * Volontairement partielle : seuls les faits réellement portés par un champ
 * DCI booléen y figurent. Les faits non couverts (av_primes_post_70ans,
 * scpi_demembree...) restent ABSENTS => leurs pièces sont incluses, à charge
 * pour l'ingénieur de décocher.
 */
const BOOL_FIELD_TO_FACT: Record<string, FactKey> = {
  // Identité / famille
  handicap: "handicap_foyer",
  handicap_foyer: "handicap_foyer",
  mesure_protection: "mesure_protection",
  enfant_adopte: "enfant_adopte",
  enfant_decede: "enfant_decede",
  divorce: "divorce",
  divorce_client: "divorce",
  divorce_conjoint: "conjoint_divorce",

  // Budget / revenus
  effort_epargne: "effort_epargne",
  percoit_chomage: "percoit_chomage",
  percoit_dividendes: "percoit_dividendes",
  verse_pension_alimentaire: "verse_pension_alimentaire",
  verse_prestation_compensatoire: "verse_prestation_compensatoire",
  depense_importante_prevue: "depense_importante_prevue",
  rentree_argent_prevue: "rentree_argent_prevue",

  // Fiscalité
  assujetti_ifi: "assujetti_ifi",
  situation_internationale: "situation_internationale",
  actifs_financiers_etranger: "actifs_financiers_etranger",
  dispositif_fiscal_immobilier: "dispositif_fiscal_immobilier",

  // Immobilier (branchements oui/non explicites)
  bien_locatif: "immobilier_locatif",
  immobilier_locatif: "immobilier_locatif",
  locatif_loue: "locatif_loue",
  locatif_meuble: "locatif_meuble",
  travaux_residence: "travaux_residence",
  travaux_locatif: "travaux_locatif",
  projet_vente_residence: "projet_vente_residence",
  projet_vente_locatif: "projet_vente_locatif",
  detient_scpi: "detient_scpi",

  // Actifs financiers
  assurance_vie: "assurance_vie",
  detient_pea: "detient_pea",
  detient_cto: "detient_cto",
  detient_per: "detient_per",
  epargne_salariale: "epargne_salariale",
  detient_cryptoactifs: "detient_cryptoactifs",

  // Passifs
  credit_immobilier: "credit_immobilier",
  credit_conso: "credit_conso",
  credit_renouvelable: "credit_renouvelable",
  detient_creance: "detient_creance",

  // Retraite
  rachat_trimestres: "rachat_trimestres",
  retraite_supplementaire_employeur: "retraite_supplementaire_employeur",

  // Mutuelle / prévoyance
  a_mutuelle: "a_mutuelle",
  prevoyance_collective: "prevoyance_collective",
};

/**
 * Groups répétables : kind (normalisé) -> FactKey posé à true SI items.length>0.
 * On ne pose JAMAIS false sur length===0 : un répétable vide peut simplement
 * être non rempli. L'absence n'est prouvée que par un select oui/non dédié
 * (cf. BOOL_FIELD_TO_FACT) géré séparément.
 */
const REPEAT_KIND_TO_FACT: Record<string, FactKey> = {
  enfant: "a_enfants",
  enfants: "a_enfants",
  bien_locatif: "immobilier_locatif",
  locatif: "immobilier_locatif",
  credit: "credits_hors_immo",
  credit_immobilier: "credit_immobilier",
  credit_conso: "credit_conso",
  scpi: "detient_scpi",
  compte_bancaire: "detient_comptes_bancaires",
  livret: "detient_livrets",
  assurance_vie: "assurance_vie",
  pea: "detient_pea",
  cto: "detient_cto",
  per: "detient_per",
  creance: "detient_creance",
  donation: "donation_consentie_client",
  pret_familial: "prets_familiaux",
};

/**
 * deriveFacts — DCI structuré -> Facts.
 *
 * Pure et testable unitairement (un payload -> un Facts). Stratégie strictement
 * CONSERVATRICE : on ne pose un fait à true/false QUE sur preuve ; sinon absent.
 */
export function deriveFacts(payload: DciCanonical): Facts {
  const facts: Facts = {};
  if (!payload || !Array.isArray(payload.sections)) return facts;

  /**
   * Pose un fait sans jamais écraser une preuve positive par un inconnu, ni
   * un true par un false silencieux : true l'emporte (collecte inclusive).
   */
  const setFact = (key: FactKey, value: boolean) => {
    if (value === true) {
      facts[key] = true; // une preuve de présence l'emporte toujours
      return;
    }
    // value === false : ne pose false que si rien ne l'a déjà mis à true
    if (facts[key] !== true) facts[key] = false;
  };

  // (1) Index pour accès par clé + désambiguïsation par section.
  const index = indexFields(payload);

  // (2) Parcours linéaire : selects oui/non mappés, et présence par valeur.
  for (const section of payload.sections) {
    for (const group of section.groups ?? []) {
      // (5) Faits composés liés aux personnes (conjoint / enfants).
      if (group.type === "person") {
        const role = normKey(group.person?.role ?? "");
        if (role === "conjoint" || role === "partenaire" || role === "concubin") {
          setFact("a_conjoint", true);
        }
        if (role === "enfant" || role === "enfants") {
          setFact("a_enfants", true);
        }
      }

      // (4) Répétables : items présents => fait à true. Jamais false ici.
      if (group.type === "repeatable") {
        const fact = REPEAT_KIND_TO_FACT[normKey(group.kind)];
        if (fact && group.items.length > 0) setFact(fact, true);
      }

      for (const field of fieldsOf(group)) {
        if (IGNORED_STATUSES.has(field.status)) continue; // empty / ai-disagree
        const k = normKey(field.key);

        // (3a) Select oui/non mappé => preuve de présence OU d'absence.
        const mappedFact = BOOL_FIELD_TO_FACT[k];
        if (mappedFact && field.type === "select") {
          const b = asBool(field);
          if (b !== undefined) setFact(mappedFact, b);
          continue;
        }

        // (3b) Présence par valeur sur un champ non oui/non (ex: IBAN renseigné).
        const presenceFact = PRESENCE_FIELD_TO_FACT[k];
        if (presenceFact && isFilled(field)) {
          setFact(presenceFact, true);
        }
      }
    }
  }

  // (6) Situation familiale -> faits exclusifs + a_conjoint composé.
  deriveSituationFamiliale(index, setFact);
  // Statut d'occupation du logement (propriétaire/locataire/gratuit).
  deriveOccupation(index, setFact);

  // (5 bis) a_conjoint = marié || pacsé || concubin (en plus du group person).
  if (facts.marie === true || facts.pacse === true || facts.concubin === true) {
    facts.a_conjoint = true;
  }

  return facts;
}

/**
 * Champs dont la simple PRÉSENCE d'une valeur prouve un fait (preuve de présence).
 * Ex : un IBAN renseigné => le foyer détient des comptes bancaires.
 */
const PRESENCE_FIELD_TO_FACT: Record<string, FactKey> = {
  iban: "detient_comptes_bancaires",
  iban_compte: "detient_comptes_bancaires",
  numero_compte: "detient_comptes_bancaires",
};

/** Première occurrence exploitable d'une clé dans l'index. */
function firstField(
  index: Map<string, IndexedField[]>,
  key: string,
): DciField | undefined {
  const bucket = index.get(normKey(key));
  return bucket && bucket.length > 0 ? bucket[0].field : undefined;
}

/**
 * Situation familiale : un select unique (marié/pacsé/concubin/divorcé/célibataire)
 * pose les faits exclusifs correspondants. On ne pose false sur les autres que si
 * la valeur est exploitable (preuve), pas sur un champ vide.
 */
function deriveSituationFamiliale(
  index: Map<string, IndexedField[]>,
  setFact: (k: FactKey, v: boolean) => void,
) {
  const f =
    firstField(index, "situation_familiale") ??
    firstField(index, "situation_maritale") ??
    firstField(index, "statut_marital");
  if (!f || !isTrusted(f) || !hasValue(f)) return;
  const v = normKey(f.value);
  // Faits exclusifs : on pose true sur le match, false sur les concurrents prouvés.
  const isMarie = v.includes("marie");
  const isPacse = v.includes("pacs");
  const isConcubin = v.includes("concubin") || v.includes("union libre");
  const isDivorce = v.includes("divorce");
  setFact("marie", isMarie);
  setFact("pacse", isPacse);
  setFact("concubin", isConcubin);
  if (isDivorce) setFact("divorce", true);
}

/**
 * Statut d'occupation du logement d'usage : propriétaire / locataire / occupant
 * à titre gratuit, exclusifs. Posé depuis un select unique si exploitable.
 */
function deriveOccupation(
  index: Map<string, IndexedField[]>,
  setFact: (k: FactKey, v: boolean) => void,
) {
  const f =
    firstField(index, "statut_occupation") ??
    firstField(index, "occupation_residence") ??
    firstField(index, "proprietaire_locataire");
  if (!f || !isTrusted(f) || !hasValue(f)) return;
  const v = normKey(f.value);
  const proprio = v.includes("propri");
  const locataire = v.includes("locat");
  const gratuit = v.includes("gratuit");
  setFact("proprietaire_residence", proprio);
  setFact("locataire_residence", locataire);
  setFact("occupant_gratuit", gratuit);
}

/* ------------------------------------------------------------------ */
/* selectDocuments                                                     */
/* ------------------------------------------------------------------ */

/**
 * Décide si une pièce est demandée, selon la sémantique ternaire conservatrice.
 *
 * Un FactKey peut valoir true, false, ou ABSENT (inconnu). On ne masque une
 * pièce QUE si un fait déclencheur est explicitement false ; un fait inconnu
 * compte comme « pas faux » (donc inclusif).
 *
 *   - pas de contrainte / always:true       => toujours demandée.
 *   - anyOf:[a,b]  => f[a]!==false || f[b]!==false (au moins un pas faux).
 *   - allOf:[a,b]  => f[a]!==false && f[b]!==false (aucun explicitement faux).
 *   - anyOf + allOf => ET logique des deux clauses.
 */
export function evaluateEntry(entry: CatalogEntry, facts: Facts): boolean {
  if (entry.always) return true;
  const hasAny = !!entry.anyOf?.length;
  const hasAll = !!entry.allOf?.length;
  if (!hasAny && !hasAll) return true;
  const anyOk = !hasAny || entry.anyOf!.some((k) => facts[k] !== false);
  const allOk = !hasAll || entry.allOf!.every((k) => facts[k] !== false);
  return anyOk && allOk;
}

/**
 * selectDocuments — filtre le CATALOG selon la situation.
 *
 * Sur un foyer vide (Facts={}), TOUTES les pièces ressortent. À mesure que le
 * DCI fixe des faits à false, les branches correspondantes disparaissent.
 */
export function selectDocuments(facts: Facts): CatalogEntry[] {
  return CATALOG.filter((entry) => evaluateEntry(entry, facts));
}

/* ------------------------------------------------------------------ */
/* toCollecteStructure                                                 */
/* ------------------------------------------------------------------ */

/** Item tel qu'attendu par POST /api/collecte/send. */
export interface CollecteItem {
  theme: string;
  sub?: string;
  label: string;
  type: "Document" | "Question";
}

/**
 * toCollecteStructure — CatalogEntry[] -> items prêts à l'envoi.
 *
 * Mappe category -> theme, sub -> sub, et le type "Information" du catalogue sur
 * "Question" attendu par l'API collecte (une [INFO] est une question au client).
 */
export function toCollecteStructure(entries: CatalogEntry[]): CollecteItem[] {
  return entries.map((entry) => ({
    theme: entry.category,
    sub: entry.sub,
    label: entry.label,
    type: entry.type === "Information" ? "Question" : "Document",
  }));
}
