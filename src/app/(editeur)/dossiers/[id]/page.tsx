import Link from "next/link";
import { notFound } from "next/navigation";

import { Topbar } from "../../_components/Topbar";
import { KpiCard, type KpiBlock } from "../../_components/KpiCard";
import { PageHero } from "../../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import {
  STAGE_LABELS,
  buildJalons,
  progressPct,
  type ConformiteForParcours,
  type EtudeForParcours,
  type Jalon,
  type JalonTone,
} from "@/lib/dossier-parcours";
import type { EtudePhaseKey, EtudeStatus } from "@/lib/etudes";
import type { ConformiteStatus } from "@/lib/conformite";
import { moveDossierStage } from "../actions";

export const dynamic = "force-dynamic";

type DossierDetail = {
  id: string;
  stage: string;
  name: string;
  representant: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  entryDate: string | null;
  createdAt: string;
  revenue: string | null;
  completePdfUrl: string | null;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return null;
  return Math.max(0, Math.floor((Date.now() - start) / 86_400_000));
}

async function fetchDossier(
  id: string,
): Promise<{ dossier: DossierDetail; etude: EtudeForParcours; conformite: ConformiteForParcours } | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const ctx = await getSessionContext();
  if (!ctx) return null;
  try {
    const supabase = createAdminClient();
    const { data: d } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          pipeline_stage,
          pipeline_entry_date,
          total_revenue_cached,
          created_at,
          internal_notes,
          tenant_id,
          cabinet_id,
          clients ( household_address, personnes ( first_name, last_name, email, phone ) )
        `,
      )
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (!d) return null;

    const row = d as Record<string, unknown>;
    let notes: { raison_sociale?: string; revenue?: string } = {};
    const notesRaw = row.internal_notes as string | null | undefined;
    if (notesRaw) {
      try {
        notes = JSON.parse(notesRaw);
      } catch {
        // ignore
      }
    }
    const clientRaw = row.clients as
      | { household_address?: string; personnes?: Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }> }
      | Array<{ household_address?: string; personnes?: Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }> }>
      | null
      | undefined;
    const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
    const person = client?.personnes?.[0];
    const representant = person ? `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim() : "";

    // Requêtes parallèles : étude la plus récente + agrégat de conformité.
    const [etudeRes, conformiteRes] = await Promise.all([
      supabase
        .from("etudes")
        .select(
          "id, version, status, current_phase, phase_progress_pct, delivered_at, complete_pdf_url, restitution_meeting_id, created_at",
        )
        .eq("dossier_id", id)
        .eq("tenant_id", ctx.tenantId)
        .eq("cabinet_id", ctx.cabinetId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("conformite_items")
        .select("type, label, status, signed_at, validated_at")
        .eq("dossier_id", id)
        .eq("tenant_id", ctx.tenantId)
        .eq("cabinet_id", ctx.cabinetId),
    ]);

    const etudeRow = etudeRes.data as
      | {
          version: number;
          status: EtudeStatus;
          current_phase: EtudePhaseKey | null;
          phase_progress_pct: number | null;
          delivered_at: string | null;
          complete_pdf_url: string | null;
          restitution_meeting_id: string | null;
        }
      | null;

    const etude: EtudeForParcours = etudeRow
      ? {
          version: etudeRow.version,
          status: etudeRow.status,
          current_phase: etudeRow.current_phase,
          phase_progress_pct: etudeRow.phase_progress_pct,
          delivered_at: etudeRow.delivered_at,
          restitution_meeting_id: etudeRow.restitution_meeting_id,
        }
      : null;

    const confItems =
      (conformiteRes.data as Array<{
        type: string;
        label: string;
        status: ConformiteStatus;
        signed_at: string | null;
        validated_at: string | null;
      }> | null) ?? [];

    const validCount = confItems.filter((c) => c.status === "valide").length;
    const lettreMission = confItems.find((c) => c.type === "lettre_mission");
    const lettreMissionSigned =
      lettreMission && (lettreMission.status === "signe" || lettreMission.status === "valide");

    const conformite: ConformiteForParcours = {
      hasItems: confItems.length > 0,
      allValid: confItems.length > 0 && validCount === confItems.length,
      validCount,
      totalCount: confItems.length,
      lettreMissionSignedAt: lettreMissionSigned
        ? lettreMission?.signed_at ?? lettreMission?.validated_at ?? null
        : null,
    };

    return {
      dossier: {
        id: row.id as string,
        stage: row.pipeline_stage as string,
        name: notes.raison_sociale || representant || "Dossier sans nom",
        representant: representant || null,
        email: person?.email ?? null,
        phone: person?.phone ?? null,
        address: client?.household_address ?? null,
        entryDate: (row.pipeline_entry_date as string) ?? null,
        createdAt: row.created_at as string,
        revenue: (row.total_revenue_cached as string) ?? notes.revenue ?? null,
        completePdfUrl: etudeRow?.complete_pdf_url ?? null,
      },
      etude,
      conformite,
    };
  } catch {
    return null;
  }
}

/** Classes de la pastille numérotée selon l'état du jalon. */
function dotClass(tone: JalonTone): string {
  if (tone === "todo") {
    return "border-[3px] border-[var(--gold)] bg-white text-[var(--gold)]";
  }
  return "bg-[var(--gold)] text-white";
}

/** Badge de statut du jalon. */
function JalonBadge({ badge }: { badge: { label: string; tone: JalonTone } }) {
  const base = "ml-3 flex-shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold";
  if (badge.tone === "done") {
    return <span className={`${base} bg-[var(--green-bg)] text-[var(--green-text)]`}>{badge.label}</span>;
  }
  if (badge.tone === "current") {
    return <span className={`${base} bg-[var(--gold-100)] text-[var(--gold-deep)]`}>{badge.label}</span>;
  }
  // todo : badge neutre, sauf le jalon 6 « 📅 J-1 » qui reste gold-100 (cf. buildJalons).
  const isAgenda = badge.label.includes("📅");
  return (
    <span
      className={`${base} ${isAgenda ? "bg-[var(--gold-100)] text-[var(--gold-deep)]" : "bg-[var(--navy-100)] text-[var(--navy-300)]"}`}
    >
      {badge.label}
    </span>
  );
}

/** Contenu riche FIXE de l'étape 5 (les 4 parties du livrable PRIVEOS). */
function Etape5Detail() {
  return (
    <>
      <div className="mt-0.5 text-[10.5px] italic text-[var(--navy-300)]">
        Production conduite par l&apos;ingénieur · avec l&apos;appui des agents IA PRIVEOS
      </div>
      <div className="mt-1.5 text-[11.5px] leading-[1.7] text-[var(--navy-300)]">
        <strong>Partie 1 · Bilan patrimonial</strong> : insécurités + axes d&apos;optimisation + météo
        patrimoniale finale
        <br />
        <strong>Partie 2 · Étude patrimoniale (préconisations)</strong> : 5 axes structurés (situation
        client / projection sans action / proposition PRIVEOS / projection avec action / étapes de mise en
        place / simulation chiffrée / textes de loi)
        <br />
        <strong>Partie 3 · Tableau récapitulatif</strong> : 3 colonnes (Situation initiale / Préconisations
        / Gains)
        <br />
        <strong>Partie 4 · Frise chronologique</strong> de mise en place
      </div>
    </>
  );
}

function TimelineJalon({ jalon }: { jalon: Jalon }) {
  const cardBase = "rounded-lg px-[18px] py-[14px]";
  const cardStyle = jalon.dashed
    ? "border-2 border-dashed border-[var(--gold)] bg-white"
    : jalon.highlight
      ? "border-l-[3px] border-[var(--gold)] bg-[linear-gradient(135deg,var(--ivory),var(--gold-100))]"
      : "border-l-[3px] border-[var(--gold)] bg-[var(--ivory)]";

  const innerAlign = jalon.highlight ? "items-start" : "items-center";

  const body = (
    <div className={`${cardBase} ${cardStyle} ${jalon.href ? "cursor-pointer transition hover:brightness-[0.99]" : ""}`}>
      <div className={`flex justify-between ${innerAlign}`}>
        <div className="flex-1">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--gold-deep)]">
            {jalon.eyebrow}
          </div>
          <div className="mt-[3px] text-[14px] font-bold text-[var(--navy)]">{jalon.titre}</div>
          {jalon.num === 5 ? (
            <Etape5Detail />
          ) : (
            jalon.detail && (
              <div className="mt-1 text-[11.5px] text-[var(--navy-300)]">{jalon.detail}</div>
            )
          )}
          {jalon.encart && (
            <div className="mt-2.5 rounded-md border border-[var(--gold-200)] bg-white px-[14px] py-2.5">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--gold-deep)]">
                {jalon.encart.titre}
              </div>
              <div className="mt-0.5 text-[12px] text-[var(--navy)]">{jalon.encart.texte}</div>
            </div>
          )}
        </div>
        <JalonBadge badge={jalon.badge} />
      </div>
    </div>
  );

  return (
    <div className="relative grid grid-cols-[50px_1fr] gap-[18px]">
      <div
        className={`z-[1] flex h-[50px] w-[50px] items-center justify-center rounded-full text-[18px] font-bold shadow-[0_0_0_4px_white] ${dotClass(
          jalon.badge.tone,
        )}`}
      >
        {jalon.num}
      </div>
      {jalon.href ? <Link href={jalon.href}>{body}</Link> : body}
    </div>
  );
}

export default async function FicheDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchDossier(id);
  if (!result) notFound();

  const { dossier, etude, conformite } = result;
  const stageIndex = Number(dossier.stage.slice(0, 2)) || 0;
  const atStart = dossier.stage === "01_prospect";
  const atEnd = dossier.stage === "06_suivi";

  const jalons = buildJalons({
    dossierId: dossier.id,
    stageIndex,
    createdAt: dossier.createdAt,
    representant: dossier.representant,
    etude,
    conformite,
    fmtDate,
  });

  const pct = progressPct(stageIndex);

  // --- KPIs dérivés -------------------------------------------------------
  const etudeLivree = etude?.status === "delivered" || Boolean(etude?.delivered_at) || stageIndex >= 5;

  const conformiteValue = conformite.allValid ? "✓ OK" : conformite.hasItems ? "En cours" : "À venir";
  const conformiteMeta = conformite.hasItems
    ? conformite.allValid
      ? "KYC + LCB-FT validés"
      : `${conformite.validCount}/${conformite.totalCount} pièces validées`
    : "checklist à initialiser";

  const days = daysSince(dossier.entryDate ?? dossier.createdAt);

  const kpis: KpiBlock[] = [
    {
      label: "Étape actuelle",
      value: `${stageIndex} · ${STAGE_LABELS[dossier.stage] ?? dossier.stage}`,
      meta: etudeLivree ? "RDV restitution à venir" : `${stageIndex} / 6 du parcours`,
    },
    {
      label: "Honoraires HT",
      value: dossier.revenue ? String(dossier.revenue) : "—",
      unit: dossier.revenue ? "€" : undefined,
      meta: conformite.lettreMissionSignedAt
        ? `pack signé le ${fmtDate(conformite.lettreMissionSignedAt)}`
        : "honoraires rattachés",
    },
    {
      label: "Durée du dossier",
      value: days !== null ? String(days) : "—",
      unit: days !== null ? "j" : undefined,
      meta: etude?.delivered_at
        ? `démarrage ${fmtDate(dossier.createdAt)} → livraison ${fmtDate(etude.delivered_at)}`
        : `depuis l'entrée pipeline`,
    },
    {
      label: "Statut conformité",
      value: conformiteValue,
      trend: conformite.allValid ? "up" : undefined,
      meta: conformiteMeta,
    },
  ];

  // --- Hero sub riche -----------------------------------------------------
  const heroSub = [
    "Étude patrimoniale",
    dossier.revenue ? `honoraires ${dossier.revenue} € HT` : null,
    etudeLivree ? "étude livrée · restitution à venir" : `étape ${stageIndex}/6 du parcours`,
    dossier.representant ? `dossier piloté par ${dossier.representant}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const etudeHref = `/dossiers/${dossier.id}/etudes`;

  return (
    <>
      <Topbar current="Fiche dossier" />

      <div className="px-10 py-8">
        <Link
          href="/dossiers"
          className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
        >
          ← Retour au pipeline
        </Link>

        <PageHero
          eyebrow={`Dossier ${dossier.id.slice(0, 8).toUpperCase()} · ${STAGE_LABELS[dossier.stage] ?? dossier.stage} · ouvert le ${fmtDate(dossier.createdAt)}`}
          title={dossier.name}
          description={heroSub}
          actions={
            <>
              <Link
                href="/dossiers"
                className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                ← Retour pipeline
              </Link>
              <Link
                href={etudeHref}
                className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
              >
                Ouvrir l&apos;étude
              </Link>
            </>
          }
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {/* TIMELINE 6 JALONS */}
        <div className="mb-6 rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex items-center gap-2 border-b border-[var(--navy-100)] px-6 py-4 text-[13px] font-bold text-[var(--navy)]">
            Timeline du parcours · 6 étapes
          </div>
          <div className="px-[22px] py-[30px]">
            <div className="relative">
              {/* Ligne verticale : dégradé or sur la part terminée, ivory-deep ensuite. */}
              <div
                className="absolute left-[24px] top-[14px] bottom-[14px] w-[2px]"
                style={{
                  background: `linear-gradient(180deg, var(--gold) 0%, var(--gold) ${pct}%, var(--ivory-deep) ${pct}%, var(--ivory-deep) 100%)`,
                }}
              />
              <div className="flex flex-col gap-[22px]">
                {jalons.map((j) => (
                  <TimelineJalon key={j.num} jalon={j} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS DISPONIBLES MAINTENANT */}
        <div className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex items-center gap-2 border-b border-[var(--navy-100)] px-6 py-4 text-[13px] font-bold text-[var(--navy)]">
            Actions disponibles maintenant
          </div>
          <div className="px-[22px] py-[18px]">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Link
                href={etudeHref}
                className="flex items-center justify-center rounded-md bg-[var(--gold)] p-[14px] text-center text-[11.5px] font-bold text-white hover:brightness-110"
              >
                📋 Préparer la restitution
              </Link>
              <Link
                href={dossier.completePdfUrl ?? etudeHref}
                className="flex items-center justify-center rounded-md border border-[var(--navy-100)] bg-white p-[14px] text-center text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                📄 Ouvrir l&apos;étude
              </Link>
              <Link
                href={`/dossiers/${dossier.id}/conformite`}
                className="flex items-center justify-center rounded-md border border-[var(--navy-100)] bg-white p-[14px] text-center text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                ✓ Conformité / KYC
              </Link>
              <Link
                href={`/dossiers/${dossier.id}/collecte`}
                className="flex items-center justify-center rounded-md border border-[var(--navy-100)] bg-white p-[14px] text-center text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                📁 Collecte des pièces
              </Link>
            </div>

            {/* Avancement du parcours (déplacé hors du hero, fidèle au v40). */}
            <div className="mt-4 flex items-center gap-2 border-t border-[var(--navy-100)] pt-4">
              {!atStart && (
                <form action={moveDossierStage.bind(null, dossier.id, "prev")}>
                  <button
                    type="submit"
                    className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                  >
                    ← Étape précédente
                  </button>
                </form>
              )}
              {!atEnd && (
                <form action={moveDossierStage.bind(null, dossier.id, "next")}>
                  <button
                    type="submit"
                    className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                  >
                    Avancer à l&apos;étape suivante →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
