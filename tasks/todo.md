# Migration cockpit visio HTML → React

**Objectif** : remplacer `public/wireframes/visio.html` (5390 lignes HTML+JS) par des
composants React typés, sans casser la prod. JSX auto-échappé → la classe de XSS
qu'on vient de corriger disparaît par construction.

**Stratégie sans rupture** : on construit dans `src/app/visio/[room]/_cockpit/`.
`page.tsx` rend le cockpit React seulement si `?ui=react` ; par défaut il garde
l'iframe → visio.html. On bascule le défaut quand on est à parité, puis on retire
le HTML.

**Stack** : React 19 `useReducer` + Context (aucune nouvelle dépendance).
Composants client (`"use client"`). Vérif `tsc --noEmit` + `npm run build` à chaque phase.

---

## Phase 0 — Fondations (additif, zéro risque prod) — ≤5 fichiers
- [ ] `_cockpit/types.ts` — types DCI_DATA (sections/groups/fields/status), entretien, conseils
- [ ] `_cockpit/demo-data.ts` — port fidèle du mock JOUBERT-BERTHOUX (l.1450-2119)
- [ ] `_cockpit/store.tsx` — reducer + Context (DCI, CURRENT_SECTION, CURRENT_FILTER, REC_STATE, EDITING, transcription)
- [ ] `_cockpit/api.ts` — wrappers fetch (stt-token, dci-extract, conseils, entretiens GET/PATCH, compte-rendu)
- [ ] `_cockpit/cockpit.module.css` — port du CSS inline (l.8-812 + injections)
- [ ] Vérif : `tsc` vert

## Phase 1 — Colonne DCI (cœur visible) — ≤5 fichiers
- [ ] `_cockpit/Cockpit.tsx` — layout 3 colonnes + provider store
- [ ] `_cockpit/DciNavigation.tsx` — sidebar sections (renderNav)
- [ ] `_cockpit/DciSection.tsx` — corps section + filtres (renderSection)
- [ ] `_cockpit/DciField.tsx` — ligne champ + badges IA + valider/rejeter (renderField)
- [ ] `page.tsx` — branchement `?ui=react` → `<Cockpit/>`
- [ ] Vérif : `tsc` + build + QA navigateur (nav sections, filtres, édition champ)

## Phase 2 — Panneau IA à onglets — ≤5 fichiers
- [ ] `_cockpit/AssistPanel.tsx` — 5 onglets (Agenda, DCI Simplifié, Notes, Insights, Transcript)
- [ ] `_cockpit/panes/InsightsPane.tsx` — conseils + hook polling `/api/visio/conseils`
- [ ] `_cockpit/panes/AgendaPane.tsx` + `NotesPane.tsx` + `DossierPane.tsx`
- [ ] Vérif : `tsc` + build + QA (switch onglets, génération conseils)

## Phase 3 — Zone vidéo — ≤5 fichiers
- [ ] `_cockpit/VideoZone.tsx` — montage Jitsi (room) ou avatars démo + PiP + toolbar
- [ ] `_cockpit/useJitsi.ts` — hook external_api (load script, branding, cleanup)
- [ ] `_cockpit/CompanionView.tsx` — mode Meet/Zoom compagnon
- [ ] `_cockpit/ClientView.tsx` — vue client épurée (role=client)
- [ ] Vérif : `tsc` + build + QA (salle réelle + démo + compagnon)

## Phase 4 — Transcription + enregistrement — ≤5 fichiers
- [ ] `_cockpit/TranscriptionPanel.tsx` — panneau flottant alt-panel
- [ ] `_cockpit/useDeepgram.ts` — token + WebSocket nova-2 fr + fallback Web Speech
- [ ] `_cockpit/useRealtime.ts` — canal Supabase Realtime par salle
- [ ] `_cockpit/RecordingControls.tsx` — pause/couper/réactiver
- [ ] Vérif : `tsc` + build + QA (micro, transcription live, pause)

## Phase 5 — Modales + persistance + clôture — ≤5 fichiers
- [ ] `_cockpit/Modals.tsx` — édition champ, action enregistrement, fin entretien, connecter STT
- [ ] `_cockpit/usePersistence.ts` — création entretien + autosave PATCH débouncé
- [ ] `_cockpit/useDciExtract.ts` — polling `/api/visio/dci-extract` (toutes 20s)
- [ ] `_cockpit/cloture.ts` — compte-rendu PDF + synthèse Section 20/21
- [ ] Vérif : `tsc` + build + QA (autosave, extraction IA, compte-rendu)

## Phase 6 — Bascule + nettoyage — ≤3 fichiers
- [ ] `page.tsx` — défaut = React (plus d'iframe), suppression du gate `?ui`
- [ ] QA complète navigateur côté ingénieur ET client
- [ ] Retrait `public/wireframes/visio.html` (après validation prod)
- [ ] Vérif finale : `tsc` + build + push

---

## Revue
(à remplir au fil des phases)
