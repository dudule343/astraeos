// Module SERVEUR : vue d'ensemble des assets du portefeuille de l'ingénieur.
// Dérive l'AUM, le nombre de contrats et la répartition par axe des vraies
// souscriptions de l'ingénieur (mêmes agrégats que le dirigeant : AUM =
// somme amount_initial par classe d'actifs), plus les honoraires study_fee.
// Se replie sur la maquette v28 si la base est vide. Importé par la page serveur
// (les types sont ré-exportés du module pur pour la page).

import { fetchEngineerStudyFees, fetchEngineerSubscriptions } from "./assets-source";
import {
  assetClassOf,
  formatAmountFr,
  isActiveSubscription,
  type AssetClass,
  type SubscriptionRow,
} from "./assets-pure";
import {
  buildOverview,
  FALLBACK_OVERVIEW,
  type AssetsOverview,
} from "./assets-overview-pure";

export type {
  AssetsOverview,
  SyntheseKpi,
  AxisCard,
  AxisStat,
  Trend,
} from "./assets-overview-pure";

function activeByClass(subs: SubscriptionRow[]): Map<AssetClass, SubscriptionRow[]> {
  const map = new Map<AssetClass, SubscriptionRow[]>();
  for (const s of subs) {
    if (!isActiveSubscription(s)) continue;
    const cls = assetClassOf(s);
    const arr = map.get(cls) ?? [];
    arr.push(s);
    map.set(cls, arr);
  }
  return map;
}

/**
 * Vue d'ensemble des assets de l'ingénieur connecté. Si aucune souscription
 * active, renvoie la maquette (FALLBACK) pour garder un écran riche en aperçu.
 */
export async function fetchAssetsOverview(): Promise<AssetsOverview> {
  const [subs, fees] = await Promise.all([
    fetchEngineerSubscriptions(),
    fetchEngineerStudyFees(),
  ]);

  const active = subs.filter(isActiveSubscription);
  if (active.length === 0 && fees.length === 0) return FALLBACK_OVERVIEW;

  return buildOverview({
    byClass: activeByClass(subs),
    studyFees: fees,
    formatAmount: formatAmountFr,
  });
}
