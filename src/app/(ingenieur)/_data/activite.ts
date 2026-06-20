/**
 * Source de vérité unique pour l'écran « Mon activité commerciale »
 * (page-ing-activite). Exemples EXACTS de la maquette v28, comme si
 * l'ingénieur Julien VASSEUR pilotait sa propre activité. Aucune valeur
 * en dur dans le composant : la page lit tout depuis ce module.
 */

export type ActiviteKpi = {
  label: string;
  value: string;
  unit?: string;
  /** doré (taux), orange (retard) ou défaut (navy). */
  tone?: "gold" | "alert";
  meta: string;
};

/** Une colonne du bandeau « délais moyens entre les étapes du parcours ». */
export type DelaiEtape = {
  step: string;
  jours: string;
  transition: string;
  /** texte comparatif sous la colonne. */
  ecart: string;
  /** couleur de l'écart : vert (gain), orange (perte) ou neutre. */
  ecartTone: "green" | "orange" | "neutral";
  /** colonne « cumul total » mise en doré et bord doré. */
  cumul?: boolean;
};

/** Sévérité de l'action en retard : oriente la couleur de la pastille. */
export type ActionSeverity = "orange" | "gold";

export type ActionRetard = {
  severity: ActionSeverity;
  titre: string;
  detail: string;
  /** libellé du bouton d'action (Relancer / Reprendre). */
  cta: string;
  /** route réelle vers laquelle pointe le bouton. */
  href: string;
};

export type SourceAcquisition = {
  label: string;
  count: string;
  /** largeur de la barre, ex. "57%". */
  pct: string;
  /** dégradé de la barre, repris à l'identique de la maquette. */
  barStyle: "gold" | "navy" | "navy-200";
  /** count affiché en doré (recommandations) ou en navy. */
  countGold: boolean;
};

/** Style de badge « Type » de RDV : couplet background/color de la maquette. */
export type BadgeStyle =
  | { kind: "gold" }
  | { kind: "success" }
  | { kind: "info" }
  | { kind: "alert" };

/** Style de badge « Étape » dans le tableau des prochains RDV. */
export type EtapeBadge = { label: string; style: "success" | "gold" | "alert" };

export type ProchainRdv = {
  date: string;
  /** sous-ligne sous la date (Demain / Après-demain), optionnelle. */
  dateMeta?: string;
  client: string;
  typeLabel: string;
  typeStyle: BadgeStyle;
  lieu: string;
  etape: EtapeBadge;
  /** route réelle ouverte par le bouton « Préparer ». */
  href: string;
};

export type ActiviteScreen = {
  heroEyebrow: string;
  heroSub: string;
  kpis: ActiviteKpi[];
  delaisTitre: string;
  delaisMeta: string;
  delais: DelaiEtape[];
  actionsBadge: string;
  actions: ActionRetard[];
  sourcesMeta: string;
  sources: SourceAcquisition[];
  sourcesLecture: string;
  rdvMeta: string;
  rdv: ProchainRdv[];
};

const SCREEN: ActiviteScreen = {
  heroEyebrow: "Mon activité commerciale · pilotage opérationnel",
  heroSub:
    "Pilotage de votre activité personnelle · rendez-vous tenus et à venir, actions en retard, délais de production et sources d'acquisition de vos clients.",
  kpis: [
    {
      label: "Rendez-vous · 30 derniers jours",
      value: "14",
      meta: "9 réalisés · 5 à venir cette semaine",
    },
    {
      label: "Taux RDV → étude lancée",
      value: "64",
      unit: "%",
      tone: "gold",
      meta: "cumul 2026 · ▲ +8 pts vs 2025",
    },
    {
      label: "Actions en retard",
      value: "3",
      tone: "alert",
      meta: "2 KYC · 1 relance collecte",
    },
    {
      label: "Délai moyen prospect → restitution",
      value: "42",
      unit: "jours",
      meta: "objectif cabinet · 45 jours · ▼ -6 % vs N-1",
    },
  ],
  delaisTitre: "Délais moyens · entre les étapes du parcours patrimonial",
  delaisMeta: "cumul depuis janvier 2026",
  delais: [
    {
      step: "Étape 01 → 02",
      jours: "5",
      transition: "Prospect → Conformité",
      ecart: "▼ -2j vs cabinet",
      ecartTone: "green",
    },
    {
      step: "Étape 02 → 03",
      jours: "8",
      transition: "Conformité → Collecte",
      ecart: "= moyenne cabinet",
      ecartTone: "neutral",
    },
    {
      step: "Étape 03 → 04",
      jours: "12",
      transition: "Collecte → Production",
      ecart: "▲ +3j vs cabinet",
      ecartTone: "orange",
    },
    {
      step: "Étape 04 → 05",
      jours: "14",
      transition: "Production → Restitution",
      ecart: "▼ -4j vs cabinet",
      ecartTone: "green",
    },
    {
      step: "Cumul total",
      jours: "42",
      transition: "Prospect → Restitution",
      ecart: "▼ -3j vs cabinet (45j)",
      ecartTone: "green",
      cumul: true,
    },
  ],
  actionsBadge: "3 actions",
  actions: [
    {
      severity: "orange",
      titre: "Famille DELANNOY · KYC en attente",
      detail: "Conformité bloquée depuis 32 jours · relance le 03/04/2026",
      cta: "Relancer",
      href: "/espace-ingenieur/conformite",
    },
    {
      severity: "orange",
      titre: "Albert & Cécile HUYGHE · production en retard",
      detail: "Étude à finaliser · échéance dépassée de 3 jours",
      cta: "Reprendre",
      href: "/espace-ingenieur/etudes",
    },
    {
      severity: "gold",
      titre: "Maître BONNARD · collecte 8 / 12 docs",
      detail: "4 documents manquants · dernière relance il y a 9 jours",
      cta: "Relancer",
      href: "/espace-ingenieur/collectes",
    },
  ],
  sourcesMeta: "cumul 2026",
  sources: [
    {
      label: "Recommandations clients",
      count: "4 clients",
      pct: "57%",
      barStyle: "gold",
      countGold: true,
    },
    {
      label: "Apporteurs d'affaires",
      count: "2 clients",
      pct: "29%",
      barStyle: "navy",
      countGold: false,
    },
    {
      label: "Réseau personnel",
      count: "1 client",
      pct: "14%",
      barStyle: "navy-200",
      countGold: false,
    },
  ],
  sourcesLecture:
    "57 % de vos nouveaux clients viennent des recommandations de clients existants — votre taux de fidélisation est très fort.",
  rdvMeta: "5 RDV cette semaine",
  rdv: [
    {
      date: "12/05/2026 · 14h00",
      dateMeta: "Demain",
      client: "Bertrand & Monique DUPONT-TOPIN",
      typeLabel: "Restitution étude",
      typeStyle: { kind: "gold" },
      lieu: "Cabinet Paris Étoile",
      etape: { label: "Étape 05", style: "success" },
      href: "/espace-ingenieur/clients/dupont-topin",
    },
    {
      date: "13/05/2026 · 10h30",
      dateMeta: "Après-demain",
      client: "SAS GROUPE LEFEBVRE",
      typeLabel: "Suivi étude",
      typeStyle: { kind: "info" },
      lieu: "Visio (Zoom)",
      etape: { label: "Étape 04", style: "gold" },
      href: "/espace-ingenieur/clients/lefebvre-sas",
    },
    {
      date: "14/05/2026 · 09h00",
      client: "Famille DELANNOY",
      typeLabel: "Relance KYC",
      typeStyle: { kind: "alert" },
      lieu: "Téléphone",
      etape: { label: "Étape 02", style: "alert" },
      href: "/espace-ingenieur/clients/delannoy",
    },
    {
      date: "15/05/2026 · 11h00",
      client: "Maître BONNARD",
      typeLabel: "Point collecte",
      typeStyle: { kind: "gold" },
      lieu: "Cabinet de Maître BONNARD · Paris 16e",
      etape: { label: "Étape 03", style: "gold" },
      href: "/espace-ingenieur/clients/bonnard",
    },
    {
      date: "16/05/2026 · 15h30",
      client: "Maître LACROIX",
      typeLabel: "RDV trimestriel",
      typeStyle: { kind: "success" },
      lieu: "Étude notariale · Paris 8e",
      etape: { label: "Étape 06", style: "success" },
      href: "/espace-ingenieur/clients/lacroix",
    },
  ],
};

export function getActiviteScreen(): ActiviteScreen {
  return SCREEN;
}
