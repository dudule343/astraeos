import { NextResponse, type NextRequest } from "next/server";

import { isOAuthConfigured, loadTokens } from "@/lib/google-oauth";
import { requireAuth } from "@/lib/auth";

/** GET /api/calendar/status?engineer=luc-thilliez */
export async function GET(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const engineer = req.nextUrl.searchParams.get("engineer") || "luc-thilliez";
  const tokens = await loadTokens(engineer);
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
