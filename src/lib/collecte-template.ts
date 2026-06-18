// Pièces personnalisées qui ÉTENDENT le référentiel de collecte de base.
// Le référentiel des 286 pièces reste en code (collecte-catalog, source de
// vérité du moteur déterministe) ; ces lignes sont les ajouts éditables dans
// l'outil par l'admin, scopés au tenant.
import { createAdminClient } from "@/lib/supabase/admin";

export type CustomTemplateItem = {
  id: string;
  category: string;
  sub: string | null;
  label: string;
  type: "Document" | "Information";
};

/** Pièces custom du tenant, ordre d'ajout. */
export async function getCustomTemplateItems(tenantId: string): Promise<CustomTemplateItem[]> {
  if (!tenantId) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("collecte_template_items")
    .select("id, category, sub, label, type")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []) as CustomTemplateItem[];
}
