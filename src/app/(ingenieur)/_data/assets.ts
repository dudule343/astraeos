// Vue d'ensemble des assets du portefeuille de l'ingénieur (Julien VASSEUR).
// Source unique pour la page `assets/` (écran maquette `page-ing-assets-overview`).
// Valeurs reprises à l'identique de la maquette ingénieur v28 : c'est l'état
// « comme si un ingénieur avait saisi son portefeuille à la main ».

export type Trend = { period: string; value: string; dir: "up" | "down" };

export type SyntheseKpi = {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  trends: Trend[];
};

export type AxisStat = { label: string; value: string };

export type AxisCard = {
  href: string;
  /** Première ligne du titre (le saut de ligne est porté par `titleLine2`). */
  title: string;
  titleLine2?: string;
  /** Icône : id du svg dans la maquette (transposée en path inline côté page). */
  icon: "finance" | "shield" | "business" | "doc";
  value: string;
  valueUnit: string;
  caption: string;
  stats: AxisStat[];
};

export type AssetsOverview = {
  /** Hero porté de la maquette : `Assets <strong>du portefeuille</strong>`. */
  hero: {
    eyebrow: string;
    /** Début du H1, rendu au poids de base (600). */
    titleLead: string;
    /** Fin du H1, rendue en <strong> (700) comme dans la maquette. */
    titleStrong: string;
    sub: string;
  };
  syntheseHeader: { eyebrow: string; right: string };
  repartitionHeader: { eyebrow: string; right: string };
  synthese: SyntheseKpi[];
  axes: AxisCard[];
};

const overview: AssetsOverview = {
  hero: {
    eyebrow: "Assets du portefeuille · vue d'ensemble personnelle",
    titleLead: "Assets ",
    titleStrong: "du portefeuille",
    sub: "Vue consolidée des assets placés via votre portefeuille personnel · patrimoine sous gestion, contrats actifs, clients servis. Cliquez sur un axe pour ouvrir le détail.",
  },
  syntheseHeader: { eyebrow: "Synthèse", right: "Mon portefeuille · 2026" },
  repartitionHeader: {
    eyebrow: "Répartition par axe",
    right: "cliquez sur un axe pour le détail",
  },
  synthese: [
    {
      label: "Patrimoine sous gestion",
      value: "2 100 000",
      unit: "€",
      meta: "cumul placé via votre portefeuille",
      trends: [
        { period: "M-1", value: "+2,3 %", dir: "up" },
        { period: "T-1", value: "+6,8 %", dir: "up" },
        { period: "N-1", value: "+18 %", dir: "up" },
      ],
    },
    {
      label: "Contrats actifs",
      value: "22",
      meta: "11 financiers · 9 assurance · 2 suivis en conseil",
      trends: [
        { period: "M-1", value: "+2", dir: "up" },
        { period: "T-1", value: "+4", dir: "up" },
        { period: "N-1", value: "+6", dir: "up" },
      ],
    },
    {
      label: "Clients servis",
      value: "7",
      meta: "clients en cours de suivi (honoraires)",
      trends: [
        { period: "M-1", value: "+1", dir: "up" },
        { period: "T-1", value: "+1", dir: "up" },
        { period: "N-1", value: "+2", dir: "up" },
      ],
    },
  ],
  axes: [
    {
      href: "/espace-ingenieur/assets-financier",
      title: "Investissement",
      titleLine2: "financier",
      icon: "finance",
      value: "1 720 000",
      valueUnit: "€",
      caption: "Encours sous gestion",
      stats: [
        { label: "Contrats", value: "11" },
        { label: "Clients", value: "6 / 7" },
      ],
    },
    {
      href: "/espace-ingenieur/assets-assurance",
      title: "Assurance",
      // 2e ligne factice (espace insécable) : porte le `<br>&nbsp;` de la
      // maquette pour que le titre tienne sur 2 lignes comme ses 3 voisines,
      // sinon value/caption/stats remontent et cassent l'alignement de la grille.
      titleLine2: " ",
      icon: "shield",
      value: "9",
      valueUnit: "contrats",
      caption: "Tous types confondus",
      stats: [
        { label: "Clients", value: "5 / 7" },
        { label: "Frais", value: "8 400 €" },
      ],
    },
    {
      href: "/espace-ingenieur/assets-immobilier",
      title: "Investissement",
      titleLine2: "immobilier",
      icon: "business",
      value: "2",
      valueUnit: "projets",
      caption: "Montant cumulé · 180 000 €",
      stats: [
        { label: "Clients", value: "2 / 7" },
        { label: "Ticket", value: "90 000 €" },
      ],
    },
    {
      href: "/espace-ingenieur/assets-honoraires",
      title: "Honoraires",
      titleLine2: "de conseil",
      icon: "doc",
      value: "48 800",
      valueUnit: "€",
      caption: "Honoraires facturés · 2026",
      stats: [
        { label: "Études", value: "4" },
        { label: "Moyen", value: "12 200 €" },
      ],
    },
  ],
};

export async function fetchAssetsOverview(): Promise<AssetsOverview> {
  return overview;
}
