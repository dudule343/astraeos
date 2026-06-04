import { NextResponse, type NextRequest } from "next/server";

import { deleteTokens, loadTokens } from "@/lib/google-oauth";
import { requireAuth } from "@/lib/auth";

/** POST /api/calendar/disconnect?engineer=luc-thilliez */
export async function POST(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const engineer = req.nextUrl.searchParams.get("engineer") || "luc-thilliez";
  try {
    // Révocation best-effort du grant OAuth côté Google avant de purger le store local.
    const tokens = await loadTokens(engineer);
    const tokenToRevoke = tokens?.refresh_token || tokens?.access_token;
    if (tokenToRevoke && tokenToRevoke !== "demo-refresh" && tokenToRevoke !== "demo-token-not-real") {
      try {
        await fetch("https://oauth2.googleapis.com/revoke", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ token: tokenToRevoke }),
        });
      } catch (err) {
        console.warn("[calendar/disconnect] revoke Google échoué:", err);
      }
    }

    await deleteTokens(engineer);
    return NextResponse.json({ ok: true, engineer });
  } catch (err) {
    console.error("[calendar/disconnect] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
