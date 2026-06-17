import Link from "next/link";

import { Topbar } from "../../../_components/Topbar";
import { KpiCard, type KpiBlock } from "../../../_components/KpiCard";
import { PageHero } from "../../../_components/PageHeader";
import { ParcoursStepper } from "../../../_components/ParcoursStepper";
import {
  ETUDE_PHASES,
  STATUS_LABELS,
  phaseState,
  progressFromPhase,
  nextPhase,
} from "@/lib/etudes";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import { loadEtude, advanceEtudePhase } from "./actions";

export const dynamic = "force-dynamic";

/** Étape courante du dossier (1-6) pour le stepper du parcours. */
async function fetchStageIndex(dossierId: string): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return 4;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return 4;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dossiers")
      .select("pipeline_stage")
      .eq("id", dossierId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    const stage = (data?.pipeline_stage as string | undefined) ?? "04_etudes";
    return Number(stage.slice(0, 2)) || 4;
  } catch {
    return 4;
  }
}

const STATE_BADGE: Record<string, { label: string; cls: string }> = {
  done: { label: "Fait", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" },
  current: { label: "En cours", cls: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
  todo: { label: "À venir", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
};

const BORDER: Record<string, string> = {
  done: "border-l-[var(--green-text)]",
  current: "border-l-[var(--gold)]",
  todo: "border-l-[var(--navy-200)]",
};

export default async function EtudesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [etude, stageIndex] = await Promise.all([loadEtude(id), fetchStageIndex(id)]);

  const current = etude?.current_phase ?? null;
  const progress = progressFromPhase(current, etude?.phase_progress_pct ?? null);
  const isCompleted = current === "completed";
  const target = nextPhase(current);
  const targetIsDelivery = target === "completed";

  const currentLabel = isCompleted
    ? "Étude terminée"
    : (ETUDE_PHASES.find((p) => p.key === current)?.label ?? "Pas démarrée");

  const kpis: KpiBlock[] = [
    {
      label: "Statut de l'étude",
      value: etude ? STATUS_LABELS[etude.status] : "Pas démarrée",
      meta: "version " + (etude?.version ?? 1),
    },
    { label: "Phase courante", value: currentLabel, meta: "5 phases au total" },
    { label: "Progression", value: `${progress} %`, meta: "de la production" },
  ];

  return (
    <>
      <Topbar current="Étude patrimoniale" />

      <div className="px-10 py-8">
        <Link
          href={`/dossiers/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
        >
          ← Retour à la fiche dossier
        </Link>

        <ParcoursStepper stageIndex={stageIndex} />

        <PageHero
          eyebrow="Étape 4 · Production de l'étude"
          title="Étude patrimoniale"
          description="La production se déroule en 5 phases, du bilan à la mise en forme des livrables. Validez chaque phase pour faire avancer l'étude ; la dernière la restitue et fait passer le dossier en suivi."
          actions={
            isCompleted ? (
              <span className="rounded-md bg-[var(--green-bg)] px-3 py-2 text-[11.5px] font-bold text-[var(--green-text)]">
                ✓ Étude restituée
              </span>
            ) : (
              <form action={advanceEtudePhase.bind(null, id)}>
                <button
                  type="submit"
                  className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
                >
                  {targetIsDelivery ? "Restituer l'étude →" : "Valider la phase →"}
                </button>
              </form>
            )
          }
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {/* Barre de progression */}
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-[var(--navy-100)]">
          <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-2.5">
          {ETUDE_PHASES.map((p) => {
            const state = phaseState(current, p.num);
            const badge = STATE_BADGE[state];
            return (
              <div
                key={p.key}
                className={`flex items-start gap-4 rounded-md border border-[var(--navy-100)] border-l-[3px] bg-white p-4 ${BORDER[state]}`}
              >
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ${
                    state === "done"
                      ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                      : state === "current"
                        ? "bg-[var(--gold-200)] text-[var(--medium-400)]"
                        : "bg-[var(--navy-100)] text-[var(--navy-300)]"
                  }`}
                >
                  {p.num}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[var(--navy)]">{p.label}</span>
                    <span
                      className={`rounded-sm px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.08em] ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--navy-300)]">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
