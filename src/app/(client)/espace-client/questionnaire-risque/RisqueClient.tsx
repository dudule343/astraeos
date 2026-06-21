"use client";

// Questionnaire de risque rempli par le CLIENT depuis son espace.
// Réutilise l'UI du questionnaire du parcours (même rendu 1:1 que la maquette)
// mais enregistre via la server action saveRiskProfile, rattachée au dossier.

import { saveRiskProfile } from "@/app/(client)/actions";
import Questionnaire, {
  type RiskAnswers,
} from "@/app/parcours/qualification/Questionnaire";

export default function RisqueClient({
  dossierId,
  displayName,
}: {
  dossierId: string;
  displayName: string;
}) {
  return (
    <div className="maq-qualification">
      <Questionnaire
        onSubmitAnswers={async (answers: RiskAnswers) => {
          await saveRiskProfile(
            dossierId,
            displayName,
            answers as unknown as Record<string, unknown>,
          );
        }}
      />
    </div>
  );
}
