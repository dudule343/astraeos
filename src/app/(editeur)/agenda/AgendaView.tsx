"use client";

import { useCallback, useEffect, useState } from "react";

import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";

const DAYS = 14;

type CalendarStatus = {
  oauth_configured: boolean;
  connected: boolean;
  email: string | null;
  granted_at: string | null;
  demo: boolean;
  expires_at: string | null;
  scope: string | null;
};

/** Forme Google Calendar event (sous-ensemble qu'on consomme). */
type GoogleEvent = {
  id?: string;
  summary?: string;
  location?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email?: string; displayName?: string }>;
};

type EventsResponse = {
  connected: boolean;
  demo?: boolean;
  email?: string | null;
  events?: GoogleEvent[];
  error?: string;
};

/** Erreur affichable, avec une action concrète quand on sait la résoudre. */
type AgendaError = { message: string; actionUrl?: string; actionLabel?: string };

/**
 * Transforme l'erreur brute renvoyée par /api/calendar/events (souvent le JSON
 * d'erreur de Google) en message actionnable. Cas principal : l'API Google
 * Calendar est désactivée dans le projet Cloud → on donne le lien pour l'activer.
 */
function humanizeCalendarError(raw: string): AgendaError {
  let message = raw;
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    if (parsed?.error?.message) message = parsed.error.message;
  } catch {
    // raw n'est pas du JSON Google — on garde le texte tel quel.
  }

  const projectMatch = /project (\d+)/.exec(message);
  if (/has not been used|is disabled|API .* disabled/i.test(message) && projectMatch) {
    return {
      message:
        "L'API Google Calendar est désactivée dans votre projet Google Cloud. Activez-la, puis réessayez (la propagation prend 1 à 2 minutes).",
      actionUrl: `https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=${projectMatch[1]}`,
      actionLabel: "Activer l'API Google Calendar",
    };
  }

  if (/token refresh failed/i.test(raw)) {
    return {
      message:
        "La connexion à Google a expiré ou été révoquée. Reconnectez votre Google Calendar.",
    };
  }

  return {
    message: `Impossible de récupérer les événements Google Calendar : ${message.slice(0, 200)}`,
  };
}

type ParsedEvent = {
  id: string;
  summary: string;
  start: Date | null;
  end: Date | null;
  location: string | null;
  isMeet: boolean;
  attendees: number;
};

function eventStart(e: GoogleEvent): Date | null {
  const raw = e.start?.dateTime ?? e.start?.date;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function eventEnd(e: GoogleEvent): Date | null {
  const raw = e.end?.dateTime ?? e.end?.date;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseEvents(events: GoogleEvent[]): ParsedEvent[] {
  return events
    .map((e, i) => {
      const start = eventStart(e);
      const end = eventEnd(e);
      const loc = e.location ?? null;
      const isMeet = Boolean(e.hangoutLink) || /meet/i.test(loc ?? "");
      return {
        id: e.id ?? `evt-${i}`,
        summary: e.summary ?? "Sans titre",
        start,
        end,
        location: loc,
        isMeet,
        attendees: e.attendees?.length ?? 0,
      } satisfies ParsedEvent;
    })
    .sort((a, b) => {
      const ta = a.start?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const tb = b.start?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return ta - tb;
    });
}

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const TIME_FMT = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

function dayLabel(d: Date, now: Date): string {
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return DATE_FMT.format(d);
}

function groupByDay(events: ParsedEvent[]): { key: string; date: Date; items: ParsedEvent[] }[] {
  const map = new Map<string, { key: string; date: Date; items: ParsedEvent[] }>();
  for (const e of events) {
    if (!e.start) continue;
    const key = `${e.start.getFullYear()}-${e.start.getMonth()}-${e.start.getDate()}`;
    const bucket = map.get(key);
    if (bucket) {
      bucket.items.push(e);
    } else {
      map.set(key, { key, date: e.start, items: [e] });
    }
  }
  return Array.from(map.values());
}

function computeKpis(events: ParsedEvent[], now: Date): KpiBlock[] {
  const upcoming = events.filter((e) => e.start && e.start.getTime() >= now.getTime());

  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const todayCount = upcoming.filter((e) => e.start && e.start.getTime() <= endOfToday.getTime()).length;

  const in7 = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  const weekCount = upcoming.filter((e) => e.start && e.start.getTime() <= in7.getTime()).length;

  const meetCount = upcoming.filter((e) => e.isMeet).length;

  return [
    {
      label: "RDV à venir",
      value: String(upcoming.length),
      valueTone: "gold",
      meta: `sur ${DAYS} prochains jours`,
    },
    {
      label: "Aujourd'hui",
      value: String(todayCount),
      meta: "RDV restants dans la journée",
    },
    {
      label: "Cette semaine",
      value: String(weekCount),
      meta: "7 prochains jours",
    },
    {
      label: "En visio",
      value: String(meetCount),
      meta: "Google Meet",
    },
  ];
}

export function AgendaView() {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [events, setEvents] = useState<ParsedEvent[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AgendaError | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, eventsRes] = await Promise.all([
        fetch(`/api/calendar/status`, { cache: "no-store" }),
        fetch(`/api/calendar/events?days=${DAYS}`, { cache: "no-store" }),
      ]);

      const statusData = (await statusRes.json()) as CalendarStatus;
      setStatus(statusData);

      const eventsData = (await eventsRes.json()) as EventsResponse;
      if (eventsData.error) {
        setError(humanizeCalendarError(eventsData.error));
        setEvents([]);
      } else {
        setEvents(parseEvents(eventsData.events ?? []));
      }
      setDemo(Boolean(eventsData.demo) || Boolean(statusData.demo));
    } catch {
      setError({ message: "Connexion au service agenda impossible." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    // Différé d'un microtask : évite un setState synchrone dans le corps de l'effet
    // (cascading renders) tout en déclenchant le fetch au montage.
    void Promise.resolve().then(() => {
      if (active) void load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  const handleConnect = () => {
    window.location.href = `/api/auth/google/start`;
  };

  const handleDisconnect = async () => {
    setActing(true);
    try {
      await fetch(`/api/calendar/disconnect`, { method: "POST" });
      await load();
    } catch {
      setError({ message: "Échec de la déconnexion." });
    } finally {
      setActing(false);
    }
  };

  const now = new Date();
  const connected = status?.connected ?? false;
  const kpis = computeKpis(events, now);
  const upcoming = events.filter((e) => !e.start || e.start.getTime() >= now.getTime());
  const grouped = groupByDay(upcoming);

  return (
    <>
      <ConnectionBanner
        status={status}
        loading={loading}
        acting={acting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {demo && (
        <div className="mb-6 rounded-md border border-[var(--gold-200)] bg-[var(--ivory)] px-4 py-3 text-[11.5px] text-[var(--navy-300)]">
          <strong className="font-semibold text-[var(--navy)]">Mode démonstration.</strong>{" "}
          Google Calendar n&apos;est pas connecté : les RDV ci-dessous sont des exemples. Connectez
          un compte pour afficher votre agenda réel.
        </div>
      )}

      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </section>

      {error ? (
        <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
          <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
            Agenda indisponible
          </div>
          <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
            {error.message}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {error.actionUrl && (
              <a
                href={error.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
              >
                {error.actionLabel ?? "Ouvrir"} ↗
              </a>
            )}
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              Réessayer
            </button>
          </div>
        </section>
      ) : loading ? (
        <section className="rounded-md border border-[var(--navy-100)] bg-white p-12 text-center text-[12.5px] text-[var(--navy-300)]">
          Chargement de l&apos;agenda…
        </section>
      ) : grouped.length === 0 ? (
        <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
          <div className="mb-3 text-[40px] leading-none">📅</div>
          <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
            Aucun rendez-vous à venir
          </div>
          <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
            {connected
              ? `Aucun événement n'est prévu sur les ${DAYS} prochains jours dans votre Google Calendar.`
              : "Connectez votre Google Calendar pour afficher vos prochains rendez-vous."}
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-6">
          {grouped.map((day) => (
            <div key={day.key}>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--navy-300)]">
                <span className="h-1 w-1 rounded-full bg-[var(--gold)]" />
                {dayLabel(day.date, now)}
                <span className="ml-1 font-semibold normal-case tracking-normal text-[var(--navy-300)]">
                  · {day.items.length} RDV
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {day.items.map((e) => (
                  <EventRow key={e.id} e={e} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}

function ConnectionBanner({
  status,
  loading,
  acting,
  onConnect,
  onDisconnect,
}: {
  status: CalendarStatus | null;
  loading: boolean;
  acting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const connected = status?.connected ?? false;
  const isDemo = status?.demo ?? false;

  return (
    <section className="mb-6 flex items-center justify-between gap-4 rounded-md border border-[var(--navy-100)] bg-white px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${
            connected ? "bg-[var(--green-text)]" : "bg-[var(--navy-100)]"
          }`}
        />
        <div>
          <div className="text-[12.5px] font-semibold text-[var(--navy)]">
            {loading
              ? "Vérification de la connexion…"
              : connected
                ? isDemo
                  ? "Connecté en mode démonstration"
                  : "Google Calendar connecté"
                : "Google Calendar non connecté"}
          </div>
          <div className="text-[11px] text-[var(--navy-300)]">
            {connected && status?.email
              ? status.email
              : status?.oauth_configured === false
                ? "OAuth non configuré · connexion en mode démo"
                : "Synchronisez vos rendez-vous depuis Google"}
          </div>
        </div>
      </div>

      {connected ? (
        <button
          type="button"
          onClick={onDisconnect}
          disabled={acting}
          className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {acting ? "Déconnexion…" : "Déconnecter"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          disabled={loading}
          className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Connecter Google Calendar
        </button>
      )}
    </section>
  );
}

function EventRow({ e }: { e: ParsedEvent }) {
  const time = e.start ? TIME_FMT.format(e.start) : "--:--";
  const endTime = e.end ? TIME_FMT.format(e.end) : null;

  return (
    <div className="flex items-stretch gap-3 rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] px-3 py-2.5 transition hover:border-[var(--gold)]">
      <div className="flex w-[58px] flex-shrink-0 flex-col items-center justify-center border-r border-[var(--navy-100)] pr-3">
        <div className="text-[13px] font-bold leading-none text-[var(--navy)]">{time}</div>
        {endTime && (
          <div className="mt-1 text-[9.5px] text-[var(--navy-300)]">{endTime}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 truncate text-[12.5px] font-bold leading-tight text-[var(--navy)]">
          {e.summary}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--navy-300)]">
          {e.isMeet ? (
            <span className="inline-block rounded-sm bg-[var(--light-blue)] px-1.5 py-0.5 font-semibold text-[var(--green-text)]">
              Visio · Google Meet
            </span>
          ) : e.location ? (
            <span className="inline-block rounded-sm bg-[var(--navy-100)] px-1.5 py-0.5 font-semibold text-[var(--navy-300)]">
              {e.location}
            </span>
          ) : null}
          {e.attendees > 0 && (
            <span>
              {e.attendees} participant{e.attendees > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
