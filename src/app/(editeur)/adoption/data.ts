import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Adoption produit — niveau éditeur, périmètre = tenant courant.
//
// Le schéma n'a AUCUNE table de sessions/connexions horodatées : le seul
// signal d'usage daté est timeline_events (chaque action laisse une trace).
// On s'en sert comme proxy d'utilisateurs actifs ; fallback users.last_login_at.
// Tout ce qui n'a pas de source réelle (sessions/utilisateur, durée moyenne de
// session, temps cumulé, étoiles, deltas %) est laissé en état vide honnête —
// jamais inventé. Voir le commentaire de chaque bloc.
//
// Toutes les requêtes filtrent sur ctx.tenantId. Les "utilisateurs" comptés
// sont les profils internes qui utilisent la plateforme : engineer +
// cabinet_director (le contexte legacy renvoie role='cabinet_director').
// =========================================================================

const PLATFORM_ROLES = ["engineer", "cabinet_director"] as const;

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export type AdoptionTopUser = {
  id: string;
  rank: number;
  name: string;
  cabinet: string | null;
  entretiens: number;
  etudesLivrees: number;
};

export type Adoption = {
  // Volumétrie d'utilisation
  actifs7j: number | null;
  actifs30j: number | null;
  usersCrees: number; // dénominateur (profils internes du tenant)
  stickiness: number | null; // actifs7j / actifs30j, en %, si calculable
  activityInstrumented: boolean; // true si timeline_events a fourni le signal

  // Profondeur d'usage
  dossiersCrees30j: number | null;
  etudesLivrees30j: number | null;
  dormants: number | null; // aucune connexion depuis 30j (last_login_at)

  // Top utilisateurs
  topUsers: AdoptionTopUser[];

  hasData: boolean;
};

const EMPTY: Adoption = {
  actifs7j: null,
  actifs30j: null,
  usersCrees: 0,
  stickiness: null,
  activityInstrumented: false,
  dossiersCrees30j: null,
  etudesLivrees30j: null,
  dormants: null,
  topUsers: [],
  hasData: false,
};

type UserRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  cabinet_id: string | null;
  cabinets?: { name?: string | null } | { name?: string | null }[] | null;
};

function cabinetNameOf(row: UserRow): string | null {
  const c = Array.isArray(row.cabinets) ? row.cabinets[0] : row.cabinets;
  return c?.name ?? null;
}

function fullName(row: UserRow): string {
  const n = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
  return n || "Utilisateur";
}

/**
 * Compte les acteurs internes distincts ayant laissé une trace dans
 * timeline_events depuis `days` jours. Renvoie null si la table ne répond pas
 * (schéma absent / erreur) pour distinguer "pas instrumenté" de "zéro".
 */
async function distinctActorsSince(
  supabase: ReturnType<typeof createAdminClient>,
  tenantId: string,
  days: number,
  internalUserIds: Set<string>,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("timeline_events")
    .select("actor_user_id")
    .eq("tenant_id", tenantId)
    .gte("created_at", daysAgoIso(days))
    .not("actor_user_id", "is", null);

  if (error || !data) return null;
  const set = new Set<string>();
  for (const row of data) {
    const id = row.actor_user_id as string | null;
    if (id && internalUserIds.has(id)) set.add(id);
  }
  return set.size;
}

export async function fetchAdoption(): Promise<Adoption> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();
    const tenantId = ctx.tenantId;

    // --- Profils internes du tenant (dénominateur + noms/cabinets + dormants).
    const { data: usersRaw, error: usersErr } = await supabase
      .from("users")
      .select("id, first_name, last_name, cabinet_id, last_login_at, is_active, cabinets(name)")
      .eq("tenant_id", tenantId)
      .in("role", PLATFORM_ROLES as unknown as string[]);

    if (usersErr) return EMPTY;
    const users = (usersRaw ?? []) as (UserRow & {
      last_login_at: string | null;
      is_active: boolean | null;
    })[];

    const internalIds = new Set(users.map((u) => u.id));
    const usersCrees = users.length;

    // --- Volumétrie : actifs via timeline_events, fallback last_login_at.
    const cutoff30 = daysAgoIso(30);
    const cutoff7 = daysAgoIso(7);

    let actifs7j = await distinctActorsSince(supabase, tenantId, 7, internalIds);
    let actifs30j = await distinctActorsSince(supabase, tenantId, 30, internalIds);
    const activityInstrumented = actifs30j !== null;

    if (!activityInstrumented) {
      // Pas de trace horodatée exploitable → repli sur le seul timestamp dispo.
      actifs7j = users.filter(
        (u) => u.last_login_at != null && u.last_login_at >= cutoff7,
      ).length;
      actifs30j = users.filter(
        (u) => u.last_login_at != null && u.last_login_at >= cutoff30,
      ).length;
    }

    const stickiness =
      actifs7j != null && actifs30j != null && actifs30j > 0
        ? Math.round((actifs7j / actifs30j) * 100)
        : null;

    // Dormants : profils actifs sans connexion depuis 30j (ou jamais connectés).
    const dormants = users.filter(
      (u) =>
        u.is_active !== false &&
        (u.last_login_at == null || u.last_login_at < cutoff30),
    ).length;

    // --- Profondeur : dossiers créés (30j) et études livrées (30j) du tenant.
    const { count: dossiersCount } = await supabase
      .from("dossiers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", cutoff30);
    const dossiersCrees30j = dossiersCount ?? 0;

    // Dossiers du tenant (id → engineer_id) pour rattacher études et entretiens.
    const { data: tenantDossiers } = await supabase
      .from("dossiers")
      .select("id, engineer_id")
      .eq("tenant_id", tenantId);
    const dossiers = (tenantDossiers ?? []) as { id: string; engineer_id: string | null }[];
    const engineerOfDossier = new Map(dossiers.map((d) => [d.id, d.engineer_id]));
    const dossierIds = dossiers.map((d) => d.id);

    // Études livrées sur 30j (status='delivered', delivered_at récent).
    let etudesLivrees30j = 0;
    const etudesByEngineer = new Map<string, number>();
    if (dossierIds.length > 0) {
      const { data: etudesRows } = await supabase
        .from("etudes")
        .select("dossier_id, delivered_at, status")
        .in("dossier_id", dossierIds)
        .eq("status", "delivered");
      for (const e of etudesRows ?? []) {
        const dossierId = e.dossier_id as string;
        const eng = engineerOfDossier.get(dossierId);
        if (eng) etudesByEngineer.set(eng, (etudesByEngineer.get(eng) ?? 0) + 1);
        const dlv = (e.delivered_at as string | null) ?? null;
        if (dlv && dlv >= cutoff30) etudesLivrees30j += 1;
      }
    }

    // --- Entretiens réalisés (rdv completed) par ingénieur, sur 30j.
    const entretiensByEngineer = new Map<string, number>();
    const { data: rdvRows } = await supabase
      .from("rdv")
      .select("engineer_id")
      .eq("tenant_id", tenantId)
      .eq("status", "completed")
      .gte("scheduled_at", cutoff30);
    for (const r of rdvRows ?? []) {
      const eng = r.engineer_id as string | null;
      if (eng) entretiensByEngineer.set(eng, (entretiensByEngineer.get(eng) ?? 0) + 1);
    }

    // --- Top utilisateurs : tri par études livrées puis entretiens, top 10.
    const topUsers: AdoptionTopUser[] = users
      .map((u) => ({
        id: u.id,
        name: fullName(u),
        cabinet: cabinetNameOf(u),
        entretiens: entretiensByEngineer.get(u.id) ?? 0,
        etudesLivrees: etudesByEngineer.get(u.id) ?? 0,
      }))
      .filter((u) => u.etudesLivrees > 0 || u.entretiens > 0)
      .sort(
        (a, b) =>
          b.etudesLivrees - a.etudesLivrees || b.entretiens - a.entretiens,
      )
      .slice(0, 10)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    const hasData =
      usersCrees > 0 ||
      dossiersCrees30j > 0 ||
      etudesLivrees30j > 0 ||
      topUsers.length > 0;

    return {
      actifs7j,
      actifs30j,
      usersCrees,
      stickiness,
      activityInstrumented,
      dossiersCrees30j,
      etudesLivrees30j,
      dormants,
      topUsers,
      hasData,
    };
  } catch {
    return EMPTY;
  }
}

/** Affiche un entier ou "—" si la source n'existe pas (null) ou vaut 0. */
export function fmtCount(n: number | null): string {
  if (n == null || !Number.isFinite(n) || n === 0) return "—";
  return String(n);
}
