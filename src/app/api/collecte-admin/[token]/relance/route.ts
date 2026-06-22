import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildCollecteEmail } from "@/lib/collecte-email";
import { requireAuth } from "@/lib/auth";
import { getSessionContext } from "@/lib/auth/context";
import { clientIp, rateLimit, rateLimitKey } from "@/lib/rate-limit";

/**
 * Relance client : renvoie un e-mail de rappel (variante "rappel") vers
 * l'adresse de la collecte, réutilisant le lien de dépôt /depot/[token].
 * Scope tenant + cabinet, réservé au cabinet (cookie de session).
 * Réutilise le pattern REST Resend de /api/collecte/send.
 */

type Item = {
  theme?: string;
  sub?: string;
  label: string;
  type?: "Document" | "Question";
  removed?: boolean;
};

// Next 16 : params est une Promise.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const denied = await requireAuth(req);
  if (denied) return denied;

  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

  // Garde anti-spam : 10 relances/min par cabinet+IP (cohérent avec collecte/send).
  if (
    !rateLimit(rateLimitKey("collecte-admin/relance", ctx.cabinetId, clientIp(req)), 10, 60_000)
  ) {
    return NextResponse.json(
      { error: "Trop de relances, réessayez dans un instant." },
      { status: 429 },
    );
  }

  const { token } = await params;
  if (!token || token.length > 40) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  // Sélection optionnelle : un tableau d'item_index à relancer. Absent → on
  // relance sur TOUTES les pièces encore demandées (comportement historique).
  // Le corps peut être vide (relance globale) → on tolère le JSON manquant.
  let selectedIndexes: number[] | null = null;
  try {
    const body = (await req.json().catch(() => null)) as { item_index?: unknown } | null;
    if (body && Array.isArray(body.item_index)) {
      const ints = body.item_index
        .map((v) => Number(v))
        .filter((n) => Number.isInteger(n) && n >= 0);
      // Tableau fourni mais vide → sélection invalide, on refuse plutôt que de
      // relancer tout le monde par surprise.
      if (ints.length === 0) {
        return NextResponse.json(
          { error: "Aucune pièce sélectionnée." },
          { status: 400 },
        );
      }
      selectedIndexes = ints;
    }
  } catch {
    selectedIndexes = null;
  }

  const supabase = createAdminClient();

  const { data: collecte, error } = await supabase
    .from("collectes")
    .select("id, client_nom, client_email, structure")
    .eq("token", token)
    .eq("tenant_id", ctx.tenantId)
    .eq("cabinet_id", ctx.cabinetId)
    .maybeSingle();

  // Isolation cabinet : token non secret → on borne tenant + cabinet en requête.
  if (error || !collecte) {
    return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
  }

  const email = typeof collecte.client_email === "string" ? collecte.client_email.trim() : "";
  if (!email) {
    return NextResponse.json(
      { error: "Aucune adresse e-mail sur cette collecte (créée en mode lien)." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Dégradation gracieuse : pas de clé → erreur claire, pas de crash.
    return NextResponse.json({ error: "RESEND_API_KEY manquant" }, { status: 503 });
  }
  const from = process.env.RESEND_FROM || "Astraeos <onboarding@resend.dev>";

  // Origine dérivée des en-têtes de proxy (même logique que collecte/send) :
  // évite d'embarquer une URL de déploiement protégée par SSO dans l'e-mail.
  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const host =
    prodHost ??
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const origin = `${proto}://${host}`;
  const depotUrl = `${origin}/depot/${token}`;

  const structure: Item[] = Array.isArray(collecte.structure)
    ? (collecte.structure as Item[])
    : [];
  // On ne liste que les pièces encore demandées (les retirées ne concernent plus
  // le client). Si une sélection d'index est fournie, on borne en plus à ces
  // pièces — la relance ne rappelle alors QUE les pièces cochées.
  const selectedSet = selectedIndexes ? new Set(selectedIndexes) : null;
  const items = structure.filter(
    (it, idx) => !it.removed && (!selectedSet || selectedSet.has(idx)),
  );

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Aucune pièce à relancer (sélection vide ou pièces déjà retirées)." },
      { status: 400 },
    );
  }

  const { subject, html } = buildCollecteEmail({
    prenomNom: collecte.client_nom || email,
    items,
    depotUrl,
    variant: "rappel",
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

    const result = (await resp.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };

    if (!resp.ok) {
      return NextResponse.json(
        { error: result.message || result.name || `Resend HTTP ${resp.status}` },
        { status: 502 },
      );
    }

    const emailId = result.id ?? null;
    // Réutilise les colonnes existantes : la dernière relance devient le dernier
    // envoi (pas de nouvelle colonne, pas de DDL).
    await supabase
      .from("collectes")
      .update({ email_sent_at: new Date().toISOString(), email_id: emailId })
      .eq("id", collecte.id);

    return NextResponse.json({ ok: true, emailId, to: email });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Échec de l'envoi e-mail" },
      { status: 502 },
    );
  }
}
