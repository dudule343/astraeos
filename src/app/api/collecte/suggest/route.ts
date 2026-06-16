import { NextResponse, type NextRequest } from "next/server";

import { deriveFacts, selectDocuments } from "@/lib/collecte-engine";
import { loadSubmissions } from "@/lib/dci-store";
import type { DciCanonical } from "@/lib/dci-schema";
import type { Facts } from "@/lib/collecte-catalog/types";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("prospect");
  if (!slug) {
    return NextResponse.json({ error: "prospect query param required" }, { status: 400 });
  }

  const { submissions } = await loadSubmissions(slug);
  const complet = submissions.complet;

  // Garde-fou : pas de DCI complet => facts vides. selectDocuments renvoie alors
  // les pièces toujours requises (conditions "always" du catalogue).
  const facts: Facts = complet
    ? deriveFacts(complet.payload as unknown as DciCanonical)
    : {};
  const documents = selectDocuments(facts);

  return NextResponse.json({ facts, documents });
}
