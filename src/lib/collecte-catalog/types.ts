/**
 * Collecte conditionnelle déterministe — contrat partagé.
 *
 * Croise la SITUATION du client (faits booléens dérivés du DCI structuré) avec
 * le RÉFÉRENTIEL des 286 pièces (docs/referentiel-documentaire-priveos.md) pour
 * ne demander QUE les pièces pertinentes, via des règles déterministes (pas d'IA).
 *
 * Ce fichier est la SOURCE DE VÉRITÉ importée par les 11 agents catégorie. Chaque
 * agent produit un CatalogEntry[] pour sa catégorie en se servant UNIQUEMENT des
 * FactKey ci-dessous comme déclencheurs. N'ajoute pas de FactKey hors de cette
 * union sans coordination : un fait inconnu casse le moteur (voir evaluateEntry).
 *
 * Vocabulaire métier : un crédit est un PASSIF (jamais un "actif"). Les FactKey
 * reflètent la situation, pas un jugement de valeur.
 */

/**
 * Faits booléens sur la situation du foyer. Chaque clé répond à une question
 * fermée (vrai/faux). Les questions [INFO] du référentiel sont la source
 * première de ces faits ; certaines sont aussi inférables de champs [DOC]
 * présents dans le DCI (ex: un IBAN renseigné => detient_comptes_bancaires).
 *
 * Convention de nommage : snake_case, formulé au présent positif. Un fait
 * absent de `Facts` est traité comme INCONNU (≠ false) — voir la sémantique
 * conservatrice dans le moteur.
 */
export type FactKey =
  // --- Identité et situation familiale ---
  | "a_conjoint" // marié, pacsé ou concubin (déclenche toutes les pièces "du conjoint")
  | "marie"
  | "pacse"
  | "concubin"
  | "divorce" // le client a un divorce (jugement/convention)
  | "conjoint_divorce" // le conjoint a un divorce antérieur
  | "a_enfants"
  | "enfant_adopte"
  | "enfant_decede"
  | "enfant_majeur_rattache" // enfant majeur rattaché fiscalement ou aidé
  | "handicap_foyer" // une personne du foyer en situation de handicap
  | "mesure_protection" // tutelle/curatelle/sauvegarde sur un membre du foyer

  // --- Budget / revenus ---
  | "client_salarie"
  | "conjoint_salarie"
  | "client_dirigeant" // gérance / mandat social (rémunération)
  | "conjoint_dirigeant"
  | "client_tns" // travailleur non salarié (URSSAF / CA)
  | "conjoint_tns"
  | "percoit_dividendes"
  | "revenus_financiers" // IFU foyer (intérêts, dividendes de placement)
  | "client_retraite_liquidee" // perçoit une pension de retraite
  | "conjoint_retraite_liquidee"
  | "percoit_chomage"
  | "effort_epargne"
  | "verse_pensions_aides" // pensions/prestations comp./aides familiales versées
  | "verse_pension_alimentaire"
  | "verse_prestation_compensatoire"
  | "depense_importante_prevue"
  | "rentree_argent_prevue"

  // --- Fiscalité ---
  | "dispositif_fiscal_immobilier" // Pinel/Malraux/Denormandie... (réductions immo)
  | "evolution_reductions_credits_impot"
  | "assujetti_ifi"
  | "situation_internationale" // résidence/revenus à l'étranger
  | "actifs_financiers_etranger" // comptes/contrats/actifs hors de France

  // --- Patrimoine professionnel ---
  | "detient_entreprise" // exerce une activité pro (société d'exploitation/libérale)
  | "profession_liberale"
  | "inscrit_ordre_registre" // ordre pro / registre (libéral réglementé)
  | "detient_societe_civile" // SCI non immo ou holding patrimoniale civile
  | "detient_societe_commerciale"
  | "projet_cession_transmission_pro" // poursuivre/céder/transmettre/cesser/ouvrir capital

  // --- Immobilier ---
  | "proprietaire_residence" // propriétaire du logement d'usage
  | "locataire_residence"
  | "occupant_gratuit" // occupant à titre gratuit du logement d'usage
  | "residence_via_sci" // logement d'usage détenu via SCI/société
  | "residence_en_indivision"
  | "residence_recue_donation"
  | "residence_recue_succession"
  | "achat_via_agence" // acquisition via agence/chasseur (frais d'agence)
  | "travaux_residence" // travaux réalisés sur le logement d'usage
  | "travaux_residence_factures"
  | "travaux_residence_deduits"
  | "residence_genere_revenus" // loyers/indemnités/charges sur le bien d'usage
  | "projet_vente_residence"
  | "immobilier_locatif" // détient au moins un bien locatif (direct)
  | "locatif_loue" // bien locatif actuellement loué (vs vacant)
  | "locatif_meuble" // mode d'exploitation meublé (LMNP/LMP)
  | "locatif_bail_commercial" // bail commercial/professionnel/notarié
  | "locatif_gere_agence" // gestion par agence/conciergerie
  | "travaux_locatif"
  | "travaux_locatif_factures"
  | "locatif_assurance_loyers_impayes"
  | "locatif_garantie_visale"
  | "projet_vente_locatif"
  | "credit_immobilier" // au moins un prêt immobilier en cours
  | "projet_remboursement_renegociation_pret"
  | "assurance_emprunteur_deleguee" // délégation d'assurance emprunteur
  | "detient_scpi"
  | "scpi_demembree"
  | "scpi_financee_credit"
  | "scpi_nantissement"

  // --- Actifs financiers ---
  | "detient_comptes_bancaires"
  | "detient_livrets" // livrets réglementés / comptes sur livret
  | "detient_comptes_terme"
  | "assurance_vie" // détient au moins un contrat d'assurance-vie
  | "av_primes_post_2017" // primes versées après le 27/09/2017
  | "av_primes_post_70ans"
  | "contrat_capitalisation"
  | "detient_pea" // PEA ou PEA-PME
  | "detient_cto" // compte-titres ordinaire
  | "detient_per" // PER/PERP/Madelin/art.83/art.82/Préfon
  | "projet_sortie_retraite_supplementaire" // sortie capital/rente/mixte envisagée
  | "epargne_salariale" // PEE/PEI/PERCO/PERCOL
  | "detient_private_equity" // FIP/FCPI/FCPR/private equity
  | "detient_crowdfunding"
  | "detient_obligations"
  | "detient_produit_structure"
  | "girardin_industriel"
  | "detient_cryptoactifs"

  // --- Passifs et créances ---
  | "credits_hors_immo" // prêts/dettes hors crédit immobilier
  | "credit_conso"
  | "credit_renouvelable"
  | "pret_familial_emprunte" // prêt familial / reconnaissance de dette (débiteur)
  | "loa_lld_leasing"
  | "dette_fiscale"
  | "dette_sociale" // URSSAF / échéancier social
  | "detient_creance" // créance sur un tiers
  | "creance_remboursee_normalement"

  // --- Retraite ---
  | "projet_retraite_client" // a une cible d'âge de cessation/réduction d'activité
  | "projet_retraite_conjoint"
  | "rachat_trimestres" // rachat de trimestres / démarches retraite
  | "retraite_supplementaire_employeur"

  // --- Mutuelle et prévoyance ---
  | "a_mutuelle"
  | "client_prevoyance_individuelle"
  | "conjoint_prevoyance_individuelle"
  | "prevoyance_tns_client"
  | "prevoyance_tns_conjoint"
  | "prevoyance_collective" // prévoyance collective / employeur

  // --- Succession et donation ---
  | "souhaite_avantager_client" // avantager une personne au décès (client)
  | "souhaite_avantager_conjoint"
  | "donation_consentie_client" // a déjà consenti une donation (client)
  | "donation_consentie_conjoint"
  | "donation_recue_client"
  | "donation_recue_conjoint"
  | "succession_recue_client"
  | "succession_recue_conjoint"
  | "attend_donation_succession" // anticipe de recevoir don/succession court/moyen terme
  | "prets_familiaux" // prêts familiaux consentis ou reçus

  // --- Informations complémentaires ---
  | "info_complementaire" // souhaite transmettre une info hors rubriques standard
  | "commentaire_libre"
  | "limites_strategie"; // pose des limites dans la stratégie

/**
 * État connu de la situation. Un fait peut être true, false, ou absent
 * (inconnu). Le moteur traite « absent » de façon CONSERVATRICE : en cas de
 * doute il INCLUT la pièce plutôt que de la rater (cf. evaluateEntry).
 */
export type Facts = Partial<Record<FactKey, boolean>>;

/**
 * Une pièce du catalogue (un [DOC] ou une [INFO] du référentiel).
 *
 * Sémantique de condition (évaluée par le moteur) :
 *   - aucune contrainte (ni always, ni anyOf, ni allOf) => TOUJOURS demandée.
 *   - always: true                                       => TOUJOURS demandée.
 *   - anyOf: [a, b]   => demandée si AU MOINS un fait est « pas faux »
 *                        (true ou inconnu). Inclusion conservatrice.
 *   - allOf: [a, b]   => demandée si AUCUN fait n'est explicitement false
 *                        (tous true ou inconnus).
 *   - anyOf + allOf   => les deux clauses doivent passer (ET logique).
 *
 * « pas faux » = true OU absent : on ne masque une pièce QUE si un fait
 * déclencheur est explicitement false. Tant que la situation est inconnue,
 * la pièce reste demandée.
 */
export interface CatalogEntry {
  /** Identifiant stable et unique (ex: "immo-locatif-bail"). Sert de clé de dédup. */
  id: string;
  /** Catégorie = un des 11 thèmes du référentiel (mappé sur Item.theme à l'envoi). */
  category: string;
  /** Sous-rubrique optionnelle (mappée sur Item.sub à l'envoi). */
  sub?: string;
  /** Libellé exact tel qu'il apparaîtra au client (Item.label). */
  label: string;
  /** "Document" (pièce à fournir) ou "Information" (donnée à saisir). */
  type: "Document" | "Information";
  /** Forçage : pièce socle demandée quelle que soit la situation. */
  always?: boolean;
  /** Demandée si AU MOINS un de ces faits n'est pas explicitement false. */
  anyOf?: FactKey[];
  /** Demandée si AUCUN de ces faits n'est explicitement false. */
  allOf?: FactKey[];
}
