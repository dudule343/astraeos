import Link from "next/link";

import "@/app/parcours/_styles/qualification.css";
import { CLIENT_BASE } from "@/app/(client)/_components/nav";
import { getClientContext } from "@/app/(client)/_data/client";
import RisqueClient from "./RisqueClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Questionnaire de risque",
};

// Page "Questionnaire de risque" du portail client. Résout le client connecté
// (getClientContext) et lui fait remplir le profil de risque, rattaché à son
// dossier via saveRiskProfile. État vide honnête si aucun dossier rattaché.
export default async function QuestionnaireRisquePage() {
  const ctx = await getClientContext();

  if (!ctx) {
    return (
      <div className="py-10" style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-cinzel, serif)", marginBottom: 12 }}>
          Questionnaire de risque
        </h1>
        <p style={{ color: "#5b6472", marginBottom: 20 }}>
          Aucun dossier n&apos;est encore rattaché à votre compte. Votre ingénieur
          patrimonial l&apos;activera après votre premier échange.
        </p>
        <Link href={CLIENT_BASE} style={{ color: "#C68E0E", fontWeight: 600 }}>
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const displayName = `${ctx.firstName} ${ctx.lastName}`.trim();

  return <RisqueClient dossierId={ctx.dossierId} displayName={displayName} />;
}
