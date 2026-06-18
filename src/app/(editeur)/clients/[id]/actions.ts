"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

const MAX_LOGO = 5 * 1024 * 1024; // 5 Mo

export type UploadLogoResult = { ok: true } | { ok: false; error: string };

/** Upload du logo d'un client (image) → bucket privé 'depots' + clients.logo_url.
 *  Scopé tenant/cabinet (pas d'IDOR). */
export async function uploadClientLogo(formData: FormData): Promise<UploadLogoResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { ok: false, error: "Stockage indisponible." };
  const ctx = await getSessionContext();
  if (!ctx) return { ok: false, error: "Authentification requise." };

  const clientId = String(formData.get("clientId") ?? "").trim();
  if (!clientId) return { ok: false, error: "Client manquant." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Aucun fichier." };
  if (file.size > MAX_LOGO) return { ok: false, error: "Image trop volumineuse (5 Mo max)." };
  if (!(file.type || "").toLowerCase().startsWith("image/")) {
    return { ok: false, error: "Le logo doit être une image." };
  }

  const supabase = createAdminClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("tenant_id", ctx.tenantId)
    .eq("cabinet_id", ctx.cabinetId)
    .maybeSingle();
  if (!client) return { ok: false, error: "Client introuvable." };

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `logos/${clientId}/${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("depots")
    .upload(path, buf, { contentType: file.type, upsert: true });
  if (upErr) return { ok: false, error: "Upload impossible." };

  const { error } = await supabase.from("clients").update({ logo_url: path }).eq("id", clientId);
  if (error) return { ok: false, error: "Enregistrement impossible." };

  revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}
