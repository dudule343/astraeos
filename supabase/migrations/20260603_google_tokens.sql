-- =========================================================================
-- ASTRAEOS · Stockage des tokens OAuth Google Calendar (par ingénieur)
-- Un refresh_token Google = accès longue durée au calendrier de l'ingénieur.
-- Le filesystem Vercel étant éphémère, .data/google-tokens.json ne survit pas
-- aux cold starts : cette table est le store durable et partagé entre lambdas.
-- Accès EXCLUSIVEMENT via service_role (route handlers) — RLS activée sans
-- aucune policy : la clé anon/authenticated ne doit JAMAIS lire cette table.
-- Reprend le pattern de 20260603_ia_settings.sql.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.google_tokens (
  engineer_slug text PRIMARY KEY,            -- identifiant logique de l'ingénieur
  email         text,                        -- email Google connecté
  access_token  text NOT NULL,
  refresh_token text NOT NULL DEFAULT '',
  expires_at    bigint NOT NULL,             -- epoch ms (cf. GoogleTokens.expires_at)
  scope         text,
  granted_at    text,                        -- ISO string (cf. GoogleTokens.granted_at)
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS google_tokens_email_idx ON public.google_tokens (email);

-- Aucune policy : seul service_role (qui bypasse la RLS) peut lire/écrire.
ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- FIN DE LA MIGRATION
-- =========================================================================
