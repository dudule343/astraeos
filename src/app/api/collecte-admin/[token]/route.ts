import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth";
import { getSessionContext } from "@/lib/auth/context";
import { clientIp, rateLimit, rateLimitKey } from "@/lib/rate-limit";

/**
 * Vue ingénieur : détail d'une collecte (structure, dépôts, messages, avancement).
 * Réservé au cabinet (cookie de session).
 */

type Verdict = "valide" | "refuse" | "a_revoir";

type Item = {
  theme?: string;
  sub?: string;
  label: string;
  type?: "Document" | "Question";
  removed?: boolean;
  // Verdict humain de l'ingénieur (coexiste avec le verdict IA collecte_analyses).
  verdict?: Verdict | null;
  verdict_at?: string;
  verdict_by?: string;
};

type Depot = {
  item_index: number;
  label: string;
  file_name: string | null;
  file_size: number | null;
  reponse: string | null;
  created_at: string;
  storage_path: string | null;
};

// Next 16 : params est une Promise.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const denied = await requireAuth(req);
  if (denied) return denied;

  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

  const { token } = await params;

  if (!token || token.length > 40) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  try {
    const supabase = createAdminClient();

    const { data: collecte, error } = await supabase
      .from("collectes")
      .select("id, tenant_id, client_nom, client_email, created_at, opened_at, structure")
      .eq("token", token)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    // Isolation cabinet : le token n'est pas un secret d'autorisation (il transite
    // par email/URL/logs). On borne tenant + cabinet au niveau requête.
    if (error || !collecte) {
      return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
    }

    const [{ data: depotsData }, { data: messagesData }, { data: analysesData }] =
      await Promise.all([
        supabase
          .from("collecte_depots")
          .select("item_index, label, file_name, file_size, reponse, created_at, storage_path")
          .eq("collecte_id", collecte.id)
          .order("item_index", { ascending: true }),
        supabase
          .from("collecte_messages")
          .select("id, item_index, author, body, created_at")
          .eq("collecte_id", collecte.id)
          .order("created_at", { ascending: true })
          .limit(200),
        supabase
          .from("collecte_analyses")
          .select("item_index, status, resume, detail, updated_at")
          .eq("collecte_id", collecte.id)
          .order("item_index", { ascending: true }),
      ]);

    const depots: Depot[] = (depotsData ?? []) as Depot[];
    const structure: Item[] = Array.isArray(collecte.structure)
      ? (collecte.structure as Item[])
      : [];

    return NextResponse.json({
      client_nom: collecte.client_nom,
      client_email: collecte.client_email,
      created_at: collecte.created_at,
      opened_at: collecte.opened_at,
      structure,
      depots,
      messages: messagesData ?? [],
      analyses: analysesData ?? [],
      progress: { done: depots.length, total: structure.length },
    });
  } catch (err) {
    console.error("[collecte-admin/[token]] erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Collecte adaptative : l'ingénieur ajoute une pièce à demander APRÈS l'envoi,
// ou marque une pièce comme retirée. L'item_index étant positionnel (dépôts,
// analyses, messages y sont rattachés), on n'ajoute QU'EN FIN du tableau et on
// ne retire jamais d'élément du milieu — un retrait est un drapeau {removed:true}.
type StoredItem = Item;

const VERDICTS: readonly Verdict[] = ["valide", "refuse", "a_revoir"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const denied = await requireAuth(req);
  if (denied) return denied;

  const ctx = await getSessionContext();
  if (!ctx) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

  // Même garde que la ré-analyse : on borne les modifications de structure.
  if (
    !rateLimit(rateLimitKey("collecte-admin/patch", ctx.cabinetId, clientIp(req)), 20, 60_000)
  ) {
    return NextResponse.json(
      { error: "Trop de modifications, réessayez dans un instant." },
      { status: 429 },
    );
  }

  const { token } = await params;
  if (!token || token.length > 40) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  let payload: {
    action?: unknown;
    item?: unknown;
    item_index?: unknown;
    verdict?: unknown;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: collecte, error } = await supabase
    .from("collectes")
    .select("id, structure")
    .eq("token", token)
    .eq("tenant_id", ctx.tenantId)
    .eq("cabinet_id", ctx.cabinetId)
    .maybeSingle();

  // Isolation cabinet : token non secret → on borne tenant + cabinet en requête.
  if (error || !collecte) {
    return NextResponse.json({ error: "Collecte introuvable" }, { status: 404 });
  }

  const structure: StoredItem[] = Array.isArray(collecte.structure)
    ? (collecte.structure as StoredItem[])
    : [];

  if (payload.action === "add_item") {
    const raw = payload.item;
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "item requis" }, { status: 400 });
    }
    const it = raw as Partial<Item>;
    if (typeof it.label !== "string" || !it.label.trim()) {
      return NextResponse.json({ error: "Le libellé est requis" }, { status: 400 });
    }
    // Borne anti-DoS, cohérente avec MAX_ITEMS de collecte/send.
    if (structure.length >= 300) {
      return NextResponse.json({ error: "Trop d'éléments (max 300)" }, { status: 400 });
    }

    const newItem: StoredItem = {
      theme: typeof it.theme === "string" ? it.theme : undefined,
      sub: typeof it.sub === "string" ? it.sub : undefined,
      label: it.label.trim(),
      type: it.type === "Question" ? "Question" : "Document",
    };

    // Ajout en FIN : l'item_index du nouvel élément = ancienne longueur.
    const next = [...structure, newItem];
    const { error: upErr } = await supabase
      .from("collectes")
      .update({ structure: next })
      .eq("id", collecte.id);

    if (upErr) {
      return NextResponse.json({ error: "Mise à jour impossible" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, item_index: structure.length });
  }

  if (payload.action === "flag_removed") {
    const itemIndex = Number(payload.item_index);
    if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= structure.length) {
      return NextResponse.json({ error: "item_index invalide" }, { status: 400 });
    }
    // On NE retire PAS du tableau (préserve l'alignement positionnel des dépôts) :
    // on marque {removed:true}.
    const next = structure.map((item, i) =>
      i === itemIndex ? { ...item, removed: true } : item,
    );
    const { error: upErr } = await supabase
      .from("collectes")
      .update({ structure: next })
      .eq("id", collecte.id);

    if (upErr) {
      return NextResponse.json({ error: "Mise à jour impossible" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Verdict humain de l'ingénieur par pièce : valide / refuse / a_revoir, ou null
  // pour retirer le verdict. Stocké dans le JSON structure (pas de table dédiée),
  // à côté du verdict IA (collecte_analyses).
  if (payload.action === "set_verdict") {
    const itemIndex = Number(payload.item_index);
    if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= structure.length) {
      return NextResponse.json({ error: "item_index invalide" }, { status: 400 });
    }

    const rawVerdict = payload.verdict;
    let verdict: Verdict | null;
    if (rawVerdict === null) {
      verdict = null;
    } else if (typeof rawVerdict === "string" && (VERDICTS as readonly string[]).includes(rawVerdict)) {
      verdict = rawVerdict as Verdict;
    } else {
      return NextResponse.json({ error: "Verdict invalide" }, { status: 400 });
    }

    const next = structure.map((item, i) => {
      if (i !== itemIndex) return item;
      if (verdict === null) {
        // Retire le verdict (et ses métadonnées) sans perdre le reste de l'item.
        const rest = { ...item };
        delete rest.verdict;
        delete rest.verdict_at;
        delete rest.verdict_by;
        return rest;
      }
      return {
        ...item,
        verdict,
        verdict_at: new Date().toISOString(),
        verdict_by: ctx.userId,
      };
    });

    const { error: upErr } = await supabase
      .from("collectes")
      .update({ structure: next })
      .eq("id", collecte.id);

    if (upErr) {
      return NextResponse.json({ error: "Mise à jour impossible" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, verdict });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
