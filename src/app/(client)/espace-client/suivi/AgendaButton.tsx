"use client";

import { useCallback } from "react";

// Sous-composant interactif (use client) : génère un fichier .ics côté
// navigateur à partir des données passées en props par le Server Component.
// N'importe AUCUN module serveur — uniquement des valeurs primitives en props.

type AgendaButtonProps = {
  title: string;
  startIso: string;
  durationMinutes: number;
  location: string;
  description?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format ICS UTC : 20260615T140000Z */
function toIcsUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function AgendaButton({
  title,
  startIso,
  durationMinutes,
  location,
  description,
}: AgendaButtonProps) {
  const onClick = useCallback(() => {
    const start = new Date(startIso);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + durationMinutes * 60_000);

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ASTRAEOS//Espace Client//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${start.getTime()}@astraeos-espace-client`,
      `DTSTAMP:${toIcsUtc(new Date())}`,
      `DTSTART:${toIcsUtc(start)}`,
      `DTEND:${toIcsUtc(end)}`,
      `SUMMARY:${escapeIcs(title)}`,
      `LOCATION:${escapeIcs(location)}`,
      description ? `DESCRIPTION:${escapeIcs(description)}` : null,
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean);

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rendez-vous-astraeos.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [title, startIso, durationMinutes, location, description]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] transition hover:border-[var(--gold)] hover:text-[var(--gold-deep)]"
    >
      <span aria-hidden>📅</span> Ajouter à mon agenda
    </button>
  );
}
