import { NextResponse } from "next/server";

import { KINDS, loadAllSubmissions, type DciKind } from "@/lib/dci-store";
import { getSessionContext } from "@/lib/auth/context";

type ProspectEntry = {
  prospect_slug: string;
  display_name: string | null;
  kinds: Record<DciKind, boolean>;
  last_at: string | null;
};

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }
  try {
    const { source, submissions } = await loadAllSubmissions(ctx.tenantId);

    const byProspect = new Map<string, ProspectEntry>();
    for (const s of submissions) {
      let entry = byProspect.get(s.prospect_slug);
      if (!entry) {
        entry = {
          prospect_slug: s.prospect_slug,
          display_name: s.display_name ?? null,
          kinds: Object.fromEntries(KINDS.map((k) => [k, false])) as Record<DciKind, boolean>,
          last_at: null,
        };
        byProspect.set(s.prospect_slug, entry);
      }
      entry.kinds[s.kind] = true;
      if (s.display_name && !entry.display_name) entry.display_name = s.display_name;
      if (!entry.last_at || s.submitted_at > entry.last_at) entry.last_at = s.submitted_at;
    }

    const prospects = Array.from(byProspect.values()).sort((a, b) =>
      (b.last_at ?? "").localeCompare(a.last_at ?? ""),
    );

    return NextResponse.json({ source, prospects });
  } catch (err) {
    console.error("[dci/inbox] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
