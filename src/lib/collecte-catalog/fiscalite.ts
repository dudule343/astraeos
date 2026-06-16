import type { CatalogEntry } from "./types";

/**
 * Catégorie « Fiscalité » du catalogue de collecte conditionnelle.
 *
 * Les pièces socles (avis d'IR, 2042) sont toujours demandées. Les déclarations
 * annexes ne ressortent que si la situation correspondante n'est pas exclue par
 * le DCI (revenus fonciers, étrangers, professionnels, IFI...). Conformément au
 * moteur, un fait inconnu reste inclusif : on ne masque une annexe que si le DCI
 * pose explicitement le fait déclencheur à false.
 */
export const ENTRIES: CatalogEntry[] = [
  {
    id: "fisc-avis-ir-3ans",
    category: "Fiscalité",
    label: "Trois derniers avis d’impôt sur le revenu",
    type: "Document",
    always: true,
  },
  {
    id: "fisc-2042",
    category: "Fiscalité",
    label: "Dernière déclaration 2042",
    type: "Document",
    always: true,
  },
  {
    id: "fisc-2042-c",
    category: "Fiscalité",
    label: "Déclaration 2042-C",
    type: "Document",
    anyOf: ["percoit_dividendes", "revenus_financiers", "detient_cto", "evolution_reductions_credits_impot"],
  },
  {
    id: "fisc-2047",
    category: "Fiscalité",
    label: "Déclaration 2047",
    type: "Document",
    anyOf: ["situation_internationale", "actifs_financiers_etranger"],
  },
  {
    id: "fisc-2074",
    category: "Fiscalité",
    label: "Déclaration 2074",
    type: "Document",
    anyOf: ["detient_cto", "detient_pea", "detient_private_equity", "detient_cryptoactifs"],
  },
  {
    id: "fisc-2044",
    category: "Fiscalité",
    label: "Déclaration 2044",
    type: "Document",
    anyOf: ["immobilier_locatif", "detient_scpi"],
  },
  {
    id: "fisc-2031",
    category: "Fiscalité",
    label: "Déclaration 2031",
    type: "Document",
    anyOf: ["detient_entreprise", "detient_societe_commerciale", "locatif_meuble"],
  },
  {
    id: "fisc-2035",
    category: "Fiscalité",
    label: "Déclaration 2035",
    type: "Document",
    anyOf: ["profession_liberale", "inscrit_ordre_registre"],
  },
  {
    id: "fisc-2042-rici",
    category: "Fiscalité",
    label: "Déclaration 2042-RICI",
    type: "Document",
    anyOf: ["evolution_reductions_credits_impot", "dispositif_fiscal_immobilier", "girardin_industriel", "detient_private_equity"],
  },
  {
    id: "fisc-info-evolution-reductions",
    category: "Fiscalité",
    label: "Le foyer anticipe-t-il une évolution significative de ses réductions ou crédits d’impôt ?",
    type: "Information",
    always: true,
  },
  {
    id: "fisc-justif-dispositifs-immo",
    category: "Fiscalité",
    label: "Justificatifs de dispositifs fiscaux immobiliers",
    type: "Document",
    anyOf: ["dispositif_fiscal_immobilier"],
  },
  {
    id: "fisc-info-enfant-majeur-rattache",
    category: "Fiscalité",
    label: "Un enfant majeur est-il rattaché fiscalement ou aidé financièrement ?",
    type: "Information",
    always: true,
  },
  {
    id: "fisc-2042-ifi",
    category: "Fiscalité",
    label: "Déclaration IFI / 2042-IFI",
    type: "Document",
    anyOf: ["assujetti_ifi"],
  },
  {
    id: "fisc-avis-ifi",
    category: "Fiscalité",
    label: "Avis IFI",
    type: "Document",
    anyOf: ["assujetti_ifi"],
  },
  {
    id: "fisc-info-situation-internationale",
    category: "Fiscalité",
    label: "Le foyer a-t-il une situation internationale, une résidence à l’étranger ou des revenus étrangers ?",
    type: "Information",
    always: true,
  },
  {
    id: "fisc-avis-impot-etranger",
    category: "Fiscalité",
    label: "Avis d’imposition étranger ou justificatif fiscal étranger",
    type: "Document",
    anyOf: ["situation_internationale", "actifs_financiers_etranger"],
  },
  {
    id: "fisc-info-actifs-financiers-etranger",
    category: "Fiscalité",
    label: "Le foyer dispose-t-il de comptes, contrats ou actifs financiers à l’étranger ?",
    type: "Information",
    always: true,
  },
];
