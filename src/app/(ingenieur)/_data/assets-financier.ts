import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// Détail de l'investissement financier du portefeuille de l'ingénieur, lu sur la
// table souscriptions réelle (scope tenant + cabinet). Les classes « financier »
// suivent la même convention que le cockpit : per, structure, av_multisupport,
// av_lux. L'encours retenu est le total_aum_current s'il est renseigné, sinon le
// montant initial souscrit. Tout est en try/catch : si Supabase n'est pas branché
// ou ne renvoie rien, on retombe sur un état vide honnête (aucune fausse donnée).

const FINANCIER = new Set(["per", "structure", "av_multisupport", "av_lux"]);

const CATEGORY_LABELS: Record<string, string> = {
  av_multisupport: "Assurance vie multisupport",
  av_lux: "Assurance vie luxembourgeoise",
  per: "PER",
  structure: "Produit structuré",
  scpi: "SCPI",
  fpci: "FPCI",
  opci: "OPCI",
  prevoyance: "Prévoyance",
  credit: "Crédit",
  autre: "Autre",
};

export function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

export type FinancierContract = {
  productName: string;
  category: string;
  categoryLabel: string;
  subscriptionDate: string | null;
  encours: number;
};

export type FinancierClient = {
  clientId: string;
  name: string;
  initials: string;
  contracts: FinancierContract[];
  totalEncours: number;
};

export type TopProduct = {
  label: string;
  count: number;
  encours: number;
};

export type AssetsFinancier = {
  encoursTotal: number;
  contratsActifs: number;
  clientsFinancier: number;
  clientsServis: number;
  clients: FinancierClient[];
  topProducts: TopProduct[];
  hasData: boolean;
};

const EMPTY: AssetsFinancier = {
  encoursTotal: 0,
  contratsActifs: 0,
  clientsFinancier: 0,
  clientsServis: 0,
  clients: [],
  topProducts: [],
  hasData: false,
};

type Personne = { first_name?: string | null; last_name?: string | null };
type ClientEmbed = { id?: string; personnes?: Personne[] | Personne | null };
type SubRow = {
  amount_initial?: number | null;
  total_aum_current?: number | null;
  subscription_date?: string | null;
  client_id?: string | null;
  produits?: { name?: string | null; category?: string | null } | { name?: string | null; category?: string | null }[] | null;
  clients?: ClientEmbed | ClientEmbed[] | null;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function nameOf(client: ClientEmbed | undefined): string {
  const persons = client?.personnes;
  const p = Array.isArray(persons) ? persons[0] : persons;
  if (!p) return "Client sans nom";
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return name || "Client sans nom";
}

export async function fetchAssetsFinancier(): Promise<AssetsFinancier> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    const { data: subs } = await supabase
      .from("souscriptions")
      .select(
        "amount_initial, total_aum_current, subscription_date, client_id, produits(name, category), clients(id, personnes(first_name, last_name))",
      )
      .eq("cabinet_id", ctx.cabinetId)
      .eq("tenant_id", ctx.tenantId);

    // Nombre de clients servis par le cabinet, pour le ratio « 6 / 7 ».
    const { count: clientsServis } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("cabinet_id", ctx.cabinetId)
      .eq("tenant_id", ctx.tenantId);

    const rows = (subs ?? []) as SubRow[];

    const byClient = new Map<string, FinancierClient>();
    const byProduct = new Map<string, TopProduct>();
    let encoursTotal = 0;
    let contratsActifs = 0;

    for (const raw of rows) {
      const prod = Array.isArray(raw.produits) ? raw.produits[0] : raw.produits;
      const cat = prod?.category ?? "";
      if (!FINANCIER.has(cat)) continue;

      const init = raw.amount_initial != null ? Number(raw.amount_initial) : 0;
      const aum = raw.total_aum_current != null ? Number(raw.total_aum_current) : 0;
      const encours = aum > 0 ? aum : init;
      const cid = raw.client_id ?? "";
      const clientEmbed = Array.isArray(raw.clients) ? raw.clients[0] : raw.clients;
      const productName = prod?.name?.trim() || categoryLabel(cat);

      encoursTotal += encours;
      contratsActifs += 1;

      // Agrégat par client.
      if (cid) {
        const existing = byClient.get(cid);
        const contract: FinancierContract = {
          productName,
          category: cat,
          categoryLabel: categoryLabel(cat),
          subscriptionDate: raw.subscription_date ?? null,
          encours,
        };
        if (existing) {
          existing.contracts.push(contract);
          existing.totalEncours += encours;
        } else {
          const name = nameOf(clientEmbed ?? undefined);
          byClient.set(cid, {
            clientId: cid,
            name,
            initials: initialsOf(name),
            contracts: [contract],
            totalEncours: encours,
          });
        }
      }

      // Top produits placés (par libellé de produit réel).
      const pk = productName;
      const tp = byProduct.get(pk);
      if (tp) {
        tp.count += 1;
        tp.encours += encours;
      } else {
        byProduct.set(pk, { label: productName, count: 1, encours });
      }
    }

    const clients = Array.from(byClient.values()).sort(
      (a, b) => b.totalEncours - a.totalEncours,
    );
    const topProducts = Array.from(byProduct.values()).sort(
      (a, b) => b.encours - a.encours,
    );

    return {
      encoursTotal,
      contratsActifs,
      clientsFinancier: byClient.size,
      clientsServis: clientsServis ?? 0,
      clients,
      topProducts,
      hasData: contratsActifs > 0,
    };
  } catch {
    return EMPTY;
  }
}

export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

export function fmtDateFr(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
