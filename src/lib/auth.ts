import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Authentification du cabinet (espace réservé).
 *
 * Modèle : un seul code d'accès partagé (ASTRAEOS_ACCESS_CODE). Une fois validé,
 * on pose un cookie HttpOnly contenant un jeton signé HMAC-SHA256. Aucune base,
 * aucune dépendance npm — uniquement node:crypto.
 *
 * Runtime : ces fonctions tournent côté Node (route handlers + proxy.ts, qui en
 * Next 16 s'exécute sur le runtime Node.js). node:crypto est donc disponible.
 *
 * Jeton : "v1.<exp>.<hmac>"
 *   - exp  : horodatage ms d'expiration (now + 30 jours)
 *   - hmac : HMAC-SHA256(ASTRAEOS_AUTH_SECRET, "v1." + exp) en base64url
 */

export const SESSION_COOKIE = "astraeos_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours, en secondes
const SESSION_TTL_MS = SESSION_MAX_AGE * 1000;

function authSecret(): string {
  const secret = process.env.ASTRAEOS_AUTH_SECRET;
  if (!secret) {
    throw new Error("ASTRAEOS_AUTH_SECRET manquant");
  }
  return secret;
}

function hmac(payload: string): string {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

/** Compare deux chaînes en temps constant, sans throw sur longueurs différentes. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Construit un jeton de session signé, valable 30 jours. */
export function signSession(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `v1.${exp}`;
  return `${payload}.${hmac(payload)}`;
}

/** Vérifie un jeton : format v1, signature constante-temps, expiration non dépassée. */
export function verifySession(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expRaw, sig] = parts;
  if (version !== "v1") return false;

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= 0) return false;
  if (Date.now() > exp) return false;

  const expected = hmac(`v1.${expRaw}`);
  return safeEqual(sig, expected);
}

/** Lit et valide le cookie de session d'une requête. */
export function readSession(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/**
 * Garde pour handlers d'API : renvoie null si la session est valide,
 * sinon une réponse 401. À placer en tête de handler :
 *   const denied = requireAuth(req); if (denied) return denied;
 *
 * DÉSACTIVÉE : le code d'accès cabinet a été retiré, les espaces et APIs
 * sont en accès libre. Pour réactiver, restaurer le corps d'origine :
 *   if (readSession(req)) return null;
 *   return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function requireAuth(_req: NextRequest): NextResponse | null {
  return null;
}

/** Options du cookie de session, factorisées pour set + clear cohérents. */
export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
