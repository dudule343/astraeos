-- =========================================================================
-- ASTRAEOS · Messagerie client ↔ conseiller rattachée à une collecte.
-- Le client écrit depuis sa page de dépôt ; le conseiller répondra depuis
-- son espace (fiche collecte). Accès via service_role uniquement.
-- =========================================================================

CREATE TABLE public.collecte_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collecte_id  uuid NOT NULL REFERENCES public.collectes(id) ON DELETE CASCADE,
  item_index   int,  -- null = message général, sinon document concerné
  author       text NOT NULL CHECK (author IN ('client', 'conseiller')),
  body         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX collecte_messages_collecte_id_idx
  ON public.collecte_messages (collecte_id, created_at);

ALTER TABLE public.collecte_messages ENABLE ROW LEVEL SECURITY;
