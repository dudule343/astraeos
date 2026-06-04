import { randomInt } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildCollecteEmail } from "@/lib/collecte-email";
import { requireAuth } from "@/lib/auth";

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
  const denied = requireAuth(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { participants, items, message } = (body ?? {}) as {
    participants?: Participant[];
    items?: Item[];
    message?: string;
  };

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
    if (typeof p.email !== "string" || !EMAIL_RE.test(p.email.trim())) {
      return NextResponse.json({ error: `E-mail invalide : ${p?.email ?? ""}` }, { status: 400 });
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
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const origin = `${proto}://${host}`;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";
  const supabase = createAdminClient();

  const results: Array<{
    email: string;
    token: string | null;
    emailId: string | null;
    error: string | null;
  }> = [];

  for (const participant of participants) {
    const nom = participant.nom.trim();
    const email = participant.email.trim();
    const token = generateToken();

    // 1. Création de la collecte
    const { data: collecte, error: insertError } = await supabase
      .from("collectes")
      .insert({
        token,
        client_nom: nom,
        client_email: email,
        structure,
      })
      .select("id")
      .single();

    if (insertError || !collecte) {
      results.push({
        email,
        token: null,
        emailId: null,
        error: insertError?.message ?? "Création de la collecte impossible",
      });
      continue;
    }

    // 2. Envoi de l'e-mail (mode dégradé si la clé Resend est absente)
    if (!apiKey) {
      results.push({ email, token, emailId: null, error: "RESEND_API_KEY manquant" });
      continue;
    }

    const depotUrl = `${origin}/depot/${token}`;
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

      results.push({ email, token, emailId, error: null });
    } catch (err) {
      results.push({
        email,
        token,
        emailId: null,
        error: err instanceof Error ? err.message : "Échec de l'envoi e-mail",
      });
    }
  }

  return NextResponse.json({ ok: true, results });
}
