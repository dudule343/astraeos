-- Entretiens visio persistés : une ligne par `room` (room UNIQUE).
-- Reflète le schéma déjà créé en base. Service_role only (RLS sans policy).
--
-- Contenu :
--   - dci_snapshot : copie du DCI_DATA du cockpit, auto-sauvegardée (débouncée).
--   - transcript   : lignes finales de la transcription [{t, who?, text}], cap 2000.
--   - conseils     : conseils IA injectés pendant l'entretien, cap 200.
--   - articles     : articles de loi IA injectés, cap 200.
--   - rapport      : structure de synthèse posée à la clôture (POST .../terminer).

CREATE TABLE IF NOT EXISTS public.entretiens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL UNIQUE,
  prospect_slug text,
  display_name text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  dci_snapshot jsonb,
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  conseils jsonb NOT NULL DEFAULT '[]'::jsonb,
  articles jsonb NOT NULL DEFAULT '[]'::jsonb,
  rapport jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entretiens_prospect_idx ON public.entretiens(prospect_slug);
CREATE INDEX IF NOT EXISTS entretiens_started_idx ON public.entretiens(started_at DESC);

ALTER TABLE public.entretiens ENABLE ROW LEVEL SECURITY;
-- Aucune policy : seul service_role (qui bypasse RLS) y accède.
