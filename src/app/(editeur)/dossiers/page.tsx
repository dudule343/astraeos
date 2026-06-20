import Link from "next/link";

import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero } from "@/app/_components/shared/PageHeader";
import { ExportDossiersButton } from "./ExportDossiersButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import {
  type Dossier,
  isAlerte,
  alerteBadge,
  carteContexte,
  etatBadge,
} from "@/lib/pipeline";

export const dynamic = "force-dynamic";

type StageAccent = "gold" | "neutral" | "strong";

const STAGES: {
  key: string;
  num: string;
  label: string;
  subtitle: string;
  accent: StageAccent;
}[] = [
  {
    key: "01_prospect",
    num: "1",
    label: "Prospects",
    subtitle: "Nouveau contact · 1er RDV à organiser",
    accent: "gold",
  },
  {
    key: "02_compliance",
    num: "2",
    label: "Conformité",
    subtitle: "KYC, LCB-FT, entrée en relation",
    accent: "neutral",
  },
  {
    key: "03_collecte",
    num: "3",
    label: "Collecte",
    subtitle: "Espace sécurisé · documents client",
    accent: "neutral",
  },
  {
    key: "04_etudes",
    num: "4",
    label: "Production",
    subtitle: "Rédaction étude · 4 parties",
    accent: "strong",
  },
  {
    key: "05_restituee",
    num: "5",
    label: "Restituées",
    subtitle: "Études livrées · cumul 2026",
    accent: "neutral",
  },
  {
    key: "06_suivi",
    num: "6",
    label: "Suivi",
    subtitle: "Clients en suivi annuel",
    accent: "neutral",
  },
];

const ACTIVE_STAGES = ["01_prospect", "02_compliance", "03_collecte", "04_etudes"];
const DELIVERED_STAGES = ["05_restituee", "06_suivi"];

async function fetchDossiers(): Promise<Dossier[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const ctx = await getSessionContext();
  if (!ctx) return [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          pipeline_stage,
          priority,
          dci_completion_pct,
          pipeline_entry_date,
          stage_entered_at,
          study_delivered_at,
          restitution_meeting_date,
          total_revenue_cached,
          days_in_stage_cached,
          internal_notes,
          clients ( personnes ( first_name, last_name ) )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("stage_entered_at", { ascending: false })
      .limit(200);

    if (!data) return [];

    return data.map((d: Record<string, unknown>) => {
      let raisonSociale: string | undefined;
      const notesRaw = d.internal_notes as string | null | undefined;
      if (notesRaw) {
        try {
          raisonSociale = (JSON.parse(notesRaw) as { raison_sociale?: string }).raison_sociale;
        } catch {
          // internal_notes non-JSON : on ignore
        }
      }
      const clientRaw = d.clients as
        | { personnes?: Array<{ first_name?: string; last_name?: string }> }
        | Array<{ personnes?: Array<{ first_name?: string; last_name?: string }> }>
        | null
        | undefined;
      const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
      const person = client?.personnes?.[0];
      const representant = person
        ? `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim()
        : "";

      return {
        id: d.id as string,
        stage: d.pipeline_stage as string,
        name: raisonSociale || representant || "Dossier sans nom",
        priority: (d.priority as string) ?? null,
        dciPct: (d.dci_completion_pct as number) ?? null,
        entryDate: (d.pipeline_entry_date as string) ?? null,
        stageEnteredAt: (d.stage_entered_at as string) ?? null,
        deliveredAt: (d.study_delivered_at as string) ?? null,
        restitDate: (d.restitution_meeting_date as string) ?? null,
        daysInStage: (d.days_in_stage_cached as number) ?? null,
      } satisfies Dossier;
    });
  } catch {
    return [];
  }
}

/** Nom de l'ingénieur connecté, dérivé de la session (vide si indisponible). */
async function fetchEngineerName(): Promise<string> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return "";
  const ctx = await getSessionContext();
  if (!ctx) return "";
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", ctx.userId)
      .maybeSingle();
    if (!data) return "";
    const profile = data as { first_name: string | null; last_name: string | null };
    return `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
  } catch {
    return "";
  }
}

function computeKpis(dossiers: Dossier[], now: Date): KpiBlock[] {
  const annee = now.getFullYear();

  const actifs = dossiers.filter((d) => ACTIVE_STAGES.includes(d.stage)).length;

  const livres = dossiers.filter((d) => {
    if (d.deliveredAt) {
      const t = new Date(d.deliveredAt);
      return !Number.isNaN(t.getTime()) && t.getFullYear() === annee;
    }
    return DELIVERED_STAGES.includes(d.stage);
  });

  // Délai moyen étude = moyenne (study_delivered_at − pipeline_entry_date) en jours.
  const delais = livres
    .map((d) => {
      if (!d.deliveredAt || !d.entryDate) return null;
      const fin = new Date(d.deliveredAt).getTime();
      const debut = new Date(d.entryDate).getTime();
      if (Number.isNaN(fin) || Number.isNaN(debut)) return null;
      return Math.round((fin - debut) / (1000 * 60 * 60 * 24));
    })
    .filter((v): v is number => v != null && v >= 0);
  const delaiMoyen =
    delais.length > 0 ? Math.round(delais.reduce((a, b) => a + b, 0) / delais.length) : null;

  const enAlerte = dossiers.filter((d) => isAlerte(d, now)).length;

  return [
    {
      label: "Dossiers actifs",
      value: String(actifs),
      meta: "en cours · hors suivi",
    },
    {
      label: "Études livrées",
      value: String(livres.length),
      valueTone: "gold",
      meta: "cumul 2026",
    },
    {
      label: "Délai moyen étude",
      value: delaiMoyen != null ? String(delaiMoyen) : "—",
      unit: delaiMoyen != null ? "j" : undefined,
      meta: "collecte → restitution",
    },
    {
      label: "Dossiers en alerte",
      value: String(enAlerte),
      valueTone: "alert",
      meta: "KYC + production en retard",
    },
  ];
}

const headerAccentClass: Record<StageAccent, string> = {
  gold: "border-[var(--gold-200)] bg-[var(--ivory)]",
  neutral: "border-[var(--navy-100)] bg-white",
  strong:
    "border-[1.5px] border-[var(--gold)] bg-[linear-gradient(135deg,var(--ivory),var(--gold-100))]",
};

const badgeAccentClass: Record<StageAccent, string> = {
  gold: "bg-[var(--gold)] text-white",
  neutral: "bg-[var(--navy-100)] text-[var(--navy-300)]",
  strong: "bg-[var(--gold)] text-white",
};

const etatBadgeClass = {
  gold: "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  blue: "bg-[var(--light-blue)] text-[var(--navy)]",
  success: "bg-[var(--light-blue)] text-[var(--green-text)]",
} as const;

function badgeCountClass(stage: string, accent: StageAccent): string {
  if (accent === "gold" || accent === "strong") return badgeAccentClass.gold;
  if (stage === "05_restituee") return "bg-[var(--gold-300)] text-white";
  return "bg-[var(--navy-100)] text-[var(--navy-300)]";
}

function DossierCard({ d, now }: { d: Dossier; now: Date }) {
  const alerte = isAlerte(d, now);
  const badgeAlerte = alerteBadge(d, now);
  const etat = etatBadge(d, now);
  const isCollecte = d.stage === "03_collecte";
  const dciPct = Math.max(0, Math.min(100, d.dciPct ?? 0));

  const cardClass = alerte
    ? "border-l-[3px] border-l-[var(--orange-text)] border border-[var(--navy-100)] bg-[rgba(229,124,75,0.06)]"
    : d.stage === "05_restituee"
      ? "border-l-[3px] border-l-[var(--gold)] border border-[var(--navy-100)] bg-[var(--gold-100)]"
      : "border border-[var(--navy-100)] bg-[var(--ivory)]";

  return (
    <Link
      href={`/dossiers/${d.id}`}
      className={`block rounded-md px-3 py-2.5 transition hover:border-[var(--gold)] ${cardClass}`}
    >
      <div className="mb-1 text-[11.5px] font-bold leading-tight text-[var(--navy)]">
        {d.name}
      </div>
      <div className="mb-2 text-[10px] leading-snug text-[var(--navy-300)]">
        {carteContexte(d, now)}
      </div>

      {isCollecte && !alerte ? (
        <div>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--ivory-deep)]">
            <div className="h-full bg-[var(--gold)]" style={{ width: `${dciPct}%` }} />
          </div>
          <div className="mt-1 text-[9.5px] font-semibold text-[var(--navy-300)]">
            {dciPct}% documents reçus
          </div>
        </div>
      ) : badgeAlerte ? (
        <span className="inline-block rounded-sm bg-[rgba(229,124,75,0.15)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--orange-text)]">
          {badgeAlerte}
        </span>
      ) : etat ? (
        <span
          className={`inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-semibold ${etatBadgeClass[etat.tone]}`}
        >
          {etat.text}
        </span>
      ) : null}
    </Link>
  );
}

function StageColumn({
  stage,
  cards,
  now,
}: {
  stage: (typeof STAGES)[number];
  cards: Dossier[];
  now: Date;
}) {
  const truncate = stage.key === "05_restituee" || stage.key === "06_suivi";
  const visible = truncate ? cards.slice(0, 2) : cards;
  const reste = truncate ? cards.length - visible.length : 0;
  const isStrong = stage.accent === "strong";

  return (
    <div className="flex flex-col">
      <div
        className={`mb-2 rounded-md border px-2.5 py-2 ${headerAccentClass[stage.accent]}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--navy)]">
            {stage.num} · {stage.label}
          </span>
          <span
            className={`ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-[10px] px-1.5 text-[10px] font-bold ${badgeCountClass(stage.key, stage.accent)}`}
          >
            {cards.length}
          </span>
        </div>
        <div className="mt-1 text-[9.5px] leading-snug text-[var(--navy-300)]">
          {stage.subtitle}
        </div>
      </div>

      <div
        className={`flex min-h-[340px] flex-col gap-2 rounded-md p-1 ${
          isStrong ? "border-[1.5px] border-[var(--gold)]" : ""
        }`}
      >
        {visible.map((d) => (
          <DossierCard key={d.id} d={d} now={now} />
        ))}
        {reste > 0 && (
          <div className="py-1 text-center text-[10px] italic text-[var(--navy-300)]">
            … {reste} autres
          </div>
        )}
        {cards.length === 0 && (
          <div className="rounded-md border border-dashed border-[var(--navy-100)] p-3 text-center text-[10px] text-[var(--navy-300)]">
            Aucun dossier
          </div>
        )}
      </div>
    </div>
  );
}

export default async function DossiersPage() {
  const now = new Date();
  const [dossiers, engineerName] = await Promise.all([fetchDossiers(), fetchEngineerName()]);
  const kpis = computeKpis(dossiers, now);

  const nActifs = dossiers.filter((d) => ACTIVE_STAGES.includes(d.stage)).length;
  const mLivrees = dossiers.filter((d) => {
    if (d.deliveredAt) {
      const t = new Date(d.deliveredAt);
      return !Number.isNaN(t.getTime()) && t.getFullYear() === now.getFullYear();
    }
    return DELIVERED_STAGES.includes(d.stage);
  }).length;
  const pSuivi = dossiers.filter((d) => d.stage === "06_suivi").length;

  return (
    <>
      <Topbar current="Pipeline des dossiers" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow={
            engineerName
              ? `Parcours patrimonial · 6 étapes du dossier · vue par ${engineerName}`
              : "Parcours patrimonial · 6 étapes du dossier"
          }
          title="Pipeline de mes dossiers"
          description={`Vue Kanban de l'ensemble de mes dossiers en cours · ${nActifs} dossiers actifs répartis sur 6 étapes du parcours · ${mLivrees} dossiers déjà livrés en 2026 · ${pSuivi} clients en phase de suivi.`}
          actions={
            <>
              <ExportDossiersButton dossiers={dossiers} />
              <Link
                href="/client-new"
                className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
              >
                + Nouveau dossier
              </Link>
            </>
          }
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {dossiers.length > 0 ? (
          <section
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
          >
            {STAGES.map((stage) => (
              <StageColumn
                key={stage.key}
                stage={stage}
                cards={dossiers.filter((d) => d.stage === stage.key)}
                now={now}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
            <div className="mb-3 text-[40px] leading-none">🗂️</div>
            <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
              Aucun dossier pour l&apos;instant
            </div>
            <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Crée un client via le wizard : un dossier est ouvert automatiquement à l&apos;étape
              Prospects et apparaîtra ici.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
