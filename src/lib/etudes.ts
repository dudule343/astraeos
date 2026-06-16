export type EtudeStatus =
  | "draft"
  | "in_progress"
  | "delivered"
  | "updated_in_progress"
  | "archived";

export type EtudePhaseKey =
  | "phase_1_bilan"
  | "phase_2_strategies"
  | "phase_3_synthese"
  | "phase_4_frise"
  | "phase_5_mise_en_forme"
  | "completed";

/** Les 5 phases de production d'une étude patrimoniale, dans l'ordre. */
export const ETUDE_PHASES: { key: EtudePhaseKey; num: number; label: string; desc: string }[] = [
  { key: "phase_1_bilan", num: 1, label: "Bilan patrimonial", desc: "Consolidation des actifs, passifs et flux du foyer." },
  { key: "phase_2_strategies", num: 2, label: "Stratégies", desc: "Construction des stratégies patrimoniales adaptées." },
  { key: "phase_3_synthese", num: 3, label: "Synthèse", desc: "Synthèse des recommandations et de leurs impacts." },
  { key: "phase_4_frise", num: 4, label: "Frise patrimoniale", desc: "Projection dans le temps des décisions retenues." },
  { key: "phase_5_mise_en_forme", num: 5, label: "Mise en forme", desc: "Production des livrables (PDF complet, synthèse)." },
];

export const STATUS_LABELS: Record<EtudeStatus, string> = {
  draft: "Brouillon",
  in_progress: "En cours",
  delivered: "Restituée",
  updated_in_progress: "Mise à jour en cours",
  archived: "Archivée",
};

export type Etude = {
  id: string;
  dossier_id: string;
  version: number;
  status: EtudeStatus;
  current_phase: EtudePhaseKey | null;
  phase_progress_pct: number | null;
  delivered_at: string | null;
};

/** Index (0-4) de la phase courante ; -1 si pas démarrée, 5 si terminée. */
export function phaseIndex(phase: EtudePhaseKey | null): number {
  if (!phase) return -1;
  if (phase === "completed") return ETUDE_PHASES.length;
  return ETUDE_PHASES.findIndex((p) => p.key === phase);
}

export type PhaseState = "done" | "current" | "todo";

/** État d'affichage d'une phase donnée selon la phase courante de l'étude. */
export function phaseState(current: EtudePhaseKey | null, phaseNum: number): PhaseState {
  const idx = phaseIndex(current); // -1..5 (5 = completed)
  // idx = index de la phase EN COURS. Les phases d'index < idx sont faites.
  if (idx >= ETUDE_PHASES.length) return "done"; // étude terminée
  if (phaseNum - 1 < idx) return "done";
  if (phaseNum - 1 === idx) return "current";
  return "todo";
}

/** Progression % calculée à partir de la phase courante (si pct absent). */
export function progressFromPhase(current: EtudePhaseKey | null, pct: number | null): number {
  if (typeof pct === "number" && pct > 0) return pct;
  const idx = phaseIndex(current);
  if (idx < 0) return 0;
  if (idx >= ETUDE_PHASES.length) return 100;
  return Math.round((idx / ETUDE_PHASES.length) * 100);
}

/** Phase suivante dans le cycle (la dernière mène à "completed"). */
export function nextPhase(current: EtudePhaseKey | null): EtudePhaseKey {
  const idx = phaseIndex(current);
  if (idx < 0) return ETUDE_PHASES[0].key; // pas démarrée → phase 1
  if (idx >= ETUDE_PHASES.length - 1) return "completed"; // dernière phase → terminée
  return ETUDE_PHASES[idx + 1].key;
}
