import type { CatalogEntry } from "./types";

/**
 * Catégorie "Succession et donation" — 23 pièces.
 *
 * Les deux [INFO] de souhait d'avantager établissent souhaite_avantager_* ; on
 * les pose largement (client: always ; conjoint: a_conjoint). Les actes liés à
 * ce souhait (testament, donation entre époux, mandat à effet posthume, pacte
 * familial) sont déclenchés par souhaite_avantager_*.
 *
 * Les actes de donation/succession déjà consentis ou reçus dépendent des faits
 * donation_consentie_*, donation_recue_*, succession_recue_*. Les pièces de
 * dévolution d'une succession reçue (acte de notoriété, attestation
 * immobilière, acte de partage) sont rattachées au fait succession_recue_* du
 * foyer (client OU conjoint).
 *
 * Les pièces de conjoint ne ressortent que si le foyer a un conjoint
 * (a_conjoint cumulé à la condition métier). Les prêts familiaux sont régis par
 * prets_familiaux (consentis ou reçus).
 */
export const ENTRIES: CatalogEntry[] = [
  {
    id: "succ-info-avantager-client",
    category: "Succession et donation",
    label: "Le client souhaite-t-il avantager une personne en cas de décès ?",
    type: "Information",
    always: true,
  },
  {
    id: "succ-info-avantager-conjoint",
    category: "Succession et donation",
    label: "Le conjoint souhaite-t-il avantager une personne en cas de décès ?",
    type: "Information",
    allOf: ["a_conjoint"],
  },
  {
    id: "succ-testament-client",
    category: "Succession et donation",
    label: "Testament du client",
    type: "Document",
    anyOf: ["souhaite_avantager_client"],
  },
  {
    id: "succ-testament-conjoint",
    category: "Succession et donation",
    label: "Testament du conjoint",
    type: "Document",
    anyOf: ["souhaite_avantager_conjoint"],
    allOf: ["a_conjoint"],
  },
  {
    id: "succ-donation-entre-epoux",
    category: "Succession et donation",
    label: "Donation entre époux",
    type: "Document",
    allOf: ["marie"],
  },
  {
    id: "succ-mandat-protection-future-client",
    category: "Succession et donation",
    label: "Mandat de protection future du client",
    type: "Document",
    always: true,
  },
  {
    id: "succ-mandat-protection-future-conjoint",
    category: "Succession et donation",
    label: "Mandat de protection future du conjoint",
    type: "Document",
    allOf: ["a_conjoint"],
  },
  {
    id: "succ-mandat-effet-posthume",
    category: "Succession et donation",
    label: "Mandat à effet posthume",
    type: "Document",
    anyOf: ["souhaite_avantager_client", "souhaite_avantager_conjoint"],
  },
  {
    id: "succ-pacte-familial-raar",
    category: "Succession et donation",
    label: "Pacte familial, convention familiale ou RAAR",
    type: "Document",
    anyOf: ["souhaite_avantager_client", "souhaite_avantager_conjoint"],
  },
  {
    id: "succ-donation-consentie-client",
    category: "Succession et donation",
    label: "Actes de donation consentie par le client",
    type: "Document",
    anyOf: ["donation_consentie_client"],
  },
  {
    id: "succ-donation-consentie-conjoint",
    category: "Succession et donation",
    label: "Actes de donation consentie par le conjoint",
    type: "Document",
    anyOf: ["donation_consentie_conjoint"],
    allOf: ["a_conjoint"],
  },
  {
    id: "succ-dons-manuels-consentis",
    category: "Succession et donation",
    label: "Déclarations de dons manuels consentis",
    type: "Document",
    anyOf: ["donation_consentie_client", "donation_consentie_conjoint"],
  },
  {
    id: "succ-donation-recue-client",
    category: "Succession et donation",
    label: "Actes de donation reçue par le client",
    type: "Document",
    anyOf: ["donation_recue_client"],
  },
  {
    id: "succ-donation-recue-conjoint",
    category: "Succession et donation",
    label: "Actes de donation reçue par le conjoint",
    type: "Document",
    anyOf: ["donation_recue_conjoint"],
    allOf: ["a_conjoint"],
  },
  {
    id: "succ-dons-manuels-recus",
    category: "Succession et donation",
    label: "Déclarations de dons manuels reçus",
    type: "Document",
    anyOf: ["donation_recue_client", "donation_recue_conjoint"],
  },
  {
    id: "succ-declaration-succession-recue-client",
    category: "Succession et donation",
    label: "Déclaration de succession reçue par le client",
    type: "Document",
    anyOf: ["succession_recue_client"],
  },
  {
    id: "succ-declaration-succession-recue-conjoint",
    category: "Succession et donation",
    label: "Déclaration de succession reçue par le conjoint",
    type: "Document",
    anyOf: ["succession_recue_conjoint"],
    allOf: ["a_conjoint"],
  },
  {
    id: "succ-acte-notoriete",
    category: "Succession et donation",
    label: "Acte de notoriété",
    type: "Document",
    anyOf: ["succession_recue_client", "succession_recue_conjoint"],
  },
  {
    id: "succ-attestation-immobiliere",
    category: "Succession et donation",
    label: "Attestation immobilière",
    type: "Document",
    anyOf: ["succession_recue_client", "succession_recue_conjoint"],
  },
  {
    id: "succ-acte-partage-successoral",
    category: "Succession et donation",
    label: "Acte de partage successoral",
    type: "Document",
    anyOf: ["succession_recue_client", "succession_recue_conjoint"],
  },
  {
    id: "succ-info-attend-donation-succession",
    category: "Succession et donation",
    label:
      "Le client pense-t-il recevoir une donation ou succession à court ou moyen terme ?",
    type: "Information",
    always: true,
  },
  {
    id: "succ-info-prets-familiaux",
    category: "Succession et donation",
    label: "Existe-t-il des prêts familiaux consentis ou reçus ?",
    type: "Information",
    always: true,
  },
  {
    id: "succ-contrat-pret-familial",
    category: "Succession et donation",
    label: "Contrat de prêt familial ou reconnaissance de dette",
    type: "Document",
    anyOf: ["prets_familiaux"],
  },
];
