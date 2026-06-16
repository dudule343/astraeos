/**
 * Catalogue assemblé — concatène les ENTRIES des 11 fichiers catégorie.
 *
 * Source de vérité unique du moteur de collecte conditionnelle. Chaque fichier
 * catégorie (un par thème du référentiel) exporte `ENTRIES: CatalogEntry[]` ;
 * on les regroupe ici dans l'ordre métier des rubriques.
 *
 * Ne pas importer types.ts / index.ts / le moteur ici : ce module n'agrège que
 * des catalogues de pièces.
 */
import type { CatalogEntry, Facts } from "./types";

import { ENTRIES as identiteEtSituationFamiliale } from "./identite-et-situation-familiale";
import { ENTRIES as budget } from "./budget";
import { ENTRIES as fiscalite } from "./fiscalite";
import { ENTRIES as patrimoineProfessionnel } from "./patrimoine-professionnel";
import { ENTRIES as immobilier } from "./immobilier";
import { ENTRIES as actifsFinanciers } from "./actifs-financiers";
import { ENTRIES as passifsEtCreances } from "./passifs-et-creances";
import { ENTRIES as retraite } from "./retraite";
import { ENTRIES as mutuelleEtPrevoyance } from "./mutuelle-et-prevoyance";
import { ENTRIES as successionEtDonation } from "./succession-et-donation";
import { ENTRIES as informationsComplementaires } from "./informations-complementaires";

export const CATALOG: CatalogEntry[] = [
  ...identiteEtSituationFamiliale,
  ...budget,
  ...fiscalite,
  ...patrimoineProfessionnel,
  ...immobilier,
  ...actifsFinanciers,
  ...passifsEtCreances,
  ...retraite,
  ...mutuelleEtPrevoyance,
  ...successionEtDonation,
  ...informationsComplementaires,
];

/**
 * Prédicat d'inclusion d'une pièce selon la situation (sémantique ternaire
 * conservatrice). Réimplémenté ici — et NON importé du moteur — pour éviter
 * un cycle d'import (le moteur importe déjà CATALOG depuis ce module). Reste
 * strictement aligné sur `evaluateEntry` de collecte-engine.ts :
 *
 *   - aucune contrainte / always:true => toujours demandée ;
 *   - anyOf : au moins un fait pas explicitement false ;
 *   - allOf : aucun fait explicitement false ;
 *   - anyOf + allOf => ET logique.
 *
 * « pas faux » = true OU absent : on ne masque une pièce que si un fait
 * déclencheur est explicitement false.
 */
export function evaluateEntry(entry: CatalogEntry, facts: Facts): boolean {
  if (entry.always) return true;
  const hasAny = !!entry.anyOf?.length;
  const hasAll = !!entry.allOf?.length;
  if (!hasAny && !hasAll) return true;
  const anyOk = !hasAny || entry.anyOf!.some((k) => facts[k] !== false);
  const allOk = !hasAll || entry.allOf!.every((k) => facts[k] !== false);
  return anyOk && allOk;
}

/**
 * buildItems — sous-ensemble du CATALOG à demander pour une situation donnée.
 * Pur, sans réseau : toute bascule d'un fait peut le rappeler instantanément.
 * Sur un foyer vide (Facts={}), retourne l'intégralité du CATALOG.
 */
export function buildItems(facts: Facts): CatalogEntry[] {
  return CATALOG.filter((entry) => evaluateEntry(entry, facts));
}
