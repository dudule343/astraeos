import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// Tableau de bord personnel de l'ingénieur : tout est filtré sur SON engineer_id
// (= getSessionContext().userId) et son tenant. En mode legacy (auth off), le
// contexte renvoie l'ingénieur du seed → données réelles de cet ingénieur.

export const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
};

const PIPELINE_ORDER = [
  "01_prospect",
  "02_compliance",
  "03_collecte",
  "04_etudes",
  "05_restituee",
  "06_suivi",
];

export type PipelineStage = { stage: string; label: string; count: number };
export type RecentDossier = {
  id: string;
  stage: string;
  stageLabel: string;
  clientName: string | null;
  createdAt: string | null;
};

export type MonActivite = {
  caGenere: number;
  etudesLivrees: number;
  clientsServis: number;
  rdvAVenir: number;
  dossiersActifs: number;
  pipeline: PipelineStage[];
  recent: RecentDossier[];
  hasData: boolean;
};

const EMPTY: MonActivite = {
  caGenere: 0,
  etudesLivrees: 0,
  clientsServis: 0,
  rdvAVenir: 0,
  dossiersActifs: 0,
  pipeline: PIPELINE_ORDER.map((s) => ({ stage: s, label: STAGE_LABELS[s] ?? s, count: 0 })),
  recent: [],
  hasData: false,
};

type Personne = { first_name?: string; last_name?: string };
type ClientEmbed = { personnes?: Personne[] | Personne | null };
type DossierRow = {
  id: string;
  pipeline_stage: string | null;
  client_id: string | null;
  created_at: string | null;
  clients?: ClientEmbed | ClientEmbed[] | null;
};

function clientNameOf(row: DossierRow): string | null {
  // Supabase peut renvoyer l'embed en objet ou en tableau selon la relation.
  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
  const persons = client?.personnes;
  const p = Array.isArray(persons) ? persons[0] : persons;
  if (!p) return null;
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return name || null;
}

export async function fetchMonActivite(): Promise<MonActivite> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();
    const engineerId = ctx.userId;
    const now = new Date().toISOString();

    // Mes dossiers (avec le représentant du client, pour la liste récente).
    const { data: dossiersRaw } = await supabase
      .from("dossiers")
      .select(
        "id, pipeline_stage, client_id, created_at, clients(personnes(first_name, last_name))",
      )
      .eq("engineer_id", engineerId)
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false });

    const dossiers = (dossiersRaw ?? []) as DossierRow[];
    const dossierIds = dossiers.map((d) => d.id);

    // Pipeline par étape.
    const counts = new Map<string, number>();
    for (const d of dossiers) {
      const s = d.pipeline_stage ?? "01_prospect";
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    const pipeline = PIPELINE_ORDER.map((stage) => ({
      stage,
      label: STAGE_LABELS[stage] ?? stage,
      count: counts.get(stage) ?? 0,
    }));

    const clientsServis = new Set(dossiers.map((d) => d.client_id).filter(Boolean)).size;
    const dossiersActifs = dossiers.filter((d) => d.pipeline_stage !== "00_archive").length;

    // Études livrées sur mes dossiers.
    let etudesLivrees = 0;
    if (dossierIds.length > 0) {
      const { count } = await supabase
        .from("etudes")
        .select("id", { count: "exact", head: true })
        .in("dossier_id", dossierIds);
      etudesLivrees = count ?? 0;
    }

    // RDV à venir (table rdv, engineer_id = moi).
    const { count: rdvCount } = await supabase
      .from("rdv")
      .select("id", { count: "exact", head: true })
      .eq("engineer_id", engineerId)
      .eq("tenant_id", ctx.tenantId)
      .gte("scheduled_at", now);
    const rdvAVenir = rdvCount ?? 0;

    // CA généré : souscriptions où je suis l'ingénieur (amount_initial, dédupliqué).
    let caGenere = 0;
    const { data: subs } = await supabase
      .from("souscriptions")
      .select("id, amount_initial")
      .eq("engineer_id", engineerId)
      .eq("tenant_id", ctx.tenantId);
    for (const s of subs ?? []) {
      caGenere += s.amount_initial != null ? Number(s.amount_initial) : 0;
    }

    const recent: RecentDossier[] = dossiers.slice(0, 6).map((d) => ({
      id: d.id,
      stage: d.pipeline_stage ?? "01_prospect",
      stageLabel: STAGE_LABELS[d.pipeline_stage ?? "01_prospect"] ?? (d.pipeline_stage ?? "—"),
      clientName: clientNameOf(d),
      createdAt: d.created_at,
    }));

    return {
      caGenere,
      etudesLivrees,
      clientsServis,
      rdvAVenir,
      dossiersActifs,
      pipeline,
      recent,
      hasData: dossiers.length > 0 || caGenere > 0,
    };
  } catch {
    return EMPTY;
  }
}

export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}
