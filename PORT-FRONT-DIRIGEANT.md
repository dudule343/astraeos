# Standard de port — Espace Dirigeant (maquette 020)

Port **fidèle 1:1** de la maquette `reference/wireframes-dirigeant.html` (les `page-dir-*`)
vers React, en **hardcode** (données exactes de la maquette), toutes interactions fonctionnelles.
Même méthode que l'espace éditeur (`scope-editeur-css.mjs` / `EditeurSprite`).

## Ossature (déjà en place)

- **CSS** : `src/app/(dirigeant)/_styles/maquette.css` — tous les `<style>` de la maquette,
  scopés sous `.maquette-dir`. Régénérable : `node scripts/scope-dirigeant-css.mjs`.
  → Toutes les classes de la maquette (`.hero`, `.card`, `.section-block`, `.kpi-*`, `.qf-bar`,
  `.status-pill`, `.btn`, `.nav-*`, graphiques…) sont disponibles. **Ne pas réimporter de `<style>`.**
- **Sprite** : `src/app/(dirigeant)/_components/DirigeantSprite.tsx` (régénérable :
  `node scripts/gen-dirigeant-sprite.mjs`). Icônes via `<svg className="..."><use href="#i-xxx" /></svg>`.
  ⚠️ `#i-cockpit` n'existe pas → l'accueil utilise `#i-home`.
- **Layout** : `src/app/(dirigeant)/layout.tsx` enveloppe dans `<div className="maquette-dir">`,
  `blockClients()`, `SpaceSwitcher active="dirigeant"`, `.app > Sidebar + .main`.
- **Sidebar** : `_components/Sidebar.tsx` (fidèle, 9 sections, footer Luc THILLIEZ, routing Next).
- **Topbar** : `_components/DirigeantTopbar.tsx` — `<DirigeantTopbar current="…" />`.

## Pattern d'une page portée

```tsx
// page.tsx — Server Component (coquille). PAS de "use client" ici.
import { DirigeantTopbar } from "../../_components/DirigeantTopbar"; // ajuster la profondeur

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · <Titre>" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="<libellé fil d'Ariane>" />
      <div className="content">
        {/* markup de la maquette traduit en JSX, classes IDENTIQUES */}
      </div>
    </>
  );
}
```

Interactif (onglets, toggles, drawers, filtres, popovers) → sortir la partie interactive
dans un composant frère `XxxClient.tsx` avec `"use client"` et `useState`, rendu par la page.
**Jamais de bouton mort** : tout `onclick` de la maquette devient un handler React réel.

## Règles de traduction HTML → JSX

- `class=` → `className=` ; commentaires `<!-- -->` → `{/* */}`.
- `style="a:b;c:d"` → `style={{ a: "b", c: "d" }}` (camelCase, px en nombres ou strings).
- SVG inline (gauges, barres) : `stroke-width` → `strokeWidth`, `stroke-dasharray` → `strokeDasharray`,
  `stroke-linecap` → `strokeLinecap`, `viewBox` conservé, etc.
- Icônes sprite : `<use href="#i-xxx" />` (déjà disponibles).
- `onclick="goToPage('dir-pipe-02')"` → `<Link href="/espace-dirigeant/parcours/compliance">`.
- Ignorer les `<style>` et `<script>` internes (CSS déjà porté ; le JS devient des handlers React).
- `&amp;` `&eacute;`… → caractères réels (`&` `é`).
- **Données EXACTES de la maquette** : Luc THILLIEZ, Cabinet Paris Étoile, Julien VASSEUR,
  montants (1 091 100 €, etc.), badges, compteurs. Ne rien inventer, ne rien simplifier.

## Carte écran → route → ligne (maquette)

| screenId | Route (fichier) | Lignes maquette |
|---|---|---|
| dir-accueil | espace-dirigeant/page.tsx | 2291-2660 |
| dir-finance-overview | espace-dirigeant/finance/page.tsx | 2661-4202 |
| dir-resultat | espace-dirigeant/finance/resultat/page.tsx | 4203-4298 |
| dir-treso | espace-dirigeant/finance/tresorerie/page.tsx | 4299-5102 |
| dir-activite | espace-dirigeant/finance/activite/page.tsx | 5103-5840 |
| page-licencies | espace-dirigeant/licencies/page.tsx | 5841-6143 |
| dir-performance | espace-dirigeant/performance/page.tsx | 6144-6538 |
| dir-ingenieurs | espace-dirigeant/ingenieurs/page.tsx | 6539-6620 |
| dir-recrutement | espace-dirigeant/ingenieurs/recrutement/page.tsx | 6621-6745 |
| dir-pipe-01 | espace-dirigeant/parcours/prospects/page.tsx | 6746-6923 |
| dir-pipe-02 | espace-dirigeant/parcours/compliance/page.tsx | 6924-7075 |
| dir-pipe-03 | espace-dirigeant/parcours/collecte/page.tsx | 7076-7234 |
| dir-pipe-04 | espace-dirigeant/parcours/etudes/page.tsx | 7235-7346 |
| dir-pipe-05 | espace-dirigeant/parcours/restituees/page.tsx | 7347-7478 |
| dir-pipe-06 | espace-dirigeant/parcours/suivi/page.tsx | 7479-7608 |
| dir-assets-overview | espace-dirigeant/assets/page.tsx | 7609-7769 |
| dir-assets-financier | espace-dirigeant/assets/financier/page.tsx | 7770-7847 |
| dir-assets-assurance | espace-dirigeant/assets/assurance/page.tsx | 7848-7922 |
| dir-assets-immobilier | espace-dirigeant/assets/immobilier/page.tsx | 7923-8097 |
| dir-assets-honoraires | espace-dirigeant/assets/honoraires/page.tsx | 8098-8172 |
| dir-ref-process | espace-dirigeant/referentiel/page.tsx | 8173-8359 |
| dir-partenaires | espace-dirigeant/partenaires/page.tsx | 8360-8470 |
| dir-param-identite | espace-dirigeant/parametrages/identite/page.tsx | 8471-8569 |
| dir-gestion-ingenieurs | espace-dirigeant/ingenieurs/comptes/page.tsx | 8570-8610 |
| dir-param-banque | espace-dirigeant/parametrages/banque/page.tsx | 8611-8771 |
| dir-param-integrations | espace-dirigeant/parametrages/integrations/page.tsx | 8772-8974 |
| dir-param-conformite | espace-dirigeant/parametrages/conformite/page.tsx | 8975-9184 |
| dir-param-templates | espace-dirigeant/parametrages/templates/page.tsx | 9185-9470 |
| dir-out-catalogue | espace-dirigeant/outils/catalogue/page.tsx | 9471-9584 |
| dir-out-simulateurs | espace-dirigeant/outils/simulateurs/page.tsx | 9585-9674 |
| dir-out-marketing | espace-dirigeant/outils/marketing/page.tsx | 9675-9759 |
| dir-profil | espace-dirigeant/profil/page.tsx | 9760-10129 |

`performance` et `licencies` ne sont pas dans la sidebar (fidèle à la maquette) mais leurs
routes existent (accessibles par URL, pas de 404).
