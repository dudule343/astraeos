"use server";

import { revalidatePath } from "next/cache";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Persistance de la fiche client ingénieur : identité du foyer (`clients`) +
 * personnes (`personnes`). Modèle = (editeur)/client-new updateClientAction :
 * garde tenant/cabinet systématique avant écriture, upsert des personnes sur la
 * clé naturelle UNIQUE (client_id, role_in_household), dégradé propre sans base.
 *
 * Le patrimoine/historique/documents restent dérivés des souscriptions : non
 * éditables ici.
 */

export type UpdateFicheClientInput = {
  clientId: string;
  foyer: {
    household_type: string;
    marital_regime: string | null;
    marriage_date: string | null; // ISO yyyy-mm-dd
    household_address: string | null;
    nb_children: number;
    nb_dependents: number;
    tax_residency: string | null;
    acquisition_origin: string | null;
  };
  personnes: Array<{
    role_in_household: "person_a" | "person_b";
    first_name: string;
    last_name: string;
    birth_name: string | null;
    birth_date: string | null; // ISO yyyy-mm-dd
    nationality: string | null;
    profession: string | null;
    employer: string | null;
    employment_status: string | null;
    tmi_estimated: number | null;
    phone: string | null;
    email: string | null;
  }>;
};

export type UpdateFicheClientResult = {
  ok: boolean;
  persisted: boolean;
  message: string;
};

/** Normalise une chaîne optionnelle : "" → null, sinon trim. */
function nz(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export async function updateFicheClient(
  input: UpdateFicheClientInput,
): Promise<UpdateFicheClientResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: true,
      persisted: false,
      message: "Aperçu : modifications non persistées (base non configurée).",
    };
  }

  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: false, persisted: false, message: "Session expirée." };

    const supabase = createAdminClient();

    // 1) Garde tenant/cabinet : le foyer doit appartenir au cabinet courant.
    const { data: owned, error: ownErr } = await supabase
      .from("clients")
      .select("id")
      .eq("id", input.clientId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    if (ownErr) return { ok: false, persisted: false, message: "Échec de la vérification." };
    if (!owned) return { ok: false, persisted: false, message: "Client introuvable." };

    // 2) Mise à jour de l'identité du foyer.
    const { error: eClient } = await supabase
      .from("clients")
      .update({
        household_type: input.foyer.household_type,
        marital_regime: input.foyer.marital_regime,
        marriage_date: input.foyer.marriage_date,
        household_address: nz(input.foyer.household_address),
        nb_children: input.foyer.nb_children,
        nb_dependents: input.foyer.nb_dependents,
        tax_residency: nz(input.foyer.tax_residency),
        acquisition_origin: input.foyer.acquisition_origin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.clientId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);
    if (eClient) return { ok: false, persisted: false, message: "Échec mise à jour foyer." };

    // 3) Upsert des personnes (clé naturelle UNIQUE (client_id, role_in_household)).
    //    first_name / last_name sont NOT NULL : on refuse une personne sans nom.
    for (const p of input.personnes) {
      const first = p.first_name.trim();
      const last = p.last_name.trim();
      if (!first || !last) {
        return {
          ok: false,
          persisted: false,
          message: "Prénom et nom requis pour chaque personne.",
        };
      }
      const { error } = await supabase.from("personnes").upsert(
        {
          client_id: input.clientId,
          role_in_household: p.role_in_household,
          first_name: first,
          last_name: last,
          birth_name: nz(p.birth_name),
          birth_date: p.birth_date,
          nationality: nz(p.nationality),
          profession: nz(p.profession),
          employer: nz(p.employer),
          employment_status: p.employment_status,
          tmi_estimated: p.tmi_estimated,
          phone: nz(p.phone),
          email: nz(p.email),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id,role_in_household" },
      );
      if (error) return { ok: false, persisted: false, message: "Échec mise à jour personnes." };
    }

    revalidatePath(`/espace-ingenieur/clients/${input.clientId}`);
    revalidatePath("/espace-ingenieur/clients");
    return { ok: true, persisted: true, message: "Fiche client enregistrée." };
  } catch {
    return { ok: false, persisted: false, message: "Erreur inattendue." };
  }
}
