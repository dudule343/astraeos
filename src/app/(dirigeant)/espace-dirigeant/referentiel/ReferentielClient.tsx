"use client";

import { useState } from "react";

// Toggle réutilisable fidèle aux switches de la maquette (différentes tailles selon l'emplacement).
function Toggle({
  on,
  onChange,
  size = "md",
}: {
  on: boolean;
  onChange: () => void;
  size?: "lg" | "md" | "sm";
}) {
  const dims =
    size === "lg"
      ? { w: 42, h: 22, knob: 16, radius: 22, left: 23, leftOff: 3, bottom: 3 }
      : size === "md"
        ? { w: 32, h: 18, knob: 12, radius: 18, left: 17, leftOff: 3, bottom: 3 }
        : { w: 30, h: 16, knob: 10, radius: 16, left: 17, leftOff: 3, bottom: 3 };

  return (
    <label
      style={{
        position: "relative",
        display: "inline-block",
        width: dims.w,
        height: dims.h,
        margin: 0,
      }}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={onChange}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span
        style={{
          position: "absolute",
          cursor: "pointer",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: on ? "var(--gold)" : "var(--navy-100)",
          borderRadius: dims.radius,
          transition: "0.2s",
        }}
      />
      <span
        style={{
          position: "absolute",
          height: dims.knob,
          width: dims.knob,
          left: on ? dims.left : dims.leftOff,
          bottom: dims.bottom,
          background: "white",
          borderRadius: "50%",
          transition: "0.2s",
        }}
      />
    </label>
  );
}

const TEMPLATES = [
  {
    title: "Document d'entrée en relation",
    desc: "Modèle conforme ORIAS · CIF · IAS, à signer par le client lors du 1er rendez-vous.",
  },
  {
    title: "KYC · Know Your Customer",
    desc: "Formulaire LCB-FT, identification complète + justificatifs.",
  },
  {
    title: "Questionnaire de qualification",
    desc: "Profil patrimonial · objectifs · horizon · tolérance risque.",
  },
  {
    title: "Lettre de mission",
    desc: "Cadre contractuel de l'étude · objet · honoraires · délais.",
  },
  {
    title: "Étude patrimoniale anonymisée",
    desc: "Modèle d'étude type · structure · diagnostic · préconisations.",
  },
  {
    title: "Dossier client anonymisé",
    desc: "Dossier complet anonymisé pour formation et exemple type.",
  },
];

const SUGGESTIONS = ["Process onboarding client", "Modèle KYC", "Lettre de mission"];

export function ReferentielClient() {
  const [online, setOnline] = useState(true);
  const [iaShared, setIaShared] = useState(true);
  const [manuelShared, setManuelShared] = useState(true);
  const [contratShared, setContratShared] = useState(true);
  const [biblioShared, setBiblioShared] = useState(true);
  const [query, setQuery] = useState("");

  const sharedPill = (on: boolean) => (on ? "OUI" : "NON");

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Référentiel · méthode &amp; ressources pour mes ingénieurs</div>
          <h1 className="hero-title">
            Process &amp; <strong>méthodologie</strong>
          </h1>
          <p className="hero-sub">
            Référentiel opérationnel du Cabinet Paris Étoile : zone IA pour interrogation
            contextuelle, manuel opératoire, contrat-cadre licenciés, bibliothèque de modèles
            documentaires, éléments de communication.
          </p>
        </div>
        <div
          className="hero-actions"
          style={{ flexDirection: "column", alignItems: "flex-end", gap: 10 }}
        >
          {/* Toggle GLOBAL : mettre en ligne / ne pas mettre en ligne pour les licenciés */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "white",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--navy-100)",
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--navy)" }}>
              Mettre le référentiel en ligne
            </span>
            <Toggle on={online} onChange={() => setOnline((v) => !v)} size="lg" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: online ? "var(--gold)" : "var(--navy-300)",
              }}
            >
              {online ? "EN LIGNE" : "HORS LIGNE"}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm">Mettre à jour</button>
        </div>
      </div>

      {/* Zone IA */}
      <div
        className="card mb-24"
        style={{
          borderLeft: "4px solid var(--gold)",
          background: "linear-gradient(135deg, var(--ivory) 0%, white 60%)",
          position: "relative",
        }}
      >
        {/* Toggle accessible licenciés (haut droite) */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 18,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "white",
            padding: "6px 10px",
            borderRadius: 20,
            border: "1px solid var(--gold-200)",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--navy)" }}>
            À mettre à disposition des licenciés
          </span>
          <Toggle on={iaShared} onChange={() => setIaShared((v) => !v)} size="md" />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: iaShared ? "var(--gold)" : "var(--navy-300)",
            }}
          >
            {sharedPill(iaShared)}
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
            <div
              style={{
                width: 52,
                height: 52,
                background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              <svg
                style={{ width: 26, height: 26 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2 L 13.5 8.5 L 20 10 L 13.5 11.5 L 12 18 L 10.5 11.5 L 4 10 L 10.5 8.5 Z" />
                <circle cx="12" cy="10" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="kpi-label" style={{ marginBottom: 4 }}>
                Assistant IA · méthodologie
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--navy)",
                  marginBottom: 8,
                }}
              >
                Interrogez le référentiel PRIVEOS
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--navy-300)",
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                L&apos;IA est entraînée sur l&apos;ensemble du référentiel : process, contrat
                licenciés, bibliothèque, FAQ. Posez vos questions en langage naturel, obtenez la
                réponse contextualisée et le lien vers le document source.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Comment rédiger un pacte d'associés selon le process PRIVEOS ?"
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "1px solid var(--navy-100)",
                    borderRadius: 8,
                    fontFamily: "inherit",
                    fontSize: 13,
                  }}
                />
                <button className="btn btn-gold">Demander à l&apos;IA</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--navy-300)",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  Suggestions :
                </span>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: "3px 10px", fontSize: 10.5 }}
                    onClick={() => setQuery(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manuel opératoire + Contrat */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-doc" />
              </svg>
              Manuel opératoire
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "white",
                padding: "5px 10px",
                borderRadius: 18,
                border: "1px solid var(--gold-200)",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--navy)" }}>
                Accessible licenciés
              </span>
              <Toggle on={manuelShared} onChange={() => setManuelShared((v) => !v)} size="sm" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: manuelShared ? "var(--gold)" : "var(--navy-300)",
                }}
              >
                {sharedPill(manuelShared)}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div
              style={{
                fontSize: 12.5,
                color: "var(--navy-300)",
                lineHeight: 1.6,
                marginBottom: 14,
              }}
            >
              Document maître décrivant l&apos;ensemble des process opérationnels du Cabinet Paris
              Étoile · 168 pages · mis à jour le 24 avril 2026.
            </div>
            <div style={{ display: "grid", gap: 6, fontSize: 12 }}>
              {[
                "Section 1 · Onboarding client (étapes 01 → 03)",
                "Section 2 · Étude patrimoniale (étape 04)",
                "Section 3 · Restitution & signature (étape 05)",
                "Section 4 · Suivi récurrent (étape 06)",
              ].map((label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "var(--ivory)",
                    borderRadius: 5,
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>Voir →</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                Aperçu
              </button>
              <button className="btn btn-gold btn-sm" style={{ flex: 1 }}>
                Télécharger
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-doc" />
              </svg>
              Contrat-cadre licenciés · licence de marque
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "white",
                padding: "5px 10px",
                borderRadius: 18,
                border: "1px solid var(--gold-200)",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--navy)" }}>
                Accessible licenciés
              </span>
              <Toggle on={contratShared} onChange={() => setContratShared((v) => !v)} size="sm" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: contratShared ? "var(--gold)" : "var(--navy-300)",
                }}
              >
                {sharedPill(contratShared)}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div
              style={{
                fontSize: 12.5,
                color: "var(--navy-300)",
                lineHeight: 1.6,
                marginBottom: 14,
              }}
            >
              Au moment de la souscription, un seul modèle est utilisé :{" "}
              <strong style={{ color: "var(--navy)" }}>licence de marque</strong>. Inclut les
              documents pré-contractuels obligatoires.
            </div>
            <div style={{ display: "grid", gap: 6, fontSize: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--gold-100)",
                  borderRadius: 5,
                  borderLeft: "3px solid var(--gold)",
                }}
              >
                <span>
                  <strong style={{ color: "var(--gold-deep)" }}>Licence de marque</strong> · contrat
                  unique · 5 ingénieurs
                </span>
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>v3.1 →</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--ivory)",
                  borderRadius: 5,
                }}
              >
                <span>Document d&apos;Information Précontractuelle (DIP)</span>
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>Voir →</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--ivory)",
                  borderRadius: 5,
                }}
              >
                <span>État général du marché</span>
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>Voir →</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                Aperçu
              </button>
              <button className="btn btn-gold btn-sm" style={{ flex: 1 }}>
                Voir tous les contrats signés
              </button>
            </div>
            <div
              style={{
                marginTop: 10,
                padding: "8px 10px",
                background: "var(--ivory)",
                borderRadius: 5,
                fontSize: 10.5,
                color: "var(--navy-300)",
                lineHeight: 1.5,
              }}
            >
              <em>
                Note : à l&apos;avenir, des modèles franchise / mandataire pourront s&apos;ajouter
                selon l&apos;évolution juridique du réseau.
              </em>
            </div>
          </div>
        </div>
      </div>

      {/* Bibliothèque de modèles */}
      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-marketplace" />
            </svg>
            Bibliothèque de modèles documentaires
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "white",
              padding: "5px 10px",
              borderRadius: 18,
              border: "1px solid var(--gold-200)",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--navy)" }}>
              Accessible licenciés
            </span>
            <Toggle on={biblioShared} onChange={() => setBiblioShared((v) => !v)} size="sm" />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: biblioShared ? "var(--gold)" : "var(--navy-300)",
              }}
            >
              {sharedPill(biblioShared)}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {TEMPLATES.map((t) => (
              <div
                key={t.title}
                style={{
                  background: "var(--ivory)",
                  border: "1px solid var(--gold-200)",
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: "var(--gold-100)",
                      borderRadius: 6,
                      display: "grid",
                      placeItems: "center",
                      color: "var(--gold)",
                    }}
                  >
                    <svg style={{ width: 16, height: 16 }}>
                      <use href="#i-doc" />
                    </svg>
                  </div>
                  <strong style={{ fontSize: 13 }}>{t.title}</strong>
                </div>
                <div style={{ fontSize: 11, color: "var(--navy-300)", lineHeight: 1.5 }}>
                  {t.desc}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 10.5 }}>
                    Aperçu
                  </button>
                  <button className="btn btn-gold btn-sm" style={{ fontSize: 10.5 }}>
                    Télécharger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Éléments de communication */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-comms" />
            </svg>
            Éléments de communication
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <div
              style={{
                background: "var(--navy)",
                color: "white",
                borderRadius: 8,
                padding: 18,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                PRIVEOS
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  color: "var(--gold-300)",
                  letterSpacing: "0.18em",
                  marginTop: 4,
                }}
              >
                Logo principal
              </div>
              <button className="btn btn-gold btn-sm" style={{ marginTop: 10, width: "100%" }}>
                Télécharger
              </button>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid var(--gold-200)",
                color: "var(--navy)",
                borderRadius: 8,
                padding: 18,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--gold)",
                }}
              >
                PRIVEOS
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  color: "var(--navy-300)",
                  letterSpacing: "0.18em",
                  marginTop: 4,
                }}
              >
                Logo doré sur blanc
              </div>
              <button className="btn btn-gold btn-sm" style={{ marginTop: 10, width: "100%" }}>
                Télécharger
              </button>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, var(--navy), var(--navy-deep))",
                color: "white",
                borderRadius: 8,
                padding: 18,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 80,
                  height: 80,
                  background: "radial-gradient(circle, var(--gold), transparent)",
                  opacity: 0.3,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold-300)" }}>
                FOND D&apos;ÉCRAN
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Présentation</div>
              <button className="btn btn-gold btn-sm" style={{ marginTop: 10, width: "100%" }}>
                Télécharger
              </button>
            </div>
            <div
              style={{
                background: "var(--ivory)",
                border: "1px solid var(--gold-200)",
                color: "var(--navy)",
                borderRadius: 8,
                padding: 18,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)" }}>
                CHARTE GRAPHIQUE
              </div>
              <div style={{ fontSize: 13, color: "var(--navy)", marginTop: 4 }}>PDF · 24 pages</div>
              <button className="btn btn-gold btn-sm" style={{ marginTop: 10, width: "100%" }}>
                Télécharger
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
