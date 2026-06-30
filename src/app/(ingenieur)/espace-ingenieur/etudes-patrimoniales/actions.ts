"use server";

import { revalidatePath } from "next/cache";

import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

import { seedDonneesFromClient } from "../../_data/etudes-patrimoniales-server";
import { emptyEtudeDonnees } from "../../_data/etudes-patrimoniales";

/**
 * Server actions de l'outil « Études patrimoniales ».
 *
 * Toutes best-effort : jamais d'exception exposée au client, on renvoie un
 * objet de résultat. Garde tenant/cabinet systématique avant toute écriture
 * (l'étude / le client doivent appartenir au cabinet courant). Le service_role
 * bypasse RLS : le scope applicatif est la seule barrière, on ne le saute jamais.
 */

const LISTE_PATH = "/espace-ingenieur/etudes-patrimoniales";
const docPath = (id: string) => `${LISTE_PATH}/${id}`;

/** Normalise une chaîne optionnelle : "" → null, sinon trim. */
function nz(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t === "" ? null : t;
}

type Ctx = NonNullable<Awaited<ReturnType<typeof getSessionContext>>>;

/** Nom complet de l'ingénieur connecté pour la signature de validation. */
async function engineerName(
  supabase: ReturnType<typeof createAdminClient>,
  ctx: Ctx,
): Promise<string> {
  try {
    const { data } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", ctx.userId)
      .maybeSingle();
    const u = data as { first_name: string | null; last_name: string | null } | null;
    const full = `${u?.first_name?.trim() ?? ""} ${u?.last_name?.trim().toUpperCase() ?? ""}`.trim();
    return full || "Ingénieur patrimonial";
  } catch {
    return "Ingénieur patrimonial";
  }
}

/** Vérifie qu'une étude appartient au cabinet courant. Renvoie l'id ou null. */
async function ownedEtudeId(
  supabase: ReturnType<typeof createAdminClient>,
  ctx: Ctx,
  etudeId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("etudes_patrimoniales")
    .select("id")
    .eq("id", etudeId)
    .eq("tenant_id", ctx.tenantId)
    .eq("cabinet_id", ctx.cabinetId)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

// ---------------------------------------------------------------------------
// Création d'une étude (client existant OU nouveau client)
// ---------------------------------------------------------------------------

export type CreateEtudeInput = {
  /** id d'un client existant du cabinet (mode « client existant »). */
  clientId?: string | null;
  /** identité minimale d'un nouveau client (mode « nouveau client »). */
  nouveauClient?: {
    prenom: string;
    nom: string;
    email?: string | null;
  } | null;
  /** titre de l'étude (défaut : « Étude patrimoniale »). */
  titre?: string | null;
};

export type CreateEtudeResult = { ok: boolean; id?: string; error?: string };

export async function createEtude(input: CreateEtudeInput): Promise<CreateEtudeResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Base non configurée : création indisponible." };
  }
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: false, error: "Session requise." };

    const supabase = createAdminClient();

    let clientId: string | null = null;
    let dossierId: string | null = null;

    if (input.clientId) {
      // Mode client existant : il doit appartenir au cabinet courant.
      const { data: owned, error: ownErr } = await supabase
        .from("clients")
        .select("id")
        .eq("id", input.clientId)
        .eq("tenant_id", ctx.tenantId)
        .eq("cabinet_id", ctx.cabinetId)
        .maybeSingle();
      if (ownErr || !owned) return { ok: false, error: "Client introuvable." };
      clientId = (owned as { id: string }).id;

      // Dossier le plus récent du foyer (facultatif).
      const { data: dossiers } = await supabase
        .from("dossiers")
        .select("id")
        .eq("client_id", clientId)
        .eq("tenant_id", ctx.tenantId)
        .eq("cabinet_id", ctx.cabinetId)
        .order("pipeline_entry_date", { ascending: false, nullsFirst: false })
        .limit(1);
      dossierId = (dossiers?.[0]?.id as string) ?? null;
    } else if (input.nouveauClient) {
      // Mode nouveau client : prénom + nom requis.
      const prenom = input.nouveauClient.prenom.trim();
      const nom = input.nouveauClient.nom.trim();
      if (!prenom || !nom) {
        return { ok: false, error: "Prénom et nom requis pour un nouveau client." };
      }

      const { data: client, error: clientErr } = await supabase
        .from("clients")
        .insert({
          tenant_id: ctx.tenantId,
          cabinet_id: ctx.cabinetId,
          household_type: "celibataire",
          acquisition_origin: "captation_directe",
        })
        .select("id")
        .single();
      if (clientErr || !client) {
        return { ok: false, error: clientErr?.message ?? "Création du client échouée." };
      }
      clientId = (client as { id: string }).id;

      const [personRes, dossierRes] = await Promise.all([
        supabase
          .from("personnes")
          .insert({
            client_id: clientId,
            role_in_household: "person_a",
            first_name: prenom,
            last_name: nom,
            email: nz(input.nouveauClient.email),
          }),
        supabase
          .from("dossiers")
          .insert({
            tenant_id: ctx.tenantId,
            cabinet_id: ctx.cabinetId,
            client_id: clientId,
            engineer_id: ctx.userId,
            pipeline_stage: "01_prospect",
            pipeline_entry_date: new Date().toISOString().slice(0, 10),
          })
          .select("id")
          .single(),
      ]);

      if (personRes.error) return { ok: false, error: `Personne : ${personRes.error.message}` };
      if (dossierRes.error) return { ok: false, error: `Dossier : ${dossierRes.error.message}` };
      dossierId = (dossierRes.data as { id: string } | null)?.id ?? null;
    } else {
      return { ok: false, error: "Sélectionnez un client ou créez-en un nouveau." };
    }

    // Jeu de données pré-rempli depuis le réel (foyer/risque/produits), montants
    // laissés vides. Si le seed échoue, on insère un jeu de données vide.
    let donnees;
    try {
      donnees = clientId ? await seedDonneesFromClient(clientId) : emptyEtudeDonnees();
    } catch {
      donnees = emptyEtudeDonnees();
    }

    const { data: etude, error: etudeErr } = await supabase
      .from("etudes_patrimoniales")
      .insert({
        tenant_id: ctx.tenantId,
        cabinet_id: ctx.cabinetId,
        client_id: clientId,
        dossier_id: dossierId,
        engineer_id: ctx.userId,
        titre: nz(input.titre) ?? "Étude patrimoniale",
        statut: "brouillon",
        donnees,
      })
      .select("id")
      .single();

    if (etudeErr || !etude) {
      return { ok: false, error: etudeErr?.message ?? "Création de l'étude échouée." };
    }

    revalidatePath(LISTE_PATH);
    return { ok: true, id: (etude as { id: string }).id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inattendue." };
  }
}

// ---------------------------------------------------------------------------
// Validation des blocs (horodatée + signée)
// ---------------------------------------------------------------------------

export type BlocActionResult = { ok: boolean; error?: string };

export async function validateBloc(
  etudeId: string,
  blocKey: string,
): Promise<BlocActionResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Base non configurée." };
  }
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: false, error: "Session requise." };
    const supabase = createAdminClient();
    if (!(await ownedEtudeId(supabase, ctx, etudeId))) {
      return { ok: false, error: "Étude introuvable." };
    }

    const now = new Date().toISOString();
    const nom = await engineerName(supabase, ctx);
    const { error } = await supabase.from("etude_blocs").upsert(
      {
        etude_id: etudeId,
        bloc_key: blocKey,
        valide: true,
        valide_par: nom,
        valide_at: now,
        updated_at: now,
      },
      { onConflict: "etude_id,bloc_key" },
    );
    if (error) return { ok: false, error: error.message };

    revalidatePath(docPath(etudeId));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inattendue." };
  }
}

export async function unvalidateBloc(
  etudeId: string,
  blocKey: string,
): Promise<BlocActionResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Base non configurée." };
  }
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: false, error: "Session requise." };
    const supabase = createAdminClient();
    if (!(await ownedEtudeId(supabase, ctx, etudeId))) {
      return { ok: false, error: "Étude introuvable." };
    }

    const { error } = await supabase.from("etude_blocs").upsert(
      {
        etude_id: etudeId,
        bloc_key: blocKey,
        valide: false,
        valide_par: null,
        valide_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "etude_id,bloc_key" },
    );
    if (error) return { ok: false, error: error.message };

    revalidatePath(docPath(etudeId));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inattendue." };
  }
}

/**
 * Valide tous les blocs connus de l'étude. La liste des bloc_keys est passée
 * par le client (le document d'audit connaît l'ensemble de ses blocs).
 */
export async function validateAll(
  etudeId: string,
  blocKeys: string[],
): Promise<BlocActionResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Base non configurée." };
  }
  if (!Array.isArray(blocKeys) || blocKeys.length === 0) {
    return { ok: false, error: "Aucun bloc à valider." };
  }
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: false, error: "Session requise." };
    const supabase = createAdminClient();
    if (!(await ownedEtudeId(supabase, ctx, etudeId))) {
      return { ok: false, error: "Étude introuvable." };
    }

    const now = new Date().toISOString();
    const nom = await engineerName(supabase, ctx);
    const rows = blocKeys
      .map((k) => k.trim())
      .filter(Boolean)
      .map((blocKey) => ({
        etude_id: etudeId,
        bloc_key: blocKey,
        valide: true,
        valide_par: nom,
        valide_at: now,
        updated_at: now,
      }));

    const { error } = await supabase
      .from("etude_blocs")
      .upsert(rows, { onConflict: "etude_id,bloc_key" });
    if (error) return { ok: false, error: error.message };

    revalidatePath(docPath(etudeId));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inattendue." };
  }
}

// ---------------------------------------------------------------------------
// Édition du contenu d'un bloc
// ---------------------------------------------------------------------------

export async function editBloc(
  etudeId: string,
  blocKey: string,
  contenu: string,
): Promise<BlocActionResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Base non configurée." };
  }
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: false, error: "Session requise." };
    const supabase = createAdminClient();
    if (!(await ownedEtudeId(supabase, ctx, etudeId))) {
      return { ok: false, error: "Étude introuvable." };
    }

    const { error } = await supabase.from("etude_blocs").upsert(
      {
        etude_id: etudeId,
        bloc_key: blocKey,
        contenu_edite: nz(contenu),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "etude_id,bloc_key" },
    );
    if (error) return { ok: false, error: error.message };

    revalidatePath(docPath(etudeId));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inattendue." };
  }
}

// ---------------------------------------------------------------------------
// Saisie d'un montant éditable (donnees.valeurs[key])
// ---------------------------------------------------------------------------

export async function setValeur(
  etudeId: string,
  key: string,
  value: string | number | null,
): Promise<BlocActionResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Base non configurée." };
  }
  const cleanKey = key.trim();
  if (!cleanKey) return { ok: false, error: "Clé manquante." };
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { ok: false, error: "Session requise." };
    const supabase = createAdminClient();

    // Lecture-modif-écriture du JSONB, sous garde tenant/cabinet.
    const { data, error: readErr } = await supabase
      .from("etudes_patrimoniales")
      .select("donnees")
      .eq("id", etudeId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    if (readErr || !data) return { ok: false, error: "Étude introuvable." };

    const donnees = ((data as { donnees: unknown }).donnees ?? {}) as Record<string, unknown>;
    const valeurs = { ...((donnees.valeurs as Record<string, unknown>) ?? {}) };
    valeurs[cleanKey] = value;
    const next = { ...donnees, valeurs };

    const { error: writeErr } = await supabase
      .from("etudes_patrimoniales")
      .update({ donnees: next, updated_at: new Date().toISOString() })
      .eq("id", etudeId)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);
    if (writeErr) return { ok: false, error: writeErr.message };

    revalidatePath(docPath(etudeId));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inattendue." };
  }
}
