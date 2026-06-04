/**
 * Store hybride pour les soumissions du parcours client.
 *
 * - Si Supabase est configuré (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) :
 *   écrit dans `dci_submissions`, une ligne par (prospect_slug, kind).
 * - Sinon : fallback fichier `.data/dci-store.json` à la racine du repo
 *   (gitignored), pour que le flux soit testable en local sans Supabase.
 *
 * Le backend (Supabase ou fichier) est choisi par isSupabaseConfigured() à la
 * fois en écriture et en lecture → cohérence save/load garantie.
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

type DciSubmissionRow = {
  prospect_slug: string;
  kind: DciKind;
  payload: Record<string, unknown> | null;
  display_name: string | null;
  source_ip: string | null;
  submitted_at: string;
  updated_at: string;
};

function rowToSubmission(row: DciSubmissionRow): Submission {
  return {
    prospect_slug: row.prospect_slug,
    kind: row.kind,
    payload: row.payload ?? {},
    submitted_at: row.submitted_at,
    display_name: row.display_name ?? undefined,
    source_ip: row.source_ip ?? undefined,
  };
}

async function saveSupabase(s: Submission): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("dci_submissions")
    .upsert(
      {
        prospect_slug: s.prospect_slug,
        kind: s.kind,
        payload: s.payload,
        display_name: s.display_name ?? null,
        source_ip: s.source_ip ?? null,
        submitted_at: s.submitted_at,
        updated_at: now,
      },
      { onConflict: "prospect_slug,kind" },
    );
  if (error) throw error;
}

async function loadSupabase(slug: string): Promise<Record<DciKind, Submission | null>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dci_submissions")
    .select("prospect_slug, kind, payload, display_name, source_ip, submitted_at, updated_at")
    .eq("prospect_slug", slug);
  if (error) throw error;

  const byKind = Object.fromEntries(KINDS.map((k) => [k, null])) as Record<DciKind, Submission | null>;
  for (const row of (data ?? []) as DciSubmissionRow[]) {
    if ((KINDS as string[]).includes(row.kind)) byKind[row.kind] = rowToSubmission(row);
  }
  return byKind;
}

async function loadAllSupabase(): Promise<Submission[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dci_submissions")
    .select("prospect_slug, kind, payload, display_name, source_ip, submitted_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return ((data ?? []) as DciSubmissionRow[]).map(rowToSubmission);
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

export async function loadAllSubmissions(): Promise<{
  source: "supabase" | "file";
  submissions: Submission[];
}> {
  if (isSupabaseConfigured()) {
    try {
      return { source: "supabase", submissions: await loadAllSupabase() };
    } catch (err) {
      console.warn("[dci-store] Supabase loadAll failed, falling back to file:", err);
    }
  }
  const store = await readFileStore();
  return { source: "file", submissions: store.submissions };
}
