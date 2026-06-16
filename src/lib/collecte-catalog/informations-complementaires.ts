import type { CatalogEntry } from "./types";

/**
 * Catégorie « Informations complémentaires » (10 pièces).
 *
 * Deux blocs :
 *  - Pièces socle de la mission (DCI complété, lettre de mission, profil de
 *    risque, DER, autorisation RGPD) : exigées dans TOUTE étude patrimoniale,
 *    indépendamment de la situation du foyer => always: true.
 *  - Pièces de « débordement » libres, déclenchées par les seuls faits propres
 *    à cette rubrique : info_complementaire (info hors rubriques standard),
 *    commentaire_libre (commentaire ajouté par le client) et limites_strategie
 *    (le ou les clients posent des limites dans la stratégie).
 *
 * Les questions [INFO] de branchement (souhait d'info complémentaire, de
 * commentaire libre, de limites) sont incluses en type "Information" et restent
 * larges (always: true) : ce sont elles qui établissent les faits ci-dessus,
 * donc elles doivent toujours être posées.
 *
 * Les documents libres associés sont attachés à leur fait déclencheur via
 * anyOf, de sorte qu'ils disparaissent uniquement si le DCI prouve que le
 * client ne transmet rien (fait explicitement false).
 */
export const ENTRIES: CatalogEntry[] = [
  {
    id: "infos-dci-complete",
    category: "Informations complémentaires",
    label: "Questionnaire patrimonial / DCI complété",
    type: "Document",
    always: true,
  },
  {
    id: "infos-lettre-mission",
    category: "Informations complémentaires",
    label: "Lettre de mission ou mandat signé",
    type: "Document",
    always: true,
  },
  {
    id: "infos-profil-risque",
    category: "Informations complémentaires",
    label: "Qualification profil risque",
    type: "Document",
    always: true,
  },
  {
    id: "infos-der",
    category: "Informations complémentaires",
    label: "DER",
    type: "Document",
    always: true,
  },
  {
    id: "infos-autorisation-rgpd",
    category: "Informations complémentaires",
    label: "Autorisation de traitement des données personnelles",
    type: "Document",
    always: true,
  },
  {
    id: "infos-question-info-complementaire",
    category: "Informations complémentaires",
    label:
      "Le client souhaite-t-il transmettre une information complémentaire non couverte par les rubriques standard ?",
    type: "Information",
    always: true,
  },
  {
    id: "infos-document-libre-complementaire",
    category: "Informations complémentaires",
    label: "Document libre complémentaire transmis par le client",
    type: "Document",
    anyOf: ["info_complementaire"],
  },
  {
    id: "infos-question-commentaire-libre",
    category: "Informations complémentaires",
    label:
      "Le client souhaite-t-il ajouter un commentaire libre ou une information non prévue ?",
    type: "Information",
    always: true,
  },
  {
    id: "infos-question-limites-strategie",
    category: "Informations complémentaires",
    label: "Le / les clients posent-ils des limites dans la stratégie ?",
    type: "Information",
    always: true,
  },
  {
    id: "infos-document-libre-complementaire-2",
    category: "Informations complémentaires",
    label: "Document libre complémentaire",
    type: "Document",
    anyOf: ["info_complementaire", "commentaire_libre", "limites_strategie"],
  },
];
