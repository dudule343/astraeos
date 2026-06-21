"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useState } from "react";

type Categorie = {
  id: string;
  icon: string;
  titre: string;
  action: "relation" | "module";
  desc: string;
  tags: string[];
};

const CATEGORIES: Categorie[] = [
  {
    id: "financier",
    icon: "#i-finance",
    titre: "1 · Investissement financier",
    action: "relation",
    desc: "Demande de mise en relation avec un référent PRIVEOS pour le placement de produits financiers (assurance vie, PEA, contrat de capitalisation, compte-titres, PER).",
    tags: ["Assurance vie", "PEA", "Capitalisation", "Compte-titres", "PER"],
  },
  {
    id: "immobilier",
    icon: "#i-business",
    titre: "2 · Investissement immobilier",
    action: "relation",
    desc: "Demande de mise en relation avec un partenaire immobilier référencé par PRIVEOS (Denormandie, LMNP, neuf, ancien rénové, SCPI).",
    tags: ["Projet Denormandie", "LMNP", "Neuf", "Ancien rénové", "SCPI"],
  },
  {
    id: "assurance",
    icon: "#i-shield",
    titre: "3 · Assurance",
    action: "module",
    desc: "Accès au module assurance multi-compagnies (Crédit logement, emprunteur, prévoyance, mutuelle, homme clé). Souscription directe via le module connecté.",
    tags: ["Emprunteur immo", "Prêt conso", "Prévoyance pro", "Mutuelle dirigeant", "Homme clé"],
  },
  {
    id: "immatriculation",
    icon: "#i-business",
    titre: "4 · Immatriculation de société",
    action: "relation",
    desc: "Demande de mise en relation avec le partenaire juridique référencé par PRIVEOS pour l'immatriculation de sociétés patrimoniales (SCI, SAS, SARL holding, etc.).",
    tags: ["SCI", "SAS holding", "SARL holding", "SARL famille", "SCEA"],
  },
];

const tagStyle: React.CSSProperties = {
  fontSize: "10.5px",
  padding: "5px 10px",
  background: "var(--ivory)",
  color: "var(--navy)",
  border: "1px solid var(--ivory-deep)",
  borderRadius: "14px",
};

export default function CatalogueClient() {
  const [flash, setFlash] = useState<string | null>(null);

  function notify(message: string) {
    setFlash(message);
    window.clearTimeout((notify as unknown as { _t?: number })._t);
    (notify as unknown as { _t?: number })._t = window.setTimeout(() => setFlash(null), 3200);
  }

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Outils · catalogue produits · consultation</div>
          <h1 className="hero-title">
            Catalogue <strong>produits</strong>
          </h1>
          <p className="hero-sub">
            Catalogue complet des produits référencés au niveau PRIVEOS (licences). Quatre catégories
            accessibles via une mise en relation directe ou un module dédié.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => notify("Export du catalogue produits généré.")}
          >
            Exporter
          </button>
        </div>
      </div>

      {flash && (
        <div
          className="status-pill"
          style={{
            display: "inline-flex",
            marginBottom: "14px",
            background: "var(--ivory)",
            color: "var(--navy)",
            border: "1px solid var(--ivory-deep)",
          }}
        >
          {flash}
        </div>
      )}

      {/* 4 catégories : Financier · Immobilier · Assurance · Immatriculation */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="card" style={{ borderLeft: "4px solid var(--gold)" }}>
            <div
              className="card-header"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div className="card-title">
                <svg>
                  <use href={cat.icon} />
                </svg>
                {cat.titre}
              </div>
              <button
                className="btn btn-gold btn-sm"
                style={{ fontSize: "11px", padding: "7px 14px" }}
                onClick={() =>
                  notify(
                    cat.action === "module"
                      ? `Connexion au module établie pour « ${cat.titre} ».`
                      : `Demande de mise en relation envoyée pour « ${cat.titre} ».`,
                  )
                }
              >
                {cat.action === "module" ? (
                  <svg
                    style={{ width: "13px", height: "13px" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="6" width="18" height="14" rx="2" />
                    <polyline points="3 10 21 10" />
                    <circle cx="12" cy="15" r="2" />
                  </svg>
                ) : (
                  <svg
                    style={{ width: "13px", height: "13px" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 12 H 2 M 12 2 L 22 12 L 12 22" />
                  </svg>
                )}
                {cat.action === "module" ? "Connexion module" : "Mise en relation"}
              </button>
            </div>
            <div className="card-body" style={{ padding: "18px 22px" }}>
              <div
                style={{
                  fontSize: "12.5px",
                  color: "var(--navy)",
                  lineHeight: 1.55,
                  marginBottom: "12px",
                }}
              >
                {cat.desc}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                {cat.tags.map((tag) => (
                  <span key={tag} style={tagStyle}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
