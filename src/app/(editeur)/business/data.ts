import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Données du cockpit "Pilotage business" — page éditeur (ASTRAEOS).
//
// Sémantique : l'objet métier de cette page est le SaaS ASTRAEOS, pas un
// cabinet. La portée est donc le PARC de tenants clients (marques +
// cabinets directs), pas le cabinet legacy renvoyé par getSessionContext().
//
// Réconciliation avec le schéma réel (db/migrations/0001_initial_schema.sql) :
//   - tenant_type        = marque | cabinet_direct | editeur
//   - subscription_status = active | trialing | suspended | churned
//   - tenants : AUCUN montant d'abonnement → pas de MRR/ARR/LTV/CAC réels.
//   - cabinets.total_aum_cached / total_clients_cached → seul proxy réel
//     de "taille de compte" disponible pour classer les comptes clients.
//
// Conséquence honnête :
//   - MRR / ARR / croissance / graphe 12 mois / LTV / CAC : pas de source
//     (aucune table de facturation plateforme) → état vide assumé.
//   - Mouvement du parc clients : réel via tenants (count par statut + date).
//   - Top comptes : noms réels + proxy AUM/clients réels (pas de revenu SaaS).
// =========================================================================

// Tenant éditeur du seed (ASTRAEOS). On scope le parc à ses enfants ; à
// défaut (parent_tenant_id non renseigné), on retombe sur tous les tenants
// non-éditeur.
const EDITEUR_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const NOW = new Date();
const WINDOW_DAYS = 30;

export type TenantStatus = "active" | "trialing" | "suspended" | "churned";

export type ParcMouvement = {
  /** Nouveaux comptes clients créés sur la fenêtre (created_at). */
  acquisitions: number;
  /** Comptes en statut churned (total — pas de date de churn en base). */
  desabonnements: number;
  /** acquisitions − désabonnements. */
  mouvementNet: number;
  /** Nombre total de comptes clients actuellement actifs/trialing. */
  comptesActifs: number;
  /** true si au moins un tenant client a été lu. */
  hasData: boolean;
  /** true si la fenêtre d'acquisitions a pu être calculée (created_at). */
  acquisitionsScoped: boolean;
};

export type CompteExpansion = {
  rank: number;
  name: string;
  initials: string;
  type: "Marque" | "Cabinet" | "Autre pro";
  /** Encours sous gestion du cabinet (proxy réel de taille de compte). */
  aum: number;
  /** Clients du cabinet (proxy réel). */
  clients: number;
  /** Statut d'abonnement du tenant parent (réel, sans montant). */
  status: TenantStatus | null;
};

export type BusinessData = {
  parc: ParcMouvement;
  comptes: CompteExpansion[];
  windowDays: number;
  /** Libellé de la fenêtre courante (mois en cours). */
  periodeLabel: string;
  /** Facturation plateforme branchée ? (toujours false tant qu'absente). */
  billingConnected: boolean;
};

const EMPTY_PARC: ParcMouvement = {
  acquisitions: 0,
  desabonnements: 0,
  mouvementNet: 0,
  comptesActifs: 0,
  hasData: false,
  acquisitionsScoped: false,
};

const EMPTY: BusinessData = {
  parc: EMPTY_PARC,
  comptes: [],
  windowDays: WINDOW_DAYS,
  periodeLabel: monthLabel(NOW),
  billingConnected: false,
};

type TenantRow = {
  id: string;
  name: string | null;
  tenant_type: "marque" | "cabinet_direct" | "editeur";
  subscription_status: TenantStatus | null;
  created_at: string | null;
};

type CabinetRow = {
  name: string | null;
  tenant_id: string | null;
  total_aum_cached: number | null;
  total_clients_cached: number | null;
};

export async function fetchBusinessData(): Promise<BusinessData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    // Parc de comptes clients = tenants non-éditeur. On privilégie les enfants
    // de l'éditeur ; si parent_tenant_id n'est pas renseigné (seed actuel),
    // le filtre neq('tenant_type','editeur') couvre tout le parc.
    const { data: tenantsRaw, error: tenantsErr } = await supabase
      .from("tenants")
      .select("id, name, tenant_type, subscription_status, created_at")
      .neq("tenant_type", "editeur")
      .neq("id", EDITEUR_TENANT_ID);

    const tenants = (!tenantsErr && tenantsRaw ? tenantsRaw : []) as TenantRow[];

    const parc = computeParc(tenants, NOW, WINDOW_DAYS);

    // Top comptes : on lit les cabinets (proxy de taille réel) et on les
    // associe à leur tenant pour le type/statut. Les marques sans cabinet
    // restent listables via leur tenant.
    const { data: cabinetsRaw } = await supabase
      .from("cabinets")
      .select("name, tenant_id, total_aum_cached, total_clients_cached")
      .eq("is_active", true);

    const cabinets = (cabinetsRaw ?? []) as CabinetRow[];
    const comptes = computeComptes(tenants, cabinets);

    return {
      parc,
      comptes,
      windowDays: WINDOW_DAYS,
      periodeLabel: monthLabel(NOW),
      billingConnected: false,
    };
  } catch {
    return EMPTY;
  }
}

// ---------------------------------------------------------------------------
// Agrégations pures (testables sans DB)
// ---------------------------------------------------------------------------

const ACTIVE_STATUSES = new Set<TenantStatus>(["active", "trialing"]);

export function computeParc(tenants: TenantRow[], ref: Date, windowDays: number): ParcMouvement {
  if (tenants.length === 0) return EMPTY_PARC;

  const from = new Date(ref.getTime() - windowDays * 24 * 60 * 60 * 1000);
  let acquisitions = 0;
  let acquisitionsScoped = false;
  let desabonnements = 0;
  let comptesActifs = 0;

  for (const t of tenants) {
    if (t.created_at) {
      acquisitionsScoped = true;
      const created = new Date(t.created_at);
      if (created >= from && created <= ref) acquisitions += 1;
    }
    if (t.subscription_status === "churned") desabonnements += 1;
    if (t.subscription_status && ACTIVE_STATUSES.has(t.subscription_status)) comptesActifs += 1;
  }

  return {
    acquisitions,
    desabonnements,
    mouvementNet: acquisitions - desabonnements,
    comptesActifs,
    hasData: true,
    acquisitionsScoped,
  };
}

export function computeComptes(tenants: TenantRow[], cabinets: CabinetRow[]): CompteExpansion[] {
  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  const rows = cabinets
    .map((c) => {
      const tenant = c.tenant_id ? tenantById.get(c.tenant_id) : undefined;
      // On ne garde que les cabinets rattachés à un tenant client (parc SaaS).
      if (!tenant) return null;
      const name = (c.name ?? tenant.name ?? "").trim();
      if (!name) return null;
      return {
        name,
        aum: c.total_aum_cached != null ? Number(c.total_aum_cached) : 0,
        clients: c.total_clients_cached != null ? Number(c.total_clients_cached) : 0,
        type: typeOf(tenant.tenant_type),
        status: tenant.subscription_status,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => b.aum - a.aum || b.clients - a.clients || a.name.localeCompare(b.name))
    .slice(0, 5);

  return rows.map((r, i) => ({
    rank: i + 1,
    name: r.name,
    initials: initialsOf(r.name),
    type: r.type,
    aum: r.aum,
    clients: r.clients,
    status: r.status,
  }));
}

function typeOf(t: "marque" | "cabinet_direct" | "editeur"): CompteExpansion["type"] {
  if (t === "marque") return "Marque";
  if (t === "cabinet_direct") return "Cabinet";
  return "Autre pro";
}

function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Formatage
// ---------------------------------------------------------------------------

/** Entier signé (+3 / -1 / 0 → "—"). zeroDash=false pour afficher "0". */
export function fmtSigned(n: number, zeroDash = true): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return zeroDash ? "—" : "0";
  return n > 0 ? `+${n}` : String(n);
}

export function fmtInt(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return Math.round(n).toLocaleString("fr-FR");
}

export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

export const STATUS_LABELS: Record<TenantStatus, string> = {
  active: "Actif",
  trialing: "Essai",
  suspended: "Suspendu",
  churned: "Résilié",
};
