"use client";

import Link from "next/link";
import { useState } from "react";

const PARIS_ETOILE_DETAIL = [
  "Détail Cabinet Paris Étoile · Honoraires de conseil :",
  "",
  "· 14 missions en 2026",
  "  - 8 études patrimoniales (8 200 € en moyenne) : 65 600 €",
  "  - 3 audits transmission : 21 000 €",
  "  - 2 immatriculations société : 4 000 €",
  "  - 1 démembrement notaire : 6 800 €",
  "· Total honoraires : 97 400 €",
  "· Top contributeur : Émilie LAMBERT (6 missions / 48 200 €)",
];

export function HonorairesClient() {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Assets du cabinet · honoraires de conseil</div>
          <h1 className="hero-title">
            Honoraires de <strong>conseil</strong>
          </h1>
          <p className="hero-sub">
            Détail réseau des honoraires perçus directement par les ingénieurs sur les études
            patrimoniales, audits, missions de structuration et immatriculations de société.
            Distribution par ingénieur et type de mission.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="btn btn-ghost btn-sm" href="/espace-dirigeant">
            ← Retour accueil
          </Link>
          <button className="btn btn-gold btn-sm">Exporter</button>
        </div>
      </div>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Études &amp; missions réalisées</div>
          <div className="kpi-value">69</div>
          <div className="kpi-meta">cumul · 2026 · réseau</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Honoraires HT facturés</div>
          <div className="kpi-value">
            595 200 <span className="unit">€</span>
          </div>
          <div className="kpi-meta">total réseau · cumul janv-mai</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Honoraire moyen</div>
          <div className="kpi-value">
            8 627 <span className="unit">€</span>
          </div>
          <div className="kpi-meta">par mission</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Récurrence missions</div>
          <div className="kpi-value gold">
            52 800 <span className="unit">€</span>
          </div>
          <div className="kpi-meta">missions de suivi · cumul</div>
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-business" />
            </svg>
            Classement par ingénieur · honoraires de conseil
          </div>
          <span style={{ fontSize: 11, color: "var(--navy-300)" }}>cumul janv-mai 2026</span>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Cabinet</th>
              <th className="num">Études patrimoniales</th>
              <th className="num">Audits &amp; structurations</th>
              <th className="num">Immatriculations</th>
              <th className="num">Total missions</th>
              <th className="num">Honoraires facturés</th>
              <th>Évolution N-1</th>
            </tr>
          </thead>
          <tbody>
            <tr className="dt-clickable" onClick={() => setDetailOpen(true)}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="tlogo tlogo-sm tlogo-priveos">PE</div>
                  <div className="cell-primary">Cabinet Paris Étoile</div>
                </div>
              </td>
              <td className="num">8</td>
              <td className="num">4</td>
              <td className="num">2</td>
              <td className="num">14</td>
              <td className="num cell-money gold">97 400 €</td>
              <td>
                <span className="up">▲ +28 %</span>
              </td>
            </tr>
            <tr className="dt-clickable">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="tlogo tlogo-sm tlogo-1">LD</div>
                  <div className="cell-primary">Cabinet Lyon Défense</div>
                </div>
              </td>
              <td className="num">7</td>
              <td className="num">3</td>
              <td className="num">1</td>
              <td className="num">11</td>
              <td className="num cell-money gold">76 200 €</td>
              <td>
                <span className="up">▲ +20 %</span>
              </td>
            </tr>
            <tr className="dt-clickable">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="tlogo tlogo-sm tlogo-2">PV</div>
                  <div className="cell-primary">Cabinet Paris Vendôme</div>
                </div>
              </td>
              <td className="num">6</td>
              <td className="num">2</td>
              <td className="num">2</td>
              <td className="num">10</td>
              <td className="num cell-money gold">68 400 €</td>
              <td>
                <span className="up">▲ +14 %</span>
              </td>
            </tr>
            <tr className="dt-clickable">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="tlogo tlogo-sm tlogo-3">BC</div>
                  <div className="cell-primary">Cabinet Bordeaux Centre</div>
                </div>
              </td>
              <td className="num">5</td>
              <td className="num">2</td>
              <td className="num">1</td>
              <td className="num">8</td>
              <td className="num cell-money gold">52 800 €</td>
              <td>
                <span className="up">▲ +12 %</span>
              </td>
            </tr>
            <tr className="dt-clickable">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div className="tlogo tlogo-sm tlogo-pro">SO</div>
                  <div className="cell-primary">Cabinet Strasbourg Orangerie</div>
                </div>
              </td>
              <td className="num">4</td>
              <td className="num">2</td>
              <td className="num">1</td>
              <td className="num">7</td>
              <td className="num cell-money gold">42 600 €</td>
              <td>
                <span className="up">▲ +9 %</span>
              </td>
            </tr>
            <tr style={{ background: "var(--ivory)" }}>
              <td
                colSpan={7}
                style={{
                  textAlign: "center",
                  fontSize: 11.5,
                  color: "var(--navy-300)",
                  padding: 14,
                }}
              >
                … 25 autres cabinets ·{" "}
                <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                  Voir tous (30)
                </a>
              </td>
            </tr>
            <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
              <td>
                <strong>Total réseau</strong>
              </td>
              <td className="num">42</td>
              <td className="num">17</td>
              <td className="num">10</td>
              <td className="num">69</td>
              <td className="num cell-money">595 200 €</td>
              <td>
                <span className="up">▲ +18 %</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Répartition par type */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-doc" />
            </svg>
            Répartition par type de mission · réseau
          </div>
        </div>
        <table className="dt" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th>Mission</th>
              <th>Type</th>
              <th className="num">Réalisées 2026</th>
              <th className="num">Tarif moyen</th>
              <th className="num">Honoraires totaux</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Étude patrimoniale globale</strong>
              </td>
              <td>Conseil patrimonial</td>
              <td className="num cell-money gold">42</td>
              <td className="num cell-money">8 200 €</td>
              <td className="num cell-money">344 400 €</td>
            </tr>
            <tr>
              <td>
                <strong>Audit transmission</strong>
              </td>
              <td>Conseil transmission</td>
              <td className="num">14</td>
              <td className="num cell-money">7 000 €</td>
              <td className="num cell-money">98 000 €</td>
            </tr>
            <tr>
              <td>
                <strong>Démembrement avec notaire</strong>
              </td>
              <td>Conseil structuration</td>
              <td className="num">9</td>
              <td className="num cell-money">6 800 €</td>
              <td className="num cell-money">61 200 €</td>
            </tr>
            <tr>
              <td>
                <strong>Optimisation IFI</strong>
              </td>
              <td>Conseil fiscal</td>
              <td className="num">6</td>
              <td className="num cell-money">5 600 €</td>
              <td className="num cell-money">33 600 €</td>
            </tr>
            <tr>
              <td>
                <strong>Immatriculation de société</strong>
              </td>
              <td>Création + statuts + formalisme</td>
              <td className="num">10</td>
              <td className="num cell-money">2 000 €</td>
              <td className="num cell-money">20 000 €</td>
            </tr>
            <tr>
              <td>
                <strong>Pacte d&apos;associés</strong>
              </td>
              <td>Rédaction pacte</td>
              <td className="num">8</td>
              <td className="num cell-money">1 200 €</td>
              <td className="num cell-money">9 600 €</td>
            </tr>
          </tbody>
        </table>
      </div>

      {detailOpen && (
        <div
          onClick={() => setDetailOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 45, 80, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 12,
              maxWidth: 480,
              width: "100%",
              padding: 24,
              boxShadow: "0 24px 64px rgba(16, 45, 80, 0.25)",
              border: "1px solid var(--navy-100)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div className="tlogo tlogo-sm tlogo-priveos">PE</div>
              <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: 15 }}>
                Cabinet Paris Étoile
              </div>
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--navy)",
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {PARIS_ETOILE_DETAIL.join("\n")}
            </div>
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetailOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
