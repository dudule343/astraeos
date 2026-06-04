import { NextResponse, type NextRequest } from "next/server";

import { terminerEntretien } from "@/lib/entretiens-store";
import { requireAuth } from "@/lib/auth";

const RAPPORT_MAX_BYTES = 256 * 1024; // 256 Ko

function byteSize(value: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf-8");
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

/** POST /api/entretiens/[id]/terminer → ended_at serveur + rapport. */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
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

  const { rapport } = body as { rapport?: unknown };
  if (!rapport || typeof rapport !== "object" || Array.isArray(rapport)) {
    return NextResponse.json({ error: "rapport doit être un objet" }, { status: 400 });
  }
  if (byteSize(rapport) > RAPPORT_MAX_BYTES) {
    return NextResponse.json(
      { error: "rapport trop volumineux (max 256 Ko)" },
      { status: 400 },
    );
  }

  try {
    const ok = await terminerEntretien(id, rapport as Record<string, unknown>);
    if (!ok) {
      return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[entretiens/:id/terminer] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
