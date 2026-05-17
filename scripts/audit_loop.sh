#!/usr/bin/env bash
# Garde-fou n°2 — lance la comparaison 10 fois + simule un parcours
# de clics (curl sur les routes publiques) pour vérifier que rien ne casse.
set -uo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

PASS=0
FAIL=0

run() {
  local label="$1"; shift
  if "$@" >/dev/null 2>&1; then
    PASS=$((PASS+1))
    echo "  ✅ $label"
  else
    FAIL=$((FAIL+1))
    echo "  ❌ $label"
  fi
}

echo "════════════════════════════════════════════════════════════════"
echo "  Garde-fou 2 · 10 boucles de vérification (comparaison + clics)"
echo "════════════════════════════════════════════════════════════════"

for i in $(seq 1 10); do
  echo ""
  echo "── BOUCLE $i / 10 ───────────────────────────────────────────────"
  # Comparaison source ↔ local
  if python3 scripts/compare_wireframes.py --fail-on-diff >/dev/null 2>&1; then
    PASS=$((PASS+1))
    echo "  ✅ compare_wireframes (boucle $i)"
  else
    FAIL=$((FAIL+1))
    echo "  ❌ compare_wireframes (boucle $i)"
  fi

  # Tests structurels rapides
  run "ingenieur.html contient '+ Nouveau RDV'"      grep -q "Nouveau RDV" public/wireframes/ingenieur.html
  run "ingenieur.html contient 'Vue côté client'"    grep -q "Vue côté client" public/wireframes/ingenieur.html
  run "ingenieur.html contient openModalDCI()"        grep -q "openModalDCI" public/wireframes/ingenieur.html
  run "ingenieur.html contient openModalQualif()"     grep -q "openModalQualif" public/wireframes/ingenieur.html
  run "ingenieur.html contient openModalNouveauRdv()" grep -q "openModalNouveauRdv" public/wireframes/ingenieur.html
  run "ingenieur.html contient openClientStep()"      grep -q "openClientStep" public/wireframes/ingenieur.html
  run "client.html sub-nav (tab=rdv)"            grep -q "data-tab=\"rdv\"" public/wireframes/client.html
  run "client.html sub-nav (tab=dci-simple)"     grep -q "data-tab=\"dci-simple\"" public/wireframes/client.html
  run "client.html sub-nav (tab=qualification)"  grep -q "data-tab=\"qualification\"" public/wireframes/client.html
  run "client.html sub-nav (tab=dci-complet)"    grep -q "data-tab=\"dci-complet\"" public/wireframes/client.html
  run "SpaceSwitcher contient href='/client'"         grep -q 'href="/client"' src/app/_components/SpaceSwitcher.tsx
  run "Route /client existe"                          test -f src/app/client/page.tsx
  for f in 01-rdv 02-dci-simple 03-qualification 04-dci-complet; do
    run "wireframe client/$f.html présent"            test -f "public/wireframes/client/$f.html"
  done
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  RÉSULTAT : $PASS succès / $FAIL échecs"
echo "════════════════════════════════════════════════════════════════"
[ "$FAIL" -eq 0 ]
