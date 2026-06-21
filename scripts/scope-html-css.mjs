// Généralise scope-editeur-css.mjs : extrait le <style> d'une maquette HTML et le
// scope sous une classe wrapper donnée, pour porter le CSS tel quel sans fuite.
// Usage : node scripts/scope-html-css.mjs <src.html> <out.css> <.scope-class>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const [src, out, scopeRaw] = process.argv.slice(2);
if (!src || !out || !scopeRaw) {
  console.error("Usage: node scripts/scope-html-css.mjs <src.html> <out.css> <.scope-class>");
  process.exit(1);
}
const SCOPE = scopeRaw.startsWith(".") ? scopeRaw : `.${scopeRaw}`;

const html = readFileSync(src, "utf8");
const start = html.indexOf("<style>");
const end = html.indexOf("</style>", start);
const css = html.slice(start + "<style>".length, end);

function splitTopLevel(input) {
  const blocks = [];
  let depth = 0, buf = "", i = 0;
  while (i < input.length) {
    if (input.slice(i, i + 2) === "/*") {
      const close = input.indexOf("*/", i + 2);
      const c = close === -1 ? input.length : close + 2;
      buf += input.slice(i, c); i = c; continue;
    }
    const ch = input[i]; buf += ch;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { blocks.push(buf); buf = ""; } }
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
  const m = prelude.match(/^(\s*\/\*[\s\S]*?\*\/\s*)?([\s\S]*)$/);
  const lead = m[1] || "";
  const scoped = m[2].split(",").map(scopeSelector).join(", ");
  return `${lead}${scoped} ${body}`;
}

function transform(input) {
  return splitTopLevel(input).map((block) => {
    const t = block.trim();
    if (!t) return block;
    if (t.startsWith("/*") && !t.includes("{")) return block;
    const lower = t.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "").toLowerCase();
    if (lower.startsWith("@keyframes") || lower.startsWith("@font-face") || lower.startsWith("@import") || lower.startsWith("@charset") || lower.startsWith("@page") || lower.startsWith(":root")) return block;
    if (lower.startsWith("@media") || lower.startsWith("@supports")) {
      const open = block.indexOf("{"), close = block.lastIndexOf("}");
      return block.slice(0, open + 1) + "\n" + transform(block.slice(open + 1, close)) + block.slice(close);
    }
    return scopeRule(block);
  }).join("");
}

mkdirSync(dirname(out), { recursive: true });
const header = `/* PORTÉ MÉCANIQUEMENT depuis ${src.split("/").pop()} (<style> de tête).\n   Régénéré par scripts/scope-html-css.mjs. Sélecteurs scopés sous ${SCOPE}. */\n\n`;
writeFileSync(out, header + transform(css).trim() + "\n", "utf8");
console.log("Écrit:", out, "scope", SCOPE);
