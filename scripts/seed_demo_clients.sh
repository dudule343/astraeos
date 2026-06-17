#!/usr/bin/env bash
# Seed les 23 clients de démonstration dans la DB Supabase
# Usage : ./scripts/seed_demo_clients.sh

set -e

URL="${SUPABASE_URL:-https://wdnsogrwjjpkbunuuwem.supabase.co}"
# La clé service_role ne doit JAMAIS être en dur dans un fichier suivi par git.
# Fournis-la par variable d'environnement (échec si absente).
SERVICE_ROLE="${SUPABASE_SERVICE_ROLE_KEY:?Définis SUPABASE_SERVICE_ROLE_KEY dans l'environnement}"
TENANT_ID="00000000-0000-0000-0000-000000000010"
CABINET_ID="00000000-0000-0000-0000-000000000100"
ENGINEER_ID="00000000-0000-0000-0000-000000001000"

insert_demo_client() {
  local raison_sociale="$1"
  local category="$2"        # marque | cabinet_direct | autre_pro
  local sub_category="$3"    # ex: "Marque · Licence", "Cabinet direct", "Notaire"
  local pack="$4"
  local revenue="$5"
  local engineers="$6"
  local end_clients="$7"
  local status="$8"          # actif | a_risque
  local health="$9"
  local representant="${10}"
  local email="${11}"
  local phone="${12}"

  # 1. Insert client
  local client_resp=$(curl -s -X POST "${URL}/rest/v1/clients" \
    -H "apikey: ${SERVICE_ROLE}" -H "Authorization: Bearer ${SERVICE_ROLE}" \
    -H "Content-Type: application/json" -H "Prefer: return=representation" \
    -d "{\"tenant_id\":\"${TENANT_ID}\",\"cabinet_id\":\"${CABINET_ID}\",\"household_type\":\"celibataire\",\"acquisition_origin\":\"captation_directe\"}")
  local client_id=$(echo "$client_resp" | grep -oE '"id":"[^"]+"' | head -1 | cut -d'"' -f4)

  # 2. Insert personne (representant légal)
  local first_name=$(echo "$representant" | awk '{print $1}')
  local last_name=$(echo "$representant" | awk '{$1=""; print substr($0,2)}')
  curl -s -X POST "${URL}/rest/v1/personnes" \
    -H "apikey: ${SERVICE_ROLE}" -H "Authorization: Bearer ${SERVICE_ROLE}" \
    -H "Content-Type: application/json" -H "Prefer: return=minimal" \
    -d "{\"client_id\":\"${client_id}\",\"role_in_household\":\"person_a\",\"first_name\":\"${first_name}\",\"last_name\":\"${last_name}\",\"email\":\"${email}\",\"phone\":\"${phone}\"}" > /dev/null

  # 3. Insert dossier with notes (raison sociale, catégorie, etc.)
  local notes="{\"raison_sociale\":\"${raison_sociale}\",\"category\":\"${category}\",\"sub_category\":\"${sub_category}\",\"pack\":\"${pack}\",\"revenue\":\"${revenue}\",\"engineers\":\"${engineers}\",\"end_clients\":\"${end_clients}\",\"status\":\"${status}\",\"health\":\"${health}\",\"is_demo\":true}"
  curl -s -X POST "${URL}/rest/v1/dossiers" \
    -H "apikey: ${SERVICE_ROLE}" -H "Authorization: Bearer ${SERVICE_ROLE}" \
    -H "Content-Type: application/json" -H "Prefer: return=minimal" \
    -d "{\"tenant_id\":\"${TENANT_ID}\",\"cabinet_id\":\"${CABINET_ID}\",\"client_id\":\"${client_id}\",\"engineer_id\":\"${ENGINEER_ID}\",\"pipeline_stage\":\"06_suivi\",\"pipeline_entry_date\":\"2025-01-01\",\"internal_notes\":${notes}}" > /dev/null

  echo "  ✓ ${raison_sociale}"
}

echo "=== Seed 3 marques ==="
insert_demo_client "PRIVEOS Capital"      "marque" "Marque · Licence"   "Premium"  "12800"  "~80" "486" "actif"   "78" "Marc DELORME"        "contact@priveos-capital.fr"        "01 42 25 80 12"
insert_demo_client "Fontaine & Réseau"    "marque" "Marque · Réseau"    "Premium"  "5600"   "~32" "198" "actif"   "85" "Pierre FONTAINE"     "p.fontaine@fontaine-reseau.fr"     "04 78 92 14 56"
insert_demo_client "Atlas Patrimoine"     "marque" "Marque · Franchise" "Standard" "3800"   "~24" "142" "actif"   "82" "Émilie ATLAS"        "e.atlas@atlas-patrimoine.fr"       "01 56 88 22 70"

echo "=== Seed 4 cabinets directs ==="
insert_demo_client "Cabinet Dupont & Associés" "cabinet_direct" "Cabinet direct" "Premium"  "2400" "6" "48" "actif"    "92" "Jean DUPONT"     "j.dupont@dupont-associes.fr"          "01 47 23 88 11"
insert_demo_client "Mont-Blanc Patrimoine"     "cabinet_direct" "Cabinet direct" "Premium"  "2100" "4" "32" "actif"    "89" "Sophie MORENO"   "s.moreno@montblanc-patrimoine.fr"     "04 50 77 30 25"
insert_demo_client "Cabinet Lyonnais"          "cabinet_direct" "Cabinet direct" "Standard" "1800" "3" "22" "a_risque" "58" "Patrick LYON"    "p.lyon@cabinet-lyonnais.fr"           "04 78 14 22 65"
insert_demo_client "Bordeaux Patrimoine"       "cabinet_direct" "Cabinet direct" "Standard" "1200" "2" "14" "a_risque" "42" "Hélène BORDEAUX" "h.bordeaux@bordeaux-patrimoine.fr"    "05 56 81 17 90"

echo "=== Seed 3 autres professionnels ==="
insert_demo_client "Notaire Mercier & Cie"  "autre_pro" "Notaire" "Standard" "1200" "3" "28" "actif"    "88" "Maître MERCIER" "contact@mercier-notaires.fr" "01 44 50 22 18"
insert_demo_client "Cabinet Aubert Avocats" "autre_pro" "Avocat"  "Standard" "980"  "2" "12" "actif"    "81" "Maître AUBERT"  "contact@aubert-avocats.fr"   "01 44 55 90 33"
insert_demo_client "Notaire Pollet"         "autre_pro" "Notaire" "Standard" "820"  "1" "8"  "a_risque" "54" "Maître POLLET"  "contact@pollet-notaire.fr"   "02 99 67 18 44"

echo ""
echo "=== Seed terminé : 10 clients de démo créés ==="
