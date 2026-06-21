// Module SERVEUR de l'axe « Investissement financier ». Importe le fetcher
// Supabase (assets-source) et le builder pur (assets-financier-pure), dérive
// l'écran depuis les vraies souscriptions de l'ingénieur, et se replie sur la
// maquette si la base est vide. Importé uniquement par la page serveur.
//
// Les types/libellés/CSV vivent dans `assets-financier-pure.ts` et sont
// ré-exportés ici pour la page ; les composants client importent le pur.

import { fetchEngineerSubscriptions } from "./assets-source";
import {
  buildFinancierScreen,
  FALLBACK_FINANCIER,
  financierSubscriptions,
  type AssetsFinancierScreen,
} from "./assets-financier-pure";

export type {
  AssetsFinancierScreen,
  FinancierClient,
  FinancierTotal,
  FinancierKpi,
  CompareCell,
  CompareDirection,
  TopProduct,
} from "./assets-financier-pure";

/**
 * Écran « investissement financier » de l'ingénieur connecté. Lit les vraies
 * souscriptions ; si aucune souscription financière, renvoie la maquette
 * (FALLBACK) pour conserver un écran riche en aperçu / base vide.
 */
export async function getAssetsFinancierScreen(): Promise<AssetsFinancierScreen> {
  const subs = await fetchEngineerSubscriptions();
  if (financierSubscriptions(subs).length === 0) return FALLBACK_FINANCIER;
  return buildFinancierScreen(subs);
}
