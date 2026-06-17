// Formatteurs purs, sans dépendance serveur — importables côté client ET serveur.
// (Séparés de data.ts qui, lui, importe le contexte session server-only.)

export function fmtEur(n: number | null): string {
  if (n == null || !Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

export function fmtCount(n: number | null): string {
  if (n == null || n === 0) return "—";
  return String(n);
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
