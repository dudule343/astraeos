#!/usr/bin/env python3
"""
check_wireframe_coverage.py
============================
Vérifie que chaque page React reproduit fidèlement le contenu de son
équivalent dans le wireframe HTML d'origine.

Le script :
  1. Extrait le texte visible de chaque section <div class="page" id="page-X">
     du fichier `reference/wireframes/02_Wireframes_Editeur.html`
  2. Lit le fichier `src/app/(editeur)/<route>/page.tsx` correspondant
     (et suit les imports vers `_components/` pour récupérer le texte
     des composants partagés)
  3. Compare phrase par phrase et signale celles présentes dans le HTML
     mais absentes du code React.

Usage :
    python3 scripts/check_wireframe_coverage.py
    python3 scripts/check_wireframe_coverage.py --page finance
    python3 scripts/check_wireframe_coverage.py --threshold 90
    python3 scripts/check_wireframe_coverage.py --show-missing

Le script s'adapte automatiquement :
  - nouvelles pages ajoutées au PAGE_MAP -> testées
  - composants partagés importés -> suivis
  - mapping HTML id <-> route Next.js paramétrable
"""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from html.parser import HTMLParser
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
WIREFRAME_PATH = PROJECT_ROOT / "reference" / "wireframes" / "02_Wireframes_Editeur.html"
APP_DIR = PROJECT_ROOT / "src" / "app" / "(editeur)"

# id du <div class="page" id="page-X"> dans le HTML  ->  chemin du fichier page.tsx
PAGE_MAP: dict[str, str] = {
    "home":         "page.tsx",
    "business":     "business/page.tsx",
    "acquisition":  "acquisition/page.tsx",
    "adoption":     "adoption/page.tsx",
    "ttv":          "ttv/page.tsx",
    "health":       "health/page.tsx",
    "product":      "product/page.tsx",
    "quality":      "quality/page.tsx",
    "infra":        "infra/page.tsx",
    "leads":        "leads/page.tsx",
    "referral":     "referral/page.tsx",
    "clients":      "clients/page.tsx",
    "trial":        "trial/page.tsx",
    "client-new":   "client-new/page.tsx",
    "marketplace":  "marketplace/page.tsx",
    "finance":      "finance/page.tsx",
    "comms":        "comms/page.tsx",
    "roadmap":      "roadmap/page.tsx",
    "team":         "team/page.tsx",
}

# Préfixes Tailwind / tokens techniques à ignorer dans la liste de phrases HTML
NOISE_PREFIXES = (
    "bg-", "text-", "border-", "rounded", "px-", "py-", "mb-", "mt-",
    "ml-", "mr-", "pl-", "pr-", "pt-", "pb-", "flex", "grid",
    "items-", "justify-", "gap-", "h-", "w-", "min-", "max-",
    "absolute", "relative", "sticky", "fixed", "static",
    "hover:", "focus:", "sm:", "md:", "lg:", "xl:", "2xl:",
    "var(--",
)


# --------------------------------------------------------------------------- #
# Extraction du texte visible du HTML
# --------------------------------------------------------------------------- #
BLOCK_TAGS = {
    "div", "p", "h1", "h2", "h3", "h4", "h5", "h6",
    "li", "td", "tr", "th", "thead", "tbody", "table",
    "section", "article", "header", "footer", "aside",
    "button", "label", "span", "br",
}


class TextExtractor(HTMLParser):
    """Récupère le texte visible d'un fragment HTML, en insérant des sauts
    de ligne aux frontières des éléments de bloc pour éviter la concaténation."""

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        elif tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_startendtag(self, tag, attrs):
        if tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip > 0:
            self.skip -= 1
        elif tag in BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if self.skip == 0:
            self.parts.append(data)

    def text(self) -> str:
        return "".join(self.parts)


def extract_html_pages(html_path: Path) -> dict[str, str]:
    """Retourne {page_id: texte_visible} pour chaque <div class="page..." id="page-X">."""
    content = html_path.read_text(encoding="utf-8")
    pattern = re.compile(r'<div class="page[^"]*" id="page-([^"]+)">', re.S)
    matches = list(pattern.finditer(content))

    pages: dict[str, str] = {}
    for i, m in enumerate(matches):
        page_id = m.group(1)
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        # Pour la dernière page, on s'arrête au premier <script> pour éviter le JS
        last_chunk = content[start:end]
        if i + 1 == len(matches):
            script_pos = last_chunk.find("<script")
            if script_pos != -1:
                last_chunk = last_chunk[:script_pos]
        extractor = TextExtractor()
        extractor.feed(last_chunk)
        # On garde les sauts de ligne pour le découpage, mais on compacte
        # les espaces multiples sur chaque ligne
        raw = extractor.text()
        lines = [re.sub(r"[ \t]+", " ", l).strip() for l in raw.split("\n")]
        text = "\n".join(l for l in lines if l)
        pages[page_id] = text
    return pages


# --------------------------------------------------------------------------- #
# Extraction du texte React (page + composants importés)
# --------------------------------------------------------------------------- #
def extract_react_text(tsx_path: Path, visited: set[Path] | None = None) -> str:
    """Concatène le contenu d'un fichier TSX et de ses imports locaux (.tsx)."""
    if visited is None:
        visited = set()
    if not tsx_path.exists() or tsx_path in visited:
        return ""
    visited.add(tsx_path)

    content = tsx_path.read_text(encoding="utf-8")
    pieces = [content]

    # Imports relatifs (./X ou ../X) -> on suit les composants locaux
    for imp in re.findall(r"""from\s+["'](\.{1,2}/[^"']+)["']""", content):
        candidate = (tsx_path.parent / imp).resolve()
        for suffix in (".tsx", ".ts", "/index.tsx", "/index.ts"):
            target = Path(str(candidate) + suffix) if not candidate.suffix else candidate
            if target.exists():
                pieces.append(extract_react_text(target, visited))
                break
            target_with = candidate.with_suffix(suffix) if not candidate.suffix else candidate
            if target_with.exists():
                pieces.append(extract_react_text(target_with, visited))
                break
    return "\n".join(pieces)


# --------------------------------------------------------------------------- #
# Normalisation et découpage en phrases
# --------------------------------------------------------------------------- #
def normalize(text: str) -> str:
    """Minuscules, sans accents, espaces compactés."""
    text = text.lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[ \s]+", " ", text)
    return text.strip()


def split_phrases(text: str) -> list[str]:
    """Découpe le texte en phrases significatives (mots ou groupes)."""
    # Découpage en deux passes : d'abord sur les sauts de ligne (frontières
    # d'éléments HTML), puis sur les séparateurs internes (·, |, —)
    cleaned: list[str] = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        # Sépare aussi sur les puces / séparateurs visuels
        for chunk in re.split(r"\s*[·•▾▸▲▼]\s*|\s+\|\s+|\s+—\s+|\s+→\s+", line):
            chunk = chunk.strip(" ,;:.!?()[]{}«»\"'`▾▸▲▼←→•·")
            if chunk:
                cleaned.append(chunk)
    return cleaned


def is_meaningful(phrase: str) -> bool:
    """Filtre les phrases trop courtes ou techniques."""
    p = phrase.strip()
    if len(p) < 5:
        return False
    if any(p.lower().startswith(pref) for pref in NOISE_PREFIXES):
        return False
    # Une phrase significative contient au moins une lettre
    if not re.search(r"[A-Za-zÀ-ÿ]", p):
        return False
    return True


# --------------------------------------------------------------------------- #
# Comparaison HTML <-> React
# --------------------------------------------------------------------------- #
def check_page(page_id: str, html_text: str, react_text: str) -> dict:
    """Renvoie un rapport de couverture pour une page."""
    react_norm = normalize(react_text)
    phrases = split_phrases(html_text)

    found = 0
    total = 0
    missing: list[str] = []
    seen_norm: set[str] = set()

    for phrase in phrases:
        if not is_meaningful(phrase):
            continue
        norm = normalize(phrase)
        if norm in seen_norm:
            continue  # éviter de compter deux fois la même phrase
        seen_norm.add(norm)
        total += 1
        if norm in react_norm:
            found += 1
        else:
            missing.append(phrase)

    coverage = (found / total * 100) if total else 100.0
    return {
        "page_id": page_id,
        "total": total,
        "found": found,
        "missing": missing,
        "coverage": coverage,
    }


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def main() -> int:
    p = argparse.ArgumentParser(
        description="Vérifie la couverture du wireframe HTML par les pages React.",
    )
    p.add_argument("--page", help='Vérifier une seule page (ex: "finance")')
    p.add_argument("--threshold", type=float, default=80.0, help="Seuil de couverture en %")
    p.add_argument("--show-missing", action="store_true", help="Afficher les phrases manquantes")
    p.add_argument("--max-missing", type=int, default=15, help="Nombre max de phrases manquantes affichées")
    p.add_argument("--strict", action="store_true", help="Code de sortie != 0 si une page < threshold")
    args = p.parse_args()

    if not WIREFRAME_PATH.exists():
        print(f"❌ Wireframe introuvable : {WIREFRAME_PATH}", file=sys.stderr)
        return 2

    print(f"📖 Wireframe : {WIREFRAME_PATH.relative_to(PROJECT_ROOT)}")
    html_pages = extract_html_pages(WIREFRAME_PATH)
    print(f"   {len(html_pages)} pages détectées dans le HTML\n")

    targets = [args.page] if args.page else list(PAGE_MAP.keys())
    results = []
    for page_id in targets:
        if page_id not in html_pages:
            print(f"⚠️  Page '{page_id}' absente du HTML, ignorée")
            continue
        if page_id not in PAGE_MAP:
            print(f"⚠️  Page '{page_id}' sans mapping React, ignorée")
            continue
        tsx = APP_DIR / PAGE_MAP[page_id]
        if not tsx.exists():
            print(f"⚠️  Fichier React manquant : {tsx.relative_to(PROJECT_ROOT)}")
            results.append({"page_id": page_id, "total": 0, "found": 0, "missing": [], "coverage": 0.0})
            continue
        react_text = extract_react_text(tsx)
        results.append(check_page(page_id, html_pages[page_id], react_text))

    # Tableau récap
    print(f"{'Page':<14}{'Phrases':>9}{'Trouvées':>10}{'Couverture':>13}   Statut")
    print("-" * 60)
    failed = []
    for r in results:
        ok = r["coverage"] >= args.threshold
        if not ok:
            failed.append(r)
        status = "✅ OK" if ok else "⚠️  À compléter"
        print(f"{r['page_id']:<14}{r['total']:>9}{r['found']:>10}{r['coverage']:>11.1f}%   {status}")

    # Détail des phrases manquantes
    show = failed if not args.show_missing else results
    if show:
        print()
        for r in show:
            if not r["missing"]:
                continue
            header = f"=== {r['page_id']} · {len(r['missing'])} phrase(s) manquante(s) ==="
            print(header)
            for m in r["missing"][: args.max_missing]:
                snippet = m if len(m) <= 140 else m[:137] + "..."
                print(f"  • {snippet}")
            if len(r["missing"]) > args.max_missing:
                print(f"  … +{len(r['missing']) - args.max_missing} autres (utilise --max-missing pour voir plus)")
            print()

    # Bilan
    if failed:
        print(f"⚠️  {len(failed)}/{len(results)} page(s) sous le seuil {args.threshold}%")
        return 1 if args.strict else 0
    print(f"✅ Toutes les {len(results)} pages ≥ {args.threshold}%")
    return 0


if __name__ == "__main__":
    sys.exit(main())
