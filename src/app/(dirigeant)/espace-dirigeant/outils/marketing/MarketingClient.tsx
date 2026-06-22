"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useState } from "react";

type Campaign = {
  id: string;
  name: string;
  target: string;
  channel: { label: string; className: string; style?: React.CSSProperties };
  budget: string;
  spent: string;
  leads: string;
  roi: string;
  status: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "transmission-50",
    name: "Transmission patrimoniale 50+",
    target: "Cible CSP+ Paris/IDF · campagne search",
    channel: { label: "Google", className: "badge badge-gold", style: { fontSize: "10px" } },
    budget: "3 600 €",
    spent: "2 180 €",
    leads: "8",
    roi: "5,2 x",
    status: "Active",
  },
  {
    id: "conseil-tpe",
    name: "Conseil dirigeants TPE/PME",
    target: "Posts sponsorisés + InMail",
    channel: {
      label: "LinkedIn",
      className: "badge",
      style: { background: "var(--light-blue)", color: "var(--navy)", fontSize: "10px" },
    },
    budget: "2 400 €",
    spent: "1 820 €",
    leads: "6",
    roi: "3,8 x",
    status: "Active",
  },
  {
    id: "familles-aisees",
    name: "Patrimoine pour familles aisées",
    target: "Cible CSP+ 35-55 ans · Facebook/Instagram",
    channel: {
      label: "Meta",
      className: "badge",
      style: { background: "var(--gold-100)", color: "var(--gold-deep)", fontSize: "10px" },
    },
    budget: "1 800 €",
    spent: "920 €",
    leads: "4",
    roi: "3,2 x",
    status: "Active",
  },
];

export function MarketingClient() {
  const [selected, setSelected] = useState<Campaign | null>(null);

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Outils · bibliothèque marketing · pilotage local</div>
          <h1 className="hero-title">
            Bibliothèque <strong>marketing</strong>
          </h1>
          <p className="hero-sub">
            Pilotage des actions marketing du cabinet · canaux d&apos;acquisition, budgets
            publicitaires, retour sur investissement et campagnes en cours. À compléter au fil des
            campagnes lancées.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="btn btn-gold btn-sm"
            onClick={() => alert("Création d'une nouvelle publicité (à compléter au fil des campagnes lancées).")}
          >
            <svg>
              <use href="#i-new" />
            </svg>
            Nouvelle publicité
          </button>
        </div>
      </div>

      {/* 4 KPIs principaux */}
      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Canaux d&apos;acquisition</div>
          <div className="kpi-value">4</div>
          <div className="kpi-meta">Site internet · LinkedIn · Meta · Google</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Budget pub · cumul 2026</div>
          <div className="kpi-value">
            18 400 <span className="unit">€</span>
          </div>
          <div className="kpi-meta">cumul depuis janvier</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">ROI global</div>
          <div className="kpi-value gold">
            4,2 <span className="unit">x</span>
          </div>
          <div className="kpi-meta">CA généré / budget engagé</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Publicités en cours</div>
          <div className="kpi-value">3</div>
          <div className="kpi-meta">campagnes actives</div>
        </div>
      </div>

      {/* Tableau publicités en cours */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-comms" />
            </svg>
            Publicités en cours
          </div>
          <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>3 campagnes actives</span>
        </div>
        <table className="dt" style={{ fontSize: "12.5px" }}>
          <thead>
            <tr>
              <th>Campagne</th>
              <th>Canal</th>
              <th className="num">Budget alloué</th>
              <th className="num">Dépensé</th>
              <th className="num">Leads</th>
              <th className="num">ROI estimé</th>
              <th>Statut</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((c) => (
              <tr key={c.id} className="dt-clickable" onClick={() => setSelected(c)}>
                <td>
                  <div className="cell-primary">{c.name}</div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>{c.target}</div>
                </td>
                <td>
                  <span className={c.channel.className} style={c.channel.style}>
                    {c.channel.label}
                  </span>
                </td>
                <td className="num cell-money">{c.budget}</td>
                <td className="num cell-money">{c.spent}</td>
                <td className="num">{c.leads}</td>
                <td className="num cell-money gold">{c.roi}</td>
                <td>
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>
                    {c.status}
                  </span>
                </td>
                <td className="center">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(c);
                    }}
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bandeau d'information */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--ivory) 0%, var(--gold-100) 100%)",
          border: "1px solid var(--gold-200)",
        }}
      >
        <div className="card-body" style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "24px" }}>ℹ</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                Page en cours de structuration
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  marginTop: "4px",
                  lineHeight: 1.6,
                }}
              >
                Cette page sera enrichie au fil des campagnes lancées par le cabinet. Les contenus
                marketing partagés par ASTRAEOS (templates, plaquettes, articles, vidéos) restent
                accessibles via le module Templates &amp; communication.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer détail campagne */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            zIndex: 200,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "420px",
              maxWidth: "90vw",
              height: "100%",
              background: "var(--white, #fff)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.18)",
              padding: "24px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <div className="hero-eyebrow">Détail campagne</div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy)", margin: "4px 0 0" }}>
                  {selected.name}
                </h2>
                <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "4px" }}>
                  {selected.target}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>
                Fermer
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
              <span className={selected.channel.className} style={selected.channel.style}>
                {selected.channel.label}
              </span>
              <span className="badge badge-success" style={{ fontSize: "10px" }}>
                {selected.status}
              </span>
            </div>
            <div className="kpis kpis-2" style={{ gap: "10px" }}>
              <div className="kpi">
                <div className="kpi-label">Budget alloué</div>
                <div className="kpi-value">{selected.budget}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Dépensé</div>
                <div className="kpi-value">{selected.spent}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Leads</div>
                <div className="kpi-value">{selected.leads}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">ROI estimé</div>
                <div className="kpi-value gold">{selected.roi}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
