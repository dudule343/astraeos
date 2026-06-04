import { NextResponse, type NextRequest } from "next/server";

import { buildAuthorizeUrl, isOAuthConfigured , signState } from "@/lib/google-oauth";

/**
 * GET /api/auth/google/start?engineer=luc-thilliez
 *
 * - Si OAuth configuré → 302 vers la mire Google officielle.
 * - Sinon → 302 vers /api/auth/google/demo (fallback démo non-fonctionnel).
 *
 * Le `state` contient l'engineer_slug encodé + un nonce signé pour CSRF.
 */
export function GET(req: NextRequest) {
  const engineer = req.nextUrl.searchParams.get("engineer") || "luc-thilliez";

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
