import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Seul l'apex public (la vitrine) est routé vers le dossier /site.
// app.astraeos.fr, les previews Vercel et localhost gardent l'app à la racine.
const MARKETING_HOSTS = new Set(["astraeos.fr", "www.astraeos.fr"]);

// Un sous-domaine par espace : la racine du sous-domaine sert la page de l'espace.
// (app.astraeos.fr reste l'éditeur à la racine, géré par défaut.)
const ESPACE_HOSTS: Record<string, string> = {
  // Espace marque = vraie app React (route group (marque)/espace-marque),
  // plus l'iframe de wireframe.
  "marque.astraeos.fr": "/espace-marque",
  // L'espace dirigeant est désormais une vraie app React (route group
  // (dirigeant)/espace-dirigeant), plus l'iframe de wireframe.
  "dirigeant.astraeos.fr": "/espace-dirigeant",
  // ingenieur.astraeos.fr n'est PLUS un wireframe : il sert l'application
  // éditeur réelle (le vrai workspace ingénieur). Pas d'entrée ici → la racine
  // tombe sur le défaut (l'éditeur), scopé par la session une fois l'auth active.
  "client.astraeos.fr": "/client",
};

// Conservés tels quels sur l'apex : collecte client par token (liens envoyés
// par e-mail) et routes API.
function isPublicAppPath(pathname: string): boolean {
  return pathname.startsWith("/depot") || pathname.startsWith("/api");
}

// Routes accessibles sans session, même quand le mur d'auth est actif :
// collecte client par token, API publiques, et le tunnel d'auth lui-même.
function isUnauthenticatedAllowed(pathname: string): boolean {
  return (
    pathname.startsWith("/depot") ||
    pathname.startsWith("/api") ||
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/auth/")
  );
}

/**
 * En Next 16, le « middleware » est renommé `proxy` (runtime Node.js).
 * Rôles : routage de la vitrine sur l'apex + rafraîchissement de session Supabase.
 * (Le code d'accès cabinet a été retiré — les espaces sont en accès libre.)
 */
export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];

  if (MARKETING_HOSTS.has(host)) {
    const { pathname } = request.nextUrl;
    if (!isPublicAppPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/" ? "/site" : `/site${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Sous-domaine d'espace : la racine sert la page de l'espace ; le reste
  // (assets, /wireframes en iframe, /api, sous-pages) passe tel quel.
  const espacePath = ESPACE_HOSTS[host];
  if (espacePath && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = espacePath;
    return NextResponse.rewrite(url);
  }

  // Rafraîchit la session Supabase (et propage les cookies). On récupère aussi
  // l'utilisateur pour le gate d'auth ci-dessous.
  const { response, user } = await updateSession(request);

  // Gate d'auth — DÉSACTIVÉ par défaut. Ne s'active que si le flag vaut
  // exactement "1". Flag absent/≠"1" ⇒ comportement actuel inchangé.
  if (process.env.ASTRAEOS_AUTH_ENFORCE === "1") {
    const { pathname } = request.nextUrl;
    if (!user && !isUnauthenticatedAllowed(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      const redirect = NextResponse.redirect(loginUrl);
      // On recopie les cookies posés par updateSession pour ne pas perdre
      // le refresh de session sur la redirection.
      for (const cookie of response.cookies.getAll()) {
        redirect.cookies.set(cookie);
      }
      return redirect;
    }
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
