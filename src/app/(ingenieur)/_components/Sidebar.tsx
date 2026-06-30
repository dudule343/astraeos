"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SidebarIdentity } from "../_data/sidebar-identity";
import "../_styles/sidebar.css";

const BASE = "/espace-ingenieur";

/*
 * Sidebar de l'espace Ingénieur portée à l'identique de la maquette v28
 * (aside data-sidebar="ingenieur", lignes 3906-3977). On n'utilise PAS le
 * SpaceSidebar partagé (sans icônes, entrées manquantes) : composant dédié
 * avec les icônes SVG, les sections, badges, numéros et l'encart "Connecté en
 * tant que" du pied de la maquette. État actif via usePathname.
 */

type IconId =
  | "cockpit"
  | "calendar"
  | "chart"
  | "team"
  | "doc"
  | "finance"
  | "shield"
  | "business"
  | "marketplace"
  | "edit";

function NavIcon({ id }: { id: IconId }) {
  const common = {
    className: "nav-item-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (id) {
    // La maquette référence #i-cockpit mais le symbole n'est PAS défini dans
    // ses <defs> : la référence est cassée et n'affiche aucun glyphe. On porte
    // ce comportement à l'identique avec un SVG vide.
    case "cockpit":
      return <svg {...common} strokeWidth={1.6} />;
    case "calendar":
      return (
        <svg {...common} strokeWidth={1.6}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} strokeWidth={1.6}>
          <path d="M3 21h18" />
          <rect x="5" y="13" width="3" height="6" rx=".5" />
          <rect x="11" y="9" width="3" height="10" rx=".5" />
          <rect x="17" y="5" width="3" height="14" rx=".5" />
        </svg>
      );
    case "team":
      return (
        <svg {...common} strokeWidth={1.6}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
          <path d="M14 16.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common} strokeWidth={1.6}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
        </svg>
      );
    case "finance":
      return (
        <svg {...common} strokeWidth={1.6}>
          <path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9H5a2 2 0 1 1 0-4h12" />
          <circle cx="17" cy="14" r="1.4" fill="currentColor" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} strokeWidth={1.8}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case "business":
      return (
        <svg {...common} strokeWidth={1.6}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M14 7h7v7" />
        </svg>
      );
    case "marketplace":
      return (
        <svg {...common} strokeWidth={1.6}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common} strokeWidth={1.6}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
      );
  }
}

type Entry = {
  href: string;
  label: string;
  icon?: IconId;
  num?: string;
  badge?: string;
  external?: boolean;
};

type Section = {
  title: string;
  items: Entry[];
};

const SECTIONS: Section[] = [
  {
    title: "Mon activité",
    items: [
      { href: BASE, label: "Mon tableau de bord", icon: "cockpit" },
      { href: `${BASE}/agenda`, label: "Calendrier & RDV", icon: "calendar" },
      { href: "/visio", label: "Démarrer un entretien", icon: "calendar" },
      { href: `${BASE}/activite`, label: "Mon activité commerciale", icon: "chart" },
    ],
  },
  {
    title: "Mes clients",
    items: [
      { href: `${BASE}/clients`, label: "Tous mes clients", icon: "team", badge: "7" },
      { href: `${BASE}/clients/exemple`, label: "Fiche client (exemple)", icon: "doc" },
    ],
  },
  {
    title: "Parcours patrimonial",
    items: [
      { href: `${BASE}/prospects`, label: "Mes prospects", num: "01", badge: "5" },
      { href: `${BASE}/conformite`, label: "Conformité en cours", num: "02", badge: "1" },
      { href: `${BASE}/collectes`, label: "Collecte docs & infos", num: "03", badge: "1" },
      { href: `${BASE}/etudes`, label: "Mes études en cours", num: "04", badge: "4" },
      { href: `${BASE}/etudes-restituees`, label: "Études restituées", num: "05", badge: "3" },
      { href: `${BASE}/clients-suivi`, label: "Mes clients en suivi", num: "06", badge: "7" },
    ],
  },
  {
    title: "Assets du portefeuille",
    items: [
      { href: `${BASE}/assets`, label: "Vue d'ensemble", icon: "chart" },
      { href: `${BASE}/assets-financier`, label: "Investissement financier", icon: "finance" },
      { href: `${BASE}/assets-assurance`, label: "Assurance", icon: "shield" },
      { href: `${BASE}/assets-immobilier`, label: "Investissement immobilier", icon: "business" },
      { href: `${BASE}/assets-honoraires`, label: "Honoraires de conseil", icon: "doc" },
    ],
  },
  {
    title: "Partenaires & apporteurs",
    items: [
      { href: `${BASE}/partenaires`, label: "Partenaires & apporteurs", icon: "team" },
    ],
  },
  {
    title: "Outils",
    items: [
      { href: `${BASE}/etudes-patrimoniales`, label: "Études patrimoniales", icon: "doc" },
      { href: `${BASE}/marketplace`, label: "Catalogue produits", icon: "marketplace" },
      { href: `${BASE}/simulateurs`, label: "Simulateurs & calculateurs", icon: "chart" },
    ],
  },
  {
    title: "Référentiel",
    items: [
      { href: `${BASE}/referentiel`, label: "Process & méthodologie", icon: "doc" },
    ],
  },
  {
    title: "Mon profil",
    items: [{ href: `${BASE}/profil`, label: "Profil & agréments", icon: "team" }],
  },
  {
    // Documents fondateurs : la maquette pointe vers d'autres fichiers HTML du
    // dossier de construction (00_Master_Dataset.html, etc.), sans équivalent
    // routé dans l'app. On garde des ancres honnêtes (#) plutôt que des liens
    // morts vers des pages inexistantes.
    title: "Documents fondateurs",
    items: [
      { href: "#", label: "Master Dataset", icon: "doc", external: true },
      { href: "#", label: "Data Architecture", icon: "chart", external: true },
      { href: "#", label: "Doc 1 · Espace Marque", icon: "business", external: true },
    ],
  },
  {
    title: "Modifications",
    items: [
      { href: `${BASE}/modifications`, label: "Signaler un problème", icon: "edit" },
    ],
  },
];

function NavLink({ entry, active }: { entry: Entry; active: boolean }) {
  const inner = (
    <>
      {entry.num ? (
        <span className="nav-item-num">{entry.num}</span>
      ) : entry.icon ? (
        <NavIcon id={entry.icon} />
      ) : null}
      <span className="nav-item-label">{entry.label}</span>
      {entry.badge && <span className="nav-badge">{entry.badge}</span>}
    </>
  );

  const className = `nav-item${active ? " active" : ""}`;

  if (entry.external) {
    return (
      <a className={className} href={entry.href}>
        {inner}
      </a>
    );
  }

  return (
    <Link className={className} href={entry.href}>
      {inner}
    </Link>
  );
}

export function Sidebar({ identity }: { identity?: SidebarIdentity | null }) {
  const pathname = usePathname();

  return (
    <aside className="ing-sidebar" data-sidebar="ingenieur">
      <div className="brand">
        <div className="brand-mark">A</div>
        <div className="brand-name">ASTRAEOS</div>
      </div>
      <div className="brand-sub">Espace Ingénieur</div>

      <nav className="nav">
        {SECTIONS.map((section) => (
          <div className="nav-section" key={section.title}>
            <div className="nav-section-header">
              <span className="dot" />
              {section.title}
            </div>
            {section.items.map((entry) => {
              const active =
                !entry.external &&
                (entry.href === BASE
                  ? pathname === BASE
                  : pathname === entry.href ||
                    pathname.startsWith(`${entry.href}/`));
              return <NavLink key={entry.label} entry={entry} active={active} />;
            })}
          </div>
        ))}
      </nav>

      <div className="nav-user">
        <div className="nav-user-eyebrow">Connecté en tant que</div>
        <div className="nav-user-name">{identity?.nomComplet ?? "Luc THILLIEZ"}</div>
        <div className="nav-user-role">
          {identity?.role ?? "Ingénieur patrimonial (dirigeant-praticien)"}
        </div>
        <div className="nav-user-cabinet">
          {identity?.cabinet ?? "Cabinet Paris Étoile · Paris 8e"}
        </div>
      </div>
    </aside>
  );
}
