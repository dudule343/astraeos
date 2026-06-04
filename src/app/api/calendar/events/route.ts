import { NextResponse, type NextRequest } from "next/server";

import { getFreshAccessToken, loadTokens } from "@/lib/google-oauth";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/calendar/events?engineer=luc-thilliez&days=7
 * Liste les événements de la semaine.
 */
export async function GET(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const engineer = req.nextUrl.searchParams.get("engineer") || "luc-thilliez";
  const days = parseInt(req.nextUrl.searchParams.get("days") || "7", 10);
  const tokens = await loadTokens(engineer);

  if (!tokens) {
    return NextResponse.json({ connected: false, events: [] }, { status: 200 });
  }
  if (tokens.access_token === "demo-token-not-real") {
    // Mode démo : retourne 3 événements fictifs réalistes
    return NextResponse.json({
      connected: true,
      demo: true,
      email: tokens.email,
      events: demoEvents(),
    });
  }

  const accessToken = await getFreshAccessToken(engineer);
  if (!accessToken) {
    return NextResponse.json({ connected: false, error: "Token refresh failed" }, { status: 401 });
  }

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "50");

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ connected: true, error: text }, { status: res.status });
  }
  const data = (await res.json()) as { items?: unknown[] };
  return NextResponse.json({ connected: true, email: tokens.email, events: data.items ?? [] });
}

/**
 * POST /api/calendar/events?engineer=luc-thilliez
 * Body : { summary, description, start_iso, end_iso, attendee_email? }
 * Crée un événement dans le calendrier primaire de l'ingénieur.
 */
export async function POST(req: NextRequest) {
  const denied = requireAuth(req);
  if (denied) return denied;

  const engineer = req.nextUrl.searchParams.get("engineer") || "luc-thilliez";
  const tokens = await loadTokens(engineer);
  if (!tokens) {
    return NextResponse.json({ error: "Engineer not connected" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const summary = String(body.summary || "RDV Astraeos");
  const description = String(body.description || "");
  const start_iso = String(body.start_iso || "");
  const end_iso = String(body.end_iso || "");
  const attendee_email = body.attendee_email ? String(body.attendee_email) : null;

  if (!start_iso || !end_iso) {
    return NextResponse.json({ error: "start_iso et end_iso requis" }, { status: 400 });
  }

  if (tokens.access_token === "demo-token-not-real") {
    return NextResponse.json({
      ok: true,
      demo: true,
      event: { id: "demo-" + Date.now(), summary, start: { dateTime: start_iso }, end: { dateTime: end_iso } },
    });
  }

  const accessToken = await getFreshAccessToken(engineer);
  if (!accessToken) return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });

  const event = {
    summary,
    description,
    start: { dateTime: start_iso, timeZone: "Europe/Paris" },
    end:   { dateTime: end_iso,   timeZone: "Europe/Paris" },
    attendees: attendee_email ? [{ email: attendee_email }] : [],
    conferenceData: {
      createRequest: {
        requestId: `astr-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(event),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }
  const created = await res.json();
  return NextResponse.json({ ok: true, event: created });
}

function demoEvents() {
  const now = Date.now();
  const at = (h: number, dur = 60) => ({
    start: { dateTime: new Date(now + h * 3600_000).toISOString() },
    end:   { dateTime: new Date(now + (h + dur / 60) * 3600_000).toISOString() },
  });
  return [
    { id: "d1", summary: "Entretien initial · Camille JOUBERT",       ...at(2),    location: "Google Meet" },
    { id: "d2", summary: "Restitution étude · Olivier CHARPENTIER",   ...at(28),   location: "Cabinet Paris Étoile" },
    { id: "d3", summary: "RDV signature · Bernard TESSIER",            ...at(52),   location: "Google Meet" },
  ];
}
