"use client";

import Link from "next/link";

type Space = "editeur" | "marque";

export function SpaceSwitcher({ active }: { active: Space }) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--navy-100)] bg-[var(--navy-deep,#0A1F3A)] px-4 py-2">
      <div className="flex items-center gap-1 rounded-md bg-white/5 p-1">
        <Link
          href="/"
          className={`rounded px-3 py-1.5 text-[11.5px] font-semibold tracking-wide transition-colors ${
            active === "editeur"
              ? "bg-[var(--gold)] text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          Espace Éditeur
        </Link>
        <Link
          href="/marque"
          className={`rounded px-3 py-1.5 text-[11.5px] font-semibold tracking-wide transition-colors ${
            active === "marque"
              ? "bg-[var(--gold)] text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          Espace Marque
        </Link>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
        ASTRAEOS · Multi-espaces
      </div>
    </div>
  );
}
