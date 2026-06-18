"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

/**
 * Met à jour les coordonnées du cabinet courant (table cabinets).
 *
 * Seuls les champs « contact » sont éditables : raison sociale, téléphone,
 * e-mail et adresse (rue / code postal / ville). Les champs « réseau »
 * (agréments ORIAS, RC Pro, répartition des commissions) restent en lecture
 * seule et ne sont jamais touchés ici.
 *
 * L'écriture est strictement scopée au cabinet de la session
 * (.eq('id', ctx.cabinetId).eq('tenant_id', ctx.tenantId)) : un id forgé ne
 * peut pas muter le cabinet d'un autre tenant.
 */
export async function updateCabinetContact(formData: FormData): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) throw new Error("Session requise");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const addressStreet = String(formData.get("address_street") ?? "").trim();
  const addressZipcode = String(formData.get("address_zipcode") ?? "").trim();
  const addressCity = String(formData.get("address_city") ?? "").trim();

  // La raison sociale est NOT NULL en base : on refuse un nom vide.
  if (!name) {
    throw new Error("La raison sociale est obligatoire.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("cabinets")
    .update({
      name,
      phone: phone || null,
      email: email || null,
      address_street: addressStreet || null,
      address_zipcode: addressZipcode || null,
      address_city: addressCity || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.cabinetId)
    .eq("tenant_id", ctx.tenantId);

  if (error) throw new Error(error.message);

  revalidatePath("/espace-dirigeant/parametrages");
}
