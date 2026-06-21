// Module SERVEUR de l'axe « Assurance ». Importe le fetcher Supabase et le
// builder pur, dérive l'écran depuis les vraies souscriptions de l'ingénieur,
// se replie sur la maquette si la base est vide. Importé par la page serveur.

import { fetchEngineerSubscriptions } from "./assets-source";
import {
  assuranceSubscriptions,
  buildAssuranceScreen,
  FALLBACK_ASSURANCE,
  type AssetsAssurance,
} from "./assets-assurance-pure";

export type {
  AssetsAssurance,
  AssuranceClient,
  AssuranceContract,
  AssuranceKpi,
  AssuranceComparePeriod,
  AssuranceTopProduct,
} from "./assets-assurance-pure";

/**
 * Écran « assurance » de l'ingénieur connecté. Lit les vraies souscriptions ;
 * si aucune souscription d'assurance, renvoie la maquette (FALLBACK).
 */
export async function getAssetsAssurance(): Promise<AssetsAssurance> {
  const subs = await fetchEngineerSubscriptions();
  if (assuranceSubscriptions(subs).length === 0) return FALLBACK_ASSURANCE;
  return buildAssuranceScreen(subs);
}
