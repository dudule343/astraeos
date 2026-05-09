"use client";

import { useEffect, useRef, useState } from "react";

const quickPeriods = [
  "Aujourd'hui",
  "7 jours",
  "30 jours",
  "90 jours",
  "Ce mois",
  "Ce trimestre",
  "Cette année",
  "Personnalisé",
];

const compareOptions = ["vs J-1", "vs S-1", "vs M-1", "vs T-1", "vs N-1", "Aucune"];

export function DateSelector() {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("30 jours");
  const [compare, setCompare] = useState("vs M-1");
  const [from, setFrom] = useState("2026-04-06");
  const [to, setTo] = useState("2026-05-06");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-[34px] items-center gap-2 rounded-md border border-[var(--gold-300)] bg-gradient-to-br from-[var(--ivory)] to-[var(--gold-200)] px-3 text-[11.5px] font-semibold text-[var(--medium-400)] hover:border-[var(--gold)]"
      >
        <span>📅</span>
        <span>06 mai 2026</span>
        <span className="text-[10.5px] font-medium text-[var(--navy-300)]">{compare}</span>
        <span className="text-[10px]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-[360px] rounded-lg border border-[var(--navy-100)] bg-white p-4 shadow-[0_6px_24px_rgba(16,45,80,0.12)]">
          <div className="mb-3.5">
            <div className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--navy-300)]">
              Période rapide
            </div>
            <div className="grid grid-cols-4 gap-1">
              {quickPeriods.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold ${
                    period === p
                      ? "border-[var(--gold)] bg-[var(--gold-200)] text-[var(--medium-400)]"
                      : "border-[var(--navy-100)] bg-[var(--ivory)] text-[var(--navy)] hover:border-[var(--gold-300)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3.5">
            <div className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--navy-300)]">
              Plage personnalisée
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1 rounded-md border border-[var(--navy-100)] bg-white px-2 py-1.5 text-[11.5px] text-[var(--navy)] focus:border-[var(--gold)] focus:outline-none"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 rounded-md border border-[var(--navy-100)] bg-white px-2 py-1.5 text-[11.5px] text-[var(--navy)] focus:border-[var(--gold)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--navy-300)]">
              Comparaison
            </div>
            <div className="grid grid-cols-3 gap-1">
              {compareOptions.map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => setCompare(o)}
                  className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold ${
                    compare === o
                      ? "border-[var(--gold)] bg-[var(--gold-200)] text-[var(--medium-400)]"
                      : "border-[var(--navy-100)] bg-[var(--ivory)] text-[var(--navy)] hover:border-[var(--gold-300)]"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3.5 flex gap-1.5 border-t border-[var(--navy-100)] pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md bg-[var(--gold)] px-3 py-1.5 text-[11.5px] font-bold text-white hover:brightness-110"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
