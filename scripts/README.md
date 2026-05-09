# Scripts utilitaires

## `check_wireframe_coverage.py`

Vérifie que chaque page React du dashboard Editeur reproduit fidèlement le
contenu de son équivalent dans le wireframe HTML d'origine
(`reference/wireframes/02_Wireframes_Editeur.html`).

### Usage

```bash
# Toutes les pages
python3 scripts/check_wireframe_coverage.py

# Une seule page
python3 scripts/check_wireframe_coverage.py --page finance

# Afficher les phrases manquantes
python3 scripts/check_wireframe_coverage.py --show-missing

# Seuil de couverture personnalisé
python3 scripts/check_wireframe_coverage.py --threshold 95

# Mode strict (exit != 0 si une page sous le seuil)
python3 scripts/check_wireframe_coverage.py --strict
```

### Comment ça marche

1. **Extraction HTML** : parse le wireframe et récupère le texte visible
   de chaque section `<div class="page" id="page-X">`, en insérant des
   sauts de ligne aux frontières des éléments de bloc.
2. **Extraction React** : lit chaque fichier `src/app/(editeur)/<route>/page.tsx`
   et suit récursivement les imports vers `_components/` pour récupérer
   le texte des composants partagés (Sidebar, Topbar, KpiCard, etc.).
3. **Découpage en phrases** : sépare le texte sur les sauts de ligne et
   les puces visuelles (· • | — →).
4. **Comparaison** : pour chaque phrase HTML significative (≥ 5 caractères,
   pas un token Tailwind), vérifie si elle apparaît dans le texte React.
5. **Rapport** : taux de couverture par page + liste des phrases manquantes.

### Adapter le script

Pour ajouter une nouvelle page : éditer `PAGE_MAP` au début du fichier en
mappant l'`id` HTML (`page-X`) vers le chemin du `page.tsx` correspondant.

### Faux positifs connus

Certaines longues phrases du HTML contiennent des balises `<strong>` en
plein milieu, ce qui les coupe en plusieurs morceaux côté React. Le script
peut alors signaler la phrase entière comme « manquante » alors que tout le
contenu est bien présent. Inspecter les phrases manquantes au cas par cas
pour décider s'il s'agit d'un vrai oubli de copywriting ou d'un artefact
de découpage.
