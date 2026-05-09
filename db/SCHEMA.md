# Schéma de base de données Astraeos

Source : `reference/wireframes/00_Data_Architecture.html` (synthèse).

## Vue d'ensemble : 16 entités

```
                        ┌──────────────┐
                        │   TENANT     │  Marque · Cabinet direct · Éditeur
                        └──────┬───────┘
                               │ 1..N
            ┌──────────────────┼──────────────────┬─────────┐
            ▼                  ▼                  ▼         ▼
        ┌─────────┐        ┌────────┐        ┌────────┐  ┌─────────┐
        │ CABINET │        │  USER  │        │ CLIENT │  │ PRODUIT │
        └────┬────┘        └────────┘        └────┬───┘  └─────────┘
             │ 1..N                                │ 1..2
             ├─────────────┐                       ▼
             ▼             ▼                  ┌──────────┐
         ┌─────────┐   ┌────────┐             │ PERSONNE │
         │ CLIENT  │   │  USER  │             └──────────┘
         └────┬────┘   └────────┘
              │ 1..N
              ▼
         ┌─────────┐ ⭐ PIVOT
         │ DOSSIER │────┬─────────┬──────────┬──────────┐
         └────┬────┘    │         │          │          │
              │ 1..1    │ 1..1    │ 1..N     │ 1..N     │ 1..N
              ▼         ▼         ▼          ▼          ▼
           ┌─────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐
           │ DCI │  │ETUDE │  │ SUB  │  │ RDV  │  │  DOC   │
           └─────┘  └──────┘  └──┬───┘  └──────┘  └────────┘
                                 │
                                 ▼
                            ┌──────────┐
                            │COMMISSION│
                            └──────────┘
```

Tables transverses (rattachées au dossier) : `messages` / `conversations`, `timeline_events`, `notifications`, `permissions` / `roles`.

## Les 16 entités par bloc

### CORE (5 tables)

| # | Table | Rôle |
|---|---|---|
| 1 | `tenants` | Marque, cabinet direct, ou éditeur. Cloisonnement multi-tenant. |
| 2 | `users` | Compte de connexion (tous rôles). FK vers `auth.users` Supabase. |
| 3 | `cabinets` | Bureau physique. Pour un tenant Marque, c'est un licencié ; pour un tenant Cabinet direct, c'est le cabinet lui-même. |
| 4 | `clients` + `personnes` | Foyer patrimonial : 1 client = 1 ou 2 personnes (célibataire ou couple). |
| 5 | `dossiers` | **Entité PIVOT** : suivi patrimonial dans le pipeline 6 étapes. |

### MÉTIER (6 tables)

| # | Table | Rôle |
|---|---|---|
| 6 | `dci_responses` | Réponses aux 257 questions du DCI, stockées en JSONB par catégorie (1 par dossier). |
| 7 | `etudes` + `etude_phases` | Livrable IA en 5 phases (versions multiples possibles). |
| 8 | `produits` | Catalogue financier (par tenant Marque ou cabinet direct). |
| 9 | `souscriptions` | Acte de placement. Génère les commissions. |
| 10 | `commissions` | Cascade auto-calculée (brand_owner / cabinet / engineer). |
| 11 | `rdv` | RDV visio/présentiel/téléphone, transcript IA. |

### SUPPORT (5 tables)

| # | Table | Rôle |
|---|---|---|
| 12 | `documents` | Tous les fichiers (collecte client, génération système, signature Yousign). |
| 13 | `conversations` + `messages` | Messagerie type Slack (4 types de conversations). |
| 14 | `timeline_events` | Audit + activité unifiée (alimente la timeline et l'audit trail). |
| 15 | `notifications` | Multi-canal (in-app, email, SMS, push). |
| 16 | `permissions` + `roles` + `role_permissions` | RBAC granulaire. |

## Rôles utilisateur (`users.role`)

- `editor` — équipe ASTRAEOS (super admin)
- `brand_owner` — propriétaire de marque (PRIVEOS Capital)
- `cabinet_director` — dirigeant de cabinet
- `engineer` — ingénieur patrimonial
- `compliance` — officier de conformité
- `client` — client final (accès Doc 6 espace client)

## Pipeline 6 étapes (`dossiers.pipeline_stage`)

1. `01_prospect` — création initiale
2. `02_compliance` — DCI simplifié + KYC + lettre de mission
3. `03_collecte` — collecte de documents, OCR, extraction
4. `04_etudes` — module IA (5 phases)
5. `05_restituee` — RDV de restitution effectué
6. `06_suivi` — suivi annuel
7. `00_archive` — état final

## Catégories DCI (13 catégories en JSONB)

1. Identité civile & familiale
2. Activité professionnelle
3. Revenus & charges
4. Patrimoine immobilier
5. Patrimoine financier
6. Sociétés détenues
7. Patrimoine d'usage
8. Endettement
9. Prévoyance
10. Fiscalité (TMI, IFI, déclarations)
11. Régime matrimonial & succession
12. Objectifs & préoccupations
13. KYC (connaissance financière)

## Cloisonnement Row-Level Security (RLS)

Toutes les tables avec `tenant_id` ont une policy RLS qui filtre sur le tenant de l'utilisateur connecté. Les rôles voient :

| Rôle | Périmètre de lecture |
|---|---|
| `editor` | Tous tenants (super admin Astraeos) |
| `brand_owner` | Son tenant entier (tous cabinets, dossiers, etc.) |
| `cabinet_director` | Son cabinet uniquement |
| `engineer` | Ses dossiers (`engineer_id = user.id`) ou ceux du cabinet (à raffiner) |
| `compliance` | Son tenant entier (lecture + actions compliance) |
| `client` | Son foyer (`client_id` lié via `personnes.user_id`) |

Les policies sont définies à la fin de la migration SQL.

## Champs `_cached`

Le schéma utilise des colonnes `*_cached` pour les agrégats lourds (`total_aum_cached`, `network_rank_cached`, etc.). Ces caches sont :

- Recalculés via **trigger** lors d'une mutation locale (souscription créée → `clients.total_aum_cached` recalculé)
- Recalculés via **job nightly** pour les agrégats globaux (`network_rank_cached`)

Les calculs eux-mêmes ne sont pas stockés dans la DB ; ils sont faits côté code applicatif et le résultat est mis en cache.

## Migration

Fichier SQL prêt à appliquer : [`migrations/0001_initial_schema.sql`](migrations/0001_initial_schema.sql)

Procédure :

```bash
# 1. Créer le projet Supabase
supabase login
supabase projects create astraeos --org-id <org_id> --region eu-west-3

# 2. Lier le projet local au projet Supabase
cd ~/mes-projets-cli/astraeos
supabase init
supabase link --project-ref <project_ref>

# 3. Copier la migration dans supabase/migrations/
mkdir -p supabase/migrations
cp db/migrations/0001_initial_schema.sql supabase/migrations/

# 4. Pousser le schéma vers Supabase
supabase db push
```

## Choses à valider AVANT d'appliquer

1. **Les rôles** sont-ils bien : editor, brand_owner, cabinet_director, engineer, compliance, client ?
2. **Le cloisonnement RLS** correspond-il à ta vision (engineer voit son cabinet entier vs ses dossiers seulement) ?
3. **Les ENUM** sont-ils figés ou doivent rester évolutifs ? (ENUM Postgres = migration nécessaire pour ajouter une valeur)
4. **Les champs `_cached`** : préfères-tu les calculer à la volée (vue Postgres) ou les matérialiser (jobs) ?
5. **Le soft delete** : faut-il une colonne `deleted_at` partout, ou les archives via `pipeline_stage = 00_archive` suffit ?
