-- =========================================================================
-- ASTRAEOS · Initial schema migration
-- Source : reference/wireframes/00_Data_Architecture.html (16 entités)
-- Cible : Supabase Postgres 15+
-- =========================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. ENUMS
-- =========================================================================

CREATE TYPE tenant_type AS ENUM ('marque', 'cabinet_direct', 'editeur');
CREATE TYPE subscription_plan AS ENUM ('marque', 'cabinet_basic', 'cabinet_pro', 'cabinet_enterprise', 'editeur');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'suspended', 'churned');
CREATE TYPE user_role AS ENUM ('editor', 'brand_owner', 'cabinet_director', 'engineer', 'compliance', 'client');
CREATE TYPE region AS ENUM ('idf', 'aura', 'paca', 'nouvelle_aquitaine', 'occitanie', 'bretagne', 'normandie', 'hauts_de_france', 'grand_est', 'pays_de_la_loire', 'centre_val_de_loire', 'bourgogne_franche_comte', 'corse', 'outre_mer');
CREATE TYPE household_type AS ENUM ('couple_marie', 'couple_pacs', 'celibataire', 'divorce', 'veuf');
CREATE TYPE marital_regime AS ENUM ('communaute_reduite_acquets', 'communaute_universelle', 'separation_biens', 'participation_aux_acquets');
CREATE TYPE acquisition_origin AS ENUM ('recommandation', 'captation_directe', 'reattribution', 'marketing', 'autre');
CREATE TYPE role_in_household AS ENUM ('person_a', 'person_b');
CREATE TYPE employment_status AS ENUM ('cdi', 'cdd', 'cadre_dirigeant', 'tns_liberal', 'tns_artisan', 'fonctionnaire', 'retraite', 'chomeur', 'etudiant', 'autre');
CREATE TYPE pipeline_stage AS ENUM ('01_prospect', '02_compliance', '03_collecte', '04_etudes', '05_restituee', '06_suivi', '00_archive');
CREATE TYPE weather_indicator AS ENUM ('sunny', 'cloudy', 'rainy', 'storm');
CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE dci_status AS ENUM ('draft', 'simplified_completed', 'full_in_progress', 'full_validated', 'signed');
CREATE TYPE etude_status AS ENUM ('draft', 'in_progress', 'delivered', 'updated_in_progress', 'archived');
CREATE TYPE etude_phase AS ENUM ('phase_1_bilan', 'phase_2_strategies', 'phase_3_synthese', 'phase_4_frise', 'phase_5_mise_en_forme', 'completed');
CREATE TYPE produit_category AS ENUM ('av_multisupport', 'av_lux', 'per', 'scpi', 'fpci', 'opci', 'structure', 'prevoyance', 'credit', 'autre');
CREATE TYPE produit_status AS ENUM ('active', 'testing', 'archived');
CREATE TYPE souscription_status AS ENUM ('pending_signature', 'signed', 'active', 'partial_redemption', 'closed');
CREATE TYPE payment_method AS ENUM ('virement', 'prelevement', 'cheque');
CREATE TYPE commission_type AS ENUM ('upfront', 'recurring_management', 'performance', 'study_fee');
CREATE TYPE commission_recipient AS ENUM ('brand_owner', 'cabinet', 'engineer_bonus');
CREATE TYPE commission_status AS ENUM ('pending', 'received', 'reconciled');
CREATE TYPE rdv_type AS ENUM ('decouverte', 'collecte', 'restitution', 'signature', 'suivi_annuel', 'autre');
CREATE TYPE rdv_format AS ENUM ('visio', 'presentiel', 'telephone');
CREATE TYPE rdv_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE document_category AS ENUM ('collecte', 'genere_systeme', 'signe', 'partage_cabinet');
CREATE TYPE document_type AS ENUM ('avis_imposition', 'fiche_paie', 'k_bis', 'livret_famille', 'etude_complete', 'synthese_restitution', 'lettre_mission', 'kyc', 'contrat_produit', 'autre');
CREATE TYPE document_status AS ENUM ('pending_validation', 'validated', 'rejected', 'archived');
CREATE TYPE document_visibility AS ENUM ('private_pro', 'shared_with_client', 'public_internal');
CREATE TYPE conversation_type AS ENUM ('client_engineer', 'internal_cabinet', 'cabinet_brand_owner', 'tenant_editor_support');
CREATE TYPE message_content_type AS ENUM ('text', 'file', 'system_event', 'ai_suggestion');
CREATE TYPE timeline_event_type AS ENUM ('dossier_created', 'stage_changed', 'document_uploaded', 'document_signed', 'rdv_scheduled', 'rdv_completed', 'ai_phase_started', 'ai_phase_validated', 'study_delivered', 'subscription_signed', 'commission_received', 'note_added', 'impersonation', 'compliance_review');
CREATE TYPE timeline_actor_type AS ENUM ('client', 'engineer', 'cabinet_director', 'brand_owner', 'system', 'ai');
CREATE TYPE timeline_visibility AS ENUM ('internal_only', 'visible_client');
CREATE TYPE notification_type AS ENUM ('new_message', 'document_signed', 'rdv_reminder', 'study_delivered', 'commission_received', 'compliance_alert', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'critical');

-- =========================================================================
-- 2. CORE TABLES
-- =========================================================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_type tenant_type NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand_color_primary TEXT,
  brand_color_accent TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  subscription_plan subscription_plan,
  subscription_status subscription_status DEFAULT 'active',
  activated_modules JSONB DEFAULT '{}'::jsonb,
  parent_tenant_id UUID REFERENCES tenants(id),
  orias_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tenants_type ON tenants(tenant_type);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Lien optionnel vers auth.users de Supabase pour l'authentification
  auth_user_id UUID UNIQUE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabinet_id UUID, -- FK ajoutée plus bas après création de cabinets
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT,
  last_login_at TIMESTAMPTZ,
  orias_number TEXT,
  specialties TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_cabinet ON users(cabinet_id);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE cabinets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  director_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  address_street TEXT,
  address_city TEXT,
  address_zipcode TEXT,
  region region,
  phone TEXT,
  email TEXT,
  orias_number TEXT,
  rc_pro_insurer TEXT,
  rc_pro_expiry_date DATE,
  contract_start_date DATE,
  commission_split_to_owner DECIMAL(5,2),
  total_aum_cached DECIMAL(15,2) DEFAULT 0,
  total_clients_cached INT DEFAULT 0,
  network_rank_cached INT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cabinets_tenant ON cabinets(tenant_id);
CREATE INDEX idx_cabinets_region ON cabinets(region);

-- Maintenant on peut ajouter la FK users.cabinet_id
ALTER TABLE users ADD CONSTRAINT users_cabinet_id_fkey
  FOREIGN KEY (cabinet_id) REFERENCES cabinets(id) ON DELETE SET NULL;

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabinet_id UUID NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
  household_type household_type,
  marital_regime marital_regime,
  marriage_date DATE,
  household_address TEXT,
  nb_children INT DEFAULT 0,
  nb_dependents INT DEFAULT 0,
  tax_residency TEXT DEFAULT 'FR',
  acquisition_origin acquisition_origin,
  referrer_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  total_aum_cached DECIMAL(15,2) DEFAULT 0,
  net_worth_cached DECIMAL(15,2) DEFAULT 0,
  life_value_cached DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_clients_cabinet ON clients(cabinet_id);

CREATE TABLE personnes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role_in_household role_in_household NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_name TEXT,
  birth_date DATE,
  birth_city TEXT,
  nationality TEXT,
  profession TEXT,
  employer TEXT,
  employment_status employment_status,
  tmi_estimated DECIMAL(4,2),
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, role_in_household)
);
CREATE INDEX idx_personnes_client ON personnes(client_id);
CREATE INDEX idx_personnes_user ON personnes(user_id);

CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabinet_id UUID NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  previous_engineer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pipeline_stage pipeline_stage NOT NULL DEFAULT '01_prospect',
  pipeline_entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
  dci_completion_pct INT DEFAULT 0 CHECK (dci_completion_pct BETWEEN 0 AND 100),
  ai_quality_score DECIMAL(3,1) CHECK (ai_quality_score BETWEEN 0 AND 10),
  weather_indicator weather_indicator,
  priority priority_level DEFAULT 'normal',
  letter_of_mission_signed_at TIMESTAMPTZ,
  study_delivered_at TIMESTAMPTZ,
  restitution_meeting_date DATE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  days_in_stage_cached INT DEFAULT 0,
  total_revenue_cached DECIMAL(15,2) DEFAULT 0,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dossiers_tenant ON dossiers(tenant_id);
CREATE INDEX idx_dossiers_cabinet ON dossiers(cabinet_id);
CREATE INDEX idx_dossiers_client ON dossiers(client_id);
CREATE INDEX idx_dossiers_engineer ON dossiers(engineer_id);
CREATE INDEX idx_dossiers_stage ON dossiers(pipeline_stage);

-- =========================================================================
-- 3. MÉTIER TABLES
-- =========================================================================

CREATE TABLE dci_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID UNIQUE NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  status dci_status NOT NULL DEFAULT 'draft',
  simplified_completed_at TIMESTAMPTZ,
  full_validated_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  responses_cat_01_identite JSONB DEFAULT '{}'::jsonb,
  responses_cat_02_pro JSONB DEFAULT '{}'::jsonb,
  responses_cat_03_revenus JSONB DEFAULT '{}'::jsonb,
  responses_cat_04_immobilier JSONB DEFAULT '{}'::jsonb,
  responses_cat_05_financier JSONB DEFAULT '{}'::jsonb,
  responses_cat_06_pro_societes JSONB DEFAULT '{}'::jsonb,
  responses_cat_07_usage JSONB DEFAULT '{}'::jsonb,
  responses_cat_08_endettement JSONB DEFAULT '{}'::jsonb,
  responses_cat_09_couverture JSONB DEFAULT '{}'::jsonb,
  responses_cat_10_fiscalite JSONB DEFAULT '{}'::jsonb,
  responses_cat_11_succession JSONB DEFAULT '{}'::jsonb,
  responses_cat_12_objectifs JSONB DEFAULT '{}'::jsonb,
  responses_cat_13_kyc JSONB DEFAULT '{}'::jsonb,
  completion_pct_cached INT DEFAULT 0,
  completion_by_cat_cached JSONB DEFAULT '{}'::jsonb,
  ai_inconsistencies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE etudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  status etude_status NOT NULL DEFAULT 'draft',
  current_phase etude_phase,
  phase_progress_pct INT DEFAULT 0 CHECK (phase_progress_pct BETWEEN 0 AND 100),
  delivered_at TIMESTAMPTZ,
  restitution_meeting_id UUID, -- FK vers rdv ajoutée plus bas
  complete_pdf_url TEXT,
  summary_pdf_url TEXT,
  interactive_web_url TEXT,
  client_satisfaction_score INT CHECK (client_satisfaction_score BETWEEN 1 AND 10),
  decisions_retained JSONB DEFAULT '{}'::jsonb,
  total_ai_cost_eur DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dossier_id, version)
);
CREATE INDEX idx_etudes_dossier ON etudes(dossier_id);

CREATE TABLE etude_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etude_id UUID NOT NULL REFERENCES etudes(id) ON DELETE CASCADE,
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  validated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ai_model_used TEXT,
  ai_prompts_log JSONB DEFAULT '[]'::jsonb,
  draft_content JSONB DEFAULT '{}'::jsonb,
  cost_eur DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (etude_id, phase_number)
);

CREATE TABLE produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabinet_id UUID REFERENCES cabinets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category produit_category NOT NULL,
  partner_name TEXT,
  commission_rate_owner DECIMAL(5,2),
  commission_split_to_cabinet DECIMAL(5,2),
  recurring_management_fee DECIMAL(5,3),
  min_ticket DECIMAL(15,2),
  max_ticket DECIMAL(15,2),
  target_profile JSONB DEFAULT '[]'::jsonb,
  status produit_status NOT NULL DEFAULT 'active',
  documents_required JSONB DEFAULT '[]'::jsonb,
  total_aum_cached DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_produits_tenant ON produits(tenant_id);
CREATE INDEX idx_produits_category ON produits(category);

CREATE TABLE souscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabinet_id UUID NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subscriber_person_id UUID NOT NULL REFERENCES personnes(id) ON DELETE RESTRICT,
  produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
  engineer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_initial DECIMAL(15,2) NOT NULL,
  amount_recurring_monthly DECIMAL(15,2) DEFAULT 0,
  total_aum_current DECIMAL(15,2) DEFAULT 0,
  contract_number_partner TEXT,
  subscription_date DATE,
  status souscription_status NOT NULL DEFAULT 'pending_signature',
  yousign_envelope_id TEXT,
  payment_method payment_method,
  qonto_transaction_id TEXT,
  closure_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_souscriptions_dossier ON souscriptions(dossier_id);
CREATE INDEX idx_souscriptions_client ON souscriptions(client_id);
CREATE INDEX idx_souscriptions_status ON souscriptions(status);

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  souscription_id UUID NOT NULL REFERENCES souscriptions(id) ON DELETE CASCADE,
  commission_type commission_type NOT NULL,
  recipient_type commission_recipient NOT NULL,
  recipient_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  recipient_cabinet_id UUID REFERENCES cabinets(id) ON DELETE SET NULL,
  recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount_eur DECIMAL(15,2) NOT NULL,
  rate_applied DECIMAL(5,3),
  base_amount DECIMAL(15,2),
  due_date DATE,
  paid_date DATE,
  status commission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_commissions_souscription ON commissions(souscription_id);
CREATE INDEX idx_commissions_status ON commissions(status);

CREATE TABLE rdv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabinet_id UUID NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type rdv_type NOT NULL,
  format rdv_format NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  actual_started_at TIMESTAMPTZ,
  actual_ended_at TIMESTAMPTZ,
  status rdv_status NOT NULL DEFAULT 'scheduled',
  video_room_url TEXT,
  recording_url TEXT,
  transcript_text TEXT,
  ai_summary TEXT,
  ai_action_items JSONB DEFAULT '[]'::jsonb,
  attendees JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_rdv_dossier ON rdv(dossier_id);
CREATE INDEX idx_rdv_engineer ON rdv(engineer_id);
CREATE INDEX idx_rdv_scheduled ON rdv(scheduled_at);

ALTER TABLE etudes ADD CONSTRAINT etudes_restitution_rdv_fkey
  FOREIGN KEY (restitution_meeting_id) REFERENCES rdv(id) ON DELETE SET NULL;

-- =========================================================================
-- 4. SUPPORT TABLES
-- =========================================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabinet_id UUID NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  category document_category NOT NULL,
  document_type document_type NOT NULL,
  filename TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  storage_url TEXT NOT NULL,
  uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status document_status NOT NULL DEFAULT 'pending_validation',
  ocr_extracted_data JSONB,
  yousign_envelope_id TEXT,
  signed_at TIMESTAMPTZ,
  yousign_certificate_url TEXT,
  linked_dci_question_ids TEXT[] DEFAULT '{}',
  expires_at DATE,
  visibility document_visibility NOT NULL DEFAULT 'private_pro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_documents_dossier ON documents(dossier_id);
CREATE INDEX idx_documents_category ON documents(category);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type conversation_type NOT NULL,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  title TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count_per_user JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_conversations_dossier ON conversations(dossier_id);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content_text TEXT,
  content_type message_content_type NOT NULL DEFAULT 'text',
  attachments JSONB DEFAULT '[]'::jsonb,
  parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  read_by JSONB DEFAULT '{}'::jsonb,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_user_id);

CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cabinet_id UUID REFERENCES cabinets(id) ON DELETE SET NULL,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE,
  event_type timeline_event_type NOT NULL,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_type timeline_actor_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  visibility timeline_visibility NOT NULL DEFAULT 'internal_only',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_timeline_dossier ON timeline_events(dossier_id);
CREATE INDEX idx_timeline_event_type ON timeline_events(event_type);
CREATE INDEX idx_timeline_created ON timeline_events(created_at DESC);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link_url TEXT,
  channels_sent JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  priority notification_priority NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id, read_at);

-- =========================================================================
-- 5. PERMISSIONS (RBAC)
-- =========================================================================

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = rôle standard
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Permissions de base (catalogue)
INSERT INTO permissions (code, description, category) VALUES
  ('dossier:read_own', 'Lire ses propres dossiers', 'dossier'),
  ('dossier:read_cabinet', 'Lire tous les dossiers du cabinet', 'dossier'),
  ('dossier:read_all_network', 'Lire tous les dossiers du réseau', 'dossier'),
  ('dossier:write', 'Modifier un dossier', 'dossier'),
  ('dossier:reassign', 'Réassigner un dossier', 'dossier'),
  ('user:impersonate', 'Connexion en tant que', 'user'),
  ('commission:read_all', 'Voir toutes les commissions', 'commission'),
  ('compliance:validate', 'Valider la conformité', 'compliance'),
  ('module_ia:run', 'Lancer le module IA', 'ia'),
  ('product:create', 'Créer un produit', 'product');

-- =========================================================================
-- 6. TRIGGERS updated_at
-- =========================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'updated_at'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      t
    );
  END LOOP;
END$$;

-- =========================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- Helper function: récupère le tenant_id de l'utilisateur connecté (via auth.uid())
CREATE OR REPLACE FUNCTION current_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_cabinet_id()
RETURNS UUID AS $$
  SELECT cabinet_id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Active RLS sur toutes les tables avec tenant_id
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dci_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE etudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE etude_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE souscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdv ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy générique : isolement par tenant_id
-- Le rôle 'editor' (Astraeos super admin) voit tout
CREATE POLICY tenant_isolation ON tenants
  FOR SELECT
  USING (id = current_user_tenant_id() OR current_user_role() = 'editor');

-- Pour les autres tables avec tenant_id : visibilité = même tenant ou editor
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
      AND table_name NOT IN ('tenants') -- déjà fait
  LOOP
    EXECUTE format(
      'CREATE POLICY tenant_isolation_select ON %I FOR SELECT USING (tenant_id = current_user_tenant_id() OR current_user_role() = ''editor'')',
      t
    );
  END LOOP;
END$$;

-- Restriction supplémentaire : les engineers voient leurs dossiers + ceux du cabinet (à raffiner)
CREATE POLICY engineer_dossier_scope ON dossiers
  FOR SELECT
  USING (
    current_user_role() IN ('brand_owner', 'editor', 'cabinet_director', 'compliance')
    OR engineer_id = current_user_id()
    OR (current_user_role() = 'engineer' AND cabinet_id = current_user_cabinet_id())
  );

-- Les clients ne voient QUE leur dossier
CREATE POLICY client_dossier_scope ON dossiers
  FOR SELECT
  USING (
    current_user_role() = 'client' AND client_id IN (
      SELECT client_id FROM personnes WHERE user_id = current_user_id()
    )
  );

-- =========================================================================
-- FIN DE LA MIGRATION
-- =========================================================================
