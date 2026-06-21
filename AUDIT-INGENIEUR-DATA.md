# Audit — Données de l'espace ingénieur (clients, patrimoine, fiche client)

> Analyse en lecture seule. Aucun fichier de code modifié. Périmètre : `src/app/(ingenieur)/...` et le schéma Supabase. L'espace `(dirigeant)` est lu, jamais modifié.

---

## TL;DR

L'espace **dirigeant** lit le **vrai Supabase** (`commissions`, `souscriptions`, `produits`, `dossiers`, `users`, `cabinets`). L'espace **ingénieur**, pour les écrans **clients / fiche client / assets**, lit des **constantes TypeScript codées en dur** (le portefeuille « Julien VASSEUR » de la maquette v28). Les deux espaces n'ont donc **aucune source commune** : le patrimoine que Marvin voit côté ingénieur (2,1 M€, 7 clients, DUPONT-TOPIN, etc.) n'existe **que dans des fichiers `.ts`**, jamais en base, donc il est **invisible côté dirigeant** (qui agrège la base réelle, vide ou seedée a minima).

La source unique cible existe déjà dans le schéma : table **`clients`** (foyer) + **`personnes`** (1-2 personnes physiques par foyer) + **`dossiers`** (rattachement ingénieur, pipeline) + **`souscriptions`** (patrimoine placé) + **`commissions`** (CA). C'est exactement ce que lit le dirigeant. Il faut faire **lire la même base à l'ingénieur**.

---

## SUJET 1 — Incohérence ingénieur ↔ dirigeant

### 1.1 D'où l'espace INGÉNIEUR tire ses clients / patrimoine

| Écran ingénieur | Fichier source | Nature | Lit Supabase ? |
|---|---|---|---|
| « Mes clients » (`clients/page.tsx`) | `_data/clients.ts` → `getClientsScreen()` | **Constante `CLIENTS[]` codée en dur** (7 clients : DUPONT-TOPIN, HUYGHE, SAS LEFEBVRE…) | **NON** |
| Fiche client (`clients/[id]/page.tsx`) | `_data/fiche-client.ts` → `getFicheClient(id)` | **Constante `FICHE_CLIENT_MODELE`** (toujours la fiche modèle DUPONT-TOPIN ; pour les autres slugs, seul le hero est réécrit, le reste = données d'exemple) | **NON** |
| Assets vue d'ensemble (`assets/page.tsx`) | `_data/assets.ts` → `fetchAssetsOverview()` | **Constante `overview`** (2,1 M€ « patrimoine sous gestion », 22 contrats) — `async` mais renvoie l'objet en dur | **NON** |
| Assets financier / assurance / immobilier / honoraires | `_data/assets-financier.ts`, `assets-assurance.ts`, `assets-immobilier.ts`, `assets-honoraires.ts` | **Constantes codées en dur** | **NON** |

> À noter : d'**autres** écrans ingénieur lisent **déjà** la base réelle (`_data/dossiers.ts`, `_data/prospects.ts`, `_data/cockpit.ts`, `_data/agenda.ts` ; et les Server Actions agenda / conformité / dossiers / prospects). Le système est donc **hybride** : pipeline/agenda/prospects = Supabase, mais clients/fiche/assets = données de maquette figées. C'est cette moitié figée qui diverge du dirigeant.

`_data/dossiers.ts` est la preuve que la jointure réelle existe déjà côté ingénieur :
```
dossiers → clients ( personnes ( first_name, last_name ) )
  .eq("tenant_id", ctx.tenantId).eq("cabinet_id", ctx.cabinetId)
```

### 1.2 D'où l'espace DIRIGEANT tire ses clients / patrimoine

Un seul fichier : `(dirigeant)/_data/cabinet.ts`. **Tout** vient de Supabase via `createAdminClient()` + `getSessionContext()`, filtré par `cabinet_id` + `tenant_id` :

- `commissions` jointes à `souscriptions!inner ( produit:produits )` → CA perçu, honoraires, apports
- `users` (role `engineer`) → classement ingénieurs
- `dossiers` → études, nouveaux clients par ingénieur, pipeline (`pipeline_stage`)
- `etudes` → comptage études livrées
- `cabinets` → profil cabinet (AUM caché, nb clients caché…)
- Le **patrimoine sous gestion (AUM)** est dérivé de `souscriptions.amount_initial` (`computeAumByCategory`, `computeAumByAssetClass`).

### 1.3 POURQUOI ça diverge

1. **Deux sources de vérité disjointes.** Ingénieur (clients/fiche/assets) = constantes `.ts` ; dirigeant = lignes Supabase. Rien ne relie les deux. Modifier l'un ne touche jamais l'autre.
2. **Le patrimoine ingénieur n'est jamais persisté.** Les 2,1 M€ / 7 clients / contrats de `_data/assets.ts` et `_data/clients.ts` sont des valeurs de maquette « comme si l'ingénieur avait saisi son portefeuille à la main ». Comme ils ne vivent que dans le code, **le dirigeant ne peut pas les voir** : il n'agrège que `souscriptions`/`commissions`, qui sont vides (le seed `db/seed/0001_minimal_seed.sql` ne crée que tenant + cabinet + ingénieur, **aucun client/souscription**).
3. **Effet asymétrique observé par Marvin.** Côté ingénieur, l'écran affiche **toujours** le portefeuille riche de la maquette (constantes). Côté dirigeant, l'écran affiche **la réalité de la base** (≈ vide). D'où « je vois du patrimoine côté ingénieur que je ne retrouve pas côté dirigeant ».
4. **Faux signe de cohérence.** Les clients **réellement** créés par le wizard `client-new` (`(editeur)/client-new/actions.ts`, qui insère bien dans `clients` + `personnes` + `dossiers`) **n'apparaissent pas** dans « Mes clients » ingénieur, puisque cette page lit `clients.ts` (hardcodé) et non la table. Inversement, ces clients réels remontent côté dirigeant (via `dossiers`). La divergence va donc dans les deux sens.

### 1.4 SOURCE UNIQUE proposée

**Aligner l'ingénieur sur ce que lit déjà le dirigeant** : les tables `clients` + `personnes` + `dossiers` + `souscriptions` + `commissions`, filtrées par `tenant_id`/`cabinet_id` et (pour l'ingénieur) par `dossiers.engineer_id = ctx.userId`.

Mapping écran ingénieur → tables (source unique) :

| Donnée affichée côté ingénieur | Source unique (table.colonne) |
|---|---|
| Liste « Mes clients » | `clients` ⨝ `personnes` ⨝ `dossiers` (filtre `engineer_id = ctx.userId`) |
| Identité du foyer (régime, mariage, enfants, adresse) | `clients.household_type / marital_regime / marriage_date / nb_children / household_address` |
| Personnes (nom, naissance, profession, revenus, contact) | `personnes.*` (1 ou 2 lignes, `role_in_household` = `person_a`/`person_b`) |
| Date 1ʳᵉ étude / dernière interaction / statut | `dossiers.pipeline_entry_date / last_activity_at / pipeline_stage` |
| CA généré par client | `commissions` ⨝ `souscriptions` (par `client_id`) — **même calcul que le dirigeant** |
| Patrimoine sous gestion (assets) | `souscriptions.amount_initial` agrégé (réutiliser `computeAumByCategory` / `computeAumByAssetClass` du dirigeant) |
| Contrats / répartition par axe | `souscriptions` ⨝ `produits.category` |

**Pourquoi cette table et pas une nouvelle** : `clients`/`personnes` existent déjà, le dirigeant les agrège déjà, le wizard `client-new` les alimente déjà, et `_data/dossiers.ts` les joint déjà côté ingénieur. La source unique est donc « déjà là » — il manque juste de **rebrancher 3 fichiers `_data` ingénieur** (`clients.ts`, `fiche-client.ts`, `assets*.ts`) dessus, comme `dossiers.ts` le fait, au lieu de renvoyer des constantes.

### 1.5 Plan de convergence (ingénieur seulement)

Phase A — Liste clients
1. Réécrire `(ingenieur)/_data/clients.ts` : remplacer la constante `CLIENTS[]` par une lecture Supabase `clients ⨝ personnes ⨝ dossiers`, filtrée `tenant_id`/`cabinet_id`/`engineer_id = ctx.userId`. Garder la **forme du type `Client`** (slug, initiales, nom, details, type, dates, CA, statut) pour ne pas toucher au visuel ni à `ClientsTable.tsx`. `slug` = `clients.id` (UUID) au lieu du slug littéral.
2. CA généré par client : réutiliser la logique commissions du dirigeant (extraire les helpers purs de `(dirigeant)/_data/cabinet.ts` dans un module partagé `src/lib/...`, ou dupliquer le calcul côté ingénieur sans importer le dirigeant pour respecter le cloisonnement de session).
3. KPI (clients actifs, répartition PP/PM, ticket moyen) : dériver des lignes réelles, plus de valeurs en dur.
4. `force-dynamic` est déjà posé → pas de cache à invalider.

Phase B — Assets
5. `(ingenieur)/_data/assets.ts` (+ `assets-financier/assurance/immobilier/honoraires.ts`) : dériver l'AUM, le nb de contrats et la répartition de `souscriptions` ⨝ `produits` (mêmes agrégats que le dirigeant), filtrés sur les dossiers de l'ingénieur.

Phase C — Fiche client (voir Sujet 2 pour l'édition).

Garde-fou : conserver le **dégradé propre** déjà en place (`if (!SUPABASE_SERVICE_ROLE_KEY) return []`), pour ne pas casser les previews sans base.

---

## SUJET 2 — Rendre la fiche client ingénieur éditable et persistée

### 2.1 État actuel

`clients/[id]/page.tsx` est un **Server Component en lecture seule** qui appelle `getFicheClient(id)` → renvoie `FICHE_CLIENT_MODELE` (constante). Pour tout slug ≠ `dupont-topin`, seule l'**en-tête** (hero) est réécrite à partir de `clients.ts` ; régime, personnes, historique, documents, RDV restent les **données d'exemple** (le bandeau « Fiche client modèle » l'annonce). **Rien n'est éditable, rien n'est persisté.**

### 2.2 Table cible

**Oui, la table `clients` existe** (+ `personnes`). C'est elle qu'il faut éditer. Pas besoin de nouvelle table.

- **`clients`** (le foyer) — champs éditables de la fiche :
  - `household_type` (enum : `couple_marie`, `couple_pacs`, `celibataire`, `divorce`, `veuf`)
  - `marital_regime` (enum : `communaute_reduite_acquets`, `communaute_universelle`, `separation_biens`, `participation_aux_acquets`)
  - `marriage_date` (DATE)
  - `household_address` (TEXT)
  - `nb_children`, `nb_dependents` (INT)
  - `tax_residency` (TEXT)
  - `acquisition_origin` (enum)
- **`personnes`** (1 ligne `person_a`, optionnellement 1 ligne `person_b`) :
  - `first_name`, `last_name`, `birth_name`, `birth_date`, `birth_city`, `nationality`
  - `profession`, `employer`, `employment_status` (enum), `tmi_estimated`
  - `phone`, `email`

> Le « Patrimoine commun » (gold) et l'historique investissements sont **dérivés** de `souscriptions` : ils restent **lecture seule** (édités via le parcours souscription, pas via la fiche). On ne rend éditable que l'**identité du foyer + les personnes**.

### 2.3 Lecture (préalable à l'édition)

Créer une fonction `getFicheClient(clientId)` qui lit réellement :
```
clients ( household_type, marital_regime, marriage_date, household_address,
          nb_children, nb_dependents, tax_residency, acquisition_origin,
          personnes ( role_in_household, first_name, last_name, birth_date,
                      profession, employer, employment_status, tmi_estimated,
                      phone, email ) )
  .eq("id", clientId).eq("tenant_id", ctx.tenantId).eq("cabinet_id", ctx.cabinetId)
```
Vérifier que le `clientId` appartient bien au cabinet/ingénieur (sécurité tenant). Conserver le type `FicheClient` mais l'alimenter depuis la base ; supprimer le bandeau « modèle » une fois branché.

### 2.4 Formulaire (composant client)

Nouveau composant `clients/[id]/FicheClientInteractive.tsx` (`"use client"`), sur le modèle de `prospects/[id]/FicheProspectInteractive.tsx` / `conformite/[id]/FicheConformiteInteractive.tsx` qui existent déjà :
- Mode lecture par défaut (rendu identique au visuel actuel — **ne pas redesigner**).
- Bouton « Modifier » → passe les blocs « Régime de l'union » et « Personnes » en champs éditables (inputs / `<select>` pour les enums, `type="date"` pour les dates).
- Bouton « Enregistrer » → `useTransition` + appel de la Server Action ; toast de confirmation ; « Annuler » restaure les valeurs serveur.
- Les `<select>` d'enum utilisent **les valeurs DB exactes** (cf. 2.2) avec des libellés FR (réutiliser/poser une map label comme `USER_ROLE_LABELS`).

### 2.5 Server Action d'update

Nouveau fichier `clients/[id]/actions.ts` (`"use server"`), modèle = `prospects/[id]/actions.ts` :

```ts
"use server";
import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type UpdateFicheClientInput = {
  clientId: string;
  foyer: {
    household_type: string;
    marital_regime: string | null;
    marriage_date: string | null;     // ISO yyyy-mm-dd
    household_address: string | null;
    nb_children: number;
    nb_dependents: number;
    tax_residency: string | null;
    acquisition_origin: string | null;
  };
  personnes: Array<{
    role_in_household: "person_a" | "person_b";
    first_name: string;
    last_name: string;
    birth_date: string | null;
    profession: string | null;
    employer: string | null;
    employment_status: string | null;
    tmi_estimated: number | null;
    phone: string | null;
    email: string | null;
  }>;
};

export async function updateFicheClient(input: UpdateFicheClientInput) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: true, persisted: false, message: "Aperçu : modifications non persistées (base non configurée)." };
  }
  const ctx = await getSessionContext();
  if (!ctx) return { ok: false, persisted: false, message: "Session expirée." };

  const supabase = createAdminClient();

  // 1) Garde tenant : le client doit appartenir au cabinet courant.
  const { data: owned } = await supabase
    .from("clients")
    .select("id")
    .eq("id", input.clientId)
    .eq("tenant_id", ctx.tenantId)
    .eq("cabinet_id", ctx.cabinetId)
    .maybeSingle();
  if (!owned) return { ok: false, persisted: false, message: "Client introuvable." };

  // 2) Update foyer
  const { error: eClient } = await supabase
    .from("clients")
    .update({ ...input.foyer, updated_at: new Date().toISOString() })
    .eq("id", input.clientId);
  if (eClient) return { ok: false, persisted: false, message: "Échec mise à jour foyer." };

  // 3) Upsert personnes (clé naturelle UNIQUE (client_id, role_in_household))
  for (const p of input.personnes) {
    const { error } = await supabase
      .from("personnes")
      .upsert(
        { client_id: input.clientId, ...p, updated_at: new Date().toISOString() },
        { onConflict: "client_id,role_in_household" },
      );
    if (error) return { ok: false, persisted: false, message: "Échec mise à jour personnes." };
  }

  revalidatePath(`/espace-ingenieur/clients/${input.clientId}`);
  revalidatePath(`/espace-ingenieur/clients`);
  return { ok: true, persisted: true, message: "Fiche client enregistrée." };
}
```

Points clés :
- **Contrainte naturelle** `personnes UNIQUE (client_id, role_in_household)` → `upsert(onConflict)` gère création (foyer passé de seul à couple) ou mise à jour sans doublon.
- **Garde tenant/cabinet** systématique avant écriture (cohérent avec le reste du code et la règle de cloisonnement multi-tenant).
- **Dégradé sans base** : renvoie un succès « non persisté » plutôt qu'un bouton mort, comme `sendProspectDoc`.
- **`revalidatePath`** sur la fiche et la liste pour que l'édition se reflète immédiatement côté ingénieur — et, comme on lit désormais la même base, **côté dirigeant aussi** (convergence du Sujet 1).

### 2.6 Champs éditables — récapitulatif

Foyer (`clients`) : type de foyer · régime matrimonial · date de mariage · adresse · nb enfants · nb personnes à charge · résidence fiscale · origine d'acquisition.
Personne A / B (`personnes`) : prénom · nom · nom de naissance · date de naissance · nationalité · profession · employeur · statut pro · TMI estimée · téléphone · e-mail.
Lecture seule (dérivé `souscriptions`/`commissions`/`dossiers`/`rdv`) : patrimoine commun, historique d'accompagnement, documents signés, CA généré, RDV.

### 2.7 Fichiers à créer / modifier (ingénieur uniquement)

- **Modifier** `(ingenieur)/_data/fiche-client.ts` → `getFicheClient` lit Supabase (clients ⨝ personnes), supprime le fallback « modèle ».
- **Créer** `(ingenieur)/espace-ingenieur/clients/[id]/actions.ts` → `updateFicheClient`.
- **Créer** `(ingenieur)/espace-ingenieur/clients/[id]/FicheClientInteractive.tsx` → formulaire lecture/édition (visuel inchangé).
- **Modifier** `(ingenieur)/espace-ingenieur/clients/[id]/page.tsx` → passe les données serveur au composant interactif, retire le bandeau « modèle ».
- **(Sujet 1)** `(ingenieur)/_data/clients.ts` et `assets*.ts` → lecture Supabase.

Aucune modification dans `(dirigeant)`, `(editeur)`, `(marque)`. Aucune migration DB nécessaire : `clients`/`personnes` et leurs enums existent déjà.
