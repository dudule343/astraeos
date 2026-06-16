#!/usr/bin/env bash
# Vérifie un par un tous les écrans et toutes les routes API de l'app, en prod.
# Usage : bash scripts/verify-app.sh
set -uo pipefail

BASE="${BASE:-https://app.astraeos.fr}"
APEX="${APEX:-https://astraeos.fr}"
# Valeurs réelles pour les segments dynamiques (dossier de test "test marvin").
DOSSIER_ID="${DOSSIER_ID:-e68d3c3b-af6a-4fca-9adc-582eddea6d44}"
PROSPECT="${PROSPECT:-test-dci}"
ROOM="testroom"
TOKEN="abcd-efgh-ijkl"   # token de collecte bidon (attendu 404 = route vivante)

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

PASS=0; WARN=0; FAIL=0
line() { printf '%-52s %-6s %s\n' "$1" "$2" "$3"; }

# Classe un code HTTP. 405 sur une route POST-only = vivante. 404 attendu sur token bidon.
verdict() { # $1=code $2=expect("page"|"api"|"apipost")
  local c="$1" kind="$2"
  case "$kind" in
    page)    [ "$c" = "200" ] && echo "OK" || { [ "$c" = "404" ] && echo "404" || echo "FAIL"; } ;;
    api)     case "$c" in 200|400) echo "OK";; 405) echo "OK(POST)";; 404) echo "404";; *) echo "FAIL";; esac ;;
    apipost) case "$c" in 200|400|401|405) echo "OK";; 404) echo "404";; *) echo "FAIL";; esac ;;
  esac
}

hit() { # $1=url $2=kind $3=label  (GET)
  local code; code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "$1" 2>/dev/null)
  local v; v=$(verdict "$code" "$2")
  case "$v" in OK|OK\(POST\)) PASS=$((PASS+1)); line "$3" "$code" "✅ $v";; 404) WARN=$((WARN+1)); line "$3" "$code" "⚠️ 404";; *) FAIL=$((FAIL+1)); line "$3" "$code" "❌ $v";; esac
}

echo "================ VÉRIF ASTRAEOS · $BASE ================"
echo
echo "----- 1. DOMAINES / VITRINE / ESPACES -----"
hit "$APEX/" page "astraeos.fr (vitrine)"
hit "$BASE/" page "app.astraeos.fr (éditeur)"
for sd in marque dirigeant ingenieur client; do
  hit "https://$sd.astraeos.fr/" page "$sd.astraeos.fr (espace)"
done

echo
echo "----- 2. ÉCRANS ÉDITEUR (pages) -----"
# Routes statiques dérivées des page.tsx (hors dynamiques) :
PAGES=$(find "src/app/(editeur)" -name page.tsx 2>/dev/null \
  | sed -E 's#src/app/\(editeur\)##; s#/page\.tsx$##; s#^$#/#' \
  | grep -v '\[' | sort -u)
for p in $PAGES; do hit "$BASE$p" page "$p"; done

echo
echo "----- 3. SOUS-ÉCRANS DOSSIER (dynamiques, dossier réel) -----"
hit "$BASE/dossiers/$DOSSIER_ID" page "/dossiers/[id]"
hit "$BASE/dossiers/$DOSSIER_ID/conformite" page "/dossiers/[id]/conformite"
hit "$BASE/dossiers/$DOSSIER_ID/collecte?prospect=$PROSPECT" page "/dossiers/[id]/collecte"
hit "$BASE/dossiers/$DOSSIER_ID/etudes" page "/dossiers/[id]/etudes"
hit "$BASE/visio/$ROOM?prospect=$PROSPECT&role=engineer" page "/visio/[room]"
hit "$BASE/depot/$TOKEN" page "/depot/[token] (token bidon→404 ok)"

echo
echo "----- 4. ROUTES API (GET) -----"
hit "$BASE/api/dci?prospect=$PROSPECT" api "/api/dci"
hit "$BASE/api/dci/complet?prospect=$PROSPECT" api "/api/dci/[kind]"
hit "$BASE/api/dci/inbox" api "/api/dci/inbox"
hit "$BASE/api/ia-settings" api "/api/ia-settings"
hit "$BASE/api/visio/stt-settings" api "/api/visio/stt-settings"
hit "$BASE/api/visio/stt-token" apipost "/api/visio/stt-token (POST)"
hit "$BASE/api/visio/conseils" apipost "/api/visio/conseils (POST)"
hit "$BASE/api/visio/dci-extract" apipost "/api/visio/dci-extract (POST)"
hit "$BASE/api/entretiens?prospect=$PROSPECT" api "/api/entretiens"
hit "$BASE/api/collecte-admin/list" api "/api/collecte-admin/list"
hit "$BASE/api/collecte/$TOKEN" api "/api/collecte/[token]"
hit "$BASE/api/collecte/suggest?prospect=$PROSPECT" api "/api/collecte/suggest"
hit "$BASE/api/calendar/status" api "/api/calendar/status"
hit "$BASE/api/qonto/organization" api "/api/qonto/organization"

echo
echo "================ RÉSUMÉ ================"
echo "✅ OK : $PASS   ⚠️ 404 : $WARN   ❌ FAIL : $FAIL"
[ "$FAIL" -eq 0 ] && echo "→ Aucune route cassée." || echo "→ $FAIL route(s) en échec, à corriger."
