-- =========================================================================
-- ASTRAEOS · Carnet partenaires & apporteurs d'affaires — persistance réelle
-- =========================================================================
-- Avant cette migration, la création d'un partenaire (modale « Nouveau
-- partenaire » de l'écran ingénieur) était tracée best-effort dans
-- `dossier_events` (table de traçabilité générique) : un partenaire créé
-- n'avait pas de table dédiée et ne réapparaissait jamais dans la liste.
--
-- Cette table porte le carnet du cabinet : partenaires recommandables (PRIVEOS
-- transmet des clients vers eux) ET apporteurs d'affaires (amènent des clients
-- au cabinet). Scopée tenant + cabinet, lue/écrite exclusivement via
-- service_role depuis les server modules / server actions.
--
-- Idempotent : CREATE TABLE IF NOT EXISTS, index IF NOT EXISTS.
-- Additif / non destructif.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.partenaires (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid,
  cabinet_id  uuid,
  nom         text,
  type        text,
  email       text,
  telephone   text,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partenaires_tenant_cabinet_idx
  ON public.partenaires (tenant_id, cabinet_id);

CREATE INDEX IF NOT EXISTS partenaires_created_at_idx
  ON public.partenaires (created_at DESC);

-- RLS ON, aucune policy : fail-closed pour `authenticated`, accès server-only
-- conservé via service_role (qui bypasse la RLS). Même posture que collectes /
-- entretiens / conformite_items (cf. 20260617_rls_multitenant.sql).
ALTER TABLE public.partenaires ENABLE ROW LEVEL SECURITY;
