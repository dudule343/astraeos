// =========================================================================
// Schéma du questionnaire DCI — données PURES (aucun import serveur).
//
// Décrit les champs de chaque catégorie, fidèlement aux wireframes client
// (02-dci-simple, 03-qualification, 04-dci-complet), regroupés en 3 phases :
//   - simple        → DCI simplifié (foyer, budget, objectifs)
//   - qualification → profil investisseur / KYC (connaissance produits, risque, ESG)
//   - complet       → DCI complet (pro, patrimoine, fiscalité, succession, prévoyance)
//
// Chaque catégorie pointe sur une DciCategoryKey du data layer (cf. _data/client).
// Les réponses sont persistées en JSONB plat { fieldName: valeur } via
// saveDciCategory. Ce module est importable côté client ("use client") car il ne
// dépend QUE de types canoniques (import type), jamais des modules serveur.
// =========================================================================

import type { DciCategoryKey } from "@/app/(client)/_data/client";

export type FieldType = "text" | "textarea" | "date" | "number" | "select" | "yesno" | "choice";

export type ChoiceOption = {
  value: string;
  label: string;
  desc?: string;
};

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  /** Largeur dans la grille du bloc : 1 = pleine, 2/3 = demi/tiers de ligne. */
  span?: "full" | "half" | "third";
  placeholder?: string;
  help?: string;
  required?: boolean;
  options?: ChoiceOption[];
  /** Champ numérique en euros (affichage suffixe €). */
  unit?: string;
};

export type QBlock = {
  /** Chiffre romain affiché dans la pastille (fidèle au wireframe). */
  numeral: string;
  title: string;
  subtitle?: string;
  fields: Field[];
};

export type CategorySchema = {
  key: DciCategoryKey;
  /** Titre de section (h1). */
  title: string;
  eyebrow: string;
  subtitle: string;
  blocks: QBlock[];
};

export type PhaseKey = "simple" | "qualification" | "complet";

export type PhaseSchema = {
  key: PhaseKey;
  label: string;
  /** Pastille de l'onglet de phase. */
  pill: string;
  tagline: string;
  categories: CategorySchema[];
};

// --- jeux d'options réutilisés ------------------------------------------------

const NATIONALITE: ChoiceOption[] = [
  { value: "francaise", label: "Française" },
  { value: "ue", label: "Autre pays de l'Union européenne" },
  { value: "hors_ue", label: "Hors Union européenne" },
];

const CIVILITE: ChoiceOption[] = [
  { value: "monsieur", label: "Monsieur" },
  { value: "madame", label: "Madame" },
];

const FREQ_CONNAISSANCE: ChoiceOption[] = [
  { value: "aucune", label: "Aucune connaissance" },
  { value: "faible", label: "Connaissance faible" },
  { value: "moyenne", label: "Connaissance moyenne" },
  { value: "bonne", label: "Bonne connaissance" },
];

const DETENTION: ChoiceOption[] = [
  { value: "jamais", label: "Jamais détenu" },
  { value: "passe", label: "Détenu par le passé" },
  { value: "actuel", label: "Détenu actuellement" },
];

// =========================================================================
// PHASE 1 — DCI SIMPLIFIÉ
// =========================================================================

const CAT_IDENTITE: CategorySchema = {
  key: "cat_01_identite",
  title: "Votre foyer",
  eyebrow: "Identité & foyer",
  subtitle: "Les informations qui composent votre foyer. Ce que vous saisissez ici est enregistré au fil de l'eau.",
  blocks: [
    {
      numeral: "I",
      title: "Votre situation",
      subtitle: "Êtes-vous seul ou en couple ?",
      fields: [
        {
          name: "situation_foyer",
          label: "Composition du foyer",
          type: "choice",
          required: true,
          options: [
            { value: "seul", label: "Seul", desc: "Célibataire · divorcé(e) · veuf(ve)" },
            { value: "couple", label: "En couple", desc: "Marié(e) · pacsé(e) · concubin(e)" },
          ],
        },
      ],
    },
    {
      numeral: "II",
      title: "Vous",
      subtitle: "Vos informations personnelles principales",
      fields: [
        { name: "civilite", label: "Civilité", type: "select", span: "third", required: true, options: CIVILITE },
        { name: "prenom", label: "Prénom", type: "text", span: "third", required: true },
        { name: "nom", label: "Nom", type: "text", span: "third", required: true },
        { name: "date_naissance", label: "Date de naissance", type: "date", span: "half", required: true },
        { name: "nationalite", label: "Nationalité", type: "select", span: "half", required: true, options: NATIONALITE },
      ],
    },
    {
      numeral: "III",
      title: "Votre conjoint(e)",
      subtitle: "Les mêmes informations pour la personne avec qui vous partagez votre vie (si applicable)",
      fields: [
        { name: "conjoint_civilite", label: "Civilité", type: "select", span: "third", options: CIVILITE },
        { name: "conjoint_prenom", label: "Prénom", type: "text", span: "third" },
        { name: "conjoint_nom", label: "Nom", type: "text", span: "third" },
        { name: "conjoint_date_naissance", label: "Date de naissance", type: "date", span: "half" },
        { name: "conjoint_nationalite", label: "Nationalité", type: "select", span: "half", options: NATIONALITE },
      ],
    },
    {
      numeral: "IV",
      title: "Vos enfants",
      subtitle: "Indiquez le nombre d'enfants et leurs prénoms (séparés par des virgules).",
      fields: [
        { name: "nb_enfants", label: "Nombre d'enfants", type: "number", span: "half" },
        { name: "enfants_a_charge", label: "Dont à charge fiscale", type: "number", span: "half" },
        { name: "enfants_prenoms", label: "Prénoms des enfants", type: "text", span: "full", placeholder: "Camille, Antoine…" },
      ],
    },
    {
      numeral: "V",
      title: "Adresse principale",
      subtitle: "L'adresse de votre résidence principale",
      fields: [
        { name: "adresse", label: "Adresse", type: "text", span: "full" },
        { name: "code_postal", label: "Code postal", type: "text", span: "third" },
        { name: "ville", label: "Ville", type: "text", span: "third" },
        { name: "pays", label: "Pays", type: "text", span: "third" },
        { name: "telephone", label: "Téléphone", type: "text", span: "half" },
        { name: "email", label: "Email", type: "text", span: "half" },
      ],
    },
  ],
};

const CAT_REVENUS: CategorySchema = {
  key: "cat_03_revenus",
  title: "Votre budget",
  eyebrow: "Revenus & charges",
  subtitle: "Une vision d'ensemble de vos revenus et de vos charges annuelles, avant impôt.",
  blocks: [
    {
      numeral: "I",
      title: "Vos revenus annuels avant impôt",
      subtitle: "Montants annuels, arrondis si besoin",
      fields: [
        { name: "revenus_salaires", label: "Salaires & traitements", type: "number", span: "half", unit: "€" },
        { name: "revenus_independants", label: "Revenus d'activité indépendante", type: "number", span: "half", unit: "€" },
        { name: "revenus_fonciers", label: "Revenus fonciers", type: "number", span: "half", unit: "€" },
        { name: "revenus_financiers", label: "Revenus mobiliers & financiers", type: "number", span: "half", unit: "€" },
        { name: "revenus_pensions", label: "Pensions & retraites", type: "number", span: "half", unit: "€" },
        { name: "revenus_autres", label: "Autres revenus", type: "number", span: "half", unit: "€" },
      ],
    },
    {
      numeral: "II",
      title: "Vos charges annuelles",
      subtitle: "Les charges récurrentes de votre foyer",
      fields: [
        { name: "charges_logement", label: "Logement (loyer ou crédit)", type: "number", span: "half", unit: "€" },
        { name: "charges_vie", label: "Charges de la vie courante", type: "number", span: "half", unit: "€" },
        { name: "charges_credits", label: "Autres crédits & passifs", type: "number", span: "half", unit: "€" },
        { name: "charges_epargne", label: "Effort d'épargne mensuel", type: "number", span: "half", unit: "€" },
      ],
    },
  ],
};

const CAT_OBJECTIFS: CategorySchema = {
  key: "cat_12_objectifs",
  title: "Quels sont vos objectifs ?",
  eyebrow: "Objectifs patrimoniaux",
  subtitle: "Ce que vous souhaitez accomplir. Ces priorités orientent toute l'étude.",
  blocks: [
    {
      numeral: "I",
      title: "Vos projets prioritaires",
      subtitle: "Indiquez l'importance que vous accordez à chacun de ces objectifs",
      fields: [
        {
          name: "obj_preparer_retraite",
          label: "Préparer ma retraite",
          type: "select",
          span: "half",
          options: [
            { value: "non", label: "Non concerné" },
            { value: "secondaire", label: "Objectif secondaire" },
            { value: "important", label: "Important" },
            { value: "prioritaire", label: "Prioritaire" },
          ],
        },
        {
          name: "obj_transmettre",
          label: "Transmettre mon patrimoine",
          type: "select",
          span: "half",
          options: [
            { value: "non", label: "Non concerné" },
            { value: "secondaire", label: "Objectif secondaire" },
            { value: "important", label: "Important" },
            { value: "prioritaire", label: "Prioritaire" },
          ],
        },
        {
          name: "obj_revenus_complementaires",
          label: "Générer des revenus complémentaires",
          type: "select",
          span: "half",
          options: [
            { value: "non", label: "Non concerné" },
            { value: "secondaire", label: "Objectif secondaire" },
            { value: "important", label: "Important" },
            { value: "prioritaire", label: "Prioritaire" },
          ],
        },
        {
          name: "obj_reduire_fiscalite",
          label: "Réduire ma fiscalité",
          type: "select",
          span: "half",
          options: [
            { value: "non", label: "Non concerné" },
            { value: "secondaire", label: "Objectif secondaire" },
            { value: "important", label: "Important" },
            { value: "prioritaire", label: "Prioritaire" },
          ],
        },
        {
          name: "obj_proteger_proches",
          label: "Protéger mes proches",
          type: "select",
          span: "half",
          options: [
            { value: "non", label: "Non concerné" },
            { value: "secondaire", label: "Objectif secondaire" },
            { value: "important", label: "Important" },
            { value: "prioritaire", label: "Prioritaire" },
          ],
        },
        {
          name: "obj_valoriser_capital",
          label: "Valoriser mon capital",
          type: "select",
          span: "half",
          options: [
            { value: "non", label: "Non concerné" },
            { value: "secondaire", label: "Objectif secondaire" },
            { value: "important", label: "Important" },
            { value: "prioritaire", label: "Prioritaire" },
          ],
        },
        { name: "obj_horizon", label: "Horizon de réalisation principal", type: "text", span: "half", placeholder: "Ex. 5 à 10 ans" },
      ],
    },
    {
      numeral: "II",
      title: "Un message libre",
      subtitle: "Tout ce que vous souhaitez nous transmettre, sans contrainte de format",
      fields: [
        { name: "message_libre", label: "Votre message", type: "textarea", span: "full", placeholder: "Vos attentes, vos préoccupations, votre contexte…" },
      ],
    },
  ],
};

// =========================================================================
// PHASE 2 — QUALIFICATION INVESTISSEUR / KYC
// =========================================================================

const CAT_KYC: CategorySchema = {
  key: "cat_13_kyc",
  title: "Profil investisseur",
  eyebrow: "Qualification & KYC",
  subtitle: "Votre connaissance des marchés, votre tolérance au risque et vos préférences de durabilité. Réglementaire (MIF II).",
  blocks: [
    {
      numeral: "I",
      title: "Connaissance des produits financiers",
      subtitle: "Indiquez votre niveau de connaissance pour chaque classe d'actifs",
      fields: [
        { name: "conn_actions", label: "Actions", type: "select", span: "half", options: FREQ_CONNAISSANCE },
        { name: "conn_obligations", label: "Obligations", type: "select", span: "half", options: FREQ_CONNAISSANCE },
        { name: "conn_fonds_euros", label: "Fonds en euros", type: "select", span: "half", options: FREQ_CONNAISSANCE },
        { name: "conn_scpi", label: "Immobilier financier (SCPI, OPCI)", type: "select", span: "half", options: FREQ_CONNAISSANCE },
        { name: "conn_structures", label: "Produits structurés", type: "select", span: "half", options: FREQ_CONNAISSANCE },
        { name: "conn_capital_risque", label: "Capital risque (FCPI, FCPR)", type: "select", span: "half", options: FREQ_CONNAISSANCE },
        { name: "conn_etf", label: "ETF / Trackers", type: "select", span: "half", options: FREQ_CONNAISSANCE },
        { name: "conn_crypto", label: "Crypto-monnaies", type: "select", span: "half", options: FREQ_CONNAISSANCE },
      ],
    },
    {
      numeral: "II",
      title: "Expérience de détention",
      subtitle: "Avez-vous déjà détenu ces produits ?",
      fields: [
        { name: "detention_actions", label: "Actions / OPCVM", type: "select", span: "half", options: DETENTION },
        { name: "detention_immobilier", label: "Immobilier financier", type: "select", span: "half", options: DETENTION },
        { name: "detention_structures", label: "Produits structurés / dérivés", type: "select", span: "half", options: DETENTION },
        { name: "detention_non_cotes", label: "Actifs non cotés (private equity)", type: "select", span: "half", options: DETENTION },
      ],
    },
    {
      numeral: "III",
      title: "Horizon & tolérance au risque",
      subtitle: "Comment vous vous situez face au risque",
      fields: [
        {
          name: "horizon_placement",
          label: "Horizon de placement",
          type: "select",
          span: "half",
          options: [
            { value: "court", label: "Court terme (moins de 3 ans)" },
            { value: "moyen", label: "Moyen terme (3 à 8 ans)" },
            { value: "long", label: "Long terme (plus de 8 ans)" },
          ],
        },
        {
          name: "profil_risque",
          label: "Profil d'investisseur",
          type: "select",
          span: "half",
          options: [
            { value: "prudent", label: "Prudent" },
            { value: "equilibre", label: "Équilibré" },
            { value: "dynamique", label: "Dynamique" },
            { value: "offensif", label: "Offensif" },
          ],
        },
        {
          name: "reaction_baisse",
          label: "Réaction face à une baisse de 20 %",
          type: "select",
          span: "full",
          options: [
            { value: "vendre", label: "Je vends pour limiter mes pertes" },
            { value: "attendre", label: "Je conserve et j'attends" },
            { value: "renforcer", label: "J'investis davantage pour profiter des prix bas" },
          ],
        },
        {
          name: "tolerance_variations",
          label: "Tolérance aux variations de valeur",
          type: "choice",
          span: "full",
          options: [
            { value: "faible", label: "Faible", desc: "Je privilégie la sécurité du capital" },
            { value: "moderee", label: "Modérée", desc: "J'accepte des variations limitées" },
            { value: "elevee", label: "Élevée", desc: "Je recherche la performance et j'accepte le risque" },
          ],
        },
      ],
    },
    {
      numeral: "IV",
      title: "Préférences de durabilité (ESG)",
      subtitle: "Vos critères extra-financiers, conformément à la réglementation",
      fields: [
        { name: "esg_interesse", label: "Souhaitez-vous intégrer des critères ESG ?", type: "yesno", span: "full" },
        {
          name: "esg_priorite",
          label: "Dimension prioritaire",
          type: "select",
          span: "full",
          options: [
            { value: "aucune", label: "Aucune préférence" },
            { value: "environnement", label: "Environnement (E)" },
            { value: "social", label: "Social (S)" },
            { value: "gouvernance", label: "Gouvernance (G)" },
            { value: "global", label: "Approche globale" },
          ],
        },
      ],
    },
  ],
};

// =========================================================================
// PHASE 3 — DCI COMPLET
// =========================================================================

const CAT_PRO: CategorySchema = {
  key: "cat_02_pro",
  title: "Situation professionnelle",
  eyebrow: "Activité",
  subtitle: "Votre activité et celle de votre conjoint, ainsi que vos projets professionnels.",
  blocks: [
    {
      numeral: "I",
      title: "Votre activité professionnelle",
      fields: [
        {
          name: "statut_pro",
          label: "Statut",
          type: "select",
          span: "half",
          options: [
            { value: "salarie", label: "Salarié" },
            { value: "fonctionnaire", label: "Fonctionnaire" },
            { value: "tns", label: "Travailleur non salarié (TNS)" },
            { value: "dirigeant", label: "Dirigeant de société" },
            { value: "liberal", label: "Profession libérale" },
            { value: "retraite", label: "Retraité" },
            { value: "sans", label: "Sans activité" },
          ],
        },
        { name: "profession", label: "Profession", type: "text", span: "half" },
        { name: "employeur", label: "Employeur / Société", type: "text", span: "half" },
        { name: "anciennete", label: "Ancienneté (années)", type: "number", span: "half" },
      ],
    },
    {
      numeral: "II",
      title: "Activité du conjoint",
      subtitle: "Si applicable",
      fields: [
        {
          name: "conjoint_statut_pro",
          label: "Statut",
          type: "select",
          span: "half",
          options: [
            { value: "salarie", label: "Salarié" },
            { value: "fonctionnaire", label: "Fonctionnaire" },
            { value: "tns", label: "Travailleur non salarié (TNS)" },
            { value: "dirigeant", label: "Dirigeant de société" },
            { value: "liberal", label: "Profession libérale" },
            { value: "retraite", label: "Retraité" },
            { value: "sans", label: "Sans activité" },
          ],
        },
        { name: "conjoint_profession", label: "Profession", type: "text", span: "half" },
      ],
    },
    {
      numeral: "III",
      title: "Projets professionnels",
      fields: [
        { name: "projet_pro", label: "Projet à venir", type: "textarea", span: "full", placeholder: "Cession, départ en retraite, création, reconversion…" },
      ],
    },
  ],
};

const CAT_IMMOBILIER: CategorySchema = {
  key: "cat_04_immobilier",
  title: "Patrimoine immobilier",
  eyebrow: "Immobilier",
  subtitle: "Vos biens immobiliers : résidence, locatif, indirect. Indiquez les valeurs estimées.",
  blocks: [
    {
      numeral: "I",
      title: "Résidence principale",
      fields: [
        { name: "rp_proprietaire", label: "Êtes-vous propriétaire ?", type: "yesno", span: "full" },
        { name: "rp_valeur", label: "Valeur estimée", type: "number", span: "half", unit: "€" },
        { name: "rp_capital_restant", label: "Capital restant dû", type: "number", span: "half", unit: "€" },
      ],
    },
    {
      numeral: "II",
      title: "Immobilier locatif",
      subtitle: "Vos biens mis en location (vide ou meublé)",
      fields: [
        { name: "locatif_nb_biens", label: "Nombre de biens locatifs", type: "number", span: "third" },
        { name: "locatif_valeur", label: "Valeur totale estimée", type: "number", span: "third", unit: "€" },
        { name: "locatif_loyers", label: "Loyers annuels perçus", type: "number", span: "third", unit: "€" },
      ],
    },
    {
      numeral: "III",
      title: "Immobilier indirect",
      subtitle: "SCPI, SCI, parts de sociétés immobilières",
      fields: [
        { name: "indirect_valeur", label: "Valeur des parts détenues", type: "number", span: "half", unit: "€" },
        { name: "indirect_nature", label: "Nature", type: "text", span: "half", placeholder: "SCPI, SCI familiale…" },
      ],
    },
  ],
};

const CAT_FINANCIER: CategorySchema = {
  key: "cat_05_financier",
  title: "Patrimoine financier",
  eyebrow: "Placements",
  subtitle: "Vos liquidités, enveloppes et placements financiers.",
  blocks: [
    {
      numeral: "I",
      title: "Liquidités & comptes réglementés",
      fields: [
        { name: "liquidites", label: "Comptes courants & livrets", type: "number", span: "half", unit: "€" },
        { name: "epargne_reglementee", label: "Épargne réglementée (LDDS, LEP, PEL)", type: "number", span: "half", unit: "€" },
      ],
    },
    {
      numeral: "II",
      title: "Enveloppes d'investissement",
      fields: [
        { name: "assurance_vie", label: "Assurance-vie", type: "number", span: "half", unit: "€" },
        { name: "pea", label: "PEA / PEA-PME", type: "number", span: "half", unit: "€" },
        { name: "compte_titres", label: "Compte-titres ordinaire", type: "number", span: "half", unit: "€" },
        { name: "per", label: "Plan d'épargne retraite (PER)", type: "number", span: "half", unit: "€" },
        { name: "autres_placements", label: "Autres placements", type: "number", span: "half", unit: "€" },
      ],
    },
  ],
};

const CAT_PRO_SOCIETES: CategorySchema = {
  key: "cat_06_pro_societes",
  title: "Patrimoine professionnel",
  eyebrow: "Sociétés & actifs pro",
  subtitle: "Vos participations dans des sociétés et vos actifs professionnels.",
  blocks: [
    {
      numeral: "I",
      title: "Participations dans des sociétés",
      fields: [
        { name: "societes_detenues", label: "Sociétés détenues", type: "text", span: "full", placeholder: "Dénominations, séparées par des virgules" },
        { name: "societes_valeur", label: "Valeur estimée des participations", type: "number", span: "half", unit: "€" },
        { name: "societes_pourcentage", label: "Pourcentage moyen de détention", type: "number", span: "half", unit: "%" },
      ],
    },
    {
      numeral: "II",
      title: "Actifs professionnels",
      fields: [
        { name: "actifs_pro_nature", label: "Nature des actifs", type: "text", span: "full", placeholder: "Fonds de commerce, matériel, murs…" },
        { name: "actifs_pro_valeur", label: "Valeur estimée", type: "number", span: "half", unit: "€" },
      ],
    },
  ],
};

const CAT_USAGE: CategorySchema = {
  key: "cat_07_usage",
  title: "Biens d'usage & divers",
  eyebrow: "Biens d'usage",
  subtitle: "Vos biens de valeur hors patrimoine financier et immobilier.",
  blocks: [
    {
      numeral: "I",
      title: "Biens d'usage",
      fields: [
        { name: "vehicules", label: "Véhicules", type: "number", span: "half", unit: "€" },
        { name: "objets_valeur", label: "Objets de valeur (art, bijoux, collections)", type: "number", span: "half", unit: "€" },
        { name: "metaux_precieux", label: "Métaux précieux", type: "number", span: "half", unit: "€" },
        { name: "divers_autres", label: "Autres biens", type: "number", span: "half", unit: "€" },
      ],
    },
  ],
};

const CAT_ENDETTEMENT: CategorySchema = {
  key: "cat_08_endettement",
  title: "Endettement & passifs",
  eyebrow: "Passifs",
  subtitle: "L'ensemble de vos crédits et engagements en cours.",
  blocks: [
    {
      numeral: "I",
      title: "Crédits en cours",
      subtitle: "Capital restant dû par type de crédit",
      fields: [
        { name: "credit_immobilier", label: "Crédits immobiliers", type: "number", span: "half", unit: "€" },
        { name: "credit_consommation", label: "Crédits à la consommation", type: "number", span: "half", unit: "€" },
        { name: "credit_professionnel", label: "Crédits professionnels", type: "number", span: "half", unit: "€" },
        { name: "credit_autres", label: "Autres engagements", type: "number", span: "half", unit: "€" },
        { name: "mensualites_totales", label: "Total des mensualités", type: "number", span: "half", unit: "€" },
      ],
    },
  ],
};

const CAT_COUVERTURE: CategorySchema = {
  key: "cat_09_couverture",
  title: "Couverture & prévoyance",
  eyebrow: "Prévoyance",
  subtitle: "Vos protections en cas d'aléa de la vie.",
  blocks: [
    {
      numeral: "I",
      title: "Contrats de prévoyance",
      fields: [
        { name: "prevoyance_deces", label: "Capital décès assuré", type: "number", span: "half", unit: "€" },
        { name: "prevoyance_invalidite", label: "Couverture invalidité", type: "yesno", span: "half" },
        { name: "prevoyance_arret_travail", label: "Indemnités journalières / arrêt de travail", type: "yesno", span: "half" },
        { name: "mutuelle", label: "Complémentaire santé", type: "yesno", span: "half" },
        { name: "prevoyance_details", label: "Précisions sur vos contrats", type: "textarea", span: "full" },
      ],
    },
  ],
};

const CAT_FISCALITE: CategorySchema = {
  key: "cat_10_fiscalite",
  title: "Votre fiscalité",
  eyebrow: "Fiscalité",
  subtitle: "Votre imposition et les dispositifs en cours.",
  blocks: [
    {
      numeral: "I",
      title: "Impôt sur le revenu",
      fields: [
        { name: "nb_parts_fiscales", label: "Nombre de parts fiscales", type: "number", span: "third" },
        { name: "tmi", label: "Tranche marginale d'imposition", type: "select", span: "third", options: [
          { value: "0", label: "0 %" },
          { value: "11", label: "11 %" },
          { value: "30", label: "30 %" },
          { value: "41", label: "41 %" },
          { value: "45", label: "45 %" },
        ] },
        { name: "ir_montant", label: "Impôt sur le revenu annuel", type: "number", span: "third", unit: "€" },
      ],
    },
    {
      numeral: "II",
      title: "Impôt sur la Fortune Immobilière (IFI)",
      fields: [
        { name: "ifi_assujetti", label: "Êtes-vous assujetti à l'IFI ?", type: "yesno", span: "half" },
        { name: "ifi_montant", label: "Montant IFI annuel", type: "number", span: "half", unit: "€" },
      ],
    },
    {
      numeral: "III",
      title: "Dispositifs fiscaux en cours",
      fields: [
        { name: "dispositifs", label: "Dispositifs", type: "textarea", span: "full", placeholder: "Pinel, Denormandie, FCPI, déficit foncier…" },
      ],
    },
  ],
};

const CAT_SUCCESSION: CategorySchema = {
  key: "cat_11_succession",
  title: "Succession & transmission",
  eyebrow: "Transmission",
  subtitle: "Votre situation matrimoniale et vos dispositions de transmission.",
  blocks: [
    {
      numeral: "I",
      title: "Régime matrimonial",
      fields: [
        {
          name: "regime_matrimonial",
          label: "Régime",
          type: "select",
          span: "half",
          options: [
            { value: "communaute_reduite", label: "Communauté réduite aux acquêts" },
            { value: "communaute_universelle", label: "Communauté universelle" },
            { value: "separation", label: "Séparation de biens" },
            { value: "participation", label: "Participation aux acquêts" },
            { value: "pacs", label: "PACS" },
            { value: "aucun", label: "Aucun (célibataire)" },
          ],
        },
        { name: "donation_entre_epoux", label: "Donation entre époux", type: "yesno", span: "half" },
        { name: "testament", label: "Avez-vous rédigé un testament ?", type: "yesno", span: "half" },
      ],
    },
    {
      numeral: "II",
      title: "Dispositions de transmission",
      fields: [
        { name: "donations_consenties", label: "Donations déjà consenties", type: "number", span: "half", unit: "€" },
        { name: "succession_a_recevoir", label: "Succession à recevoir attendue", type: "yesno", span: "half" },
        { name: "transmission_objectifs", label: "Vos souhaits de transmission", type: "textarea", span: "full" },
      ],
    },
  ],
};

// =========================================================================
// Phases assemblées
// =========================================================================

export const PHASES: PhaseSchema[] = [
  {
    key: "simple",
    label: "DCI simplifié",
    pill: "1",
    tagline: "L'essentiel de votre situation : foyer, budget et objectifs.",
    categories: [CAT_IDENTITE, CAT_REVENUS, CAT_OBJECTIFS],
  },
  {
    key: "qualification",
    label: "Profil investisseur (KYC)",
    pill: "2",
    tagline: "Votre connaissance des marchés et votre rapport au risque.",
    categories: [CAT_KYC],
  },
  {
    key: "complet",
    label: "DCI complet",
    pill: "3",
    tagline: "Le détail de votre patrimoine, votre fiscalité et votre transmission.",
    categories: [
      CAT_PRO,
      CAT_IMMOBILIER,
      CAT_FINANCIER,
      CAT_PRO_SOCIETES,
      CAT_USAGE,
      CAT_ENDETTEMENT,
      CAT_COUVERTURE,
      CAT_FISCALITE,
      CAT_SUCCESSION,
    ],
  },
];

/** Toutes les clés de catégorie présentes dans le schéma, dans l'ordre du parcours. */
export const SCHEMA_CATEGORY_KEYS: DciCategoryKey[] = PHASES.flatMap((p) =>
  p.categories.map((c) => c.key),
);
