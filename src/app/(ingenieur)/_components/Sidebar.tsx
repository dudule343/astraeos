"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/espace-ingenieur";

type NavItem = { href: string; label: string };
type NavSection = { title: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    title: "Mon espace",
    items: [
      { href: BASE, label: "Tableau de bord" },
      { href: `${BASE}/agenda`, label: "Mon agenda" },
      { href: `${BASE}/profil`, label: "Mon profil" },
    ],
  },
  {
    title: "Clients & prospects",
    items: [
      { href: `${BASE}/prospects`, label: "Mes prospects" },
      { href: `${BASE}/clients`, label: "Mes clients" },
      { href: `${BASE}/client-new`, label: "Nouveau client" },
    ],
  },
  {
    title: "Dossiers & production",
    items: [
      { href: `${BASE}/dossiers`, label: "Pipeline des dossiers" },
      { href: `${BASE}/collectes`, label: "Collectes de documents" },
      { href: `${BASE}/entretiens`, label: "Entretiens visio" },
      { href: "/visio", label: "Nouvelle visio" },
    ],
  },
  {
    title: "Outils",
    items: [
      { href: `${BASE}/marketplace`, label: "Catalogue des packs" },
      { href: `${BASE}/integrations`, label: "Intégrations & clés API" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-[280px] flex-shrink-0 overflow-y-auto border-r border-[var(--navy-100)] bg-[var(--ivory)] px-4 pt-7 pb-8">
      <div className="mb-7 px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[30px] items-center justify-center rounded-[4px] bg-gradient-to-b from-[var(--gold)] to-[var(--medium-400)] text-base font-extrabold text-white">
            A
          </div>
          <div className="text-[19px] font-bold tracking-[0.08em] text-[var(--navy)]">
            ASTRAEOS
          </div>
        </div>
        <div className="ml-10 mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--navy-300)]">
          Espace Ingénieur
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="mb-[18px]">
          <div className="mb-1.5 flex items-center gap-[7px] px-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[var(--navy-300)]">
            <span className="h-1 w-1 rounded-full bg-[var(--gold)]" />
            {section.title}
          </div>

          {section.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-px flex w-full items-center gap-2.5 rounded-[5px] px-3 py-[7px] text-left text-[12.5px] leading-tight transition-colors ${
                  isActive
                    ? "bg-[var(--navy)] font-medium text-white"
                    : "text-[var(--navy)] hover:bg-[var(--light-blue)]"
                }`}
              >
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
