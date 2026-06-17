import { NextResponse } from "next/server";

import { engineerSlugFromContext, isOAuthConfigured, loadTokens } from "@/lib/google-oauth";
import { getSessionContext } from "@/lib/auth/context";

/** GET /api/calendar/status — statut Google Calendar de l'ingénieur de la session. */
export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const engineer = engineerSlugFromContext(ctx);
  const tokens = await loadTokens(engineer, ctx.tenantId);
  return NextResponse.json({
    oauth_configured: isOAuthConfigured(),
    connected: Boolean(tokens),
    email: tokens?.email ?? null,
    granted_at: tokens?.granted_at ?? null,
    demo: tokens?.access_token === "demo-token-not-real",
    expires_at: tokens?.expires_at ?? null,
    scope: tokens?.scope ?? null,
  });
}
