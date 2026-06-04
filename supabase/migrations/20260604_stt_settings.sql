-- =========================================================================
-- ASTRAEOS · BYOK Speech-to-Text (Deepgram) pour la visio
-- Le cabinet branche sa propre clé maître Deepgram. Le navigateur ne reçoit
-- jamais cette clé : on génère à la demande une clé temporaire (TTL 120s,
-- scope minimal usage:write) via /api/visio/stt-token.
-- Accès exclusivement via service_role (route handlers) — RLS activée sans
-- aucune policy. Mono-ligne (un seul cabinet).
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.stt_settings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider   text NOT NULL DEFAULT 'deepgram' CHECK (provider IN ('deepgram')),
  api_key    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Aucune policy : seul le rôle service_role (qui bypasse la RLS) peut lire/écrire.
ALTER TABLE public.stt_settings ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- FIN DE LA MIGRATION
-- =========================================================================
