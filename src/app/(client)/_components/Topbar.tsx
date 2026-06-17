"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CLIENT_BASE, CLIENT_NAV } from "./nav";

type TopbarProps = {
  /** Nom complet du client connecté (résolu côté serveur). Vide → libellé neutre. */
  clientName: string;
  /** Initiales pour l'avatar. Vide → pas d'avatar texte. */
  initials: string;
};

function isItemActive(pathname: string, href: string): boolean {
  if (href === CLIENT_BASE) return pathname === CLIENT_BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Topbar({ clientName, initials }: TopbarProps) {
  const pathname = usePathname();
  const displayName = clientName.trim() || "Votre espace";

  return (
    <header className="border-b border-[var(--navy-100)] bg-gradient-to-b from-white to-[var(--ivory)]">
      <div className="mx-auto max-w-[1100px] px-6">
        {/* Bandeau d'identité — rassurant, jamais l'UI admin */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 pb-4">
          <Link href={CLIENT_BASE} className="flex items-center gap-3">
            <span className="flex h-9 w-8 items-center justify-center rounded-[5px] bg-gradient-to-b from-[var(--gold)] to-[var(--gold-deep)] text-base font-extrabold text-white">
              A
            </span>
            <span className="font-serif text-[21px] font-semibold tracking-[0.16em] text-[var(--navy)]">
              ASTRAEOS
            </span>
            <span className="ml-2 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--navy-300)] sm:inline">
              Espace Client
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--gold-200)] bg-gradient-to-br from-[var(--navy)] to-[var(--navy-300)] font-serif text-[11px] font-bold text-[var(--gold-200)]">
              {initials || "·"}
            </span>
            <div className="leading-tight">
              <div className="text-[12.5px] font-bold text-[var(--navy)]">{displayName}</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                Votre accompagnement
              </div>
            </div>
          </div>
        </div>

        {/* Onglets parcours — étapes claires */}
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Parcours client">
          {CLIENT_NAV.map((item) => {
            const active = isItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                  active
                    ? "border-[var(--gold)]"
                    : "border-transparent hover:bg-[var(--ivory-deep)]"
                }`}
              >
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-serif text-[12px] font-bold ${
                    active
                      ? "bg-[var(--gold)] text-white"
                      : "border border-[var(--navy-100)] bg-[var(--ivory)] text-[var(--navy-300)]"
                  }`}
                >
                  {item.step}
                </span>
                <span
                  className={`text-[13px] font-semibold ${
                    active ? "text-[var(--navy)]" : "text-[var(--navy-300)]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
