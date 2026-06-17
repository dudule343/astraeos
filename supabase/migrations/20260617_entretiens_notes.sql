-- Notes manuelles de l'ingénieur pendant l'entretien visio.
-- Tableau jsonb [{t, who?, text}], même forme que transcript. Persistées via
-- PATCH /api/entretiens/[id] { notes_append }. Service_role only (RLS sans policy).

ALTER TABLE public.entretiens
  ADD COLUMN IF NOT EXISTS notes jsonb NOT NULL DEFAULT '[]'::jsonb;
