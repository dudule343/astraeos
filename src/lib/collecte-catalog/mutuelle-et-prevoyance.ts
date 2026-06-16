import type { CatalogEntry } from "./types";

/**
 * Catégorie « Mutuelle et prévoyance » (11 pièces).
 *
 * Faits déclencheurs disponibles : a_mutuelle, client_prevoyance_individuelle,
 * conjoint_prevoyance_individuelle, prevoyance_tns_client, prevoyance_tns_conjoint,
 * prevoyance_collective. Les pièces « du conjoint » cumulent en plus a_conjoint
 * pour disparaître quand le foyer prouve l'absence de conjoint.
 *
 * Le tableau de garanties prévoyance, la cotisation prévoyance et la clause
 * bénéficiaire décès concernent TOUTE forme de prévoyance (individuelle client,
 * individuelle conjoint, TNS client, TNS conjoint, collective) : ils ressortent
 * tant qu'au moins une de ces branches n'est pas explicitement false (anyOf).
 */
export const ENTRIES: CatalogEntry[] = [
  {
    id: "mutuelle-contrat-sante",
    category: "Mutuelle et prévoyance",
    label: "Contrat de mutuelle santé du client ou du foyer",
    type: "Document",
    anyOf: ["a_mutuelle"],
  },
  {
    id: "mutuelle-tableau-garanties",
    category: "Mutuelle et prévoyance",
    label: "Tableau de garanties mutuelle",
    type: "Document",
    anyOf: ["a_mutuelle"],
  },
  {
    id: "mutuelle-cotisation-annuelle",
    category: "Mutuelle et prévoyance",
    label: "Montant annuel de cotisation mutuelle",
    type: "Information",
    anyOf: ["a_mutuelle"],
  },
  {
    id: "prevoyance-individuelle-client",
    category: "Mutuelle et prévoyance",
    label: "Contrat de prévoyance individuelle du client",
    type: "Document",
    anyOf: ["client_prevoyance_individuelle"],
  },
  {
    id: "prevoyance-individuelle-conjoint",
    category: "Mutuelle et prévoyance",
    label: "Contrat de prévoyance individuelle du conjoint",
    type: "Document",
    anyOf: ["conjoint_prevoyance_individuelle"],
    allOf: ["a_conjoint"],
  },
  {
    id: "prevoyance-tableau-garanties",
    category: "Mutuelle et prévoyance",
    label: "Tableau de garanties prévoyance",
    type: "Document",
    anyOf: [
      "client_prevoyance_individuelle",
      "conjoint_prevoyance_individuelle",
      "prevoyance_tns_client",
      "prevoyance_tns_conjoint",
      "prevoyance_collective",
    ],
  },
  {
    id: "prevoyance-cotisation-annuelle",
    category: "Mutuelle et prévoyance",
    label: "Montant annuel de cotisation prévoyance",
    type: "Information",
    anyOf: [
      "client_prevoyance_individuelle",
      "conjoint_prevoyance_individuelle",
      "prevoyance_tns_client",
      "prevoyance_tns_conjoint",
      "prevoyance_collective",
    ],
  },
  {
    id: "prevoyance-clause-beneficiaire-deces",
    category: "Mutuelle et prévoyance",
    label: "Clause bénéficiaire de l’assurance décès",
    type: "Document",
    anyOf: [
      "client_prevoyance_individuelle",
      "conjoint_prevoyance_individuelle",
      "prevoyance_tns_client",
      "prevoyance_tns_conjoint",
      "prevoyance_collective",
    ],
  },
  {
    id: "prevoyance-tns-client",
    category: "Mutuelle et prévoyance",
    label: "Contrats de prévoyance professionnelle TNS du client",
    type: "Document",
    anyOf: ["prevoyance_tns_client"],
  },
  {
    id: "prevoyance-tns-conjoint",
    category: "Mutuelle et prévoyance",
    label: "Contrats de prévoyance professionnelle TNS du conjoint",
    type: "Document",
    anyOf: ["prevoyance_tns_conjoint"],
    allOf: ["a_conjoint"],
  },
  {
    id: "prevoyance-collective-employeur",
    category: "Mutuelle et prévoyance",
    label: "Contrats de prévoyance collective ou employeur",
    type: "Document",
    anyOf: ["prevoyance_collective"],
  },
];
