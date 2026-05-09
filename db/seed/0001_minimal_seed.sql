-- Seed minimal pour permettre la création de clients via le wizard
-- À appliquer après 0001_initial_schema.sql

-- Tenant ASTRAEOS (éditeur)
INSERT INTO tenants (id, tenant_type, name, slug, subscription_plan, subscription_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'editeur',
  'ASTRAEOS',
  'astraeos',
  'editeur',
  'active'
) ON CONFLICT (slug) DO NOTHING;

-- Tenant PRIVEOS Capital (marque) — pour les premiers clients de test
INSERT INTO tenants (id, tenant_type, name, slug, subscription_plan, subscription_status, brand_color_primary, brand_color_accent)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'marque',
  'PRIVEOS Capital',
  'priveos-capital',
  'marque',
  'active',
  '#102D50',
  '#C68E0E'
) ON CONFLICT (slug) DO NOTHING;

-- Cabinet de démarrage (Cabinet Paris Étoile dans PRIVEOS)
INSERT INTO cabinets (id, tenant_id, name, address_city, address_zipcode, region, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000100',
  '00000000-0000-0000-0000-000000000010',
  'Cabinet Paris Étoile',
  'Paris',
  '75008',
  'idf',
  true
) ON CONFLICT (id) DO NOTHING;

-- Ingénieur de démarrage (Sarah KAUFMANN — la persona du Topbar)
-- auth_user_id sera lié quand l'auth sera branchée. Pour l'instant on utilise un placeholder.
INSERT INTO users (id, tenant_id, cabinet_id, role, first_name, last_name, email, is_active)
VALUES (
  '00000000-0000-0000-0000-000000001000',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000100',
  'engineer',
  'Sarah',
  'KAUFMANN',
  's.kaufmann@astraeos.fr',
  true
) ON CONFLICT (email) DO NOTHING;
