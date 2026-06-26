"use server";

/**
 * Server actions des signalements « Modifications » (table public.bug_reports).
 * Outil interne de l'espace ingénieur : l'équipe remonte bugs et améliorations
 * de l'application, avec captures d'écran. Toutes les opérations passent par le
 * client service_role (RLS deny-all sur la table) ; aucune écriture publique.
 *
 * Porté depuis l'outil EDILOS, adapté à Astraeos :
 *   - identité du requêteur via getSessionContext() (reporter = nom de
 *     l'ingénieur connecté, à défaut la valeur saisie) ;
 *   - captures uploadées dans le bucket privé « depots » sous
 *     `signalements/<id>/<fichier>`, URLs signées renvoyées dans screenshots[].
 *
 * Best-effort : si la table n'existe pas encore (migration non appliquée),
 * listBugReports renvoie une liste vide et les écritures lèvent une erreur
 * douce plutôt que de planter.
 */

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

const PATH = "/espace-ingenieur/modifications";
const STORAGE_BUCKET = "depots";
// URL signée longue durée : l'outil est interne, on persiste l'URL dans
// screenshots[] et on évite de re-signer à chaque lecture. (~10 ans)
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

export type BugReport = {
  id: string;
  type: "bug" | "amelioration";
  title: string;
  reporter: string | null;
  page_url: string | null;
  problem: string | null;
  expected: string | null;
  intention: string | null;
  annoyance: string | null;
  section: string | null;
  screenshots: string[];
  status: "nouveau" | "en_cours" | "en_revue" | "resolu";
  pr_url: string | null;
  fix_screenshots: string[];
  validated_by: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewBugReport = {
  type: "bug" | "amelioration";
  title: string;
  reporter?: string;
  page_url?: string;
  problem?: string;
  expected?: string;
  intention?: string;
  annoyance?: string;
  section?: string;
  screenshots?: string[];
};

type DbError = { code?: string; message?: string } | null;

/** La table bug_reports est absente (migration non appliquée). */
function isMissingTable(error: DbError): boolean {
  if (!error) return false;
  return error.code === "42P01" || /bug_reports.*does not exist/i.test(error.message || "");
}

/** N'accepte que des URLs http(s) : jamais de javascript:/data: persisté. */
function safeUrl(u?: string | null): string | null {
  if (!u) return null;
  try {
    const p = new URL(u);
    return p.protocol === "https:" || p.protocol === "http:" ? u : null;
  } catch {
    return null;
  }
}

function safeUrls(arr?: string[]): string[] {
  return (arr ?? []).map(safeUrl).filter((x): x is string => !!x);
}

/** Nom de l'ingénieur connecté, à défaut null (mode legacy / pas de session). */
async function currentReporterName(): Promise<string | null> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return null;
    const admin = createAdminClient();
    const { data } = await admin
      .from("users")
      .select("first_name, last_name")
      .eq("id", ctx.userId)
      .maybeSingle();
    const u = data as { first_name?: string | null; last_name?: string | null } | null;
    if (!u) return null;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
    return name || null;
  } catch {
    return null;
  }
}

function sanitizeFileName(name: string): string {
  const cleaned = (name || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "capture";
}

/**
 * Upload des captures d'écran d'un signalement dans le bucket privé « depots »,
 * sous `signalements/<id>/<fichier>`. `id` est optionnel : à la création le
 * formulaire n'a pas encore d'id, on retombe alors sur un dossier brouillon.
 * Renvoie les URLs signées (persistables dans screenshots[]).
 */
export async function uploadBugReportScreenshots(
  formData: FormData,
): Promise<{ ok: boolean; urls: string[]; error?: string }> {
  try {
    const rawId = String(formData.get("id") ?? "").trim();
    const folder = rawId || `brouillon-${crypto.randomUUID()}`;
    const files = formData
      .getAll("files")
      .filter((f): f is File => f instanceof File && f.size > 0 && (f.type || "").startsWith("image/"));

    if (files.length === 0) {
      return { ok: false, urls: [], error: "Aucune capture à envoyer." };
    }

    const admin = createAdminClient();
    const urls: string[] = [];

    for (const file of files) {
      const safeName = sanitizeFileName(file.name);
      const path = `signalements/${folder}/${Date.now()}-${safeName}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mime = file.type || "image/jpeg";

      const { error: uploadErr } = await admin.storage
        .from(STORAGE_BUCKET)
        .upload(path, bytes, { contentType: mime, upsert: false });
      if (uploadErr) {
        return { ok: false, urls, error: `Échec de l'envoi de « ${file.name} ».` };
      }

      const { data: signed } = await admin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL);
      if (signed?.signedUrl) urls.push(signed.signedUrl);
    }

    return { ok: true, urls };
  } catch {
    return { ok: false, urls: [], error: "Une erreur est survenue pendant l'envoi des captures." };
  }
}

export async function listBugReports(): Promise<BugReport[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bug_reports")
    .select("*")
    .order("created_at", { ascending: false });
  // Migration non appliquée : on ne plante pas, l'écran reste vide.
  if (error && isMissingTable(error)) return [];
  if (error) throw new Error(error.message);
  return (data ?? []) as BugReport[];
}

export async function createBugReport(input: NewBugReport): Promise<BugReport> {
  const title = (input.title ?? "").trim();
  if (!title) throw new Error("Le titre est obligatoire.");

  const reporter = input.reporter?.trim() || (await currentReporterName());

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bug_reports")
    .insert({
      type: input.type === "amelioration" ? "amelioration" : "bug",
      title,
      reporter: reporter || null,
      page_url: input.page_url?.trim() || null,
      problem: input.problem?.trim() || null,
      expected: input.expected?.trim() || null,
      intention: input.intention?.trim() || null,
      annoyance: input.annoyance?.trim() || null,
      section: input.section?.trim() || null,
      screenshots: safeUrls(input.screenshots),
    })
    .select("*")
    .single();
  if (error && isMissingTable(error)) {
    throw new Error("Signalements indisponibles : migration bug_reports non appliquée.");
  }
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
  return data as BugReport;
}

export async function updateBugReport(id: string, input: NewBugReport): Promise<BugReport> {
  const title = (input.title ?? "").trim();
  if (!title) throw new Error("Le titre est obligatoire.");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bug_reports")
    .update({
      type: input.type === "amelioration" ? "amelioration" : "bug",
      title,
      reporter: input.reporter?.trim() || null,
      page_url: input.page_url?.trim() || null,
      problem: input.problem?.trim() || null,
      expected: input.expected?.trim() || null,
      intention: input.intention?.trim() || null,
      annoyance: input.annoyance?.trim() || null,
      section: input.section?.trim() || null,
      screenshots: safeUrls(input.screenshots),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error && isMissingTable(error)) {
    throw new Error("Signalements indisponibles : migration bug_reports non appliquée.");
  }
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
  return data as BugReport;
}

export async function updateBugReportStatus(
  id: string,
  status: BugReport["status"],
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("bug_reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error && isMissingTable(error)) return;
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

/**
 * Attache la PR qui corrige le signalement, le passe en « à valider » (en_revue)
 * et enregistre les captures « après ».
 */
export async function setBugReportFix(
  id: string,
  prUrl: string,
  screenshots: string[] = [],
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("bug_reports")
    .update({
      pr_url: safeUrl(prUrl?.trim() || null),
      fix_screenshots: safeUrls(screenshots),
      status: "en_revue",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error && isMissingTable(error)) return;
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

/** Validation humaine : marque résolu en gardant la trace (qui + quand). */
export async function validateBugReport(id: string, by?: string): Promise<void> {
  const validatedBy = by?.trim() || (await currentReporterName());
  const admin = createAdminClient();
  const { error } = await admin
    .from("bug_reports")
    .update({
      status: "resolu",
      validated_by: validatedBy || null,
      validated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error && isMissingTable(error)) return;
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function deleteBugReport(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("bug_reports").delete().eq("id", id);
  if (error && isMissingTable(error)) return;
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

/** Alias attendu par le dropzone de l'UI (mêmes captures que le formulaire). */
export async function uploadBugScreenshot(
  formData: FormData,
): Promise<{ ok: boolean; urls?: string[]; error?: string }> {
  const r = await uploadBugReportScreenshots(formData);
  return { ok: r.ok, urls: r.urls, error: r.error };
}

// ===========================================================================
// Pièces jointes (Excel/PPT/Word/PDF/…) — index JSON dans Storage, pas de table.
// Porté d'EDILOS (bug-attachments-actions). Bucket privé « depots » → URLs signées.
// ===========================================================================

export type BugAttachment = { url: string; name: string };
type AttachmentsMap = Record<string, BugAttachment[]>;

const ATTACH_INDEX = "config/bug-attachments.json";
const ATTACH_MAX = 25 * 1024 * 1024; // 25 Mo
const ATTACH_EXT: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pdf: "application/pdf",
  csv: "text/csv",
  txt: "text/plain",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
};

/** Empêche le path traversal dans la clé Storage. */
function assertValidReportId(reportId: string): void {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(reportId)) throw new Error("reportId invalide");
}

async function readAttachMap(): Promise<AttachmentsMap> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(STORAGE_BUCKET).download(ATTACH_INDEX);
    if (error || !data) return {};
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? (obj as AttachmentsMap) : {};
  } catch {
    return {};
  }
}

async function writeAttachMap(map: AttachmentsMap): Promise<void> {
  const admin = createAdminClient();
  const body = new Blob([JSON.stringify(map)], { type: "application/json" });
  const { error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(ATTACH_INDEX, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(`bug-attachments index: ${error.message}`);
}

export async function getBugAttachmentsMap(): Promise<AttachmentsMap> {
  return readAttachMap();
}

export async function uploadBugAttachment(
  reportId: string,
  formData: FormData,
): Promise<BugAttachment[]> {
  if (!reportId) throw new Error("reportId requis");
  assertValidReportId(reportId);
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Aucun fichier");
  if (file.size > ATTACH_MAX) throw new Error(`"${file.name}" dépasse 25 Mo.`);

  const dot = file.name.lastIndexOf(".");
  const ext = (dot > 0 ? file.name.slice(dot + 1) : "").toLowerCase();
  const contentType = ATTACH_EXT[ext];
  if (!contentType) {
    throw new Error("Type de fichier non autorisé (Excel, PPT, Word, PDF, CSV, TXT, images).");
  }

  const admin = createAdminClient();
  const token = (globalThis.crypto?.randomUUID?.() || `${reportId}-${file.size}`).slice(0, 8);
  const path = `bug-attachments/${reportId}/${token}-${sanitizeFileName(file.name)}`;
  const buf = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(path, buf, { contentType, upsert: false });
  if (error) throw new Error(`Upload échoué : ${error.message}`);

  const { data: signed } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);

  const map = await readAttachMap();
  const list = map[reportId] || [];
  if (signed?.signedUrl) list.push({ url: signed.signedUrl, name: file.name });
  map[reportId] = list;
  await writeAttachMap(map);
  revalidatePath(PATH);
  return list;
}

export async function removeBugAttachment(
  reportId: string,
  url: string,
): Promise<BugAttachment[]> {
  assertValidReportId(reportId);
  const map = await readAttachMap();
  const list = (map[reportId] || []).filter((a) => a.url !== url);
  map[reportId] = list;
  await writeAttachMap(map);
  revalidatePath(PATH);
  return list;
}

// ===========================================================================
// Fil de discussion / feedback d'un signalement — table public.bug_comments,
// avec repli JSON (Storage) tant que la migration n'est pas appliquée.
// Porté d'EDILOS (bug-thread-actions).
// ===========================================================================

export type ThreadKind = "feedback" | "precision_q" | "precision_a" | "note";
export type ThreadMessage = {
  id: string;
  reportId: string;
  kind: ThreadKind;
  author: string;
  body: string;
  fields?: { probleme?: string; attendu?: string; ou?: string };
  screenshots?: string[];
  created_at: string;
};
type ThreadsMap = Record<string, ThreadMessage[]>;

const THREAD_TABLE = "bug_comments";
const THREAD_INDEX = "config/bug-threads.json";

type ThreadRow = {
  id: string;
  report_id: string;
  kind: string;
  author: string;
  body: string;
  fields: ThreadMessage["fields"] | null;
  screenshots: string[] | null;
  created_at: string;
};

function rowToMsg(r: ThreadRow): ThreadMessage {
  return {
    id: r.id,
    reportId: r.report_id,
    kind: (r.kind as ThreadKind) || "note",
    author: r.author || "Interne",
    body: r.body || "",
    fields: r.fields ?? undefined,
    screenshots: Array.isArray(r.screenshots) && r.screenshots.length ? r.screenshots : undefined,
    created_at: r.created_at,
  };
}

function ridMsg(): string {
  return `m_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function isMissingThreadTable(error: DbError): boolean {
  if (!error) return false;
  const code = error.code || "";
  const msg = (error.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST202" ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

async function readThreadMapJson(): Promise<ThreadsMap> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(STORAGE_BUCKET).download(THREAD_INDEX);
    if (error || !data) return {};
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? (obj as ThreadsMap) : {};
  } catch {
    return {};
  }
}

async function appendThreadJson(reportId: string, msg: ThreadMessage): Promise<ThreadMessage[]> {
  const admin = createAdminClient();
  const map = await readThreadMapJson();
  const list = Array.isArray(map[reportId]) ? map[reportId] : [];
  list.push(msg);
  map[reportId] = list;
  const body = new Blob([JSON.stringify(map)], { type: "application/json" });
  const { error } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(THREAD_INDEX, body, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(`bug-threads index: ${error.message}`);
  revalidatePath(PATH);
  return list;
}

export async function getBugThreadsMap(): Promise<ThreadsMap> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from(THREAD_TABLE)
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    if (isMissingThreadTable(error)) return readThreadMapJson();
    return {};
  }
  const map: ThreadsMap = {};
  for (const r of (data as ThreadRow[]) ?? []) {
    (map[r.report_id] ??= []).push(rowToMsg(r));
  }
  return map;
}

async function insertThread(reportId: string, msg: ThreadMessage): Promise<ThreadMessage[]> {
  const admin = createAdminClient();
  const { error } = await admin.from(THREAD_TABLE).insert({
    id: msg.id,
    report_id: reportId,
    kind: msg.kind,
    author: msg.author,
    body: msg.body,
    fields: msg.fields ?? null,
    screenshots: msg.screenshots ?? null,
    created_at: msg.created_at,
  });
  if (error) {
    if (isMissingThreadTable(error)) return appendThreadJson(reportId, msg);
    throw new Error(`bug_comments insert: ${error.message}`);
  }
  const { data } = await admin
    .from(THREAD_TABLE)
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });
  revalidatePath(PATH);
  return ((data as ThreadRow[]) ?? []).map(rowToMsg);
}

export async function addBugFeedback(
  reportId: string,
  input: { author?: string; probleme: string; attendu?: string; ou?: string; screenshots?: string[] },
): Promise<ThreadMessage[]> {
  assertValidReportId(reportId);
  const probleme = (input.probleme || "").trim();
  if (!probleme) throw new Error("Décris au moins ce qui ne va pas.");
  const fields = { probleme, attendu: (input.attendu || "").trim(), ou: (input.ou || "").trim() };
  const body = [
    `❌ Ce qui ne va pas : ${fields.probleme}`,
    fields.attendu ? `✅ Résultat attendu : ${fields.attendu}` : "",
    fields.ou ? `📍 Où : ${fields.ou}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const msg: ThreadMessage = {
    id: ridMsg(),
    reportId,
    kind: "feedback",
    author: (input.author || "").trim() || "Auteur",
    body,
    fields,
    screenshots: safeUrls(input.screenshots),
    created_at: new Date().toISOString(),
  };
  const list = await insertThread(reportId, msg);
  // Le signalement n'est pas réglé → retour « en cours » pour reprise.
  await updateBugReportStatus(reportId, "en_cours");
  return list;
}

export async function addBugThreadMessage(
  reportId: string,
  input: { author?: string; body: string; kind?: ThreadKind },
): Promise<ThreadMessage[]> {
  assertValidReportId(reportId);
  const text = (input.body || "").trim();
  if (!text) throw new Error("Message vide.");
  const msg: ThreadMessage = {
    id: ridMsg(),
    reportId,
    kind: input.kind || "note",
    author: (input.author || "").trim() || "Interne",
    body: text,
    created_at: new Date().toISOString(),
  };
  return insertThread(reportId, msg);
}
