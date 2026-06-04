import { NextResponse, type NextRequest } from "next/server";

import { readSession } from "@/lib/auth";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * En Next 16, le « middleware » est renommé `proxy` (runtime Node.js).
 * On conserve l'appel à updateSession (rafraîchissement de session Supabase),
 * puis on ajoute la garde du cabinet sur les zones protégées.
 *
 * Préfixes TOUJOURS publics (parcours client + endpoints client + OAuth + assets).
 * Évalués avant toute garde : ces chemins ne sont jamais redirigés vers /connexion.
 */
const PUBLIC_PREFIXES = [
  "/connexion",
  "/api/auth/session",
  "/api/auth/google", // callback / start / demo OAuth
  "/client",
  "/wireframes/client",
  "/depot",
  "/visio",
  "/wireframes/visio.html",
  "/api/collecte/", // flux client : /api/collecte/[token]/{depot,messages,GET}
  "/api/dci", // flux client : POST /api/dci/[kind] + GET /api/dci?prospect=
  "/_next",
  "/favicon",
];

/**
 * Zones PROTÉGÉES (pages + wireframes statiques sensibles). Sans session valide,
 * on redirige en 302 vers /connexion?next=<chemin>. Les routes du groupe (editeur)
 * sont servies à la racine — on les liste donc une à une ("/" reste public).
 */
const PROTECTED_PAGE_PREFIXES = [
  "/ingenieur",
  "/dirigeant",
  "/marque",
  "/wireframes/ingenieur.html",
  "/wireframes/dirigeant.html",
  "/wireframes/marque.html",
  // Routes du groupe (editeur), servies à la racine :
  "/acquisition",
  "/adoption",
  "/business",
  "/client-new",
  "/clients",
  "/comms",
  "/finance",
  "/health",
  "/infra",
  "/leads",
  "/marketplace",
  "/product",
  "/quality",
  "/referral",
  "/roadmap",
  "/team",
  "/trial",
  "/ttv",
];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(p.endsWith("/") ? p : `${p}/`),
  );
}

export async function proxy(request: NextRequest) {
  // 1. Toujours rafraîchir la session Supabase (cookies) en premier.
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // 2. Endpoints sensibles (API) : la garde se fait dans chaque handler via
  //    requireAuth. Le proxy ne gère que les pages et wireframes statiques.
  if (pathname.startsWith("/api/")) {
    return response;
  }

  // 3. Public d'abord : aucun gating sur le parcours client.
  if (matchesPrefix(pathname, PUBLIC_PREFIXES)) {
    return response;
  }

  // 4. Zones protégées → exiger une session de cabinet.
  if (matchesPrefix(pathname, PROTECTED_PAGE_PREFIXES) && !readSession(request)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/connexion";
    redirectUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(redirectUrl, 302);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
