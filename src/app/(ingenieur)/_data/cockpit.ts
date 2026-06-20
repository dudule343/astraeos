import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// Données du cockpit ingénieur (vue cabinet). Contrairement à /mon-activite qui
// filtre sur engineer_id, on requête ici par cabinet_id + tenant_id afin d'avoir
// un tableau de bord PEUPLÉ : les 13 dossiers, le pipeline par étape et les
// clients servis existent au niveau cabinet. Les KPI financiers (CA) et l'agenda
// dégradent proprement à 0 tant que souscriptions / commissions / rdv sont vides.
//
// Aucune table ni colonne hors de celles confirmées dans le schéma réel n'est
// utilisée. Tout est en try/catch -> valeurs neutres, jamais de throw.

export const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
  "00_archive": "Archivé",
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

export type PriorityDossier = {
  id: string;
  clientName: string;
  ref: string;
  stage: string;
  stageLabel: string;
  stageNum: number;
  pct: number | null;
  createdAt: string | null;
};

export type AgendaItem = {
  id: string;
  clientName: string;
  scheduledAt: string;
  label: string;
};

export type AlertSeverity = "critique" | "moyen" | "info";

export type Alert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
};

export type CockpitDashboard = {
  caGenere: number;
  etudesEnCours: number;
  etudesLivrees: number;
  clientsServis: number;
  prospectsActifs: number;
  dossiersActifs: number;
  rdvAVenir: number;
  contratsAssurance: number;
  clientsAssurance: number;
  encoursFinancier: number;
  clientsFinancier: number;
  projetsImmo: number;
  clientsImmo: number;
  montantImmo: number;
  pipeline: PipelineStage[];
  priorites: PriorityDossier[];
  agenda: AgendaItem[];
  alerts: Alert[];
  hasData: boolean;
};

const EMPTY: CockpitDashboard = {
  caGenere: 0,
  etudesEnCours: 0,
  etudesLivrees: 0,
  clientsServis: 0,
  prospectsActifs: 0,
  dossiersActifs: 0,
  rdvAVenir: 0,
  contratsAssurance: 0,
  clientsAssurance: 0,
  encoursFinancier: 0,
  clientsFinancier: 0,
  projetsImmo: 0,
  clientsImmo: 0,
  montantImmo: 0,
  pipeline: PIPELINE_ORDER.map((s) => ({ stage: s, label: STAGE_LABELS[s] ?? s, count: 0 })),
  priorites: [],
  agenda: [],
  alerts: [],
  hasData: false,
};

type Personne = { first_name?: string; last_name?: string };
type ClientEmbed = { personnes?: Personne[] | Personne | null };
type DossierRow = {
  id: string;
  pipeline_stage: string | null;
  client_id: string | null;
  dci_completion_pct: number | null;
  stage_entered_at: string | null;
  created_at: string | null;
  clients?: ClientEmbed | ClientEmbed[] | null;
};

function clientNameOf(row: DossierRow): string {
  const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
  const persons = client?.personnes;
  const p = Array.isArray(persons) ? persons[0] : persons;
  if (!p) return "Dossier sans nom";
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return name || "Dossier sans nom";
}

function surnameOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] ?? name;
  return last.toUpperCase();
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function stageNumOf(stage: string): number {
  const idx = PIPELINE_ORDER.indexOf(stage);
  return idx >= 0 ? idx + 1 : 0;
}

function refOf(id: string): string {
  return `DOS-${id.slice(0, 8).toUpperCase()}`;
}

function rdvLabel(type?: string | null, format?: string | null): string {
  const parts: string[] = [];
  if (type) parts.push(type.replace(/_/g, " "));
  if (format) parts.push(format.replace(/_/g, " "));
  return parts.length > 0 ? parts.join(" · ") : "Rendez-vous";
}

export async function fetchCockpitDashboard(): Promise<CockpitDashboard> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Dossiers du cabinet (vue peuplée, sans filtre engineer_id).
    const { data: dossiersRaw } = await supabase
      .from("dossiers")
      .select(
        "id, pipeline_stage, client_id, dci_completion_pct, stage_entered_at, created_at, clients(personnes(first_name, last_name))",
      )
      .eq("cabinet_id", ctx.cabinetId)
      .eq("tenant_id", ctx.tenantId)
      .order("stage_entered_at", { ascending: false });

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
    const prospectsActifs = counts.get("01_prospect") ?? 0;

    // Études prioritaires : dossiers en cours d'instruction (avant restitution).
    const PROD_STAGES = new Set(["02_compliance", "03_collecte", "04_etudes", "05_restituee"]);
    const priorites: PriorityDossier[] = dossiers
      .filter((d) => PROD_STAGES.has(d.pipeline_stage ?? ""))
      .slice(0, 6)
      .map((d) => {
        const stage = d.pipeline_stage ?? "01_prospect";
        return {
          id: d.id,
          clientName: clientNameOf(d),
          ref: refOf(d.id),
          stage,
          stageLabel: STAGE_LABELS[stage] ?? stage,
          stageNum: stageNumOf(stage),
          pct: d.dci_completion_pct != null ? Number(d.dci_completion_pct) : null,
          createdAt: d.created_at,
        };
      });

    // Alertes dérivées de l'état réel des dossiers en production : conformité
    // bloquée, collecte incomplète, restitution proche. Pas de table dédiée :
    // on lit les signaux déjà présents (étape + complétude DCI + ancienneté).
    const alerts: Alert[] = [];
    for (const d of dossiers) {
      if (alerts.length >= 4) break;
      const stage = d.pipeline_stage ?? "";
      const name = surnameOf(clientNameOf(d));
      const age = daysSince(d.stage_entered_at);
      if (stage === "02_compliance") {
        alerts.push({
          id: `alert-${d.id}`,
          severity: "critique",
          title: `${name} · conformité en attente`,
          detail: age != null ? `Étape conformité depuis ${age} jour${age > 1 ? "s" : ""}` : "Conformité à finaliser",
        });
      } else if (stage === "03_collecte") {
        const pct = d.dci_completion_pct != null ? Math.round(Number(d.dci_completion_pct)) : null;
        alerts.push({
          id: `alert-${d.id}`,
          severity: "moyen",
          title: `${name} · collecte en cours`,
          detail: pct != null ? `Dossier complété à ${pct} %` : "Documents en attente",
        });
      } else if (stage === "05_restituee") {
        alerts.push({
          id: `alert-${d.id}`,
          severity: "info",
          title: `${name} · restitution à préparer`,
          detail: "Étude prête, restitution à planifier",
        });
      }
    }

    // Études (table etudes) rattachées aux dossiers du cabinet : en cours vs livrées.
    let etudesEnCours = 0;
    let etudesLivrees = 0;
    if (dossierIds.length > 0) {
      const { data: etudes } = await supabase
        .from("etudes")
        .select("id, delivered_at")
        .in("dossier_id", dossierIds);
      for (const e of etudes ?? []) {
        const delivered = (e as { delivered_at?: string | null }).delivered_at;
        if (delivered) etudesLivrees += 1;
        else etudesEnCours += 1;
      }
    }

    // RDV à venir + agenda du jour (table rdv au niveau cabinet).
    let rdvAVenir = 0;
    const agenda: AgendaItem[] = [];
    {
      // rdv n'a pas de client_id direct : on remonte le client via le dossier.
      const { data: rdvRaw } = await supabase
        .from("rdv")
        .select(
          "id, scheduled_at, type, format, dossiers(clients(personnes(first_name, last_name)))",
        )
        .eq("cabinet_id", ctx.cabinetId)
        .eq("tenant_id", ctx.tenantId)
        .gte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })
        .limit(20);
      type DossierEmbed = { clients?: ClientEmbed | ClientEmbed[] | null };
      const rdvs = (rdvRaw ?? []) as Array<{
        id: string;
        scheduled_at: string | null;
        type?: string | null;
        format?: string | null;
        dossiers?: DossierEmbed | DossierEmbed[] | null;
      }>;
      rdvAVenir = rdvs.length;
      for (const r of rdvs.slice(0, 4)) {
        if (!r.scheduled_at) continue;
        const dossier = Array.isArray(r.dossiers) ? r.dossiers[0] : r.dossiers;
        agenda.push({
          id: r.id,
          clientName: clientNameOf({ clients: dossier?.clients } as DossierRow),
          scheduledAt: r.scheduled_at,
          label: rdvLabel(r.type, r.format),
        });
      }
    }

    // CA généré + ventilation par classe d'actif (via produits.category).
    // Assurance = av_* / prevoyance ; financier = per / scpi / fpci / opci /
    // structure (encours) ; immobilier = scpi / opci / fpci (projets).
    let caGenere = 0;
    let contratsAssurance = 0;
    let encoursFinancier = 0;
    let projetsImmo = 0;
    let montantImmo = 0;
    const clientsAssuranceSet = new Set<string>();
    const clientsFinancierSet = new Set<string>();
    const clientsImmoSet = new Set<string>();
    {
      const ASSURANCE = new Set(["av_multisupport", "av_lux", "prevoyance"]);
      const FINANCIER = new Set(["per", "structure", "av_multisupport", "av_lux"]);
      const IMMO = new Set(["scpi", "opci", "fpci"]);
      const { data: subs } = await supabase
        .from("souscriptions")
        .select("amount_initial, total_aum_current, client_id, produits(category)")
        .eq("cabinet_id", ctx.cabinetId)
        .eq("tenant_id", ctx.tenantId);
      type SubRow = {
        amount_initial?: number | null;
        total_aum_current?: number | null;
        client_id?: string | null;
        produits?: { category?: string | null } | { category?: string | null }[] | null;
      };
      for (const raw of (subs ?? []) as SubRow[]) {
        const init = raw.amount_initial != null ? Number(raw.amount_initial) : 0;
        const aum = raw.total_aum_current != null ? Number(raw.total_aum_current) : 0;
        caGenere += init;
        const prod = Array.isArray(raw.produits) ? raw.produits[0] : raw.produits;
        const cat = prod?.category ?? "";
        const cid = raw.client_id ?? "";
        if (ASSURANCE.has(cat)) {
          contratsAssurance += 1;
          if (cid) clientsAssuranceSet.add(cid);
        }
        if (FINANCIER.has(cat)) {
          encoursFinancier += aum > 0 ? aum : init;
          if (cid) clientsFinancierSet.add(cid);
        }
        if (IMMO.has(cat)) {
          projetsImmo += 1;
          montantImmo += init;
          if (cid) clientsImmoSet.add(cid);
        }
      }
    }

    return {
      caGenere,
      etudesEnCours,
      etudesLivrees,
      clientsServis,
      prospectsActifs,
      dossiersActifs,
      rdvAVenir,
      contratsAssurance,
      clientsAssurance: clientsAssuranceSet.size,
      encoursFinancier,
      clientsFinancier: clientsFinancierSet.size,
      projetsImmo,
      clientsImmo: clientsImmoSet.size,
      montantImmo,
      pipeline,
      priorites,
      agenda,
      alerts,
      hasData: dossiers.length > 0,
    };
  } catch {
    return EMPTY;
  }
}

export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

export function fmtHeure(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export function fmtJour(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return "—";
  }
}
