import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Accès données de l'espace marque (tête de réseau) — scope RÉSEAU.
// On filtre par tenant_id (ctx.tenantId) UNIQUEMENT, jamais par cabinet_id :
// la marque voit TOUS les cabinets licenciés du tenant.
//
// Le flag d'auth est OFF → getSessionContext renvoie le contexte legacy du
// seed, donc tenantId = PRIVEOS Capital. Le seed est quasi vide : la plupart
// des chiffres dégradent proprement à 0 / état vide, c'est voulu.
//
// Réconciliation schéma (db/migrations/0001_initial_schema.sql) — mêmes règles
// que côté dirigeant (_data/cabinet.ts) mais à l'échelle du tenant :
//   - cabinets.total_aum_cached     → encours sous gestion (caché)
//   - cabinets.total_clients_cached → clients servis (caché)
//   - cabinets.network_rank_cached  → rang réseau pré-calculé (peut être null)
//   - cabinets.region / director    → implantation + dirigeant (join users)
//   - commissions.recipient_type='cabinet' + status received/reconciled
//                                   → CA encaissé part cabinet
//   - commission_type='study_fee'   → honoraires d'études
//   - upfront|recurring_management|performance → apports d'affaires
//   - recipient_type='engineer_bonus' → reversé aux ingénieurs
// =========================================================================

const RECEIVED = new Set(["received", "reconciled"]);

// ---------------------------------------------------------------------------
// Cabinets du réseau
// ---------------------------------------------------------------------------

export type NetworkCabinet = {
  id: string;
  name: string;
  region: string | null;
  city: string | null;
  /** Nom du dirigeant (alias directorName). */
  director: string | null;
  directorName: string | null;
  engineerCount: number;
  /** Clients servis (alias totalClients). */
  clients: number;
  totalClients: number;
  /** Encours sous gestion (alias totalAum). */
  encours: number;
  totalAum: number;
  /** CA généré (part cabinet, commissions encaissées) calculé en live. */
  caGenere: number;
  /** Rang réseau pré-calculé en base, null si non calculé (alias networkRank). */
  rankCached: number | null;
  networkRank: number | null;
  isActive: boolean;
};

/**
 * Tous les cabinets du tenant courant (scope réseau, pas de filtre cabinet_id)
 * avec dirigeant, effectif d'ingénieurs et CA généré calculé en live à partir
 * des commissions encaissées de la part cabinet.
 *
 * Trié par CA généré décroissant, puis encours, puis nom. Dégrade à [].
 */
export async function fetchNetworkCabinets(): Promise<NetworkCabinet[]> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return [];
    const supabase = createAdminClient();

    const { data: cabinets, error } = await supabase
      .from("cabinets")
      .select(
        `id, name, region, address_city, total_aum_cached, total_clients_cached,
         network_rank_cached, is_active,
         director:users!cabinets_director_user_id_fkey(first_name, last_name)`,
      )
      .eq("tenant_id", ctx.tenantId);

    if (error || !cabinets) return [];

    const [caByCabinet, engineersByCabinet] = await Promise.all([
      fetchCaByCabinet(ctx.tenantId),
      fetchEngineerCountByCabinet(ctx.tenantId),
    ]);

    const rows: NetworkCabinet[] = cabinets.map((c) => {
      const dirRaw = Array.isArray(c.director) ? c.director[0] : c.director;
      const directorName = dirRaw
        ? `${(dirRaw.first_name as string) ?? ""} ${(dirRaw.last_name as string) ?? ""}`.trim() ||
          null
        : null;
      const totalClients = c.total_clients_cached != null ? Number(c.total_clients_cached) : 0;
      const totalAum = c.total_aum_cached != null ? Number(c.total_aum_cached) : 0;
      const rank = c.network_rank_cached != null ? Number(c.network_rank_cached) : null;
      return {
        id: c.id as string,
        name: (c.name as string) ?? "Cabinet",
        region: (c.region as string) ?? null,
        city: (c.address_city as string) ?? null,
        director: directorName,
        directorName,
        engineerCount: engineersByCabinet.get(c.id as string) ?? 0,
        clients: totalClients,
        totalClients,
        encours: totalAum,
        totalAum,
        caGenere: caByCabinet.get(c.id as string) ?? 0,
        rankCached: rank,
        networkRank: rank,
        isActive: Boolean(c.is_active),
      };
    });

    return rows.sort(
      (a, b) =>
        b.caGenere - a.caGenere || b.totalAum - a.totalAum || a.name.localeCompare(b.name, "fr"),
    );
  } catch {
    return [];
  }
}

/**
 * CA généré par cabinet (part cabinet encaissée) sur tout le tenant.
 * Map cabinet_id → montant. Dégrade à Map vide.
 */
async function fetchCaByCabinet(tenantId: string): Promise<Map<string, number>> {
  const byCabinet = new Map<string, number>();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("commissions")
      .select(
        `amount_eur, recipient_type, status,
         souscription:souscriptions!inner(cabinet_id, tenant_id)`,
      )
      .eq("recipient_type", "cabinet")
      .eq("souscription.tenant_id", tenantId);

    if (error || !data) return byCabinet;

    for (const row of data) {
      if (!RECEIVED.has(row.status as string)) continue;
      const sub = Array.isArray(row.souscription) ? row.souscription[0] : row.souscription;
      const cabinetId = sub?.cabinet_id as string | undefined;
      if (!cabinetId) continue;
      byCabinet.set(cabinetId, (byCabinet.get(cabinetId) ?? 0) + Number(row.amount_eur ?? 0));
    }
    return byCabinet;
  } catch {
    return byCabinet;
  }
}

/** Nombre d'ingénieurs actifs par cabinet sur le tenant. Map cabinet_id → count. */
async function fetchEngineerCountByCabinet(tenantId: string): Promise<Map<string, number>> {
  const byCabinet = new Map<string, number>();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("cabinet_id")
      .eq("tenant_id", tenantId)
      .eq("role", "engineer")
      .eq("is_active", true);

    if (error || !data) return byCabinet;
    for (const u of data) {
      const cabinetId = u.cabinet_id as string | null;
      if (!cabinetId) continue;
      byCabinet.set(cabinetId, (byCabinet.get(cabinetId) ?? 0) + 1);
    }
    return byCabinet;
  } catch {
    return byCabinet;
  }
}

// ---------------------------------------------------------------------------
// Commissions du réseau (synthèse financière)
// ---------------------------------------------------------------------------

export type NetworkCommission = {
  amount_eur: number;
  commission_type: "upfront" | "recurring_management" | "performance" | "study_fee";
  recipient_type: "brand_owner" | "cabinet" | "engineer_bonus";
  status: "pending" | "received" | "reconciled";
  souscription: {
    id: string;
    produit: { category: string | null } | null;
  } | null;
};

/**
 * Toutes les commissions du tenant (scope réseau, tous cabinets confondus),
 * avec la catégorie de produit jointe. Dégrade à [].
 */
export async function fetchNetworkCommissions(): Promise<NetworkCommission[]> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return [];
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("commissions")
      .select(
        `amount_eur, commission_type, recipient_type, status,
         souscription:souscriptions!inner(id, tenant_id, produit:produits(category))`,
      )
      .eq("souscription.tenant_id", ctx.tenantId);

    if (error || !data) return [];

    return data.map((row) => {
      const sousRaw = Array.isArray(row.souscription) ? row.souscription[0] : row.souscription;
      const produitRaw = sousRaw
        ? Array.isArray(sousRaw.produit)
          ? sousRaw.produit[0]
          : sousRaw.produit
        : null;
      return {
        amount_eur: Number(row.amount_eur ?? 0),
        commission_type: row.commission_type,
        recipient_type: row.recipient_type,
        status: row.status,
        souscription: sousRaw
          ? {
              id: sousRaw.id as string,
              produit: produitRaw ? { category: produitRaw.category ?? null } : null,
            }
          : null,
      } satisfies NetworkCommission;
    });
  } catch {
    return [];
  }
}

function isHonoraires(c: NetworkCommission) {
  return c.commission_type === "study_fee";
}
function isApports(c: NetworkCommission) {
  return (
    c.commission_type === "upfront" ||
    c.commission_type === "recurring_management" ||
    c.commission_type === "performance"
  );
}
function isCabinetShare(c: NetworkCommission) {
  return c.recipient_type === "cabinet";
}

export type FinanceResultat = {
  honorairesGenere: number;
  honorairesEncaisse: number;
  apportsGenere: number;
  apportsEncaisse: number;
  reverseIngenieurs: number;
  totalGenere: number;
  totalEncaisse: number;
  resteAEncaisser: number;
};

/** Synthèse finance réseau : généré (toutes commissions) vs encaissé (received). */
export function computeFinanceResultat(commissions: NetworkCommission[]): FinanceResultat {
  const cabinet = commissions.filter(isCabinetShare);
  const genere = (pred: (c: NetworkCommission) => boolean) =>
    cabinet.filter(pred).reduce((acc, c) => acc + c.amount_eur, 0);
  const encaisse = (pred: (c: NetworkCommission) => boolean) =>
    cabinet
      .filter((c) => pred(c) && RECEIVED.has(c.status))
      .reduce((acc, c) => acc + c.amount_eur, 0);

  const reverseIngenieurs = commissions
    .filter((c) => c.recipient_type === "engineer_bonus")
    .reduce((acc, c) => acc + c.amount_eur, 0);

  const totalGenere = genere(() => true);
  const totalEncaisse = encaisse(() => true);

  return {
    honorairesGenere: genere(isHonoraires),
    honorairesEncaisse: encaisse(isHonoraires),
    apportsGenere: genere(isApports),
    apportsEncaisse: encaisse(isApports),
    reverseIngenieurs,
    totalGenere,
    totalEncaisse,
    resteAEncaisser: Math.max(0, totalGenere - totalEncaisse),
  };
}

export const PRODUIT_CATEGORY_LABELS: Record<string, string> = {
  av_multisupport: "Assurance-vie multisupport",
  av_lux: "Assurance-vie luxembourgeoise",
  per: "Plan épargne retraite",
  scpi: "SCPI",
  fpci: "FPCI",
  opci: "OPCI",
  structure: "Produits structurés",
  prevoyance: "Prévoyance",
  credit: "Crédit",
  autre: "Autre",
};

export type SourceBreakdown = { key: string; label: string; generated: number; subs: number };

/** Répartition des apports d'affaires réseau par catégorie de produit. */
export function computeBreakdownByCategory(commissions: NetworkCommission[]): SourceBreakdown[] {
  const map = new Map<string, { generated: number; subs: Set<string> }>();
  for (const c of commissions) {
    if (!isCabinetShare(c) || !isApports(c)) continue;
    const cat = c.souscription?.produit?.category ?? "autre";
    const entry = map.get(cat) ?? { generated: 0, subs: new Set<string>() };
    entry.generated += c.amount_eur;
    if (c.souscription?.id) entry.subs.add(c.souscription.id);
    map.set(cat, entry);
  }
  return [...map.entries()]
    .map(([key, v]) => ({
      key,
      label: PRODUIT_CATEGORY_LABELS[key] ?? key,
      generated: v.generated,
      subs: v.subs.size,
    }))
    .sort((a, b) => b.generated - a.generated);
}

export type SourceRow = {
  source: string;
  type: "Honoraires" | "Apports";
  subs: number;
  gen: number;
  enc: number;
  rest: number;
};

/**
 * Lignes "généré vs encaissé" pour le détail finance réseau : une ligne
 * honoraires d'études + une ligne apports par catégorie de produit.
 */
export function computeSourceRows(commissions: NetworkCommission[]): SourceRow[] {
  const rows: SourceRow[] = [];

  const honoraires = commissions.filter((c) => isCabinetShare(c) && isHonoraires(c));
  if (honoraires.length > 0) {
    const subs = new Set(honoraires.map((c) => c.souscription?.id).filter(Boolean));
    const gen = honoraires.reduce((a, c) => a + c.amount_eur, 0);
    const enc = honoraires
      .filter((c) => RECEIVED.has(c.status))
      .reduce((a, c) => a + c.amount_eur, 0);
    rows.push({
      source: "Honoraires études patrimoniales",
      type: "Honoraires",
      subs: subs.size,
      gen,
      enc,
      rest: Math.max(0, gen - enc),
    });
  }

  const apportsByCat = new Map<string, NetworkCommission[]>();
  for (const c of commissions) {
    if (!isCabinetShare(c) || !isApports(c)) continue;
    const cat = c.souscription?.produit?.category ?? "autre";
    const arr = apportsByCat.get(cat) ?? [];
    arr.push(c);
    apportsByCat.set(cat, arr);
  }
  for (const [cat, arr] of apportsByCat) {
    const subs = new Set(arr.map((c) => c.souscription?.id).filter(Boolean));
    const gen = arr.reduce((a, c) => a + c.amount_eur, 0);
    const enc = arr.filter((c) => RECEIVED.has(c.status)).reduce((a, c) => a + c.amount_eur, 0);
    rows.push({
      source: `Apport · ${PRODUIT_CATEGORY_LABELS[cat] ?? cat}`,
      type: "Apports",
      subs: subs.size,
      gen,
      enc,
      rest: Math.max(0, gen - enc),
    });
  }

  return rows.sort((a, b) => b.gen - a.gen);
}

// ---------------------------------------------------------------------------
// Performance des licenciés — KPIs + classement (page performance)
// ---------------------------------------------------------------------------

export type NetworkPerfKpis = {
  cabinetsCount: number;
  caTotal: number;
  encoursTotal: number;
  clientsTotal: number;
};

/** KPIs réseau pour l'en-tête de la page performance des licenciés. */
export function computeNetworkPerfKpis(cabinets: NetworkCabinet[]): NetworkPerfKpis {
  return {
    cabinetsCount: cabinets.length,
    caTotal: cabinets.reduce((acc, c) => acc + c.caGenere, 0),
    encoursTotal: cabinets.reduce((acc, c) => acc + c.totalAum, 0),
    clientsTotal: cabinets.reduce((acc, c) => acc + c.totalClients, 0),
  };
}

export type RankedCabinet = NetworkCabinet & {
  /** Rang affiché : network_rank_cached s'il existe partout, sinon rang dérivé du tri CA. */
  rank: number;
};

/**
 * Classe les cabinets pour l'affichage. Si network_rank_cached est renseigné
 * partout, on le respecte ; sinon on dérive le rang de l'ordre de tri (CA déc.).
 */
export function rankNetworkCabinets(cabinets: NetworkCabinet[]): RankedCabinet[] {
  const allCached = cabinets.length > 0 && cabinets.every((c) => c.rankCached != null);
  if (allCached) {
    return [...cabinets]
      .sort((a, b) => (a.rankCached ?? 0) - (b.rankCached ?? 0))
      .map((c) => ({ ...c, rank: c.rankCached as number }));
  }
  // cabinets est déjà trié par CA décroissant côté fetch.
  return cabinets.map((c, i) => ({ ...c, rank: c.rankCached ?? i + 1 }));
}

// ---------------------------------------------------------------------------
// Formatage
// ---------------------------------------------------------------------------

/** Montant € entier formaté fr-FR (sans suffixe), ou "—" si 0 / invalide. */
export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return Math.round(n).toLocaleString("fr-FR");
}

/** Montant € entier formaté fr-FR avec suffixe, ou "— €" si 0 / invalide. */
export function fmtEurCell(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "— €";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

/** Entier simple, ou "—" si 0 / invalide. */
export function fmtCount(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return n.toLocaleString("fr-FR");
}

/** Initiales d'un cabinet à partir de son nom (2 premières lettres signifiantes). */
export function cabinetInitials(name: string): string {
  const words = name.replace(/^Cabinet\s+/i, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}
