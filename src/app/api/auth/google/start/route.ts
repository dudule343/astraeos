import { NextResponse, type NextRequest } from "next/server";

import {
  buildAuthorizeUrl,
  engineerSlugFromContext,
  isOAuthConfigured,
  signState,
} from "@/lib/google-oauth";
import { getSessionContext } from "@/lib/auth/context";

/**
 * GET /api/auth/google/start
 *
 * - Si OAuth configuré → 302 vers la mire Google officielle.
 * - Sinon → 302 vers /api/auth/google/demo (fallback démo non-fonctionnel).
 *
 * L'OAuth est initié POUR l'ingénieur de la session : le slug encodé dans le
 * `state` est l'id de session (jamais un ?engineer arbitraire), si bien qu'un
 * ingénieur ne peut connecter Google que sur son propre store de tokens.
 */
export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const engineer = engineerSlugFromContext(ctx);

  if (!isOAuthConfigured()) {
    const fallback = new URL("/api/auth/google/demo", req.nextUrl.origin);
    fallback.searchParams.set("engineer", engineer);
    return NextResponse.redirect(fallback);
  }

  // State auto-signé (HMAC + TTL) — ne dépend plus du cookie au callback.
  const state = signState({ engineer });

  const authorizeUrl = buildAuthorizeUrl(state);
  const res = NextResponse.redirect(authorizeUrl);
  // Cookie HttpOnly pour vérifier le state au callback (CSRF)
  res.cookies.set("astr_google_state", state, {
    httpOnly: true,
    secure: req.nextUrl.protocol === "https:",
    sameSite: "lax",
    maxAge: 600, // 10 min
    path: "/",
  });
  return res;
}
