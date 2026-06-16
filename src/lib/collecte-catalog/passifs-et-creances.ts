import type { CatalogEntry } from "./types";

/**
 * Passifs et créances — 12 pièces.
 *
 * Deux questions de branchement [INFO] structurent la catégorie :
 *   - prêts/dettes hors crédit immobilier (=> credits_hors_immo et ses détails)
 *   - détention d'une créance sur un tiers (=> detient_creance)
 * Elles restent toujours demandées : ce sont elles qui fixent les faits.
 *
 * Un crédit est un PASSIF, jamais un actif (cf. vocabulaire métier).
 */
export const ENTRIES: CatalogEntry[] = [
  {
    id: "passifs-info-credits-hors-immo",
    category: "Passifs et créances",
    label: "Le foyer a-t-il des prêts ou dettes hors crédit immobilier ?",
    type: "Information",
    always: true,
  },
  {
    id: "passifs-pret-perso-conso",
    category: "Passifs et créances",
    label: "Contrat de prêt personnel ou crédit consommation",
    type: "Document",
    anyOf: ["credits_hors_immo", "credit_conso"],
  },
  {
    id: "passifs-amortissement-hors-immo",
    category: "Passifs et créances",
    label: "Tableau d’amortissement ou échéancier du prêt hors immobilier",
    type: "Document",
    anyOf: ["credits_hors_immo", "credit_conso"],
  },
  {
    id: "passifs-releve-credit-renouvelable",
    category: "Passifs et créances",
    label: "Dernier relevé de situation du crédit renouvelable",
    type: "Document",
    anyOf: ["credit_renouvelable"],
  },
  {
    id: "passifs-pret-familial-reconnaissance-dette",
    category: "Passifs et créances",
    label: "Contrat de prêt familial ou reconnaissance de dette",
    type: "Document",
    anyOf: ["pret_familial_emprunte"],
  },
  {
    id: "passifs-contrat-loa-lld-leasing",
    category: "Passifs et créances",
    label: "Contrat LOA, LLD ou leasing",
    type: "Document",
    anyOf: ["loa_lld_leasing"],
  },
  {
    id: "passifs-echeancier-loa-lld-leasing",
    category: "Passifs et créances",
    label: "Échéancier LOA, LLD ou leasing",
    type: "Document",
    anyOf: ["loa_lld_leasing"],
  },
  {
    id: "passifs-dette-fiscale",
    category: "Passifs et créances",
    label: "Avis, courrier ou échéancier de dette fiscale",
    type: "Document",
    anyOf: ["dette_fiscale"],
  },
  {
    id: "passifs-dette-sociale-urssaf",
    category: "Passifs et créances",
    label: "Courrier URSSAF ou échéancier social",
    type: "Document",
    anyOf: ["dette_sociale"],
  },
  {
    id: "passifs-info-creance-tiers",
    category: "Passifs et créances",
    label: "Le client ou le foyer détient-il une créance sur un tiers ?",
    type: "Information",
    always: true,
  },
  {
    id: "passifs-pret-consenti-reconnaissance-dette-detenue",
    category: "Passifs et créances",
    label: "Contrat de prêt consenti ou reconnaissance de dette détenue",
    type: "Document",
    anyOf: ["detient_creance"],
  },
  {
    id: "passifs-info-creance-remboursee-normalement",
    category: "Passifs et créances",
    label: "La créance est-elle remboursée normalement ?",
    type: "Information",
    anyOf: ["detient_creance"],
  },
];
