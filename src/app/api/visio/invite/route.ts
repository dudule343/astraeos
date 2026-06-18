import { NextResponse, type NextRequest } from "next/server";

import { getSessionContext } from "@/lib/auth/context";
import { buildVisioInviteEmail } from "@/lib/visio-email";
import { clientIp, rateLimit, rateLimitKey } from "@/lib/rate-limit";

/**
 * POST /api/visio/invite
 *
 * Envoie par e-mail (Resend) le lien d'entretien visio au client. Action STAFF
 * (l'ingénieur depuis le lobby) → session requise. Le lien ouvre la salle en
 * vue client (role=client), sans le cockpit ingénieur.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Rôles autorisés à envoyer une invitation (sink sensible : e-mail brandé Resend).
const STAFF_ROLES = new Set(["cabinet_director", "brand_owner", "editor", "compliance", "engineer"]);

function sanitizeRoom(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64).toLowerCase();
}
function sanitizeSlug(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 64);
}

/** Origine CANONIQUE serveur — jamais dérivée des en-têtes de requête (Host /
 *  X-Forwarded-Host spoofables → lien de phishing dans l'e-mail). Env override,
 *  sinon le domaine app connu. */
function canonicalOrigin(): string {
  const env = process.env.ASTRAEOS_PUBLIC_ORIGIN?.trim();
  return (env || "https://app.astraeos.fr").replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  // Sink sensible (e-mail brandé) : on exige une VRAIE session staff. Le contexte
  // legacy (authUserId null, flag auth off) est explicitement refusé — sinon
  // relais e-mail ouvert / amplification de phishing.
  const ctx = await getSessionContext();
  if (!ctx || !ctx.authUserId || !STAFF_ROLES.has(ctx.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (!rateLimit(rateLimitKey("visio/invite", ctx.cabinetId, clientIp(req)), 20, 60_000)) {
    return NextResponse.json({ error: "Trop d'envois, réessayez dans un instant." }, { status: 429 });
  }

  let body: { email?: unknown; room?: unknown; prospect?: unknown; nom?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  const room = sanitizeRoom(String(body.room ?? ""));
  const prospect = sanitizeSlug(String(body.prospect ?? ""));
  const nom = String(body.nom ?? "").trim().slice(0, 80) || "Madame, Monsieur";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide" }, { status: 400 });
  }
  if (!room) {
    return NextResponse.json({ error: "Salle invalide" }, { status: 400 });
  }

  let joinUrl = `${canonicalOrigin()}/visio/${encodeURIComponent(room)}?role=client`;
  if (prospect) joinUrl += `&prospect=${encodeURIComponent(prospect)}`;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";
  if (!apiKey) {
    return NextResponse.json(
      { error: "E-mail non configuré (RESEND_API_KEY manquant). Copiez le lien à la place." },
      { status: 503 },
    );
  }

  const { subject, html } = buildVisioInviteEmail({ prenomNom: nom, joinUrl });

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: email, subject, html }),
    });
    const payload = (await resp.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };
    if (!resp.ok) {
      return NextResponse.json(
        { error: payload.message || payload.name || `Resend HTTP ${resp.status}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, emailId: payload.id ?? null });
  } catch {
    return NextResponse.json({ error: "Échec de l'envoi e-mail" }, { status: 502 });
  }
}
