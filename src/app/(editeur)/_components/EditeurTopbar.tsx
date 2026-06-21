"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Topbar portée à l'identique de la maquette (lignes 835-894) : fil d'Ariane,
// sélecteur de date global avec popover, boutons icônes, pastille utilisateur.
// Le toggle du popover (toggleDatePopover) devient un état client.

const QUICK_OPTIONS = [
  "Aujourd'hui",
  "7 jours",
  "30 jours",
  "90 jours",
  "Ce mois",
  "Ce trimestre",
  "Cette année",
  "Personnalisé",
];

const COMPARE_OPTIONS = ["vs J-1", "vs S-1", "vs M-1", "vs T-1", "vs N-1", "Aucune"];

export function EditeurTopbar({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const [quick, setQuick] = useState("30 jours");
  const [compare, setCompare] = useState("vs M-1");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="topbar">
      <div className="breadcrumb">
        <Link href="/">ASTRAEOS Admin</Link>
        <span className="sep">›</span>
        <span className="current">{current}</span>
      </div>
      <div className="topbar-right">
        <div className="date-selector" ref={ref}>
          <button className="date-selector-btn" onClick={() => setOpen((v) => !v)}>
            <svg>
              <use href="#i-calendar" />
            </svg>
            <span>06 mai 2026</span>
            <span className="date-selector-btn-period">{compare}</span>
            <svg style={{ marginLeft: 4, width: 11, height: 11 }}>
              <use href="#i-arrow-down" />
            </svg>
          </button>
          <div className={`date-popover${open ? " open" : ""}`}>
            <div className="date-popover-section">
              <div className="date-popover-label">Période rapide</div>
              <div className="date-quick-options">
                {QUICK_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`date-quick-option${quick === opt ? " active" : ""}`}
                    onClick={() => setQuick(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="date-popover-section">
              <div className="date-popover-label">Plage personnalisée</div>
              <div className="date-range-inputs">
                <input
                  type="date"
                  className="date-range-input"
                  defaultValue="2026-04-06"
                  suppressHydrationWarning
                />
                <input
                  type="date"
                  className="date-range-input"
                  defaultValue="2026-05-06"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="date-popover-section">
              <div className="date-popover-label">Comparaison</div>
              <div className="date-compare-options">
                {COMPARE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    className={`date-quick-option${compare === opt ? " active" : ""}`}
                    onClick={() => setCompare(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="date-popover-actions">
              <button
                className="btn btn-ghost btn-sm"
                style={{ flex: 1 }}
                onClick={() => setOpen(false)}
              >
                Annuler
              </button>
              <button
                className="btn btn-gold btn-sm"
                style={{ flex: 1 }}
                onClick={() => setOpen(false)}
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>

        <div className="icon-btn">
          <svg className="ico">
            <use href="#i-search" />
          </svg>
        </div>
        <div className="icon-btn">
          <svg className="ico">
            <use href="#i-bell" />
          </svg>
          <span className="dot" />
        </div>
        <div className="user-pill">
          <div className="user-avatar">SK</div>
          <span className="user-name">Sarah KAUFMANN</span>
        </div>
      </div>
    </div>
  );
}
