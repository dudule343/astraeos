# Espace éditeur — `(editeur)`

Cockpit d'administration du SaaS (vue éditeur de la plateforme). Ce dossier
contient **deux choses de nature différente** :

1. **Les 19 pages du port maquette** (home, business, finance, team, …) :
   reproduction **fidèle 1:1** du wireframe `reference/wireframes-editeur.html`,
   avec **données en dur** (les chiffres d'exemple de la maquette). C'est du vrai
   React qui marche (navigation, onglets, drawer, wizard, filtres), mais ce n'est
   **pas** branché sur des données réelles : les chiffres ne correspondent à rien
   en base, et les boutons d'action métier sont des stubs (`data-stub` → toast).
2. **Les routes hors maquette** (`collectes`, `dossiers`, `prospects`,
   `mon-activite`, `entretiens`, `profil`, `integrations`,
   `referentiel-documents`, `agenda`) : ce sont **les vrais outils** branchés sur
   Supabase. Le port n'y a pas touché ; elles ne sont juste plus liées dans la
   sidebar maquette.

## Comment c'est construit

- **`layout.tsx`** importe une fois le CSS porté de la maquette
  (`_styles/maquette.css`) et enveloppe tout dans `<div className="maquette-edit">`
  (wrapper de **scope** : ces styles ne fuient pas hors de l'espace). Il rend le
  sprite SVG, la sidebar et la structure `.app`/`.main` de la maquette.
- **`_styles/maquette.css`** est **généré** par `scripts/scope-editeur-css.mjs`
  (porte le `<style>` de la maquette en préfixant chaque sélecteur par
  `.maquette-edit`). Ne pas l'éditer à la main : relancer le script.
- **`_components/EditeurSprite.tsx`** est **généré** par
  `scripts/gen-editeur-sprite.mjs` (les 50 icônes `#i-*` de la maquette). On les
  référence par `<svg><use href="#i-xxx" /></svg>`.
- **`_components/EditeurSidebar.tsx`** / **`EditeurTopbar.tsx`** : le chrome porté
  à l'identique. La navigation `goToPage()` de la maquette devient du routing Next
  (`<Link>` + `usePathname()` pour l'actif).

## Pattern d'une page

La maquette est interactive, un Server Component ne peut pas porter `onClick`.
On **mixe** :

- **`page.tsx` = Server Component** : la coquille + les données en dur (`const` en
  haut du fichier). Rend `<EditeurTopbar current="…" />` puis
  `<div className="content">…</div>`.
- **Composant(s) `"use client"` co-localisé(s)** = tout l'interactif (onglets,
  drawer, wizard, filtres) avec de vrais `useState`/handlers reproduisant le
  comportement exact de la maquette (classe `.active`, `.tab-panel active`, …).
  Exemples : `finance/FinanceConsolidee.tsx`, `team/TeamRosterDrawer.tsx`,
  `client-new/ClientNewWizard.tsx`.

Les composants n'écrivent **aucun CSS** : toutes les classes existent déjà dans
`maquette.css`, scopées sous `.maquette-edit`.

## Vérif

- `rm -rf .next && npm run build` (un `npm run dev` en parallèle pollue `.next` et
  fait sortir des erreurs fantômes).
- `npx eslint "src/app/(editeur)"`.
- Prod : **`app.astraeos.fr`** (pas `astraeos.fr`, qui est le site vitrine).

## Passer à un vrai outil

Page par page : remplacer les `const` en dur par une lecture Supabase (module
`data.ts` co-localisé avec `createAdminClient()` + scope `tenant_id`/`cabinet_id`,
comme les routes hors maquette), et câbler les vraies actions à la place des
`data-stub`.

Doc complète : note Obsidian `ASTRAEOS/doc-technique/espace-editeur.md`.
