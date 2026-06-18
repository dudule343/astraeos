import { randomInt } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildCollecteEmail } from "@/lib/collecte-email";
import { requireAuth } from "@/lib/auth";
import { getSessionContext } from "@/lib/auth/context";
import { clientIp, rateLimit, rateLimitKey } from "@/lib/rate-limit";

// Alphabet sans caractères ambigus (pas de l/o/0/1).
const TOKEN_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Participant = { nom: string; email: string };
type Item = {
  theme?: string;
  sub?: string;
  label: string;
  type?: "Document" | "Question";
};

/** Génère un token type "abcd-efgh-ijkl" via randomInt (CSPRNG node:crypto). */
function generateToken(): string {
  const groups: string[] = [];
  for (let g = 0; g < 3; g++) {
    let group = "";
    for (let i = 0; i < 4; i++) {
      group += TOKEN_ALPHABET[randomInt(TOKEN_ALPHABET.length)];
    }
    groups.push(group);
  }
  return groups.join("-");
}

export async function POST(req: NextRequest) {
  const denied = await requireAuth(req);
  if (denied) return denied;

  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

  // Rate-limit (envoi e-mail séquentiel coûteux) : 10/min par cabinet+IP.
  if (
    !rateLimit(
      rateLimitKey("collecte/send", ctx.cabinetId, clientIp(req)),
      10,
      60_000,
    )
  ) {
    return NextResponse.json(
      { error: "Trop d'envois, réessayez dans un instant." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { participants, items, message, mode: rawMode, dossier_id: rawDossierId } = (body ?? {}) as {
    participants?: Participant[];
    items?: Item[];
    message?: string;
    mode?: string;
    dossier_id?: string;
  };

  // Mode d'envoi : "email" (envoi e-mail), "link" (génère seulement le lien à
  // partager, sans e-mail ni Resend), "both" (les deux). Défaut "email" pour
  // rétro-compatibilité. En mode "link", l'e-mail du participant est optionnel.
  const mode = rawMode === "link" || rawMode === "both" ? rawMode : "email";
  const wantsEmail = mode === "email" || mode === "both";

  if (!Array.isArray(participants) || participants.length === 0) {
    return NextResponse.json({ error: "participants requis" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items requis" }, { status: 400 });
  }

  // Bornes anti-DoS : un volume excessif fait timeouter la route (envoi e-mail séquentiel).
  const MAX_PARTICIPANTS = 50;
  const MAX_ITEMS = 300;
  if (participants.length > MAX_PARTICIPANTS) {
    return NextResponse.json(
      { error: `Trop de participants (max ${MAX_PARTICIPANTS})` },
      { status: 400 },
    );
  }
  if (items.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `Trop d'éléments (max ${MAX_ITEMS})` },
      { status: 400 },
    );
  }

  // Validation des items : chaque élément doit être un objet avec un libellé non vide.
  // Couvre items:[null] (évite une TypeError 500 au .map) et les items sans libellé
  // (évite l'envoi d'un e-mail avec une ligne d'élément vide).
  for (const it of items) {
    if (
      !it ||
      typeof it !== "object" ||
      typeof (it as Item).label !== "string" ||
      !(it as Item).label.trim()
    ) {
      return NextResponse.json(
        { error: "Chaque élément doit avoir un libellé" },
        { status: 400 },
      );
    }
  }

  // Validation des participants
  for (const p of participants) {
    if (!p || typeof p.nom !== "string" || !p.nom.trim()) {
      return NextResponse.json({ error: "Chaque participant doit avoir un nom" }, { status: 400 });
    }
    const email = typeof p.email === "string" ? p.email.trim() : "";
    if (wantsEmail) {
      // En mode e-mail (ou les deux), une adresse valide est obligatoire.
      if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ error: `E-mail invalide : ${email}` }, { status: 400 });
      }
    } else if (email && !EMAIL_RE.test(email)) {
      // En mode lien, l'e-mail est optionnel ; s'il est fourni il doit être valide.
      return NextResponse.json({ error: `E-mail invalide : ${email}` }, { status: 400 });
    }
  }

  // Normalisation de la structure stockée
  const structure: Item[] = items.map((it) => ({
    theme: typeof it.theme === "string" ? it.theme : undefined,
    sub: typeof it.sub === "string" ? it.sub : undefined,
    label: String(it.label ?? ""),
    type: it.type === "Question" ? "Question" : "Document",
  }));

  // Origine dérivée des en-têtes de proxy : req.nextUrl.origin ignore x-forwarded-host
  // et renverrait le host interne sur les previews / domaines alias Vercel.
  // Domaine public de prod fourni par Vercel : évite d'embarquer une URL de
  // déploiement (protégée par SSO) dans les e-mails clients.
  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const host =
    prodHost ??
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const origin = `${proto}://${host}`;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";
  const supabase = createAdminClient();

  // Rattachement optionnel au dossier (collecte adaptative) : on valide que le
  // dossier appartient bien au tenant + cabinet courant avant de l'insérer.
  // Absent → flux inchangé (collecte non rattachée).
  let dossierId: string | null = null;
  if (typeof rawDossierId === "string" && rawDossierId.trim()) {
    const { data: dossier } = await supabase
      .from("dossiers")
      .select("id")
      .eq("id", rawDossierId.trim())
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    if (!dossier) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }
    dossierId = dossier.id;
  }

  const results: Array<{
    email: string | null;
    token: string | null;
    depotUrl: string | null;
    emailId: string | null;
    error: string | null;
  }> = [];

  for (const participant of participants) {
    const nom = participant.nom.trim();
    const email = typeof participant.email === "string" ? participant.email.trim() : "";
    const token = generateToken();

    // 1. Création de la collecte (client_email NOT NULL → "" si pas d'e-mail en mode lien)
    const { data: collecte, error: insertError } = await supabase
      .from("collectes")
      .insert({
        token,
        client_nom: nom,
        client_email: email,
        structure,
        tenant_id: ctx.tenantId,
        cabinet_id: ctx.cabinetId,
        dossier_id: dossierId,
      })
      .select("id")
      .single();

    if (insertError || !collecte) {
      results.push({
        email: email || null,
        token: null,
        depotUrl: null,
        emailId: null,
        error: insertError?.message ?? "Création de la collecte impossible",
      });
      continue;
    }

    // Le lien à partager existe dès que la collecte est créée.
    const depotUrl = `${origin}/depot/${token}`;

    // 2. Mode "lien" (ou pas d'adresse) : on ne fait PAS d'e-mail, on renvoie le lien.
    if (!wantsEmail || !email) {
      results.push({ email: email || null, token, depotUrl, emailId: null, error: null });
      continue;
    }

    // 3. Envoi de l'e-mail (mode dégradé si la clé Resend est absente).
    if (!apiKey) {
      results.push({ email, token, depotUrl, emailId: null, error: "RESEND_API_KEY manquant" });
      continue;
    }

    const { subject, html } = buildCollecteEmail({
      prenomNom: nom,
      items: structure,
      depotUrl,
      message,
    });

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: email, subject, html }),
      });

      const payload = (await resp.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
        name?: string;
      };

      if (!resp.ok) {
        results.push({
          email,
          token,
          depotUrl,
          emailId: null,
          error: payload.message || payload.name || `Resend HTTP ${resp.status}`,
        });
        continue;
      }

      const emailId = payload.id ?? null;
      await supabase
        .from("collectes")
        .update({ email_sent_at: new Date().toISOString(), email_id: emailId })
        .eq("id", collecte.id);

      results.push({ email, token, depotUrl, emailId, error: null });
    } catch (err) {
      results.push({
        email,
        token,
        depotUrl,
        emailId: null,
        error: err instanceof Error ? err.message : "Échec de l'envoi e-mail",
      });
    }
  }

  return NextResponse.json({ ok: true, results });
}
