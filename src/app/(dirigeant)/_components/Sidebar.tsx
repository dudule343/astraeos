"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar portée à l'identique de la maquette (reference/wireframes-dirigeant.html,
// lignes 1021-1114). La navigation goToPage() de la maquette devient du routing
// Next : chaque nav-item est un <Link> vers sa route, l'état actif est dérivé
// de usePathname(). Mêmes libellés, mêmes numéros, mêmes badges, mêmes icônes.

const BASE = "/espace-dirigeant";

type NavItem = {
  href: string;
  label: string;
  num?: string;
  icon?: string;
  badge?: string;
};

type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "Tableau de bord",
    items: [
      { href: BASE, label: "Accueil cabinet", icon: "i-home" },
      { href: `${BASE}/finance`, label: "Vue d'ensemble financière", icon: "i-finance" },
      { href: `${BASE}/finance/resultat`, label: "Compte de résultat", icon: "i-doc" },
      { href: `${BASE}/finance/tresorerie`, label: "Trésorerie", icon: "i-chart" },
      { href: `${BASE}/finance/activite`, label: "Activité commerciale", icon: "i-team" },
    ],
  },
  {
    title: "Mon équipe",
    items: [
      { href: `${BASE}/ingenieurs`, label: "Mes ingénieurs", icon: "i-team", badge: "5" },
      { href: `${BASE}/ingenieurs/recrutement`, label: "Recrutement des ingénieurs", icon: "i-leads" },
      { href: `${BASE}/ingenieurs/comptes`, label: "Comptes ingénieurs", icon: "i-team", badge: "5" },
    ],
  },
  {
    title: "Parcours patrimonial",
    items: [
      { href: `${BASE}/parcours/prospects`, label: "Prospects actifs", num: "01", badge: "24" },
      { href: `${BASE}/parcours/compliance`, label: "Compliance validée", num: "02", badge: "3" },
      { href: `${BASE}/parcours/collecte`, label: "Collecte docs & infos", num: "03", badge: "5" },
      { href: `${BASE}/parcours/etudes`, label: "Études en cours", num: "04", badge: "7" },
      { href: `${BASE}/parcours/restituees`, label: "Études restituées", num: "05", badge: "14" },
      { href: `${BASE}/parcours/suivi`, label: "Clients en suivi", num: "06", badge: "28" },
    ],
  },
  {
    title: "Assets du cabinet",
    items: [
      { href: `${BASE}/assets`, label: "Vue d'ensemble", icon: "i-chart" },
      { href: `${BASE}/assets/financier`, label: "Investissement financier", icon: "i-finance" },
      { href: `${BASE}/assets/assurance`, label: "Assurance", icon: "i-shield" },
      { href: `${BASE}/assets/immobilier`, label: "Investissement immobilier", icon: "i-business" },
      { href: `${BASE}/assets/honoraires`, label: "Honoraires de conseil", icon: "i-doc" },
    ],
  },
  {
    title: "Partenaires & apporteurs",
    items: [
      { href: `${BASE}/partenaires`, label: "Partenaires & apporteurs", icon: "i-team", badge: "12" },
    ],
  },
  {
    title: "Outils",
    items: [
      { href: `${BASE}/outils/catalogue`, label: "Catalogue produits", icon: "i-marketplace" },
      { href: `${BASE}/outils/simulateurs`, label: "Simulateurs & calculateurs", icon: "i-chart" },
      { href: `${BASE}/outils/marketing`, label: "Bibliothèque marketing", icon: "i-comms" },
    ],
  },
  {
    title: "Référentiel",
    items: [
      { href: `${BASE}/referentiel`, label: "Process & méthodologie", icon: "i-doc" },
    ],
  },
  {
    title: "Paramétrages cabinet",
    items: [
      { href: `${BASE}/profil`, label: "Profil & agréments", icon: "i-team" },
      { href: `${BASE}/parametrages/conformite`, label: "Conformité juridique", icon: "i-shield" },
      { href: `${BASE}/parametrages/banque`, label: "Connexions bancaires", icon: "i-finance" },
      { href: `${BASE}/parametrages/integrations`, label: "Intégrations & connecteurs", icon: "i-chart" },
      { href: `${BASE}/parametrages/templates`, label: "Templates & communication", icon: "i-doc" },
      { href: `${BASE}/parametrages/identite`, label: "Identité de la marque", icon: "i-business" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === BASE) return pathname === BASE;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname() ?? BASE;

  return (
    <aside className="sidebar" data-sidebar="dirigeant">
      <div className="role-toggle-wrap">
        <div className="role-toggle-label">VOTRE VUE</div>
        <div className="role-toggle">
          <button className="role-toggle-btn active" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9v.01M15 9v.01M9 13v.01M15 13v.01M9 17v.01M15 17v.01" />
            </svg>
            Dirigeant
          </button>
          <Link className="role-toggle-btn" href="/espace-ingenieur">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
            </svg>
            Ingénieur
          </Link>
        </div>
      </div>

      <nav className="nav">
        {SECTIONS.map((section) => (
          <div className="nav-section" key={section.title}>
            <div className="nav-section-header">
              <span className="dot" />
              {section.title}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${isActive(pathname, item.href) ? " active" : ""}`}
              >
                {item.num ? (
                  <span className="nav-item-num">{item.num}</span>
                ) : (
                  <svg className="nav-item-icon">
                    <use href={`#${item.icon}`} />
                  </svg>
                )}
                <span>{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </Link>
            ))}
          </div>
        ))}

        <div className="nav-section">
          <div className="nav-section-header">
            <span className="dot" />
            Documents fondateurs
          </div>
          <Link className="nav-item" href="/espace-marque">
            <svg className="nav-item-icon">
              <use href="#i-business" />
            </svg>
            <span>Doc 1 · Espace Marque</span>
          </Link>
        </div>
      </nav>

      <div
        style={{
          marginTop: 24,
          padding: 14,
          background: "linear-gradient(135deg, var(--ivory) 0%, var(--gold-100) 100%)",
          border: "1px solid var(--gold-200)",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            color: "var(--gold-deep)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Connecté en tant que
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>Luc THILLIEZ</div>
        <div style={{ fontSize: 11, color: "var(--navy-300)", marginTop: 2 }}>Dirigeant du cabinet</div>
        <div style={{ fontSize: 10.5, color: "var(--navy-300)", marginTop: 2 }}>
          Cabinet Paris Étoile · Paris 8e
        </div>
      </div>
    </aside>
  );
}
