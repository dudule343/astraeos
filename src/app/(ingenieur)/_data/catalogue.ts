// Catalogue produits référencés au niveau PRIVEOS (licences).
// Source unique pour la page `marketplace/` (écran maquette `page-ing-out-catalogue`).
// Valeurs reprises à l'identique de la maquette ingénieur v28 : 4 catégories,
// chacune avec sa description, ses tags et son type d'action (mise en relation
// ou connexion à un module dédié).

export type CatalogueIcon = "finance" | "business" | "shield";

export type CatalogueAction = "relation" | "module";

export type CatalogueCategorie = {
  id: string;
  /** Numéro + libellé tels qu'affichés dans l'en-tête de carte. */
  titre: string;
  icon: CatalogueIcon;
  /** Type d'action : mise en relation PRIVEOS ou connexion d'un module. */
  action: CatalogueAction;
  actionLabel: string;
  description: string;
  tags: string[];
};

export const catalogueCategories: CatalogueCategorie[] = [
  {
    id: "financier",
    titre: "1 · Investissement financier",
    icon: "finance",
    action: "relation",
    actionLabel: "Mise en relation",
    description:
      "Demande de mise en relation avec un référent PRIVEOS pour le placement de produits financiers (assurance vie, PEA, contrat de capitalisation, compte-titres, PER).",
    tags: ["Assurance vie", "PEA", "Capitalisation", "Compte-titres", "PER"],
  },
  {
    id: "immobilier",
    titre: "2 · Investissement immobilier",
    icon: "business",
    action: "relation",
    actionLabel: "Mise en relation",
    description:
      "Demande de mise en relation avec un partenaire immobilier référencé par PRIVEOS (Denormandie, LMNP, neuf, ancien rénové, SCPI).",
    tags: ["Projet Denormandie", "LMNP", "Neuf", "Ancien rénové", "SCPI"],
  },
  {
    id: "assurance",
    titre: "3 · Assurance",
    icon: "shield",
    action: "module",
    actionLabel: "Connexion module",
    description:
      "Accès au module assurance multi-compagnies (Crédit logement, emprunteur, prévoyance, mutuelle, homme clé). Souscription directe via le module connecté.",
    tags: ["Emprunteur immo", "Prêt conso", "Prévoyance pro", "Mutuelle dirigeant", "Homme clé"],
  },
  {
    id: "immatriculation",
    titre: "4 · Immatriculation de société",
    icon: "business",
    action: "relation",
    actionLabel: "Mise en relation",
    description:
      "Demande de mise en relation avec le partenaire juridique référencé par PRIVEOS pour l'immatriculation de sociétés patrimoniales (SCI, SAS, SARL holding, etc.).",
    tags: ["SCI", "SAS holding", "SARL holding", "SARL famille", "SCEA"],
  },
];

export function getCatalogueScreen() {
  return {
    heroEyebrow: "Outils · catalogue produits · consultation",
    heroSub:
      "Catalogue complet des produits référencés au niveau PRIVEOS (licences). Quatre catégories accessibles via une mise en relation directe ou un module dédié pour vos clients.",
    categories: catalogueCategories,
  };
}
