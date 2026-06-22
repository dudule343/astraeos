-- =========================================================================
-- ASTRAEOS · Catalogue des types de rendez-vous (écran « Mes types de RDV »)
-- Configuration personnelle de l'ingénieur : durée, couleur, visibilité,
-- activation. Lu/écrit exclusivement via service_role (server actions de
-- l'espace ingénieur), scope tenant/cabinet.
-- =========================================================================

-- =========================================================================
-- 1. TABLE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.rdv_types (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL,
  cabinet_id uuid NOT NULL,
  label      text NOT NULL,
  duree_min  int  NOT NULL DEFAULT 60,
  couleur    text,
  actif      bool NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rdv_types_scope_idx
  ON public.rdv_types (tenant_id, cabinet_id);

-- =========================================================================
-- 2. ROW LEVEL SECURITY
-- =========================================================================
-- Aucune policy : seul service_role (qui bypasse la RLS) lit/écrit. Cohérent
-- avec les autres tables server-only de l'espace ingénieur.

ALTER TABLE public.rdv_types ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- FIN DE LA MIGRATION
-- =========================================================================
