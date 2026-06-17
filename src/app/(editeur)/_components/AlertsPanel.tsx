"use client";

import Link from "next/link";
import { useState } from "react";

export type AlertItem = {
  level: "danger" | "warning" | "info";
  levelLabel: string;
  time: string;
  title: string;
  sub: string;
  href: string;
};

const alertLevelClasses = {
  danger: "bg-[var(--red-bg)] text-[var(--red-text)]",
  warning: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  info: "bg-[var(--light-blue)] text-[var(--navy)]",
} as const;

type FilterKey = "all" | "danger" | "warning" | "info";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "danger", label: "Critique" },
  { key: "warning", label: "Important" },
  { key: "info", label: "Info" },
];

export function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const visible = filter === "all" ? alerts : alerts.filter((a) => a.level === filter);

  return (
    <div className="rounded-md border border-[var(--navy-100)] bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--navy-100)] px-4 py-3">
        <div className="text-[13px] font-semibold text-[var(--navy)]">
          Alertes & actions urgentes
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold ${
                filter === f.key
                  ? "border-[var(--gold)] bg-[var(--gold-200)] text-[var(--medium-400)]"
                  : "border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-[var(--navy-100)]">
        {visible.map((alert) => (
          <Link
            key={alert.title}
            href={alert.href}
            className="block cursor-pointer px-4 py-3 hover:bg-[var(--light-blue)]"
          >
            <div className="mb-1 flex items-center gap-2 text-[10.5px]">
              <span
                className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${alertLevelClasses[alert.level]}`}
              >
                {alert.levelLabel}
              </span>
              <span className="text-[var(--navy-300)]">{alert.time}</span>
            </div>
            <div className="text-[12.5px] font-semibold text-[var(--navy)]">
              {alert.title}
            </div>
            <div className="mt-0.5 text-[11.5px] text-[var(--navy-300)]">{alert.sub}</div>
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="px-4 py-6 text-center text-[11.5px] text-[var(--navy-300)]">
            Aucune alerte pour ce niveau.
          </div>
        )}
      </div>
    </div>
  );
}
