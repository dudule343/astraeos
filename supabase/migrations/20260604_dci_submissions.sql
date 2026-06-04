-- DCI submissions : une ligne par (prospect_slug, kind).
-- Remplace l'usage détourné de dci_responses (1 ligne DEMO_DOSSIER_ID pour tous
-- les prospects) qui rendait le multi-prospect impossible. Service_role only.

CREATE TABLE IF NOT EXISTS public.dci_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_slug text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('rdv', 'simple', 'qualification', 'complet')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_name text,
  source_ip text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prospect_slug, kind)
);

CREATE INDEX IF NOT EXISTS dci_submissions_slug_idx ON public.dci_submissions(prospect_slug);

ALTER TABLE public.dci_submissions ENABLE ROW LEVEL SECURITY;
-- Aucune policy : seul service_role (qui bypasse RLS) y accède.
