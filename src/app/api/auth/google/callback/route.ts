import { NextResponse, type NextRequest } from "next/server";

import {
  engineerSlugFromContext,
  exchangeCodeForTokens,
  fetchUserEmail,
  saveTokens,
  verifyState,
} from "@/lib/google-oauth";
import { getSessionContext } from "@/lib/auth/context";

/**
 * GET /api/auth/google/callback?code=...&state=...
 *
 * Récupère le code, l'échange contre des tokens, fetch l'email Google,
 * persiste pour l'engineer_slug, puis retourne une page HTML qui :
 *   - signale window.opener (postMessage) que la connexion est OK
 *   - se ferme automatiquement après 800ms
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state");

  if (!code || !stateParam) {
    return htmlResponse(`<h1>Erreur</h1><p>Paramètres manquants.</p>`, 400);
  }
  // State auto-signé (HMAC + TTL 10 min) : vérifiable sans cookie, donc valide
  // même si le flow a démarré depuis un autre domaine (URL de déploiement).
  const verified = verifyState(stateParam);
  if (!verified) {
    return htmlResponse(`<h1>Erreur</h1><p>State invalide ou expiré — relancez la connexion.</p>`, 400);
  }

  // Le tenant/cabinet propriétaires des tokens sont ceux de la SESSION qui finalise
  // le flow, jamais déduits du state seul. Et le slug du state doit correspondre à
  // l'utilisateur courant : on n'autorise pas A à finaliser un flow démarré pour B.
  const ctx = await getSessionContext();
  if (!ctx) {
    return htmlResponse(`<h1>Erreur</h1><p>Session expirée — reconnectez-vous puis relancez la connexion Google.</p>`, 401);
  }
  const engineer = engineerSlugFromContext(ctx);
  if (verified.engineer !== engineer) {
    return htmlResponse(`<h1>Erreur</h1><p>Ce flux de connexion ne correspond pas à votre session — relancez la connexion.</p>`, 403);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const email = await fetchUserEmail(tokens.access_token);
    await saveTokens({
      engineer_slug: engineer,
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? "",
      expires_at: Date.now() + tokens.expires_in * 1000,
      scope: tokens.scope,
      granted_at: new Date().toISOString(),
      tenant_id: ctx.tenantId,
      cabinet_id: ctx.cabinetId,
    });
    return htmlResponse(successHtml(email, engineer), 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return htmlResponse(`<h1>Erreur OAuth</h1><pre>${escapeHtml(msg)}</pre>`, 500);
  }
}

function htmlResponse(body: string, status: number) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Astraeos · Google Calendar</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#FAF8F3;color:#102D50;margin:0;padding:40px;text-align:center}
h1{font-family:Georgia,serif;color:#102D50}.box{max-width:520px;margin:60px auto;background:white;border:1px solid #E8E3D6;border-radius:14px;padding:40px 32px;box-shadow:0 8px 32px rgba(16,45,80,0.06)}
.email{font-weight:700;color:#C68E0E}.note{color:#708196;font-size:13px;margin-top:18px}
.spinner{border:3px solid #E8E3D6;border-top-color:#C68E0E;border-radius:50%;width:28px;height:28px;margin:0 auto 18px;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div class="box">${body}</div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function successHtml(email: string, engineer: string): string {
  const payload = JSON.stringify({ ok: true, email, engineer });
  return `
    <div class="spinner"></div>
    <h1>Google Calendar connecté</h1>
    <p>Compte autorisé : <span class="email">${escapeHtml(email)}</span></p>
    <p class="note">Cette fenêtre va se fermer automatiquement.</p>
    <script>
      try {
        if (window.opener) {
          window.opener.postMessage(${payload}, window.location.origin);
        }
      } catch (e) {}
      setTimeout(function () { window.close(); }, 800);
    </script>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
