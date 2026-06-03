-- =========================================================================
-- ASTRAEOS · Parcours de collecte de documents
-- Liens uniques envoyés au client pour déposer pièces et réponses.
-- Accès exclusivement via service_role (route handlers) — RLS sans policy.
-- =========================================================================

-- =========================================================================
-- 1. TABLES
-- =========================================================================

-- Une collecte = un lien unique adressé à un participant donné.
CREATE TABLE public.collectes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token         text NOT NULL UNIQUE,
  client_nom    text NOT NULL,
  client_email  text NOT NULL,
  -- structure : array de { theme, sub, label, type:'Document'|'Question' }
  structure     jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  opened_at     timestamptz,
  email_sent_at timestamptz,
  email_id      text
);

-- Un dépôt = la réponse à un item de la structure (fichier ou texte).
CREATE TABLE public.collecte_depots (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collecte_id  uuid NOT NULL REFERENCES public.collectes(id) ON DELETE CASCADE,
  item_index   int NOT NULL,
  label        text NOT NULL,
  file_name    text,
  file_size    int,
  mime         text,
  storage_path text,
  reponse      text, -- pour les items de type Question
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collecte_id, item_index)
);

CREATE INDEX collecte_depots_collecte_id_idx ON public.collecte_depots (collecte_id);

-- =========================================================================
-- 2. ROW LEVEL SECURITY
-- =========================================================================
-- Aucune policy : seul le rôle service_role (qui bypasse la RLS) peut lire/écrire.

ALTER TABLE public.collectes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collecte_depots ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 3. STORAGE
-- =========================================================================
-- Bucket privé pour les pièces déposées par les clients.

INSERT INTO storage.buckets (id, name, public)
VALUES ('depots', 'depots', false)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- FIN DE LA MIGRATION
-- =========================================================================
