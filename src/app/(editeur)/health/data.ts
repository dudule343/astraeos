import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Santé clients (vue éditeur) — fraîcheur d'activité des cabinets du réseau.
//
// Constat de cadrage : le schéma (db/migrations/0001_initial_schema.sql) ne
// contient AUCUNE source pour un « score santé composite SaaS » :
//   - pas de table tickets/support (CSAT, résolution),
//   - pas de billing/MRR (tenants.subscription_status existe, sans montant),
//   - pas d'événements d'usage produit (seul signal proche : users.last_login_at),
//   - pas de colonne health_score ni mrr.
// On ne reconstruit donc PAS un faux score. On mesure l'activité RÉELLE des
// cabinets du tenant éditeur : dernière activité (dossiers.last_activity_at /
// users.last_login_at), volume de dossiers et d'études récentes. Les comptes
// sont bucketés par fraîcheur. Aucun MRR, aucun score composite, aucun
// comparatif historique inventé.
//
// Périmètre : tous les cabinets de ctx.tenantId (multi-cabinet). En mode legacy
// (auth off), le seed n'expose qu'un cabinet — la vue dégrade proprement.
// =========================================================================

// Seuils de fraîcheur (en jours) depuis la dernière activité d'un cabinet.
const SAIN_MAX_DAYS = 14; // activité < 14j → sain
const SURVEILLER_MAX_DAYS = 30; // 14–30j → à surveiller ; > 30j ou aucun signal → à risque

export type HealthBucket = "sain" | "surveiller" | "risque" | "inconnu";

export type CabinetHealth = {
  id: string;
  name: string;
  initials: string;
  isActive: boolean;
  totalClients: number | null;
  totalAum: number | null;
  /** Dernière activité connue (max dossiers.last_activity_at / users.last_login_at). */
  lastActivityAt: string | null;
  /** Jours depuis lastActivityAt (null si aucun signal). */
  daysSinceActivity: number | null;
  /** Dossiers actifs (hors archive). */
  dossiersActifs: number;
  /** Études créées sur les 30 derniers jours. */
  etudesRecentes: number;
  bucket: HealthBucket;
  /** Signal lisible dérivé de données réelles (jamais un faux ticket/impayé). */
  signal: string;
};

export type SanteClients = {
  totalCabinets: number;
  sains: number;
  surveiller: number;
  risque: number;
  actifs: number;
  /** Cabinets à risque (ou jamais actifs), triés du plus inactif au moins inactif. */
  aRisque: CabinetHealth[];
  hasData: boolean;
};

export const EMPTY: SanteClients = {
  totalCabinets: 0,
  sains: 0,
  surveiller: 0,
  risque: 0,
  actifs: 0,
  aRisque: [],
  hasData: false,
};

type CabinetRow = {
  id: string;
  name: string | null;
  is_active: boolean | null;
  total_clients_cached: number | null;
  total_aum_cached: number | string | null;
  created_at: string | null;
};
type UserActivityRow = { cabinet_id: string | null; last_login_at: string | null };
type DossierRow = {
  id: string;
  cabinet_id: string | null;
  pipeline_stage: string | null;
  last_activity_at: string | null;
};
type EtudeRow = { dossier_id: string | null; created_at: string | null };

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function maxIso(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / MS_PER_DAY));
}

function bucketOf(days: number | null): HealthBucket {
  if (days === null) return "risque"; // aucun signal d'activité = à risque (jamais "inconnu" inventé)
  if (days <= SAIN_MAX_DAYS) return "sain";
  if (days <= SURVEILLER_MAX_DAYS) return "surveiller";
  return "risque";
}

function signalOf(c: {
  daysSinceActivity: number | null;
  dossiersActifs: number;
  etudesRecentes: number;
}): string {
  if (c.daysSinceActivity === null) {
    return "Aucune activité enregistrée";
  }
  if (c.dossiersActifs === 0) {
    return `Aucun dossier actif · inactif depuis ${c.daysSinceActivity} j`;
  }
  if (c.etudesRecentes === 0) {
    return `Aucune étude créée < 30 j · inactif depuis ${c.daysSinceActivity} j`;
  }
  return `Inactif depuis ${c.daysSinceActivity} j`;
}

export function initials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return `${parts[0][0]!}${parts[parts.length - 1][0]!}`.toUpperCase();
}

export function fmtJoursDepuis(days: number | null): string {
  if (days === null) return "—";
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "il y a 1 jour";
  return `il y a ${days} jours`;
}

export function fmtNombre(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return n.toLocaleString("fr-FR");
}

export function pct(part: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((part / total) * 100)} %`;
}

export async function fetchSanteClients(): Promise<SanteClients> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();
    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * MS_PER_DAY).toISOString();

    // 1. Tous les cabinets du tenant éditeur (périmètre réseau, pas un seul cabinet).
    const { data: cabinetsRaw, error: cabErr } = await supabase
      .from("cabinets")
      .select("id, name, is_active, total_clients_cached, total_aum_cached, created_at")
      .eq("tenant_id", ctx.tenantId);

    if (cabErr || !cabinetsRaw || cabinetsRaw.length === 0) return EMPTY;
    const cabinets = cabinetsRaw as CabinetRow[];
    const cabinetIds = cabinets.map((c) => c.id);

    // 2. Dernière connexion par cabinet (users.last_login_at).
    const lastLoginByCabinet = new Map<string, string | null>();
    {
      const { data } = await supabase
        .from("users")
        .select("cabinet_id, last_login_at")
        .in("cabinet_id", cabinetIds)
        .eq("tenant_id", ctx.tenantId);
      for (const u of (data ?? []) as UserActivityRow[]) {
        if (!u.cabinet_id) continue;
        lastLoginByCabinet.set(
          u.cabinet_id,
          maxIso(lastLoginByCabinet.get(u.cabinet_id) ?? null, u.last_login_at),
        );
      }
    }

    // 3. Dossiers du réseau : dernière activité + dossiers actifs, par cabinet.
    const lastDossierActivityByCabinet = new Map<string, string | null>();
    const dossiersActifsByCabinet = new Map<string, number>();
    const dossierToCabinet = new Map<string, string>();
    {
      const { data } = await supabase
        .from("dossiers")
        .select("id, cabinet_id, pipeline_stage, last_activity_at")
        .in("cabinet_id", cabinetIds)
        .eq("tenant_id", ctx.tenantId);
      for (const d of (data ?? []) as DossierRow[]) {
        if (!d.cabinet_id) continue;
        dossierToCabinet.set(d.id, d.cabinet_id);
        lastDossierActivityByCabinet.set(
          d.cabinet_id,
          maxIso(lastDossierActivityByCabinet.get(d.cabinet_id) ?? null, d.last_activity_at),
        );
        if (d.pipeline_stage !== "00_archive") {
          dossiersActifsByCabinet.set(
            d.cabinet_id,
            (dossiersActifsByCabinet.get(d.cabinet_id) ?? 0) + 1,
          );
        }
      }
    }

    // 4. Études créées < 30 j, ventilées par cabinet via le dossier.
    const etudesRecentesByCabinet = new Map<string, number>();
    {
      const dossierIds = [...dossierToCabinet.keys()];
      if (dossierIds.length > 0) {
        const { data } = await supabase
          .from("etudes")
          .select("dossier_id, created_at")
          .in("dossier_id", dossierIds)
          .gte("created_at", since30);
        for (const e of (data ?? []) as EtudeRow[]) {
          if (!e.dossier_id) continue;
          const cab = dossierToCabinet.get(e.dossier_id);
          if (!cab) continue;
          etudesRecentesByCabinet.set(cab, (etudesRecentesByCabinet.get(cab) ?? 0) + 1);
        }
      }
    }

    // 5. Composition de l'état de santé par cabinet.
    const all: CabinetHealth[] = cabinets.map((c) => {
      const name = c.name ?? "Cabinet";
      const lastActivityAt = maxIso(
        lastDossierActivityByCabinet.get(c.id) ?? null,
        lastLoginByCabinet.get(c.id) ?? null,
      );
      const daysSinceActivity = daysSince(lastActivityAt, now);
      const dossiersActifs = dossiersActifsByCabinet.get(c.id) ?? 0;
      const etudesRecentes = etudesRecentesByCabinet.get(c.id) ?? 0;
      const bucket = bucketOf(daysSinceActivity);
      return {
        id: c.id,
        name,
        initials: initials(name),
        isActive: c.is_active ?? true,
        totalClients: c.total_clients_cached ?? null,
        totalAum: c.total_aum_cached != null ? Number(c.total_aum_cached) : null,
        lastActivityAt,
        daysSinceActivity,
        dossiersActifs,
        etudesRecentes,
        bucket,
        signal: signalOf({ daysSinceActivity, dossiersActifs, etudesRecentes }),
      } satisfies CabinetHealth;
    });

    const sains = all.filter((c) => c.bucket === "sain").length;
    const surveiller = all.filter((c) => c.bucket === "surveiller").length;
    const risque = all.filter((c) => c.bucket === "risque").length;
    const actifs = all.filter((c) => c.isActive).length;

    const aRisque = all
      .filter((c) => c.bucket === "risque")
      .sort((a, b) => {
        // Plus inactif d'abord ; "aucun signal" (null) en tête.
        const da = a.daysSinceActivity ?? Number.POSITIVE_INFINITY;
        const db = b.daysSinceActivity ?? Number.POSITIVE_INFINITY;
        return db - da;
      });

    return {
      totalCabinets: all.length,
      sains,
      surveiller,
      risque,
      actifs,
      aRisque,
      hasData: true,
    };
  } catch {
    return EMPTY;
  }
}
