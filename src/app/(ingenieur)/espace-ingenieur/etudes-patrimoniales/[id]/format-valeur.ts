/**
 * Helpers PURS de formatage/parse des montants saisis dans le document d'audit.
 *
 * Aucun DOM, aucun import client/serveur : réutilisables partout (sections,
 * ValeurEditable, tests). Format français (espace insécable comme séparateur de
 * milliers, virgule décimale).
 */

export type ValeurFormat = "euro" | "percent" | "number" | "text";

/** Tiret cadratin proscrit : on affiche un tiret demi-cadratin pour « vide ». */
export const DASH = "—";

const nf0 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

/** Vrai si la valeur est un nombre fini exploitable. */
function estNombre(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** « 1 167 000 € » (entier groupé). null/NaN → DASH. */
export function formatEuro(v: number | null | undefined): string {
  if (!estNombre(v)) return DASH;
  return `${nf0.format(v)} €`;
}

/** « 19,4 % » (une décimale au plus selon la valeur). null/NaN → DASH. */
export function formatPercent(v: number | null | undefined): string {
  if (!estNombre(v)) return DASH;
  return `${nf2.format(v)} %`;
}

/** « 1 167 000 » (groupé, sans unité). null/NaN → DASH. */
export function formatNombre(v: number | null | undefined): string {
  if (!estNombre(v)) return DASH;
  return nf0.format(v);
}

/**
 * Formate une valeur stockée selon son format d'affichage.
 * Renvoie `null` quand il n'y a rien à afficher (à charge de l'appelant
 * d'afficher le placeholder / DASH).
 */
export function formatValeur(
  value: number | string | null | undefined,
  format: ValeurFormat,
): string | null {
  if (format === "text") {
    const s = typeof value === "string" ? value : value == null ? "" : String(value);
    return s.trim() ? s : null;
  }
  if (!estNombre(value)) return null;
  if (format === "euro") return formatEuro(value);
  if (format === "percent") return formatPercent(value);
  return formatNombre(value);
}

/**
 * Valeur BRUTE à pré-remplir dans l'input à l'entrée en édition.
 * Pour les nombres : virgule décimale française, sans séparateur de milliers ni
 * unité (saisie naturelle). Pour le texte : la chaîne telle quelle.
 */
export function valeurBrute(
  value: number | string | null | undefined,
  format: ValeurFormat,
): string {
  if (format === "text") {
    return typeof value === "string" ? value : value == null ? "" : String(value);
  }
  if (!estNombre(value)) return "";
  return String(value).replace(".", ",");
}

/**
 * Parse une saisie utilisateur en nombre : retire espaces (y compris
 * insécables), « € », « % », séparateurs de milliers ; gère la virgule
 * décimale. Renvoie `null` si la saisie est vide ou non numérique.
 */
export function parseMontant(input: string): number | null {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s) return null;

  // Retire devise, pourcentage et tous les espaces (normal, insécable, fine).
  s = s.replace(/[€%]/g, "").replace(/[\s  ]/g, "").trim();
  if (!s) return null;

  // Sépare la dernière virgule/point comme séparateur décimal ; les autres
  // (séparateurs de milliers éventuels) sont supprimés.
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  const decPos = Math.max(lastComma, lastDot);
  if (decPos >= 0) {
    const entier = s.slice(0, decPos).replace(/[.,]/g, "");
    const frac = s.slice(decPos + 1).replace(/[.,]/g, "");
    s = `${entier}.${frac}`;
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
