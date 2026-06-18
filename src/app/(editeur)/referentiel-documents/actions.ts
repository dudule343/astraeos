"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

const PAGE = "/referentiel-documents";

/** Ajoute une pièce au référentiel de collecte du tenant. */
export async function addTemplateItem(formData: FormData): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) return;

  const category = String(formData.get("category") ?? "").trim().slice(0, 120);
  const label = String(formData.get("label") ?? "").trim().slice(0, 240);
  const type = formData.get("type") === "Information" ? "Information" : "Document";
  if (!category || !label) return;

  const supabase = createAdminClient();
  await supabase.from("collecte_template_items").insert({
    tenant_id: ctx.tenantId,
    cabinet_id: ctx.cabinetId,
    category,
    sub: null,
    label,
    type,
  });
  revalidatePath(PAGE);
}

/** Retire une pièce custom (jamais une pièce du référentiel de base). */
export async function removeTemplateItem(formData: FormData): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createAdminClient();
  await supabase
    .from("collecte_template_items")
    .delete()
    .eq("id", id)
    .eq("tenant_id", ctx.tenantId);
  revalidatePath(PAGE);
}
