import { PageHero, SectionHeader } from "@/app/_components/shared/PageHeader";
import { fetchClientDossier, fmtDate, PIPELINE_STAGE_LABELS } from "../../_data/client";
import { fetchClientUpcomingRdv, fetchClientEtude } from "./data";
import { AgendaButton } from "./AgendaButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Suivi & restitution",
};

// Les 7 étapes du parcours patrimonial, dans l'ordre — la timeline de suivi.
const JOURNEY_STAGES = [
  "01_prospect",
  "02_compliance",
  "03_collecte",
  "04_etudes",
  "05_restituee",
  "06_suivi",
] as const;

const STAGE_DESCRIPTIONS: Record<string, string> = {
  "01_prospect": "Premier contact établi avec votre conseiller.",
  "02_compliance": "Vérifications réglementaires et lettre de mission.",
  "03_collecte": "Collecte de vos informations et pièces justificatives.",
  "04_etudes": "Votre étude patrimoniale est en cours de préparation.",
  "05_restituee": "Votre étude vous a été présentée et remise.",
  "06_suivi": "Accompagnement et points de suivi dans la durée.",
};

function stageIndexOf(stage: string): number {
  const i = JOURNEY_STAGES.indexOf(stage as (typeof JOURNEY_STAGES)[number]);
  // 00_archive ou inconnu → on considère le parcours non démarré côté timeline.
  return i;
}

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fmtDate(iso);
  }
}

export default async function SuiviPage() {
  const [dossier, upcomingRdv, etude] = await Promise.all([
    fetchClientDossier(),
    fetchClientUpcomingRdv(),
    fetchClientEtude(),
  ]);

  // Pas de dossier résolu → état vide global honnête (pas de session client,
  // ou aucune donnée rattachée). On n'invente rien.
  if (!dossier) {
    return (
      <>
        <PageHero
          eyebrow="Étape 4 · Parcours d'accompagnement"
          title="Suivi & restitution"
          description="Suivez l'avancement de votre dossier, vos prochains rendez-vous et accédez à votre étude patrimoniale une fois livrée."
        />
        <section className="rounded-xl border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
          <div className="mb-3 text-[34px] leading-none">🧭</div>
          <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
            Votre suivi apparaîtra ici
          </div>
          <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
            Dès que votre dossier sera ouvert par votre conseiller, vous retrouverez sur cette page
            l&apos;avancement de votre accompagnement, vos rendez-vous et votre étude patrimoniale.
          </p>
        </section>
      </>
    );
  }

  const currentIndex = stageIndexOf(dossier.pipelineStage);

  return (
    <>
      <PageHero
        eyebrow="Étape 4 · Parcours d'accompagnement"
        title="Suivi & restitution"
        description="Suivez l'avancement de votre dossier, vos prochains rendez-vous et accédez à votre étude patrimoniale une fois livrée."
      />

      {/* ─── Avancement du dossier · timeline des étapes ─────────────────── */}
      <section className="mb-10">
        <SectionHeader
          eyebrow="Avancement"
          title="Où en est mon dossier"
          right={
            <span className="rounded-full bg-[var(--gold-200)] px-3 py-1 text-[11px] font-bold text-[var(--gold-deep)]">
              {PIPELINE_STAGE_LABELS[dossier.pipelineStage] ?? dossier.pipelineStage}
            </span>
          }
        />

        <div className="rounded-xl border border-[var(--navy-100)] bg-white p-6">
          <ol className="relative">
            {JOURNEY_STAGES.map((stage, i) => {
              const isDone = currentIndex > -1 && i < currentIndex;
              const isCurrent = i === currentIndex;
              const isLast = i === JOURNEY_STAGES.length - 1;

              return (
                <li key={stage} className="relative flex gap-4 pb-7 last:pb-0">
                  {/* trait vertical reliant les pastilles */}
                  {!isLast && (
                    <span
                      aria-hidden
                      className={`absolute left-[15px] top-8 h-[calc(100%-12px)] w-[2px] ${
                        isDone ? "bg-[var(--gold)]" : "bg-[var(--navy-100)]"
                      }`}
                    />
                  )}

                  {/* pastille numérotée */}
                  <span
                    className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-[12px] font-bold ${
                      isDone
                        ? "border-[var(--gold)] bg-[var(--gold)] text-white"
                        : isCurrent
                          ? "border-[var(--gold)] bg-white text-[var(--gold-deep)] ring-4 ring-[var(--gold-200)]"
                          : "border-[var(--navy-100)] bg-[var(--ivory)] text-[var(--navy-300)]"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>

                  <div className="pt-0.5">
                    <div
                      className={`text-[13.5px] font-semibold ${
                        isCurrent ? "text-[var(--navy)]" : isDone ? "text-[var(--navy)]" : "text-[var(--navy-300)]"
                      }`}
                    >
                      {PIPELINE_STAGE_LABELS[stage] ?? stage}
                      {isCurrent && (
                        <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--navy-300)]">
                      {STAGE_DESCRIPTIONS[stage]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ─── Prochains rendez-vous ───────────────────────────────────────── */}
      <section className="mb-10">
        <SectionHeader eyebrow="Agenda" title="Mes prochains rendez-vous" />

        {upcomingRdv.length > 0 ? (
          <div className="space-y-3">
            {upcomingRdv.map((rdv) => (
              <div
                key={rdv.id}
                className="flex flex-col gap-4 rounded-xl border border-[var(--navy-100)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--gold-faint,#F8EFDA)] text-[18px]"
                  >
                    🗓️
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold text-[var(--navy)]">{rdv.typeLabel}</div>
                    <div className="mt-0.5 text-[12.5px] capitalize text-[var(--navy-300)]">
                      {fmtDateTime(rdv.scheduledAt)}
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--navy-300)]">
                      <span className="rounded-full bg-[var(--ivory)] px-2 py-0.5">{rdv.formatLabel}</span>
                      <span>·</span>
                      <span>{rdv.durationMinutes} min</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 flex-wrap gap-2 sm:justify-end">
                  {rdv.videoRoomUrl && (
                    <a
                      href={rdv.videoRoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-[var(--navy)] px-3 py-2 text-[11.5px] font-bold text-white transition hover:bg-[var(--navy-700,#1A3A60)] hover:text-[var(--gold)]"
                    >
                      <span aria-hidden>🎥</span> Rejoindre la visio
                    </a>
                  )}
                  <AgendaButton
                    title={`${rdv.typeLabel} · PRIVEOS`}
                    startIso={rdv.scheduledAt}
                    durationMinutes={rdv.durationMinutes}
                    location={rdv.formatLabel}
                    description={rdv.videoRoomUrl ?? undefined}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--navy-100)] bg-white p-8 text-center">
            <div className="mb-2 text-[26px] leading-none">🗓️</div>
            <div className="mb-1 text-[13.5px] font-semibold text-[var(--navy)]">
              Aucun rendez-vous planifié
            </div>
            <p className="mx-auto max-w-md text-[12px] leading-relaxed text-[var(--navy-300)]">
              Votre conseiller vous proposera un créneau dès qu&apos;un nouvel échange sera nécessaire.
              Vous le retrouverez ici avec le lien pour le rejoindre.
            </p>
          </div>
        )}
      </section>

      {/* ─── Rapport d'étude ─────────────────────────────────────────────── */}
      <section>
        <SectionHeader eyebrow="Restitution" title="Mon étude patrimoniale" />

        {etude ? (
          <div className="overflow-hidden rounded-xl border border-[var(--gold-soft,#EEDDB6)] bg-white">
            <div className="border-b border-[var(--line,#E8E3D6)] bg-[var(--gold-faint,#F8EFDA)] px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold-deep,#9A6E0B)]">
                    Étude disponible
                  </div>
                  <div className="mt-1 text-[18px] font-semibold text-[var(--navy)]">
                    Votre étude patrimoniale est prête
                  </div>
                </div>
                <span className="rounded-full border border-[var(--gold-soft,#EEDDB6)] bg-white px-3 py-1 text-[11px] font-bold text-[var(--gold-deep,#9A6E0B)]">
                  Version {etude.version}
                </span>
              </div>
              <p className="mt-2 text-[12.5px] text-[var(--navy-300)]">
                Remise le {fmtDate(etude.deliveredAt)}
                {dossier.restitutionMeetingDate
                  ? ` · restitution prévue le ${fmtDate(dossier.restitutionMeetingDate)}`
                  : ""}
                .
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-3">
              <ReportLink
                href={etude.completeHref}
                icon="📘"
                title="Étude complète"
                subtitle="Document détaillé (PDF)"
              />
              <ReportLink
                href={etude.summaryHref}
                icon="📄"
                title="Synthèse"
                subtitle="Résumé de restitution (PDF)"
              />
              <ReportLink
                href={etude.interactiveHref}
                icon="🌐"
                title="Version interactive"
                subtitle="Consulter en ligne"
                external
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--navy-100)] bg-white p-10 text-center">
            <div className="mb-3 text-[30px] leading-none">📘</div>
            <div className="mb-1 text-[14px] font-semibold text-[var(--navy)]">
              Votre étude n&apos;est pas encore disponible
            </div>
            <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Votre conseiller finalise actuellement votre étude patrimoniale. Vous y aurez accès ici
              dès qu&apos;elle vous aura été présentée et remise.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function ReportLink({
  href,
  icon,
  title,
  subtitle,
  external,
}: {
  href: string | null;
  icon: string;
  title: string;
  subtitle: string;
  external?: boolean;
}) {
  // Document non encore disponible → carte désactivée honnête (pas de faux lien).
  if (!href) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--navy-100)] bg-[var(--ivory)] px-4 py-4 opacity-70">
        <span aria-hidden className="text-[20px]">
          {icon}
        </span>
        <div>
          <div className="text-[12.5px] font-semibold text-[var(--navy-300)]">{title}</div>
          <div className="text-[11px] text-[var(--navy-300)]">Bientôt disponible</div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-3 rounded-lg border border-[var(--navy-100)] bg-white px-4 py-4 transition hover:border-[var(--gold)] hover:shadow-sm"
    >
      <span aria-hidden className="text-[20px]">
        {icon}
      </span>
      <div>
        <div className="text-[12.5px] font-semibold text-[var(--navy)] group-hover:text-[var(--gold-deep,#9A6E0B)]">
          {title}
        </div>
        <div className="text-[11px] text-[var(--navy-300)]">{subtitle}</div>
      </div>
      <span aria-hidden className="ml-auto text-[var(--navy-100)] transition group-hover:text-[var(--gold)]">
        {external ? "↗" : "↓"}
      </span>
    </a>
  );
}
