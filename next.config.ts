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
    // La visio a besoin de la caméra/micro en same-origin ; on bloque le reste.
    value: "camera=(self), microphone=(self), geolocation=(), browsing-topics=()",
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
