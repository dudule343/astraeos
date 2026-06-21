/* =========================================================================
 * Décodage du profil de risque côté ingénieur.
 *
 * Le questionnaire /parcours/qualification persiste ses réponses dans
 * `dci_submissions` (kind='qualification'). Le payload stocke des INDEX de
 * radio (position dans les tableaux d'options de data.ts) plutôt que des
 * libellés. Ce module retraduit ces index en libellés lisibles et calcule un
 * profil synthétique (Prudent / Équilibré / Dynamique / Offensif) à partir des
 * réponses de risque.
 *
 * Forme du payload (cf. Questionnaire.tsx › submitForm) :
 *   {
 *     reponses: {                 // Record<string, number>, par groupe radio
 *       "auto-eval": 0..3,
 *       horizon:     0..2,
 *       profile:     0..2,
 *       tolerance:   0..2,
 *       reaction:    0..3,
 *       curve:       0..6,        // index dans CURVES
 *       esg:         0 | 1,       // 0 = Oui (ESG actif), 1 = Non
 *       "esg-eq":    0..2,        // arbitrage performance / impact (si ESG actif)
 *     },
 *     esgPrivilegier: boolean[],  // aligné sur ESG_PRIVILEGIER
 *     esgEviter:      boolean[],  // aligné sur ESG_EVITER
 *     certifie:       boolean,
 *   }
 * ========================================================================= */

import {
  AUTO_EVAL,
  HORIZON,
  PROFILE,
  TOLERANCE,
  REACTION,
  CURVES,
  ESG_EQUILIBRE,
  ESG_PRIVILEGIER,
  ESG_EVITER,
} from "@/app/parcours/qualification/data";

export type RiskAnswer = { question: string; answer: string };

export type RiskProfile = {
  answers: RiskAnswer[];
  profileLabel: string;
  horizonLabel: string | null;
  esg: { actif: boolean; privilegier: string[]; eviter: string[] };
  certifie: boolean;
};

/** Récupère le libellé d'une option `{ label }` à l'index donné, sinon null. */
function labelAt(options: { label: string }[], index: unknown): string | null {
  if (typeof index !== "number" || !Number.isInteger(index)) return null;
  return options[index]?.label ?? null;
}

/** Normalise un index de réponse sur 0..1 selon le nombre d'options du groupe. */
function normalized(index: unknown, optionCount: number): number | null {
  if (typeof index !== "number" || !Number.isInteger(index)) return null;
  if (optionCount <= 1) return null;
  const clamped = Math.min(Math.max(index, 0), optionCount - 1);
  return clamped / (optionCount - 1);
}

/**
 * Profil synthétique à partir des réponses de risque (profile / tolerance /
 * reaction / curve). On normalise chaque réponse sur 0..1 (0 = le plus prudent,
 * 1 = le plus offensif), on moyenne les réponses présentes, puis on découpe en
 * quatre quartiles. Choix documenté : seuils à 0,25 / 0,50 / 0,75.
 */
function computeProfileLabel(reponses: Record<string, unknown>): string | null {
  const scores = [
    normalized(reponses.profile, PROFILE.length),
    normalized(reponses.tolerance, TOLERANCE.length),
    normalized(reponses.reaction, REACTION.length),
    normalized(reponses.curve, CURVES.length),
  ].filter((s): s is number => s !== null);

  if (scores.length === 0) return null;

  const moyenne = scores.reduce((acc, s) => acc + s, 0) / scores.length;
  if (moyenne < 0.25) return "Prudent";
  if (moyenne < 0.5) return "Équilibré";
  if (moyenne < 0.75) return "Dynamique";
  return "Offensif";
}

export function decodeRiskProfile(
  payload: Record<string, unknown> | null | undefined,
): RiskProfile | null {
  if (!payload || typeof payload !== "object") return null;

  const reponses = (payload.reponses ?? null) as Record<string, unknown> | null;
  if (!reponses || typeof reponses !== "object") return null;

  const answers: RiskAnswer[] = [];
  const push = (
    question: string,
    options: { label: string }[],
    key: string,
  ) => {
    const answer = labelAt(options, reponses[key]);
    if (answer) answers.push({ question, answer });
  };

  push("Auto-évaluation des connaissances", AUTO_EVAL, "auto-eval");
  push("Horizon d'investissement", HORIZON, "horizon");
  push("Approche d'investissement", PROFILE, "profile");
  push("Tolérance au risque", TOLERANCE, "tolerance");
  push("Réaction à une baisse", REACTION, "reaction");
  push("Arbitrage performance / impact", ESG_EQUILIBRE, "esg-eq");

  const profileLabel = computeProfileLabel(reponses);
  if (answers.length === 0 && !profileLabel) return null;

  const horizonLabel = labelAt(HORIZON, reponses.horizon);

  // L'ESG est actif quand la réponse au groupe `esg` est « Oui » (index 0).
  const esgActif = reponses.esg === 0;
  const esgPrivilegier = Array.isArray(payload.esgPrivilegier)
    ? (payload.esgPrivilegier as unknown[])
        .map((v, i) => (v === true ? ESG_PRIVILEGIER[i] : null))
        .filter((v): v is string => typeof v === "string")
    : [];
  const esgEviter = Array.isArray(payload.esgEviter)
    ? (payload.esgEviter as unknown[])
        .map((v, i) => (v === true ? ESG_EVITER[i] : null))
        .filter((v): v is string => typeof v === "string")
    : [];

  return {
    answers,
    profileLabel: profileLabel ?? "Non déterminé",
    horizonLabel,
    esg: { actif: esgActif, privilegier: esgPrivilegier, eviter: esgEviter },
    certifie: payload.certifie === true,
  };
}
