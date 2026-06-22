// Catalogue produits référencés au niveau ASTRAEOS (licences).
// Source unique pour la page `marketplace/` (écran maquette `page-ing-out-catalogue`).
// Quatre catégories reprises de la maquette ingénieur v28, chacune dépliée en un
// vrai catalogue de produits référencés. Chaque produit porte une fiche
// consultable (caractéristiques) et peut être ajouté au comparateur.
//
// Pas de table dédiée : ce catalogue est une configuration métier (licences
// ASTRAEOS) qui évolue lentement, on l'assume en TS plutôt qu'en base.

export type CatalogueIcon = "finance" | "business" | "shield";

export type CatalogueAction = "relation" | "module";

/** Un produit référencé, consultable en fiche et comparable. */
export type CatalogueProduit = {
  id: string;
  nom: string;
  /** Une ligne d'accroche affichée dans le tag et la fiche. */
  resume: string;
  /** Détail consultable dans la fiche produit (panneau latéral). */
  description: string;
  /** Couples clé/valeur affichés dans la fiche produit. */
  caracteristiques: { label: string; valeur: string }[];
};

export type CatalogueCategorie = {
  id: string;
  /** Numéro + libellé tels qu'affichés dans l'en-tête de carte. */
  titre: string;
  icon: CatalogueIcon;
  /** Type d'action : mise en relation ASTRAEOS ou connexion d'un module. */
  action: CatalogueAction;
  actionLabel: string;
  description: string;
  produits: CatalogueProduit[];
};

export const catalogueCategories: CatalogueCategorie[] = [
  {
    id: "financier",
    titre: "1 · Investissement financier",
    icon: "finance",
    action: "relation",
    actionLabel: "Mise en relation",
    description:
      "Demande de mise en relation avec un référent ASTRAEOS pour le placement de produits financiers (assurance vie, PEA, contrat de capitalisation, compte-titres, PER).",
    produits: [
      {
        id: "fin-assurance-vie",
        nom: "Assurance vie",
        resume: "Enveloppe multisupport, fiscalité après 8 ans",
        description:
          "Contrat multisupport accessible dès l'ouverture, avec arbitrages libres entre fonds euros et unités de compte. Fiscalité allégée sur les rachats après huit ans et transmission hors succession dans les limites légales.",
        caracteristiques: [
          { label: "Horizon", valeur: "Moyen / long terme" },
          { label: "Liquidité", valeur: "Rachats partiels libres" },
          { label: "Fiscalité", valeur: "Allégée après 8 ans" },
          { label: "Transmission", valeur: "Hors succession (plafonds)" },
        ],
      },
      {
        id: "fin-pea",
        nom: "PEA",
        resume: "Actions européennes, exonération après 5 ans",
        description:
          "Plan d'épargne en actions investi en titres européens. Les plus-values et dividendes sont exonérés d'impôt sur le revenu après cinq ans de détention (hors prélèvements sociaux).",
        caracteristiques: [
          { label: "Plafond", valeur: "150 000 €" },
          { label: "Univers", valeur: "Actions UE / EEE" },
          { label: "Fiscalité", valeur: "Exonération après 5 ans" },
        ],
      },
      {
        id: "fin-capitalisation",
        nom: "Contrat de capitalisation",
        resume: "Pour la personne morale et la transmission",
        description:
          "Proche de l'assurance vie mais détenable par une personne morale (holding patrimoniale). Entre dans l'actif successoral et conserve son antériorité fiscale lors d'une donation.",
        caracteristiques: [
          { label: "Détenteur", valeur: "Personne physique ou morale" },
          { label: "Antériorité", valeur: "Conservée en cas de donation" },
        ],
      },
      {
        id: "fin-compte-titres",
        nom: "Compte-titres",
        resume: "Univers d'investissement sans contrainte",
        description:
          "Enveloppe sans plafond ni restriction géographique : actions, obligations, ETF, produits structurés. Fiscalité au prélèvement forfaitaire unique sur les gains.",
        caracteristiques: [
          { label: "Plafond", valeur: "Aucun" },
          { label: "Univers", valeur: "Mondial, toutes classes d'actifs" },
          { label: "Fiscalité", valeur: "PFU 30 %" },
        ],
      },
      {
        id: "fin-per",
        nom: "PER",
        resume: "Déductibilité à l'entrée, sortie à la retraite",
        description:
          "Plan d'épargne retraite avec versements déductibles du revenu imposable dans la limite des plafonds. Sortie en capital ou en rente au moment de la retraite, déblocages anticipés prévus par la loi.",
        caracteristiques: [
          { label: "Déduction", valeur: "Versements déductibles (plafonds)" },
          { label: "Sortie", valeur: "Capital ou rente à la retraite" },
          { label: "Déblocage", valeur: "Anticipé (achat RP, accidents de vie)" },
        ],
      },
    ],
  },
  {
    id: "immobilier",
    titre: "2 · Investissement immobilier",
    icon: "business",
    action: "relation",
    actionLabel: "Mise en relation",
    description:
      "Demande de mise en relation avec un partenaire immobilier référencé par ASTRAEOS (Denormandie, LMNP, neuf, ancien rénové, SCPI).",
    produits: [
      {
        id: "immo-denormandie",
        nom: "Projet Denormandie",
        resume: "Réduction d'impôt sur l'ancien rénové",
        description:
          "Dispositif de défiscalisation sur l'achat d'un bien ancien avec travaux de rénovation, en zone éligible, loué nu. Réduction d'impôt proportionnelle à la durée d'engagement locatif.",
        caracteristiques: [
          { label: "Support", valeur: "Ancien avec travaux" },
          { label: "Engagement", valeur: "6, 9 ou 12 ans de location" },
          { label: "Avantage", valeur: "Réduction d'impôt jusqu'à 21 %" },
        ],
      },
      {
        id: "immo-lmnp",
        nom: "LMNP",
        resume: "Location meublée, amortissement du bien",
        description:
          "Loueur en meublé non professionnel : revenus en BIC avec amortissement du bien et du mobilier, qui neutralise souvent l'imposition des loyers pendant plusieurs années.",
        caracteristiques: [
          { label: "Régime", valeur: "BIC réel ou micro-BIC" },
          { label: "Atout", valeur: "Amortissement du bien et du mobilier" },
        ],
      },
      {
        id: "immo-neuf",
        nom: "Neuf",
        resume: "Frais réduits, garanties constructeur",
        description:
          "Acquisition dans le neuf : frais de notaire réduits, garanties décennale et de parfait achèvement, performance énergétique récente. Adapté à une stratégie patrimoniale de long terme.",
        caracteristiques: [
          { label: "Frais de notaire", valeur: "Réduits (~2-3 %)" },
          { label: "Garanties", valeur: "Décennale, parfait achèvement" },
        ],
      },
      {
        id: "immo-ancien-renove",
        nom: "Ancien rénové",
        resume: "Décote à l'achat, déficit foncier",
        description:
          "Bien ancien rénové permettant une décote à l'acquisition et la création d'un déficit foncier imputable sur le revenu global dans les limites légales.",
        caracteristiques: [
          { label: "Levier fiscal", valeur: "Déficit foncier" },
          { label: "Emplacement", valeur: "Centres-villes établis" },
        ],
      },
      {
        id: "immo-scpi",
        nom: "SCPI",
        resume: "Immobilier mutualisé, gestion déléguée",
        description:
          "Parts de société civile de placement immobilier : exposition diversifiée à un parc géré professionnellement, accessible avec un ticket réduit et sans gestion locative directe.",
        caracteristiques: [
          { label: "Ticket", valeur: "À partir de quelques centaines d'euros" },
          { label: "Gestion", valeur: "Entièrement déléguée" },
          { label: "Revenu", valeur: "Distribution trimestrielle" },
        ],
      },
    ],
  },
  {
    id: "assurance",
    titre: "3 · Assurance",
    icon: "shield",
    action: "module",
    actionLabel: "Connexion module",
    description:
      "Accès au module assurance multi-compagnies (Crédit logement, emprunteur, prévoyance, mutuelle, homme clé). Souscription directe via le module connecté.",
    produits: [
      {
        id: "assur-emprunteur",
        nom: "Emprunteur immo",
        resume: "Couverture du prêt immobilier",
        description:
          "Assurance emprunteur en délégation, couvrant décès, invalidité et incapacité sur un crédit immobilier. Comparaison multi-compagnies pour optimiser le coût à garanties équivalentes.",
        caracteristiques: [
          { label: "Garanties", valeur: "Décès, PTIA, IPT, ITT" },
          { label: "Levier", valeur: "Délégation d'assurance" },
        ],
      },
      {
        id: "assur-pret-conso",
        nom: "Prêt conso",
        resume: "Sécurisation d'un crédit à la consommation",
        description:
          "Couverture d'un crédit à la consommation contre les aléas de la vie, calibrée sur la durée et le montant emprunté.",
        caracteristiques: [
          { label: "Garanties", valeur: "Décès, incapacité" },
          { label: "Durée", valeur: "Alignée sur le crédit" },
        ],
      },
      {
        id: "assur-prevoyance",
        nom: "Prévoyance pro",
        resume: "Maintien de revenu du dirigeant",
        description:
          "Contrat de prévoyance professionnelle protégeant le revenu du dirigeant en cas d'arrêt de travail, d'invalidité ou de décès. Cotisations déductibles sous conditions (Madelin).",
        caracteristiques: [
          { label: "Cible", valeur: "TNS et dirigeants" },
          { label: "Fiscalité", valeur: "Déduction Madelin possible" },
        ],
      },
      {
        id: "assur-mutuelle",
        nom: "Mutuelle dirigeant",
        resume: "Complémentaire santé sur mesure",
        description:
          "Complémentaire santé du dirigeant et de sa famille, avec niveaux de garanties modulables et fiscalité Madelin pour les travailleurs non salariés.",
        caracteristiques: [
          { label: "Périmètre", valeur: "Dirigeant et ayants droit" },
          { label: "Garanties", valeur: "Modulables par poste" },
        ],
      },
      {
        id: "assur-homme-cle",
        nom: "Homme clé",
        resume: "Protection de l'entreprise contre la perte d'un dirigeant",
        description:
          "Assurance homme clé indemnisant l'entreprise en cas de disparition ou d'incapacité d'une personne essentielle à son activité. Couvre la perte d'exploitation et le temps de réorganisation.",
        caracteristiques: [
          { label: "Bénéficiaire", valeur: "L'entreprise" },
          { label: "Couverture", valeur: "Perte d'exploitation" },
        ],
      },
    ],
  },
  {
    id: "immatriculation",
    titre: "4 · Immatriculation de société",
    icon: "business",
    action: "relation",
    actionLabel: "Mise en relation",
    description:
      "Demande de mise en relation avec le partenaire juridique référencé par ASTRAEOS pour l'immatriculation de sociétés patrimoniales (SCI, SAS, SARL holding, etc.).",
    produits: [
      {
        id: "immat-sci",
        nom: "SCI",
        resume: "Détention et transmission immobilière",
        description:
          "Société civile immobilière pour détenir et transmettre un patrimoine immobilier en facilitant la gestion familiale et le démembrement des parts.",
        caracteristiques: [
          { label: "Usage", valeur: "Détention immobilière" },
          { label: "Atout", valeur: "Transmission par parts" },
        ],
      },
      {
        id: "immat-sas-holding",
        nom: "SAS holding",
        resume: "Tête de groupe souple",
        description:
          "Société par actions simplifiée en holding : grande liberté statutaire, idéale pour structurer un groupe, remonter les dividendes en régime mère-fille et préparer une transmission.",
        caracteristiques: [
          { label: "Gouvernance", valeur: "Statuts très souples" },
          { label: "Régime", valeur: "Mère-fille, intégration" },
        ],
      },
      {
        id: "immat-sarl-holding",
        nom: "SARL holding",
        resume: "Cadre encadré, gérance majoritaire",
        description:
          "Holding sous forme de SARL, au fonctionnement encadré et adapté à une gérance majoritaire avec statut TNS du dirigeant.",
        caracteristiques: [
          { label: "Cadre", valeur: "Légalement encadré" },
          { label: "Gérant", valeur: "Statut TNS possible" },
        ],
      },
      {
        id: "immat-sarl-famille",
        nom: "SARL famille",
        resume: "Option IR pour la cellule familiale",
        description:
          "SARL de famille permettant l'option pour l'impôt sur le revenu sans limite de durée, réservée aux activités exercées entre membres d'une même famille.",
        caracteristiques: [
          { label: "Option", valeur: "Impôt sur le revenu" },
          { label: "Condition", valeur: "Associés d'une même famille" },
        ],
      },
      {
        id: "immat-scea",
        nom: "SCEA",
        resume: "Exploitation et patrimoine agricole",
        description:
          "Société civile d'exploitation agricole pour détenir et exploiter un patrimoine foncier agricole, avec une fiscalité adaptée au secteur.",
        caracteristiques: [
          { label: "Objet", valeur: "Exploitation agricole" },
          { label: "Patrimoine", valeur: "Foncier rural" },
        ],
      },
    ],
  },
];

export function getCatalogueScreen() {
  return {
    heroEyebrow: "Outils · catalogue produits · consultation",
    heroSub:
      "Catalogue complet des produits référencés au niveau ASTRAEOS (licences). Quatre catégories accessibles via une mise en relation directe ou un module dédié pour vos clients.",
    categories: catalogueCategories,
  };
}
