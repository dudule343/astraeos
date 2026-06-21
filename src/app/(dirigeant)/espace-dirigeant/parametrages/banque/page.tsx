// Espace dirigeant — Paramétrages · Connexions bancaires.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 8611-8771). Route : /espace-dirigeant/parametrages/banque
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { FactModeClient } from "./FactModeClient";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Connexions bancaires",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Connexions bancaires" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">
              Administration · paramétrages cabinet · 2/8
            </div>
            <h1 className="hero-title">
              Connexions bancaires &amp; <strong>financières</strong>
            </h1>
            <p className="hero-sub">
              Compte bancaire principal Qonto qui alimente automatiquement la
              trésorerie du réseau, le compte de résultat et l&apos;ensemble
              financier consolidé. Configuration des IBAN de facturation,
              conditions de règlement et comptes secondaires éventuels.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm">Annuler</button>
            <button className="btn btn-gold btn-sm">
              Enregistrer les modifications
            </button>
          </div>
        </div>

        {/* Bloc Qonto principal */}
        <div
          className="card mb-18"
          style={{
            background:
              "linear-gradient(135deg, white 0%, var(--ivory) 100%)",
            borderLeft: "4px solid var(--gold)",
          }}
        >
          <div className="card-body" style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  flexShrink: 0,
                  background: "var(--ivory)",
                  border: "1.5px solid var(--gold)",
                  borderRadius: "14px",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--navy)",
                  position: "relative",
                }}
              >
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "42px", height: "42px" }}
                >
                  <path d="M3 12 L 16 4 L 29 12" strokeWidth="1.8" />
                  <line x1="2" y1="12" x2="30" y2="12" strokeWidth="1.8" />
                  <line x1="6" y1="14" x2="6" y2="24" strokeWidth="1.6" />
                  <line
                    x1="11.5"
                    y1="14"
                    x2="11.5"
                    y2="24"
                    strokeWidth="1.6"
                  />
                  <line
                    x1="20.5"
                    y1="14"
                    x2="20.5"
                    y2="24"
                    strokeWidth="1.6"
                  />
                  <line x1="26" y1="14" x2="26" y2="24" strokeWidth="1.6" />
                  <line x1="3" y1="26" x2="29" y2="26" strokeWidth="1.8" />
                  <line x1="2" y1="28" x2="30" y2="28" strokeWidth="1.8" />
                  <circle
                    cx="16"
                    cy="9.5"
                    r="0.8"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    width: "22px",
                    height: "22px",
                    background: "#2EA85A",
                    border: "2px solid white",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ width: "10px", height: "10px" }}
                  >
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    className="badge badge-success"
                    style={{ fontSize: "9.5px" }}
                  >
                    Compte Qonto connecté
                  </span>
                  <span
                    style={{ fontSize: "10.5px", color: "var(--navy-300)" }}
                  >
                    ·
                  </span>
                  <span
                    style={{ fontSize: "10.5px", color: "var(--navy-300)" }}
                  >
                    Connecté depuis le{" "}
                    <strong style={{ color: "var(--navy)" }}>
                      12/01/2024
                    </strong>
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginBottom: "6px",
                  }}
                >
                  Compte principal · Qonto
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--navy-300)",
                    lineHeight: 1.55,
                  }}
                >
                  Ce compte alimente automatiquement{" "}
                  <strong style={{ color: "var(--navy)" }}>
                    le compte de résultat réseau
                  </strong>
                  ,{" "}
                  <strong style={{ color: "var(--navy)" }}>
                    la page Trésorerie
                  </strong>{" "}
                  et{" "}
                  <strong style={{ color: "var(--navy)" }}>
                    l&apos;ensemble financier consolidé
                  </strong>{" "}
                  (CA réalisé, encaissements, dépenses).
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: "10.5px",
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}
                >
                  Solde temps réel
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--gold)",
                    fontFamily: "'Epilogue',sans-serif",
                  }}
                >
                  360 000 €
                </div>
                <div
                  style={{
                    fontSize: "10.5px",
                    color: "var(--navy-300)",
                    marginTop: "2px",
                  }}
                >
                  au 09/05/2026 · 11h47
                </div>
              </div>
            </div>

            {/* Détails compte */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--navy-100)",
                }}
              >
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  IBAN
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                    fontFamily: "monospace",
                  }}
                >
                  FR76 1660 8000 0112 3456 7890 142
                </div>
              </div>
              <div
                style={{
                  background: "white",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--navy-100)",
                }}
              >
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  BIC
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                    fontFamily: "monospace",
                  }}
                >
                  QNTOFRP1XXX
                </div>
              </div>
              <div
                style={{
                  background: "white",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--navy-100)",
                }}
              >
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Transactions importées
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                  }}
                >
                  312{" "}
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "var(--navy-300)",
                    }}
                  >
                    (jan-mai 2026)
                  </span>
                </div>
              </div>
              <div
                style={{
                  background: "white",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--navy-100)",
                }}
              >
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Dernière synchro
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginTop: "4px",
                  }}
                >
                  09/05/2026 · 11h47
                </div>
                <div
                  style={{
                    fontSize: "9.5px",
                    color: "#2EA85A",
                    fontWeight: 700,
                    marginTop: "2px",
                  }}
                >
                  ● Synchro auto active
                </div>
              </div>
            </div>

            {/* Boutons actions */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="btn btn-gold btn-sm">
                Voir les transactions
              </button>
              <button className="btn btn-ghost btn-sm">
                Forcer une synchronisation
              </button>
              <button className="btn btn-ghost btn-sm">
                Modifier les règles de catégorisation
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--orange-text)", marginLeft: "auto" }}
              >
                Déconnecter le compte
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          {/* Bloc IBAN de facturation */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-finance" />
                </svg>
                IBAN de facturation
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--navy-300)",
                  fontStyle: "italic",
                }}
              >
                affiché sur les factures
              </span>
            </div>
            <div className="card-body" style={{ padding: "20px 22px" }}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  IBAN principal · facturation
                </label>
                <input
                  type="text"
                  defaultValue="FR76 1660 8000 0112 3456 7890 142"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid var(--navy-100)",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "var(--navy)",
                    background: "white",
                  }}
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  BIC
                </label>
                <input
                  type="text"
                  defaultValue="QNTOFRP1XXX"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid var(--navy-100)",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "var(--navy)",
                    background: "white",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Banque
                </label>
                <input
                  type="text"
                  defaultValue="Qonto · 18 rue de Navarin, 75009 Paris"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid var(--navy-100)",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    color: "var(--navy)",
                    background: "white",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bloc Conditions de règlement */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-doc" />
                </svg>
                Conditions de règlement
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--navy-300)",
                  fontStyle: "italic",
                }}
              >
                délais standards
              </span>
            </div>
            <div className="card-body" style={{ padding: "20px 22px" }}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Délai standard de règlement
                </label>
                <select
                  defaultValue="30 jours fin de mois"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid var(--navy-100)",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    color: "var(--navy)",
                    background: "white",
                  }}
                >
                  <option>30 jours fin de mois</option>
                  <option>30 jours date facture</option>
                  <option>45 jours fin de mois</option>
                  <option>À réception</option>
                  <option>Comptant</option>
                </select>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Mode de facturation
                </label>
                <FactModeClient />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Pénalités de retard
                </label>
                <input
                  type="text"
                  defaultValue="3 × taux d'intérêt légal"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid var(--navy-100)",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    color: "var(--navy)",
                    background: "white",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comptes secondaires éventuels */}
        <div className="card" style={{ marginTop: "18px" }}>
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-finance" />
              </svg>
              Comptes secondaires
            </div>
            <button className="btn btn-ghost btn-sm">
              + Ajouter un compte
            </button>
          </div>
          <div className="card-body" style={{ padding: "20px 22px" }}>
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                color: "var(--navy-300)",
                fontSize: "12px",
                fontStyle: "italic",
              }}
            >
              Aucun compte secondaire configuré · Le compte Qonto principal est
              suffisant pour le réseau.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
