// Domaine de cookie partagé entre app.astraeos.fr et les sous-domaines d'espace
// (dirigeant/marque/ingenieur/client.astraeos.fr) → session unique (SSO).
// Renvoie undefined hors production (localhost, *.vercel.app) pour ne pas casser
// les cookies en dev/preview. Fonction pure, importable côté client ET serveur.
export function cookieDomainForHost(host: string | null | undefined): string | undefined {
  const h = (host ?? "").toLowerCase().split(":")[0];
  if (h === "astraeos.fr" || h.endsWith(".astraeos.fr")) return ".astraeos.fr";
  return undefined;
}
