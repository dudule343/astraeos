// Ajoute un commentaire d'en-tête uniforme aux pages de l'espace dirigeant.
// But : documenter dans le code que chaque écran est un port fidèle hardcodé de
// la maquette 020, avec sa plage de lignes source et un renvoi vers la doc.
// Idempotent : ne réécrit pas un fichier qui a déjà un en-tête "maquette".
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";

const ED = "/Users/marvinmouton/Documents/Projets/astraeos/src/app/(dirigeant)/espace-dirigeant";

// [titre, sous-chemin page.tsx, lineStart, lineEnd]
const PAGES = [
  ["Accueil cabinet", "page.tsx", 2291, 2660],
  ["Vue d'ensemble financière", "finance/page.tsx", 2661, 4202],
  ["Compte de résultat", "finance/resultat/page.tsx", 4203, 4298],
  ["Trésorerie", "finance/tresorerie/page.tsx", 4299, 5102],
  ["Activité commerciale", "finance/activite/page.tsx", 5103, 5840],
  ["Licenciés (réseau)", "licencies/page.tsx", 5841, 6143],
  ["Performance des ingénieurs", "performance/page.tsx", 6144, 6538],
  ["Mes ingénieurs", "ingenieurs/page.tsx", 6539, 6620],
  ["Recrutement des ingénieurs", "ingenieurs/recrutement/page.tsx", 6621, 6745],
  ["Comptes ingénieurs", "ingenieurs/comptes/page.tsx", 8570, 8610],
  ["Parcours 01 · Prospects actifs", "parcours/prospects/page.tsx", 6746, 6923],
  ["Parcours 02 · Compliance validée", "parcours/compliance/page.tsx", 6924, 7075],
  ["Parcours 03 · Collecte docs & infos", "parcours/collecte/page.tsx", 7076, 7234],
  ["Parcours 04 · Études en cours", "parcours/etudes/page.tsx", 7235, 7346],
  ["Parcours 05 · Études restituées", "parcours/restituees/page.tsx", 7347, 7478],
  ["Parcours 06 · Clients en suivi", "parcours/suivi/page.tsx", 7479, 7608],
  ["Assets · Vue d'ensemble", "assets/page.tsx", 7609, 7769],
  ["Assets · Investissement financier", "assets/financier/page.tsx", 7770, 7847],
  ["Assets · Assurance", "assets/assurance/page.tsx", 7848, 7922],
  ["Assets · Investissement immobilier", "assets/immobilier/page.tsx", 7923, 8097],
  ["Assets · Honoraires de conseil", "assets/honoraires/page.tsx", 8098, 8172],
  ["Référentiel · Process & méthodologie", "referentiel/page.tsx", 8173, 8359],
  ["Partenaires & apporteurs", "partenaires/page.tsx", 8360, 8470],
  ["Paramétrages · Identité de la marque", "parametrages/identite/page.tsx", 8471, 8569],
  ["Paramétrages · Connexions bancaires", "parametrages/banque/page.tsx", 8611, 8771],
  ["Paramétrages · Intégrations & connecteurs", "parametrages/integrations/page.tsx", 8772, 8974],
  ["Paramétrages · Conformité juridique", "parametrages/conformite/page.tsx", 8975, 9184],
  ["Paramétrages · Templates & communication", "parametrages/templates/page.tsx", 9185, 9470],
  ["Outils · Catalogue produits", "outils/catalogue/page.tsx", 9471, 9584],
  ["Outils · Simulateurs & calculateurs", "outils/simulateurs/page.tsx", 9585, 9674],
  ["Outils · Bibliothèque marketing", "outils/marketing/page.tsx", 9675, 9759],
  ["Profil & agréments", "profil/page.tsx", 9760, 10129],
];

function hasHeader(src) {
  return src.slice(0, 400).toLowerCase().includes("maquette");
}

// Insère un commentaire en respectant la directive "use client" (qui doit rester
// la première instruction du fichier ; les commentaires peuvent la précéder, mais
// par sûreté on insère APRÈS elle quand elle est présente).
function withHeader(src, comment) {
  const lines = src.split("\n");
  const first = (lines[0] || "").trim();
  if (first === '"use client";' || first === "'use client';") {
    return [lines[0], comment, ...lines.slice(1)].join("\n");
  }
  return comment + "\n" + src;
}

let done = 0;
let skipped = 0;

for (const [titre, sub, start, end] of PAGES) {
  const file = `${ED}/${sub}`;
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    console.warn("introuvable:", sub);
    continue;
  }
  if (hasHeader(src)) {
    skipped++;
    continue;
  }
  const route = "/espace-dirigeant/" + sub.replace(/\/?page\.tsx$/, "");
  const comment =
    `// Espace dirigeant — ${titre}.\n` +
    `// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,\n` +
    `// lignes ${start}-${end}). Route : ${route}\n` +
    `// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md\n` +
    `// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md`;
  writeFileSync(file, withHeader(src, comment), "utf8");
  done++;
}

// Pass B : composants clients (*Client.tsx) sans en-tête → en-tête générique.
function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    const p = `${dir}/${name}`;
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/Client\.tsx$/.test(name)) acc.push(p);
  }
  return acc;
}

let clientDone = 0;
let clientSkipped = 0;
for (const file of walk(ED, [])) {
  const src = readFileSync(file, "utf8");
  if (hasHeader(src)) {
    clientSkipped++;
    continue;
  }
  const comment =
    `// Espace dirigeant — composant client (interactions de l'écran : onglets,\n` +
    `// filtres, drawers, popovers…). Port fidèle de la maquette 020.\n` +
    `// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.`;
  writeFileSync(file, withHeader(src, comment), "utf8");
  clientDone++;
}

console.log(`pages: ${done} annotées, ${skipped} déjà OK`);
console.log(`clients: ${clientDone} annotés, ${clientSkipped} déjà OK`);
