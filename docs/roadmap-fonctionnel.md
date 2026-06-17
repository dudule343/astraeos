# Roadmap fonctionnelle Astraeos — « tout doit fonctionner »

Ordre d'exécution. Chaque item = coder + brancher + tester + déployer + cocher.
Vérif globale : `bash scripts/verify-app.sh`.

## ✅ Déjà fait (fonctionnel, déployé, testé)
- [x] Domaines : vitrine `astraeos.fr` + `app.astraeos.fr` + 4 sous-domaines d'espace (SSL)
- [x] Homepage marketing
- [x] Parcours dossier fidèle v40 : pipeline · fiche dossier (timeline 6 jalons) · conformité · collecte conditionnelle · études
- [x] Création client `/client-new` (crée client+personne+dossier)
- [x] Cockpit visio : transcription Deepgram + DCI réel + conseils IA (testés) + persistance
- [x] BYOK `/integrations` : clés Anthropic + Deepgram par cabinet
- [x] Script de vérification routes `scripts/verify-app.sh` (47 OK, 0 cassée)

## ✅ Bloc A : boutons morts — FAIT
- [x] A1. Audit onclick non définis (ingenieur/dirigeant/marque/client.html) → vérifié par script
- [x] A2. Résultat : 0 bouton mort (121+18+19+3 fonctions, toutes définies). Le seul cas (astraeosCreerEspaceClient) avait été corrigé.

## 🔜 Bloc B : écrans ingénieur secondaires (vraies pages React)
- [x] B1. Fiche client `/clients/[id]` — lecture clients/personnes/dossiers + liste cliquable ✅
- [x] B2. Prospects `/prospects` — liste des DCI soumis (dci-inbox) + lancer visio ✅
- [x] B3. Agenda `/agenda` — Google Calendar (statut + events + connexion) ✅
- [ ] B4. Outils de production / catalogue / simulateurs
- [x] B5. Profil `/profil` — identité + agréments (table users) ✅

## 🔜 Bloc C : espace dirigeant (~19 écrans)
- [x] C1. Accueil cabinet `/espace-dirigeant` — revenus + santé cabinet (données réelles) ✅
- [x] C2. Finance dirigeant — résultat + commissions (souscriptions/commissions) ✅
- [x] C3. Gestion ingénieurs — classement + KPIs (users + dossiers) ✅
- [x] C3bis. Performance — CA généré + études livrées + funnel pipeline (données réelles) ✅
- [x] C4. Encours & assets — AUM par classe d'actifs + par produit (souscriptions) ✅
- [x] C5. Partenaires & apporteurs — volume par producteur (produits.partner_name) ✅
- [ ] C6. Outils (catalogue produits, simulateurs, marketing)
- [ ] C7. Référentiel (process, documentation conformité)
- [x] C8. Paramétrages — coordonnées + ORIAS/RC Pro + répartition commissions + accès users ✅
- [ ] C9. Licenciés / cabinets (réseau)

## ✅ Bloc D : visio — compléter
- [x] D1. Compte-rendu enrichi — POST /api/entretiens/[id]/compte-rendu, synthèse Markdown IA (DCI+transcript+notes+conseils), modale + Copier, persistée dans rapport.synthese_ia ✅
- [x] D2. Onglet Notes — saisie + persistance (entretiens.notes jsonb) + réhydratation à la reprise ✅

## 🔜 Bloc E : fondations transverses
- [x] E1. Migration `conformite_items` appliquée en prod (via MCP Supabase) — persistance KYC vérifiée ✅
- [x] E2+E3. **Fondation multi-tenant construite et déployée derrière le flag `ASTRAEOS_AUTH_ENFORCE`** (off) ✅
  - Auth magic-link (login + callback + `getSessionContext`), gate `proxy.ts`
  - 7 hardcodes → contexte session ; RLS appliquée en prod (18 tables, role-aware)
  - **Go-live restant** (flip du flag) : (1) config Supabase Auth e-mail + SMTP Resend, (2) provisionner les comptes auth des users, (3) tester connexion, (4) `ASTRAEOS_AUTH_ENFORCE=1`
- [x] Fraîcheur : `revalidatePath` sur les mutations (bug « il faut rafraîchir » corrigé) ✅
- [x] Agenda : erreur Google actionnable + RDV fictifs supprimés — **reste : activer l'API Calendar dans Google Cloud** ✅
