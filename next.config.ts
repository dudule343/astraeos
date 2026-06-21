import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// En-têtes de sécurité émis sur toutes les routes (défense en profondeur).
// On reste volontairement minimal côté CSP : `frame-ancestors 'self'` suffit à
// bloquer le clickjacking sans casser les iframes same-origin /wireframes ni la
// visio. Une CSP complète (script-src…) est délicate ici et hors scope.
const securityHeaders = [
  // Anti-clickjacking. SAMEORIGIN couvre les vieux navigateurs ; frame-ancestors
  // 'self' couvre les modernes (et autorise nos iframes same-origin).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // La visio embarque une iframe Jitsi CROSS-ORIGIN (srv1750581.hstgr.cloud).
    // Avec `(self)`, la policy de tête interdit de DÉLÉGUER caméra/micro/partage
    // à cette iframe cross-origin → Chrome bloque, même avec allow="camera *" sur
    // l'iframe. `=*` rend ces features DÉLÉGABLES ; le grant réel reste contrôlé
    // par l'attribut allow de chaque iframe (seule l'iframe Jitsi le porte). On
    // garde geolocation/browsing-topics bloqués.
    value:
      "camera=*, microphone=*, display-capture=*, geolocation=(), browsing-topics=()",
  },
  // HSTS uniquement en prod (HTTPS) — éviter de l'envoyer en dev/HTTP.
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Le proxy (src/proxy.ts) bufferise le corps ; défaut 10 Mo → un dépôt de
  // pièce de 10-15 Mo (scan mobile) était tronqué silencieusement alors que
  // l'UI annonce 15 Mo. On aligne à 16 Mo (marge multipart).
  experimental: {
    proxyClientMaxBodySize: "16mb",
  },
  async headers() {
    return [
      // La wireframe visio (cockpit Jitsi/transcription) évolue souvent : on
      // force le no-store pour que le navigateur recharge toujours la dernière
      // version (sinon un visio.html en cache masque les correctifs déployés).
      {
        source: "/wireframes/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
