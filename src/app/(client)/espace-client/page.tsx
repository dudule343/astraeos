import Link from "next/link";

import { KpiCard, type KpiBlock } from "../../(editeur)/_components/KpiCard";
import { PageHero, SectionHeader } from "../../(editeur)/_components/PageHeader";
import { ParcoursStepper } from "../../(editeur)/_components/ParcoursStepper";
import { CLIENT_BASE } from "../_components/nav";
import { fetchClientDossier, getClientContext, fmtDate } from "../_data/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Tableau de bord",
};

/** stageIndex 1..6 dérivé du pipeline_stage (`Number(stage.slice(0,2))`), borné. */
function stageIndexOf(pipelineStage: string): number {
  const n = Number(pipelineStage.slice(0, 2));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(6, n);
}

type NextAction = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

/**
 * Prochaine action recommandée — dérivée du vrai état du dossier :
 * pipeline_stage + dci_completion_pct + signaux (lettre de mission, étude
 * livrée, RDV de restitution). Jamais inventée : chaque branche pointe vers
 * une page réelle du parcours client.
 */
function nextActionFor(args: {
  stageIndex: number;
  dciCompletionPct: number;
  letterSigned: boolean;
  studyDelivered: boolean;
  restitutionDate: string | null;
}): NextAction {
  const { stageIndex, dciCompletionPct, letterSigned, studyDelivered, restitutionDate } = args;

  // Étude restituée / suivi → consulter le livrable et le suivi.
  if (studyDelivered || stageIndex >= 5) {
    return {
      eyebrow: "Votre étude est prête",
      title: "Consultez votre étude patrimoniale",
      description:
        "Votre ingénieur patrimonial a finalisé votre étude. Retrouvez le livrable et les prochaines échéances dans votre espace de suivi.",
      href: `${CLIENT_BASE}/suivi`,
      cta: "Voir mon étude",
    };
  }

  // Restitution planifiée → préparer le RDV.
  if (restitutionDate) {
    return {
      eyebrow: "Rendez-vous de restitution",
      title: "Préparez votre restitution",
      description: `Votre rendez-vous de restitution est planifié pour le ${fmtDate(
        restitutionDate,
      )}. Vérifiez que vos documents sont complets avant l'entretien.`,
      href: `${CLIENT_BASE}/suivi`,
      cta: "Préparer le rendez-vous",
    };
  }

  // Questionnaire entamé mais incomplet → le terminer.
  if (dciCompletionPct > 0 && dciCompletionPct < 100) {
    return {
      eyebrow: "Questionnaire en cours",
      title: "Terminez votre questionnaire",
      description:
        "Reprenez votre questionnaire patrimonial là où vous l'avez laissé. Chaque réponse aide votre ingénieur à préparer votre étude.",
      href: `${CLIENT_BASE}/questionnaire`,
      cta: "Reprendre le questionnaire",
    };
  }

  // Questionnaire complet, en attente de l'étude → déposer les pièces.
  if (dciCompletionPct >= 100) {
    return {
      eyebrow: "Pièces justificatives",
      title: "Complétez vos documents",
      description:
        "Votre questionnaire est complet. Déposez les pièces justificatives demandées pour permettre la réalisation de votre étude.",
      href: `${CLIENT_BASE}/documents`,
      cta: "Déposer mes documents",
    };
  }

  // Lettre de mission signée mais questionnaire non commencé.
  if (letterSigned) {
    return {
      eyebrow: "Première étape",
      title: "Commencez votre questionnaire",
      description:
        "Votre mission est confirmée. Commencez votre questionnaire patrimonial pour donner à votre ingénieur les éléments nécessaires à votre étude.",
      href: `${CLIENT_BASE}/questionnaire`,
      cta: "Commencer le questionnaire",
    };
  }

  // Par défaut (début de parcours) → démarrer le questionnaire.
  return {
    eyebrow: "Bienvenue",
    title: "Démarrez votre questionnaire",
    description:
      "Renseignez votre situation patrimoniale via un questionnaire guidé. Vous pouvez l'enregistrer et y revenir à tout moment.",
    href: `${CLIENT_BASE}/questionnaire`,
    cta: "Démarrer",
  };
}

const QUICK_LINKS: { href: string; eyebrow: string; label: string; hint: string }[] = [
  {
    href: `${CLIENT_BASE}/questionnaire`,
    eyebrow: "Étape 2",
    label: "Mon questionnaire",
    hint: "Renseignez votre situation patrimoniale",
  },
  {
    href: `${CLIENT_BASE}/documents`,
    eyebrow: "Étape 3",
    label: "Mes documents",
    hint: "Déposez et suivez vos pièces justificatives",
  },
  {
    href: `${CLIENT_BASE}/suivi`,
    eyebrow: "Étape 4",
    label: "Suivi & restitution",
    hint: "Avancement de votre étude et échéances",
  },
];

export default async function EspaceClientPage() {
  const ctx = await getClientContext();

  // État vide honnête : pas de session client / pas de dossier relié.
  if (!ctx) {
    return (
      <>
        <PageHero
          eyebrow="Espace client"
          title="Votre tableau de bord"
          description="Suivez ici l'avancement de votre accompagnement patrimonial."
        />
        <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
          <div className="mb-3 text-[34px] leading-none">🔒</div>
          <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
            Aucun dossier rattaché à votre compte
          </div>
          <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
            Votre espace s&apos;activera dès que votre ingénieur patrimonial aura ouvert votre
            dossier. Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez votre
            conseiller.
          </p>
        </section>
      </>
    );
  }

  const dossier = await fetchClientDossier();
  const pipelineStage = dossier?.pipelineStage ?? ctx.pipelineStage;
  const stageLabel = dossier?.pipelineStageLabel ?? ctx.pipelineStageLabel;
  const dciCompletionPct = Math.round(dossier?.dciCompletionPct ?? ctx.dciCompletionPct);
  const stageIndex = stageIndexOf(pipelineStage);

  const letterSigned = Boolean(dossier?.letterOfMissionSignedAt);
  const studyDelivered = Boolean(dossier?.studyDeliveredAt);
  const restitutionDate = dossier?.restitutionMeetingDate ?? null;

  const action = nextActionFor({
    stageIndex,
    dciCompletionPct,
    letterSigned,
    studyDelivered,
    restitutionDate,
  });

  const firstName = ctx.firstName.trim();
  const greeting = firstName ? `Bonjour ${firstName}` : "Bonjour";

  const kpis: KpiBlock[] = [
    {
      label: "Étape du parcours",
      value: String(stageIndex),
      unit: "/ 6",
      meta: stageLabel,
      valueTone: "gold",
    },
    {
      label: "Questionnaire",
      value: `${dciCompletionPct}%`,
      meta: dciCompletionPct >= 100 ? "complété" : "renseigné à ce jour",
    },
    {
      label: "Lettre de mission",
      value: letterSigned ? "Signée" : "—",
      meta: letterSigned
        ? `le ${fmtDate(dossier?.letterOfMissionSignedAt ?? null)}`
        : "en attente de signature",
    },
    {
      label: "Étude patrimoniale",
      value: studyDelivered ? "Livrée" : "—",
      meta: studyDelivered
        ? `le ${fmtDate(dossier?.studyDeliveredAt ?? null)}`
        : "en préparation",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Espace client"
        title={greeting}
        description="Voici l'avancement de votre accompagnement patrimonial et la prochaine étape à réaliser."
      />

      <div className="mb-2">
        <ParcoursStepper stageIndex={stageIndex} />
      </div>

      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Prochaine action recommandée — mise en avant */}
        <section className="lg:col-span-2">
          <SectionHeader eyebrow="À faire maintenant" title="Votre prochaine étape" />
          <div className="rounded-md border border-[var(--navy-100)] bg-gradient-to-b from-white to-[var(--ivory)] p-6">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              {action.eyebrow}
            </div>
            <h2 className="mb-2 text-[19px] font-semibold leading-tight text-[var(--navy)]">
              {action.title}
            </h2>
            <p className="mb-5 max-w-xl text-[13px] leading-relaxed text-[var(--navy-300)]">
              {action.description}
            </p>
            <Link
              href={action.href}
              className="inline-block rounded-md bg-[var(--gold)] px-5 py-2.5 text-[12.5px] font-bold text-white transition hover:brightness-110"
            >
              {action.cta} →
            </Link>
          </div>

          {/* Jauge de complétion du questionnaire */}
          <div className="mt-4 rounded-md border border-[var(--navy-100)] bg-white p-5">
            <div className="mb-2 flex items-end justify-between">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--navy-300)]">
                Avancement du questionnaire
              </div>
              <div className="text-[14px] font-bold text-[var(--gold-deep)]">
                {dciCompletionPct}%
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--ivory-deep)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-200)]"
                style={{ width: `${Math.max(0, Math.min(100, dciCompletionPct))}%` }}
              />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
              {dciCompletionPct >= 100
                ? "Votre questionnaire est complet. Merci !"
                : dciCompletionPct > 0
                  ? "Vous pouvez reprendre votre questionnaire à tout moment, vos réponses sont enregistrées."
                  : "Votre questionnaire n'a pas encore été commencé."}
            </p>
          </div>
        </section>

        {/* Accès rapides au parcours */}
        <section>
          <SectionHeader eyebrow="Votre parcours" title="Accès rapides" />
          <div className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md border border-[var(--navy-100)] bg-white px-4 py-3 transition hover:border-[var(--gold)]"
              >
                <div className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                  {link.eyebrow}
                </div>
                <div className="mt-0.5 text-[13px] font-semibold text-[var(--navy)]">
                  {link.label}
                </div>
                <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">{link.hint}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
