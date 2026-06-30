import Link from "next/link";

import { getEtudePatrimoniale } from "../../../_data/etudes-patrimoniales-server";
import {
  formatEtudeDate,
  householdNameFromDonnees,
  statutLabel,
  type EtudeDonnees,
} from "../../../_data/etudes-patrimoniales";
import "../../../_styles/etude-audit.css";

import { Bloc } from "./Bloc";
import EtudeAuditClient, { type SectionInput } from "./EtudeAuditClient";
import { AUDIT_SECTIONS, INGENIERIE_TODO, TOC_ENTRIES, type AuditSection } from "./etude-audit-structure";
import { IntroductionSection } from "./sections/introduction";
import { SituationFoyer } from "./sections/situation";
import ObjectifsSection from "./sections/objectifs";
import PatrimoineSynthese from "./sections/patrimoine-synthese";
import PatrimoineImmobilier from "./sections/patrimoine-immobilier";
import PatrimoineFinancier from "./sections/patrimoine-financier";
import PatrimoinePassif from "./sections/patrimoine-passif";
import PatrimoineConclusion from "./sections/patrimoine-conclusion";
import BudgetSection from "./sections/budget";
import RetraiteSection from "./sections/retraite";
import FiscaliteSection from "./sections/fiscalite";
import SocietesSection from "./sections/societes";
import AssurancesSection from "./sections/assurances";
import MatrimonialSection from "./sections/matrimonial";
import SuccessoralSection from "./sections/successoral";
import RisquesSection from "./sections/risques";

export const metadata = {
  title: "ASTRAEOS · Document d'audit",
};

export const dynamic = "force-dynamic";

const LISTE = "/espace-ingenieur/etudes-patrimoniales";

/** Sous-titre honnête de la page de garde, dérivé du statut de l'étude. */
function coverSousTitre(statut: string, updatedAt: string | null): string {
  if (statut === "restituee") {
    return `Restituée le ${formatEtudeDate(updatedAt)}`;
  }
  return `Document de travail · ${statutLabel(statut)}`;
}

/** Corps d'une section : composant dédié si rédigé, sinon emplacement honnête. */
function sectionBody(s: AuditSection, donnees: EtudeDonnees) {
  switch (s.id) {
    case "introduction":
      return <IntroductionSection />;
    case "situation":
      return <SituationFoyer donnees={donnees} />;
    case "objectifs":
      return <ObjectifsSection donnees={donnees} />;
    // « Analyse du patrimoine » : une seule entrée de sommaire, mais cinq
    // sous-modules empilés (synthèse, immobilier, financier, passif, conclusion).
    case "patrimoine":
      return (
        <>
          <PatrimoineSynthese donnees={donnees} />
          <PatrimoineImmobilier donnees={donnees} />
          <PatrimoineFinancier donnees={donnees} />
          <PatrimoinePassif donnees={donnees} />
          <PatrimoineConclusion donnees={donnees} />
        </>
      );
    case "budget":
      return <BudgetSection donnees={donnees} />;
    case "retraite":
      return <RetraiteSection donnees={donnees} />;
    case "fiscalite":
      return <FiscaliteSection donnees={donnees} />;
    case "societes":
      return <SocietesSection donnees={donnees} />;
    case "assurances":
      return <AssurancesSection donnees={donnees} />;
    case "matrimonial":
      return <MatrimonialSection donnees={donnees} />;
    case "successoral":
      return <SuccessoralSection donnees={donnees} />;
    case "risques":
      return <RisquesSection donnees={donnees} />;
    default:
      return sectionSlot(s.title);
  }
}

/** Emplacement honnête d'une section non encore rédigée (slot validable). */
function sectionSlot(title: string) {
  return (
    <Bloc blocKey={title} className="sect-slot">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
      <span>
        <b>Section à compléter.</b> Le contenu de « {title} » sera rédigé dans cette étude, puis
        relu et validé bloc par bloc.
      </span>
    </Bloc>
  );
}

export default async function EtudeAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const etude = await getEtudePatrimoniale(id);

  if (!etude) {
    return (
      <div className="px-10 py-8">
        <div className="maq-etude-missing">
          <h1>Étude introuvable</h1>
          <p>
            Cette étude patrimoniale n&apos;existe pas, n&apos;est pas rattachée à votre cabinet, ou
            la base n&apos;est pas configurée. Aucune donnée n&apos;est affichée pour rester fidèle à
            la réalité.
          </p>
          <Link className="btn btn-gold btn-sm" href={LISTE}>
            Retour aux études patrimoniales
          </Link>
        </div>
      </div>
    );
  }

  const clientNom = householdNameFromDonnees(etude.donnees);

  const noms = etude.donnees.foyer.personnes
    .map((p) => `${(p.prenom ?? "").trim()} ${(p.nom ?? "").trim()}`.trim())
    .filter(Boolean);

  const sections: SectionInput[] = AUDIT_SECTIONS.map((s) => ({
    id: s.id,
    tag: "Audit patrimonial",
    title: s.title,
    body: sectionBody(s, etude.donnees),
  }));

  return (
    <EtudeAuditClient
      etudeId={etude.id}
      clientNom={clientNom}
      cover={{
        titre: "Étude Patrimoniale",
        sousTitre: coverSousTitre(etude.statut, etude.updatedAt),
        noms,
      }}
      sommaire={AUDIT_SECTIONS}
      todo={INGENIERIE_TODO}
      toc={TOC_ENTRIES}
      blocs={etude.blocs}
      sections={sections}
    />
  );
}
