import { NextResponse, type NextRequest } from "next/server";

import { KINDS, loadSubmissions, saveSubmission, type DciKind } from "@/lib/dci-store";
import { validateDciCanonical } from "@/lib/dci-schema";

function isDciKind(value: string): value is DciKind {
  return (KINDS as string[]).includes(value);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ kind: string }> },
) {
  const { kind } = await ctx.params;
  if (!isDciKind(kind)) {
    return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }
  const { prospect_slug, payload, display_name } = body as {
    prospect_slug?: string;
    payload?: Record<string, unknown>;
    display_name?: string;
  };
  if (!prospect_slug || typeof prospect_slug !== "string") {
    return NextResponse.json({ error: "prospect_slug is required" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "payload is required" }, { status: 400 });
  }

  if (kind === "complet") {
    const check = validateDciCanonical(payload);
    if (!check.ok) {
      return NextResponse.json({ error: `payload DCI invalide: ${check.error}` }, { status: 400 });
    }
  }

  const result = await saveSubmission({
    prospect_slug,
    kind,
    payload,
    display_name,
    submitted_at: new Date().toISOString(),
    source_ip: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true, kind, ...result });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ kind: string }> },
) {
  const { kind } = await ctx.params;
  if (!isDciKind(kind)) {
    return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 });
  }
  const slug = req.nextUrl.searchParams.get("prospect");
  if (!slug) {
    return NextResponse.json({ error: "prospect query param required" }, { status: 400 });
  }
  const { source, submissions } = await loadSubmissions(slug);
  return NextResponse.json({ source, kind, submission: submissions[kind] });
}
