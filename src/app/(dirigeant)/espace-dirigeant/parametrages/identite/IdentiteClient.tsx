"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useEffect, useState } from "react";

export function IdentiteClient() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const fire = (msg: string) => () => setToast(msg);

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Identité de marque · cohérence visuelle</div>
          <h1 className="hero-title">
            Charte &amp; <strong>templates</strong>
          </h1>
          <p className="hero-sub">
            Référentiel d&apos;identité visuelle ASTRAEOS · logos, typographies, palettes,
            templates email, présentations, bannières. Tous les assets brandés disponibles pour le
            réseau.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={fire("Préparation du pack complet d'assets ASTRAEOS…")}
          >
            Télécharger pack complet
          </button>
        </div>
      </div>

      {/* Logos */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-marketplace" />
            </svg>
            Logos ASTRAEOS
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            <div
              style={{
                background: "var(--navy)",
                color: "white",
                borderRadius: "8px",
                padding: "32px 18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                ASTRAEOS
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: "var(--gold-300)",
                  letterSpacing: "0.18em",
                  marginTop: "6px",
                }}
              >
                SUR FOND NAVY
              </div>
              <button
                className="btn btn-gold btn-sm"
                style={{ marginTop: "14px", width: "100%" }}
                onClick={fire("Téléchargement du logo ASTRAEOS · sur fond navy (PNG · SVG)")}
              >
                PNG · SVG
              </button>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid var(--gold-200)",
                borderRadius: "8px",
                padding: "32px 18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "var(--gold)",
                  letterSpacing: "0.04em",
                }}
              >
                ASTRAEOS
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: "var(--navy-300)",
                  letterSpacing: "0.18em",
                  marginTop: "6px",
                }}
              >
                DORÉ SUR BLANC
              </div>
              <button
                className="btn btn-gold btn-sm"
                style={{ marginTop: "14px", width: "100%" }}
                onClick={fire("Téléchargement du logo ASTRAEOS · doré sur blanc (PNG · SVG)")}
              >
                PNG · SVG
              </button>
            </div>
            <div
              style={{
                background: "var(--ivory)",
                borderRadius: "8px",
                padding: "32px 18px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "var(--navy)",
                  letterSpacing: "0.04em",
                }}
              >
                ASTRAEOS
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: "var(--navy-300)",
                  letterSpacing: "0.18em",
                  marginTop: "6px",
                }}
              >
                NAVY SUR IVORY
              </div>
              <button
                className="btn btn-gold btn-sm"
                style={{ marginTop: "14px", width: "100%" }}
                onClick={fire("Téléchargement du logo ASTRAEOS · navy sur ivory (PNG · SVG)")}
              >
                PNG · SVG
              </button>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, var(--navy), var(--navy-deep))",
                color: "white",
                borderRadius: "8px",
                padding: "32px 18px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-30px",
                  right: "-30px",
                  width: "80px",
                  height: "80px",
                  background: "radial-gradient(circle, var(--gold), transparent)",
                  opacity: 0.4,
                }}
              ></div>
              <div
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "24px",
                  fontWeight: 600,
                }}
              >
                ASTRAEOS
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: "var(--gold-300)",
                  letterSpacing: "0.18em",
                  marginTop: "6px",
                }}
              >
                VARIATION GRADIENT
              </div>
              <button
                className="btn btn-gold btn-sm"
                style={{ marginTop: "14px", width: "100%" }}
                onClick={fire("Téléchargement du logo ASTRAEOS · variation gradient (PNG · SVG)")}
              >
                PNG · SVG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Palette + Typo */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-marketplace" />
              </svg>
              Palette de couleurs
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              <div
                style={{
                  background: "var(--navy)",
                  color: "white",
                  padding: "18px 14px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700 }}>Navy</div>
                <div style={{ fontSize: "10px", color: "var(--gold-300)", marginTop: "2px" }}>
                  #102D50
                </div>
              </div>
              <div
                style={{
                  background: "var(--gold)",
                  color: "white",
                  padding: "18px 14px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700 }}>Gold</div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.8)",
                    marginTop: "2px",
                  }}
                >
                  #C68E0E
                </div>
              </div>
              <div
                style={{
                  background: "var(--light-blue)",
                  color: "var(--navy)",
                  padding: "18px 14px",
                  borderRadius: "6px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700 }}>Light Blue</div>
                <div style={{ fontSize: "10px", marginTop: "2px" }}>#EBF1FA</div>
              </div>
              <div
                style={{
                  background: "var(--ivory)",
                  color: "var(--navy)",
                  padding: "18px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--navy-100)",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700 }}>Ivory</div>
                <div style={{ fontSize: "10px", marginTop: "2px" }}>#FAF8F3</div>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-doc" />
              </svg>
              Typographies
            </div>
          </div>
          <div className="card-body">
            <div
              style={{
                marginBottom: "14px",
                padding: "14px",
                background: "var(--ivory)",
                borderRadius: "6px",
              }}
            >
              <div className="kpi-label">Display · titres</div>
              <div
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "var(--navy)",
                  marginTop: "6px",
                }}
              >
                Cormorant Garamond
              </div>
              <div style={{ fontSize: "11px", color: "var(--navy-300)", marginTop: "2px" }}>
                Pour les grands titres uniquement (h1)
              </div>
            </div>
            <div
              style={{
                marginBottom: "14px",
                padding: "14px",
                background: "var(--ivory)",
                borderRadius: "6px",
              }}
            >
              <div className="kpi-label">UI · interface</div>
              <div
                style={{
                  fontFamily: "'Epilogue', sans-serif",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--navy)",
                  marginTop: "6px",
                }}
              >
                Epilogue
              </div>
              <div style={{ fontSize: "11px", color: "var(--navy-300)", marginTop: "2px" }}>
                Pour toute l&apos;interface, chiffres, KPIs
              </div>
            </div>
            <div style={{ padding: "14px", background: "var(--ivory)", borderRadius: "6px" }}>
              <div className="kpi-label">Body · documents</div>
              <div
                style={{
                  fontFamily: "'Calibri', sans-serif",
                  fontSize: "14px",
                  color: "var(--navy)",
                  marginTop: "6px",
                }}
              >
                Calibri (corps de texte)
              </div>
              <div style={{ fontSize: "11px", color: "var(--navy-300)", marginTop: "2px" }}>
                Pour PDF, Word, présentations longues
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-marketplace" />
            </svg>
            Templates &amp; bannières
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div
              style={{
                background: "white",
                border: "1px solid var(--gold-200)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  height: "80px",
                  background: "linear-gradient(135deg, var(--navy), var(--navy-deep))",
                  borderRadius: "4px",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "18px",
                  marginBottom: "10px",
                }}
              >
                Newsletter ASTRAEOS
              </div>
              <strong style={{ fontSize: "13px" }}>Email mensuel</strong>
              <div style={{ fontSize: "11px", color: "var(--navy-300)", marginTop: "4px" }}>
                Template HTML responsive
              </div>
              <button
                className="btn btn-gold btn-sm"
                style={{ width: "100%", marginTop: "10px" }}
                onClick={fire("Ouverture du template Email mensuel (HTML responsive)")}
              >
                Utiliser
              </button>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid var(--gold-200)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  height: "80px",
                  background: "var(--ivory)",
                  border: "1px solid var(--gold-200)",
                  borderRadius: "4px",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--gold)",
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "18px",
                  marginBottom: "10px",
                }}
              >
                Étude restituée
              </div>
              <strong style={{ fontSize: "13px" }}>PowerPoint étude</strong>
              <div style={{ fontSize: "11px", color: "var(--navy-300)", marginTop: "4px" }}>
                Master slide ASTRAEOS · 24 slides
              </div>
              <button
                className="btn btn-gold btn-sm"
                style={{ width: "100%", marginTop: "10px" }}
                onClick={fire("Ouverture du master slide PowerPoint étude (24 slides)")}
              >
                Utiliser
              </button>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid var(--gold-200)",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  height: "80px",
                  background: "linear-gradient(135deg, var(--gold-200), var(--ivory))",
                  borderRadius: "4px",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--navy)",
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "18px",
                  marginBottom: "10px",
                }}
              >
                Plaquette
              </div>
              <strong style={{ fontSize: "13px" }}>Plaquette commerciale</strong>
              <div style={{ fontSize: "11px", color: "var(--navy-300)", marginTop: "4px" }}>
                A4 · 4 pages · présentation cabinet
              </div>
              <button
                className="btn btn-gold btn-sm"
                style={{ width: "100%", marginTop: "10px" }}
                onClick={fire("Ouverture de la plaquette commerciale (A4 · 4 pages)")}
              >
                Utiliser
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--navy)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: 600,
            boxShadow: "0 12px 32px rgba(16,45,80,0.32)",
            zIndex: 60,
            border: "1px solid var(--gold-300)",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
