/**
 * Assainisseur HTML minimal pour le contenu édité d'un bloc d'audit.
 *
 * Le contenu édité (édition manuelle ou retouche IA appliquée) est persisté en
 * HTML afin de préserver la mise en forme (gras, italique, listes…), puis rendu
 * via dangerouslySetInnerHTML. On le passe d'abord par cet assainisseur pour
 * neutraliser toute injection : seules quelques balises de mise en forme sont
 * conservées, tous les attributs sont retirés (sauf un href sûr sur <a>), et les
 * blocs <script>/<style> ainsi que les gestionnaires on* disparaissent.
 *
 * Implémentation sans DOM (regex) : le module est importé par un composant
 * « use client » mais rendu aussi côté serveur, où window/document n'existent pas.
 */

const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "br",
  "span",
  "p",
  "a",
]);

// Espaces et caracteres de controle servant a obfusquer un schema
// executable comme java\tscript:.
const URL_NOISE = /[\u0000-\u0020]/g;

/**
 * Décode les entités HTML (numériques et quelques nommées) avant le contrôle de
 * schéma, afin que l'on ne puisse pas le contourner par un encodage du type
 * « java&#9;script: » ou « javascript&#58; » que le navigateur, lui, décode à
 * l'affichage. Ce décodage ne sert qu'au test de sûreté ; l'URL conservée reste
 * l'URL d'origine.
 */
function fromCp(cp: number): string {
  if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) return "";
  try {
    return String.fromCodePoint(cp);
  } catch {
    return "";
  }
}

function decodeEntitiesForCheck(url: string): string {
  return url
    .replace(/&#x([0-9a-f]+);?/gi, (_m, hex: string) => fromCp(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_m, dec: string) => fromCp(parseInt(dec, 10)))
    .replace(/&(tab|newline|colon|sol|nbsp);?/gi, (_m, name: string) => {
      const map: Record<string, string> = {
        tab: "\t",
        newline: "\n",
        colon: ":",
        sol: "/",
        nbsp: " ",
      };
      return map[name.toLowerCase()] ?? "";
    });
}

/** Une URL est sûre si elle ne porte pas de schéma exécutable (javascript:, data:, vbscript:). */
function isSafeUrl(url: string): boolean {
  const cleaned = decodeEntitiesForCheck(url).replace(URL_NOISE, "").toLowerCase();
  return !/^(?:javascript|data|vbscript):/.test(cleaned);
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // 1. Blocs script/style supprimés avec leur contenu.
  let out = html.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, "");
  // … et toute balise script/style résiduelle (non refermée).
  out = out.replace(/<\/?(?:script|style)\b[^>]*>/gi, "");
  // Commentaires (peuvent masquer du code conditionnel).
  out = out.replace(/<!--[\s\S]*?-->/g, "");

  // 2. Chaque balise restante est reconstruite : tag autorisé sinon supprimé,
  // attributs jetés (sauf href sûr sur <a>).
  out = out.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g,
    (match, rawName: string, attrs: string) => {
      const tag = rawName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";

      if (match.startsWith("</")) return `</${tag}>`;

      if (tag === "br") return "<br />";

      if (tag === "a") {
        const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s">]+))/i);
        const url = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim();
        if (url && isSafeUrl(url)) {
          return `<a href="${escapeAttr(url)}" rel="noopener noreferrer">`;
        }
        return "<a>";
      }

      return `<${tag}>`;
    },
  );

  return out;
}

/**
 * Lit le contenu HTML d'un bloc pour la persistance, en écartant le tampon de
 * validation (rendu par React, jamais du texte de l'ingénieur) et en
 * « dé-emballant » l'enveloppe interne .bloc-content quand elle est présente
 * (rendu du contenu édité). Le résultat est donc toujours sans enveloppe, ce qui
 * évite tout empilement d'un cycle de révision à l'autre.
 */
export function readBlocHtml(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".validated-badge").forEach((n) => n.remove());
  const wrap = clone.querySelector(":scope > .bloc-content");
  if (wrap && clone.childElementCount === 1) {
    return wrap.innerHTML.trim();
  }
  return clone.innerHTML.trim();
}

/** Texte visible d'un bloc, tampon de validation exclu. */
export function readBlocText(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".validated-badge").forEach((n) => n.remove());
  return (clone.textContent ?? "").trim();
}
