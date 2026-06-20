# Mission : porter l'espace Ingénieur à l'identique de la maquette, branché pour de vrai

## Règle de fer (à ne jamais violer)

Tu **portes** la maquette, tu ne la **réinterprètes pas**. Ce sont deux verbes différents.

- **Porter** = tu copies le markup HTML réel et le CSS réel de la maquette, tu les transposes en composants React/TSX, puis tu branches sur la vraie donnée. Transformation quasi mécanique.
- **Réinterpréter** = tu recodes "à ta sauce" à partir d'une description ou d'un autre écran. **Interdit.** C'est ça qui a cassé la fidélité les fois précédentes.

Le front fourni EST la spec. La maquette respecte le design à 100 %, c'est elle le design. Aucune version allégée, aucune approximation "par batch". Si un écran est un gros composant (calendrier hebdo, fiche client, parcours), tu le portes en entier, pas une réduction.

## Source de vérité unique

Fichier maquette (HTML autonome qui marche, 24 436 lignes) :

```
/Users/marvinmouton/Library/CloudStorage/GoogleDrive-marvin@priveos.io/Drive partagés/PRIVEOS/1 - Administratif & Juridique/20 - Astraeos/0 - Construction de la Saas/03 - Ingénieur/0 - 030_Wireframes_Ingenieur_v28.html
```

Chaque écran de l'espace ingénieur est une `<div class="page" id="page-ing-XXX">`. Le CSS vit dans le `<style>` en tête de fichier (variables `--navy`, `--gold`, `--ivory`, classes `s1b-*`, `s1c-*`, `agenda-v2-*`, `der-*`, etc.). La navigation se fait par `data-page` / `goToPage()`.

## Cible (repo)

```
/Users/marvinmouton/Documents/Projets/astraeos/src/app/(ingenieur)/espace-ingenieur/
```

Travaille toujours en **chemins absolus** : tes agents tournent parfois avec un cwd hérité d'un autre repo (edilos-site). Ne suppose jamais le cwd.

## Carte exacte des écrans ingénieur à porter (id → ligne de début dans la maquette)

| Écran | id maquette | ligne | dossier cible |
|---|---|---|---|
| Tableau de bord | `page-ing-accueil` | 4160 | `/` |
| Calendrier & RDV (vrai calendrier hebdo) | `page-ing-agenda` | 5519 | `agenda/` |
| Mon activité commerciale | `page-ing-activite` | 15714 | `activite/` |
| Tous mes clients | `page-ing-clients` | 4478 | `clients/` |
| Fiche client (riche) | `page-ing-fiche-client` | 4618 | `clients/[id]/` |
| Pipeline Kanban 6 étapes | `page-ing-pipeline` | 4779 | `dossiers/` |
| Fiche dossier (timeline parcours) | `page-ing-fiche-dossier` | 4950 | `dossiers/[id]/` |
| Étape 1 · création espace client | `page-ing-detail-etape-1` | 5102 | `client-new/` |
| Création espace | `page-ing-creation-espace` | 5498 | `client-new/` |
| Prospect · Aubert | `page-ing-fiche-prospect-aubert` | 5908 | `prospects/[id]/` |
| Prospect · Joubert | `page-ing-fiche-prospect-joubert` | 6148 | `prospects/[id]/` |
| Prospect · Mercier | `page-ing-fiche-prospect-mercier` | 6436 | `prospects/[id]/` |
| Conformité · Joubert (DCI/DER/KYC/LM) | `page-ing-fiche-conformite-joubert` | 6632 | `conformite/[id]/` |
| Conformité · Dupont-Topin | `page-ing-fiche-conformite-dupont-topin` | 6979 | `conformite/[id]/` |
| Conformité · Moreau | `page-ing-fiche-conformite-moreau` | 7111 | `conformite/[id]/` |
| Conformité · Lefebvre SAS | `page-ing-fiche-conformite-lefebvre-sas` | 7243 | `conformite/[id]/` |
| Types de RDV | `page-ing-types-rdv` | 7388 | `agenda/types/` |
| Fiche RDV · Mercier | `page-ing-fiche-rdv-mercier` | 7742 | `agenda/[id]/` |
| Fiche RDV · Joubert | `page-ing-fiche-rdv-joubert` | 7849 | `agenda/[id]/` |
| Pipe 01 · Mes prospects | `page-ing-pipe-01` | 15904 | `prospects/` |
| Pipe 02 · Conformité en cours | `page-ing-pipe-02` | 16082 | `conformite/` |
| Pipe 03 · Collecte docs & infos | `page-ing-pipe-03` | 16306 | `collectes/` |
| Pipe 04 · Études en cours | `page-ing-pipe-04` | 16465 | `etudes/` |
| Pipe 05 · Études restituées | `page-ing-pipe-05` | 16577 | `etudes-restituees/` |
| Pipe 06 · Clients en suivi | `page-ing-pipe-06` | 16709 | `clients-suivi/` |
| Assets · vue d'ensemble | `page-ing-assets-overview` | 16839 | `assets/` |
| Assets · financier | `page-ing-assets-financier` | 17016 | `assets-financier/` |
| Assets · assurance | `page-ing-assets-assurance` | 17152 | `assets-assurance/` |
| Assets · immobilier | `page-ing-assets-immobilier` | 17289 | `assets-immobilier/` |
| Assets · honoraires | `page-ing-assets-honoraires` | 17407 | `assets-honoraires/` |
| Partenaires & apporteurs | `page-ing-partenaires` | 17538 | `partenaires/` |
| Catalogue produits | `page-ing-out-catalogue` | 17647 | `marketplace/` |
| Simulateurs & calculateurs | `page-ing-out-simulateurs` | 17762 | `simulateurs/` |
| Process & méthodologie | `page-ing-ref-process` | 17851 | `referentiel/` |
| Profil & agréments | `page-ing-profil` | 7974 | `profil/` |

Le menu latéral (sidebar) à porter à l'identique est aux lignes 3911 à 3967.

(Les pages `dir-*` = espace dirigeant, hors périmètre de cette passe. On les fera après.)

## Méthode imposée, écran par écran

Pour chaque écran, dans cet ordre, sans sauter d'étape :

1. **Lis le markup réel** de la `<div class="page" id="page-ing-XXX">` correspondante dans la maquette (par sa plage de lignes).
2. **Lis le CSS réel** des classes utilisées par cet écran dans le `<style>` de tête.
3. **Porte le CSS** dans un module scopé à l'espace ingénieur (réutilise/complète `src/app/(ingenieur)/_styles/`). Garde les **mêmes noms de classes** et les **mêmes variables de couleur**. Tu ne réinventes pas une feuille de style "propre", tu transposes la vraie.
4. **Transpose le markup** en TSX, structure et hiérarchie identiques. Mêmes textes, mêmes badges, mêmes colonnes, mêmes KPI, mêmes pictos.
5. **Branche la donnée** : remplace les valeurs en dur par les données du module `_data/` (et étends `_data/` si besoin avec les mêmes données d'exemple que la maquette, voir plus bas).
6. **Vérifie côte à côte** : screenshot de la page maquette vs screenshot du rendu React, comparaison visuelle. Tu ne pousses pas tant que ce n'est pas fidèle.

Un écran riche = un agent dédié, scopé à cet écran. **Jamais "tout d'un coup".** Pas de port par batch approximant.

## Ce que "branché pour de vrai" veut dire (pas juste visuel)

- **Visio** : le bouton "Rejoindre" (classe `s1c-visio-btn.join`, le point qui pulse) ouvre une **vraie** salle Jitsi auto-hébergée (`srv1750581.hstgr.cloud`, déjà en place dans le repo, pas meet.jit.si). Le bouton "Consulter/Replay" (`s1c-visio-btn.replay`) ouvre l'enregistrement. La salle est nommée d'après le dossier/RDV réel.
- **Collecte docs & infos** (pipe 03) : les lignes de documents (`doc-collecte-row`) reflètent un **vrai** état d'upload et de complétion (pourcentage réel, statut par document), pas un pourcentage figé.
- **Conformité** (pipe 02 + fiches conformité) : les cartes document DCI / DER / KYC / LM portent leur **vrai** statut de workflow, et la génération est réelle (PDF via pdf-lib + signature Yousign en BYOK par variables d'env, déjà câblé dans le repo).
- **DER** : la page DER pré-rendue (`s1c-der-page`) affiche le vrai document, avec ses **3 champs modifiables** (personne/personnes, date, lieu) tels que dans la maquette (`s1c-der-editable-field`, mode `body.s1b-mode-edit`), et produit un PDF signable réel.
- **Parcours patrimonial 6 étapes** : le stepper (`s1b-parcours-stepper`) et la timeline reflètent l'étape réelle du dossier, navigable.
- **Agenda** : vrai calendrier hebdomadaire (grille Lun→Dim, créneaux 9h/9h30/10h…, événements posés dans les cases comme DELANNOY 9h, MARCHAND 9h30 visio, LACROIX 10h), panneau "types de RDV" à droite, les 4 KPI, et le lien public type Calendly. Branché sur les vrais RDV de `_data/agenda.ts`.

## Données d'exemple (seed), comme dans la maquette

L'outil doit s'afficher rempli, comme si un vrai ingénieur l'utilisait, avec **exactement les mêmes exemples que la maquette** (ne pas inventer d'autres noms) :

- Ingénieur connecté : **Julien VASSEUR**.
- Clients / prospects / dossiers : **Delannoy, Marchand, Lacroix, Aubert, Joubert, Mercier, Dupont-Topin, Moreau, Lefebvre SAS** (et les autres présents dans la maquette).
- Reprends les chiffres de la maquette : badges (7 clients, 5 prospects, 9 dossiers actifs, 14 livrés 2026, 28 en suivi…), répartition patrimoniale du donut (Immobilier d'usage 720 000 €, Immobilier locatif 1 365 000 €, Financier 852 400 €, Atypique/or 18 000 €), KPI agenda (5 présentiel · 3 visio), pourcentages de collecte, etc.

Ces données vivent dans `src/app/(ingenieur)/_data/*.ts` (déjà : `agenda.ts`, `cockpit.ts`, `dossiers.ts`, `assets-financier.ts`). Tu les étends avec les mêmes valeurs que la maquette, et tout écran lit depuis là. **Une seule source de vérité par donnée**, jamais de valeur dupliquée en dur dans un composant.

## Ordre de passes (phasé)

1. **Agenda** (preuve déjà en cours) : finir le port pixel-fidèle, branché, vérifié côte à côte.
2. **Fiche client** (`ing-fiche-client`) + **Pipeline 6 étapes** (`ing-pipeline`) + **Fiche dossier** (`ing-fiche-dossier`).
3. **Parcours / conformité / collecte / DER** : étape 1 création espace, fiches conformité, pipe 02 et pipe 03, avec le branchement réel (Jitsi, PDF/Yousign).
4. **Le reste** : activité, prospects, assets, partenaires, catalogue, simulateurs, référentiel, profil.

À chaque écran terminé : capture maquette vs capture rendu, et tu me montres la comparaison avant de pousser. Pas de "fait" annoncé sans la preuve visuelle.

## React / Next.js : mixer Server et Client Components (obligatoire)

La maquette est interactive (modales, onglets, toggles, recherche, `onclick`, `goToPage`). En App Router, un Server Component NE PEUT PAS porter `onClick`/`useState`. Donc tu **mixes** :

- **Server Component** = la coquille de page (`page.tsx`) + le fetch des données (`_data/`). Pas d'interactivité.
- **Client Component** (`"use client"`, fichier co-localisé) = TOUT l'interactif, avec vrai `useState`/handlers :
  - les **modales** (ex. « Nouveau RDV » = la grande popup « Création RDV directe » : type de RDV, client/prospect existant ou nouveau, participants, documents auto, message avec variables `{prenom}`/`{nom}`/`{date}`… ; bouton « Créer le RDV + envoyer »),
  - les **onglets**, **toggles**, **champs de recherche**, **boutons d'action**.
- Le bouton qui ouvre une modale (ex. « + Nouveau RDV ») doit RÉELLEMENT l'ouvrir (état client), jamais un `disabled`/stub. Reproduis le comportement exact de la maquette.

Règle : si un écran de la maquette a une interaction, tu la portes en Client Component branché, tu ne la remplaces pas par un bouton mort.

## Vérification avant de dire "fait"

- `npm run build` (ou le type-check strict du repo) passe sans erreur.
- Le linter passe.
- Screenshot côté à côté maquette vs rendu pour l'écran livré, fidèle.
- Les boutons annoncés "branchés" (visio, génération DER/KYC/LM, upload collecte) font réellement l'action, pas une coquille visuelle.

Si un écran ne peut pas être fidèle à 100 % tout de suite (donnée manquante, intégration non prête), tu le **dis explicitement** dans la passe au lieu d'approximer en douce.
