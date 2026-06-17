import type { NextRequest } from "next/server";

/**
 * Limiteur de débit à fenêtre glissante, EN MÉMOIRE (process courant).
 *
 * Objectif : première couche de défense contre l'abus de facturation (endpoints
 * IA) et le DoS (endpoints publics d'upload). Best-effort uniquement.
 *
 * ⚠️ Limites connues en serverless (Vercel) :
 *  - L'état vit dans la mémoire d'une instance Lambda. Plusieurs instances en
 *    parallèle = plusieurs compteurs indépendants → la limite effective est
 *    `max × nombre d'instances`.
 *  - Une instance froide repart de zéro.
 *  Ce limiteur réduit donc fortement l'abus mais ne le borne pas durement.
 *  Pour une garantie stricte en prod, brancher un store partagé
 *  (Upstash Ratelimit / Redis) avec la MÊME signature `rateLimit(key, max, windowMs)`.
 */

// horodatages (ms) des hits récents, par clé.
const hits = new Map<string, number[]>();

// Purge paresseuse : on évite que la Map gonfle indéfiniment avec des clés mortes.
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number, windowMs: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, times] of hits) {
    const fresh = times.filter((t) => now - t < windowMs);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }
}

/**
 * Enregistre un hit pour `key` et indique s'il est autorisé.
 *
 * @param key      identité de l'appelant + route (cf. rateLimitKey).
 * @param max      nombre de requêtes autorisées dans la fenêtre.
 * @param windowMs largeur de la fenêtre glissante, en millisecondes.
 * @returns        true si autorisé, false si la limite est dépassée (→ 429).
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now, windowMs);

  const times = hits.get(key);
  const recent = times ? times.filter((t) => now - t < windowMs) : [];

  if (recent.length >= max) {
    // On ne ré-enregistre pas le hit refusé : la fenêtre se purge d'elle-même.
    hits.set(key, recent);
    return false;
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}

/** Extrait l'IP de l'appelant depuis les en-têtes de proxy (Vercel). */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    // x-forwarded-for : "client, proxy1, proxy2" → on prend le premier.
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Construit une clé de limitation = route + identité de l'appelant.
 * `identity` = cabinetId / token de session pour les routes authentifiées,
 * ou token de collecte pour les routes publiques. L'IP est toujours combinée
 * pour borner aussi les appels non identifiés derrière une même clé.
 */
export function rateLimitKey(
  route: string,
  identity: string | null | undefined,
  ip: string,
): string {
  return `${route}:${identity ?? "anon"}:${ip}`;
}
