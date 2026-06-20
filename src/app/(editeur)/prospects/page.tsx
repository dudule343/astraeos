import Link from "next/link";

import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero } from "@/app/_components/shared/PageHeader";
import { KINDS, loadAllSubmissions, type DciKind } from "@/lib/dci-store";
import { getSessionContext, type SessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<DciKind, string> = {
  rdv: "Prise de RDV",
  simple: "DCI simplifié",
  qualification: "Questionnaire investisseur",
  complet: "DCI complet",
};

const KIND_SHORT: Record<DciKind, string> = {
  rdv: "RDV",
  simple: "Simplifié",
  qualification: "Qualification",
  complet: "Complet",
};

type Prospect = {
  slug: string;
  name: string;
  kinds: Record<DciKind, boolean>;
  lastAt: string | null;
};

async function fetchProspects(): Promise<Prospect[]> {
  const ctx = await getSessionContext();
  if (!ctx) return [];
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const { submissions } = await loadAllSubmissions(ctx.tenantId);

    const byProspect = new Map<string, Prospect>();
    for (const s of submissions) {
      let entry = byProspect.get(s.prospect_slug);
      if (!entry) {
        entry = {
          slug: s.prospect_slug,
          name: s.display_name ?? s.prospect_slug,
          kinds: Object.fromEntries(KINDS.map((k) => [k, false])) as Record<DciKind, boolean>,
          lastAt: null,
        };
        byProspect.set(s.prospect_slug, entry);
      }
      entry.kinds[s.kind] = true;
      if (s.display_name && (entry.name === entry.slug || !entry.name)) entry.name = s.display_name;
      if (!entry.lastAt || s.submitted_at > entry.lastAt) entry.lastAt = s.submitted_at;
    }

    return Array.from(byProspect.values()).sort((a, b) =>
      (b.lastAt ?? "").localeCompare(a.lastAt ?? ""),
    );
  } catch {
    return [];
  }
}

/**
 * Nom de l'ingénieur connecté, lu depuis public.users (ctx.userId = id métier).
 * Renvoie null si indisponible — l'eyebrow s'affiche alors sans nom.
 */
async function fetchEngineerName(ctx: SessionContext): Promise<string | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", ctx.userId)
      .maybeSingle();
    if (!data) return null;
    const name = `${(data.first_name ?? "").trim()} ${(data.last_name ?? "").trim()}`.trim();
    return name || null;
  } catch {
    return null;
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function computeKpis(prospects: Prospect[]): KpiBlock[] {
  const total = prospects.length;
  const complets = prospects.filter((p) => p.kinds.complet).length;
  const qualifies = prospects.filter((p) => p.kinds.qualification).length;
  const rdvOnly = prospects.filter(
    (p) => p.kinds.rdv && !p.kinds.simple && !p.kinds.qualification && !p.kinds.complet,
  ).length;

  return [
    { label: "Prospects", value: String(total), meta: "ayant soumis un DCI" },
    {
      label: "DCI complets",
      value: String(complets),
      valueTone: "gold",
      meta: "prêts pour l'entrée en relation",
    },
    { label: "Qualifiés", value: String(qualifies), meta: "questionnaire investisseur reçu" },
    { label: "RDV seul", value: String(rdvOnly), meta: "à relancer pour le DCI" },
  ];
}

function KindBadge({ kind }: { kind: DciKind }) {
  const tone =
    kind === "complet"
      ? "bg-[var(--gold)] text-white"
      : kind === "qualification"
        ? "bg-[var(--gold-100)] text-[var(--gold-deep)]"
        : "bg-[var(--navy-100)] text-[var(--navy-300)]";
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] ${tone}`}
    >
      {KIND_SHORT[kind]}
    </span>
  );
}

export default async function ProspectsPage() {
  const ctx = await getSessionContext();
  const prospects = await fetchProspects();
  const kpis = computeKpis(prospects);

  const engineerName = ctx ? await fetchEngineerName(ctx) : null;
  const eyebrow = engineerName
    ? `Parcours d'entrée · prospects · vue par ${engineerName}`
    : "Parcours d'entrée · prospects";

  return (
    <>
      <Topbar current="Mes prospects" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow={eyebrow}
          title="Mes prospects"
          description={`Prospects ayant soumis un document de collecte d'informations (DCI) avant de devenir clients · ${prospects.length} prospect${prospects.length > 1 ? "s" : ""} en cours de qualification.`}
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {prospects.length > 0 ? (
          <section className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-left">
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                    Prospect
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                    DCI soumis
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                    Dernière soumission
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((p) => {
                  const submitted = KINDS.filter((k) => p.kinds[k]);
                  return (
                    <tr
                      key={p.slug}
                      className="border-b border-[var(--navy-100)] last:border-b-0 hover:bg-[var(--ivory)]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--navy)]">{p.name}</div>
                        <div className="text-[10.5px] text-[var(--navy-300)]">{p.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {submitted.length > 0 ? (
                            submitted.map((k) => (
                              <span key={k} title={KIND_LABELS[k]}>
                                <KindBadge kind={k} />
                              </span>
                            ))
                          ) : (
                            <span className="text-[var(--navy-300)]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--navy-300)]">{fmtDate(p.lastAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/visio?prospect=${encodeURIComponent(p.slug)}&nom=${encodeURIComponent(p.name)}`}
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--navy)] transition hover:border-[var(--gold)]"
                        >
                          Lancer la visio →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ) : (
          <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
            <div className="mb-3 text-[40px] leading-none">📥</div>
            <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
              Aucun prospect pour l&apos;instant
            </div>
            <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Dès qu&apos;un prospect soumet un DCI (prise de RDV, questionnaire ou DCI complet),
              il apparaît ici avant son entrée en relation.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
