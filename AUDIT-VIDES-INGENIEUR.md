# Audit des vides — Espace ingénieur Astraeos + Visio

Diagnostic en lecture seule de `src/app/(ingenieur)`, `public/wireframes/visio.html` et des routes `src/app/api` qu'ils appellent. On cherche les sections affichées mais vides, les boutons sans effet, les pipelines branchés à moitié, les données factices présentées comme réelles.

Légende gravité : **BLOQUANT** (écran/route entière factice, persistance perdue, ou la fonctionnalité promise ne produit rien) · **MAJEUR** (pipeline branché à moitié, données factices trompeuses sur un écran réel) · **MINEUR** (incohérence de chiffres, libellé décoratif, repli démo assumé).

---

## EN TÊTE — Les 2 sujets de Marvin

### Sujet 1 — Insights IA en direct après la transcription (VISIO)

**Symptôme observé** : pendant l'entretien, la transcription défile mais le panneau « Insights IA » (`#pane-insights`) et « Repères juridiques » (`#legal-live-list`) restent vides. Aucun conseil ni article ne s'affiche.

**Diagnostic (vérifié dans le code)** : le pipeline client est entièrement câblé et fonctionne. `pushFinalText` (visio.html:3988) alimente `finalBuffer`, `maybeSendConseils` (l.4787) `fetch('/api/visio/conseils')` (l.4818), `injectConseil`/`injectArticle` (l.4709/4767) écrivent dans les bons conteneurs DOM (qui existent l.1187/1284). **La rupture est SERVEUR**, à l'étape 2 de la route conseils :

`src/app/api/visio/conseils/route.ts:216-241` lit la clé Anthropic via `process.env.ANTHROPIC_API_KEY` **en priorité** (l.220-223), sinon via la table Supabase `ia_settings` pour le cabinet courant (l.227-234). **Confirmé en lecture** : `.env.local` ne contient PAS `ANTHROPIC_API_KEY` (clés présentes : SUPABASE, GOOGLE, RESEND, HOSTINGER, ASTRAEOS_*, RDV_NOTIFY_EMAIL uniquement). En dev, l'auth est en mode legacy → la route tombe sur `ia_settings` pour le cabinet par défaut `00000000-0000-0000-0000-000000000100` ; sans ligne `api_key`, elle renvoie **409 « IA non connectée »** (l.234). Le client intercepte le 409 (l.4823) et affiche `injectIaDisconnectedCard()` : une carte grise au lieu des insights.

**Asymétrie qui trompe** : la transcription, elle, a un repli. Sur 409 de `stt-token` (l.4172), `startDeepgram` bascule silencieusement sur WebSpeech navigateur (sans clé serveur, l.4046/4179). C'est pourquoi « la transcription marche sans clé » alors que les conseils, sans aucun fallback, restent muets.

**Plan de correction** :
1. **Quick win / dev** : ajouter `ANTHROPIC_API_KEY=sk-ant-...` (et éventuellement `ANTHROPIC_MODEL`) dans `.env.local`, puis relancer `next dev`. La route la prend en priorité (l.220-223), plus de 409. → débloque aussi `dci-extract` (auto-remplissage DCI) qui lit la même clé.
2. **Prod / multi-cabinet** : enregistrer la clé via l'écran Intégrations éditeur (`src/app/(editeur)/integrations/KeyManager.tsx` → POST `/api/ia-settings`), qui upsert `ia_settings { provider:'anthropic', api_key, model }` scopé au cabinet. En legacy, ce doit être le cabinet `00000000-0000-0000-0000-000000000100`, sinon la route ne la trouve pas.
3. **Vérif read-only avant de conclure** (MCP Supabase) : `SELECT cabinet_id, model, (api_key IS NOT NULL) FROM ia_settings;` pour confirmer l'absence de ligne sur le cabinet par défaut.
4. **Mineur** : corriger le libellé de la carte « IA non connectée » (visio.html:4688) qui renvoie vers l'« Espace Ingénieur (étape 03 · ⚙) » alors que la clé se règle dans l'espace **éditeur** Intégrations. Pointer vers le bon écran transforme un faux « rien ne marche » en action claire.

> Note parité : le Cockpit React (`src/app/visio/[room]/_cockpit/`, servi seulement via `?ui=react`) n'a AUCUNE pompe d'insights. Le chemin par défaut (`/visio/[room]/page.tsx:111`) sert bien l'iframe `visio.html` — c'est lui que Marvin teste, donc le coupable reste le 409. Ne pas basculer sur `?ui=react` en croyant que c'est à parité.

### Sujet 2 — Édition du DCI en LIVE pendant l'entretien (VISIO)

**Symptôme observé** : les champs DCI sont bien éditables à l'écran pendant la visio, la pastille affiche « Enregistré · », mais au rechargement / à la clôture les éditions ne reviennent pas.

**Diagnostic (vérifié dans le code)** : le panneau `.dci-live` est réellement éditable et câblé. Chaque mutation (`confirmEditField`, `validateField`, `rejectField`, `addItem`/`removeItem`) mute `DCI_DATA` puis déclenche un PATCH débouncé 2 s `/api/entretiens/[id] { dci_snapshot }` (visio.html:5212/5218). La route PATCH valide (`validateDciCanonical`), borne à 256 Ko, scope le tenant et appelle `mergeEntretien` → `mergeSupabase` (`src/lib/entretiens-store.ts:392-411`), qui appelle **`supabase.rpc('append_entretien', ...)`** (l.397).

**LE VIDE CENTRAL** : la fonction Postgres `append_entretien` **n'existe dans AUCUNE migration**. Confirmé : `grep` exhaustif sur `supabase/migrations/*.sql` → 0 définition (la migration `20260604_entretiens.sql` crée la table avec colonne `dci_snapshot` mais aucune fonction). En prod Supabase configuré, `rpc('append_entretien')` renvoie « function does not exist » → throw. `mergeEntretien` attrape l'erreur (l.357) et bascule sur `mergeFile` qui écrit `process.cwd()/.data/entretiens-store.json` (l.413-419). Sur Vercel serverless ce FS est éphémère → la sauvegarde est silencieusement perdue entre invocations. **Mais** `mergeFile` réussit dans l'invocation courante → le PATCH renvoie `ok:true` → la pastille affiche « Enregistré » : **faux positif**. Au resume, POST `/api/entretiens` relit depuis Supabase (jamais écrit par la RPC) ou un fichier disparu → les éditions ne reviennent pas.

C'est le profil exact « pipeline branché à moitié » : tout le front + la route existent, seul le dernier maillon base (la RPC) manque. Et la RPC ne concerne pas que le DCI : elle persiste AUSSI transcript, conseils, articles, notes.

**Plan de correction** :
1. **Quick win bloquant** : créer la migration SQL définissant `public.append_entretien(p_id uuid, p_transcript jsonb, p_conseils jsonb, p_articles jsonb, p_notes jsonb, p_dci jsonb, p_transcript_cap int, p_conseils_cap int, p_articles_cap int, p_notes_cap int) RETURNS boolean`. Le code attend EXACTEMENT cette signature (`entretiens-store.ts:397-408`). Un seul UPDATE atomique : `jsonb '||'` borné en queue pour les arrays, `set dci_snapshot = p_dci` quand non NULL. Alternative : supprimer la branche RPC et faire un read-modify-write côté Supabase.
2. Vérifier que `dci_snapshot` relit bien depuis Supabase au resume (`applySnapshotAndRerender`).
3. **Majeur** : brancher la clé IA (cf. sujet 1) pour activer l'auto-remplissage DCI via `/api/visio/dci-extract` (sinon 409 silencieux, visio.html:4966 `.catch` muet → aucune proposition IA, chips « IA à valider » à 0).
4. **Mineur** : ajouter un signal UI quand `dci-extract` renvoie 409 (aujourd'hui muet) pour distinguer « IA inactive » de « IA n'a rien trouvé ».

> Vérif read-only recommandée avant correctif : confirmer en base réelle (MCP Supabase) l'absence de la fonction `append_entretien` — le code applicatif ne la crée jamais, mais le déduire d'un grep mérite confirmation. Modes « impromptu » (DCI vierge sans `?nom=`) et « DCI masqué côté client » (visio.html:3674) sont des choix de design, pas des vides.

---

## ZONE A — Visio · insights IA (détail)

| # | Lieu | Ce qui est vide | Pourquoi | Gravité | Ce qu'il faut |
|---|------|-----------------|----------|---------|---------------|
| A1 | `api/visio/conseils/route.ts:216-241` + `.env.local` | Insights IA + Repères juridiques restent vides en live | Clé Anthropic absente de l'env serveur ET (vraisemblablement) pas de ligne `ia_settings.api_key` pour le cabinet par défaut → 409 | **BLOQUANT** | Poser `ANTHROPIC_API_KEY` dans `.env.local` (dev) ou enregistrer la clé cabinet via `/api/ia-settings` (prod) |
| A2 | `visio.html:4688` (carte « IA non connectée ») | Le message d'aide pointe vers l'espace Ingénieur alors que la clé se règle dans l'espace Éditeur | Libellé erroné | MINEUR | Corriger le libellé / lien vers Intégrations éditeur |
| A3 | `visio/[room]/_cockpit/` (Cockpit React, `?ui=react`) | Aucun insight : ni capture transcript, ni appel conseils, ni rendu | Migration React partielle (gère seulement DCI + entretiens) | MAJEUR | Ne pas utiliser `?ui=react` tant que la parité n'est pas faite, ou porter la pompe d'insights du wireframe |

## ZONE B — Visio · édition DCI live (détail)

| # | Lieu | Ce qui est vide | Pourquoi | Gravité | Ce qu'il faut |
|---|------|-----------------|----------|---------|---------------|
| B1 | `lib/entretiens-store.ts:397` (`rpc append_entretien`) | Persistance des éditions DCI (et transcript/conseils/notes) | RPC `append_entretien` définie dans aucune migration → throw → fallback fichier éphémère, mais PATCH renvoie `ok:true` (faux « Enregistré ») | **BLOQUANT** | Créer la migration `append_entretien` (signature exacte) |
| B2 | `visio.html:4958` → `api/visio/dci-extract/route.ts:129-135` | Auto-remplissage IA du DCI (propositions « IA à valider ») | Clé IA requise → 409 ; échec client silencieux (`.catch` vide) | MAJEUR | Brancher la clé IA + signal UI sur 409 |
| B3 | `visio.html:2916-2954` (mode impromptu) | DCI initial vide (coquille 22 sections « À renseigner ») | Pas de prospect ni snapshot → choix assumé | MINEUR | Comportement voulu ; corriger surtout B1 pour que la saisie survive |
| B4 | `visio.html:3674-3677` (DCI masqué `client-view`) | DCI jamais affiché au client | Choix de conception (outil interne) | MINEUR | Rien sauf demande explicite (canal Realtime + rendu read-only) |

## ZONE C — Mon activité (tableau de bord, agenda, activité commerciale)

| # | Lieu | Ce qui est vide | Pourquoi | Gravité | Ce qu'il faut |
|---|------|-----------------|----------|---------|---------------|
| C1 | `espace-ingenieur/page.tsx` + `_data/tableau-de-bord.ts:99-306` | TOUT le tableau de bord d'accueil (5 KPIs, 4 études, 4 alertes, 3 RDV, 4 barres santé) | `getCockpit()` = constantes en dur, aucun Supabase | MAJEUR | Brancher `getCockpit()` async sur Supabase, scoper par tenant |
| C2 | `activite/page.tsx` + `_data/activite.ts:93-267` | TOUT l'écran activité commerciale (KPIs, délais, actions, sources, RDV) | `getActiviteScreen()` = constante `SCREEN` en dur (malgré `force-dynamic`) | MAJEUR | Calculer KPIs/délais/sources depuis `rdv`, dossiers, conformité ; scoper tenant |
| C3 | `agenda/WeekCalendar.tsx:200-244` + `_data/agenda.ts:97-253` | La grille dit « synchronisé Google Agenda » mais n'affiche jamais les vrais événements Google | `/api/calendar/events` existe (utilisé côté éditeur) mais l'agenda ingénieur ne l'appelle JAMAIS ; lit `RDVS` mock + online booking | MAJEUR | Appeler `/api/calendar/events?days=7` et fusionner par date, ou retirer la mention trompeuse |
| C4 | `_data/agenda.ts:361-376` + `page.tsx:55-88` | 4 KPIs agenda + lien public `priveos.com/rdv/luc-thilliez` en dur | `getAgenda()` ne calcule que `realRdvs` ; compteurs et slug = littéraux | MAJEUR | Calculer compteurs depuis `rdv` ; générer le slug depuis l'ingénieur de session (`engineerSlugFromContext`) |
| C5 | `agenda/types/actions.ts:36-124` | Config des types de RDV ne persiste rien (`persisted:false`, « table à brancher ») | Table `rdv_types` inexistante ; `resolveScope()` fait un SELECT bidon mais n'écrit jamais | MAJEUR | Créer table `rdv_types` + disponibilités, implémenter insert/update/upsert |
| C6 | `agenda/[id]/page.tsx` + `_data/fiche-rdv.ts` | Fiche RDV factice : 2 slugs réels (mercier, joubert), modèle Mercier pour tout slug inconnu | Réplique maquette, aucun chargement Supabase | MAJEUR | Charger depuis `rdv` + `dci_submissions` du prospect |
| C7 | `espace-ingenieur/page.tsx:171/230-291` | Bouton hero OK mais badge « 4 alertes » et alertes non cliquables | `AlerteRow` = markup statique, alertes en dur | MINEUR | Rendre chaque alerte cliquable vers son écran de résolution |
| C8 | `EtudesPrioritairesTable.tsx:93-97` | Boutons Préparer/Reprendre/Continuer/Relancer sans `onClick` propre | Fidèle maquette (clic-ligne navigue) ; libellés décoratifs | MINEUR | Câbler chaque libellé sur une vraie action + `stopPropagation`, ou assumer comme liens |
| C9 | `activite/page.tsx:177-188` + `agenda/page.tsx:177-205` | Boutons « Relancer » et carte « Mes types de RDV proposés » en dur | Liens de navigation, pas de handler ; 4 `RdvTypeRow` littérales | MINEUR | Server action de relance (Resend) ; lire les types depuis la table `rdv_types` |
| C10 | `visio.html` (replis démo) | Avatars/DCI démo sans `?room`/`?nom` | Fallbacks intentionnels | MINEUR | Vérifier que la prod passe toujours room+prospect+nom |

## ZONE D — Clients & parcours (clients, fiche client, prospects, conformité, collectes)

| # | Lieu | Ce qui est vide | Pourquoi | Gravité | Ce qu'il faut |
|---|------|-----------------|----------|---------|---------------|
| D1 | `prospects/[id]/page.tsx:155` + `_data/fiche-prospect.ts:218` | TOUTE fiche prospect affiche « Jean & Martine AUBERT » quel que soit le slug | `getFicheProspect(slug)` 100 % synchrone, 0 accès Supabase, modèle unique | **BLOQUANT** | Créer `fiche-prospect-server.ts` (lit `dci_submissions`/clients stage 01 par slug, scope tenant) |
| D2 | `conformite/page.tsx` + `_data/conformite.ts` | TOUT l'écran « Conformité en cours » factice (stepper, KPIs, 7 lignes, statuts DER/KYC/LM, Qonto) | `conformite.ts` 0 accès Supabase, constantes statiques | **BLOQUANT** | Créer `conformite-server.ts` (dossiers stage 02, scope tenant) |
| D3 | `conformite/[id]/page.tsx:31-34` + `_data/fiche-conformite.ts` | La fiche conformité ignore l'`id`, affiche toujours « Camille JOUBERT » | `await params` puis id jeté, constantes statiques, 0 Supabase | **BLOQUANT** | Créer `fiche-conformite-server.ts` (charge par id, scope tenant) |
| D4 | `collectes/page.tsx` + `_data/collectes.ts` | TOUT l'écran collecte statique (stepper, 4 KPIs, 11 lignes, barres) | 0 accès Supabase alors qu'un backend réel existe (`/api/collecte-admin/list`) | **BLOQUANT** | Brancher sur `/api/collecte-admin` (dossiers stage 03, docs réels) |
| D5 | `clients/[id]/page.tsx:110-221` + `_data/fiche-client-server.ts:210-227` | Sur un VRAI client : Historique / Documents signés / Historique RDV affichent toujours DUPONT-TOPIN | `getFicheClient()` branche personnes + régime mais n'écrase PAS historique/documents/rdvs (`...FICHE_CLIENT_MODELE`) | MAJEUR (le plus trompeur : nom réel + accompagnement faux) | Dériver historique/docs/rdvs des vraies tables, ou masquer les cartes si vides |
| D6 | `FicheProspectInteractive.tsx:216-273` (NotesCard) | « Enregistrer » la note prospect ne persiste rien | Handler = `setValue` state React local, aucun fetch/Server Action | MAJEUR | Server Action `saveProspectNote` (table `dossier_events`/colonne notes) |
| D7 | `FicheProspectInteractive.tsx:279-294` (SupprimerButton) | « Supprimer » ne supprime rien | Après `confirm()`, simple `router.push` | MAJEUR | Server Action d'archivage (soft-delete, jamais hard delete) |
| D8 | `prospects/[id]/page.tsx:335-337` | Bouton « Faire avancer en étape 02 » toujours désactivé | `disabled` en dur, fiche modèle statique → conditions jamais OK | MAJEUR | Calculer conditions depuis la base + Server Action de promotion (`pipeline_stage`) |
| D9 | `prospects/page.tsx:126,141` + `_data/prospects.ts:274-288` | KPIs prospects (convertis, docs X/24 79 %, délai 8 j) mock ; « +5 »/« 79 % » en dur dans le JSX | `fetchProspectsView` ne recalcule que `kpis.actifs` | MAJEUR | Dériver les 3 KPIs depuis la base, retirer les littéraux du JSX |
| D10 | `ProspectsTable.tsx:365-383` | « Voir l'intégralité du pipeline (187) » n'affiche pas les prospects | `setShowAll(true)` + toast « pas encore disponible » ; counts maquette | MAJEUR | Vraie pagination serveur, counts réels |
| D11 | `conformite/ConformiteInteractive.tsx:22-26,145-162` | Drill-down liste→fiche ne marche que pour `joubert` (autres œils désactivés) | `FICHE_REFERENCE_ID='joubert'`, fiche unique | MAJEUR | Paramétrer la fiche par dossier, activer toutes les lignes |
| D12 | `conformite/[id]/FicheConformiteInteractive.tsx:260-265,438-441` | « Envoyer (DER) », « Envoyer le pack », « Ouvrir l'espace sécurisé (03) » désactivés | `disabled` en dur (« Yousign en cours d'intégration »), pas de clé | MAJEUR | Intégrer Yousign + calculer conditions + promotion stage 03 |
| D13 | `collectes/ProgressCell.tsx` + `page.tsx:294-308` | « cliquez pour voir docs » et « Relancer le client » ne montrent rien / ne relancent rien | Les deux font `router.push` vers `/clients/[id]` | MAJEUR | Drawer listant les docs réels ; Server Action de relance (email + trace) |
| D14 | `clients/page.tsx:44-101` + `_data/clients-server.ts:154-183` | KPIs clients : comparatifs M-1 / N-1 toujours « — » en réel | `buildScreen()` renvoie `compare:[…'—']` en dur, aucun historique | MINEUR | Calculer M-1/N-1 (snapshot mensuel / agrégation) |
| D15 | `_data/fiche-client.ts:327-333` (recordingHref) | « Télécharger l'enregistrement » pointe vers des salles factices inexistantes | `recordingHref` en dur dans le modèle | MINEUR | Brancher sur le vrai room/enregistrement, afficher seulement si existe |
| D16 | `prospects/actions.ts:10-15` (createProspect) | Action annoncée « tracée & horodatée » sans écrire dans `dossier_events` | Insert seulement dans `dci_submissions`, commentaire ment | MINEUR | Ajouter l'insert `dossier_events` ou corriger le commentaire |
| D17 | `_data/prospects.ts:54-60` (quickFilters) | Filtres « Nouveaux 24 / Dormants 17 / À relancer 42 » : counts en dur, la plupart ne filtrent rien | Counts du VIEW maquette ; `filterPredicate` ne gère que 2 facettes | MINEUR | Compteurs réels + prédicat par facette, ou retirer les facettes |
| D18 | `_data/collectes.ts:52-133` | Chiffres incohérents entre eux (filtre « Tous 24 » vs KPI « En collecte 5 », footnote non affichable) | Constantes décorrélées des 11 lignes | MINEUR | Calculer stepper/KPIs/footnote depuis les données réelles |

## ZONE E — Dossiers / Études / Assets / Outils

| # | Lieu | Ce qui est vide | Pourquoi | Gravité | Ce qu'il faut |
|---|------|-----------------|----------|---------|---------------|
| E1 | `_data/fiche-dossier.ts:245` (`getFicheDossier(_id)`) | La fiche dossier est la MÊME pour tous : chaque carte Kanban ouvre DUPONT-TOPIN (ETU-2026-014) | `_id` volontairement ignoré, fixture unique, 0 Supabase | MAJEUR (l'utilisateur atterrit sur un AUTRE client) | Brancher sur table `dossiers`/`souscriptions` avec repli, ou indexer plusieurs modèles par id |
| E2 | `clients-suivi/SuiviFilterableTable.tsx:117` + `_data/clients-suivi.ts` + `fiche-client-server.ts:234` | « Voir » d'une ligne suivi ouvre une fiche client erronée (ids `dubois`/`dupont-henri`/`groupe-lebon` introuvables) | Ids non alignés avec `clients.ts` → `resolveFallback` retombe sur DUPONT-TOPIN | MAJEUR | Aligner les slugs sur la source unique, ou `notFound()` au lieu du repli silencieux |
| E3 | `partenaires/actions.ts:40` + `PartenairesInteractive.tsx:508` | « Nouveau partenaire » : toast de succès mais le partenaire n'apparaît jamais | Pas de table `partenaires` ; écrit dans `dossier_events`, dégrade en `persisted:false` avec le même message | MAJEUR | Créer table `partenaires` (scopée), persister + lire depuis elle, message selon `persisted` |
| E4 | `etudes/page.tsx` + `etudes-restituees` + `clients-suivi` + `dossiers/page.tsx` (+ `_data` respectifs) | KPIs, compteurs stepper (187/41/142…), lignes, barres : tout factice et figé | Données hardcodées, aucun chemin de lecture live (contrairement aux écrans Assets) | MAJEUR | Brancher sur souscriptions/dossiers Supabase (pattern fetch + FALLBACK d'`assets-source.ts`) |
| E5 | `_data/assets.ts:46` (`fetchAssetsOverview`) + axes financier/assurance/immobilier/honoraires | Sans clé/session/base vide, les 5 écrans Assets affichent des chiffres démo indistinguables du réel | Repli `FALLBACK_*` volontaire mais non signalé | MINEUR | Marqueur visuel « données de démonstration » quand FALLBACK servi ; clé Supabase présente en prod |
| E6 | `referentiel/ReferentielInteractive.tsx:11/53` | Toggles « en ligne / accessible licenciés » et « Mettre à jour » ne persistent rien | `useState` local, aucun handler serveur | MINEUR | Server Action sur table de config référentiel |
| E7 | `referentiel/ReferentielInteractive.tsx:107` (IaZone) | L'assistant IA du référentiel ne renvoie aucune réponse (« sera connecté prochainement ») | Stub assumé, aucun appel LLM | MINEUR | Brancher sur un endpoint LLM (RAG sur process/contrat/FAQ) |
| E8 | `profil/ProfilInteractive.tsx:179-180` | Toggles notifications + signature email non persistés | `useState` le temps de la session, aucune table | MINEUR | Persister dans une table de préférences (Server Action) |
| E9 | `assets-financier/page.tsx:50` (« Exporter ») | Bouton export = toast stub, alors que les 3 autres axes ont un vrai export CSV | Handler `data-stub` resté en place | MINEUR | Remplacer par un vrai export CSV (`buildXxxCsv`) |
| E10 | `assets/page.tsx:170-187` + `marketplace/page.tsx:87/110` | « Exporter », « Période 2026 », « Mise en relation »/« Connexion module » inertes | Boutons maquette portés en `data-stub`, aucune feature derrière | MINEUR | Export consolidé, filtre période réel, soumission de mise en relation + notif référent |
| E11 | `etudes/page.tsx:225` | L'action de chaque ligne « Études en cours » pointe en dur vers le Kanban global, pas vers le dossier de la ligne | `href` statique, fixture sans id exploitable | MINEUR | Pointer vers `/dossiers/[id]` une fois `getFicheDossier(id)` paramétré |

> Déjà réellement branché (pas des vides, signalé pour éviter les faux positifs) : 6 simulateurs (`calculs.ts`), exports CSV pipeline/assurance/immobilier/honoraires/partenaires, génération PDF DER/Lettre de mission (`/api/conformite/der-pdf`, pdf-lib), fiches client & liste clients (Supabase via `clients-server.ts`/`fiche-client-server.ts`), Intégrations BYOK (`KeyManager`). Les 5 écrans Assets lisent les vraies souscriptions avec repli FALLBACK.

---

## Corrections recommandées — ordre conseillé (quick wins d'abord)

1. **[Quick win · Sujet 1]** Ajouter `ANTHROPIC_API_KEY` (+ `ANTHROPIC_MODEL`) dans `.env.local` (dev) et dans les env Vercel (prod), OU enregistrer la clé du cabinet par défaut via `/api/ia-settings`. → débloque d'un coup : insights IA live (A1), auto-remplissage DCI (B2), conseils dans toute la visio. **Plus gros impact pour le moins d'effort.**
2. **[Quick win · vérif]** Read-only Supabase : `SELECT cabinet_id,(api_key IS NOT NULL) FROM ia_settings;` + confirmer l'absence de la fonction `append_entretien`. Valide les deux diagnostics avant tout correctif.
3. **[Bloquant · Sujet 2]** Créer la migration `append_entretien` (signature exacte attendue par `entretiens-store.ts:397-408`). → restaure la persistance de TOUT l'entretien (DCI, transcript, conseils, notes), supprime le faux « Enregistré ».
4. **[Quick win UX]** Corriger le libellé de la carte « IA non connectée » (visio.html:4688) et ajouter un signal UI sur le 409 de `dci-extract`. Transforme un faux « rien ne marche » en action claire.
5. **[Bloquant Zone D]** Créer les couches `-server.ts` lisant les dossiers par `pipeline_stage` (scope tenant/cabinet/engineer) : `fiche-prospect-server.ts` (D1), `conformite-server.ts` (D2), `fiche-conformite-server.ts` (D3), brancher collectes sur `/api/collecte-admin` (D4). Débloque aussi les drill-down borgnes (D11).
6. **[Majeur trompeur]** Fiche client réelle (D5) : dériver Historique/Documents/RDV des vraies tables ou masquer les cartes — un vrai client n'affiche plus DUPONT-TOPIN. Même logique pour la fiche dossier (E1) et l'alignement clients-suivi (E2).
7. **[Majeur actions mortes]** Server Actions réelles : note prospect (D6), archivage prospect soft-delete (D7), promotion d'étape 02/03 (D8, D12), relance collecte (D13), création partenaire persistée (E3).
8. **[Majeur tableaux de bord]** Brancher sur Supabase : tableau de bord d'accueil (C1), activité commerciale (C2), études/etudes-restituees/clients-suivi/pipeline (E4), agenda — lecture `/api/calendar/events` (C3), compteurs + slug public (C4), persistance types de RDV via table `rdv_types` (C5), fiche RDV (C6).
9. **[Majeur signature]** Intégrer Yousign (clé + Server Action d'envoi) pour activer DER / pack / passage étape 03 (D12).
10. **[Mineur]** Marqueur « données de démonstration » sur le FALLBACK Assets (E5) ; remplacer les exports stub par de vrais CSV (E9, E10) ; persister référentiel (E6), assistant IA référentiel (E7), préférences profil (E8) ; corriger les compteurs/footnotes incohérents (D14, D17, D18, D9) ; rendre alertes/filtres cliquables (C7, C8, C9, E11).
11. **[Hors panne courante]** Parité Cockpit React (A3) : ne pas utiliser `?ui=react` tant que la pompe d'insights n'y est pas portée.

> Méthode : lecture/diagnostic uniquement, chemins absolus sous `/Users/marvinmouton/Documents/Projets/astraeos`, aucun git, aucune installation, aucun script lancé. Les deux ruptures centrales ont été confirmées en lecture directe : `.env.local` sans `ANTHROPIC_API_KEY`, et `append_entretien` absente des 11 migrations `supabase/migrations/*.sql`.
