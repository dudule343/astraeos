import { NextResponse, type NextRequest } from "next/server";

import { KINDS, loadSubmissions, type DciKind, type Submission } from "@/lib/dci-store";
import { getSessionContext } from "@/lib/auth/context";

export async function GET(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("prospect");
  if (!slug) {
    return NextResponse.json({ error: "prospect query param required" }, { status: 400 });
  }
  try {
    const { source, submissions } = await loadSubmissions(slug, ctx.tenantId);

    // Scoping tenant : ne renvoyer que les soumissions du tenant courant.
    // Une soumission au tenant null (prospect public non encore rattaché)
    // n'est pas exposée ici — la résolution se fait côté inbox scopé.
    const scoped = Object.fromEntries(
      KINDS.map((k) => [k, null]),
    ) as Record<DciKind, Submission | null>;
    for (const k of KINDS) {
      const sub = submissions[k];
      if (sub && sub.tenant_id === ctx.tenantId) scoped[k] = sub;
    }

    return NextResponse.json({ source, prospect: slug, submissions: scoped });
  } catch (err) {
    console.error("[dci] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
