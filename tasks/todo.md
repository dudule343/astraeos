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

## Phase 0 — Fondations (additif, zéro risque prod) — FAIT ✅
- [x] `_cockpit/types.ts` — réutilise les types canoniques de @/lib/dci-schema + overlay session
- [x] ~~demo-data.ts~~ — INUTILE : DCI_DATA déjà alimenté par /api/dci/complet (pas de mock)
- [x] `_cockpit/store.tsx` — reducer + Context (DCI, section, filtre, rec, editing, collapse, confirmed, toast)
- [x] `_cockpit/api.ts` — loadDciComplet (valide via schéma canonique)
- [x] `_cockpit/cockpit.css` — port verbatim du <style> (802 lignes)
- [x] Vérif : `tsc` vert

## Phase 1 — Colonne DCI (cœur visible) — FAIT ✅ (commits e1a4ac0, 9ac929a, f6cccae)
- [x] `_cockpit/Cockpit.tsx` — layout 3 colonnes + provider + chargement DCI réel
- [x] `_cockpit/DciNavigation.tsx` — sidebar sections (renderNav)
- [x] `_cockpit/DciSection.tsx` — person/block/repeatable + alertes + filtres + footer
- [x] `_cockpit/DciField.tsx` — ligne champ + badges IA + valider/rejeter + surlignage v9
- [x] `_cockpit/EditFieldModal.tsx` — édition champ (text/date/number/select)
- [x] `_cockpit/render-helpers.ts` — helpers purs (données structurées, JSX → fin du XSS)
- [x] `page.tsx` — branchement `?ui=react` → `<Cockpit/>`
- [x] Vérif : `tsc` + build + **QA navigateur runtime** (render API réelle, nav, validate,
      édition modale, filtre, confirm-section, alerte Dutreil, 0 erreur console) ✅
- [ ] RESTE Phase 1 : sections 20/21 (customRenderer) — placeholder posé, rendu dédié à faire

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
