"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type {
  CatalogueCategorie,
  CatalogueIcon,
  CatalogueProduit,
} from "../../_data/catalogue";

/** Icônes d'en-tête de catégorie, portées des <symbol> de la maquette. */
const CAT_ICONS: Record<CatalogueIcon, ReactNode> = {
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9H5a2 2 0 1 1 0-4h12" />
      <circle cx="17" cy="14" r="1.4" fill="currentColor" />
    </svg>
  ),
  business: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

type SelectedProduit = CatalogueProduit & { categorieTitre: string };

type MarketplaceInteractiveProps = {
  categories: CatalogueCategorie[];
};

export function MarketplaceInteractive({ categories }: MarketplaceInteractiveProps) {
  // Fiche produit ouverte dans le panneau latéral (vraie interaction d'état).
  const [fiche, setFiche] = useState<SelectedProduit | null>(null);
  // Comparateur : ids des produits ajoutés (vraie interaction d'état).
  const [comparateur, setComparateur] = useState<string[]>([]);
  // Comparateur déplié en bas d'écran.
  const [comparateurOuvert, setComparateurOuvert] = useState(false);

  const produitsById = useMemo(() => {
    const map = new Map<string, SelectedProduit>();
    for (const cat of categories) {
      for (const p of cat.produits) {
        map.set(p.id, { ...p, categorieTitre: cat.titre });
      }
    }
    return map;
  }, [categories]);

  const produitsCompares = comparateur
    .map((id) => produitsById.get(id))
    .filter((p): p is SelectedProduit => Boolean(p));

  function toggleComparateur(id: string) {
    setComparateur((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <>
      <div className="cat-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="card cat-card">
            <div className="card-header">
              <div className="card-title">
                {CAT_ICONS[cat.icon]}
                {cat.titre}
              </div>
              {/* Mise en relation / connexion module : pas encore branchés à un
                  back-end, feedback honnête via StubShell. */}
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
              <ul className="prod-list">
                {cat.produits.map((prod) => {
                  const dansCompare = comparateur.includes(prod.id);
                  return (
                    <li key={prod.id} className="prod-row">
                      <div className="prod-meta">
                        <span className="prod-nom">{prod.nom}</span>
                        <span className="prod-resume">{prod.resume}</span>
                      </div>
                      <div className="prod-actions">
                        <button
                          type="button"
                          className="prod-btn"
                          onClick={() =>
                            setFiche({ ...prod, categorieTitre: cat.titre })
                          }
                        >
                          <IconEye />
                          Fiche
                        </button>
                        <button
                          type="button"
                          className={`prod-btn${dansCompare ? " is-active" : ""}`}
                          aria-pressed={dansCompare}
                          onClick={() => toggleComparateur(prod.id)}
                        >
                          {dansCompare ? <IconCheck /> : <IconPlus />}
                          {dansCompare ? "Ajouté" : "Comparer"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Panneau latéral : fiche produit (vraie consultation de détail). */}
      {fiche && (
        <div className="fiche-overlay" onClick={() => setFiche(null)}>
          <aside
            className="fiche-panel"
            role="dialog"
            aria-label={`Fiche produit ${fiche.nom}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fiche-head">
              <div>
                <div className="fiche-cat">{fiche.categorieTitre}</div>
                <h2 className="fiche-titre">{fiche.nom}</h2>
              </div>
              <button
                type="button"
                className="fiche-close"
                aria-label="Fermer la fiche"
                onClick={() => setFiche(null)}
              >
                ×
              </button>
            </div>
            <p className="fiche-desc">{fiche.description}</p>
            <dl className="fiche-caract">
              {fiche.caracteristiques.map((c) => (
                <div key={c.label} className="fiche-caract-row">
                  <dt>{c.label}</dt>
                  <dd>{c.valeur}</dd>
                </div>
              ))}
            </dl>
            <div className="fiche-footer">
              <button
                type="button"
                className={`btn btn-ghost btn-sm${comparateur.includes(fiche.id) ? " is-active" : ""}`}
                onClick={() => toggleComparateur(fiche.id)}
              >
                {comparateur.includes(fiche.id)
                  ? "Retirer du comparateur"
                  : "Ajouter au comparateur"}
              </button>
              {/* Demande d'agrément : pas de back-end dédié, StubShell honnête. */}
              <button
                type="button"
                className="btn btn-gold btn-sm"
                data-stub={`Demande d'agrément · ${fiche.nom}`}
                data-stub-mode="modal"
                data-stub-body="Votre demande d'agrément pour ce produit sera transmise au référent PRIVEOS concerné. Le circuit d'agrément en ligne sera disponible prochainement."
              >
                Demander l&apos;agrément
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Barre comparateur : visible dès qu'un produit est ajouté. */}
      {comparateur.length > 0 && (
        <div className="compare-bar">
          <button
            type="button"
            className="compare-toggle"
            aria-expanded={comparateurOuvert}
            onClick={() => setComparateurOuvert((v) => !v)}
          >
            Comparateur · {comparateur.length} produit
            {comparateur.length > 1 ? "s" : ""}
            <span className="compare-chevron">{comparateurOuvert ? "▾" : "▴"}</span>
          </button>
          <button
            type="button"
            className="compare-clear"
            onClick={() => {
              setComparateur([]);
              setComparateurOuvert(false);
            }}
          >
            Vider
          </button>
        </div>
      )}

      {/* Tableau comparatif déplié. */}
      {comparateurOuvert && produitsCompares.length > 0 && (
        <div className="compare-sheet" onClick={() => setComparateurOuvert(false)}>
          <div className="compare-card" onClick={(e) => e.stopPropagation()}>
            <div className="compare-head">
              <h3 className="compare-titre">Comparateur de produits</h3>
              <button
                type="button"
                className="fiche-close"
                aria-label="Fermer le comparateur"
                onClick={() => setComparateurOuvert(false)}
              >
                ×
              </button>
            </div>
            <div className="compare-grid-wrap">
              <div
                className="compare-grid"
                style={{
                  gridTemplateColumns: `minmax(140px, 1.2fr) repeat(${produitsCompares.length}, minmax(160px, 1fr))`,
                }}
              >
                <div className="compare-corner" />
                {produitsCompares.map((p) => (
                  <div key={p.id} className="compare-col-head">
                    <span className="compare-col-cat">{p.categorieTitre}</span>
                    <span className="compare-col-nom">{p.nom}</span>
                    <button
                      type="button"
                      className="compare-col-remove"
                      onClick={() => toggleComparateur(p.id)}
                    >
                      Retirer
                    </button>
                  </div>
                ))}
                {compareRows(produitsCompares).map((row) => (
                  <CompareRow key={row.label} label={row.label} cells={row.cells} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Construit l'union des labels de caractéristiques pour aligner les lignes. */
function compareRows(produits: SelectedProduit[]): {
  label: string;
  cells: string[];
}[] {
  const labels: string[] = [];
  for (const p of produits) {
    for (const c of p.caracteristiques) {
      if (!labels.includes(c.label)) labels.push(c.label);
    }
  }
  return [
    {
      label: "Résumé",
      cells: produits.map((p) => p.resume),
    },
    ...labels.map((label) => ({
      label,
      cells: produits.map(
        (p) => p.caracteristiques.find((c) => c.label === label)?.valeur ?? "—",
      ),
    })),
  ];
}

function CompareRow({ label, cells }: { label: string; cells: string[] }) {
  return (
    <>
      <div className="compare-rowlabel">{label}</div>
      {cells.map((cell, i) => (
        <div key={i} className="compare-cell">
          {cell}
        </div>
      ))}
    </>
  );
}
