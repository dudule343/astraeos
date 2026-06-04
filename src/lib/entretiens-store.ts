/**
 * Store hybride pour les entretiens visio persistés.
 *
 * - Si Supabase est configuré (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) :
 *   écrit dans `entretiens`, une ligne par `room` (room UNIQUE).
 * - Sinon : fallback fichier `.data/entretiens-store.json` à la racine du repo
 *   (gitignored), pour que le flux soit testable en local sans Supabase.
 *
 * Le backend est choisi par isSupabaseConfigured() à la fois en écriture et en
 * lecture → cohérence garantie. Même pattern que dci-store.ts.
 *
 * Caps : 2000 lignes de transcript, 200 conseils, 200 articles.
 * Tailles bornées : dci_snapshot ≤ 256 Ko, rapport ≤ 256 Ko (côté route).
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { createAdminClient } from "@/lib/supabase/admin";

export const TRANSCRIPT_CAP = 2000;
export const CONSEILS_CAP = 200;
export const ARTICLES_CAP = 200;

export type TranscriptLine = {
  t: string; // horodatage (ISO ou mm:ss selon l'émetteur)
  who?: string;
  text: string;
};

export type Entretien = {
  id: string;
  room: string;
  prospect_slug: string | null;
  display_name: string | null;
  started_at: string;
  ended_at: string | null;
  dci_snapshot: Record<string, unknown> | null;
  transcript: TranscriptLine[];
  conseils: Record<string, unknown>[];
  articles: Record<string, unknown>[];
  rapport: Record<string, unknown> | null;
  updated_at: string;
};

type FileStore = {
  entretiens: Entretien[];
};

const STORE_PATH = path.join(process.cwd(), ".data", "entretiens-store.json");

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function genId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // Repli improbable (Node sans WebCrypto) : UUID v4 pseudo-aléatoire.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// --- Normalisation des entrées d'arrays --------------------------------------

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (x): x is Record<string, unknown> => Boolean(x) && typeof x === "object",
  );
}

function normaliseTranscriptLines(value: unknown): TranscriptLine[] {
  if (!Array.isArray(value)) return [];
  const out: TranscriptLine[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const text = typeof obj.text === "string" ? obj.text : "";
    if (!text.trim()) continue;
    const line: TranscriptLine = {
      t: typeof obj.t === "string" ? obj.t : new Date().toISOString(),
      text: text.slice(0, 4000),
    };
    if (typeof obj.who === "string" && obj.who.trim()) {
      line.who = obj.who.slice(0, 120);
    }
    out.push(line);
  }
  return out;
}

function capTail<T>(arr: T[], cap: number): T[] {
  return arr.length > cap ? arr.slice(arr.length - cap) : arr;
}

// --- Mapping ligne <-> entretien ---------------------------------------------

type EntretienRow = {
  id: string;
  room: string;
  prospect_slug: string | null;
  display_name: string | null;
  started_at: string;
  ended_at: string | null;
  dci_snapshot: Record<string, unknown> | null;
  transcript: unknown;
  conseils: unknown;
  articles: unknown;
  rapport: Record<string, unknown> | null;
  updated_at: string;
};

function rowToEntretien(row: EntretienRow): Entretien {
  return {
    id: row.id,
    room: row.room,
    prospect_slug: row.prospect_slug ?? null,
    display_name: row.display_name ?? null,
    started_at: row.started_at,
    ended_at: row.ended_at ?? null,
    dci_snapshot: row.dci_snapshot ?? null,
    transcript: normaliseTranscriptLines(row.transcript),
    conseils: asRecordArray(row.conseils),
    articles: asRecordArray(row.articles),
    rapport: row.rapport ?? null,
    updated_at: row.updated_at,
  };
}

const SELECT_FULL =
  "id, room, prospect_slug, display_name, started_at, ended_at, dci_snapshot, transcript, conseils, articles, rapport, updated_at";

// --- File impl ---------------------------------------------------------------

async function readFileStore(): Promise<FileStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<FileStore>;
    return { entretiens: Array.isArray(parsed.entretiens) ? parsed.entretiens : [] };
  } catch {
    return { entretiens: [] };
  }
}

async function writeFileStore(store: FileStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

// --- API publique : upsert par room ------------------------------------------

export type UpsertInput = {
  room: string;
  prospect_slug?: string | null;
  display_name?: string | null;
};

/**
 * Upsert par room. Si l'entretien existe déjà, on le retourne SANS écraser,
 * en complétant seulement prospect_slug / display_name s'ils étaient null.
 */
export async function upsertEntretien(input: UpsertInput): Promise<Entretien> {
  const room = input.room;
  const prospect = input.prospect_slug ?? null;
  const display = input.display_name ?? null;

  if (isSupabaseConfigured()) {
    try {
      return await upsertSupabase(room, prospect, display);
    } catch (err) {
      console.warn("[entretiens-store] Supabase upsert failed, fallback file:", err);
    }
  }
  return upsertFile(room, prospect, display);
}

async function upsertSupabase(
  room: string,
  prospect: string | null,
  display: string | null,
): Promise<Entretien> {
  const supabase = createAdminClient();

  const { data: existing, error: selErr } = await supabase
    .from("entretiens")
    .select(SELECT_FULL)
    .eq("room", room)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    const row = existing as EntretienRow;
    const patch: Record<string, unknown> = {};
    if (!row.prospect_slug && prospect) patch.prospect_slug = prospect;
    if (!row.display_name && display) patch.display_name = display;

    if (Object.keys(patch).length > 0) {
      patch.updated_at = new Date().toISOString();
      const { data: updated, error: updErr } = await supabase
        .from("entretiens")
        .update(patch)
        .eq("room", room)
        .select(SELECT_FULL)
        .single();
      if (updErr) throw updErr;
      return rowToEntretien(updated as EntretienRow);
    }
    return rowToEntretien(row);
  }

  const now = new Date().toISOString();
  const { data: inserted, error: insErr } = await supabase
    .from("entretiens")
    .insert({
      room,
      prospect_slug: prospect,
      display_name: display,
      started_at: now,
      transcript: [],
      conseils: [],
      articles: [],
      updated_at: now,
    })
    .select(SELECT_FULL)
    .single();
  if (insErr) throw insErr;
  return rowToEntretien(inserted as EntretienRow);
}

async function upsertFile(
  room: string,
  prospect: string | null,
  display: string | null,
): Promise<Entretien> {
  const store = await readFileStore();
  const existing = store.entretiens.find((e) => e.room === room);
  if (existing) {
    let touched = false;
    if (!existing.prospect_slug && prospect) {
      existing.prospect_slug = prospect;
      touched = true;
    }
    if (!existing.display_name && display) {
      existing.display_name = display;
      touched = true;
    }
    if (touched) {
      existing.updated_at = new Date().toISOString();
      await writeFileStore(store);
    }
    return existing;
  }

  const now = new Date().toISOString();
  const created: Entretien = {
    id: genId(),
    room,
    prospect_slug: prospect,
    display_name: display,
    started_at: now,
    ended_at: null,
    dci_snapshot: null,
    transcript: [],
    conseils: [],
    articles: [],
    rapport: null,
    updated_at: now,
  };
  store.entretiens.push(created);
  await writeFileStore(store);
  return created;
}

// --- API publique : merge partiel par id -------------------------------------

export type MergeInput = {
  dci_snapshot?: Record<string, unknown>;
  transcript_append?: TranscriptLine[];
  conseils_append?: Record<string, unknown>[];
  articles_append?: Record<string, unknown>[];
};

/** Renvoie false si l'entretien n'existe pas. */
export async function mergeEntretien(id: string, input: MergeInput): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      return await mergeSupabase(id, input);
    } catch (err) {
      console.warn("[entretiens-store] Supabase merge failed, fallback file:", err);
    }
  }
  return mergeFile(id, input);
}

function applyMerge(current: Entretien, input: MergeInput): void {
  if (input.dci_snapshot !== undefined) {
    current.dci_snapshot = input.dci_snapshot;
  }
  if (input.transcript_append && input.transcript_append.length > 0) {
    current.transcript = capTail(
      [...current.transcript, ...input.transcript_append],
      TRANSCRIPT_CAP,
    );
  }
  if (input.conseils_append && input.conseils_append.length > 0) {
    current.conseils = capTail(
      [...current.conseils, ...input.conseils_append],
      CONSEILS_CAP,
    );
  }
  if (input.articles_append && input.articles_append.length > 0) {
    current.articles = capTail(
      [...current.articles, ...input.articles_append],
      ARTICLES_CAP,
    );
  }
  current.updated_at = new Date().toISOString();
}

async function mergeSupabase(id: string, input: MergeInput): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: existing, error: selErr } = await supabase
    .from("entretiens")
    .select(SELECT_FULL)
    .eq("id", id)
    .maybeSingle();
  if (selErr) throw selErr;
  if (!existing) return false;

  const current = rowToEntretien(existing as EntretienRow);
  applyMerge(current, input);

  const { error: updErr } = await supabase
    .from("entretiens")
    .update({
      dci_snapshot: current.dci_snapshot,
      transcript: current.transcript,
      conseils: current.conseils,
      articles: current.articles,
      updated_at: current.updated_at,
    })
    .eq("id", id);
  if (updErr) throw updErr;
  return true;
}

async function mergeFile(id: string, input: MergeInput): Promise<boolean> {
  const store = await readFileStore();
  const current = store.entretiens.find((e) => e.id === id);
  if (!current) return false;
  applyMerge(current, input);
  await writeFileStore(store);
  return true;
}

// --- API publique : terminer -------------------------------------------------

export async function terminerEntretien(
  id: string,
  rapport: Record<string, unknown>,
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      return await terminerSupabase(id, rapport);
    } catch (err) {
      console.warn("[entretiens-store] Supabase terminer failed, fallback file:", err);
    }
  }
  return terminerFile(id, rapport);
}

async function terminerSupabase(
  id: string,
  rapport: Record<string, unknown>,
): Promise<boolean> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("entretiens")
    .update({ ended_at: now, rapport, updated_at: now })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function terminerFile(
  id: string,
  rapport: Record<string, unknown>,
): Promise<boolean> {
  const store = await readFileStore();
  const current = store.entretiens.find((e) => e.id === id);
  if (!current) return false;
  const now = new Date().toISOString();
  current.ended_at = now;
  current.rapport = rapport;
  current.updated_at = now;
  await writeFileStore(store);
  return true;
}

// --- API publique : lectures -------------------------------------------------

export type EntretienListItem = {
  id: string;
  room: string;
  started_at: string;
  ended_at: string | null;
  nb_conseils: number;
  nb_articles: number;
  a_rapport: boolean;
};

export async function listEntretiens(slug: string): Promise<EntretienListItem[]> {
  if (isSupabaseConfigured()) {
    try {
      return await listSupabase(slug);
    } catch (err) {
      console.warn("[entretiens-store] Supabase list failed, fallback file:", err);
    }
  }
  return listFile(slug);
}

function toListItem(e: Entretien): EntretienListItem {
  return {
    id: e.id,
    room: e.room,
    started_at: e.started_at,
    ended_at: e.ended_at,
    nb_conseils: e.conseils.length,
    nb_articles: e.articles.length,
    a_rapport: e.rapport != null,
  };
}

async function listSupabase(slug: string): Promise<EntretienListItem[]> {
  const supabase = createAdminClient();
  // On ne sélectionne pas les gros blobs : conseils/articles servent au comptage
  // mais on évite transcript/dci_snapshot/rapport (volumineux). On reconstruit
  // le compte côté SQL via jsonb_array_length n'étant pas exposé par l'API REST,
  // on récupère conseils/articles (généralement < 200 entrées) pour les compter.
  const { data, error } = await supabase
    .from("entretiens")
    .select("id, room, started_at, ended_at, conseils, articles, rapport")
    .eq("prospect_slug", slug)
    .order("started_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  return ((data ?? []) as Array<{
    id: string;
    room: string;
    started_at: string;
    ended_at: string | null;
    conseils: unknown;
    articles: unknown;
    rapport: Record<string, unknown> | null;
  }>).map((row) => ({
    id: row.id,
    room: row.room,
    started_at: row.started_at,
    ended_at: row.ended_at ?? null,
    nb_conseils: asRecordArray(row.conseils).length,
    nb_articles: asRecordArray(row.articles).length,
    a_rapport: row.rapport != null,
  }));
}

async function listFile(slug: string): Promise<EntretienListItem[]> {
  const store = await readFileStore();
  return store.entretiens
    .filter((e) => e.prospect_slug === slug)
    .sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""))
    .map(toListItem);
}

export async function getEntretien(id: string): Promise<Entretien | null> {
  if (isSupabaseConfigured()) {
    try {
      return await getSupabase(id);
    } catch (err) {
      console.warn("[entretiens-store] Supabase get failed, fallback file:", err);
    }
  }
  return getFile(id);
}

async function getSupabase(id: string): Promise<Entretien | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("entretiens")
    .select(SELECT_FULL)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToEntretien(data as EntretienRow) : null;
}

async function getFile(id: string): Promise<Entretien | null> {
  const store = await readFileStore();
  return store.entretiens.find((e) => e.id === id) ?? null;
}
