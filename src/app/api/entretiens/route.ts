import { NextResponse, type NextRequest } from "next/server";

import { listEntretiens, upsertEntretien } from "@/lib/entretiens-store";
import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

const ROOM_MAX = 64;
const DISPLAY_MAX = 120;
const SLUG_MAX = 64;

/**
 * Le store choisit son backend (Supabase ou fichier local) selon ces variables.
 * En fallback fichier, les colonnes tenant_id/cabinet_id n'existent pas : on
 * gate alors par session sans pouvoir filtrer la ligne (mode dev local).
 */
function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function sanitizeRoom(raw: string): string {
  // Casse canonique minuscule (cf. page.tsx) : garantit que entretiens.room
  // matche la salle Jitsi normalisée → mapping enregistrement fiable.
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, ROOM_MAX).toLowerCase();
}

function sanitizeSlug(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, SLUG_MAX);
}

/**
 * Restreint une liste d'entretiens (par id) à ceux appartenant au tenant/cabinet
 * courant. En backend Supabase uniquement ; en fallback fichier (colonnes
 * absentes) on renvoie la liste telle quelle après gating de session.
 */
async function scopeToTenant<T extends { id: string }>(
  items: T[],
  tenantId: string,
  cabinetId: string,
): Promise<T[]> {
  if (!supabaseConfigured() || items.length === 0) return items;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("entretiens")
    .select("id")
    .in("id", items.map((e) => e.id))
    .eq("tenant_id", tenantId)
    .eq("cabinet_id", cabinetId);
  if (error) throw error;
  const allowed = new Set((data ?? []).map((r) => (r as { id: string }).id));
  return items.filter((e) => allowed.has(e.id));
}

/**
 * Estampille la ligne entretien (id) avec tenant/cabinet à la création, OU
 * refuse si elle appartient déjà à un autre cabinet. Renvoie une réponse 404
 * en cas de mismatch (sans fuiter l'existence), null si tout va bien.
 */
async function stampTenantOrRefuse(
  id: string,
  tenantId: string,
  cabinetId: string,
): Promise<NextResponse | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("entretiens")
    .select("tenant_id, cabinet_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
  }

  const row = data as { tenant_id: string | null; cabinet_id: string | null };
  if (row.tenant_id == null && row.cabinet_id == null) {
    const { error: updErr } = await supabase
      .from("entretiens")
      .update({ tenant_id: tenantId, cabinet_id: cabinetId })
      .eq("id", id);
    if (updErr) throw updErr;
    return null;
  }

  if (row.tenant_id !== tenantId || row.cabinet_id !== cabinetId) {
    return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
  }
  return null;
}

/** GET /api/entretiens?prospect=<slug> → liste légère (sans gros blobs). */
export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("prospect");
  if (!slug || !slug.trim()) {
    return NextResponse.json(
      { error: "prospect query param required" },
      { status: 400 },
    );
  }
  try {
    const safeSlug = sanitizeSlug(slug);
    if (!safeSlug) {
      return NextResponse.json({ entretiens: [] });
    }
    const entretiens = await listEntretiens(safeSlug);
    // Scope tenant/cabinet : on ne garde que les entretiens du cabinet courant.
    // Le store n'expose pas tenant_id ; on filtre les ids via le client admin.
    const scoped = await scopeToTenant(entretiens, ctx.tenantId, ctx.cabinetId);
    return NextResponse.json({ entretiens: scoped });
  } catch (err) {
    console.error("[entretiens] GET erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST /api/entretiens → upsert par room (ne réécrase jamais l'existant). */
export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps doit être un objet" }, { status: 400 });
  }
  const { room, prospect_slug, display_name } = body as {
    room?: unknown;
    prospect_slug?: unknown;
    display_name?: unknown;
  };

  if (typeof room !== "string" || !room.trim()) {
    return NextResponse.json({ error: "room requis" }, { status: 400 });
  }
  const safeRoom = sanitizeRoom(room);
  if (!safeRoom) {
    return NextResponse.json({ error: "room invalide" }, { status: 400 });
  }

  if (prospect_slug !== undefined && typeof prospect_slug !== "string") {
    return NextResponse.json(
      { error: "prospect_slug doit être une chaîne" },
      { status: 400 },
    );
  }
  if (display_name !== undefined && typeof display_name !== "string") {
    return NextResponse.json(
      { error: "display_name doit être une chaîne" },
      { status: 400 },
    );
  }

  const safeSlug =
    typeof prospect_slug === "string" && prospect_slug.trim()
      ? sanitizeSlug(prospect_slug) || null
      : null;
  const safeDisplay =
    typeof display_name === "string" && display_name.trim()
      ? display_name.trim().slice(0, DISPLAY_MAX)
      : null;

  try {
    const e = await upsertEntretien({
      room: safeRoom,
      prospect_slug: safeSlug,
      display_name: safeDisplay,
    });

    // Scope tenant : le store n'écrit pas tenant_id/cabinet_id. À la création on
    // estampille la ligne avec le contexte courant ; si la room appartient déjà
    // à un autre cabinet, on refuse (pas d'adoption du tenant de la ligne).
    if (supabaseConfigured()) {
      const refused = await stampTenantOrRefuse(e.id, ctx.tenantId, ctx.cabinetId);
      if (refused) return refused;
    }

    return NextResponse.json({
      id: e.id,
      room: e.room,
      prospect_slug: e.prospect_slug,
      dci_snapshot: e.dci_snapshot,
      transcript: e.transcript,
      conseils: e.conseils,
      articles: e.articles,
      notes: e.notes,
      ended_at: e.ended_at,
    });
  } catch (err) {
    console.error("[entretiens] POST erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
