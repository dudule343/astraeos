import { NextResponse, type NextRequest } from "next/server";

import { listEntretiens, upsertEntretien } from "@/lib/entretiens-store";
import { requireAuth } from "@/lib/auth";

const ROOM_MAX = 64;
const DISPLAY_MAX = 120;
const SLUG_MAX = 64;

function sanitizeRoom(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, ROOM_MAX);
}

function sanitizeSlug(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, SLUG_MAX);
}

/** GET /api/entretiens?prospect=<slug> → liste légère (sans gros blobs). */
export async function GET(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;

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
    return NextResponse.json({ entretiens });
  } catch (err) {
    console.error("[entretiens] GET erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST /api/entretiens → upsert par room (ne réécrase jamais l'existant). */
export async function POST(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;

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
    return NextResponse.json({
      id: e.id,
      room: e.room,
      prospect_slug: e.prospect_slug,
      dci_snapshot: e.dci_snapshot,
      transcript: e.transcript,
      conseils: e.conseils,
      articles: e.articles,
      ended_at: e.ended_at,
    });
  } catch (err) {
    console.error("[entretiens] POST erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
