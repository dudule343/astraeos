"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar portée à l'identique de la maquette (reference/wireframes-editeur.html,
// lignes 771-831). La navigation goToPage() de la maquette devient du routing
// Next : chaque nav-item est un <Link> vers sa route, l'état actif est dérivé
// de usePathname(). Mêmes libellés, mêmes numéros, mêmes badges, mêmes icônes.

type NavItem = {
  href: string;
  label: string;
  num?: string;
  icon?: string;
  badge?: { text: string; tone?: "alert" | "new" };
};

type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "Cockpit éditeur",
    items: [
      { href: "/", label: "Accueil", icon: "i-home" },
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
      { href: "/leads", label: "Pipeline acquisition", icon: "i-leads" },
      {
        href: "/referral",
        label: "Programme de parrainage",
        icon: "i-referral",
        badge: { text: "N", tone: "new" },
      },
    ],
  },
  {
    title: "Opérations clients",
    items: [
      { href: "/clients", label: "Clients totaux actifs", icon: "i-clients" },
      { href: "/trial", label: "Période d'essai", icon: "i-trial", badge: { text: "4" } },
      { href: "/client-new", label: "Nouveau client", icon: "i-new" },
      { href: "/marketplace", label: "Catalogue des packs", icon: "i-marketplace" },
    ],
  },
  {
    title: "Pilotage interne",
    items: [
      { href: "/finance", label: "Finance consolidée", icon: "i-finance" },
      { href: "/comms", label: "Communications & annonces", icon: "i-comms" },
      { href: "/roadmap", label: "Roadmap & releases", icon: "i-roadmap" },
      { href: "/team", label: "Équipe interne", icon: "i-team" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function EditeurSidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-row">
          <div className="brand-mark">A</div>
          <div className="brand-name">ASTRAEOS</div>
        </div>
        <div className="brand-sub">ADMIN ÉDITEUR</div>
      </div>

      {SECTIONS.map((section) => (
        <div className="nav-section" key={section.title}>
          <div className="nav-section-header">
            <span className="dot" />
            {section.title}
          </div>
          {section.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${active ? " active" : ""}`}
              >
                {item.icon && (
                  <svg className="nav-item-icon">
                    <use href={`#${item.icon}`} />
                  </svg>
                )}
                {item.num && <span className="nav-item-num">{item.num}</span>}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`nav-badge${item.badge.tone ? ` ${item.badge.tone}` : ""}`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      <div className="nav-section">
        <div className="nav-section-header">
          <span className="dot" />
          Documents fondateurs
        </div>
        <a
          className="nav-item"
          href="#"
          aria-disabled="true"
          onClick={(e) => e.preventDefault()}
          style={{ cursor: "not-allowed" }}
          title="Document fondateur non encore disponible dans le cockpit"
        >
          <svg className="nav-item-icon">
            <use href="#i-doc" />
          </svg>
          <span>Master Dataset</span>
        </a>
        <a
          className="nav-item"
          href="#"
          aria-disabled="true"
          onClick={(e) => e.preventDefault()}
          style={{ cursor: "not-allowed" }}
          title="Document fondateur non encore disponible dans le cockpit"
        >
          <svg className="nav-item-icon">
            <use href="#i-chart" />
          </svg>
          <span>Data Architecture</span>
        </a>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 12,
          background: "white",
          border: "1px solid var(--navy-100)",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "var(--navy-300)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Légende phases
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "10.5px",
            color: "var(--navy)",
            marginBottom: 5,
          }}
        >
          <span className="phase-tag p1" style={{ position: "static" }}>
            PHASE 1
          </span>
          <span>mesurable au lancement</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "10.5px",
            color: "var(--navy)",
          }}
        >
          <span className="phase-tag p2" style={{ position: "static" }}>
            PHASE 2
          </span>
          <span>nécessite tracking</span>
        </div>
      </div>
    </aside>
  );
}
