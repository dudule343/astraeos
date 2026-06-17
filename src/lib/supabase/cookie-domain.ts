// Domaine de cookie partagé entre app.astraeos.fr et les sous-domaines d'espace
// (dirigeant/marque/ingenieur/client.astraeos.fr) → session unique (SSO).
// Renvoie undefined hors production (localhost, *.vercel.app) pour ne pas casser
// les cookies en dev/preview. Fonction pure, importable côté client ET serveur.
export function cookieDomainForHost(host: string | null | undefined): string | undefined {
  const h = (host ?? "").toLowerCase().split(":")[0];
  if (h === "astraeos.fr" || h.endsWith(".astraeos.fr")) return ".astraeos.fr";
  return undefined;
}

export type SessionCookieOptions = {
  domain?: string;
  secure?: boolean;
  sameSite: "lax";
  path: "/";
};

// Options de cookie de session, dérivées du host courant. Source unique pour
// middleware/server/client.
// - En prod (astraeos.fr + sous-domaines, HTTPS) : domain partagé + secure:true.
// - En dev/preview (localhost, *.vercel.app, HTTP) : pas de domain ni de secure
//   (un cookie Secure serait rejeté sur HTTP → casserait la session locale).
// sameSite:'lax' et path:'/' dans tous les cas.
export function cookieOptionsForHost(host: string | null | undefined): SessionCookieOptions {
  const domain = cookieDomainForHost(host);
  return {
    ...(domain ? { domain, secure: true } : {}),
    sameSite: "lax",
    path: "/",
  };
}
