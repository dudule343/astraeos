/**
 * Store hybride pour les soumissions du parcours client.
 *
 * - Si Supabase est configuré (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) :
 *   écrit dans `dci_responses` (1 ligne par dossier, JSONB par catégorie / kind).
 * - Sinon : fallback fichier `.data/dci-store.json` à la racine du repo
 *   (gitignored), pour que le flux soit testable en local sans Supabase.
 *
 * Les 4 kinds gérés correspondent aux 4 étapes du parcours client :
 *   - rdv           → prise de RDV (Calendly)
 *   - simple        → DCI simplifié (avant entretien)
 *   - qualification → questionnaire investisseur (post-01)
 *   - complet       → DCI complet (post-02)
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { createAdminClient } from "@/lib/supabase/admin";

export type DciKind = "rdv" | "simple" | "qualification" | "complet";

export const KINDS: DciKind[] = ["rdv", "simple", "qualification", "complet"];

export type Submission = {
  prospect_slug: string;       // identifiant logique du prospect (ex: "bertrand-dupont-topin")
  kind: DciKind;
  payload: Record<string, unknown>;
  submitted_at: string;        // ISO
  display_name?: string;       // nom affichable côté ingénieur ("Bertrand DUPONT-TOPIN")
  source_ip?: string;
};

type FileStore = {
  submissions: Submission[];
};

const STORE_PATH = path.join(process.cwd(), ".data", "dci-store.json");

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as FileStore;
  } catch {
    return { submissions: [] };
  }
}

async function writeFileStore(store: FileStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

// --- Supabase impl ----------------------------------------------------------

const DEMO_DOSSIER_ID = "00000000-0000-0000-0000-000000099001"; // 1 dossier de démo

function categoryColumnFor(kind: DciKind): string {
  // On stocke chaque kind dans une colonne JSONB distincte de `dci_responses`
  // afin d'éviter de devoir altérer le schéma : on réutilise les catégories
  // existantes pour les payloads de démo (mapping pragmatique).
  switch (kind) {
    case "rdv":            return "responses_cat_01_identite";      // identité saisie au RDV
    case "simple":         return "responses_cat_12_objectifs";     // version simplifiée = objectifs + foyer
    case "qualification":  return "responses_cat_13_kyc";           // KYC = qualification client MIF
    case "complet":        return "responses_cat_05_financier";     // patrimoine financier détaillé (placeholder)
  }
}

async function saveSupabase(s: Submission): Promise<void> {
  const supabase = createAdminClient();
  const col = categoryColumnFor(s.kind);

  // Upsert minimal : la ligne `dci_responses` est liée à `DEMO_DOSSIER_ID`.
  // Si pas encore créée, on l'insère avec la colonne du kind renseignée ;
  // sinon on PATCH la colonne.
  const updatePayload = {
    [col]: { ...s.payload, _submitted_at: s.submitted_at, _slug: s.prospect_slug, _display_name: s.display_name },
    updated_at: new Date().toISOString(),
  } as Record<string, unknown>;

  const { error: updateErr, count } = await supabase
    .from("dci_responses")
    .update(updatePayload, { count: "exact" })
    .eq("dossier_id", DEMO_DOSSIER_ID)
    .select("id", { count: "exact", head: true });

  if (updateErr) throw updateErr;
  if ((count ?? 0) > 0) return;

  // Pas de ligne existante → insert
  const insertPayload = {
    dossier_id: DEMO_DOSSIER_ID,
    [col]: updatePayload[col],
  };
  const { error: insertErr } = await supabase.from("dci_responses").insert(insertPayload);
  if (insertErr) throw insertErr;
}

async function loadSupabase(slug: string): Promise<Record<DciKind, Submission | null>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dci_responses")
    .select(
      "responses_cat_01_identite, responses_cat_05_financier, responses_cat_12_objectifs, responses_cat_13_kyc, updated_at",
    )
    .eq("dossier_id", DEMO_DOSSIER_ID)
    .maybeSingle();
  if (error) throw error;

  function extract(col: keyof typeof data, kind: DciKind): Submission | null {
    if (!data) return null;
    const blob = (data as Record<string, unknown>)[col as string] as
      | (Record<string, unknown> & { _submitted_at?: string; _slug?: string; _display_name?: string })
      | null;
    if (!blob || !blob._submitted_at) return null;
    if (blob._slug && blob._slug !== slug) return null;
    const { _submitted_at, _slug, _display_name, ...payload } = blob;
    return {
      prospect_slug: _slug ?? slug,
      kind,
      payload,
      submitted_at: _submitted_at!,
      display_name: _display_name,
    };
  }
  return {
    rdv:           extract("responses_cat_01_identite", "rdv"),
    simple:        extract("responses_cat_12_objectifs", "simple"),
    qualification: extract("responses_cat_13_kyc", "qualification"),
    complet:       extract("responses_cat_05_financier", "complet"),
  };
}

// --- File impl --------------------------------------------------------------

async function saveFile(s: Submission): Promise<void> {
  const store = await readFileStore();
  const idx = store.submissions.findIndex(
    (x) => x.prospect_slug === s.prospect_slug && x.kind === s.kind,
  );
  if (idx >= 0) store.submissions[idx] = s;
  else store.submissions.push(s);
  await writeFileStore(store);
}

async function loadFile(slug: string): Promise<Record<DciKind, Submission | null>> {
  const store = await readFileStore();
  const slug_subs = store.submissions.filter((x) => x.prospect_slug === slug);
  const byKind = Object.fromEntries(KINDS.map((k) => [k, null])) as Record<DciKind, Submission | null>;
  for (const s of slug_subs) byKind[s.kind] = s;
  return byKind;
}

// --- API publique -----------------------------------------------------------

export async function saveSubmission(s: Submission): Promise<{ persisted_to: "supabase" | "file" }> {
  if (isSupabaseConfigured()) {
    try {
      await saveSupabase(s);
      return { persisted_to: "supabase" };
    } catch (err) {
      console.warn("[dci-store] Supabase save failed, falling back to file:", err);
    }
  }
  await saveFile(s);
  return { persisted_to: "file" };
}

export async function loadSubmissions(slug: string): Promise<{
  source: "supabase" | "file";
  submissions: Record<DciKind, Submission | null>;
}> {
  if (isSupabaseConfigured()) {
    try {
      const submissions = await loadSupabase(slug);
      return { source: "supabase", submissions };
    } catch (err) {
      console.warn("[dci-store] Supabase load failed, falling back to file:", err);
    }
  }
  return { source: "file", submissions: await loadFile(slug) };
}

export async function loadAllSubmissions(): Promise<Submission[]> {
  if (isSupabaseConfigured()) {
    // Pour la démo on a 1 seul dossier, on extrait via loadSupabase("*")
    try {
      const all = await loadSupabase("");
      return Object.values(all).filter(Boolean) as Submission[];
    } catch (err) {
      console.warn("[dci-store] Supabase loadAll failed, falling back:", err);
    }
  }
  const store = await readFileStore();
  return store.submissions;
}
