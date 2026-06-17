import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Données de la page éditeur /acquisition. Périmètre = cabinet courant
// (tenant_id + cabinet_id depuis getSessionContext). En mode legacy (auth
// off), le contexte renvoie le cabinet du seed → données réelles en prod.
//
// La page d'origine mélangeait un funnel marketing (visiteurs web, leads,
// essais gratuits, dépenses pub) qui N'A AUCUNE source en base. Le seul
// funnel câblable est celui des DOSSIERS par pipeline_stage, et la seule
// segmentation d'acquisition réelle est clients.acquisition_origin.
// Tout ce qui n'a pas de source dégrade en état vide honnête (— / null),
// jamais en chiffre inventé.
// =========================================================================

const NOW = new Date();

export const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Production",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
};

// Ordre métier du pipeline (hors 00_archive, exclu des dossiers actifs).
const PIPELINE_ORDER = [
  "01_prospect",
  "02_compliance",
  "03_collecte",
  "04_etudes",
  "05_restituee",
  "06_suivi",
];

// Étape pivot : dossier considéré "converti / signé" à partir de la
// restitution (étude livrée) ou via une souscription signed/active.
const CONVERTED_STAGES = new Set(["05_restituee", "06_suivi"]);

// Libellés FR des origines d'acquisition (enum acquisition_origin).
export const ACQUISITION_ORIGIN_LABELS: Record<string, string> = {
  recommandation: "Recommandation client",
  captation_directe: "Captation directe",
  reattribution: "Réattribution",
  marketing: "Marketing",
  autre: "Autre",
  non_renseigne: "Origine non renseignée",
};

const ORIGIN_ORDER = [
  "recommandation",
  "captation_directe",
  "reattribution",
  "marketing",
  "autre",
  "non_renseigne",
];

export type FunnelStage = {
  stage: string;
  label: string;
  count: number;
  pct: number; // % relatif au 1er étage (total dossiers actifs)
  width: number; // largeur de barre, identique à pct
  highlight: boolean;
};

export type SourceRow = {
  key: string;
  label: string;
  dossiers: number;
  converted: number;
  aum: number; // somme amount_initial des souscriptions signées/actives
  convRate: number | null; // converti / dossiers, null si 0 dossier
};

export type AcquisitionData = {
  // Funnel dossiers par pipeline_stage.
  funnel: FunnelStage[];
  dossiersActifs: number;

  // KPIs volumétrie.
  dossiersOuverts30j: number;
  nouveauxProspects: number;
  dossiersCollecte: number;
  clientsConvertisMois: number;
  moisLabel: string;

  // KPIs conversion.
  dureeConversionJours: number | null; // moyenne sur dossiers convertis
  tauxConversion: number | null; // converti / total, null si dénominateur 0

  // Performance par origine d'acquisition.
  sources: SourceRow[];

  hasData: boolean;
};

const EMPTY: AcquisitionData = {
  funnel: PIPELINE_ORDER.map((s) => ({
    stage: s,
    label: STAGE_LABELS[s] ?? s,
    count: 0,
    pct: 0,
    width: 0,
    highlight: CONVERTED_STAGES.has(s),
  })),
  dossiersActifs: 0,
  dossiersOuverts30j: 0,
  nouveauxProspects: 0,
  dossiersCollecte: 0,
  clientsConvertisMois: 0,
  moisLabel: NOW.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
  dureeConversionJours: null,
  tauxConversion: null,
  sources: [],
  hasData: false,
};

type DossierRow = {
  id: string;
  pipeline_stage: string | null;
  client_id: string | null;
  created_at: string | null;
  pipeline_entry_date: string | null;
  study_delivered_at: string | null;
};

type SubRow = {
  dossier_id: string | null;
  client_id: string | null;
  amount_initial: number | string | null;
  status: string | null;
  subscription_date: string | null;
};

type ClientOriginRow = { id: string; acquisition_origin: string | null };

function daysBetween(fromIso: string | null, toIso: string | null): number | null {
  if (!fromIso || !toIso) return null;
  const a = new Date(fromIso).getTime();
  const b = new Date(toIso).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  return (b - a) / (1000 * 60 * 60 * 24);
}

export async function fetchAcquisition(): Promise<AcquisitionData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();
    const moisLabel = NOW.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    // Dossiers du cabinet.
    const { data: dossiersRaw } = await supabase
      .from("dossiers")
      .select("id, pipeline_stage, client_id, created_at, pipeline_entry_date, study_delivered_at")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);

    const dossiers = (dossiersRaw ?? []) as DossierRow[];

    // Souscriptions signées/actives du cabinet (conversion + AUM).
    const { data: subsRaw } = await supabase
      .from("souscriptions")
      .select("dossier_id, client_id, amount_initial, status, subscription_date")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("status", ["signed", "active"]);

    const subs = (subsRaw ?? []) as SubRow[];

    // Origine d'acquisition des clients du cabinet (jointure manuelle par id).
    const clientIds = [...new Set(dossiers.map((d) => d.client_id).filter(Boolean))] as string[];
    const originByClient = new Map<string, string>();
    if (clientIds.length > 0) {
      const { data: clientsRaw } = await supabase
        .from("clients")
        .select("id, acquisition_origin")
        .in("id", clientIds);
      for (const c of (clientsRaw ?? []) as ClientOriginRow[]) {
        originByClient.set(c.id, c.acquisition_origin ?? "non_renseigne");
      }
    }

    // ----- Funnel par pipeline_stage (dossiers actifs hors archive) -----
    const stageCounts = new Map<string, number>();
    let dossiersActifs = 0;
    for (const d of dossiers) {
      const s = d.pipeline_stage ?? "01_prospect";
      if (s === "00_archive") continue;
      dossiersActifs += 1;
      stageCounts.set(s, (stageCounts.get(s) ?? 0) + 1);
    }
    const denom = Math.max(1, dossiersActifs);
    const funnel: FunnelStage[] = PIPELINE_ORDER.map((stage) => {
      const count = stageCounts.get(stage) ?? 0;
      const pct = Math.round((count / denom) * 100);
      return {
        stage,
        label: STAGE_LABELS[stage] ?? stage,
        count,
        pct,
        width: pct,
        highlight: CONVERTED_STAGES.has(stage),
      };
    });

    // ----- KPIs volumétrie -----
    const cutoff30 = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dossiersOuverts30j = dossiers.filter((d) => {
      if (!d.created_at) return false;
      const t = new Date(d.created_at);
      return t >= cutoff30 && t <= NOW;
    }).length;
    const nouveauxProspects = stageCounts.get("01_prospect") ?? 0;
    const dossiersCollecte = stageCounts.get("03_collecte") ?? 0;

    // Clients convertis ce mois-ci : souscriptions signed/active dont la date
    // de souscription tombe dans le mois courant (clients distincts).
    const monthStart = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
    const convertedClientsMois = new Set<string>();
    for (const s of subs) {
      if (!s.subscription_date || !s.client_id) continue;
      const t = new Date(s.subscription_date);
      if (t >= monthStart && t <= NOW) convertedClientsMois.add(s.client_id);
    }
    const clientsConvertisMois = convertedClientsMois.size;

    // ----- KPIs conversion -----
    // Dossiers "convertis" = study_delivered_at non nul OU stage >= 05 OU
    // au moins une souscription signed/active rattachée.
    const subDossierIds = new Set(subs.map((s) => s.dossier_id).filter(Boolean) as string[]);
    const convertedDossiers = dossiers.filter(
      (d) =>
        d.study_delivered_at != null ||
        CONVERTED_STAGES.has(d.pipeline_stage ?? "") ||
        subDossierIds.has(d.id),
    );

    // Durée moyenne de conversion : pipeline_entry_date → study_delivered_at,
    // sur les dossiers ayant une étude livrée datée.
    const durations: number[] = [];
    for (const d of convertedDossiers) {
      const days = daysBetween(d.pipeline_entry_date, d.study_delivered_at);
      if (days != null) durations.push(days);
    }
    const dureeConversionJours =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

    // Taux de conversion : dossiers convertis / total dossiers (hors archive).
    const tauxConversion =
      dossiersActifs > 0 ? (convertedDossiers.length / dossiersActifs) * 100 : null;

    // ----- Performance par origine d'acquisition -----
    const aumByClient = new Map<string, number>();
    for (const s of subs) {
      const amt = s.amount_initial != null ? Number(s.amount_initial) : 0;
      if (s.client_id) aumByClient.set(s.client_id, (aumByClient.get(s.client_id) ?? 0) + amt);
    }

    type Agg = { dossiers: Set<string>; converted: Set<string>; aum: number };
    const byOrigin = new Map<string, Agg>();
    const ensure = (k: string): Agg => {
      let a = byOrigin.get(k);
      if (!a) {
        a = { dossiers: new Set(), converted: new Set(), aum: 0 };
        byOrigin.set(k, a);
      }
      return a;
    };

    for (const d of dossiers) {
      if ((d.pipeline_stage ?? "") === "00_archive") continue;
      const clientId = d.client_id;
      const origin = clientId ? originByClient.get(clientId) ?? "non_renseigne" : "non_renseigne";
      const a = ensure(origin);
      a.dossiers.add(d.id);
      const isConverted =
        d.study_delivered_at != null ||
        CONVERTED_STAGES.has(d.pipeline_stage ?? "") ||
        subDossierIds.has(d.id);
      if (isConverted && clientId) a.converted.add(clientId);
    }
    // AUM par origine : somme amount_initial des souscriptions des clients,
    // dédupliquée par client (un client compte une fois par origine).
    const aumByOrigin = new Map<string, number>();
    const aumClientSeen = new Map<string, Set<string>>();
    for (const d of dossiers) {
      if ((d.pipeline_stage ?? "") === "00_archive") continue;
      const clientId = d.client_id;
      if (!clientId) continue;
      const origin = originByClient.get(clientId) ?? "non_renseigne";
      let seen = aumClientSeen.get(origin);
      if (!seen) {
        seen = new Set();
        aumClientSeen.set(origin, seen);
      }
      if (seen.has(clientId)) continue;
      seen.add(clientId);
      aumByOrigin.set(origin, (aumByOrigin.get(origin) ?? 0) + (aumByClient.get(clientId) ?? 0));
    }

    const sources: SourceRow[] = ORIGIN_ORDER.filter((k) => byOrigin.has(k))
      .map((k) => {
        const a = byOrigin.get(k)!;
        const dossiersCount = a.dossiers.size;
        const convertedCount = a.converted.size;
        return {
          key: k,
          label: ACQUISITION_ORIGIN_LABELS[k] ?? k,
          dossiers: dossiersCount,
          converted: convertedCount,
          aum: aumByOrigin.get(k) ?? 0,
          convRate: dossiersCount > 0 ? (convertedCount / dossiersCount) * 100 : null,
        };
      })
      .sort((x, y) => y.dossiers - x.dossiers);

    return {
      funnel,
      dossiersActifs,
      dossiersOuverts30j,
      nouveauxProspects,
      dossiersCollecte,
      clientsConvertisMois,
      moisLabel,
      dureeConversionJours,
      tauxConversion,
      sources,
      hasData: dossiers.length > 0,
    };
  } catch {
    return EMPTY;
  }
}

export function fmtInt(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return Math.round(n).toLocaleString("fr-FR");
}

export function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}
