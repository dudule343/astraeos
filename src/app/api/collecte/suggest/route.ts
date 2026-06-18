import { NextResponse, type NextRequest } from "next/server";

import { deriveFacts, selectDocuments } from "@/lib/collecte-engine";
import { loadSubmissions } from "@/lib/dci-store";
import type { DciCanonical } from "@/lib/dci-schema";
import type { CatalogEntry, Facts } from "@/lib/collecte-catalog/types";
import { getCustomTemplateItems } from "@/lib/collecte-template";
import { requireAuth } from "@/lib/auth";
import { getSessionContext } from "@/lib/auth/context";

export async function GET(req: NextRequest) {
  // Endpoint STAFF : facts/documents dérivés du DCI, jamais public.
  const denied = await requireAuth(req);
  if (denied) return denied;

  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("prospect");
  if (!slug) {
    return NextResponse.json({ error: "prospect query param required" }, { status: 400 });
  }

  // Les deux lectures sont indépendantes (DCI client vs pièces custom du tenant)
  // → en parallèle pour ne pas sérialiser deux allers-retours sur ce chemin.
  const [{ submissions }, customItems] = await Promise.all([
    loadSubmissions(slug, ctx.tenantId),
    getCustomTemplateItems(ctx.tenantId),
  ]);
  const complet = submissions.complet;

  // Garde-fou : pas de DCI complet => facts vides. selectDocuments renvoie alors
  // les pièces toujours requises (conditions "always" du catalogue).
  const facts: Facts = complet
    ? deriveFacts(complet.payload as unknown as DciCanonical)
    : {};
  const documents = selectDocuments(facts);

  // Pièces ajoutées par l'admin (référentiel documentaire) : toujours incluses,
  // elles ÉTENDENT le template de collecte du tenant.
  const customDocs: CatalogEntry[] = customItems.map((c) => ({
    id: `custom-${c.id}`,
    category: c.category,
    sub: c.sub ?? undefined,
    label: c.label,
    type: c.type,
    always: true,
  }));

  return NextResponse.json({ facts, documents: [...documents, ...customDocs] });
}
