import { NextResponse, type NextRequest } from "next/server";

import { getEntretien, mergeEntretien, type MergeInput } from "@/lib/entretiens-store";
import { getSessionContext } from "@/lib/auth/context";

/**
 * POST /api/entretiens/[id]/transcript-flush
 *
 * Cible de `navigator.sendBeacon` au moment où l'onglet se ferme (pagehide /
 * visibilitychange). sendBeacon n'émet QUE des POST (pas de PATCH) et survit à
 * l'unload là où un `fetch` est tué — d'où cette route dédiée, miroir POST du
 * merge append de la route PATCH. Même append atomique (RPC) côté store.
 *
 * Auth : le cookie de session part avec le beacon → getSessionContext résout
 * le tenant ; getEntretien(id, tenantId) borne au tenant (404 sinon).
 */

const MAX_ITEMS = 600;

function asArray(v: unknown): Record<string, unknown>[] | undefined {
  if (!Array.isArray(v) || v.length === 0) return undefined;
  return v.filter((x) => x && typeof x === "object").slice(-MAX_ITEMS) as Record<
    string,
    unknown
  >[];
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSessionContext();
  // Pas de session (flag auth off → contexte legacy) : on accepte quand même le
  // flush si un contexte existe ; sinon on ne fait rien (200 pour ne pas faire
  // ramer l'unload côté navigateur).
  if (!session) return NextResponse.json({ ok: false }, { status: 200 });

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ ok: false }, { status: 200 });

  // Borne tenant : un entretien d'un autre tenant → null → on n'écrit rien.
  const entretien = await getEntretien(id, session.tenantId);
  if (!entretien) return NextResponse.json({ ok: false }, { status: 200 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const merge: MergeInput = {};
  const t = asArray(body.transcript_append);
  const c = asArray(body.conseils_append);
  const a = asArray(body.articles_append);
  const n = asArray(body.notes_append);
  if (t) merge.transcript_append = t as MergeInput["transcript_append"];
  if (c) merge.conseils_append = c;
  if (a) merge.articles_append = a;
  if (n) merge.notes_append = n as MergeInput["notes_append"];

  if (!t && !c && !a && !n) return NextResponse.json({ ok: true });

  const ok = await mergeEntretien(id, merge).catch(() => false);
  return NextResponse.json({ ok });
}
