#!/usr/bin/env python3
"""
Garde-fou n°1 — compare les wireframes source (Google Drive) avec les
copies locales dans `public/wireframes/` et liste tout ce qui manque :
ids, onclick, href, data-action, data-target, data-page, classes
interactives, et boutons/links visibles.

Usage:
  python3 scripts/compare_wireframes.py
  python3 scripts/compare_wireframes.py --verbose
  python3 scripts/compare_wireframes.py --fail-on-diff  # exit 1 si diff

Sortie:
  Pour chaque paire (source, local) :
    - n. lignes / n. octets
    - elements interactifs en source vs local
    - liste des onclick handlers absents en local
    - liste des id, href, data-* absents
    - verdict OK / MANQUE
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from collections import Counter

REPO = Path(__file__).resolve().parent.parent
DRIVE = Path(
    "/Users/marvinmouton/Library/CloudStorage/GoogleDrive-contact@priveos.io/"
    "Drive partagés/PRIVEOS/1 - Administratif & Juridique/20 - Astraeos/"
    "0 - Construction de la Saas"
)

# (source_path, local_path_relative_to_repo)
# Le source est résolu relativement à DRIVE par défaut. Préfixe `repo:` →
# résolu relativement au repo (utile quand la source Drive n'est pas
# synchronisée localement et qu'on garde une copie de référence dans reference/).
PAIRS = [
    (
        "repo:reference/wireframes/032_Wireframes_Ingenieur_v40_content_snare.html",
        "public/wireframes/ingenieur.html",
    ),
    (
        "04 - Client/041 - AgendaCalendly_PRIVEOS Ce que le client voit pour prendre rdv.html",
        "public/wireframes/client/01-rdv.html",
    ),
    (
        "04 - Client/042 - Espace_Prospect_DCI_Simplifie.html",
        "public/wireframes/client/02-dci-simple.html",
    ),
    (
        "04 - Client/043 - Espace_Client_Questionnaire_Qualification.html",
        "public/wireframes/client/03-qualification.html",
    ),
    (
        "04 - Client/044 - Espace_Client_DCI_Complet.html",
        "public/wireframes/client/04-dci-complet.html",
    ),
]

# --- patterns d'extraction --------------------------------------------------

# Tolère les guillemets doubles ET simples (`attr="..."` ou `attr='...'`)
_Q = r'''(?:"([^"]*)"|'([^']*)')'''


def _attr(name: str) -> re.Pattern:
    return re.compile(rf'{name}\s*=\s*{_Q}')


PATTERNS = {
    "onclick":      _attr(r'onclick'),
    "href":         _attr(r'href'),
    "id":           _attr(r'\bid'),
    "data-page":    _attr(r'data-page'),
    "data-action":  _attr(r'data-action'),
    "data-target":  _attr(r'data-target'),
    "data-modal":   _attr(r'data-modal[a-z-]*'),
    "data-step":    _attr(r'data-step'),
    "data-tab":     _attr(r'data-tab'),
    "data-status":  _attr(r'data-status'),
    "for=":         _attr(r'\bfor'),
    "<button":      re.compile(r'<button\b', re.IGNORECASE),
    "<a ":          re.compile(r'<a\b[^>]*\bhref=', re.IGNORECASE),
    "page-div":     re.compile(r'<div\s+class=["\']page[^"\']*["\']\s+id=["\']([^"\']+)["\']'),
    "nav-item":     re.compile(r'class=["\']nav-item[^"\']*["\'][^>]*data-page=["\']([^"\']+)["\']'),
    "modal-id":     re.compile(r'\bid=["\'](modal-[^"\']+)["\']'),
    "function-def": re.compile(r'function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\('),
}


def extract(content: str) -> dict[str, list[str]]:
    """Extrait par catégorie toutes les occurrences.

    Les patterns d'attributs (`_attr`) retournent des tuples
    (double_quote, single_quote) — on aplatit en gardant le groupe non vide.
    """
    out: dict[str, list[str]] = {}
    for name, pat in PATTERNS.items():
        raw = pat.findall(content)
        if raw and isinstance(raw[0], tuple):
            out[name] = [next((g for g in t if g), "") for t in raw]
        else:
            out[name] = raw
    return out


def compare_pair(src_path: Path, local_path: Path, verbose: bool = False) -> dict:
    src_txt = src_path.read_text(encoding="utf-8", errors="replace")
    loc_txt = local_path.read_text(encoding="utf-8", errors="replace")

    src = extract(src_txt)
    loc = extract(loc_txt)

    result = {
        "src_path": str(src_path),
        "local_path": str(local_path),
        "src_lines": src_txt.count("\n") + 1,
        "loc_lines": loc_txt.count("\n") + 1,
        "src_bytes": len(src_txt.encode("utf-8")),
        "loc_bytes": len(loc_txt.encode("utf-8")),
        "diff_by_category": {},
        "missing_in_local": {},
        "total_missing": 0,
    }

    for cat in PATTERNS:
        src_items = src.get(cat, [])
        loc_items = loc.get(cat, [])

        # Pour les compteurs simples (<button, <a )
        if cat in ("<button", "<a "):
            result["diff_by_category"][cat] = {
                "src_count": len(src_items),
                "loc_count": len(loc_items),
                "delta": len(loc_items) - len(src_items),
            }
            continue

        src_counter = Counter(src_items)
        loc_counter = Counter(loc_items)
        missing = []
        for value, src_n in src_counter.items():
            loc_n = loc_counter.get(value, 0)
            if loc_n < src_n:
                missing.append((value, src_n, loc_n))
        result["diff_by_category"][cat] = {
            "src_count": sum(src_counter.values()),
            "loc_count": sum(loc_counter.values()),
            "unique_missing": len(missing),
        }
        if missing:
            result["missing_in_local"][cat] = missing
            result["total_missing"] += len(missing)

    return result


def render(report: dict, verbose: bool = False) -> str:
    out: list[str] = []
    out.append("=" * 78)
    out.append(f"📄  {report['local_path']}")
    out.append(f"    source : {report['src_path']}")
    out.append(
        f"    lignes : source={report['src_lines']:>6}  local={report['loc_lines']:>6}  "
        f"Δ={report['loc_lines'] - report['src_lines']:+d}"
    )
    out.append(
        f"    octets : source={report['src_bytes']:>7}  local={report['loc_bytes']:>7}  "
        f"Δ={report['loc_bytes'] - report['src_bytes']:+d}"
    )
    out.append("-" * 78)
    out.append(f"{'Catégorie':<14} {'Source':>8} {'Local':>8} {'Manquant':>10}")
    out.append("-" * 78)
    for cat, d in report["diff_by_category"].items():
        src_c = d.get("src_count", 0)
        loc_c = d.get("loc_count", 0)
        miss = d.get("unique_missing", abs(d.get("delta", 0)) if d.get("delta", 0) < 0 else 0)
        marker = "❌" if miss else "✅"
        out.append(f"{cat:<14} {src_c:>8} {loc_c:>8} {miss:>9} {marker}")
    out.append("-" * 78)
    out.append(f"TOTAL valeurs manquantes : {report['total_missing']}")

    if verbose and report["missing_in_local"]:
        out.append("")
        out.append("DÉTAIL des éléments manquants en local :")
        for cat, items in report["missing_in_local"].items():
            out.append(f"  [{cat}] {len(items)} valeurs manquantes :")
            for value, src_n, loc_n in items[:30]:
                short = (value[:90] + "…") if len(value) > 90 else value
                out.append(f"    - ({src_n}→{loc_n})  {short}")
            if len(items) > 30:
                out.append(f"    … ({len(items) - 30} autres)")

    out.append("")
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--verbose", action="store_true", help="détail des éléments manquants")
    ap.add_argument("--fail-on-diff", action="store_true", help="exit 1 si différences")
    args = ap.parse_args()

    total_missing = 0
    print("\n🔍 Comparaison source (Drive) ↔ local (public/wireframes/)\n")

    for src_rel, local_rel in PAIRS:
        if src_rel.startswith("repo:"):
            src_path = REPO / src_rel[len("repo:"):]
        else:
            src_path = DRIVE / src_rel
        local_path = REPO / local_rel
        if not src_path.exists():
            print(f"❌ Source introuvable : {src_path}")
            total_missing += 1
            continue
        if not local_path.exists():
            print(f"❌ Local introuvable : {local_path}")
            total_missing += 1
            continue
        report = compare_pair(src_path, local_path, verbose=args.verbose)
        print(render(report, verbose=args.verbose))
        total_missing += report["total_missing"]

    print("=" * 78)
    if total_missing == 0:
        print("✅ AUCUN élément manquant détecté. Tous les wireframes sont alignés.")
        return 0
    print(f"⚠️  {total_missing} éléments manquants détectés.")
    return 1 if args.fail_on_diff else 0


if __name__ == "__main__":
    sys.exit(main())
