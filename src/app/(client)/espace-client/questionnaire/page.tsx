import Link from "next/link";

import { CLIENT_BASE } from "@/app/(client)/_components/nav";
import { getClientContext, fetchClientDci } from "@/app/(client)/_data/client";
import QuestionnaireClient from "./QuestionnaireClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Mon questionnaire",
};

// =========================================================================
// Page "Mon questionnaire (DCI)" — Server Component.
//
// Résout le scope du client connecté (getClientContext) et lit son DCI réel
// (fetchClientDci, 1-1 dossier). Les réponses pré-remplies + le dossierId sont
// passés en props au sous-composant interactif "use client", qui enregistre
// chaque rubrique via la server action saveDciCategory.
//
// État vide honnête : si aucun dossier n'est rattaché au compte, on affiche un
// message clair plutôt qu'un faux formulaire (ZÉRO donnée fictive).
// =========================================================================

export default async function QuestionnairePage() {
  const ctx = await getClientContext();

  // Pas de dossier résolu → état vide honnête, pas de formulaire fantôme.
  if (!ctx) {
    return (
      <div className="py-10">
        <Header />
        <EmptyState />
      </div>
    );
  }

  const dci = await fetchClientDci();

  // Map clé de catégorie → { responses, completionPct } pour le pré-remplissage.
  const byCategory: Record<string, { responses: Record<string, unknown>; completionPct: number }> = {};
  for (const c of dci.categories) {
    byCategory[c.key] = {
      responses: c.responses,
      completionPct: dci.completionByCat[c.key] ?? 0,
    };
  }

  return (
    <div className="py-2">
      <Header />
      <QuestionnaireClient
        dossierId={ctx.dossierId}
        status={dci.status}
        byCategory={byCategory}
        simplifiedCompletedAt={dci.simplifiedCompletedAt}
        fullValidatedAt={dci.fullValidatedAt}
        signedAt={dci.signedAt}
      />
    </div>
  );
}

function Header() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex items-center gap-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)]">
        <span className="h-px w-7 bg-[var(--gold)] opacity-50" />
        Document de collecte
        <span className="h-px w-7 bg-[var(--gold)] opacity-50" />
      </div>
      <h1 className="font-serif text-[40px] font-medium leading-[1.1] tracking-tight text-[var(--navy)]">
        Mon questionnaire
      </h1>
      <p className="mx-auto mt-3 max-w-[560px] text-[14.5px] leading-relaxed text-[var(--navy-300)]">
        Renseignez votre situation à votre rythme. Chaque rubrique est enregistrée
        indépendamment&nbsp;: vous pouvez revenir à tout moment compléter ou corriger vos réponses.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-[640px] rounded-[16px] border border-[var(--gold-200)] bg-white px-12 py-14 text-center shadow-sm">
      <div className="mx-auto mb-6 h-px w-20 bg-[var(--gold)]" />
      <h2 className="font-serif text-[26px] font-medium italic text-[var(--navy)]">
        Votre questionnaire n&apos;est pas encore disponible
      </h2>
      <p className="mx-auto mt-4 max-w-[460px] text-[14px] leading-relaxed text-[var(--navy-300)]">
        Aucun dossier n&apos;est rattaché à votre compte pour le moment. Votre conseiller
        l&apos;activera dès la prise de contact. Vous serez alors invité à compléter ce
        document en toute confidentialité.
      </p>
      <Link
        href={CLIENT_BASE}
        className="mt-8 inline-flex items-center gap-2 rounded-[9px] border border-[var(--navy-100)] px-6 py-3 text-[11.5px] font-bold uppercase tracking-[0.18em] text-[var(--navy)] transition-colors hover:border-[var(--navy)] hover:bg-[var(--ivory)]"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
