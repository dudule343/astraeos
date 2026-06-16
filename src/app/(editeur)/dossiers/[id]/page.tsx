import Link from "next/link";
import { notFound } from "next/navigation";

import { Topbar } from "../../_components/Topbar";
import { KpiCard, type KpiBlock } from "../../_components/KpiCard";
import { PageHero } from "../../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Études",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
  "00_archive": "Archivé",
};

const EVENT_LABELS: Record<string, string> = {
  dossier_created: "Dossier créé",
  stage_changed: "Changement d'étape",
  document_uploaded: "Document déposé",
  document_signed: "Document signé",
  rdv_scheduled: "RDV planifié",
  rdv_completed: "RDV réalisé",
  ai_phase_started: "Phase IA démarrée",
  ai_phase_validated: "Phase IA validée",
  study_delivered: "Étude restituée",
  subscription_signed: "Souscription signée",
  commission_received: "Commission perçue",
  note_added: "Note ajoutée",
  impersonation: "Délégation",
  compliance_review: "Revue conformité",
};

type TimelineEvent = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  created_at: string;
};

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
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}

async function fetchDossier(id: string): Promise<{ dossier: DossierDetail; events: TimelineEvent[] } | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
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
          clients ( household_address, personnes ( first_name, last_name, email, phone ) )
        `,
      )
      .eq("id", id)
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

    const { data: tl } = await supabase
      .from("timeline_events")
      .select("id, event_type, title, description, created_at")
      .eq("dossier_id", id)
      .order("created_at", { ascending: false });

    const events: TimelineEvent[] = (tl as TimelineEvent[] | null) ?? [];

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
      },
      events,
    };
  } catch {
    return null;
  }
}

function daysSince(iso: string | null): string {
  if (!iso) return "—";
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return "—";
  const days = Math.max(0, Math.floor((Date.now() - start) / 86_400_000));
  return `${days} j`;
}

export default async function FicheDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchDossier(id);
  if (!result) notFound();

  const { dossier, events } = result;
  const stageIndex = Number(dossier.stage.slice(0, 2)) || 0;

  // Timeline : si aucun événement enregistré, on synthétise la création du dossier.
  const displayEvents: TimelineEvent[] =
    events.length > 0
      ? events
      : [
          {
            id: "synthetic-created",
            event_type: "dossier_created",
            title: "Dossier créé",
            description: "Ouverture du dossier à l'étape Prospect.",
            created_at: dossier.createdAt,
          },
        ];

  const kpis: KpiBlock[] = [
    { label: "Étape actuelle", value: STAGE_LABELS[dossier.stage] ?? dossier.stage, meta: `${stageIndex} / 6` },
    { label: "Ancienneté", value: daysSince(dossier.entryDate ?? dossier.createdAt), meta: "depuis l'entrée pipeline" },
    {
      label: "Conformité",
      value: stageIndex >= 2 ? "En cours" : "À venir",
      meta: "KYC · DER · lettre de mission",
    },
    { label: "Honoraires", value: dossier.revenue ? String(dossier.revenue) : "—", meta: "revenu rattaché" },
  ];

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
          eyebrow={`Fiche dossier · ${STAGE_LABELS[dossier.stage] ?? dossier.stage}`}
          title={dossier.name}
          description={
            [dossier.representant, dossier.address].filter(Boolean).join(" · ") || undefined
          }
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Timeline
            </div>
            <div className="border-l-2 border-[var(--gold)] pl-5">
              {displayEvents.map((e) => (
                <div key={e.id} className="relative mb-5 last:mb-0">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-[var(--gold)] bg-white" />
                  <div className="text-[13px] font-semibold text-[var(--navy)]">
                    {e.title || EVENT_LABELS[e.event_type] || e.event_type}
                  </div>
                  {e.description && (
                    <div className="mt-0.5 text-[12px] leading-relaxed text-[var(--navy-300)]">
                      {e.description}
                    </div>
                  )}
                  <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">{fmtDate(e.created_at)}</div>
                </div>
              ))}
            </div>
            {events.length === 0 && (
              <p className="mt-3 text-[11px] italic text-[var(--navy-300)]">
                Aucun événement enregistré pour l&apos;instant.
              </p>
            )}
          </section>

          <aside>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Contact
            </div>
            <div className="rounded-md border border-[var(--navy-100)] bg-white p-4 text-[12.5px]">
              <dl className="space-y-2">
                <div>
                  <dt className="text-[10.5px] uppercase tracking-wide text-[var(--navy-300)]">Représentant</dt>
                  <dd className="font-semibold text-[var(--navy)]">{dossier.representant ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-wide text-[var(--navy-300)]">E-mail</dt>
                  <dd className="text-[var(--navy)]">{dossier.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-wide text-[var(--navy-300)]">Téléphone</dt>
                  <dd className="text-[var(--navy)]">{dossier.phone ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-wide text-[var(--navy-300)]">Adresse</dt>
                  <dd className="text-[var(--navy)]">{dossier.address ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-wide text-[var(--navy-300)]">Entrée pipeline</dt>
                  <dd className="text-[var(--navy)]">{fmtDate(dossier.entryDate ?? dossier.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
