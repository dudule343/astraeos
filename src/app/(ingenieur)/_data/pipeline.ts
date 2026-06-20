/**
 * Pipeline Kanban · 6 étapes du parcours patrimonial (vue Julien VASSEUR).
 * Données d'exemple portées EXACTEMENT depuis la maquette ingénieur
 * (page-ing-pipeline, ligne 4779). Source unique lue par la page Kanban.
 */

export interface PipelineHero {
  eyebrow: string;
  sub: string;
}

export interface PipelineKpi {
  label: string;
  value: string;
  /** "gold" pour la valeur dorée, "alert" pour l'orange, sinon null. */
  tone: "gold" | "alert" | null;
  /** Suffixe affiché dans la valeur (ex. « j » pour jours). */
  unit?: string;
  meta: string;
}

/** Variante visuelle d'une carte selon l'étape / l'état. */
export type CardVariant = "default" | "alert" | "highlight";

/** Badge porté sous une carte. */
export interface CardBadge {
  label: string;
  /** Style du badge tel que dans la maquette. */
  style: "gold" | "blue" | "alert" | "warn" | "success";
}

export interface PipelineCard {
  /** Identifiant stable utilisé pour le lien vers la fiche dossier. */
  id: string;
  name: string;
  sub: string;
  variant: CardVariant;
  badge?: CardBadge;
  /** Barre de progression (collecte de documents). 0–100, ou null. */
  progressPct?: number;
  /** Carte cliquable vers la fiche dossier. */
  linkable: boolean;
}

/** En-tête de colonne (étape du parcours). */
export interface PipelineColumn {
  step: number;
  title: string;
  subtitle: string;
  count: number;
  /** Variante de l'en-tête de colonne. */
  headerVariant: "gold-soft" | "plain" | "gold-strong";
  /** Pastille de comptage. */
  countTone: "gold" | "navy" | "gold-300";
  /** La colonne « Production » a une bordure dorée pleine. */
  emphasized: boolean;
  cards: PipelineCard[];
  /** Ligne « … N autres » en pied de colonne, ou null. */
  footerNote?: string;
}

export interface PipelineScreen {
  hero: PipelineHero;
  kpis: PipelineKpi[];
  columns: PipelineColumn[];
}

const SCREEN: PipelineScreen = {
  hero: {
    eyebrow: "Parcours patrimonial · 6 étapes du dossier · vue par Julien VASSEUR",
    sub: "Vue Kanban de l'ensemble de mes dossiers en cours · 9 dossiers actifs répartis sur 6 étapes du parcours · 14 dossiers déjà livrés en 2026 · 28 clients en phase de suivi.",
  },
  kpis: [
    { label: "Dossiers actifs", value: "9", tone: null, meta: "en cours · hors suivi" },
    { label: "Études livrées", value: "14", tone: "gold", meta: "cumul 2026" },
    { label: "Délai moyen étude", value: "42", tone: null, unit: "j", meta: "collecte → restitution" },
    { label: "Dossiers en alerte", value: "2", tone: "alert", meta: "KYC + production en retard" },
  ],
  columns: [
    {
      step: 1,
      title: "Prospects",
      subtitle: "Nouveau contact · 1er RDV à organiser",
      count: 3,
      headerVariant: "gold-soft",
      countTone: "gold",
      emphasized: false,
      cards: [
        {
          id: "sas-groupe-lefebvre",
          name: "SAS GROUPE LEFEBVRE",
          sub: "Personne morale · RDV demain 10h",
          variant: "default",
          badge: { label: "Doc collecte envoyé", style: "gold" },
          linkable: true,
        },
        {
          id: "famille-martinez",
          name: "Famille MARTINEZ",
          sub: "Régime de l'union · contact initial 05/05",
          variant: "default",
          badge: { label: "À recontacter", style: "blue" },
          linkable: false,
        },
        {
          id: "mme-rousseau",
          name: "Mme ROUSSEAU",
          sub: "Recommandation Maître BONNARD",
          variant: "default",
          badge: { label: "Nouveau · à qualifier", style: "blue" },
          linkable: false,
        },
      ],
    },
    {
      step: 2,
      title: "Conformité",
      subtitle: "KYC, LCB-FT, entrée en relation",
      count: 2,
      headerVariant: "plain",
      countTone: "navy",
      emphasized: false,
      cards: [
        {
          id: "famille-delannoy-kyc",
          name: "Famille DELANNOY",
          sub: "KYC en attente · 32 jours",
          variant: "alert",
          badge: { label: "⚠ Alerte KYC", style: "alert" },
          linkable: false,
        },
        {
          id: "thomas-lacroix",
          name: "M. THOMAS LACROIX",
          sub: "Vérification Netheos en cours",
          variant: "default",
          badge: { label: "PEP check", style: "warn" },
          linkable: false,
        },
      ],
    },
    {
      step: 3,
      title: "Collecte",
      subtitle: "Espace sécurisé · documents client",
      count: 3,
      headerVariant: "plain",
      countTone: "navy",
      emphasized: false,
      cards: [
        {
          id: "maitre-bonnard",
          name: "Maître BONNARD",
          sub: "8/12 documents reçus",
          variant: "default",
          progressPct: 67,
          linkable: true,
        },
        {
          id: "leroux-chen",
          name: "M. LEROUX & Mme CHEN",
          sub: "4/9 documents · attente client",
          variant: "default",
          progressPct: 44,
          linkable: false,
        },
        {
          id: "sci-les-tilleuls",
          name: "SCI LES TILLEULS",
          sub: "11/14 documents reçus",
          variant: "default",
          progressPct: 79,
          linkable: false,
        },
      ],
    },
    {
      step: 4,
      title: "Production",
      subtitle: "Rédaction étude · 4 parties",
      count: 1,
      headerVariant: "gold-strong",
      countTone: "gold",
      emphasized: true,
      cards: [
        {
          id: "huyghe",
          name: "Albert & Cécile HUYGHE",
          sub: "Restitution prévue 15/05",
          variant: "alert",
          badge: { label: "⚠ Retard 3j", style: "alert" },
          linkable: true,
        },
      ],
    },
    {
      step: 5,
      title: "Restituées",
      subtitle: "Études livrées · cumul 2026",
      count: 14,
      headerVariant: "plain",
      countTone: "gold-300",
      emphasized: false,
      cards: [
        {
          id: "dupont-topin",
          name: "Bertrand & M. DUPONT-TOPIN",
          sub: "Livrée 06/05 · restit demain 14h",
          variant: "highlight",
          badge: { label: "RDV restitution J-1", style: "success" },
          linkable: true,
        },
        {
          id: "mme-le-gall",
          name: "Mme LE GALL",
          sub: "Restitution faite 28/04/2026",
          variant: "default",
          linkable: false,
        },
      ],
      footerNote: "… 12 autres",
    },
    {
      step: 6,
      title: "Suivi",
      subtitle: "Clients en suivi annuel",
      count: 28,
      headerVariant: "plain",
      countTone: "navy",
      emphasized: false,
      cards: [
        {
          id: "famille-delannoy-suivi",
          name: "Famille DELANNOY",
          sub: "Bilan annuel · RDV 16/05",
          variant: "default",
          linkable: false,
        },
        {
          id: "m-bertrand",
          name: "M. BERTRAND",
          sub: "Suivi · prochain RDV 22/06",
          variant: "default",
          linkable: false,
        },
      ],
      footerNote: "… 26 autres",
    },
  ],
};

export function getPipelineScreen(): PipelineScreen {
  return SCREEN;
}

/**
 * Construit le CSV du pipeline (une ligne par dossier de chaque colonne),
 * source unique = SCREEN. Utilisé par le bouton « Exporter » du hero.
 */
export function buildPipelineCsv(screen: PipelineScreen = SCREEN): string {
  const sep = ";";
  const escape = (v: string) => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

  const header = ["Étape", "Colonne", "Dossier", "Détail", "Statut", "Collecte"];
  const rows: string[][] = [];

  for (const col of screen.columns) {
    for (const card of col.cards) {
      rows.push([
        String(col.step),
        col.title,
        card.name,
        card.sub,
        card.badge ? card.badge.label : "",
        typeof card.progressPct === "number" ? `${card.progressPct}%` : "",
      ]);
    }
  }

  return [header, ...rows].map((r) => r.map(escape).join(sep)).join("\n");
}
