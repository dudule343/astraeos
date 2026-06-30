/**
 * chart-geom — helpers PURS de géométrie pour les graphiques SVG des études.
 *
 * Aucune dépendance (pas de DOM, pas d'import serveur) : ces fonctions calculent
 * uniquement des nombres et des chaînes de geometry à partir des montants saisis
 * par client (donnees.valeurs[cle]). La forme du graphique DÉCOULE des valeurs ;
 * si rien n'est saisi (tout nul / total nul), on renvoie un état VIDE neutre.
 *
 * Garanties : aucune fonction ne renvoie jamais NaN ni Infinity. Une valeur
 * nulle / undefined / non finie est traitée comme 0. Un total nul produit un
 * état vide (hasData=false) plutôt qu'une division par zéro.
 */

/** Circonférence par défaut d'un anneau de rayon 54 (cx=cy=70, r=54). */
export const DEFAULT_CIRCUMFERENCE = 2 * Math.PI * 54;

type Num = number | null | undefined;

/** Convertit une entrée en nombre fini positif ou nul (jamais NaN/Infinity/négatif). */
function toFinite(value: Num): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return value < 0 ? 0 : value;
}

/** Vrai si au moins une valeur finie strictement positive est présente. */
export function hasData(values: Num[]): boolean {
  if (!Array.isArray(values)) return false;
  return values.some((v) => toFinite(v) > 0);
}

/** Fraction sûre dans [0, 1]. Renvoie 0 si le total est nul ou non valide. */
export function pct(value: Num, total: Num): number {
  const t = toFinite(total);
  if (t <= 0) return 0;
  const f = toFinite(value) / t;
  if (!Number.isFinite(f)) return 0;
  return f < 0 ? 0 : f > 1 ? 1 : f;
}

export interface DonutSegment {
  /** Attribut stroke-dasharray : `${longueurArc} ${reste}`. */
  dasharray: string;
  /** Attribut stroke-dashoffset (négatif : décalage cumulé des segments précédents). */
  dashoffset: number;
  /** Part du segment dans le total, dans [0, 1]. */
  fraction: number;
}

export interface DonutResult {
  segments: DonutSegment[];
  /** Faux si total <= 0 : l'appelant affiche un anneau gris neutre. */
  hasData: boolean;
  /** Somme des valeurs finies positives. */
  total: number;
}

/**
 * Segments d'un donut à partir de montants. La part de chaque segment est
 * proportionnelle au total. Si le total est nul, chaque segment est plat
 * (dasharray "0 C", offset 0) et hasData=false : à afficher en anneau neutre.
 */
export function donutSegments(
  values: Num[],
  opts: { circumference?: number } = {},
): DonutResult {
  const C =
    typeof opts.circumference === "number" && Number.isFinite(opts.circumference) && opts.circumference > 0
      ? opts.circumference
      : DEFAULT_CIRCUMFERENCE;

  const safe = Array.isArray(values) ? values.map(toFinite) : [];
  const total = safe.reduce((a, b) => a + b, 0);

  if (total <= 0) {
    return {
      segments: safe.map(() => ({ dasharray: `0 ${round(C)}`, dashoffset: 0, fraction: 0 })),
      hasData: false,
      total: 0,
    };
  }

  let cumulative = 0;
  const segments = safe.map((v) => {
    const fraction = v / total;
    const arc = fraction * C;
    const seg: DonutSegment = {
      dasharray: `${round(arc)} ${round(C - arc)}`,
      dashoffset: -round(cumulative),
      fraction,
    };
    cumulative += arc;
    return seg;
  });

  return { segments, hasData: true, total };
}

export interface BarResult {
  /** Hauteurs en px, proportionnelles au max ; 0 pour une valeur nulle. */
  heights: number[];
  /** Faux si toutes les valeurs sont nulles. */
  hasData: boolean;
}

/**
 * Hauteurs de barres en px. max = max(values) si non fourni. Une valeur nulle
 * donne 0 ; si tout est nul, hasData=false et toutes les hauteurs valent 0.
 */
export function barHeights(values: Num[], opts: { height: number; max?: number }): BarResult {
  const H = toFinite(opts.height);
  const safe = Array.isArray(values) ? values.map(toFinite) : [];
  const max =
    typeof opts.max === "number" && Number.isFinite(opts.max) && opts.max > 0
      ? opts.max
      : safe.reduce((a, b) => Math.max(a, b), 0);

  if (max <= 0 || H <= 0) {
    return { heights: safe.map(() => 0), hasData: false };
  }

  return {
    heights: safe.map((v) => round((v / max) * H)),
    hasData: safe.some((v) => v > 0),
  };
}

export interface DivergeResult {
  /** Largeur en px de la barre de gauche. */
  leftW: number;
  /** Largeur en px de la barre de droite. */
  rightW: number;
}

/**
 * Paire de barres divergentes (gauche / droite) proportionnelles.
 * max = max(|left|, |right|) si non fourni. Total nul -> deux largeurs à 0.
 */
export function divergePair(
  left: Num,
  right: Num,
  opts: { max?: number; width: number },
): DivergeResult {
  const W = toFinite(opts.width);
  const l = toFinite(left);
  const r = toFinite(right);
  const max =
    typeof opts.max === "number" && Number.isFinite(opts.max) && opts.max > 0
      ? opts.max
      : Math.max(l, r);

  if (max <= 0 || W <= 0) {
    return { leftW: 0, rightW: 0 };
  }

  return {
    leftW: round((l / max) * W),
    rightW: round((r / max) * W),
  };
}

/** Arrondi à 1 décimale, en éliminant tout résidu NaN/Infinity. */
function round(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}
