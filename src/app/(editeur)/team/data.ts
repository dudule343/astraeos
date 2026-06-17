import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Données de l'équipe interne du cabinet courant.
//
// Source réelle = table `users` filtrée sur tenant_id + cabinet_id du contexte
// (legacy = Cabinet Paris Étoile / PRIVEOS Capital → Sarah KAUFMANN, engineer).
// Activité par membre dérivée de dossiers / rdv / souscriptions / etudes.
//
// Volontairement ABSENT de la base (→ état vide honnête côté page, jamais
// inventé) : coût/salaire/masse salariale, charge sur CA, tickets/déploiements/
// bugs/PR, satisfaction/appels, saturation hebdomadaire. Aucune colonne ni
// table ne les porte → on ne fabrique pas de chiffre.
// =========================================================================

// Mappage enum user_role → libellé FR + ordre d'affichage des catégories.
// On n'affiche jamais le rôle `client`.
const ROLE_LABELS: Record<string, string> = {
  cabinet_director: "Direction",
  engineer: "Ingénieurs patrimoniaux",
  compliance: "Conformité",
  editor: "Édition",
  brand_owner: "Marque",
};

const ROLE_ORDER = ["cabinet_director", "engineer", "compliance", "editor", "brand_owner"];

const ROLE_ICONS: Record<string, string> = {
  cabinet_director: "👑",
  engineer: "🧭",
  compliance: "🛡️",
  editor: "✍️",
  brand_owner: "🏛️",
};

// souscriptions actives/signées = CA effectivement engagé.
const SUB_ENGAGED = new Set(["signed", "active", "partial_redemption", "closed"]);
// rdv "de la semaine" = encore à venir / en cours (pas annulés / no_show).
const RDV_LIVE = new Set(["scheduled", "confirmed", "in_progress", "completed"]);

export type TeamMemberActivity = {
  /** Nombre de clients distincts servis (dossiers non archivés). null = non applicable. */
  clientsAffectes: number | null;
  /** RDV planifiés cette semaine (lun→dim). null = non applicable. */
  rdvSemaine: number | null;
  /** CA engagé via ses souscriptions. null = non applicable. */
  caGenere: number | null;
  /** Études livrées sur ses dossiers. null = non applicable. */
  etudesLivrees: number | null;
};

export type TeamMember = {
  id: string;
  name: string;
  roleLabel: string;
  email: string | null;
  phone: string | null;
  specialties: string[];
  createdAt: string | null;
  /** true uniquement quand on a une activité réelle à montrer dans le drawer. */
  hasActivity: boolean;
  activity: TeamMemberActivity;
};

export type TeamCategory = {
  role: string;
  icon: string;
  title: string;
  count: number;
  members: TeamMember[];
};

export type TeamRoleKpi = { role: string; label: string; count: number };

export type TeamData = {
  total: number;
  byRole: TeamRoleKpi[];
  categories: TeamCategory[];
  hasData: boolean;
  /** Borne basse / haute de la semaine en cours (libellé du drawer). */
  weekLabel: string;
};

const EMPTY: TeamData = {
  total: 0,
  byRole: [],
  categories: [],
  hasData: false,
  weekLabel: currentWeekLabel(),
};

type UserRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  specialties: string[] | null;
  is_active: boolean | null;
  avatar_url: string | null;
  created_at: string | null;
  cabinet_id: string | null;
};

export async function fetchTeam(): Promise<TeamData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    const { data: usersRaw, error } = await supabase
      .from("users")
      .select(
        "id, first_name, last_name, role, email, phone, specialties, is_active, avatar_url, created_at, cabinet_id",
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("is_active", true)
      .neq("role", "client")
      .order("role")
      .order("last_name");

    if (error || !usersRaw) return EMPTY;
    const users = usersRaw as UserRow[];
    if (users.length === 0) return EMPTY;

    const engineerIds = users.filter((u) => u.role === "engineer").map((u) => u.id);

    // Activité réelle par ingénieur (dossiers / rdv / souscriptions / études).
    const [clientsByEng, rdvByEng, caByEng, etudesByEng] = await Promise.all([
      fetchClientsByEngineer(supabase, ctx, engineerIds),
      fetchRdvByEngineer(supabase, ctx, engineerIds),
      fetchCaByEngineer(supabase, ctx, engineerIds),
      fetchEtudesByEngineer(supabase, ctx, engineerIds),
    ]);

    const members: TeamMember[] = users.map((u) => {
      const isEngineer = u.role === "engineer";
      const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "—";
      const activity: TeamMemberActivity = isEngineer
        ? {
            clientsAffectes: clientsByEng.get(u.id) ?? 0,
            rdvSemaine: rdvByEng.get(u.id) ?? 0,
            caGenere: caByEng.get(u.id) ?? 0,
            etudesLivrees: etudesByEng.get(u.id) ?? 0,
          }
        : { clientsAffectes: null, rdvSemaine: null, caGenere: null, etudesLivrees: null };

      return {
        id: u.id,
        name,
        roleLabel: ROLE_LABELS[u.role ?? ""] ?? (u.role ?? "—"),
        email: u.email ?? null,
        phone: u.phone ?? null,
        specialties: (u.specialties ?? []).filter(Boolean),
        createdAt: u.created_at ?? null,
        hasActivity: isEngineer,
        activity,
      };
    });

    // KPI effectif par rôle (ordre métier).
    const roleCounts = new Map<string, number>();
    for (const u of users) {
      const r = u.role ?? "autre";
      roleCounts.set(r, (roleCounts.get(r) ?? 0) + 1);
    }
    const byRole: TeamRoleKpi[] = sortedRoles([...roleCounts.keys()]).map((role) => ({
      role,
      label: ROLE_LABELS[role] ?? role,
      count: roleCounts.get(role) ?? 0,
    }));

    // Catégories = regroupement par rôle.
    const categories: TeamCategory[] = sortedRoles([...roleCounts.keys()]).map((role) => ({
      role,
      icon: ROLE_ICONS[role] ?? "•",
      title: (ROLE_LABELS[role] ?? role).toUpperCase(),
      count: roleCounts.get(role) ?? 0,
      members: members.filter((m) => roleOf(users, m.id) === role),
    }));

    return {
      total: users.length,
      byRole,
      categories,
      hasData: true,
      weekLabel: currentWeekLabel(),
    };
  } catch {
    return EMPTY;
  }
}

function roleOf(users: UserRow[], id: string): string {
  return users.find((u) => u.id === id)?.role ?? "autre";
}

function sortedRoles(roles: string[]): string[] {
  return [...roles].sort((a, b) => {
    const ia = ROLE_ORDER.indexOf(a);
    const ib = ROLE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

type Ctx = NonNullable<Awaited<ReturnType<typeof getSessionContext>>>;
type Db = ReturnType<typeof createAdminClient>;

/** Clients distincts servis par ingénieur (dossiers non archivés). */
async function fetchClientsByEngineer(
  supabase: Db,
  ctx: Ctx,
  engineerIds: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (engineerIds.length === 0) return out;
  try {
    const { data, error } = await supabase
      .from("dossiers")
      .select("engineer_id, client_id")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .neq("pipeline_stage", "00_archive")
      .in("engineer_id", engineerIds);
    if (error || !data) return out;
    const distinct = new Map<string, Set<string>>();
    for (const d of data as { engineer_id: string | null; client_id: string | null }[]) {
      if (!d.engineer_id || !d.client_id) continue;
      const set = distinct.get(d.engineer_id) ?? new Set<string>();
      set.add(d.client_id);
      distinct.set(d.engineer_id, set);
    }
    for (const [eng, set] of distinct) out.set(eng, set.size);
    return out;
  } catch {
    return out;
  }
}

/** RDV de la semaine en cours (lun→dim) par ingénieur, statuts vivants. */
async function fetchRdvByEngineer(
  supabase: Db,
  ctx: Ctx,
  engineerIds: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (engineerIds.length === 0) return out;
  try {
    const { start, end } = weekBounds();
    const { data, error } = await supabase
      .from("rdv")
      .select("engineer_id, status")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("engineer_id", engineerIds)
      .gte("scheduled_at", start.toISOString())
      .lte("scheduled_at", end.toISOString());
    if (error || !data) return out;
    for (const r of data as { engineer_id: string | null; status: string | null }[]) {
      if (!r.engineer_id || !RDV_LIVE.has(r.status ?? "")) continue;
      out.set(r.engineer_id, (out.get(r.engineer_id) ?? 0) + 1);
    }
    return out;
  } catch {
    return out;
  }
}

/** CA engagé par ingénieur (souscriptions signées/actives, amount_initial). */
async function fetchCaByEngineer(
  supabase: Db,
  ctx: Ctx,
  engineerIds: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (engineerIds.length === 0) return out;
  try {
    const { data, error } = await supabase
      .from("souscriptions")
      .select("engineer_id, amount_initial, status")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("engineer_id", engineerIds);
    if (error || !data) return out;
    for (const s of data as {
      engineer_id: string | null;
      amount_initial: number | string | null;
      status: string | null;
    }[]) {
      if (!s.engineer_id || !SUB_ENGAGED.has(s.status ?? "")) continue;
      const amt = s.amount_initial != null ? Number(s.amount_initial) : 0;
      out.set(s.engineer_id, (out.get(s.engineer_id) ?? 0) + amt);
    }
    return out;
  } catch {
    return out;
  }
}

/** Études livrées par ingénieur (via ses dossiers). */
async function fetchEtudesByEngineer(
  supabase: Db,
  ctx: Ctx,
  engineerIds: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (engineerIds.length === 0) return out;
  try {
    const { data: dossiers, error: dErr } = await supabase
      .from("dossiers")
      .select("id, engineer_id")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .in("engineer_id", engineerIds);
    if (dErr || !dossiers || dossiers.length === 0) return out;

    const engineerOf = new Map<string, string>();
    for (const d of dossiers as { id: string; engineer_id: string | null }[]) {
      if (d.engineer_id) engineerOf.set(d.id, d.engineer_id);
    }
    const dossierIds = [...engineerOf.keys()];
    if (dossierIds.length === 0) return out;

    const { data: etudes, error: eErr } = await supabase
      .from("etudes")
      .select("dossier_id")
      .in("dossier_id", dossierIds);
    if (eErr || !etudes) return out;
    for (const e of etudes as { dossier_id: string | null }[]) {
      const eng = e.dossier_id ? engineerOf.get(e.dossier_id) : undefined;
      if (!eng) continue;
      out.set(eng, (out.get(eng) ?? 0) + 1);
    }
    return out;
  } catch {
    return out;
  }
}

// ---------------------------------------------------------------------------
// Helpers temps + formatage
// ---------------------------------------------------------------------------

/** Bornes lundi 00:00 → dimanche 23:59:59 de la semaine en cours. */
function weekBounds(ref: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(ref);
  const day = (start.getDay() + 6) % 7; // 0 = lundi
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function currentWeekLabel(ref: Date = new Date()): string {
  const { start, end } = weekBounds(ref);
  const fmt = (d: Date) =>
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return `Du ${fmt(start)} au ${fmt(end)} ${end.getFullYear()}`;
}

// Formatteurs déplacés dans ./format (client-safe) ; ré-exportés pour
// compatibilité des imports serveur existants.
export { fmtEur, fmtCount, initialsOf } from "./format";
