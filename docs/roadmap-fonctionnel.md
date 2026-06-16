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
- [ ] C1. Accueil cabinet (dashboard)
- [ ] C2. Finance (compte de résultat, trésorerie, activité) — brancher Qonto + commissions
- [ ] C3. Ingénieurs / performance / recrutement / gestion comptes
- [ ] C4. Assets cabinet (overview, financier, assurance, immobilier, honoraires)
- [ ] C5. Partenaires & apporteurs
- [ ] C6. Outils (catalogue produits, simulateurs, marketing)
- [ ] C7. Référentiel (process, documentation conformité)
- [ ] C8. Paramétrages (identité, banque, intégrations, conformité, templates)
- [ ] C9. Licenciés / cabinets (réseau)

## 🔜 Bloc D : visio — compléter
- [ ] D1. Compte-rendu enrichi (synthèse patrimoniale IA de fin d'entretien)
- [ ] D2. Onglet Notes (persistance)

## 🔜 Bloc E : fondations transverses
- [ ] E1. Appliquer la migration `conformite_items` en prod (sinon statuts KYC ne persistent pas)
- [ ] E2. Auth réelle (remplacer le stub `requireAuth` par une vraie vérif session/cookie)
- [ ] E3. Multi-tenant réel (retirer les DEFAULT_TENANT/CABINET/ENGINEER hardcodés)
