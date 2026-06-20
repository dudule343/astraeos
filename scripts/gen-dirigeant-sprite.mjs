// Génère DirigeantSprite.tsx : le sprite SVG (symboles + gradients) de la
// maquette dirigeant, injecté brut via dangerouslySetInnerHTML pour rester
// fidèle au markup d'origine sans réécrire chaque attribut en camelCase.
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "/Users/marvinmouton/Documents/Projets/astraeos/reference/wireframes-dirigeant.html";
const OUT = "/Users/marvinmouton/Documents/Projets/astraeos/src/app/(dirigeant)/_components/DirigeantSprite.tsx";

const html = readFileSync(SRC, "utf8");
const open = html.indexOf('<svg width="0"');
const close = html.indexOf("</svg>", open) + "</svg>".length;
const svg = html.slice(open, close);
const inner = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").trim();

const escaped = inner.replace(/\\/g, "\\\\").replace(/`/g, "\\`");

const out = `// Sprite SVG porté tel quel depuis reference/wireframes-dirigeant.html.
// Généré par scripts/gen-dirigeant-sprite.mjs — ne pas éditer à la main.
// Rendu une seule fois dans le layout dirigeant ; les pages référencent les
// icônes via <svg><use href="#i-xxx" /></svg>.
const SPRITE = \`${escaped}\`;

export function DirigeantSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: SPRITE }}
    />
  );
}
`;

writeFileSync(OUT, out, "utf8");
console.log("Écrit:", OUT, "—", inner.length, "chars de sprite");
