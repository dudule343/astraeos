// Extrait TOUS les blocs <style> de la maquette dirigeant et les scope sous
// .maquette-dir. Transformation mécanique : on ne réinterprète pas le CSS, on
// le porte tel quel en préfixant chaque sélecteur pour qu'il ne fuie pas hors
// de l'espace dirigeant. La maquette a un bloc principal (head) + des blocs
// locaux à certains écrans (graphiques) ; on les concatène tous.
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "/Users/marvinmouton/Documents/Projets/astraeos/reference/wireframes-dirigeant.html";
const OUT = "/Users/marvinmouton/Documents/Projets/astraeos/src/app/(dirigeant)/_styles/maquette.css";
const SCOPE = ".maquette-dir";

const html = readFileSync(SRC, "utf8");

// Récupère tous les blocs <style>...</style>.
function extractAllStyles(input) {
  const blocks = [];
  let from = 0;
  while (true) {
    const open = input.indexOf("<style>", from);
    if (open === -1) break;
    const close = input.indexOf("</style>", open);
    if (close === -1) break;
    blocks.push(input.slice(open + "<style>".length, close));
    from = close + "</style>".length;
  }
  return blocks;
}

// Découpe en blocs de premier niveau en respectant accolades et commentaires.
function splitTopLevel(input) {
  const blocks = [];
  let depth = 0;
  let buf = "";
  let i = 0;
  while (i < input.length) {
    const two = input.slice(i, i + 2);
    if (two === "/*") {
      const close = input.indexOf("*/", i + 2);
      const c = close === -1 ? input.length : close + 2;
      buf += input.slice(i, c);
      i = c;
      continue;
    }
    const ch = input[i];
    buf += ch;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        blocks.push(buf);
        buf = "";
      }
    }
    i++;
  }
  if (buf.trim()) blocks.push(buf);
  return blocks;
}

function scopeSelector(sel) {
  const s = sel.trim();
  if (!s) return s;
  if (s === "*") return `${SCOPE} *`;
  if (s === "html" || s === "body" || s === "html, body") return SCOPE;
  if (s.startsWith(":root")) return s;
  if (s.startsWith("html")) return SCOPE + s.slice(4);
  if (s.startsWith("body")) return SCOPE + s.slice(4);
  return `${SCOPE} ${s}`;
}

function scopeRule(block) {
  const braceAt = block.indexOf("{");
  if (braceAt === -1) return block;
  const prelude = block.slice(0, braceAt);
  const body = block.slice(braceAt);
  const commentMatch = prelude.match(/^(\s*\/\*[\s\S]*?\*\/\s*)?([\s\S]*)$/);
  const lead = commentMatch[1] || "";
  const selectors = commentMatch[2];
  const scoped = selectors
    .split(",")
    .map((s) => scopeSelector(s))
    .join(", ");
  return `${lead}${scoped} ${body}`;
}

function transform(input) {
  return splitTopLevel(input)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return block;
      if (trimmed.startsWith("/*") && !trimmed.includes("{")) return block;
      const lower = trimmed.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "").toLowerCase();
      if (
        lower.startsWith("@keyframes") ||
        lower.startsWith("@font-face") ||
        lower.startsWith("@import") ||
        lower.startsWith("@charset") ||
        lower.startsWith("@page") ||
        lower.startsWith(":root")
      ) {
        return block;
      }
      if (lower.startsWith("@media") || lower.startsWith("@supports")) {
        const open = block.indexOf("{");
        const close = block.lastIndexOf("}");
        const head = block.slice(0, open + 1);
        const inner = block.slice(open + 1, close);
        const tail = block.slice(close);
        return head + "\n" + transform(inner) + tail;
      }
      return scopeRule(block);
    })
    .join("");
}

const styles = extractAllStyles(html);
const merged = styles.join("\n\n/* ---- bloc <style> suivant ---- */\n\n");

const header = `/* PORTÉ MÉCANIQUEMENT depuis reference/wireframes-dirigeant.html (tous les <style>).
   Ne pas éditer à la main : régénéré par scripts/scope-dirigeant-css.mjs.
   Tous les sélecteurs sont scopés sous .maquette-dir (sauf :root et @keyframes). */\n\n`;

writeFileSync(OUT, header + transform(merged).trim() + "\n", "utf8");
console.log("Écrit:", OUT, "—", styles.length, "blocs <style>,", merged.length, "chars source");
