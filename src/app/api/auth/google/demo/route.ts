import { NextResponse, type NextRequest } from "next/server";

import { getSessionContext } from "@/lib/auth/context";
import { saveTokens, loadTokens, isOAuthConfigured } from "@/lib/google-oauth";

/**
 * GET /api/auth/google/demo?engineer=luc-thilliez
 *
 * Fallback DÉMO quand GOOGLE_CLIENT_ID n'est pas configuré.
 * Affiche une page qui ressemble à la mire OAuth Google avec :
 *  - un champ email
 *  - un bouton "Continuer"
 * Au submit, on persiste un token bidon mais on enregistre l'engineer
 * comme "connecté" pour que le bouton du wireframe passe en mode connecté.
 *
 * À retirer ou désactiver dès que les vraies credentials Google sont en place.
 */
export async function GET(req: NextRequest) {
  if (!(await getSessionContext())) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }
  const engineer = req.nextUrl.searchParams.get("engineer") || "luc-thilliez";
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Se connecter avec Google · Astraeos (démo)</title>
<style>
* { box-sizing: border-box; }
body { font-family: 'Roboto', -apple-system, system-ui, sans-serif; background: #f8f9fa; color: #202124; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.card { max-width: 448px; width: 100%; background: white; border: 1px solid #dadce0; border-radius: 8px; padding: 40px 44px; }
.brand { text-align: center; margin-bottom: 16px; }
.brand-text { font-size: 22px; color: #5f6368; letter-spacing: 0.05em; }
h1 { font-size: 24px; font-weight: 400; color: #202124; text-align: center; margin: 14px 0 8px; }
.sub { text-align: center; font-size: 16px; color: #5f6368; margin-bottom: 32px; }
.warn { background: #fef7e0; border: 1px solid #f9d77e; border-radius: 6px; padding: 10px 14px; font-size: 12.5px; color: #5f6368; margin-bottom: 24px; line-height: 1.5; }
.warn strong { color: #b06000; }
label { display: block; font-size: 12px; color: #5f6368; margin-bottom: 6px; }
input { width: 100%; padding: 13px 15px; font-size: 16px; border: 1px solid #dadce0; border-radius: 4px; font-family: inherit; transition: border-color 0.15s; }
input:focus { outline: none; border-color: #1a73e8; box-shadow: inset 0 0 0 1px #1a73e8; }
.scopes { background: #f1f3f4; border-radius: 6px; padding: 14px 16px; margin: 22px 0; font-size: 13px; color: #3c4043; line-height: 1.55; }
.scopes-title { font-weight: 600; margin-bottom: 6px; }
.scopes ul { margin: 0; padding-left: 18px; }
.actions { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
.cancel { background: none; border: none; color: #1a73e8; font-size: 14px; font-weight: 500; cursor: pointer; padding: 10px 16px; border-radius: 4px; font-family: inherit; }
.cancel:hover { background: #f1f3f4; }
.btn-primary { background: #1a73e8; color: white; border: none; padding: 10px 24px; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit; }
.btn-primary:hover { background: #1765cc; }
</style></head><body>
<form class="card" method="POST" action="/api/auth/google/demo?engineer=${encodeURIComponent(engineer)}">
  <div class="brand"><span class="brand-text">G o o g l e</span></div>
  <h1>Se connecter à Astraeos</h1>
  <div class="sub">avec votre compte Google</div>

  <div class="warn">
    <strong>⚠ Mode démo —</strong> les credentials OAuth Google ne sont pas encore configurés sur ce projet Astraeos. Cette mire imite Google pour que le flow soit présentable. Aucun token réel n'est obtenu. Pour activer le vrai OAuth, configurer <code>GOOGLE_CLIENT_ID</code> côté serveur.
  </div>

  <label for="email">Adresse e-mail</label>
  <input type="email" id="email" name="email" required placeholder="luc.thilliez@example.com" autofocus>

  <div class="scopes">
    <div class="scopes-title">Astraeos demandera l'autorisation de :</div>
    <ul>
      <li>Consulter votre Google Calendar</li>
      <li>Créer et modifier des événements en votre nom</li>
      <li>Connaître votre adresse e-mail</li>
    </ul>
  </div>

  <div class="actions">
    <button type="button" class="cancel" onclick="window.close()">Annuler</button>
    <button type="submit" class="btn-primary">Autoriser</button>
  </div>
</form>
</body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(req: NextRequest) {
  if (!(await getSessionContext())) {
    return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
  }

  const engineer = req.nextUrl.searchParams.get("engineer") || "luc-thilliez";

  // Garde 1 : le fallback démo n'a de sens QUE si le vrai OAuth n'est pas configuré.
  // Si GOOGLE_CLIENT_ID est en place, on refuse — sinon on dégraderait une vraie
  // connexion vers un token bidon.
  if (isOAuthConfigured()) {
    return NextResponse.json(
      { error: "OAuth Google configuré : utilisez le vrai flow, pas le fallback démo." },
      { status: 403 },
    );
  }

  // Garde 2 : ne JAMAIS écraser un token réel déjà persisté pour cet ingénieur.
  // On n'autorise l'écriture démo que s'il n'existe rien, ou un précédent token démo.
  const existing = await loadTokens(engineer);
  if (existing && existing.access_token !== "demo-token-not-real") {
    return NextResponse.json(
      { error: "Un compte Google réel est déjà connecté pour cet ingénieur." },
      { status: 409 },
    );
  }

  const formData = await req.formData();
  const email = String(formData.get("email") || "").trim() || `${engineer}@example.com`;

  await saveTokens({
    engineer_slug: engineer,
    email,
    access_token: "demo-token-not-real",
    refresh_token: "demo-refresh",
    expires_at: Date.now() + 3600_000,
    scope: "https://www.googleapis.com/auth/calendar.events",
    granted_at: new Date().toISOString(),
  });

  const payload = JSON.stringify({ ok: true, email, engineer, demo: true });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Connecté</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#FAF8F3;color:#102D50;margin:0;padding:40px;text-align:center}
.box{max-width:480px;margin:60px auto;background:white;border:1px solid #E8E3D6;border-radius:14px;padding:36px}
h1{font-family:Georgia,serif}.email{color:#C68E0E;font-weight:700}.note{color:#708196;font-size:13px;margin-top:18px}
.check{width:60px;height:60px;border-radius:50%;background:#EEDDB6;border:2px solid #C68E0E;color:#102D50;font-size:30px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px}</style></head>
<body><div class="box"><div class="check">✓</div><h1>Compte démo connecté</h1><p>${escapeHtml(email)}</p>
<p class="note">Mode démo · fenêtre fermée automatiquement.</p>
<script>try{if(window.opener)window.opener.postMessage(${payload},window.location.origin);}catch(e){}
setTimeout(function(){window.close();},800);</script></div></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
