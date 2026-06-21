// Ajoute un en-tête de provenance en tête de chaque page.tsx de l'espace éditeur.
// Idempotent : ne réinsère pas si le marqueur est déjà là. Si le fichier commence
// par "use client", l'en-tête est inséré APRÈS la directive (qui doit rester en tête).
import { readFileSync, writeFileSync } from "node:fs";

const EDIT = "/Users/marvinmouton/Documents/Projets/astraeos/src/app/(editeur)";
const MARK = "// Espace éditeur — page «";

const PAGES = [
  { f: `${EDIT}/page.tsx`, route: "/", bc: "Accueil", id: "page-home", lines: "900-1229" },
  { f: `${EDIT}/business/page.tsx`, route: "/business", bc: "Pilotage business", id: "page-business", lines: "1230-1490" },
  { f: `${EDIT}/acquisition/page.tsx`, route: "/acquisition", bc: "Acquisition & conversion", id: "page-acquisition", lines: "1491-1604" },
  { f: `${EDIT}/adoption/page.tsx`, route: "/adoption", bc: "Adoption produit", id: "page-adoption", lines: "1605-1656" },
  { f: `${EDIT}/ttv/page.tsx`, route: "/ttv", bc: "Vitesse première valeur", id: "page-ttv", lines: "1657-1712" },
  { f: `${EDIT}/health/page.tsx`, route: "/health", bc: "Santé clients", id: "page-health", lines: "1713-1842" },
  { f: `${EDIT}/product/page.tsx`, route: "/product", bc: "Analyse produit", id: "page-product", lines: "1843-1908" },
  { f: `${EDIT}/quality/page.tsx`, route: "/quality", bc: "Support & qualité", id: "page-quality", lines: "1909-1995" },
  { f: `${EDIT}/infra/page.tsx`, route: "/infra", bc: "Infrastructure", id: "page-infra", lines: "1996-2055" },
  { f: `${EDIT}/leads/page.tsx`, route: "/leads", bc: "Pipeline acquisition", id: "page-leads", lines: "2056-2195" },
  { f: `${EDIT}/referral/page.tsx`, route: "/referral", bc: "Programme de parrainage", id: "page-referral", lines: "2196-2423" },
  { f: `${EDIT}/clients/page.tsx`, route: "/clients", bc: "Clients totaux actifs", id: "page-clients", lines: "2424-2623" },
  { f: `${EDIT}/trial/page.tsx`, route: "/trial", bc: "Période d'essai", id: "page-trial", lines: "2624-2810" },
  { f: `${EDIT}/client-new/page.tsx`, route: "/client-new", bc: "Nouveau client", id: "page-client-new", lines: "2811-3055" },
  { f: `${EDIT}/marketplace/page.tsx`, route: "/marketplace", bc: "Catalogue des packs", id: "page-marketplace", lines: "3056-3351" },
  { f: `${EDIT}/finance/page.tsx`, route: "/finance", bc: "Finance consolidée", id: "page-finance", lines: "3352-4060" },
  { f: `${EDIT}/comms/page.tsx`, route: "/comms", bc: "Communications & annonces", id: "page-comms", lines: "4061-4182" },
  { f: `${EDIT}/roadmap/page.tsx`, route: "/roadmap", bc: "Roadmap & releases", id: "page-roadmap", lines: "4183-4239" },
  { f: `${EDIT}/team/page.tsx`, route: "/team", bc: "Équipe interne", id: "page-team", lines: "4240-4509" },
];

function header(p) {
  return (
    `// Espace éditeur — page « ${p.bc} » (route ${p.route}).\n` +
    `// Port fidèle 1:1 de la maquette : reference/wireframes-editeur.html,\n` +
    `// <div id="${p.id}">, lignes ${p.lines}. Données EN DUR = valeurs d'exemple\n` +
    `// de la maquette (pas branché Supabase). Pattern + détails : (editeur)/README.md.\n`
  );
}

let done = 0;
let skipped = 0;
for (const p of PAGES) {
  const src = readFileSync(p.f, "utf8");
  if (src.includes(MARK)) {
    skipped++;
    continue;
  }
  let out;
  const m = src.match(/^("use client";?\s*\n)/);
  if (m) {
    out = m[1] + "\n" + header(p) + src.slice(m[1].length);
  } else {
    out = header(p) + src;
  }
  writeFileSync(p.f, out, "utf8");
  done++;
}
console.log(`En-têtes ajoutés: ${done}, déjà présents: ${skipped}`);
