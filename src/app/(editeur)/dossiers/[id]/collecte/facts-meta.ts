import type { FactKey } from "@/lib/collecte-catalog/types";

/**
 * Métadonnées d'affichage des faits de situation, pour la colonne GAUCHE de
 * <CollecteBuilder>. Chaque fait y reçoit un libellé lisible et une catégorie
 * de regroupement. L'ordre des catégories suit celui du référentiel.
 *
 * La liste est volontairement exhaustive sur l'union FactKey : tout fait
 * dérivable du DCI ou ajustable à la main doit pouvoir être coché/décoché.
 */
export interface FactMeta {
  key: FactKey;
  label: string;
  category: string;
}

export const FACT_CATEGORY_ORDER = [
  "Identité et situation familiale",
  "Budget / revenus",
  "Fiscalité",
  "Patrimoine professionnel",
  "Immobilier",
  "Actifs financiers",
  "Passifs et créances",
  "Retraite",
  "Mutuelle et prévoyance",
  "Succession et donation",
  "Informations complémentaires",
] as const;

export const FACTS_META: FactMeta[] = [
  // Identité et situation familiale
  { key: "a_conjoint", label: "A un conjoint (marié, pacsé ou concubin)", category: "Identité et situation familiale" },
  { key: "marie", label: "Marié", category: "Identité et situation familiale" },
  { key: "pacse", label: "Pacsé", category: "Identité et situation familiale" },
  { key: "concubin", label: "Concubin / union libre", category: "Identité et situation familiale" },
  { key: "divorce", label: "Client divorcé (jugement / convention)", category: "Identité et situation familiale" },
  { key: "conjoint_divorce", label: "Conjoint avec un divorce antérieur", category: "Identité et situation familiale" },
  { key: "a_enfants", label: "A des enfants", category: "Identité et situation familiale" },
  { key: "enfant_adopte", label: "Enfant adopté", category: "Identité et situation familiale" },
  { key: "enfant_decede", label: "Enfant décédé", category: "Identité et situation familiale" },
  { key: "enfant_majeur_rattache", label: "Enfant majeur rattaché ou aidé", category: "Identité et situation familiale" },
  { key: "handicap_foyer", label: "Personne du foyer en situation de handicap", category: "Identité et situation familiale" },
  { key: "mesure_protection", label: "Mesure de protection (tutelle / curatelle)", category: "Identité et situation familiale" },

  // Budget / revenus
  { key: "client_salarie", label: "Client salarié", category: "Budget / revenus" },
  { key: "conjoint_salarie", label: "Conjoint salarié", category: "Budget / revenus" },
  { key: "client_dirigeant", label: "Client dirigeant / mandataire social", category: "Budget / revenus" },
  { key: "conjoint_dirigeant", label: "Conjoint dirigeant / mandataire social", category: "Budget / revenus" },
  { key: "client_tns", label: "Client travailleur non salarié (TNS)", category: "Budget / revenus" },
  { key: "conjoint_tns", label: "Conjoint travailleur non salarié (TNS)", category: "Budget / revenus" },
  { key: "percoit_dividendes", label: "Perçoit des dividendes", category: "Budget / revenus" },
  { key: "revenus_financiers", label: "Revenus financiers (IFU foyer)", category: "Budget / revenus" },
  { key: "client_retraite_liquidee", label: "Client retraité (pension liquidée)", category: "Budget / revenus" },
  { key: "conjoint_retraite_liquidee", label: "Conjoint retraité (pension liquidée)", category: "Budget / revenus" },
  { key: "percoit_chomage", label: "Perçoit le chômage", category: "Budget / revenus" },
  { key: "effort_epargne", label: "Effort d'épargne mensuel", category: "Budget / revenus" },
  { key: "verse_pensions_aides", label: "Verse pensions / prestations / aides", category: "Budget / revenus" },
  { key: "verse_pension_alimentaire", label: "Verse une pension alimentaire", category: "Budget / revenus" },
  { key: "verse_prestation_compensatoire", label: "Verse une prestation compensatoire", category: "Budget / revenus" },
  { key: "depense_importante_prevue", label: "Dépense importante prévue", category: "Budget / revenus" },
  { key: "rentree_argent_prevue", label: "Rentrée d'argent prévue", category: "Budget / revenus" },

  // Fiscalité
  { key: "dispositif_fiscal_immobilier", label: "Dispositif fiscal immobilier (Pinel, Malraux…)", category: "Fiscalité" },
  { key: "evolution_reductions_credits_impot", label: "Évolution des réductions / crédits d'impôt", category: "Fiscalité" },
  { key: "assujetti_ifi", label: "Assujetti à l'IFI", category: "Fiscalité" },
  { key: "situation_internationale", label: "Situation internationale (résidence / revenus étrangers)", category: "Fiscalité" },
  { key: "actifs_financiers_etranger", label: "Actifs financiers à l'étranger", category: "Fiscalité" },

  // Patrimoine professionnel
  { key: "detient_entreprise", label: "Exerce une activité professionnelle (société)", category: "Patrimoine professionnel" },
  { key: "profession_liberale", label: "Profession libérale", category: "Patrimoine professionnel" },
  { key: "inscrit_ordre_registre", label: "Inscrit à un ordre / registre professionnel", category: "Patrimoine professionnel" },
  { key: "detient_societe_civile", label: "Détient une société civile (SCI non immo / holding)", category: "Patrimoine professionnel" },
  { key: "detient_societe_commerciale", label: "Détient une société commerciale", category: "Patrimoine professionnel" },
  { key: "projet_cession_transmission_pro", label: "Projet de cession / transmission professionnelle", category: "Patrimoine professionnel" },

  // Immobilier
  { key: "proprietaire_residence", label: "Propriétaire du logement d'usage", category: "Immobilier" },
  { key: "locataire_residence", label: "Locataire du logement d'usage", category: "Immobilier" },
  { key: "occupant_gratuit", label: "Occupant à titre gratuit", category: "Immobilier" },
  { key: "residence_via_sci", label: "Logement d'usage détenu via SCI / société", category: "Immobilier" },
  { key: "residence_en_indivision", label: "Logement d'usage en indivision", category: "Immobilier" },
  { key: "residence_recue_donation", label: "Logement d'usage reçu en donation", category: "Immobilier" },
  { key: "residence_recue_succession", label: "Logement d'usage reçu en succession", category: "Immobilier" },
  { key: "achat_via_agence", label: "Acquisition via agence / chasseur", category: "Immobilier" },
  { key: "travaux_residence", label: "Travaux sur le logement d'usage", category: "Immobilier" },
  { key: "travaux_residence_factures", label: "Travaux du logement d'usage facturés", category: "Immobilier" },
  { key: "travaux_residence_deduits", label: "Travaux du logement d'usage déduits", category: "Immobilier" },
  { key: "residence_genere_revenus", label: "Le logement d'usage génère des revenus", category: "Immobilier" },
  { key: "projet_vente_residence", label: "Projet de vente du logement d'usage", category: "Immobilier" },
  { key: "immobilier_locatif", label: "Détient de l'immobilier locatif", category: "Immobilier" },
  { key: "locatif_loue", label: "Bien locatif actuellement loué", category: "Immobilier" },
  { key: "locatif_meuble", label: "Location meublée (LMNP / LMP)", category: "Immobilier" },
  { key: "locatif_bail_commercial", label: "Bail commercial / professionnel / notarié", category: "Immobilier" },
  { key: "locatif_gere_agence", label: "Bien locatif géré par agence / conciergerie", category: "Immobilier" },
  { key: "travaux_locatif", label: "Travaux sur un bien locatif", category: "Immobilier" },
  { key: "travaux_locatif_factures", label: "Travaux locatifs facturés", category: "Immobilier" },
  { key: "locatif_assurance_loyers_impayes", label: "Assurance loyers impayés", category: "Immobilier" },
  { key: "locatif_garantie_visale", label: "Garantie Visale", category: "Immobilier" },
  { key: "projet_vente_locatif", label: "Projet de vente d'un bien locatif", category: "Immobilier" },
  { key: "credit_immobilier", label: "Crédit immobilier en cours", category: "Immobilier" },
  { key: "projet_remboursement_renegociation_pret", label: "Projet de remboursement / renégociation de prêt", category: "Immobilier" },
  { key: "assurance_emprunteur_deleguee", label: "Délégation d'assurance emprunteur", category: "Immobilier" },
  { key: "detient_scpi", label: "Détient des SCPI", category: "Immobilier" },
  { key: "scpi_demembree", label: "SCPI démembrées", category: "Immobilier" },
  { key: "scpi_financee_credit", label: "SCPI financées à crédit", category: "Immobilier" },
  { key: "scpi_nantissement", label: "SCPI nanties", category: "Immobilier" },

  // Actifs financiers
  { key: "detient_comptes_bancaires", label: "Détient des comptes bancaires", category: "Actifs financiers" },
  { key: "detient_livrets", label: "Détient des livrets réglementés", category: "Actifs financiers" },
  { key: "detient_comptes_terme", label: "Détient des comptes à terme", category: "Actifs financiers" },
  { key: "assurance_vie", label: "Détient une assurance-vie", category: "Actifs financiers" },
  { key: "av_primes_post_2017", label: "Primes AV versées après le 27/09/2017", category: "Actifs financiers" },
  { key: "av_primes_post_70ans", label: "Primes AV versées après 70 ans", category: "Actifs financiers" },
  { key: "contrat_capitalisation", label: "Détient un contrat de capitalisation", category: "Actifs financiers" },
  { key: "detient_pea", label: "Détient un PEA / PEA-PME", category: "Actifs financiers" },
  { key: "detient_cto", label: "Détient un compte-titres ordinaire", category: "Actifs financiers" },
  { key: "detient_per", label: "Détient un PER / PERP / Madelin", category: "Actifs financiers" },
  { key: "projet_sortie_retraite_supplementaire", label: "Projet de sortie retraite supplémentaire", category: "Actifs financiers" },
  { key: "epargne_salariale", label: "Épargne salariale (PEE / PERCO)", category: "Actifs financiers" },
  { key: "detient_private_equity", label: "Détient du private equity (FIP / FCPI / FCPR)", category: "Actifs financiers" },
  { key: "detient_crowdfunding", label: "Détient du crowdfunding", category: "Actifs financiers" },
  { key: "detient_obligations", label: "Détient des obligations", category: "Actifs financiers" },
  { key: "detient_produit_structure", label: "Détient des produits structurés", category: "Actifs financiers" },
  { key: "girardin_industriel", label: "Girardin industriel", category: "Actifs financiers" },
  { key: "detient_cryptoactifs", label: "Détient des cryptoactifs", category: "Actifs financiers" },

  // Passifs et créances
  { key: "credits_hors_immo", label: "Crédits / dettes hors immobilier", category: "Passifs et créances" },
  { key: "credit_conso", label: "Crédit à la consommation", category: "Passifs et créances" },
  { key: "credit_renouvelable", label: "Crédit renouvelable", category: "Passifs et créances" },
  { key: "pret_familial_emprunte", label: "Prêt familial emprunté (débiteur)", category: "Passifs et créances" },
  { key: "loa_lld_leasing", label: "LOA / LLD / leasing", category: "Passifs et créances" },
  { key: "dette_fiscale", label: "Dette fiscale", category: "Passifs et créances" },
  { key: "dette_sociale", label: "Dette sociale (URSSAF)", category: "Passifs et créances" },
  { key: "detient_creance", label: "Détient une créance sur un tiers", category: "Passifs et créances" },
  { key: "creance_remboursee_normalement", label: "Créance remboursée normalement", category: "Passifs et créances" },

  // Retraite
  { key: "projet_retraite_client", label: "Projet de retraite du client", category: "Retraite" },
  { key: "projet_retraite_conjoint", label: "Projet de retraite du conjoint", category: "Retraite" },
  { key: "rachat_trimestres", label: "Rachat de trimestres / démarches retraite", category: "Retraite" },
  { key: "retraite_supplementaire_employeur", label: "Retraite supplémentaire employeur", category: "Retraite" },

  // Mutuelle et prévoyance
  { key: "a_mutuelle", label: "A une mutuelle", category: "Mutuelle et prévoyance" },
  { key: "client_prevoyance_individuelle", label: "Prévoyance individuelle du client", category: "Mutuelle et prévoyance" },
  { key: "conjoint_prevoyance_individuelle", label: "Prévoyance individuelle du conjoint", category: "Mutuelle et prévoyance" },
  { key: "prevoyance_tns_client", label: "Prévoyance TNS du client", category: "Mutuelle et prévoyance" },
  { key: "prevoyance_tns_conjoint", label: "Prévoyance TNS du conjoint", category: "Mutuelle et prévoyance" },
  { key: "prevoyance_collective", label: "Prévoyance collective / employeur", category: "Mutuelle et prévoyance" },

  // Succession et donation
  { key: "souhaite_avantager_client", label: "Souhaite avantager une personne (client)", category: "Succession et donation" },
  { key: "souhaite_avantager_conjoint", label: "Souhaite avantager une personne (conjoint)", category: "Succession et donation" },
  { key: "donation_consentie_client", label: "Donation consentie par le client", category: "Succession et donation" },
  { key: "donation_consentie_conjoint", label: "Donation consentie par le conjoint", category: "Succession et donation" },
  { key: "donation_recue_client", label: "Donation reçue par le client", category: "Succession et donation" },
  { key: "donation_recue_conjoint", label: "Donation reçue par le conjoint", category: "Succession et donation" },
  { key: "succession_recue_client", label: "Succession reçue par le client", category: "Succession et donation" },
  { key: "succession_recue_conjoint", label: "Succession reçue par le conjoint", category: "Succession et donation" },
  { key: "attend_donation_succession", label: "Anticipe une donation / succession", category: "Succession et donation" },
  { key: "prets_familiaux", label: "Prêts familiaux consentis ou reçus", category: "Succession et donation" },

  // Informations complémentaires
  { key: "info_complementaire", label: "Information complémentaire hors rubriques", category: "Informations complémentaires" },
  { key: "commentaire_libre", label: "Commentaire libre", category: "Informations complémentaires" },
  { key: "limites_strategie", label: "Limites posées dans la stratégie", category: "Informations complémentaires" },
];
