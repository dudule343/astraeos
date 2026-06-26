-- =========================================================================
-- ASTRAEOS · Signalements internes « Modifications » — bugs & améliorations
-- =========================================================================
-- Outil interne de l'espace ingénieur : l'équipe remonte des bugs et des
-- demandes d'amélioration de l'application (avec captures d'écran), suit leur
-- avancement (nouveau → en cours → en revue → résolu), attache la PR de
-- correction et garde la trace de la validation humaine + captures « après ».
--
-- Repris de l'outil EDILOS (`bug_reports`), ici CONSOLIDÉ : la table porte
-- d'emblée toutes les colonnes (équivalent des migrations 0058 → 0062 d'EDILOS).
-- Lectures/écritures exclusivement via service_role depuis les server actions
-- (cf. src/lib/bug-reports-actions.ts).
--
-- Idempotent : CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, index
-- IF NOT EXISTS. Additif / non destructif.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.bug_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text NOT NULL DEFAULT 'bug'
                    CHECK (type IN ('bug', 'amelioration')),
  title           text NOT NULL,
  reporter        text,
  page_url        text,
  problem         text,
  expected        text,
  intention       text,
  annoyance       text,
  section         text,
  screenshots     text[] NOT NULL DEFAULT '{}',
  status          text NOT NULL DEFAULT 'nouveau'
                    CHECK (status IN ('nouveau', 'en_cours', 'en_revue', 'resolu')),
  pr_url          text,
  fix_screenshots text[] NOT NULL DEFAULT '{}',
  validated_by    text,
  validated_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Colonnes ajoutées défensivement si la table préexistait dans une version
-- antérieure (équivalent des migrations additives EDILOS 0059/0060/0062).
ALTER TABLE public.bug_reports ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public.bug_reports ADD COLUMN IF NOT EXISTS pr_url text;
ALTER TABLE public.bug_reports ADD COLUMN IF NOT EXISTS validated_by text;
ALTER TABLE public.bug_reports ADD COLUMN IF NOT EXISTS validated_at timestamptz;
ALTER TABLE public.bug_reports ADD COLUMN IF NOT EXISTS fix_screenshots text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS bug_reports_created_at_idx
  ON public.bug_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS bug_reports_section_idx
  ON public.bug_reports (section);

-- RLS ON, aucune policy : fail-closed pour `authenticated`, accès server-only
-- via service_role (qui bypasse la RLS). Même posture que partenaires /
-- collectes / entretiens / conformite_items.
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- Fil de discussion / feedback par signalement (table bug_comments).
-- Repli JSON dans Storage tant que cette table n'existe pas (cf bug-reports-actions).
-- ===========================================================================
create table if not exists public.bug_comments (
  id          text primary key,
  report_id   uuid not null references public.bug_reports(id) on delete cascade,
  kind        text not null default 'note'
    check (kind in ('feedback', 'precision_q', 'precision_a', 'note')),
  author      text,
  body        text not null,
  fields      jsonb,
  screenshots text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists bug_comments_report_idx on public.bug_comments (report_id, created_at);
alter table public.bug_comments enable row level security;
