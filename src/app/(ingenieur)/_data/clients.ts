/**
 * Source de vérité unique pour l'écran « Tous mes clients » (page-ing-clients).
 * Exemples EXACTS de la maquette v28 — comme si l'ingénieur Julien VASSEUR
 * avait saisi son portefeuille à la main. Aucune valeur en dur dans la page.
 */

export type ClientType = "Personne physique" | "Personne morale";

/**
 * Style de badge de statut, repris des couplets background/color de la maquette.
 * La maquette utilise DEUX dorés distincts :
 *  - "gold"       => var(--gold-100), doré très pâle  (ex. « Restitution demain »)
 *  - "goldStrong" => rgba(198,142,14,0.15), doré translucide soutenu (ex. « Collecte 67 % »)
 */
export type StatutVariant = "gold" | "goldStrong" | "orange" | "info" | "green";

export type Client = {
  /** slug d'URL vers la fiche client ingénieur (route clients/[id]). */
  slug: string;
  initiales: string;
  nom: string;
  details: string;
  type: ClientType;
  date1ereEtude: string;
  derniereInteraction: string;
  caGenere2026: string;
  /** true => CA mis en valeur en doré (cell-money gold), comme le 1er client. */
  caGold: boolean;
  statutLabel: string;
  statutVariant: StatutVariant;
};

export type ClientsKpi = {
  label: string;
  /** value est du JSX-friendly markup déjà découpé : voir la page pour le rendu. */
  meta: string;
  compare: { period: string; value: string; direction: "up" | "down" }[];
};

/**
 * KPI central « Répartition personnes physiques / personnes morales ».
 * La maquette ne suit pas le gabarit standard (deux nombres + libellés inline,
 * un séparateur point médian), d'où ce type dédié plutôt que ClientsKpi.
 */
export type ClientsRepartitionKpi = {
  label: string;
  nbPhysiques: string;
  libellePhysiques: string;
  nbMorales: string;
  libelleMorales: string;
  meta: string;
  compare: { period: string; value: string; direction: "up" | "down" }[];
};

export type ClientsScreen = {
  heroEyebrow: string;
  heroSub: string;
  kpiClientsActifs: ClientsKpi & { value: string };
  kpiRepartition: ClientsRepartitionKpi;
  kpiTicketMoyen: ClientsKpi & { valueAmount: string };
  clients: Client[];
  totalPortefeuille: string;
  totalMeta: string;
  cardTitle: string;
};

const CLIENTS: Client[] = [
  {
    slug: "dupont-topin",
    initiales: "BD",
    nom: "Bertrand & Monique DUPONT-TOPIN",
    details: "62 ans · 58 ans · Paris 7e · mariés",
    type: "Personne physique",
    date1ereEtude: "15/03/2025",
    derniereInteraction: "06/05/2026 · étude livrée",
    caGenere2026: "62 800 €",
    caGold: true,
    statutLabel: "Restitution demain",
    statutVariant: "gold",
  },
  {
    slug: "huyghe",
    initiales: "AH",
    nom: "Albert & Cécile HUYGHE",
    details: "58 ans · 55 ans · Versailles · mariés",
    type: "Personne physique",
    date1ereEtude: "22/01/2025",
    derniereInteraction: "25/04/2026 · collecte complète",
    caGenere2026: "48 200 €",
    caGold: false,
    statutLabel: "Production · retard 3j",
    statutVariant: "orange",
  },
  {
    slug: "lefebvre-sas",
    initiales: "GL",
    nom: "SAS GROUPE LEFEBVRE",
    details: "SIRET 812 345 678 · Paris 8e",
    type: "Personne morale",
    date1ereEtude: "10/04/2025",
    derniereInteraction: "09/05/2026 · doc collecte envoyé",
    caGenere2026: "52 400 €",
    caGold: false,
    statutLabel: "RDV demain",
    statutVariant: "info",
  },
  {
    slug: "delannoy",
    initiales: "FD",
    nom: "Famille DELANNOY",
    details: "Bruno 48 ans · Hélène 46 ans · Neuilly",
    type: "Personne physique",
    date1ereEtude: "05/06/2025",
    derniereInteraction: "03/04/2026 · entretien découverte",
    caGenere2026: "38 400 €",
    caGold: false,
    statutLabel: "KYC en attente 32j",
    statutVariant: "orange",
  },
  {
    slug: "bonnard",
    initiales: "MB",
    nom: "Maître BONNARD",
    details: "Avocat 52 ans · Paris 16e · personne seule",
    type: "Personne physique",
    date1ereEtude: "18/02/2025",
    derniereInteraction: "08/05/2026 · 8/12 docs reçus",
    caGenere2026: "32 800 €",
    caGold: false,
    statutLabel: "Collecte 67 %",
    statutVariant: "goldStrong",
  },
  {
    slug: "lamoureux",
    initiales: "PL",
    nom: "Pierre LAMOUREUX",
    details: "Chef d'entreprise 64 ans · Saint-Cloud · personne seule",
    type: "Personne physique",
    date1ereEtude: "04/03/2024",
    derniereInteraction: "18/04/2026 · étude restituée",
    caGenere2026: "28 600 €",
    caGold: false,
    statutLabel: "Suivi récurrent",
    statutVariant: "green",
  },
  {
    slug: "lacroix",
    initiales: "ML",
    nom: "Maître LACROIX",
    details: "Notaire 56 ans · Paris 8e · personne seule",
    type: "Personne physique",
    date1ereEtude: "12/01/2024",
    derniereInteraction: "02/05/2026 · RDV trimestriel",
    caGenere2026: "16 800 €",
    caGold: false,
    statutLabel: "Suivi récurrent",
    statutVariant: "green",
  },
];

const SCREEN: ClientsScreen = {
  heroEyebrow: "Mon portefeuille · cumul depuis janvier 2026",
  heroSub:
    "Votre portefeuille personnel · 7 clients actifs accompagnés sur 2026, dont 6 personnes physiques et 1 personne morale · cliquez sur une ligne pour ouvrir la fiche client détaillée.",
  kpiClientsActifs: {
    label: "Clients actifs",
    value: "7",
    meta: "portefeuille personnel",
    compare: [
      { period: "M-1", value: "+1", direction: "up" },
      { period: "N-1", value: "+2", direction: "up" },
    ],
  },
  kpiRepartition: {
    label: "Répartition personnes physiques / personnes morales",
    nbPhysiques: "6",
    libellePhysiques: "personnes physiques",
    nbMorales: "1",
    libelleMorales: "personne morale",
    meta: "6 personnes physiques (couples ou seuls) · 1 personne morale (SAS)",
    compare: [
      { period: "M-1", value: "P. physiques ▲ +1", direction: "up" },
      { period: "N-1", value: "P. physiques ▲ +2 · P. morale =", direction: "up" },
    ],
  },
  kpiTicketMoyen: {
    label: "Ticket moyen par client",
    valueAmount: "40 000",
    meta: "280 000 € / 7 clients · 2026",
    compare: [
      { period: "M-1", value: "+2 200 €", direction: "up" },
      { period: "N-1", value: "+12 %", direction: "up" },
    ],
  },
  clients: CLIENTS,
  totalPortefeuille: "280 000 €",
  totalMeta: "7 clients actifs · cumul 2026",
  cardTitle: "Tous mes clients · 7 fiches",
};

export function getClientsScreen(): ClientsScreen {
  return SCREEN;
}
