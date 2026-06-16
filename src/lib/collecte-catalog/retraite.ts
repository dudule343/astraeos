import type { CatalogEntry } from "./types";

/**
 * Catégorie "Retraite" — 8 pièces.
 *
 * Le RIS (relevé individuel de situation) et l'EIG (estimation indicative
 * globale) du client sont des pièces socle d'une étude retraite : demandées
 * dès qu'on parle retraite, donc always. Leurs équivalents conjoint ne sont
 * demandés que si le foyer a un conjoint (a_conjoint).
 *
 * Les deux [INFO] d'âge de cessation établissent justement projet_retraite_*,
 * on les pose donc largement (client: always ; conjoint: a_conjoint).
 */
export const ENTRIES: CatalogEntry[] = [
  {
    id: "retraite-ris-client",
    category: "Retraite",
    label: "RIS du client",
    type: "Document",
    always: true,
  },
  {
    id: "retraite-eig-client",
    category: "Retraite",
    label: "EIG du client",
    type: "Document",
    always: true,
  },
  {
    id: "retraite-ris-conjoint",
    category: "Retraite",
    label: "RIS du conjoint",
    type: "Document",
    allOf: ["a_conjoint"],
  },
  {
    id: "retraite-eig-conjoint",
    category: "Retraite",
    label: "EIG du conjoint",
    type: "Document",
    allOf: ["a_conjoint"],
  },
  {
    id: "retraite-age-cessation-client",
    category: "Retraite",
    label:
      "À quel âge le client souhaite-t-il idéalement cesser ou réduire son activité ?",
    type: "Information",
    always: true,
  },
  {
    id: "retraite-age-cessation-conjoint",
    category: "Retraite",
    label:
      "À quel âge le conjoint souhaite-t-il idéalement cesser ou réduire son activité ?",
    type: "Information",
    allOf: ["a_conjoint"],
  },
  {
    id: "retraite-rachat-trimestres",
    category: "Retraite",
    label: "Justificatifs de rachat de trimestres ou démarches retraite",
    type: "Document",
    anyOf: ["rachat_trimestres"],
  },
  {
    id: "retraite-supplementaire-employeur",
    category: "Retraite",
    label: "Documents relatifs à retraite supplémentaire ou dispositifs employeur",
    type: "Document",
    anyOf: ["retraite_supplementaire_employeur"],
  },
];
