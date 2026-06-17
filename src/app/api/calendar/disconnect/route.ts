import { NextResponse } from "next/server";

import { deleteTokens, engineerSlugFromContext, loadTokens } from "@/lib/google-oauth";
import { getSessionContext } from "@/lib/auth/context";

/** POST /api/calendar/disconnect — déconnecte Google de l'ingénieur de la session. */
export async function POST() {
  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const engineer = engineerSlugFromContext(ctx);
  try {
    // Révocation best-effort du grant OAuth côté Google avant de purger le store local.
    const tokens = await loadTokens(engineer, ctx.tenantId);
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

    await deleteTokens(engineer, ctx.tenantId);
    return NextResponse.json({ ok: true, engineer });
  } catch (err) {
    console.error("[calendar/disconnect] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
