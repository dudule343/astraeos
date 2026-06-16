"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/espace-dirigeant";

type NavItem = {
  href: string;
  label: string;
  num?: string;
  badge?: { text: string; tone?: "default" | "alert" | "new" };
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "Cockpit dirigeant",
    items: [
      { href: BASE, label: "Accueil cabinet" },
      { href: `${BASE}/finance`, label: "Finance du cabinet", num: "01" },
      { href: `${BASE}/ingenieurs`, label: "Ingénieurs", num: "02" },
      { href: `${BASE}/performance`, label: "Performance", num: "03" },
    ],
  },
  {
    title: "Développement",
    items: [
      { href: `${BASE}/assets`, label: "Encours & assets" },
      { href: `${BASE}/partenaires`, label: "Partenaires & apporteurs" },
    ],
  },
  {
    title: "Administration",
    items: [{ href: `${BASE}/parametrages`, label: "Paramétrages du cabinet" }],
  },
];

function badgeClasses(tone?: "default" | "alert" | "new") {
  if (tone === "alert") return "bg-[var(--red-text)] text-[var(--ivory)]";
  if (tone === "new") return "bg-[var(--green-text)] text-[var(--ivory)]";
  return "bg-[var(--gold)] text-[var(--ivory)]";
}

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
          Espace Dirigeant
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
                {item.num && (
                  <span
                    className={`w-[22px] flex-shrink-0 rounded-[3px] px-0 py-px text-center text-[9.5px] font-bold tracking-[0.06em] ${
                      isActive
                        ? "bg-[var(--gold)] text-white"
                        : "bg-[var(--gold-200)] text-[var(--medium-400)]"
                    }`}
                  >
                    {item.num}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-[10px] px-1.5 text-[9.5px] font-bold ${badgeClasses(
                      item.badge.tone,
                    )}`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
