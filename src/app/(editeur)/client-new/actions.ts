"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminClient,
  DEFAULT_TENANT_ID,
  DEFAULT_CABINET_ID,
  DEFAULT_ENGINEER_ID,
} from "@/lib/supabase/admin";

export async function createClientAction(formData: FormData) {
  const raisonSociale = String(formData.get("raison_sociale") ?? "").trim();
  const nomCommercial = String(formData.get("nom_commercial") ?? "").trim();
  const siren = String(formData.get("siren") ?? "").trim();
  const statutJuridique = String(formData.get("statut_juridique") ?? "").trim();
  const numeroOrias = String(formData.get("numero_orias") ?? "").trim();
  const adresseSiege = String(formData.get("adresse_siege") ?? "").trim();
  const representantLegal = String(formData.get("representant_legal") ?? "").trim();
  const emailPrincipal = String(formData.get("email_principal") ?? "").trim();
  const telephone = String(formData.get("telephone") ?? "").trim();
  const sousDomaine = String(formData.get("sous_domaine") ?? "").trim();
  const modeFacturation = String(formData.get("mode_facturation") ?? "").trim();
  const dateActivation = String(formData.get("date_activation") ?? "").trim();

  if (!raisonSociale || !siren || !adresseSiege || !representantLegal || !emailPrincipal) {
    throw new Error("Champs requis manquants : raison sociale, SIREN, adresse, représentant, email");
  }

  const supabase = createAdminClient();

  // 1. Insert client
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .insert({
      tenant_id: DEFAULT_TENANT_ID,
      cabinet_id: DEFAULT_CABINET_ID,
      household_type: "celibataire",
      household_address: adresseSiege,
      acquisition_origin: "captation_directe",
    })
    .select("id")
    .single();

  if (clientErr || !client) {
    throw new Error(clientErr?.message ?? "Création client échouée");
  }

  // 2. & 3. Insert personne + dossier en parallèle (gagne ~50% sur le temps total)
  const [firstName, ...rest] = representantLegal.split(" ");
  const lastName = rest.join(" ") || firstName;

  const internalNotes = JSON.stringify({
    raison_sociale: raisonSociale,
    nom_commercial: nomCommercial,
    siren,
    statut_juridique: statutJuridique,
    numero_orias: numeroOrias,
    sous_domaine: sousDomaine,
    mode_facturation: modeFacturation,
    date_activation: dateActivation,
  });

  const [personRes, dossierRes] = await Promise.all([
    supabase.from("personnes").insert({
      client_id: client.id,
      role_in_household: "person_a",
      first_name: firstName,
      last_name: lastName,
      email: emailPrincipal,
      phone: telephone || null,
    }),
    supabase.from("dossiers").insert({
      tenant_id: DEFAULT_TENANT_ID,
      cabinet_id: DEFAULT_CABINET_ID,
      client_id: client.id,
      engineer_id: DEFAULT_ENGINEER_ID,
      pipeline_stage: "01_prospect",
      pipeline_entry_date: new Date().toISOString().slice(0, 10),
      internal_notes: internalNotes,
    }),
  ]);

  if (personRes.error) throw new Error(`Personne : ${personRes.error.message}`);
  if (dossierRes.error) throw new Error(`Dossier : ${dossierRes.error.message}`);

  revalidatePath("/clients");
  revalidatePath("/");
  redirect("/clients");
}

// Variante pour la modal sur /clients : ne redirige pas, retourne le résultat
export async function createClientFromModalAction(
  _prevState: { ok: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const raisonSociale = String(formData.get("raison_sociale") ?? "").trim();
    const nomCommercial = String(formData.get("nom_commercial") ?? "").trim();
    const siren = String(formData.get("siren") ?? "").trim();
    const statutJuridique = String(formData.get("statut_juridique") ?? "").trim();
    const numeroOrias = String(formData.get("numero_orias") ?? "").trim();
    const adresseSiege = String(formData.get("adresse_siege") ?? "").trim();
    const representantLegal = String(formData.get("representant_legal") ?? "").trim();
    const emailPrincipal = String(formData.get("email_principal") ?? "").trim();
    const telephone = String(formData.get("telephone") ?? "").trim();
    const sousDomaine = String(formData.get("sous_domaine") ?? "").trim();
    const modeFacturation = String(formData.get("mode_facturation") ?? "").trim();
    const dateActivation = String(formData.get("date_activation") ?? "").trim();

    if (!raisonSociale || !siren || !adresseSiege || !representantLegal || !emailPrincipal) {
      return {
        ok: false,
        error: "Champs requis manquants : raison sociale, SIREN, adresse, représentant, email",
      };
    }

    const supabase = createAdminClient();

    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .insert({
        tenant_id: DEFAULT_TENANT_ID,
        cabinet_id: DEFAULT_CABINET_ID,
        household_type: "celibataire",
        household_address: adresseSiege,
        acquisition_origin: "captation_directe",
      })
      .select("id")
      .single();

    if (clientErr || !client) {
      return { ok: false, error: clientErr?.message ?? "Création client échouée" };
    }

    const [firstName, ...rest] = representantLegal.split(" ");
    const lastName = rest.join(" ") || firstName;

    const internalNotes = JSON.stringify({
      raison_sociale: raisonSociale,
      nom_commercial: nomCommercial,
      siren,
      statut_juridique: statutJuridique,
      numero_orias: numeroOrias,
      sous_domaine: sousDomaine,
      mode_facturation: modeFacturation,
      date_activation: dateActivation,
    });

    const [personRes, dossierRes] = await Promise.all([
      supabase.from("personnes").insert({
        client_id: client.id,
        role_in_household: "person_a",
        first_name: firstName,
        last_name: lastName,
        email: emailPrincipal,
        phone: telephone || null,
      }),
      supabase.from("dossiers").insert({
        tenant_id: DEFAULT_TENANT_ID,
        cabinet_id: DEFAULT_CABINET_ID,
        client_id: client.id,
        engineer_id: DEFAULT_ENGINEER_ID,
        pipeline_stage: "01_prospect",
        pipeline_entry_date: new Date().toISOString().slice(0, 10),
        internal_notes: internalNotes,
      }),
    ]);

    if (personRes.error) return { ok: false, error: `Personne : ${personRes.error.message}` };
    if (dossierRes.error) return { ok: false, error: `Dossier : ${dossierRes.error.message}` };

    revalidatePath("/clients");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

export async function deleteClientsAction(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  const supabase = createAdminClient();
  // ON DELETE CASCADE supprime personnes + dossiers + souscriptions associées
  const { error } = await supabase.from("clients").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath("/");
}

export type UpdateClientPayload = {
  id: string;
  raison_sociale?: string;
  representant?: string;
  email?: string;
  phone?: string;
  pack?: string;
  revenue?: string;
  engineers?: string;
  end_clients?: string;
  status?: string;
  health?: string;
  category?: string;
  sub_category?: string;
};

export async function updateClientAction(payload: UpdateClientPayload) {
  const supabase = createAdminClient();

  // 1. Mettre à jour la personne représentant légal
  if (payload.representant || payload.email || payload.phone !== undefined) {
    const { data: existingPersons } = await supabase
      .from("personnes")
      .select("id")
      .eq("client_id", payload.id)
      .limit(1);

    if (existingPersons && existingPersons[0]) {
      const update: Record<string, string | null> = {};
      if (payload.representant) {
        const [firstName, ...rest] = payload.representant.split(" ");
        update.first_name = firstName;
        update.last_name = rest.join(" ") || firstName;
      }
      if (payload.email) update.email = payload.email;
      if (payload.phone !== undefined) update.phone = payload.phone || null;
      const { error: pErr } = await supabase
        .from("personnes")
        .update(update)
        .eq("id", existingPersons[0].id);
      if (pErr) throw new Error(`Personne : ${pErr.message}`);
    }
  }

  // 2. Mettre à jour les notes du dossier (raison sociale, pack, revenu, etc.)
  const { data: dossiers } = await supabase
    .from("dossiers")
    .select("id, internal_notes")
    .eq("client_id", payload.id)
    .limit(1);

  if (dossiers && dossiers[0]) {
    let notes: Record<string, unknown> = {};
    if (dossiers[0].internal_notes) {
      try {
        notes = JSON.parse(dossiers[0].internal_notes as string);
      } catch {
        // ignore
      }
    }
    const fields = ["raison_sociale", "pack", "revenue", "engineers", "end_clients", "status", "health", "category", "sub_category"] as const;
    for (const f of fields) {
      if (payload[f] !== undefined) notes[f] = payload[f];
    }
    const { error: dErr } = await supabase
      .from("dossiers")
      .update({ internal_notes: JSON.stringify(notes) })
      .eq("id", dossiers[0].id);
    if (dErr) throw new Error(`Dossier : ${dErr.message}`);
  }

  revalidatePath("/clients");
}
