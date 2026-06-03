-- =========================================================================
-- ASTRAEOS · BYOK (Bring Your Own Key) + analyse IA des dépôts
-- Le cabinet branche sa propre clé Anthropic ; l'analyse des documents
-- déposés est facturée sur son compte. Accès exclusivement via service_role
-- (route handlers) — RLS activée sans aucune policy.
-- =========================================================================

-- =========================================================================
-- 1. TABLES
-- =========================================================================

-- Clé API du cabinet. Mono-ligne pour l'instant (un seul cabinet).
CREATE TABLE public.ia_settings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider   text NOT NULL DEFAULT 'anthropic',
  api_key    text NOT NULL,
  model      text NOT NULL DEFAULT 'claude-haiku-4-5',
  label      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Une analyse = le verdict de l'IA sur un dépôt (item d'une collecte).
CREATE TABLE public.collecte_analyses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collecte_id uuid NOT NULL REFERENCES public.collectes(id) ON DELETE CASCADE,
  item_index  int NOT NULL,
  status      text NOT NULL CHECK (status IN ('conforme','incoherence','illisible','erreur','en_cours')),
  resume      text,
  detail      text,
  model       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collecte_id, item_index)
);

CREATE INDEX collecte_analyses_collecte_id_idx ON public.collecte_analyses (collecte_id);

-- =========================================================================
-- 2. ROW LEVEL SECURITY
-- =========================================================================
-- Aucune policy : seul le rôle service_role (qui bypasse la RLS) peut lire/écrire.

ALTER TABLE public.ia_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collecte_analyses ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- FIN DE LA MIGRATION
-- =========================================================================
