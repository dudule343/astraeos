import type { CatalogEntry } from "./types";

/**
 * Catégorie « Budget » — revenus, train de vie et flux récurrents du foyer.
 *
 * Conditions dérivées des faits de situation : chaque pièce de revenu n'est
 * demandée que si le statut correspondant n'est pas explicitement écarté
 * (salarié, dirigeant, TNS, retraité, etc.). Les pièces « du conjoint »
 * cumulent le fait conjoint et le fait `a_conjoint` : un foyer sans conjoint
 * connu les masque, un foyer dont la situation conjugale est inconnue les
 * conserve (inclusion conservatrice).
 */
export const ENTRIES: CatalogEntry[] = [
  {
    id: "budget-bulletin-salaire-31-12-client",
    category: "Budget",
    sub: "Revenus salariaux",
    label:
      "Bulletin de salaire du client au 31 décembre de l’année précédente",
    type: "Document",
    anyOf: ["client_salarie"],
  },
  {
    id: "budget-bulletin-salaire-31-12-conjoint",
    category: "Budget",
    sub: "Revenus salariaux",
    label:
      "Bulletin de salaire du conjoint au 31 décembre de l’année précédente",
    type: "Document",
    anyOf: ["conjoint_salarie"],
    allOf: ["a_conjoint"],
  },
  {
    id: "budget-trois-bulletins-salaire-client",
    category: "Budget",
    sub: "Revenus salariaux",
    label: "Trois derniers bulletins de salaire du client",
    type: "Document",
    anyOf: ["client_salarie"],
  },
  {
    id: "budget-trois-bulletins-salaire-conjoint",
    category: "Budget",
    sub: "Revenus salariaux",
    label: "Trois derniers bulletins de salaire du conjoint",
    type: "Document",
    anyOf: ["conjoint_salarie"],
    allOf: ["a_conjoint"],
  },
  {
    id: "budget-attestation-gerance-client",
    category: "Budget",
    sub: "Revenus de gérance",
    label:
      "Attestation de rémunération de gérance ou mandat social du client",
    type: "Document",
    anyOf: ["client_dirigeant"],
  },
  {
    id: "budget-attestation-gerance-conjoint",
    category: "Budget",
    sub: "Revenus de gérance",
    label:
      "Attestation de rémunération de gérance ou mandat social du conjoint",
    type: "Document",
    anyOf: ["conjoint_dirigeant"],
    allOf: ["a_conjoint"],
  },
  {
    id: "budget-attestation-urssaf-client",
    category: "Budget",
    sub: "Revenus non salariés",
    label: "Attestation URSSAF du client",
    type: "Document",
    anyOf: ["client_tns"],
  },
  {
    id: "budget-attestation-urssaf-conjoint",
    category: "Budget",
    sub: "Revenus non salariés",
    label: "Attestation URSSAF du conjoint",
    type: "Document",
    anyOf: ["conjoint_tns"],
    allOf: ["a_conjoint"],
  },
  {
    id: "budget-attestation-ca-client",
    category: "Budget",
    sub: "Revenus non salariés",
    label: "Attestation de chiffre d’affaires ou recettes du client",
    type: "Document",
    anyOf: ["client_tns"],
  },
  {
    id: "budget-attestation-ca-conjoint",
    category: "Budget",
    sub: "Revenus non salariés",
    label: "Attestation de chiffre d’affaires ou recettes du conjoint",
    type: "Document",
    anyOf: ["conjoint_tns"],
    allOf: ["a_conjoint"],
  },
  {
    id: "budget-releves-dividendes-client",
    category: "Budget",
    sub: "Dividendes",
    label: "Relevés de dividendes perçus par le client",
    type: "Document",
    anyOf: ["percoit_dividendes"],
  },
  {
    id: "budget-releves-dividendes-conjoint",
    category: "Budget",
    sub: "Dividendes",
    label: "Relevés de dividendes perçus par le conjoint",
    type: "Document",
    anyOf: ["percoit_dividendes"],
    allOf: ["a_conjoint"],
  },
  {
    id: "budget-ifu-revenus-financiers-foyer",
    category: "Budget",
    sub: "Revenus financiers",
    label: "IFU relatifs aux revenus financiers du foyer",
    type: "Document",
    anyOf: ["revenus_financiers"],
  },
  {
    id: "budget-pension-retraite-client",
    category: "Budget",
    sub: "Pensions de retraite",
    label: "Bulletins ou attestations de pension retraite du client",
    type: "Document",
    anyOf: ["client_retraite_liquidee"],
  },
  {
    id: "budget-pension-retraite-conjoint",
    category: "Budget",
    sub: "Pensions de retraite",
    label: "Bulletins ou attestations de pension retraite du conjoint",
    type: "Document",
    anyOf: ["conjoint_retraite_liquidee"],
    allOf: ["a_conjoint"],
  },
  {
    id: "budget-attestation-chomage-client",
    category: "Budget",
    sub: "Indemnités chômage",
    label: "Attestation France Travail ou indemnités chômage du client",
    type: "Document",
    anyOf: ["percoit_chomage"],
  },
  {
    id: "budget-attestation-chomage-conjoint",
    category: "Budget",
    sub: "Indemnités chômage",
    label: "Attestation France Travail ou indemnités chômage du conjoint",
    type: "Document",
    anyOf: ["percoit_chomage"],
    allOf: ["a_conjoint"],
  },
  {
    id: "budget-train-de-vie",
    category: "Budget",
    sub: "Train de vie",
    label:
      "Quel est le train de vie annuel estimé du foyer, hors crédits et hors impôts ?",
    type: "Information",
    always: true,
  },
  {
    id: "budget-effort-epargne",
    category: "Budget",
    sub: "Épargne",
    label: "Le foyer réalise-t-il un effort d’épargne régulier ?",
    type: "Information",
    always: true,
  },
  {
    id: "budget-versement-pensions-aides",
    category: "Budget",
    sub: "Charges récurrentes",
    label:
      "Le foyer verse-t-il des pensions, prestations compensatoires ou aides familiales régulières ?",
    type: "Information",
    always: true,
  },
  {
    id: "budget-jugement-pension-alimentaire",
    category: "Budget",
    sub: "Charges récurrentes",
    label: "Jugement, convention ou accord relatif à pension alimentaire",
    type: "Document",
    anyOf: ["verse_pension_alimentaire"],
  },
  {
    id: "budget-jugement-prestation-compensatoire",
    category: "Budget",
    sub: "Charges récurrentes",
    label: "Jugement ou convention relatif à prestation compensatoire",
    type: "Document",
    anyOf: ["verse_prestation_compensatoire"],
  },
  {
    id: "budget-depense-importante-prevue",
    category: "Budget",
    sub: "Projets de flux",
    label:
      "Le foyer anticipe-t-il une dépense importante à court ou moyen terme ?",
    type: "Information",
    always: true,
  },
  {
    id: "budget-rentree-argent-prevue",
    category: "Budget",
    sub: "Projets de flux",
    label:
      "Le foyer anticipe-t-il une rentrée d’argent importante à court ou moyen terme ?",
    type: "Information",
    always: true,
  },
];
