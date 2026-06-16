import type { CatalogEntry } from "./types";

/**
 * Catalogue de collecte conditionnelle — Actifs financiers.
 *
 * Couvre les 38 pièces de la section "## Actifs financiers" du référentiel
 * (docs/referentiel-documentaire-priveos.md). Les déclencheurs croisent les
 * FactKey de la situation : comptes/livrets/CAT, supports financiers génériques,
 * assurance-vie & capitalisation, PEA/CTO, PER & retraite supplémentaire,
 * épargne salariale, private equity, crowdfunding, obligations, produits
 * structurés, Girardin et cryptoactifs.
 */
export const ENTRIES: CatalogEntry[] = [
  // --- Comptes, livrets, comptes à terme ---
  {
    id: "af-comptes-info",
    category: "Actifs financiers",
    sub: "Comptes bancaires",
    label: "Comptes bancaires détenues et montants",
    type: "Information",
    anyOf: ["detient_comptes_bancaires"],
  },
  {
    id: "af-releves-comptes-courants",
    category: "Actifs financiers",
    sub: "Comptes bancaires",
    label: "Relevés de comptes courants récents",
    type: "Document",
    anyOf: ["detient_comptes_bancaires"],
  },
  {
    id: "af-releves-livrets",
    category: "Actifs financiers",
    sub: "Comptes bancaires",
    label: "Relevés de livrets réglementés ou comptes sur livret",
    type: "Document",
    anyOf: ["detient_livrets"],
  },
  {
    id: "af-releves-comptes-terme",
    category: "Actifs financiers",
    sub: "Comptes bancaires",
    label: "Relevés de comptes à terme ou dépôts à terme",
    type: "Document",
    anyOf: ["detient_comptes_terme"],
  },

  // --- Support financier générique (assurance-vie, capi, PEA, CTO, PER...) ---
  {
    id: "af-contrat-support",
    category: "Actifs financiers",
    sub: "Support financier",
    label: "Contrat de souscription du support financier",
    type: "Document",
    anyOf: [
      "assurance_vie",
      "contrat_capitalisation",
      "detient_pea",
      "detient_cto",
      "detient_per",
    ],
  },
  {
    id: "af-releve-situation-support",
    category: "Actifs financiers",
    sub: "Support financier",
    label: "Relevé de situation récent du support financier",
    type: "Document",
    anyOf: [
      "assurance_vie",
      "contrat_capitalisation",
      "detient_pea",
      "detient_cto",
      "detient_per",
    ],
  },
  {
    id: "af-releve-annuel-support",
    category: "Actifs financiers",
    sub: "Support financier",
    label: "Relevé annuel du support financier",
    type: "Document",
    anyOf: [
      "assurance_vie",
      "contrat_capitalisation",
      "detient_pea",
      "detient_cto",
      "detient_per",
    ],
  },
  {
    id: "af-historique-versements-retraits",
    category: "Actifs financiers",
    sub: "Support financier",
    label: "Historique des versements et retraits",
    type: "Document",
    anyOf: [
      "assurance_vie",
      "contrat_capitalisation",
      "detient_pea",
      "detient_cto",
      "detient_per",
    ],
  },
  {
    id: "af-releve-performances",
    category: "Actifs financiers",
    sub: "Support financier",
    label: "Relevé de performances historiques",
    type: "Document",
    anyOf: [
      "assurance_vie",
      "contrat_capitalisation",
      "detient_pea",
      "detient_cto",
      "detient_per",
    ],
  },
  {
    id: "af-conditions-tarifaires",
    category: "Actifs financiers",
    sub: "Support financier",
    label: "Conditions tarifaires du contrat ou de l’enveloppe",
    type: "Document",
    anyOf: [
      "assurance_vie",
      "contrat_capitalisation",
      "detient_pea",
      "detient_cto",
      "detient_per",
    ],
  },

  // --- Assurance-vie et capitalisation ---
  {
    id: "af-contrat-assurance-vie",
    category: "Actifs financiers",
    sub: "Assurance-vie et capitalisation",
    label: "Contrat d’assurance-vie",
    type: "Document",
    anyOf: ["assurance_vie"],
  },
  {
    id: "af-contrat-capitalisation",
    category: "Actifs financiers",
    sub: "Assurance-vie et capitalisation",
    label: "Contrat de capitalisation",
    type: "Document",
    anyOf: ["contrat_capitalisation"],
  },
  {
    id: "af-clause-beneficiaire",
    category: "Actifs financiers",
    sub: "Assurance-vie et capitalisation",
    label: "Clause bénéficiaire assurance-vie",
    type: "Document",
    anyOf: ["assurance_vie"],
  },
  {
    id: "af-avenant-clause-beneficiaire",
    category: "Actifs financiers",
    sub: "Assurance-vie et capitalisation",
    label: "Avenant de clause bénéficiaire",
    type: "Document",
    anyOf: ["assurance_vie"],
  },
  {
    id: "af-historique-primes-2017",
    category: "Actifs financiers",
    sub: "Assurance-vie et capitalisation",
    label:
      "Historique des primes versées avant et après le 27 septembre 2017",
    type: "Document",
    anyOf: ["assurance_vie"],
    allOf: ["av_primes_post_2017"],
  },
  {
    id: "af-historique-primes-70ans",
    category: "Actifs financiers",
    sub: "Assurance-vie et capitalisation",
    label: "Historique des primes versées avant et après 70 ans",
    type: "Document",
    anyOf: ["assurance_vie"],
    allOf: ["av_primes_post_70ans"],
  },
  {
    id: "af-origine-fonds-info",
    category: "Actifs financiers",
    sub: "Assurance-vie et capitalisation",
    label: "Quelle est l’origine des fonds versés sur le contrat ?",
    type: "Information",
    anyOf: ["assurance_vie", "contrat_capitalisation"],
  },

  // --- PEA / PEA-PME / CTO ---
  {
    id: "af-contrat-pea",
    category: "Actifs financiers",
    sub: "PEA et compte-titres",
    label: "Contrat d’ouverture PEA ou PEA-PME",
    type: "Document",
    anyOf: ["detient_pea"],
  },
  {
    id: "af-releve-portefeuille",
    category: "Actifs financiers",
    sub: "PEA et compte-titres",
    label: "Relevé de portefeuille PEA, PEA-PME ou CTO",
    type: "Document",
    anyOf: ["detient_pea", "detient_cto"],
  },
  {
    id: "af-historique-operations",
    category: "Actifs financiers",
    sub: "PEA et compte-titres",
    label: "Historique des opérations PEA, PEA-PME ou CTO",
    type: "Document",
    anyOf: ["detient_pea", "detient_cto"],
  },
  {
    id: "af-ifu",
    category: "Actifs financiers",
    sub: "PEA et compte-titres",
    label: "IFU compte-titres ou PEA",
    type: "Document",
    anyOf: ["detient_pea", "detient_cto"],
  },

  // --- PER et retraite supplémentaire ---
  {
    id: "af-contrat-per",
    category: "Actifs financiers",
    sub: "Épargne retraite",
    label:
      "Contrat PER, PERP, Madelin, article 83, article 82, Préfon ou autre retraite",
    type: "Document",
    anyOf: ["detient_per"],
  },
  {
    id: "af-releve-dispositif-retraite",
    category: "Actifs financiers",
    sub: "Épargne retraite",
    label: "Relevé de situation du dispositif retraite",
    type: "Document",
    anyOf: ["detient_per"],
  },
  {
    id: "af-attestation-versements-retraite",
    category: "Actifs financiers",
    sub: "Épargne retraite",
    label: "Attestation fiscale des versements retraite",
    type: "Document",
    anyOf: ["detient_per"],
  },
  {
    id: "af-sortie-retraite-info",
    category: "Actifs financiers",
    sub: "Épargne retraite",
    label: "Le client envisage-t-il une sortie en capital, rente ou mixte ?",
    type: "Information",
    anyOf: ["detient_per", "projet_sortie_retraite_supplementaire"],
  },

  // --- Épargne salariale ---
  {
    id: "af-releve-epargne-salariale",
    category: "Actifs financiers",
    sub: "Épargne salariale",
    label: "Relevé PEE, PEI, PERCO ou PERCOL",
    type: "Document",
    anyOf: ["epargne_salariale"],
  },
  {
    id: "af-accord-epargne-salariale",
    category: "Actifs financiers",
    sub: "Épargne salariale",
    label: "Accord ou notice d’épargne salariale",
    type: "Document",
    anyOf: ["epargne_salariale"],
  },

  // --- Private equity / FIP / FCPI / FCPR ---
  {
    id: "af-bulletin-private-equity",
    category: "Actifs financiers",
    sub: "Private equity",
    label: "Bulletin de souscription FIP, FCPI, FCPR ou private equity",
    type: "Document",
    anyOf: ["detient_private_equity"],
  },
  {
    id: "af-reporting-private-equity",
    category: "Actifs financiers",
    sub: "Private equity",
    label: "Reporting ou relevé FIP, FCPI, FCPR ou private equity",
    type: "Document",
    anyOf: ["detient_private_equity"],
  },

  // --- Crowdfunding ---
  {
    id: "af-contrat-crowdfunding",
    category: "Actifs financiers",
    sub: "Crowdfunding",
    label: "Contrat ou bulletin de souscription crowdfunding",
    type: "Document",
    anyOf: ["detient_crowdfunding"],
  },
  {
    id: "af-reporting-crowdfunding",
    category: "Actifs financiers",
    sub: "Crowdfunding",
    label: "Reporting ou tableau de bord crowdfunding",
    type: "Document",
    anyOf: ["detient_crowdfunding"],
  },

  // --- Obligations et produits structurés ---
  {
    id: "af-contrat-obligations",
    category: "Actifs financiers",
    sub: "Autres placements",
    label: "Contrat ou relevé d’obligations françaises ou étrangères",
    type: "Document",
    anyOf: ["detient_obligations"],
  },
  {
    id: "af-doc-produit-structure",
    category: "Actifs financiers",
    sub: "Autres placements",
    label: "Documentation produit structuré",
    type: "Document",
    anyOf: ["detient_produit_structure"],
  },
  {
    id: "af-attestation-girardin",
    category: "Actifs financiers",
    sub: "Autres placements",
    label: "Attestation fiscale Girardin industriel",
    type: "Document",
    anyOf: ["girardin_industriel"],
  },

  // --- Cryptoactifs ---
  {
    id: "af-cryptoactifs-info",
    category: "Actifs financiers",
    sub: "Cryptoactifs",
    label: "Le client détient-il des cryptoactifs ?",
    type: "Information",
    always: true,
  },
  {
    id: "af-releve-cryptoactifs",
    category: "Actifs financiers",
    sub: "Cryptoactifs",
    label: "Relevé plateforme ou capture datée des cryptoactifs",
    type: "Document",
    anyOf: ["detient_cryptoactifs"],
  },
  {
    id: "af-historique-transactions-crypto",
    category: "Actifs financiers",
    sub: "Cryptoactifs",
    label: "Historique des transactions cryptoactifs",
    type: "Document",
    anyOf: ["detient_cryptoactifs"],
  },
  {
    id: "af-conservation-crypto-info",
    category: "Actifs financiers",
    sub: "Cryptoactifs",
    label: "Comment les cryptoactifs sont-ils conservés ?",
    type: "Information",
    anyOf: ["detient_cryptoactifs"],
  },
];
