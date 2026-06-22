import { getCatalogueScreen } from "../../_data/catalogue";
import "../../_styles/catalogue.css";

import { MarketplaceInteractive } from "./MarketplaceInteractive";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Catalogue produits",
};

export const dynamic = "force-dynamic";

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
          {/* Export du catalogue : pas de back-end dédié, feedback honnête via StubShell. */}
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

      <MarketplaceInteractive categories={screen.categories} />
    </div>
  );
}
