import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

/**
 * Données réelles de la zone « Mon activité » de l'ingénieur connecté
 * (tableau de bord + activité commerciale). Tout est filtré sur engineer_id
 * (scope ingénieur, pas cabinet) : c'est SON portefeuille, ses RDV, ses
 * souscriptions.
 *
 * Module serveur uniquement (lit la base avec la clé service_role). JAMAIS
 * importé par un composant client : les pages serveur appellent ces fonctions
 * et passent le résultat en props. Tout est en try/catch -> état vide honnête,
 * jamais de throw qui casserait le rendu.
 */

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

const ASSURANCE_CATS = new Set(["av_multisupport", "av_lux", "prevoyance"]);
const FINANCIER_CATS = new Set(["per", "structure", "av_multisupport", "av_lux"]);
const IMMO_CATS = new Set(["scpi", "opci", "fpci"]);

type Personne = { first_name?: string | null; last_name?: string | null };
type ClientEmbed = {
  acquisition_origin?: string | null;
  personnes?: Personne[] | Personne | null;
};
type DossierRow = {
  id: string;
  pipeline_stage: string | null;
  client_id: string | null;
  dci_completion_pct: number | null;
  stage_entered_at: string | null;
  created_at: string | null;
  clients?: ClientEmbed | ClientEmbed[] | null;
};

type DossierEmbed = { clients?: ClientEmbed | ClientEmbed[] | null };
type DossierWithClientId = DossierEmbed & { client_id?: string | null };
type RdvRow = {
  id: string;
  scheduled_at: string | null;
  type: string | null;
  format: string | null;
  duration_minutes: number | null;
  status: string | null;
  dossiers?: DossierEmbed | DossierEmbed[] | null;
};

function clientOf(row: { clients?: ClientEmbed | ClientEmbed[] | null }): ClientEmbed | null {
  return Array.isArray(row.clients) ? row.clients[0] ?? null : row.clients ?? null;
}

function clientNameOf(client: ClientEmbed | null): string {
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

const RDV_TYPE_LABELS: Record<string, string> = {
  decouverte: "Entretien initial",
  collecte: "Point collecte",
  restitution: "Restitution étude",
  suivi_annuel: "Suivi annuel",
  signature: "Signature",
  autre: "Rendez-vous",
};

const RDV_FORMAT_LABELS: Record<string, string> = {
  visio: "Visio",
  telephone: "Téléphone",
  presentiel: "Présentiel",
};

function rdvTypeLabel(type: string | null): string {
  if (!type) return "Rendez-vous";
  return RDV_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

function rdvFormatLabel(format: string | null): string {
  if (!format) return "—";
  return RDV_FORMAT_LABELS[format] ?? format.replace(/_/g, " ");
}

// ── Dashboard (tableau de bord) ────────────────────────────────────────────

export type DashKpi = {
  label: string;
  value: string;
  unit?: string;
  gold?: boolean;
  meta: string;
};

export type DashEtude = {
  id: string;
  initials: string;
  client: string;
  ref: string;
  stageLabel: string;
  stageNum: number;
  pct: number | null;
  honoraires: string;
  dossierHref: string;
};

export type DashAlerte = {
  id: string;
  dot: "orange" | "gold" | "navy";
  title: string;
  detail: string;
};

export type DashRdv = {
  id: string;
  heure: string;
  jour: string;
  client: string;
  meta: string;
};

export type DashSante = {
  label: string;
  value: string;
  pct: number;
  tone: "green" | "gold";
  meta: string;
};

export type DashboardData = {
  prenom: string;
  dateLabel: string;
  heroSub: string;
  kpis: DashKpi[];
  etudes: DashEtude[];
  etudesCount: string;
  alertes: DashAlerte[];
  alertesCount: string;
  rdvDuJour: DashRdv[];
  rdvDuJourMeta: string;
  sante: DashSante[];
  santeScore: string;
  hasData: boolean;
};

function fmtEur(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")}`;
}

function fmtHeure(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function dayBucket(iso: string): { jour: string; isToday: boolean } {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return { jour: "Auj.", isToday: true };
  return {
    jour: d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit" }),
    isToday: false,
  };
}

const EMPTY_DASHBOARD: DashboardData = {
  prenom: "Ingénieur",
  dateLabel: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
  heroSub: "Aucune donnée à afficher pour le moment.",
  kpis: [],
  etudes: [],
  etudesCount: "0 étude en cours",
  alertes: [],
  alertesCount: "0 alerte",
  rdvDuJour: [],
  rdvDuJourMeta: "aucun RDV aujourd'hui",
  sante: [],
  santeScore: "—",
  hasData: false,
};

export async function fetchDashboard(): Promise<DashboardData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY_DASHBOARD;
    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();

    // Prénom de l'ingénieur connecté.
    let prenom = "Ingénieur";
    {
      const { data: me } = await supabase
        .from("users")
        .select("first_name")
        .eq("id", ctx.userId)
        .maybeSingle();
      if (me?.first_name) prenom = me.first_name;
    }

    // Dossiers de l'ingénieur.
    const { data: dossiersRaw } = await supabase
      .from("dossiers")
      .select(
        "id, pipeline_stage, client_id, dci_completion_pct, stage_entered_at, created_at, clients(acquisition_origin, personnes(first_name, last_name))",
      )
      .eq("engineer_id", ctx.userId)
      .order("stage_entered_at", { ascending: false });
    const dossiers = (dossiersRaw ?? []) as DossierRow[];
    const dossierIds = dossiers.map((d) => d.id);

    const counts = new Map<string, number>();
    for (const d of dossiers) {
      const s = d.pipeline_stage ?? "01_prospect";
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    const clientsServis = new Set(dossiers.map((d) => d.client_id).filter(Boolean)).size;
    const prospectsActifs = counts.get("01_prospect") ?? 0;
    const PROD_STAGES = new Set(["02_compliance", "03_collecte", "04_etudes", "05_restituee"]);
    const etudesEnCoursCount = dossiers.filter((d) => PROD_STAGES.has(d.pipeline_stage ?? "")).length;

    // Études (table etudes) -> livrées vs en cours.
    let etudesLivrees = 0;
    if (dossierIds.length > 0) {
      const { data: etudes } = await supabase
        .from("etudes")
        .select("delivered_at")
        .in("dossier_id", dossierIds);
      for (const e of etudes ?? []) {
        if ((e as { delivered_at?: string | null }).delivered_at) etudesLivrees += 1;
      }
    }

    // Souscriptions de l'ingénieur -> CA + ventilation par classe d'actif.
    let caGenere = 0;
    let contratsAssurance = 0;
    let encoursFinancier = 0;
    let projetsImmo = 0;
    let montantImmo = 0;
    const clientsAssurance = new Set<string>();
    const clientsFinancier = new Set<string>();
    const clientsImmo = new Set<string>();
    {
      const { data: subs } = await supabase
        .from("souscriptions")
        .select("amount_initial, total_aum_current, client_id, produits(category)")
        .eq("engineer_id", ctx.userId);
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
        if (ASSURANCE_CATS.has(cat)) {
          contratsAssurance += 1;
          if (cid) clientsAssurance.add(cid);
        }
        if (FINANCIER_CATS.has(cat)) {
          encoursFinancier += aum > 0 ? aum : init;
          if (cid) clientsFinancier.add(cid);
        }
        if (IMMO_CATS.has(cat)) {
          projetsImmo += 1;
          montantImmo += init;
          if (cid) clientsImmo.add(cid);
        }
      }
    }

    const yearLabel = new Date().getFullYear();
    const kpis: DashKpi[] = [
      {
        label: "Mon CA généré",
        value: fmtEur(caGenere),
        unit: "€",
        gold: true,
        meta: `cumul des souscriptions · ${yearLabel}`,
      },
      {
        label: "Études réalisées et restituées",
        value: String(etudesLivrees),
        meta: `cumul ${yearLabel} · ${etudesEnCoursCount} en cours`,
      },
      {
        label: "Investissements financiers",
        value: fmtEur(encoursFinancier),
        unit: "€",
        meta: `encours sous gestion · ${clientsFinancier.size} client${clientsFinancier.size > 1 ? "s" : ""} concerné${clientsFinancier.size > 1 ? "s" : ""}`,
      },
      {
        label: "Assurance",
        value: String(contratsAssurance),
        unit: "contrats",
        meta: `${clientsAssurance.size} client${clientsAssurance.size > 1 ? "s" : ""} concerné${clientsAssurance.size > 1 ? "s" : ""}`,
      },
      {
        label: "Investissements immobiliers",
        value: String(projetsImmo),
        unit: "projets",
        meta: `${clientsImmo.size} client${clientsImmo.size > 1 ? "s" : ""} · ${fmtEur(montantImmo)} € engagés`,
      },
    ];

    // Études prioritaires (dossiers en instruction).
    const etudes: DashEtude[] = dossiers
      .filter((d) => PROD_STAGES.has(d.pipeline_stage ?? ""))
      .slice(0, 6)
      .map((d) => {
        const stage = d.pipeline_stage ?? "01_prospect";
        const name = clientNameOf(clientOf(d));
        return {
          id: d.id,
          initials: surnameOf(name).slice(0, 2),
          client: name,
          ref: `${refOf(d.id)} · ${STAGE_LABELS[stage] ?? stage}`,
          stageLabel: `Étape 0${stageNumOf(stage)} · ${STAGE_LABELS[stage] ?? stage}`,
          stageNum: stageNumOf(stage),
          pct: d.dci_completion_pct != null ? Number(d.dci_completion_pct) : null,
          honoraires: "—",
          dossierHref: `/espace-ingenieur/dossiers/${d.id}`,
        };
      });

    // Alertes dérivées de l'état réel.
    const alertes: DashAlerte[] = [];
    for (const d of dossiers) {
      if (alertes.length >= 4) break;
      const stage = d.pipeline_stage ?? "";
      const name = surnameOf(clientNameOf(clientOf(d)));
      const age = daysSince(d.stage_entered_at);
      if (stage === "02_compliance") {
        alertes.push({
          id: `alert-${d.id}`,
          dot: "orange",
          title: `${name} · conformité en attente`,
          detail: age != null ? `Étape conformité depuis ${age} jour${age > 1 ? "s" : ""}` : "Conformité à finaliser",
        });
      } else if (stage === "03_collecte") {
        const pct = d.dci_completion_pct != null ? Math.round(Number(d.dci_completion_pct)) : null;
        alertes.push({
          id: `alert-${d.id}`,
          dot: "gold",
          title: `${name} · collecte en cours`,
          detail: pct != null ? `Dossier complété à ${pct} %` : "Documents en attente",
        });
      } else if (stage === "05_restituee") {
        alertes.push({
          id: `alert-${d.id}`,
          dot: "navy",
          title: `${name} · restitution à préparer`,
          detail: "Étude prête, restitution à planifier",
        });
      }
    }

    // RDV à venir (les plus proches), regroupés « du jour » si même date.
    const rdvDuJour: DashRdv[] = [];
    let rdvMeta = "aucun RDV à venir";
    {
      const { data: rdvRaw } = await supabase
        .from("rdv")
        .select(
          "id, scheduled_at, type, format, dossiers(clients(personnes(first_name, last_name)))",
        )
        .eq("engineer_id", ctx.userId)
        .gte("scheduled_at", nowIso)
        .order("scheduled_at", { ascending: true })
        .limit(6);
      const rdvs = (rdvRaw ?? []) as RdvRow[];
      for (const r of rdvs.slice(0, 4)) {
        if (!r.scheduled_at) continue;
        const dossier = Array.isArray(r.dossiers) ? r.dossiers[0] : r.dossiers;
        const name = clientNameOf(clientOf({ clients: dossier?.clients }));
        const bucket = dayBucket(r.scheduled_at);
        rdvDuJour.push({
          id: r.id,
          heure: fmtHeure(r.scheduled_at),
          jour: bucket.jour,
          client: name,
          meta: `${rdvTypeLabel(r.type)} · ${rdvFormatLabel(r.format)}`,
        });
      }
      if (rdvs.length > 0) {
        const next = rdvs[0].scheduled_at ? new Date(rdvs[0].scheduled_at) : null;
        rdvMeta = next
          ? `prochain · ${next.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}`
          : `${rdvs.length} RDV à venir`;
      }
    }

    // Santé du portefeuille : 2 barres calculées sur du réel, honnêtes.
    const dossiersActifs = dossiers.filter((d) => d.pipeline_stage !== "00_archive").length;
    const conformiteBloquee = counts.get("02_compliance") ?? 0;
    const conformitePct =
      dossiersActifs > 0
        ? Math.round(((dossiersActifs - conformiteBloquee) / dossiersActifs) * 100)
        : 100;
    const enSuivi = counts.get("06_suivi") ?? 0;
    const fidelisationPct = dossiersActifs > 0 ? Math.round((enSuivi / dossiersActifs) * 100) : 0;
    const sante: DashSante[] = [
      {
        label: "Conformité réglementaire",
        value: `${conformitePct} %`,
        pct: conformitePct,
        tone: conformitePct >= 90 ? "green" : "gold",
        meta:
          conformiteBloquee > 0
            ? `${conformiteBloquee} dossier${conformiteBloquee > 1 ? "s" : ""} en attente de conformité`
            : "Tous mes dossiers actifs sont conformes",
      },
      {
        label: "Clients fidélisés (en suivi)",
        value: `${fidelisationPct} %`,
        pct: fidelisationPct,
        tone: fidelisationPct >= 50 ? "green" : "gold",
        meta: `${enSuivi} client${enSuivi > 1 ? "s" : ""} en suivi récurrent sur ${dossiersActifs} dossier${dossiersActifs > 1 ? "s" : ""} actif${dossiersActifs > 1 ? "s" : ""}`,
      },
      {
        label: "Activité commerciale",
        value: `${prospectsActifs} prospect${prospectsActifs > 1 ? "s" : ""}`,
        pct: Math.min(100, prospectsActifs * 20),
        tone: prospectsActifs > 0 ? "gold" : "green",
        meta: `${etudesEnCoursCount} étude${etudesEnCoursCount > 1 ? "s" : ""} en cours d'instruction`,
      },
    ];

    const santeScore = `${Math.round((conformitePct + fidelisationPct) / 2)} / 100`;

    return {
      prenom,
      dateLabel: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      heroSub: `Vue d'ensemble de votre activité personnelle · ${etudesEnCoursCount} étude${etudesEnCoursCount > 1 ? "s" : ""} en cours, ${prospectsActifs} prospect${prospectsActifs > 1 ? "s" : ""} actif${prospectsActifs > 1 ? "s" : ""}, ${clientsServis} client${clientsServis > 1 ? "s" : ""} en suivi. ${fmtEur(caGenere)} € de CA généré.`,
      kpis,
      etudes,
      etudesCount: `${etudesEnCoursCount} étude${etudesEnCoursCount > 1 ? "s" : ""} en cours`,
      alertes,
      alertesCount: `${alertes.length} alerte${alertes.length > 1 ? "s" : ""}`,
      rdvDuJour,
      rdvDuJourMeta: rdvMeta,
      sante,
      santeScore,
      hasData: dossiers.length > 0,
    };
  } catch {
    return EMPTY_DASHBOARD;
  }
}

// ── Activité commerciale ────────────────────────────────────────────────────

export type ActiviteKpiData = {
  label: string;
  value: string;
  unit?: string;
  tone?: "gold" | "alert";
  meta: string;
};

export type ActionRetardData = {
  severity: "orange" | "gold";
  titre: string;
  detail: string;
  cta: string;
  href: string;
};

export type SourceAcquisitionData = {
  label: string;
  count: string;
  pct: string;
  barStyle: "gold" | "navy" | "navy-200";
  countGold: boolean;
};

export type ProchainRdvData = {
  date: string;
  dateMeta?: string;
  client: string;
  typeLabel: string;
  typeStyle: "gold" | "success" | "info" | "alert";
  lieu: string;
  etapeLabel: string;
  etapeStyle: "success" | "gold" | "alert";
  href: string;
};

export type ActiviteData = {
  kpis: ActiviteKpiData[];
  actionsBadge: string;
  actions: ActionRetardData[];
  sourcesMeta: string;
  sources: SourceAcquisitionData[];
  sourcesLecture: string;
  rdvMeta: string;
  rdv: ProchainRdvData[];
  hasData: boolean;
};

const ACQ_LABELS: Record<string, string> = {
  recommandation: "Recommandations clients",
  captation_directe: "Captation directe",
  marketing: "Marketing & digital",
  apporteur: "Apporteurs d'affaires",
  reseau: "Réseau personnel",
};

const EMPTY_ACTIVITE: ActiviteData = {
  kpis: [],
  actionsBadge: "0 action",
  actions: [],
  sourcesMeta: "—",
  sources: [],
  sourcesLecture: "Aucune donnée d'acquisition pour le moment.",
  rdvMeta: "aucun RDV à venir",
  rdv: [],
  hasData: false,
};

function typeStyleOf(type: string | null): "gold" | "success" | "info" | "alert" {
  switch (type) {
    case "restitution":
      return "gold";
    case "suivi_annuel":
      return "success";
    case "collecte":
    case "signature":
      return "alert";
    default:
      return "info";
  }
}

function etapeStyleOf(stage: string): "success" | "gold" | "alert" {
  if (stage === "05_restituee" || stage === "06_suivi") return "success";
  if (stage === "02_compliance") return "alert";
  return "gold";
}

export async function fetchActivite(): Promise<ActiviteData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY_ACTIVITE;
    const supabase = createAdminClient();
    const now = new Date();
    const nowIso = now.toISOString();
    const since30 = new Date(now.getTime() - 30 * 86_400_000).toISOString();

    // Dossiers de l'ingénieur (pour actions en retard + sources + étape RDV).
    const { data: dossiersRaw } = await supabase
      .from("dossiers")
      .select(
        "id, pipeline_stage, client_id, dci_completion_pct, stage_entered_at, clients(acquisition_origin, personnes(first_name, last_name))",
      )
      .eq("engineer_id", ctx.userId)
      .order("stage_entered_at", { ascending: false });
    const dossiers = (dossiersRaw ?? []) as DossierRow[];
    const stageByClient = new Map<string, string>();
    for (const d of dossiers) {
      if (d.client_id) stageByClient.set(d.client_id, d.pipeline_stage ?? "");
    }

    // RDV de l'ingénieur : 30 derniers jours (réalisés) + à venir.
    const { data: rdvAllRaw } = await supabase
      .from("rdv")
      .select(
        "id, scheduled_at, type, format, duration_minutes, status, dossiers(client_id, clients(personnes(first_name, last_name)))",
      )
      .eq("engineer_id", ctx.userId)
      .gte("scheduled_at", since30)
      .order("scheduled_at", { ascending: true });
    type ActiviteRdvRow = {
      id: string;
      scheduled_at: string | null;
      type: string | null;
      format: string | null;
      duration_minutes: number | null;
      status: string | null;
      dossiers?: DossierWithClientId | DossierWithClientId[] | null;
    };
    const rdvAll = (rdvAllRaw ?? []) as ActiviteRdvRow[];

    const passes = rdvAll.filter((r) => r.scheduled_at && r.scheduled_at <= nowIso);
    const aVenir = rdvAll.filter((r) => r.scheduled_at && r.scheduled_at > nowIso);

    // Délai moyen prospect -> restitution sur dossiers restitués/en suivi (proxy honnête).
    const restitues = dossiers.filter(
      (d) => d.pipeline_stage === "05_restituee" || d.pipeline_stage === "06_suivi",
    );
    const delais = restitues
      .map((d) => daysSince(d.stage_entered_at))
      .filter((n): n is number => n != null);
    const delaiMoyen =
      delais.length > 0 ? Math.round(delais.reduce((a, b) => a + b, 0) / delais.length) : null;

    // Actions en retard : dossiers bloqués (conformité / collecte incomplète).
    const actions: ActionRetardData[] = [];
    for (const d of dossiers) {
      if (actions.length >= 4) break;
      const stage = d.pipeline_stage ?? "";
      const name = clientNameOf(clientOf(d));
      const surname = surnameOf(name);
      const age = daysSince(d.stage_entered_at);
      if (stage === "02_compliance") {
        actions.push({
          severity: "orange",
          titre: `${name} · conformité en attente`,
          detail: age != null ? `Conformité bloquée depuis ${age} jour${age > 1 ? "s" : ""}` : "Conformité à finaliser",
          cta: "Relancer",
          href: `/espace-ingenieur/dossiers/${d.id}`,
        });
      } else if (stage === "03_collecte") {
        const pct = d.dci_completion_pct != null ? Math.round(Number(d.dci_completion_pct)) : null;
        actions.push({
          severity: "gold",
          titre: `${surname} · collecte en cours`,
          detail: pct != null ? `Dossier complété à ${pct} %` : "Documents en attente",
          cta: "Relancer",
          href: `/espace-ingenieur/dossiers/${d.id}`,
        });
      }
    }

    // Sources d'acquisition : ventilation réelle des clients de l'ingénieur.
    const acqCounts = new Map<string, number>();
    const seenClients = new Set<string>();
    for (const d of dossiers) {
      const cid = d.client_id ?? "";
      if (!cid || seenClients.has(cid)) continue;
      seenClients.add(cid);
      const origin = clientOf(d)?.acquisition_origin ?? "autre";
      acqCounts.set(origin, (acqCounts.get(origin) ?? 0) + 1);
    }
    const totalClients = [...acqCounts.values()].reduce((a, b) => a + b, 0);
    const sortedAcq = [...acqCounts.entries()].sort((a, b) => b[1] - a[1]);
    const barStyles: SourceAcquisitionData["barStyle"][] = ["gold", "navy", "navy-200"];
    const sources: SourceAcquisitionData[] = sortedAcq.map(([origin, count], i) => ({
      label: ACQ_LABELS[origin] ?? origin,
      count: `${count} client${count > 1 ? "s" : ""}`,
      pct: totalClients > 0 ? `${Math.round((count / totalClients) * 100)}%` : "0%",
      barStyle: barStyles[Math.min(i, barStyles.length - 1)],
      countGold: i === 0,
    }));
    let sourcesLecture = "Aucune donnée d'acquisition pour le moment.";
    if (sortedAcq.length > 0 && totalClients > 0) {
      const [topOrigin, topCount] = sortedAcq[0];
      const pct = Math.round((topCount / totalClients) * 100);
      sourcesLecture = `${pct} % de vos clients proviennent de « ${ACQ_LABELS[topOrigin] ?? topOrigin} » — votre canal d'acquisition principal.`;
    }

    // Taux RDV réalisés -> dossier en production (proxy de conversion).
    const prodStages = new Set(["02_compliance", "03_collecte", "04_etudes", "05_restituee", "06_suivi"]);
    const dossiersProd = dossiers.filter((d) => prodStages.has(d.pipeline_stage ?? "")).length;
    const tauxConversion =
      totalClients > 0 ? Math.round((dossiersProd / totalClients) * 100) : null;

    const kpis: ActiviteKpiData[] = [
      {
        label: "Rendez-vous · 30 derniers jours",
        value: String(rdvAll.length),
        meta: `${passes.length} réalisé${passes.length > 1 ? "s" : ""} · ${aVenir.length} à venir`,
      },
      {
        label: "Taux dossier → production",
        value: tauxConversion != null ? String(tauxConversion) : "—",
        unit: tauxConversion != null ? "%" : undefined,
        tone: "gold",
        meta: `${dossiersProd} dossier${dossiersProd > 1 ? "s" : ""} instruit${dossiersProd > 1 ? "s" : ""} sur ${totalClients} client${totalClients > 1 ? "s" : ""}`,
      },
      {
        label: "Actions en retard",
        value: String(actions.length),
        tone: "alert",
        meta: actions.length > 0 ? "conformité / collecte à relancer" : "aucune action en retard",
      },
      {
        label: "Délai moyen en restitution",
        value: delaiMoyen != null ? String(delaiMoyen) : "—",
        unit: delaiMoyen != null ? "jours" : undefined,
        meta: `${restitues.length} dossier${restitues.length > 1 ? "s" : ""} restitué${restitues.length > 1 ? "s" : ""}`,
      },
    ];

    // Prochains RDV (table rdv).
    const rdv: ProchainRdvData[] = aVenir.slice(0, 6).map((r) => {
      const dossier = Array.isArray(r.dossiers) ? r.dossiers[0] : r.dossiers;
      const cid = dossier?.client_id ?? "";
      const name = clientNameOf(clientOf({ clients: dossier?.clients }));
      const d = r.scheduled_at ? new Date(r.scheduled_at) : null;
      const stage = (cid && stageByClient.get(cid)) || "01_prospect";
      const diffDays = d ? Math.round((d.getTime() - now.getTime()) / 86_400_000) : null;
      let dateMeta: string | undefined;
      if (diffDays === 0) dateMeta = "Aujourd'hui";
      else if (diffDays === 1) dateMeta = "Demain";
      else if (diffDays === 2) dateMeta = "Après-demain";
      return {
        date: d
          ? `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })} · ${fmtHeure(r.scheduled_at!)}`
          : "—",
        dateMeta,
        client: name,
        typeLabel: rdvTypeLabel(r.type),
        typeStyle: typeStyleOf(r.type),
        lieu: rdvFormatLabel(r.format),
        etapeLabel: `Étape 0${stageNumOf(stage)}`,
        etapeStyle: etapeStyleOf(stage),
        href: dossier && cid ? `/espace-ingenieur/clients` : "/espace-ingenieur/agenda",
      };
    });

    return {
      kpis,
      actionsBadge: `${actions.length} action${actions.length > 1 ? "s" : ""}`,
      actions,
      sourcesMeta: `${totalClients} client${totalClients > 1 ? "s" : ""}`,
      sources,
      sourcesLecture,
      rdvMeta: `${aVenir.length} RDV à venir`,
      rdv,
      hasData: dossiers.length > 0 || rdvAll.length > 0,
    };
  } catch {
    return EMPTY_ACTIVITE;
  }
}
