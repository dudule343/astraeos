// Module SERVEUR : résout l'identité du pied de sidebar depuis l'ingénieur
// réellement connecté (même source que l'écran « Profil & agréments »), afin
// que le nom affiché dans la sidebar ne diverge pas de celui de la fiche profil.
//
// IMPORTÉ UNIQUEMENT par la layout serveur (layout.tsx). JAMAIS par un composant
// client : il importe getSessionContext + createAdminClient.

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import type { SidebarIdentity } from "./sidebar-identity";

const ROLE_LABELS: Record<string, string> = {
  engineer: "Ingénieur patrimonial",
  cabinet_director: "Ingénieur patrimonial (dirigeant-praticien)",
  cabinet_admin: "Administrateur de cabinet",
  network_admin: "Administrateur réseau",
};

/** « Paris » + 75008 → « Paris 8e ». Sinon retombe sur la ville brute. */
function formatVille(city: string | null, zip: string | null): string {
  const c = city?.trim() || "";
  const z = zip?.trim() || "";
  if (c.toLowerCase() === "paris" && /^75\d{3}$/.test(z)) {
    const arr = parseInt(z.slice(3), 10);
    if (arr >= 1 && arr <= 20) return `Paris ${arr}e`;
  }
  return c;
}

/**
 * Identité de la sidebar pour l'ingénieur connecté. Retourne `null` (la sidebar
 * garde alors ses valeurs de maquette) quand la base n'est pas configurée, sans
 * session, ou si l'ingénieur n'est pas retrouvé.
 */
export async function getSidebarIdentity(): Promise<SidebarIdentity | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const ctx = await getSessionContext();
  if (!ctx) return null;

  try {
    const supabase = createAdminClient();

    const [{ data: userRow }, { data: cabinetRow }] = await Promise.all([
      supabase
        .from("users")
        .select("first_name, last_name, role")
        .eq("id", ctx.userId)
        .maybeSingle(),
      supabase
        .from("cabinets")
        .select("name, address_city, address_zipcode")
        .eq("id", ctx.cabinetId)
        .maybeSingle(),
    ]);

    const user = userRow as {
      first_name: string | null;
      last_name: string | null;
      role: string | null;
    } | null;
    if (!user || !user.first_name || !user.last_name) return null;

    const nomComplet =
      `${user.first_name.trim()} ${user.last_name.trim().toUpperCase()}`.trim();
    const role = ROLE_LABELS[user.role ?? ""] ?? "Ingénieur patrimonial";

    const cabinet = cabinetRow as {
      name: string | null;
      address_city: string | null;
      address_zipcode: string | null;
    } | null;
    const cabName = cabinet?.name?.trim() || "";
    const ville = formatVille(cabinet?.address_city ?? null, cabinet?.address_zipcode ?? null);
    const cabinetLine = [cabName, ville].filter(Boolean).join(" · ");

    return { nomComplet, role, cabinet: cabinetLine };
  } catch {
    return null;
  }
}
