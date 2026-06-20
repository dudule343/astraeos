"use server";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDerPdf, buildLettreMissionPdf, type ConformitePdfInput } from "@/lib/conformite-pdf";

export type TemplateKind = "der" | "lettre_mission";

type TemplateResult =
  | { ok: true; filename: string; base64: string }
  | { ok: false; reason: string };

/**
 * Coordonnées cabinet pour l'en-tête du modèle. On lit le vrai cabinet courant
 * (en-tête réglementaire réel), avec repli neutre si la session ou la table
 * manque. Aucune donnée client : c'est un MODÈLE vierge.
 */
async function cabinetHeader(): Promise<ConformitePdfInput["cabinet"]> {
  const fallback: ConformitePdfInput["cabinet"] = {
    name: "Cabinet PRIVEOS",
    addressStreet: null,
    addressZipcode: null,
    addressCity: null,
    phone: null,
    email: null,
    oriasNumber: null,
    rcProInsurer: null,
  };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return fallback;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return fallback;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("cabinets")
      .select(
        "name, address_street, address_city, address_zipcode, phone, email, orias_number, rc_pro_insurer",
      )
      .eq("id", ctx.cabinetId)
      .maybeSingle();
    const c = (data ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (v != null ? String(v) : null);
    return {
      name: str(c.name) ?? fallback.name,
      addressStreet: str(c.address_street),
      addressZipcode: str(c.address_zipcode),
      addressCity: str(c.address_city),
      phone: str(c.phone),
      email: str(c.email),
      oriasNumber: str(c.orias_number),
      rcProInsurer: str(c.rc_pro_insurer),
    };
  } catch {
    return fallback;
  }
}

/**
 * Génère un MODÈLE vierge de DER ou de Lettre de mission (vraie génération
 * pdf-lib), avec des champs neutres (« le client », honoraires à compléter).
 * Aucune fausse donnée client : ce sont des modèles à personnaliser par dossier.
 * Renvoie le PDF en base64 pour téléchargement côté navigateur.
 */
export async function generateTemplatePdf(kind: TemplateKind): Promise<TemplateResult> {
  try {
    const input: ConformitePdfInput = {
      dossierId: "00000000-modele",
      clientName: null,
      conjointName: null,
      honoraires: null,
      perimetre: null,
      cabinet: await cabinetHeader(),
    };

    const bytes =
      kind === "der" ? await buildDerPdf(input) : await buildLettreMissionPdf(input);
    const filename = kind === "der" ? "Modele-DER.pdf" : "Modele-Lettre-de-mission.pdf";

    return { ok: true, filename, base64: Buffer.from(bytes).toString("base64") };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Génération du modèle impossible",
    };
  }
}
