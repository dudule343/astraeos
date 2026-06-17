import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// Analyse produit côté offre : seul axe réellement câblable en DB.
// On croise souscriptions × produits (joints par produit_id) pour calculer
// le mix produit du cabinet (par catégorie, par partenaire). Tout est scopé
// tenant_id + cabinet_id ; le client admin bypasse RLS, donc le scope explicite
// est obligatoire pour l'isolation. En mode legacy (auth off), le contexte
// renvoie le cabinet du seed → données réelles de ce cabinet.
//
// L'analyse comportementale (usage par feature, funnels, abandons) n'a AUCUNE
// table source → état vide honnête « Phase 2 » côté page, pas de chiffre inventé.

export const CATEGORY_LABELS: Record<string, string> = {
  av_multisupport: "Assurance-vie multisupport",
  av_lux: "Assurance-vie luxembourgeoise",
  per: "PER",
  scpi: "SCPI",
  fpci: "FPCI",
  opci: "OPCI",
  structure: "Produit structuré",
  prevoyance: "Prévoyance",
  credit: "Crédit",
  autre: "Autre",
};

export type CategorieRow = {
  category: string;
  label: string;
  count: number;
  montant: number;
  pct: number;
};

export type PartenaireRow = {
  partner: string;
  count: number;
  montant: number;
  pct: number;
};

export type CatalogueRow = {
  category: string;
  label: string;
  count: number;
};

export type AnalyseProduit = {
  parCategorie: CategorieRow[];
  parPartenaire: PartenaireRow[];
  catalogue: CatalogueRow[];
  totalSouscriptions: number;
  totalAum: number;
  produitsActifs: number;
  partenairesDistincts: number;
  hasData: boolean;
};

const EMPTY: AnalyseProduit = {
  parCategorie: [],
  parPartenaire: [],
  catalogue: [],
  totalSouscriptions: 0,
  totalAum: 0,
  produitsActifs: 0,
  partenairesDistincts: 0,
  hasData: false,
};

type ProduitEmbed = {
  category?: string | null;
  partner_name?: string | null;
  name?: string | null;
};
type SubRow = {
  id: string;
  amount_initial: number | string | null;
  total_aum_current: number | string | null;
  status: string | null;
  produits?: ProduitEmbed | ProduitEmbed[] | null;
};

function produitOf(row: SubRow): ProduitEmbed | null {
  // Supabase renvoie l'embed en objet ou tableau selon la relation.
  const p = Array.isArray(row.produits) ? row.produits[0] : row.produits;
  return p ?? null;
}

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchAnalyseProduit(): Promise<AnalyseProduit> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    // Souscriptions du cabinet, jointes au produit pour catégorie/partenaire.
    const { data: subsRaw } = await supabase
      .from("souscriptions")
      .select(
        "id, amount_initial, total_aum_current, status, produits(category, partner_name, name)",
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);

    const subs = (subsRaw ?? []) as SubRow[];

    // Catalogue produits actifs du cabinet (offre, indépendant des souscriptions).
    const { data: produitsRaw } = await supabase
      .from("produits")
      .select("id, category, partner_name")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("status", "active");

    const produits = (produitsRaw ?? []) as { category: string | null; partner_name: string | null }[];

    // --- Agrégation par catégorie (souscriptions) ---
    const catMap = new Map<string, { count: number; montant: number }>();
    const partMap = new Map<string, { count: number; montant: number }>();
    let totalSouscriptions = 0;
    let totalAum = 0;

    for (const s of subs) {
      const p = produitOf(s);
      const cat = p?.category ?? "autre";
      const partner = (p?.partner_name ?? "").trim() || "Sans partenaire";
      const montant = num(s.amount_initial);

      totalSouscriptions += 1;
      totalAum += num(s.total_aum_current);

      const c = catMap.get(cat) ?? { count: 0, montant: 0 };
      c.count += 1;
      c.montant += montant;
      catMap.set(cat, c);

      const pr = partMap.get(partner) ?? { count: 0, montant: 0 };
      pr.count += 1;
      pr.montant += montant;
      partMap.set(partner, pr);
    }

    const maxCatCount = Math.max(1, ...[...catMap.values()].map((v) => v.count));
    const parCategorie: CategorieRow[] = [...catMap.entries()]
      .map(([category, v]) => ({
        category,
        label: CATEGORY_LABELS[category] ?? category,
        count: v.count,
        montant: v.montant,
        pct: Math.round((v.count / maxCatCount) * 100),
      }))
      .sort((a, b) => b.count - a.count || b.montant - a.montant);

    const maxPartCount = Math.max(1, ...[...partMap.values()].map((v) => v.count));
    const parPartenaire: PartenaireRow[] = [...partMap.entries()]
      .map(([partner, v]) => ({
        partner,
        count: v.count,
        montant: v.montant,
        pct: Math.round((v.count / maxPartCount) * 100),
      }))
      .sort((a, b) => b.count - a.count || b.montant - a.montant);

    // --- Agrégation du catalogue par catégorie ---
    const catalogueMap = new Map<string, number>();
    const partnersSet = new Set<string>();
    for (const p of produits) {
      const cat = p.category ?? "autre";
      catalogueMap.set(cat, (catalogueMap.get(cat) ?? 0) + 1);
      const partner = (p.partner_name ?? "").trim();
      if (partner) partnersSet.add(partner);
    }
    const catalogue: CatalogueRow[] = [...catalogueMap.entries()]
      .map(([category, count]) => ({
        category,
        label: CATEGORY_LABELS[category] ?? category,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      parCategorie,
      parPartenaire,
      catalogue,
      totalSouscriptions,
      totalAum,
      produitsActifs: produits.length,
      partenairesDistincts: partnersSet.size,
      hasData: parCategorie.length > 0,
    };
  } catch {
    return EMPTY;
  }
}

export function fmtEur(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}
