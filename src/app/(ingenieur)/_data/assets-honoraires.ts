// Module SERVEUR de l'axe « Honoraires de conseil ». Importe le fetcher Supabase
// (commissions study_fee) et le builder pur, dérive l'écran depuis les vraies
// commissions de l'ingénieur, se replie sur la maquette si la base est vide.
// Importé par la page serveur uniquement.

import { fetchEngineerStudyFees } from "./assets-source";
import {
  buildHonorairesScreen,
  FALLBACK_HONORAIRES,
  type AssetsHonorairesScreen,
} from "./assets-honoraires-pure";

export type {
  AssetsHonorairesScreen,
  HonorairesKpi,
  EtudeMission,
  RepartitionMission,
  HonorairesTotal,
} from "./assets-honoraires-pure";

/**
 * Écran « honoraires de conseil » de l'ingénieur connecté. Lit les commissions
 * study_fee réelles ; si aucune, renvoie la maquette (FALLBACK).
 */
export async function getAssetsHonoraires(): Promise<AssetsHonorairesScreen> {
  const fees = await fetchEngineerStudyFees();
  if (fees.length === 0) return FALLBACK_HONORAIRES;
  return buildHonorairesScreen(fees);
}
