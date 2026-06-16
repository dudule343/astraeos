import Link from "next/link";

import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero } from "../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const STAGES = [
  { key: "01_prospect", num: "1", label: "Prospects" },
  { key: "02_compliance", num: "2", label: "Conformité" },
  { key: "03_collecte", num: "3", label: "Collecte" },
  { key: "04_etudes", num: "4", label: "Études" },
  { key: "05_restituee", num: "5", label: "Restituées" },
  { key: "06_suivi", num: "6", label: "Suivi" },
] as const;

const WEATHER: Record<string, string> = {
  sunny: "☀️",
  cloudy: "⛅",
  rainy: "🌧️",
  storm: "⛈️",
};

const PRIORITY_CLASS: Record<string, string> = {
  urgent: "bg-[var(--red-text)] text-[var(--ivory)]",
  high: "bg-[var(--gold)] text-[var(--ivory)]",
  normal: "bg-[var(--navy-100)] text-[var(--navy-300)]",
  low: "bg-[var(--navy-100)] text-[var(--navy-300)]",
};

type Dossier = {
  id: string;
  stage: string;
  name: string;
  priority: string | null;
  weather: string | null;
  dciPct: number | null;
};

async function fetchDossiers(): Promise<Dossier[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          pipeline_stage,
          priority,
          weather_indicator,
          dci_completion_pct,
          internal_notes,
          clients ( personnes ( first_name, last_name ) )
        `,
      )
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
      const clientRaw = d.clients as { personnes?: Array<{ first_name?: string; last_name?: string }> } | Array<{ personnes?: Array<{ first_name?: string; last_name?: string }> }> | null | undefined;
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
        weather: (d.weather_indicator as string) ?? null,
        dciPct: (d.dci_completion_pct as number) ?? null,
      };
    });
  } catch {
    return [];
  }
}

function computeKpis(dossiers: Dossier[]): KpiBlock[] {
  const total = dossiers.length;
  const enCours = dossiers.filter((d) => d.stage !== "06_suivi" && d.stage !== "00_archive").length;
  const suivi = dossiers.filter((d) => d.stage === "06_suivi").length;
  return [
    { label: "Dossiers actifs", value: String(total), meta: "tous parcours confondus" },
    { label: "En production", value: String(enCours), meta: "étapes 1 à 5" },
    { label: "Clients en suivi", value: String(suivi), meta: "étude restituée" },
  ];
}

export default async function DossiersPage() {
  const dossiers = await fetchDossiers();
  const kpis = computeKpis(dossiers);

  return (
    <>
      <Topbar current="Pipeline des dossiers" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Opérations clients · 6 étapes du dossier"
          title="Pipeline des dossiers"
          description="L'ensemble des dossiers patrimoniaux en cours, répartis sur les 6 étapes du parcours : du prospect à la mise en suivi. Chaque carte ouvre la fiche dossier et sa timeline."
        />

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {dossiers.length > 0 ? (
          <section className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {STAGES.map((stage) => {
              const cards = dossiers.filter((d) => d.stage === stage.key);
              return (
                <div key={stage.key} className="flex flex-col">
                  <div className="mb-2 flex items-center gap-2 border-b border-[var(--navy-100)] pb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-[var(--ivory)]">
                      {stage.num}
                    </span>
                    <span className="text-[12px] font-semibold text-[var(--navy)]">
                      {stage.label}
                    </span>
                    <span className="ml-auto text-[11px] font-semibold text-[var(--navy-300)]">
                      {cards.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {cards.map((d) => (
                      <Link
                        key={d.id}
                        href={`/dossiers/${d.id}`}
                        className="block rounded-md border border-[var(--navy-100)] bg-white p-3 transition hover:border-[var(--gold)]"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className="text-[12.5px] font-semibold leading-tight text-[var(--navy)]">
                            {d.name}
                          </span>
                          {d.weather && <span className="text-[13px] leading-none">{WEATHER[d.weather] ?? ""}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {d.priority && (
                            <span
                              className={`rounded-sm px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] ${
                                PRIORITY_CLASS[d.priority] ?? PRIORITY_CLASS.normal
                              }`}
                            >
                              {d.priority}
                            </span>
                          )}
                          {d.dciPct != null && (
                            <span className="text-[10.5px] font-semibold text-[var(--navy-300)]">
                              DCI {d.dciPct}%
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                    {cards.length === 0 && (
                      <div className="rounded-md border border-dashed border-[var(--navy-100)] p-3 text-center text-[10.5px] text-[var(--navy-300)]">
                        Aucun dossier
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
