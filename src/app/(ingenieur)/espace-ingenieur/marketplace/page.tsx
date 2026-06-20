import type { ReactNode } from "react";

import { getCatalogueScreen, type CatalogueIcon } from "../../_data/catalogue";
import "../../_styles/catalogue.css";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Catalogue produits",
};

export const dynamic = "force-dynamic";

/** Icônes d'en-tête de catégorie, portées des <symbol> de la maquette. */
const CAT_ICONS: Record<CatalogueIcon, ReactNode> = {
  finance: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9H5a2 2 0 1 1 0-4h12" />
      <circle cx="17" cy="14" r="1.4" fill="currentColor" />
    </svg>
  ),
  business: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  ),
  shield: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
};

/** Flèche « mise en relation » (path 22 12 …). */
const RelationIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12 H 2 M 12 2 L 22 12 L 12 22" />
  </svg>
);

/** Picto « connexion module » (carte / accès). */
const ModuleIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="6" width="18" height="14" rx="2" />
    <polyline points="3 10 21 10" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);

export default function MarketplacePage() {
  const screen = getCatalogueScreen();

  return (
    <div className="px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            Catalogue <strong>produits</strong>
          </h1>
          <p className="hero-sub">{screen.heroSub}</p>
        </div>
        <div className="hero-actions">
          {/* Export du catalogue : pas de backend dédié, feedback honnête via StubShell. */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            data-stub="Export du catalogue"
            data-stub-mode="toast"
            data-stub-body="L'export du catalogue produits sera disponible prochainement."
          >
            Exporter
          </button>
        </div>
      </div>

      {/* 4 catégories : Financier · Immobilier · Assurance · Immatriculation */}
      <div className="cat-grid">
        {screen.categories.map((cat) => (
          <div key={cat.id} className="card cat-card">
            <div className="card-header">
              <div className="card-title">
                {CAT_ICONS[cat.icon]}
                {cat.titre}
              </div>
              {/* Mise en relation = demande vers un référent PRIVEOS (pas encore branché) ;
                  connexion module = accès à un module externe. Feedback honnête via StubShell. */}
              <button
                type="button"
                className="btn btn-gold btn-sm cat-action-btn"
                data-stub={
                  cat.action === "module"
                    ? `Connexion · ${cat.titre}`
                    : `Mise en relation · ${cat.titre}`
                }
                data-stub-mode="modal"
                data-stub-body={
                  cat.action === "module"
                    ? "Le module assurance multi-compagnies sera connecté à votre espace prochainement."
                    : "Votre demande de mise en relation sera transmise à un référent PRIVEOS. Cette action sera branchée prochainement."
                }
              >
                {cat.action === "module" ? ModuleIcon : RelationIcon}
                {cat.actionLabel}
              </button>
            </div>
            <div className="card-body">
              <div className="cat-desc">{cat.description}</div>
              <div className="cat-tags">
                {cat.tags.map((tag) => (
                  <span key={tag} className="cat-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
