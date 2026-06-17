import { NextResponse, type NextRequest } from "next/server";

import { terminerEntretien } from "@/lib/entretiens-store";
import { getSessionContext } from "@/lib/auth/context";
import { createAdminClient } from "@/lib/supabase/admin";

const RAPPORT_MAX_BYTES = 256 * 1024; // 256 Ko

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Vérifie l'appartenance de l'entretien au tenant/cabinet courant (cf. [id]/route). */
async function belongsToTenant(
  id: string,
  tenantId: string,
  cabinetId: string,
): Promise<boolean> {
  if (!supabaseConfigured()) return true;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("entretiens")
    .select("tenant_id, cabinet_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  const row = data as { tenant_id: string | null; cabinet_id: string | null };
  return row.tenant_id === tenantId && row.cabinet_id === cabinetId;
}

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
  routeCtx: { params: Promise<{ id: string }> },
) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const { id } = await routeCtx.params;
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
    // Scope tenant : vérifie l'appartenance AVANT de clôturer (pas d'écriture cross-tenant).
    if (!(await belongsToTenant(id, ctx.tenantId, ctx.cabinetId))) {
      return NextResponse.json({ error: "Entretien introuvable" }, { status: 404 });
    }
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
