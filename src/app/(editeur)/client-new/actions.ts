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

export async function deleteClientsAction(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return;
  const supabase = createAdminClient();
  // ON DELETE CASCADE supprime personnes + dossiers + souscriptions associées
  const { error } = await supabase.from("clients").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath("/");
}
