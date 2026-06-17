# Fondation multi-tenant + auth — plan d'exécution

Objectif : rendre Astraeos commercialisable à **plusieurs cabinets**, avec
isolation des données garantie par la base (RLS), connexion par **lien magique**,
et onboarding **par invitation**. Décisions actées le 2026-06-17.

## Principe

Aujourd'hui : tout passe par `createAdminClient()` (clé `service_role` qui
**bypasse RLS**) + 3 IDs hardcodés (`DEFAULT_TENANT/CABINET/ENGINEER`). Un seul
cabinet, aucune isolation. 7 fichiers concernés.

Cible : chaque requête utilisateur passe par un client **scopé à la session**
(JWT Supabase Auth) → Postgres applique les policies RLS → un cabinet ne voit
jamais les données d'un autre, **même en cas de bug applicatif**. `service_role`
réservé aux tâches légitimes (provisioning d'un cabinet, webhooks).

## Modèle d'identité

- `auth.users` (géré par Supabase Auth) = identité / connexion.
- `public.users` = profil métier, lié par `auth_user_id`. Porte `tenant_id`,
  `cabinet_id`, `role` (director | engineer | …). **La colonne existe déjà.**
- Connexion (magic link) → JWT porte `auth.uid()` → on retrouve la ligne
  `public.users` → tenant + cabinet + rôle du requêteur.

## Architecture RLS

Fonctions SQL `SECURITY DEFINER` (stables) qui lisent le contexte du requêteur :

```sql
current_tenant_id()  -> users.tenant_id  WHERE auth_user_id = auth.uid()
current_cabinet_id() -> users.cabinet_id WHERE auth_user_id = auth.uid()
current_user_role()  -> users.role       WHERE auth_user_id = auth.uid()
```

Policies type :
- Tables tenant-scoped : `USING (tenant_id = current_tenant_id())`.
- Tables cabinet-scoped : `+ cabinet_id = current_cabinet_id()`.
- Dossiers : un dirigeant voit tout son cabinet ; un ingénieur voit ses dossiers
  (`engineer_id = current_user_id()`) — policy role-aware.

## Côté application

- Nouveau helper `getSessionContext()` (`src/lib/auth/context.ts`) :
  lit le client SSR (`@supabase/ssr`, déjà installé) → `auth.getUser()` →
  ligne `public.users`. Renvoie `{ userId, authUserId, tenantId, cabinetId, role }`
  ou `null` si non connecté.
- Les 7 fichiers à `DEFAULT_*` lisent désormais `getSessionContext()`.
- Les lectures/écritures user-facing passent du client `service_role` au
  **client serveur scopé session** (RLS appliqué).

## Phases (chacune : coder → typecheck/lint/build → tester → déployer → cocher)

### Phase A — Mur d'auth (login fonctionnel, espaces protégés)
- A1. Vérifier/compléter les clients SSR (`server.ts`, `client.ts`).
- A2. Page `/login` : saisie e-mail → `supabase.auth.signInWithOtp({ email })`.
- A3. Route `/auth/callback` : échange du code → session cookie → redirige vers
      l'espace selon le rôle.
- A4. `getSessionContext()`.
- A5. `proxy.ts` : redirige les routes protégées vers `/login` si pas de session.
      Restent publics : vitrine, `/depot/[token]` (liens client), `/login`,
      `/auth/*`, et les API publiques par token.

### Phase B — Contexte tenant remplace les hardcodes
- B1. Remplacer `DEFAULT_TENANT/CABINET/ENGINEER` par `getSessionContext()` dans
      les 7 fichiers.
- B2. Basculer les accès user-facing de `createAdminClient()` au client session.

### Phase C — Policies RLS (isolation par la base)
- C1. Migration : fonctions `current_tenant_id/cabinet_id/user_role`.
- C2. Migration : policies RLS par table (tenant-scoped ; dossiers role-aware).
- C3. Test d'isolation : 2 cabinets de test ne se voient pas.

### Phase D — Provisioning & invitations
- D1. Provisionner un cabinet (tenant + cabinet + dirigeant) + envoi du lien.
- D2. Le dirigeant invite ses ingénieurs (crée `public.users` + lien magique).

## Prérequis côté Supabase (à faire dans le dashboard, ou je te guide)

1. **Activer Email auth + magic link** (Authentication → Providers → Email,
   "Confirm email" / OTP).
2. **Redirect URLs** : ajouter `https://app.astraeos.fr/auth/callback`
   (+ localhost pour le dev).
3. **SMTP custom = Resend** (Authentication → Emails → SMTP) pour que les liens
   partent réellement et ne soient pas rate-limités. (Resend est déjà le choix
   e-mail du projet.)

## Risques / points de vigilance

- **Les espaces deviennent fermés** : c'est voulu (commercialisation), mais je
  provisionne d'abord **ton** compte (lien `auth.users` ↔ le dirigeant du seed)
  pour que tu ne sois jamais bloqué.
- **App en prod** : je déploie les briques d'auth AVANT de fermer le mur, et je
  teste la connexion de bout en bout avant de couper l'accès libre.
- **E-mail** : sans SMTP configuré, les liens magiques ne partent pas → étape 3
  des prérequis est bloquante pour tester le login réel.
- **Données existantes** : le tenant/cabinet du seed restent accessibles une fois
  le dirigeant lié à un compte auth.
