import Link from "next/link";
import { notFound } from "next/navigation";

import { Topbar } from "../../_components/Topbar";
import { KpiCard, type KpiBlock } from "../../_components/KpiCard";
import { PageHero } from "../../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import { LogoUpload } from "./LogoUpload";

export const dynamic = "force-dynamic";

type Notes = {
  raison_sociale?: string;
  nom_commercial?: string;
  siren?: string;
  statut_juridique?: string;
  numero_orias?: string;
  category?: string;
  sub_category?: string;
  pack?: string;
  revenue?: string;
  engineers?: string;
  end_clients?: string;
  status?: string;
  health?: string;
};

type ClientDetail = {
  id: string;
  createdAt: string;
  address: string | null;
  logoPath: string | null;
  cabinet: string | null;
  representant: string | null;
  email: string | null;
  phone: string | null;
  notes: Notes;
  dossiers: { id: string; stage: string | null; entryDate: string | null }[];
};

const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
  "00_archive": "Archivé",
};

function parseNotes(raw: unknown): Notes {
  if (typeof raw !== "string") return {};
  try {
    return JSON.parse(raw) as Notes;
  } catch {
    return {};
  }
}

async function fetchClient(id: string): Promise<ClientDetail | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  // Scope obligatoire : la fiche n'est lisible que si le client appartient au
  // tenant + cabinet de la session. Sans ces filtres, createAdminClient() (qui
  // bypasse RLS) permettrait de lire n'importe quelle fiche en énumérant les UUID (IDOR).
  const ctx = await getSessionContext();
  if (!ctx) return null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("clients")
      .select(
        `
          id,
          created_at,
          household_address,
          logo_url,
          cabinets ( name ),
          personnes ( first_name, last_name, email, phone ),
          dossiers ( id, pipeline_stage, pipeline_entry_date, internal_notes )
        `,
      )
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (!data) return null;
    const c = data as Record<string, unknown>;
    const cabinetRaw = c.cabinets as { name?: string } | { name?: string }[] | null | undefined;
    const cabinet = Array.isArray(cabinetRaw) ? cabinetRaw[0] : cabinetRaw;
    const persons =
      (c.personnes as Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }>) ??
      [];
    const p = persons[0];
    const dossiersArr =
      (c.dossiers as Array<{ id: string; pipeline_stage?: string; pipeline_entry_date?: string; internal_notes?: string }>) ??
      [];
    const notes = parseNotes(dossiersArr[0]?.internal_notes);

    return {
      id: c.id as string,
      createdAt: c.created_at as string,
      address: (c.household_address as string) ?? null,
      logoPath: (c.logo_url as string) ?? null,
      cabinet: cabinet?.name ?? null,
      representant: p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : null,
      email: p?.email ?? null,
      phone: p?.phone ?? null,
      notes,
      dossiers: dossiersArr.map((d) => ({
        id: d.id,
        stage: d.pipeline_stage ?? null,
        entryDate: d.pipeline_entry_date ?? null,
      })),
    };
  } catch {
    return null;
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  marque: "Marque (franchise · licence · réseau)",
  cabinet_direct: "Cabinet direct indépendant",
  autre_pro: "Autre professionnel",
};

export default async function FicheClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await fetchClient(id);
  if (!client) notFound();

  const { notes } = client;
  const name = notes.raison_sociale || client.representant || "Client";

  // URL signée du logo (bucket privé) si présent.
  let logoSignedUrl: string | null = null;
  if (client.logoPath && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase.storage.from("depots").createSignedUrl(client.logoPath, 3600);
      logoSignedUrl = data?.signedUrl ?? null;
    } catch {
      /* logo indisponible : on affiche le placeholder */
    }
  }

  const kpis: KpiBlock[] = [
    { label: "Pack", value: notes.pack || "—", meta: CATEGORY_LABELS[notes.category ?? ""] ?? "client" },
    { label: "MRR", value: notes.revenue ? String(notes.revenue) : "—", meta: "revenu mensuel récurrent" },
    { label: "Ingénieurs", value: notes.engineers || "—", meta: "rattachés au compte" },
    { label: "Clients finaux", value: notes.end_clients || "—", meta: "portefeuille du cabinet" },
  ];

  return (
    <>
      <Topbar current="Fiche client" />

      <div className="px-10 py-8">
        <Link
          href="/clients"
          className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
        >
          ← Retour aux clients
        </Link>

        <PageHero
          eyebrow={`Fiche client${notes.siren ? ` · SIREN ${notes.siren}` : ""}`}
          title={name}
          description={[client.cabinet, notes.statut_juridique, client.address].filter(Boolean).join(" · ") || undefined}
        />

        {/* Logo du client */}
        <div className="mb-8 flex items-center gap-4">
          {logoSignedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSignedUrl}
              alt="Logo client"
              className="h-14 w-14 rounded-md border border-[var(--navy-100)] bg-white object-contain"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-[var(--navy-100)] text-[10px] text-[var(--navy-300)]">
              Logo
            </div>
          )}
          <LogoUpload clientId={client.id} hasLogo={!!client.logoPath} />
        </div>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <aside>
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Contact
            </div>
            <div className="rounded-md border border-[var(--navy-100)] bg-white p-4 text-[12.5px]">
              <dl className="space-y-2">
                {[
                  ["Représentant légal", client.representant],
                  ["E-mail", client.email],
                  ["Téléphone", client.phone],
                  ["Adresse", client.address],
                  ["ORIAS", notes.numero_orias],
                  ["Client depuis", fmtDate(client.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[10.5px] uppercase tracking-wide text-[var(--navy-300)]">{label}</dt>
                    <dd className="text-[var(--navy)]">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>

          <section className="lg:col-span-2">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Dossiers ({client.dossiers.length})
            </div>
            {client.dossiers.length > 0 ? (
              <div className="space-y-2">
                {client.dossiers.map((d) => (
                  <Link
                    key={d.id}
                    href={`/dossiers/${d.id}`}
                    className="flex items-center justify-between rounded-md border border-[var(--navy-100)] bg-white px-4 py-3 transition hover:border-[var(--gold)]"
                  >
                    <span className="text-[12.5px] font-semibold text-[var(--navy)]">
                      {STAGE_LABELS[d.stage ?? ""] ?? "Dossier"}
                    </span>
                    <span className="text-[11px] text-[var(--navy-300)]">
                      ouvert le {fmtDate(d.entryDate)} →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-8 text-center text-[12.5px] text-[var(--navy-300)]">
                Aucun dossier pour ce client.
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
