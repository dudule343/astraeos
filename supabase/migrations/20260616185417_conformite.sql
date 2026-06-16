-- =========================================================================
-- ASTRAEOS · Conformité / KYC (étape 02 du parcours)
-- Checklist réglementaire par dossier : DER, KYC, lettre de mission, mandat…
-- Chaque pièce porte un statut qui avance (à faire → envoyé → signé → validé).
-- Accès exclusivement via service_role (server actions) — RLS sans policy,
-- calqué sur 20260603_collectes.sql.
-- =========================================================================

-- =========================================================================
-- 1. ENUM DE STATUT
-- =========================================================================
-- Cycle de vie d'une pièce de conformité. Aligné sur les trackers du
-- wireframe (Préparé/À envoyer/Signé client) et la lettre de mission
-- (signée par les 2 parties → validée par le pro).
CREATE TYPE conformite_item_status AS ENUM (
  'a_faire',   -- pièce à préparer / pas encore traitée
  'envoye',    -- envoyée au client pour signature (Yousign)
  'signe',     -- signée par le client
  'valide'     -- contrôlée et validée par le pro (conformité OK)
);

-- =========================================================================
-- 2. TABLE
-- =========================================================================
-- Une ligne = une pièce de conformité d'un dossier. La checklist réglementaire
-- de référence (les `type` attendus) est définie côté code dans
-- src/lib/conformite.ts (CHECKLIST_CONFORMITE) ; cette table matérialise
-- l'état réel de chaque pièce pour un dossier donné.
CREATE TABLE public.conformite_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  cabinet_id   uuid REFERENCES public.cabinets(id) ON DELETE SET NULL,
  dossier_id   uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  -- clé stable de la pièce dans la checklist réglementaire (cf. conformite.ts)
  -- ex : 'der', 'kyc', 'lettre_mission', 'mandat'
  type         text NOT NULL,
  -- libellé figé au moment de la création (lisible même si la checklist évolue)
  label        text NOT NULL,
  status       conformite_item_status NOT NULL DEFAULT 'a_faire',
  sent_at      timestamptz,
  signed_at    timestamptz,
  validated_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  -- une seule ligne par (dossier, type) : la pièce est unique dans le dossier
  UNIQUE (dossier_id, type)
);

CREATE INDEX conformite_items_dossier_id_idx ON public.conformite_items (dossier_id);
CREATE INDEX conformite_items_tenant_id_idx ON public.conformite_items (tenant_id);

-- =========================================================================
-- 3. ROW LEVEL SECURITY
-- =========================================================================
-- Aucune policy : seul le rôle service_role (qui bypasse la RLS) lit/écrit.
ALTER TABLE public.conformite_items ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- FIN DE LA MIGRATION
-- =========================================================================
