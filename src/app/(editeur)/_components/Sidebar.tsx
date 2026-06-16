"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    title: "Cockpit éditeur",
    items: [
      { href: "/", label: "Accueil" },
      { href: "/business", label: "Pilotage business", num: "01" },
      { href: "/acquisition", label: "Acquisition & conversion", num: "02" },
      { href: "/adoption", label: "Adoption produit", num: "03" },
      { href: "/ttv", label: "Vitesse première valeur", num: "04" },
      { href: "/health", label: "Santé clients", num: "05", badge: { text: "3", tone: "alert" } },
      { href: "/product", label: "Analyse produit", num: "06" },
      { href: "/quality", label: "Support & qualité", num: "07", badge: { text: "12" } },
      { href: "/infra", label: "Infrastructure", num: "08" },
    ],
  },
  {
    title: "Acquisition",
    items: [
      { href: "/leads", label: "Pipeline acquisition" },
      { href: "/referral", label: "Programme de parrainage", badge: { text: "N", tone: "new" } },
    ],
  },
  {
    title: "Opérations clients",
    items: [
      { href: "/clients", label: "Clients totaux actifs" },
      { href: "/dossiers", label: "Pipeline des dossiers" },
      { href: "/entretiens", label: "Entretiens visio" },
      { href: "/trial", label: "Période d'essai", badge: { text: "4" } },
      { href: "/client-new", label: "Nouveau client" },
      { href: "/marketplace", label: "Catalogue des packs" },
    ],
  },
  {
    title: "Pilotage interne",
    items: [
      { href: "/finance", label: "Finance consolidée" },
      { href: "/comms", label: "Communications & annonces" },
      { href: "/roadmap", label: "Roadmap & releases" },
      { href: "/team", label: "Équipe interne" },
    ],
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
          Admin Éditeur
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
