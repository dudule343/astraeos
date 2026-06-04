import { NextResponse, type NextRequest } from "next/server";

import { getValidAccessToken, loadTokens } from "@/lib/google-oauth";

/**
 * POST /api/calendar/meet-link
 * Body : { titre?: string, engineer?: string }
 *
 * Crée un événement Google Calendar immédiat (durée 1 h) avec une visio
 * Google Meet attachée (conferenceData / hangoutsMeet), en réutilisant les
 * tokens Google persistés de l'ingénieur (refresh transparent si expiré).
 *
 * Réponses :
 *   200 { ok: true, meet_link, event_id }
 *   409 { error: "Google Calendar non connecté" }   → ingénieur sans tokens
 *   502 { error: "..." }                              → erreur côté Google
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    // Corps présent mais pas un objet JSON simple (tableau, scalaire…) → invalide.
    if (parsed !== null && (typeof parsed !== "object" || Array.isArray(parsed))) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }
    body = (parsed as Record<string, unknown>) ?? {};
  } catch {
    // Corps vide / non-JSON : on accepte (titre et engineer ont des défauts).
  }

  // Champs optionnels : si fournis, ils doivent être des chaînes.
  if ("engineer" in body && typeof body.engineer !== "string") {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  if ("titre" in body && typeof body.titre !== "string") {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const engineer =
    (typeof body.engineer === "string" && body.engineer.trim()) || "luc-thilliez";
  const titre =
    (typeof body.titre === "string" && body.titre.trim()) || "Entretien PRIVEOS";

  const tokens = await loadTokens(engineer);
  if (!tokens) {
    return NextResponse.json(
      { error: "Google Calendar non connecté" },
      { status: 409 },
    );
  }

  // Mode démo : pas d'appel réseau, on renvoie un lien Meet factice cohérent.
  if (tokens.access_token === "demo-token-not-real") {
    return NextResponse.json({
      ok: true,
      demo: true,
      meet_link: "https://meet.google.com/demo-priveos-link",
      event_id: "demo-" + Date.now(),
    });
  }

  const accessToken = await getValidAccessToken(engineer);
  if (!accessToken) {
    // Tokens présents mais refresh impossible (refresh_token révoqué, etc.).
    return NextResponse.json(
      { error: "Google Calendar non connecté" },
      { status: 409 },
    );
  }

  const start = new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const requestId = "priveos-" + Math.random().toString(36).slice(2, 12);

  const eventBody = {
    summary: titre,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  let res: Response;
  try {
    res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventBody),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Google Calendar injoignable" },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn("[meet-link] Google error:", res.status, text);
    return NextResponse.json(
      { error: "Création de la réunion Google Meet échouée" },
      { status: 502 },
    );
  }

  const data = (await res.json().catch(() => null)) as {
    id?: string;
    hangoutLink?: string;
    conferenceData?: {
      entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
    };
  } | null;

  // Le lien Meet peut arriver via hangoutLink ou via les entryPoints video.
  const fromEntryPoints = data?.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video" && typeof e.uri === "string",
  )?.uri;
  const meetLink = data?.hangoutLink || fromEntryPoints || null;

  if (!meetLink) {
    return NextResponse.json(
      { error: "Réunion créée sans lien Meet exploitable" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    meet_link: meetLink,
    event_id: data?.id ?? null,
  });
}
