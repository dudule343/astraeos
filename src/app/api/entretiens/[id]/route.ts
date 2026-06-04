import { NextResponse, type NextRequest } from "next/server";

import {
  getEntretien,
  mergeEntretien,
  type MergeInput,
  type TranscriptLine,
} from "@/lib/entretiens-store";

const SNAPSHOT_MAX_BYTES = 256 * 1024; // 256 Ko
const APPEND_MAX = 500; // garde-fou par appel PATCH (le cap historique vit dans le store)
const LINE_TEXT_MAX = 4000;
const WHO_MAX = 120;

function byteSize(value: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf-8");
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function normaliseTranscriptAppend(value: unknown): TranscriptLine[] | { error: string } {
  if (!Array.isArray(value)) return { error: "transcript_append doit être un tableau" };
  const out: TranscriptLine[] = [];
  for (const raw of value.slice(0, APPEND_MAX)) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const text = typeof obj.text === "string" ? obj.text : "";
    if (!text.trim()) continue;
    const line: TranscriptLine = {
      t: typeof obj.t === "string" && obj.t ? obj.t : new Date().toISOString(),
      text: text.slice(0, LINE_TEXT_MAX),
    };
    if (typeof obj.who === "string" && obj.who.trim()) {
      line.who = obj.who.slice(0, WHO_MAX);
    }
    out.push(line);
  }
  return out;
}

function normaliseRecordAppend(
  value: unknown,
  field: string,
): Record<string, unknown>[] | { error: string } {
  if (!Array.isArray(value)) return { error: `${field} doit être un tableau` };
  return value
    .slice(0, APPEND_MAX)
    .filter(
      (x): x is Record<string, unknown> => Boolean(x) && typeof x === "object",
    );
}

/** GET /api/entretiens/[id] → l'entretien complet. */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  try {
    const entretien = await getEntretien(id);
    if (!entretien) {
      return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
    }
    return NextResponse.json({ entretien });
  } catch (err) {
    console.error("[entretiens/:id] GET erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH /api/entretiens/[id] → merge partiel (append borné sur les arrays). */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
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

  const { dci_snapshot, transcript_append, conseils_append, articles_append } =
    body as {
      dci_snapshot?: unknown;
      transcript_append?: unknown;
      conseils_append?: unknown;
      articles_append?: unknown;
    };

  const merge: MergeInput = {};

  if (dci_snapshot !== undefined) {
    if (!dci_snapshot || typeof dci_snapshot !== "object" || Array.isArray(dci_snapshot)) {
      return NextResponse.json(
        { error: "dci_snapshot doit être un objet" },
        { status: 400 },
      );
    }
    if (byteSize(dci_snapshot) > SNAPSHOT_MAX_BYTES) {
      return NextResponse.json(
        { error: "dci_snapshot trop volumineux (max 256 Ko)" },
        { status: 400 },
      );
    }
    merge.dci_snapshot = dci_snapshot as Record<string, unknown>;
  }

  if (transcript_append !== undefined) {
    const res = normaliseTranscriptAppend(transcript_append);
    if ("error" in res) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    merge.transcript_append = res;
  }

  if (conseils_append !== undefined) {
    const res = normaliseRecordAppend(conseils_append, "conseils_append");
    if ("error" in res) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    merge.conseils_append = res;
  }

  if (articles_append !== undefined) {
    const res = normaliseRecordAppend(articles_append, "articles_append");
    if ("error" in res) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    merge.articles_append = res;
  }

  try {
    const ok = await mergeEntretien(id, merge);
    if (!ok) {
      return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[entretiens/:id] PATCH erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
