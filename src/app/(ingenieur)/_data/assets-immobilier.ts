// Module SERVEUR de l'axe « Investissement immobilier ». Importe le fetcher
// Supabase et le builder pur, dérive l'écran depuis les vraies souscriptions de
// l'ingénieur, se replie sur la maquette si la base est vide. Importé par la
// page serveur uniquement.

import { fetchEngineerSubscriptions } from "./assets-source";
import {
  buildImmoScreen,
  FALLBACK_IMMO,
  immoSubscriptions,
  type AssetsImmoScreen,
} from "./assets-immobilier-pure";

export type {
  AssetsImmoScreen,
  AssetsImmoKpi,
  KpiCompareCell,
  ImmoProjectRow,
  ImmoProjectsTotal,
  ProgramBreakdown,
} from "./assets-immobilier-pure";

/**
 * Écran « immobilier » de l'ingénieur connecté. Lit les vraies souscriptions ;
 * si aucune souscription immobilière, renvoie la maquette (FALLBACK).
 */
export async function getAssetsImmobilier(): Promise<AssetsImmoScreen> {
  const subs = await fetchEngineerSubscriptions();
  if (immoSubscriptions(subs).length === 0) return FALLBACK_IMMO;
  return buildImmoScreen(subs);
}
