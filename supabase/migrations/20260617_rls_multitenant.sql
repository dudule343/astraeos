-- =========================================================================
-- ASTRAEOS · RLS multi-tenant — isolation par la base
-- =========================================================================
-- Objectif : chaque requête d'un utilisateur authentifié (JWT Supabase Auth)
-- ne voit/n'écrit QUE les données de son tenant (et, le cas échéant, de son
-- cabinet / de ses dossiers). L'isolation est garantie par Postgres, pas par
-- l'application — un bug applicatif ne peut plus faire fuiter un cabinet vers
-- un autre.
--
-- Rôle ciblé : `authenticated` (session SSR via cookies). Le rôle
-- `service_role` BYPASSE la RLS de toute façon : provisioning, route handlers
-- par token public, webhooks, server actions continuent de fonctionner sans
-- policy. On n'ajoute donc AUCUNE policy qui pourrait gêner service_role.
--
-- Rôle `anon` : aujourd'hui aucune requête table ne part avec la clé anon
-- (le client browser `src/lib/supabase/client.ts` n'est importé nulle part).
-- Le seul usage anon est le Realtime *broadcast* visio (channel
-- `realtime:visio:<room>`, private:false) qui est éphémère et ne lit AUCUNE
-- table → activer/durcir la RLS ici ne casse pas la visio.
--
-- -------------------------------------------------------------------------
-- TABLES COUVERTES (policies écrites ici, rôle authenticated)
-- -------------------------------------------------------------------------
-- Tenant-scoped (tenant_id = current_tenant_id()) :
--   tenants (self id), users, cabinets, clients, produits, conversations,
--   timeline_events
-- Cabinet-scoped (tenant_id + cabinet_id = current_cabinet_id()) :
--   souscriptions, rdv, documents
-- Role-aware (cabinet pour director/owner/compliance, sinon ses dossiers) :
--   dossiers
-- Liées par FK (pas de tenant_id propre — policy via EXISTS sur le parent) :
--   personnes (-> clients), dci_responses (-> dossiers), etudes (-> dossiers),
--   etude_phases (-> etudes -> dossiers), commissions (-> souscriptions),
--   messages (-> conversations)
-- Par utilisateur :
--   notifications (recipient_user_id = current_app_user_id())
--
-- -------------------------------------------------------------------------
-- TABLES VOLONTAIREMENT EXCLUES (pas de policy ajoutée ici)
-- -------------------------------------------------------------------------
-- Service_role only (RLS déjà ON, 0 policy = fail-closed pour authenticated,
-- accès server-only conservé tel quel) :
--   collectes, collecte_depots, collecte_messages, collecte_analyses,
--   ia_settings, stt_settings, google_tokens, dci_submissions, entretiens,
--   conformite_items
--   → ces tables sont lues/écrites exclusivement via service_role (liens par
--     token public, BYOK, visio persistée). On NE leur ajoute PAS de policy
--     authenticated : laisser fail-closed est le comportement voulu.
-- RBAC (catalogue, RLS jamais activée — lecture de référence) :
--   permissions, roles, role_permissions
--   → laissées telles quelles ; ne portent pas de données client.
--
-- Idempotent : CREATE OR REPLACE pour les fonctions, ENABLE RLS sans IF (no-op
-- si déjà actif), DROP POLICY IF EXISTS avant chaque CREATE POLICY.
-- =========================================================================


-- =========================================================================
-- 1. FONCTIONS DE CONTEXTE (SECURITY DEFINER, STABLE)
-- =========================================================================
-- Lisent la ligne public.users du requêteur via auth.uid(). SECURITY DEFINER
-- pour bypasser la RLS de `users` (sinon récursion). `SET search_path = public`
-- fige la résolution de schéma (sécurité : pas d'objet injecté via search_path).
-- `(select auth.uid())` est volontaire : Postgres met le résultat en cache par
-- requête (initplan), ce qui évite de ré-évaluer auth.uid() par ligne.

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE auth_user_id = (select auth.uid()) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE auth_user_id = (select auth.uid()) LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_cabinet_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cabinet_id FROM public.users WHERE auth_user_id = (select auth.uid()) LIMIT 1;
$$;

-- Retourne le type métier public.user_role (cf. enum du schéma initial).
-- Note : une fonction du même nom existe déjà (schéma initial) avec la même
-- signature et le même corps — CREATE OR REPLACE la met à jour sans casser
-- les policies existantes qui l'appellent.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE auth_user_id = (select auth.uid()) LIMIT 1;
$$;


-- =========================================================================
-- 2. ENABLE RLS (idempotent — no-op si déjà actif)
-- =========================================================================
ALTER TABLE public.tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cabinets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossiers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dci_responses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etudes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etude_phases    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdv             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- 3. POLICIES — rôle `authenticated`
-- =========================================================================
-- Convention de nommage : <table>_tenant_rw / _cabinet_rw / _scope_rw.
-- On remplace les anciennes policies SELECT-only (tenant_isolation_select,
-- engineer_dossier_scope, client_dossier_scope) par des policies FOR ALL qui
-- couvrent lecture ET écriture (USING + WITH CHECK), sinon tout l'écrit
-- user-facing serait bloqué une fois la session scopée.
--
-- Le rôle 'editor' (super-admin Astraeos) garde une visibilité transverse,
-- comme dans le schéma initial.

-- -------------------------------------------------------------------------
-- tenants : self (sa propre ligne) + editor voit tout
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS tenant_isolation        ON public.tenants;
DROP POLICY IF EXISTS tenant_isolation_select ON public.tenants;
DROP POLICY IF EXISTS tenants_self_rw         ON public.tenants;
CREATE POLICY tenants_self_rw ON public.tenants
  FOR ALL
  TO authenticated
  USING (id = public.current_tenant_id() OR public.current_user_role() = 'editor')
  WITH CHECK (id = public.current_tenant_id() OR public.current_user_role() = 'editor');

-- -------------------------------------------------------------------------
-- TABLES TENANT-SCOPED : tenant_id = current_tenant_id() (ou editor)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS tenant_isolation_select ON public.users;
DROP POLICY IF EXISTS users_tenant_rw         ON public.users;
CREATE POLICY users_tenant_rw ON public.users
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor')
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor');

DROP POLICY IF EXISTS tenant_isolation_select ON public.cabinets;
DROP POLICY IF EXISTS cabinets_tenant_rw      ON public.cabinets;
CREATE POLICY cabinets_tenant_rw ON public.cabinets
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor')
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor');

DROP POLICY IF EXISTS tenant_isolation_select ON public.clients;
DROP POLICY IF EXISTS clients_cabinet_rw      ON public.clients;
DROP POLICY IF EXISTS clients_tenant_rw       ON public.clients;
-- clients porte cabinet_id NOT NULL → on durcit au cabinet ; director/owner/
-- compliance/editor voient tout le tenant.
CREATE POLICY clients_cabinet_rw ON public.clients
  FOR ALL
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR cabinet_id = public.current_cabinet_id()
    )
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR cabinet_id = public.current_cabinet_id()
    )
  );

DROP POLICY IF EXISTS tenant_isolation_select ON public.produits;
DROP POLICY IF EXISTS produits_tenant_rw      ON public.produits;
-- produits = catalogue tenant (cabinet_id nullable) → simple isolation tenant.
CREATE POLICY produits_tenant_rw ON public.produits
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor')
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor');

DROP POLICY IF EXISTS tenant_isolation_select ON public.conversations;
DROP POLICY IF EXISTS conversations_tenant_rw ON public.conversations;
CREATE POLICY conversations_tenant_rw ON public.conversations
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor')
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor');

DROP POLICY IF EXISTS tenant_isolation_select   ON public.timeline_events;
DROP POLICY IF EXISTS timeline_events_tenant_rw ON public.timeline_events;
CREATE POLICY timeline_events_tenant_rw ON public.timeline_events
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor')
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor');

-- -------------------------------------------------------------------------
-- TABLES CABINET-SCOPED : tenant_id + cabinet_id (director/owner = tenant)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS tenant_isolation_select  ON public.souscriptions;
DROP POLICY IF EXISTS souscriptions_cabinet_rw ON public.souscriptions;
CREATE POLICY souscriptions_cabinet_rw ON public.souscriptions
  FOR ALL
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR cabinet_id = public.current_cabinet_id()
    )
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR cabinet_id = public.current_cabinet_id()
    )
  );

DROP POLICY IF EXISTS tenant_isolation_select ON public.rdv;
DROP POLICY IF EXISTS rdv_cabinet_rw          ON public.rdv;
-- rdv porte engineer_id : un engineer ne voit que SES rdv ; director/owner/
-- compliance voient tout le tenant.
CREATE POLICY rdv_cabinet_rw ON public.rdv
  FOR ALL
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR (cabinet_id = public.current_cabinet_id() AND engineer_id = public.current_app_user_id())
    )
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR (cabinet_id = public.current_cabinet_id() AND engineer_id = public.current_app_user_id())
    )
  );

DROP POLICY IF EXISTS tenant_isolation_select ON public.documents;
DROP POLICY IF EXISTS documents_cabinet_rw    ON public.documents;
CREATE POLICY documents_cabinet_rw ON public.documents
  FOR ALL
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR cabinet_id = public.current_cabinet_id()
    )
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR cabinet_id = public.current_cabinet_id()
    )
  );

-- -------------------------------------------------------------------------
-- dossiers : role-aware
--   director / brand_owner / compliance / editor : tout leur tenant
--   engineer : ses dossiers (engineer_id = lui) ou ceux de son cabinet ?
--     → décision plan : un ingénieur voit SES dossiers (engineer_id = lui).
--   client : le(s) dossier(s) où il est rattaché via personnes.user_id.
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS tenant_isolation_select  ON public.dossiers;
DROP POLICY IF EXISTS engineer_dossier_scope   ON public.dossiers;
DROP POLICY IF EXISTS client_dossier_scope     ON public.dossiers;
DROP POLICY IF EXISTS dossiers_scope_rw        ON public.dossiers;
CREATE POLICY dossiers_scope_rw ON public.dossiers
  FOR ALL
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR engineer_id = public.current_app_user_id()
      OR previous_engineer_id = public.current_app_user_id()
      OR (
        public.current_user_role() = 'client'
        AND client_id IN (
          SELECT p.client_id FROM public.personnes p
          WHERE p.user_id = public.current_app_user_id()
        )
      )
    )
  )
  WITH CHECK (
    tenant_id = public.current_tenant_id()
    AND (
      public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
      OR engineer_id = public.current_app_user_id()
    )
  );

-- -------------------------------------------------------------------------
-- TABLES LIÉES PAR FK (pas de tenant_id propre) — EXISTS sur le parent
-- La policy du parent (dossiers/clients/...) applique déjà l'isolation tenant ;
-- on en hérite via la jointure. On répète tout de même le filtre tenant via la
-- table parente pour rester explicite et robuste.
-- -------------------------------------------------------------------------

-- personnes -> clients (clients porte tenant_id + cabinet_id)
DROP POLICY IF EXISTS tenant_isolation_select ON public.personnes;
DROP POLICY IF EXISTS personnes_via_client_rw ON public.personnes;
CREATE POLICY personnes_via_client_rw ON public.personnes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = personnes.client_id
        AND c.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR c.cabinet_id = public.current_cabinet_id()
        )
    )
    -- un client (porteur) voit sa propre fiche personne
    OR personnes.user_id = public.current_app_user_id()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = personnes.client_id
        AND c.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR c.cabinet_id = public.current_cabinet_id()
        )
    )
  );

-- dci_responses -> dossiers (1-1). Hérite de la règle role-aware des dossiers.
DROP POLICY IF EXISTS dci_responses_via_dossier_rw ON public.dci_responses;
CREATE POLICY dci_responses_via_dossier_rw ON public.dci_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dossiers d
      WHERE d.id = dci_responses.dossier_id
        AND d.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR d.engineer_id = public.current_app_user_id()
          OR d.previous_engineer_id = public.current_app_user_id()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dossiers d
      WHERE d.id = dci_responses.dossier_id
        AND d.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR d.engineer_id = public.current_app_user_id()
          OR d.previous_engineer_id = public.current_app_user_id()
        )
    )
  );

-- etudes -> dossiers
DROP POLICY IF EXISTS etudes_via_dossier_rw ON public.etudes;
CREATE POLICY etudes_via_dossier_rw ON public.etudes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dossiers d
      WHERE d.id = etudes.dossier_id
        AND d.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR d.engineer_id = public.current_app_user_id()
          OR d.previous_engineer_id = public.current_app_user_id()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dossiers d
      WHERE d.id = etudes.dossier_id
        AND d.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR d.engineer_id = public.current_app_user_id()
          OR d.previous_engineer_id = public.current_app_user_id()
        )
    )
  );

-- etude_phases -> etudes -> dossiers (2 sauts)
DROP POLICY IF EXISTS etude_phases_via_etude_rw ON public.etude_phases;
CREATE POLICY etude_phases_via_etude_rw ON public.etude_phases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.etudes e
      JOIN public.dossiers d ON d.id = e.dossier_id
      WHERE e.id = etude_phases.etude_id
        AND d.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR d.engineer_id = public.current_app_user_id()
          OR d.previous_engineer_id = public.current_app_user_id()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.etudes e
      JOIN public.dossiers d ON d.id = e.dossier_id
      WHERE e.id = etude_phases.etude_id
        AND d.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR d.engineer_id = public.current_app_user_id()
          OR d.previous_engineer_id = public.current_app_user_id()
        )
    )
  );

-- commissions -> souscriptions (souscriptions porte tenant_id + cabinet_id)
DROP POLICY IF EXISTS commissions_via_souscription_rw ON public.commissions;
CREATE POLICY commissions_via_souscription_rw ON public.commissions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.souscriptions s
      WHERE s.id = commissions.souscription_id
        AND s.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR s.cabinet_id = public.current_cabinet_id()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.souscriptions s
      WHERE s.id = commissions.souscription_id
        AND s.tenant_id = public.current_tenant_id()
        AND (
          public.current_user_role() IN ('editor', 'brand_owner', 'cabinet_director', 'compliance')
          OR s.cabinet_id = public.current_cabinet_id()
        )
    )
  );

-- messages -> conversations (conversations porte tenant_id)
DROP POLICY IF EXISTS messages_via_conversation_rw ON public.messages;
CREATE POLICY messages_via_conversation_rw ON public.messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations cv
      WHERE cv.id = messages.conversation_id
        AND (cv.tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations cv
      WHERE cv.id = messages.conversation_id
        AND (cv.tenant_id = public.current_tenant_id() OR public.current_user_role() = 'editor')
    )
  );

-- -------------------------------------------------------------------------
-- notifications : par utilisateur (recipient_user_id)
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS notifications_owner_rw ON public.notifications;
CREATE POLICY notifications_owner_rw ON public.notifications
  FOR ALL
  TO authenticated
  USING (
    recipient_user_id = public.current_app_user_id()
    OR public.current_user_role() = 'editor'
  )
  WITH CHECK (
    recipient_user_id = public.current_app_user_id()
    OR public.current_user_role() = 'editor'
  );

-- =========================================================================
-- FIN DE LA MIGRATION
-- =========================================================================
