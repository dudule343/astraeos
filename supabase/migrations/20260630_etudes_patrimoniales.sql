-- =========================================================================
-- ASTRAEOS · Études patrimoniales (outil ingénieur) — audit + ingénierie
-- =========================================================================
-- Outil de l'espace ingénieur (sous « Outils ») : créer une étude patrimoniale
-- par client, générer l'AUDIT patrimonial (document riche porté de la maquette),
-- pré-rempli depuis les données réelles du client (foyer/fiscalité/risque/produits)
-- et complété/édité par l'ingénieur, qui valide chaque bloc (horodaté + signé).
--
-- Modèle DÉDIÉ (on ne réutilise pas la table `etudes` du workflow éditeur, qui
-- porte un autre concept à 5 phases). Lectures/écritures via service_role depuis
-- les server actions (cf. _data/etudes-patrimoniales-server.ts).
--
-- Idempotent et additif. RLS activée sans policy (fail-closed pour anon/auth,
-- accès server-only via service_role) : même posture que collectes/dci_submissions.
-- =========================================================================

create table if not exists public.etudes_patrimoniales (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid,
  cabinet_id   uuid,
  client_id    uuid references public.clients(id) on delete set null,
  dossier_id   uuid references public.dossiers(id) on delete set null,
  engineer_id  uuid,
  titre        text not null default 'Étude patrimoniale',
  statut       text not null default 'brouillon'
                 check (statut in ('brouillon', 'en_cours', 'validee', 'restituee')),
  -- Jeu de données de l'audit : pré-rempli depuis le réel (foyer, fiscalité,
  -- risque, produits) puis complété par l'ingénieur. JSONB pour évoluer sans
  -- migration au fil du port des sections.
  donnees      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists etudes_patrimoniales_client_idx
  on public.etudes_patrimoniales (client_id);
create index if not exists etudes_patrimoniales_scope_idx
  on public.etudes_patrimoniales (tenant_id, cabinet_id, engineer_id);
create index if not exists etudes_patrimoniales_created_idx
  on public.etudes_patrimoniales (created_at desc);

alter table public.etudes_patrimoniales enable row level security;

-- ===========================================================================
-- État par bloc : validation horodatée/signée par l'ingénieur + contenu édité.
-- `bloc_key` = valeur du data-block de la maquette (ex. « Composition du foyer »).
-- ===========================================================================
create table if not exists public.etude_blocs (
  id            uuid primary key default gen_random_uuid(),
  etude_id      uuid not null references public.etudes_patrimoniales(id) on delete cascade,
  bloc_key      text not null,
  contenu_edite text,
  valide        boolean not null default false,
  valide_par    text,
  valide_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (etude_id, bloc_key)
);

create index if not exists etude_blocs_etude_idx
  on public.etude_blocs (etude_id);

alter table public.etude_blocs enable row level security;
