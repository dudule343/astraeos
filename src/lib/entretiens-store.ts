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
export const NOTES_CAP = 500;

export type TranscriptLine = {
  t: string; // horodatage (ISO ou mm:ss selon l'émetteur)
  who?: string;
  text: string;
};

export type Entretien = {
  id: string;
  room: string;
  tenant_id: string | null;
  cabinet_id: string | null;
  prospect_slug: string | null;
  display_name: string | null;
  started_at: string;
  ended_at: string | null;
  dci_snapshot: Record<string, unknown> | null;
  transcript: TranscriptLine[];
  conseils: Record<string, unknown>[];
  articles: Record<string, unknown>[];
  notes: TranscriptLine[];
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
  tenant_id: string | null;
  cabinet_id: string | null;
  prospect_slug: string | null;
  display_name: string | null;
  started_at: string;
  ended_at: string | null;
  dci_snapshot: Record<string, unknown> | null;
  transcript: unknown;
  conseils: unknown;
  articles: unknown;
  notes: unknown;
  rapport: Record<string, unknown> | null;
  updated_at: string;
};

function rowToEntretien(row: EntretienRow): Entretien {
  return {
    id: row.id,
    room: row.room,
    tenant_id: row.tenant_id ?? null,
    cabinet_id: row.cabinet_id ?? null,
    prospect_slug: row.prospect_slug ?? null,
    display_name: row.display_name ?? null,
    started_at: row.started_at,
    ended_at: row.ended_at ?? null,
    dci_snapshot: row.dci_snapshot ?? null,
    transcript: normaliseTranscriptLines(row.transcript),
    conseils: asRecordArray(row.conseils),
    articles: asRecordArray(row.articles),
    notes: normaliseTranscriptLines(row.notes),
    rapport: row.rapport ?? null,
    updated_at: row.updated_at,
  };
}

const SELECT_FULL =
  "id, room, tenant_id, cabinet_id, prospect_slug, display_name, started_at, ended_at, dci_snapshot, transcript, conseils, articles, notes, rapport, updated_at";

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
  /** Tenant/cabinet du requêteur, fournis par la route (ctx.*). Écrits à la
   *  création uniquement ; laissés tels quels si absents. */
  tenant_id?: string | null;
  cabinet_id?: string | null;
};

/**
 * Upsert par room. Si l'entretien existe déjà, on le retourne SANS écraser,
 * en complétant seulement prospect_slug / display_name s'ils étaient null.
 */
export async function upsertEntretien(input: UpsertInput): Promise<Entretien> {
  const room = input.room;
  const prospect = input.prospect_slug ?? null;
  const display = input.display_name ?? null;
  const tenant = input.tenant_id ?? null;
  const cabinet = input.cabinet_id ?? null;

  if (isSupabaseConfigured()) {
    try {
      return await upsertSupabase(room, prospect, display, tenant, cabinet);
    } catch (err) {
      console.warn("[entretiens-store] Supabase upsert failed, fallback file:", err);
    }
  }
  return upsertFile(room, prospect, display, tenant, cabinet);
}

async function upsertSupabase(
  room: string,
  prospect: string | null,
  display: string | null,
  tenant: string | null,
  cabinet: string | null,
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
  const insertPayload: Record<string, unknown> = {
    room,
    prospect_slug: prospect,
    display_name: display,
    started_at: now,
    transcript: [],
    conseils: [],
    articles: [],
    notes: [],
    updated_at: now,
  };
  if (tenant) insertPayload.tenant_id = tenant;
  if (cabinet) insertPayload.cabinet_id = cabinet;

  const { data: inserted, error: insErr } = await supabase
    .from("entretiens")
    .insert(insertPayload)
    .select(SELECT_FULL)
    .single();
  if (insErr) throw insErr;
  return rowToEntretien(inserted as EntretienRow);
}

async function upsertFile(
  room: string,
  prospect: string | null,
  display: string | null,
  tenant: string | null,
  cabinet: string | null,
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
    tenant_id: tenant,
    cabinet_id: cabinet,
    prospect_slug: prospect,
    display_name: display,
    started_at: now,
    ended_at: null,
    dci_snapshot: null,
    transcript: [],
    conseils: [],
    articles: [],
    notes: [],
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
  notes_append?: TranscriptLine[];
};

/** Renvoie false si l'entretien n'existe pas. */
/** Borne une ligne de transcript/note au write-boundary : `text` doit être une
 *  chaîne non vide, bornée à 4000 chars ; `t` une chaîne. Élimine les lignes
 *  poubelle ({text:null}, {text:12345}, {foo:'bar'}) AVANT écriture — protège
 *  tous les écrivains (PATCH + transcript-flush) par construction. */
function sanitizeLines(arr: TranscriptLine[] | undefined): TranscriptLine[] | undefined {
  if (!Array.isArray(arr)) return undefined;
  const clean = arr
    .filter((l) => l && typeof l === "object" && typeof l.text === "string" && l.text.trim() !== "")
    .map((l) => ({
      t: typeof l.t === "string" ? l.t : new Date().toISOString(),
      ...(typeof l.who === "string" ? { who: l.who.slice(0, 80) } : {}),
      text: l.text.slice(0, 4000),
    }));
  return clean.length ? clean : undefined;
}

/** Ne garde que les objets pour conseils/articles (pas de scalaires/poubelle). */
function sanitizeRecords(
  arr: Record<string, unknown>[] | undefined,
): Record<string, unknown>[] | undefined {
  if (!Array.isArray(arr)) return undefined;
  const clean = arr.filter((r) => r && typeof r === "object" && !Array.isArray(r));
  return clean.length ? clean : undefined;
}

export async function mergeEntretien(id: string, input: MergeInput): Promise<boolean> {
  // Sanitisation au WRITE boundary : un seul point protège tous les appelants.
  const safe: MergeInput = {
    ...(input.dci_snapshot !== undefined ? { dci_snapshot: input.dci_snapshot } : {}),
    ...(input.transcript_append ? { transcript_append: sanitizeLines(input.transcript_append) } : {}),
    ...(input.notes_append ? { notes_append: sanitizeLines(input.notes_append) } : {}),
    ...(input.conseils_append ? { conseils_append: sanitizeRecords(input.conseils_append) } : {}),
    ...(input.articles_append ? { articles_append: sanitizeRecords(input.articles_append) } : {}),
  };
  if (isSupabaseConfigured()) {
    try {
      return await mergeSupabase(id, safe);
    } catch (err) {
      console.warn("[entretiens-store] Supabase merge failed, fallback file:", err);
    }
  }
  return mergeFile(id, safe);
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
  if (input.notes_append && input.notes_append.length > 0) {
    current.notes = capTail([...current.notes, ...input.notes_append], NOTES_CAP);
  }
  current.updated_at = new Date().toISOString();
}

async function mergeSupabase(id: string, input: MergeInput): Promise<boolean> {
  const supabase = createAdminClient();
  // Lecture-fusion-écriture via REST (clé service_role). On n'utilise PAS de RPC
  // SQL : aucune fonction `append_entretien` n'est garantie en base, et on ne peut
  // pas créer de DDL ici. Acceptable fonctionnellement : un seul ingénieur édite
  // son entretien à la fois, les flush sont débouncés, et les caps bornent la
  // taille. En cas de deux flush quasi simultanés, le dernier write gagne (perte
  // tolérable de quelques lignes en append) — bien mieux que l'ancien repli
  // fichier éphémère qui PERDAIT tout sur Vercel.
  const { data: row, error: readErr } = await supabase
    .from("entretiens")
    .select("transcript, conseils, articles, notes, dci_snapshot")
    .eq("id", id)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!row) return false;

  const current = {
    transcript: Array.isArray(row.transcript) ? row.transcript : [],
    conseils: Array.isArray(row.conseils) ? row.conseils : [],
    articles: Array.isArray(row.articles) ? row.articles : [],
    notes: Array.isArray(row.notes) ? row.notes : [],
    dci_snapshot: row.dci_snapshot ?? null,
    updated_at: "",
  } as unknown as Entretien;
  applyMerge(current, input);

  const { error: upErr } = await supabase
    .from("entretiens")
    .update({
      transcript: current.transcript,
      conseils: current.conseils,
      articles: current.articles,
      notes: current.notes,
      dci_snapshot: current.dci_snapshot,
      updated_at: current.updated_at,
    })
    .eq("id", id);
  if (upErr) throw upErr;
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

/** Durée AUTORITAIRE serveur (ended_at - started_at). Écrase toute durée venue
 *  du client (le timer DOM était hardcodé à 00:24:18 → rapports faux). */
function withServerDuration(
  rapport: Record<string, unknown>,
  startedAt: string | null | undefined,
  now: Date,
): Record<string, unknown> {
  if (!startedAt) return rapport;
  const sec = Math.max(0, Math.round((now.getTime() - new Date(startedAt).getTime()) / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    ...rapport,
    duration_s: sec,
    duration: `${p(Math.floor(sec / 3600))}:${p(Math.floor((sec % 3600) / 60))}:${p(sec % 60)}`,
  };
}

async function terminerSupabase(
  id: string,
  rapport: Record<string, unknown>,
): Promise<boolean> {
  const supabase = createAdminClient();
  const now = new Date();
  const { data: existing } = await supabase
    .from("entretiens")
    .select("started_at")
    .eq("id", id)
    .maybeSingle();
  const enriched = withServerDuration(rapport, existing?.started_at as string | undefined, now);
  const iso = now.toISOString();
  const { data, error } = await supabase
    .from("entretiens")
    .update({ ended_at: iso, rapport: enriched, updated_at: iso })
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
  const now = new Date();
  const iso = now.toISOString();
  current.ended_at = iso;
  current.rapport = withServerDuration(rapport, current.started_at, now);
  current.updated_at = iso;
  await writeFileStore(store);
  return true;
}

// --- API publique : compte-rendu IA ------------------------------------------

/**
 * Enregistre la synthèse IA dans rapport.synthese_ia SANS clôturer l'entretien
 * (ended_at inchangé) : l'ingénieur peut générer le compte-rendu avant de
 * cliquer « Terminer ». Fusionne avec un éventuel rapport existant.
 */
export async function saveCompteRendu(
  id: string,
  markdown: string,
  model: string,
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      return await saveCompteRenduSupabase(id, markdown, model);
    } catch (err) {
      console.warn("[entretiens-store] Supabase saveCompteRendu failed, fallback file:", err);
    }
  }
  return saveCompteRenduFile(id, markdown, model);
}

function buildRapportWithSynthese(
  existing: Record<string, unknown> | null,
  markdown: string,
  model: string,
): Record<string, unknown> {
  return {
    ...(existing ?? {}),
    synthese_ia: markdown,
    synthese_model: model,
    synthese_generated_at: new Date().toISOString(),
  };
}

async function saveCompteRenduSupabase(
  id: string,
  markdown: string,
  model: string,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data: existing, error: selErr } = await supabase
    .from("entretiens")
    .select("rapport")
    .eq("id", id)
    .maybeSingle();
  if (selErr) throw selErr;
  if (!existing) return false;

  const rapport = buildRapportWithSynthese(
    (existing as { rapport: Record<string, unknown> | null }).rapport ?? null,
    markdown,
    model,
  );
  const { error: updErr } = await supabase
    .from("entretiens")
    .update({ rapport, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (updErr) throw updErr;
  return true;
}

async function saveCompteRenduFile(
  id: string,
  markdown: string,
  model: string,
): Promise<boolean> {
  const store = await readFileStore();
  const current = store.entretiens.find((e) => e.id === id);
  if (!current) return false;
  current.rapport = buildRapportWithSynthese(current.rapport, markdown, model);
  current.updated_at = new Date().toISOString();
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

export async function listEntretiens(
  slug: string,
  tenantId?: string | null,
): Promise<EntretienListItem[]> {
  if (isSupabaseConfigured()) {
    try {
      return await listSupabase(slug, tenantId ?? null);
    } catch (err) {
      console.warn("[entretiens-store] Supabase list failed, fallback file:", err);
    }
  }
  return listFile(slug, tenantId ?? null);
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

async function listSupabase(
  slug: string,
  tenantId: string | null,
): Promise<EntretienListItem[]> {
  const supabase = createAdminClient();
  // On ne sélectionne pas les gros blobs : conseils/articles servent au comptage
  // mais on évite transcript/dci_snapshot/rapport (volumineux). On reconstruit
  // le compte côté SQL via jsonb_array_length n'étant pas exposé par l'API REST,
  // on récupère conseils/articles (généralement < 200 entrées) pour les compter.
  let query = supabase
    .from("entretiens")
    .select("id, room, started_at, ended_at, conseils, articles, rapport")
    .eq("prospect_slug", slug);
  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data, error } = await query
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

async function listFile(
  slug: string,
  tenantId: string | null,
): Promise<EntretienListItem[]> {
  const store = await readFileStore();
  return store.entretiens
    .filter((e) => e.prospect_slug === slug)
    .filter((e) => !tenantId || e.tenant_id === tenantId)
    .sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""))
    .map(toListItem);
}

export type EntretienRecent = EntretienListItem & {
  prospect_slug: string | null;
  display_name: string | null;
};

/** Liste globale des entretiens récents (tableau de bord Espace), sans les gros
 *  blobs (transcript/dci_snapshot). Tri par date décroissante. */
export async function listRecentEntretiens(
  limit = 200,
  tenantId?: string | null,
): Promise<EntretienRecent[]> {
  if (isSupabaseConfigured()) {
    try {
      return await listRecentSupabase(limit, tenantId ?? null);
    } catch (err) {
      console.warn("[entretiens-store] Supabase listRecent failed, fallback file:", err);
    }
  }
  return listRecentFile(limit, tenantId ?? null);
}

async function listRecentSupabase(
  limit: number,
  tenantId: string | null,
): Promise<EntretienRecent[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("entretiens")
    .select("id, room, prospect_slug, display_name, started_at, ended_at, conseils, articles, rapport");
  if (tenantId) query = query.eq("tenant_id", tenantId);
  const { data, error } = await query
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return ((data ?? []) as Array<{
    id: string;
    room: string;
    prospect_slug: string | null;
    display_name: string | null;
    started_at: string;
    ended_at: string | null;
    conseils: unknown;
    articles: unknown;
    rapport: Record<string, unknown> | null;
  }>).map((row) => ({
    id: row.id,
    room: row.room,
    prospect_slug: row.prospect_slug ?? null,
    display_name: row.display_name ?? null,
    started_at: row.started_at,
    ended_at: row.ended_at ?? null,
    nb_conseils: asRecordArray(row.conseils).length,
    nb_articles: asRecordArray(row.articles).length,
    a_rapport: row.rapport != null,
  }));
}

async function listRecentFile(
  limit: number,
  tenantId: string | null,
): Promise<EntretienRecent[]> {
  const store = await readFileStore();
  return store.entretiens
    .slice()
    .filter((e) => !tenantId || e.tenant_id === tenantId)
    .sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""))
    .slice(0, limit)
    .map((e) => ({
      ...toListItem(e),
      prospect_slug: e.prospect_slug ?? null,
      display_name: e.display_name ?? null,
    }));
}

export async function getEntretien(
  id: string,
  tenantId?: string | null,
): Promise<Entretien | null> {
  if (isSupabaseConfigured()) {
    try {
      return await getSupabase(id, tenantId ?? null);
    } catch (err) {
      console.warn("[entretiens-store] Supabase get failed, fallback file:", err);
    }
  }
  return getFile(id, tenantId ?? null);
}

async function getSupabase(
  id: string,
  tenantId: string | null,
): Promise<Entretien | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("entretiens")
    .select(SELECT_FULL)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const entretien = rowToEntretien(data as EntretienRow);
  // Isolation tenant : on refuse l'accès à une ligne d'un autre tenant.
  if (tenantId && entretien.tenant_id !== tenantId) return null;
  return entretien;
}

async function getFile(
  id: string,
  tenantId: string | null,
): Promise<Entretien | null> {
  const store = await readFileStore();
  const found = store.entretiens.find((e) => e.id === id) ?? null;
  if (!found) return null;
  if (tenantId && found.tenant_id !== tenantId) return null;
  return found;
}
