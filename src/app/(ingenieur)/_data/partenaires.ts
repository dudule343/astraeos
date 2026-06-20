/**
 * Source de vérité unique pour l'écran « Partenaires & apporteurs d'affaires »
 * (page-ing-partenaires). Exemples EXACTS de la maquette v28 — comme si
 * l'ingénieur Julien VASSEUR avait saisi son carnet à la main. Aucune valeur
 * en dur dans la page.
 */

/** Couplets background/color des badges « profession / profil », repris tels quels de la maquette. */
export type ProfilVariant = "notaire" | "avocat" | "expert-comptable" | "agent-immo" | "ambassadeur" | "media";

/** Variantes de badge statut (apporteurs) : badge-success / badge-info. */
export type StatutVariant = "success" | "info";

export type Kpi = {
  label: string;
  value: string;
  meta: string;
};

/**
 * Filtre rapide d'une toolbar (.qf-perf). `variants: null` = « Tous » (aucun
 * filtrage). Sinon la ligne est conservée si sa variante profession/profil
 * appartient à la liste. Les libellés sont repris à l'identique de la maquette.
 */
export type FiltrePerf = {
  label: string;
  variants: ProfilVariant[] | null;
};

/** Partenaire recommandable (section 1) : PRIVEOS transmet des clients vers lui. */
export type PartenaireReco = {
  nom: string;
  structure: string;
  profession: string;
  professionVariant: ProfilVariant;
  localisation: string;
  specialite: string;
  dossiersTraites2026: string;
  /** true => chiffre mis en valeur en doré (cell-money gold). */
  dossiersGold: boolean;
};

/** Ligne de dossier rattaché à un apporteur (colonne « Dossier concerné »). */
export type DossierApporte = {
  /** Markup principal du dossier, ex. "Dossier MOREAU-2026-04 · Romain BERTHIER". */
  label: string;
  /** Annotation grise optionnelle en fin de ligne, ex. "+ 5 autres dossiers". */
  annotation?: string;
};

/** Apporteur d'affaires (section 2) : amène des clients vers le cabinet. */
export type Apporteur = {
  nom: string;
  sousTitre: string;
  profil: string;
  profilVariant: ProfilVariant;
  /** Une ou plusieurs lignes « Dossier concerné » (rowspan dans la maquette). */
  dossiers: DossierApporte[];
  affairesTotales: string;
  affairesDepuis: string;
  /** true => colonnes affaires/CA en doré (top apporteur). */
  affairesGold: boolean;
  caGenereCumul: string;
  statutLabel: string;
  statutVariant: StatutVariant;
};

export type PartenairesScreen = {
  heroEyebrow: string;
  heroSub: string;
  kpis: Kpi[];
  reco: {
    sectionEyebrow: string;
    sectionTitle: string;
    sectionRight: string;
    toolbarCount: string;
    filtres: FiltrePerf[];
    partenaires: PartenaireReco[];
    resteLabel: string;
    resteLien: string;
  };
  apporteurs: {
    sectionEyebrow: string;
    sectionTitle: string;
    sectionRight: string;
    toolbarCount: string;
    filtres: FiltrePerf[];
    liste: Apporteur[];
    resteLabel: string;
    resteLien: string;
  };
};

const SCREEN: PartenairesScreen = {
  heroEyebrow: "Partenaires · environnement professionnel · Cabinet Paris Étoile",
  heroSub:
    "Deux populations distinctes : les partenaires recommandables que PRIVEOS active pour ses clients (notaires, avocats, experts comptables identifiés et qualifiés), et les apporteurs d'affaires qui amènent des clients à notre réseau (avocats, notaires, comptables, agents immo, clients satisfaits, podcasteurs...).",
  kpis: [
    { label: "Partenaires actifs", value: "42", meta: "recommandables + apporteurs" },
    {
      label: "Recommandés au client",
      value: "18",
      meta: "notaires, avocats, comptables identifiés",
    },
    { label: "Apporteurs d'affaires", value: "24", meta: "amènent des clients au cabinet" },
    { label: "Affaires apportées 2026", value: "38", meta: "clients entrés via apporteurs" },
  ],
  reco: {
    sectionEyebrow: "1 · Partenaires identifiés et qualifiés par PRIVEOS",
    sectionTitle: "Partenaires à qui je transmets des clients",
    sectionRight:
      "Notaires · Avocats · Experts-comptables que les ingénieurs peuvent activer pour un dossier",
    toolbarCount: "18 partenaires recommandables",
    filtres: [
      { label: "Tous", variants: null },
      { label: "Notaires (6)", variants: ["notaire"] },
      { label: "Avocats (5)", variants: ["avocat"] },
      { label: "Experts-comptables (7)", variants: ["expert-comptable"] },
    ],
    partenaires: [
      {
        nom: "Maître Sophie BERNHEIM",
        structure: "SCP Bernheim & Partners",
        profession: "Notaire",
        professionVariant: "notaire",
        localisation: "Paris 8e",
        specialite: "Transmission · démembrement",
        dossiersTraites2026: "14",
        dossiersGold: true,
      },
      {
        nom: "Maître Pascal BONNARD",
        structure: "Cabinet indépendant",
        profession: "Avocat",
        professionVariant: "avocat",
        localisation: "Paris 16e",
        specialite: "Droit fiscal · IFI",
        dossiersTraites2026: "11",
        dossiersGold: true,
      },
      {
        nom: "Cabinet GRANT THORNTON",
        structure: "Antoine DELMAS · associé",
        profession: "Expert-comptable",
        professionVariant: "expert-comptable",
        localisation: "Paris La Défense",
        specialite: "Holdings · sociétés patrimoniales",
        dossiersTraites2026: "9",
        dossiersGold: false,
      },
      {
        nom: "Maître Catherine ROSSI",
        structure: "Étude Rossi-Marchand",
        profession: "Notaire",
        professionVariant: "notaire",
        localisation: "Lyon 6e",
        specialite: "Successions · donation",
        dossiersTraites2026: "7",
        dossiersGold: false,
      },
      {
        nom: "Maître Julien VERMEULEN",
        structure: "Vermeulen & Associés",
        profession: "Avocat",
        professionVariant: "avocat",
        localisation: "Bordeaux",
        specialite: "Droit des sociétés · pacte d'associés",
        dossiersTraites2026: "6",
        dossiersGold: false,
      },
      {
        nom: "Cabinet MAZARS",
        structure: "Cellule patrimoniale",
        profession: "Expert-comptable",
        professionVariant: "expert-comptable",
        localisation: "Strasbourg",
        specialite: "Audit · structuration fiscale",
        dossiersTraites2026: "5",
        dossiersGold: false,
      },
    ],
    resteLabel: "… 12 autres partenaires recommandables · ",
    resteLien: "Voir l'intégralité (18)",
  },
  apporteurs: {
    sectionEyebrow: "2 · Personnes qui amènent des clients à PRIVEOS et au cabinet",
    sectionTitle: "Apporteurs d'affaires",
    sectionRight:
      "Avocats · Notaires · Comptables · Agents immo · Clients satisfaits · Podcasteurs · Influenceurs",
    toolbarCount: "24 apporteurs d'affaires actifs",
    filtres: [
      { label: "Tous", variants: null },
      { label: "Pros (avocat·notaire·EC)", variants: ["avocat", "notaire", "expert-comptable"] },
      { label: "Agents immobiliers", variants: ["agent-immo"] },
      { label: "Clients ambassadeurs", variants: ["ambassadeur"] },
      { label: "Médias / influence", variants: ["media"] },
    ],
    liste: [
      {
        nom: "Linda TRABELSI",
        sousTitre: "Cabinet d'avocat",
        profil: "Avocat",
        profilVariant: "avocat",
        dossiers: [
          { label: "Dossier MOREAU-2026-04 · Romain BERTHIER" },
          { label: "Dossier ROUSSEAU-2026-02 · Émilie LAMBERT" },
          { label: "Dossier VIDAL-2025-11 · Antoine ROSSI", annotation: "+ 5 autres dossiers" },
        ],
        affairesTotales: "8",
        affairesDepuis: "dossiers depuis 2024",
        affairesGold: true,
        caGenereCumul: "186 400 €",
        statutLabel: "Top apporteur",
        statutVariant: "success",
      },
      {
        nom: "Maître Hugo PERIER",
        sousTitre: "Notaire indépendant",
        profil: "Notaire",
        profilVariant: "notaire",
        dossiers: [{ label: "Dossier LEROY-2026-04 · Antoine ROSSI" }],
        affairesTotales: "5",
        affairesDepuis: "dossiers depuis 2024",
        affairesGold: false,
        caGenereCumul: "112 200 €",
        statutLabel: "Actif",
        statutVariant: "success",
      },
      {
        nom: "Cabinet ARTHURIMMO",
        sousTitre: "Agent immobilier · Lyon",
        profil: "Agent immo",
        profilVariant: "agent-immo",
        dossiers: [{ label: "Dossier HUYGHE-2026-03 · Émilie LAMBERT" }],
        affairesTotales: "4",
        affairesDepuis: "dossiers depuis 2025",
        affairesGold: false,
        caGenereCumul: "68 000 €",
        statutLabel: "Actif",
        statutVariant: "success",
      },
      {
        nom: "Famille DELANNOY",
        sousTitre: "Client ambassadeur · servi par Luc THILLIEZ",
        profil: "Client ambassadeur",
        profilVariant: "ambassadeur",
        dossiers: [{ label: "Dossier neveu DELANNOY-2026-04 · Luc THILLIEZ" }],
        affairesTotales: "3",
        affairesDepuis: "dossiers depuis 2024",
        affairesGold: false,
        caGenereCumul: "52 800 €",
        statutLabel: "VIP",
        statutVariant: "success",
      },
      {
        nom: "Cabinet GRANT THORNTON",
        sousTitre: "Aussi partenaire recommandable (cf. section 1)",
        profil: "Expert-comptable",
        profilVariant: "expert-comptable",
        dossiers: [{ label: "Dossier SAS MAILLARD-2026-02 · Émilie LAMBERT" }],
        affairesTotales: "3",
        affairesDepuis: "dossiers depuis 2025",
        affairesGold: false,
        caGenereCumul: "48 600 €",
        statutLabel: "Actif",
        statutVariant: "success",
      },
      {
        nom: 'Podcast "Patrimoine & Cie"',
        sousTitre: "Marc LEMAIRE · podcasteur",
        profil: "Média / influence",
        profilVariant: "media",
        dossiers: [{ label: "Dossier MARTINEAU-2026-04 · Jordan AGNESSENS" }],
        affairesTotales: "2",
        affairesDepuis: "dossiers depuis 2026",
        affairesGold: false,
        caGenereCumul: "32 400 €",
        statutLabel: "Émergent",
        statutVariant: "info",
      },
      {
        nom: "Maître Pascal BONNARD",
        sousTitre: "Aussi partenaire recommandable (cf. section 1)",
        profil: "Avocat",
        profilVariant: "avocat",
        dossiers: [{ label: "Dossier BERTHAUD-2026-03 · Marvin MOUTON" }],
        affairesTotales: "2",
        affairesDepuis: "dossiers depuis 2025",
        affairesGold: false,
        caGenereCumul: "28 800 €",
        statutLabel: "Actif",
        statutVariant: "success",
      },
    ],
    resteLabel: "… 17 autres apporteurs d'affaires · ",
    resteLien: "Voir l'intégralité (24)",
  },
};

export function getPartenairesScreen(): PartenairesScreen {
  return SCREEN;
}
