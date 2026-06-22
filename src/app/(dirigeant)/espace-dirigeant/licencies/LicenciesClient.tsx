"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import Link from "next/link";
import { useMemo, useState } from "react";

type Licencie = {
  id: string;
  name: string;
  city: string;
  dirigeant: string;
  ingenieurs: number;
  ca: string;
  growth: string;
  tag: string;
  initials: string;
};

const LICENCIE_DATA: Record<string, Licencie> = {
  "paris-etoile": { id: "paris-etoile", name: "Cabinet Paris Étoile", city: "Paris 8e", dirigeant: "Émilie LAMBERT", ingenieurs: 5, ca: "218 400 €", growth: "+18 %", tag: "tlogo-priveos", initials: "PE" },
  "lyon-defense": { id: "lyon-defense", name: "Cabinet Lyon Défense", city: "Lyon 6e", dirigeant: "Romain BERTHIER", ingenieurs: 4, ca: "186 800 €", growth: "+14 %", tag: "tlogo-1", initials: "LD" },
  "paris-vendome": { id: "paris-vendome", name: "Cabinet Paris Vendôme", city: "Paris 1er", dirigeant: "Antoine ROSSI", ingenieurs: 4, ca: "164 200 €", growth: "+22 %", tag: "tlogo-2", initials: "PV" },
  "bordeaux-centre": { id: "bordeaux-centre", name: "Cabinet Bordeaux Centre", city: "Bordeaux", dirigeant: "Caroline FAURE", ingenieurs: 3, ca: "142 600 €", growth: "+12 %", tag: "tlogo-3", initials: "BC" },
  "strasbourg-orangerie": { id: "strasbourg-orangerie", name: "Cabinet Strasbourg Orangerie", city: "Strasbourg", dirigeant: "Mathieu KELLER", ingenieurs: 3, ca: "128 400 €", growth: "+9 %", tag: "tlogo-pro", initials: "SO" },
  "marseille-avenue": { id: "marseille-avenue", name: "Cabinet Marseille Avenue", city: "Marseille", dirigeant: "Léa RICCI", ingenieurs: 3, ca: "114 800 €", growth: "+6 %", tag: "tlogo-1", initials: "MA" },
  "nantes-tour": { id: "nantes-tour", name: "Cabinet Nantes Tour", city: "Nantes", dirigeant: "Thomas RENARD", ingenieurs: 3, ca: "98 400 €", growth: "+3 %", tag: "tlogo-2", initials: "NT" },
  "lille-prefecture": { id: "lille-prefecture", name: "Cabinet Lille Préfecture", city: "Lille", dirigeant: "Sophie DELATTRE", ingenieurs: 3, ca: "86 400 €", growth: "≈", tag: "tlogo-3", initials: "LP" },
  "nice-promenade": { id: "nice-promenade", name: "Cabinet Nice Promenade", city: "Nice", dirigeant: "Bruno SARTORI", ingenieurs: 2, ca: "76 800 €", growth: "+5 %", tag: "tlogo-pro", initials: "NP" },
  "rennes-patrimoine": { id: "rennes-patrimoine", name: "Cabinet Rennes Patrimoine", city: "Rennes", dirigeant: "Florence MERCIER", ingenieurs: 2, ca: "68 200 €", growth: "+14 %", tag: "tlogo-1", initials: "RP" },
  "bordeaux-patrimoine": { id: "bordeaux-patrimoine", name: "Cabinet Bordeaux Patrimoine", city: "Bordeaux", dirigeant: "Olivier MARTIN", ingenieurs: 2, ca: "38 600 €", growth: "-22 %", tag: "tlogo-1", initials: "BP" },
  "toulouse-capitole": { id: "toulouse-capitole", name: "Cabinet Toulouse Capitole", city: "Toulouse", dirigeant: "Hélène CARRÈRE", ingenieurs: 2, ca: "31 200 €", growth: "-14 %", tag: "tlogo-pro", initials: "TC" },
};

type Row = {
  id: string;
  tags: string[];
  primary: string;
  sub: string;
  initials: string;
  tlogo: string;
  badge: string;
  role: string;
  dirigeant: string;
  ingenieurs: number;
  clients: number;
  ca: string;
  caStyle?: React.CSSProperties;
  evolutionClass?: "up" | "down" | "flat";
  evolution: string;
  conformite: { label: string; cls: string };
  rowDanger?: boolean;
  delegationGold?: boolean;
  clickable: boolean;
};

const ROWS: Row[] = [
  { id: "paris-etoile", tags: ["croissance", "licence"], primary: "Luc THILLIEZ", sub: "cab-0001 · depuis 2023", initials: "PE", tlogo: "tlogo-priveos", badge: "CDI", role: "Paris 8e", dirigeant: "Émilie LAMBERT", ingenieurs: 5, clients: 142, ca: "218 400 €", caStyle: { fontWeight: undefined }, evolutionClass: "up", evolution: "▲ +18 %", conformite: { label: "À jour", cls: "badge badge-success" }, delegationGold: true, clickable: true },
  { id: "lyon-defense", tags: ["croissance", "licence"], primary: "Julien VASSEUR", sub: "cab-0002 · depuis 2023", initials: "LD", tlogo: "tlogo-1", badge: "CDI", role: "Lyon 6e", dirigeant: "Romain BERTHIER", ingenieurs: 4, clients: 118, ca: "186 800 €", evolutionClass: "up", evolution: "▲ +14 %", conformite: { label: "À jour", cls: "badge badge-success" }, clickable: true },
  { id: "paris-vendome", tags: ["croissance", "licence"], primary: "Thomas LEROY", sub: "cab-0003 · depuis 2024", initials: "PV", tlogo: "tlogo-2", badge: "CDI", role: "Paris 1er", dirigeant: "Antoine ROSSI", ingenieurs: 4, clients: 98, ca: "164 200 €", evolutionClass: "up", evolution: "▲ +22 %", conformite: { label: "À jour", cls: "badge badge-success" }, clickable: true },
  { id: "bordeaux-centre", tags: ["croissance", "licence"], primary: "Sophie MERCIER", sub: "cab-0004 · depuis 2024", initials: "BC", tlogo: "tlogo-3", badge: "CDI", role: "Bordeaux", dirigeant: "Caroline FAURE", ingenieurs: 3, clients: 86, ca: "142 600 €", evolutionClass: "up", evolution: "▲ +12 %", conformite: { label: "À jour", cls: "badge badge-success" }, clickable: true },
  { id: "strasbourg-orangerie", tags: ["stable", "franchise"], primary: "Julien VASSEUR", sub: "cab-0005 · depuis 2024", initials: "SO", tlogo: "tlogo-pro", badge: "CDI", role: "Strasbourg", dirigeant: "Mathieu KELLER", ingenieurs: 3, clients: 72, ca: "128 400 €", evolutionClass: "up", evolution: "▲ +9 %", conformite: { label: "À jour", cls: "badge badge-success" }, clickable: true },
  { id: "marseille-avenue", tags: ["stable", "licence"], primary: "Camille BERTRAND", sub: "cab-0006", initials: "MA", tlogo: "tlogo-1", badge: "CDI", role: "Marseille", dirigeant: "Léa RICCI", ingenieurs: 3, clients: 68, ca: "114 800 €", evolutionClass: "up", evolution: "▲ +6 %", conformite: { label: "À jour", cls: "badge badge-success" }, clickable: true },
  { id: "nantes-tour", tags: ["stable", "licence"], primary: "Thomas LEROY", sub: "cab-0007", initials: "NT", tlogo: "tlogo-2", badge: "CDI", role: "Nantes", dirigeant: "Thomas RENARD", ingenieurs: 3, clients: 62, ca: "98 400 €", evolutionClass: "up", evolution: "▲ +3 %", conformite: { label: "À jour", cls: "badge badge-success" }, clickable: true },
  { id: "lille-prefecture", tags: ["stable", "franchise"], primary: "Julien VASSEUR Préfecture", sub: "cab-0008", initials: "LP", tlogo: "tlogo-3", badge: "CDI", role: "Lille", dirigeant: "Sophie DELATTRE", ingenieurs: 3, clients: 58, ca: "86 400 €", evolution: "≈", conformite: { label: "À jour", cls: "badge badge-success" }, clickable: true },
  { id: "nice-promenade", tags: ["stable", "franchise"], primary: "Camille BERTRAND", sub: "cab-0009", initials: "NP", tlogo: "tlogo-pro", badge: "CDI", role: "Nice", dirigeant: "Bruno SARTORI", ingenieurs: 2, clients: 52, ca: "76 800 €", evolutionClass: "up", evolution: "▲ +5 %", conformite: { label: "Audit en retard", cls: "badge badge-orange" }, clickable: true },
  { id: "rennes-patrimoine", tags: ["croissance", "mandataire"], primary: "Sophie MERCIER Patrimoine", sub: "cab-0010", initials: "RP", tlogo: "tlogo-1", badge: "CDI", role: "Rennes", dirigeant: "Florence MERCIER", ingenieurs: 2, clients: 48, ca: "68 200 €", evolutionClass: "up", evolution: "▲ +14 %", conformite: { label: "À jour", cls: "badge badge-success" }, clickable: true },
  { id: "bordeaux-patrimoine", tags: ["alerte", "licence"], primary: "Thomas LEROY", sub: "cab-0014", initials: "BP", tlogo: "tlogo-1", badge: "CDI", role: "Bordeaux", dirigeant: "Olivier MARTIN", ingenieurs: 2, clients: 42, ca: "38 600 €", caStyle: { color: "var(--orange-text)" }, evolutionClass: "down", evolution: "▼ -22 %", conformite: { label: "À jour", cls: "badge badge-success" }, rowDanger: true, clickable: true },
  { id: "toulouse-capitole", tags: ["alerte", "licence"], primary: "Thomas LEROY", sub: "cab-0017", initials: "TC", tlogo: "tlogo-pro", badge: "CDI", role: "Toulouse", dirigeant: "Hélène CARRÈRE", ingenieurs: 2, clients: 38, ca: "31 200 €", caStyle: { color: "var(--orange-text)" }, evolutionClass: "down", evolution: "▼ -14 %", conformite: { label: "Audit en retard", cls: "badge badge-orange" }, rowDanger: true, clickable: true },
];

type Filter = "all" | "croissance" | "stable" | "alerte";

const QUICK_FILTERS: { key: Filter; label: string; count?: number }[] = [
  { key: "all", label: "Tous (30)" },
  { key: "croissance", label: "Croissance", count: 18 },
  { key: "stable", label: "Stables", count: 10 },
  { key: "alerte", label: "Alerte", count: 2 },
];

const REGIONS = ["Toutes régions", "Paris 8e", "Lyon 6e", "Paris 1er", "Bordeaux", "Strasbourg", "Marseille", "Nantes", "Lille", "Nice", "Rennes", "Toulouse"];

export function LicenciesClient() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("Toutes régions");
  const [regionOpen, setRegionOpen] = useState(false);

  const [compareMode, setCompareMode] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROWS.filter((r) => {
      if (filter !== "all" && !r.tags.includes(filter)) return false;
      if (region !== "Toutes régions" && r.role !== region) return false;
      if (q) {
        const hay = `${r.primary} ${r.dirigeant} ${r.role} ${r.sub}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filter, search, region]);

  function toggleCompareMode() {
    setCompareMode((on) => {
      const next = !on;
      if (!next) {
        setSelection([]);
        setNotice(null);
      }
      return next;
    });
  }

  function toggleCompareItem(id: string) {
    setSelection((sel) => {
      if (sel.includes(id)) return sel.filter((x) => x !== id);
      if (sel.length >= 3) {
        setNotice("Maximum 3 licenciés dans le comparateur");
        return sel;
      }
      setNotice(null);
      return [...sel, id];
    });
  }

  function onRowClick(id: string) {
    if (compareMode) {
      toggleCompareItem(id);
      return;
    }
    setDrawerId(id);
  }

  function connectAsLicencie(id: string) {
    const d = LICENCIE_DATA[id];
    setBanner(
      `Mode délégation activé · Vous êtes connecté en tant que ${d ? d.name : id}. Une bannière persistante rappelle votre identité ASTRAEOS pendant toute la session.`,
    );
    setDrawerId(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function launchCompare() {
    if (selection.length < 2) return;
    const names = selection.map((id) => (LICENCIE_DATA[id] ? LICENCIE_DATA[id].name : id)).join(" vs ");
    setNotice(
      `Comparateur lancé · ${names}. Vue tableau côte-à-côte : CA / croissance / score / conformité / portefeuille.`,
    );
  }

  function resetCompare() {
    setSelection([]);
    setCompareMode(false);
    setNotice(null);
  }

  const drawer = drawerId ? LICENCIE_DATA[drawerId] : null;
  const compareLabel =
    selection.length === 0
      ? "Aucun cabinet sélectionné"
      : selection.map((id) => (LICENCIE_DATA[id] ? LICENCIE_DATA[id].name : id)).join(" · ");

  return (
    <div className={compareMode ? "compare-mode" : undefined}>
      {banner && (
        <div
          style={{
            background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-deep) 100%)",
            color: "white",
            padding: "12px 18px",
            borderRadius: 8,
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 12.5,
          }}
        >
          <svg style={{ width: 15, height: 15, color: "var(--gold-300)" }}>
            <use href="#i-eye" />
          </svg>
          <span style={{ flex: 1 }}>{banner}</span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            onClick={() => setBanner(null)}
          >
            Quitter la délégation
          </button>
        </div>
      )}

      <div className="hero">
        <div>
          <div className="hero-eyebrow">Cabinet Paris Étoile · 5 ingénieurs (vous + 4)</div>
          <h1 className="hero-title">
            Les <strong>licenciés</strong> du Cabinet Paris Étoile
          </h1>
          <p className="hero-sub">
            Cabinets de gestion de patrimoine ayant souscrit auprès de ASTRAEOS. Vue détaillée, filtres
            dynamiques, comparateur multi-licenciés, détail niveau 2 (mode délégation : se connecter en tant
            que cabinet).
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-ghost btn-sm">
            <svg>
              <use href="#i-download" />
            </svg>
            Export
          </button>
          <Link className="btn btn-gold btn-sm" href="/espace-dirigeant/ingenieurs/recrutement">
            <svg>
              <use href="#i-new" />
            </svg>
            Recruter un licencié
          </Link>
        </div>
      </div>

      {/* Bandeau comparateur */}
      <div
        id="compare-bar"
        className={compareMode ? "active" : undefined}
        style={{
          display: compareMode ? "flex" : "none",
          background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-deep) 100%)",
          color: "white",
          padding: "14px 20px",
          borderRadius: 8,
          marginBottom: 18,
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--gold-300)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Comparateur de licenciés
          </div>
          <div id="compare-list" style={{ fontSize: 13, marginTop: 4 }}>
            {compareLabel}
          </div>
        </div>
        <button
          className="btn btn-gold btn-sm"
          id="compare-launch-btn"
          onClick={launchCompare}
          disabled={selection.length < 2}
        >
          Comparer ({selection.length}/3)
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
          onClick={resetCompare}
        >
          Annuler
        </button>
      </div>

      {notice && (
        <div
          style={{
            background: "var(--gold-100)",
            border: "1px solid var(--gold-200)",
            color: "var(--navy)",
            padding: "10px 14px",
            borderRadius: 6,
            marginBottom: 14,
            fontSize: 12,
          }}
        >
          {notice}
        </div>
      )}

      {/* KPIs */}
      <div className="kpis kpis-5 mb-20">
        <div className="kpi">
          <div className="kpi-label">Ingénieurs actifs</div>
          <div className="kpi-value">30</div>
          <div className="kpi-meta">tous opérationnels</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">En croissance &gt; +10 %</div>
          <div className="kpi-value" style={{ color: "var(--green-text)" }}>
            18
          </div>
          <div className="kpi-meta">vs M-1</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Stables ±10 %</div>
          <div className="kpi-value">10</div>
          <div className="kpi-meta">activité régulière</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">En alerte</div>
          <div className="kpi-value" style={{ color: "var(--orange-text)" }}>
            2
          </div>
          <div className="kpi-meta">à contacter en priorité</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Ancienneté moyenne</div>
          <div className="kpi-value">
            3,4 <span className="unit">ans</span>
          </div>
          <div className="kpi-meta">dans le réseau</div>
        </div>
      </div>

      {/* Tableau avec filtres fonctionnels */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            {QUICK_FILTERS.map((qf) => (
              <button
                key={qf.key}
                className={`qf-licencies${filter === qf.key ? " active" : ""}`}
                onClick={() => setFilter(qf.key)}
              >
                {qf.label}
                {qf.count !== undefined && <span className="qf-count">{qf.count}</span>}
              </button>
            ))}
          </div>
          <div className="table-toolbar-right">
            <div className="search-wrap">
              <svg>
                <use href="#i-search" />
              </svg>
              <input
                className="search-input"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ position: "relative" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setRegionOpen((v) => !v)}>
                {region === "Toutes régions" ? "Région ▾" : `${region} ▾`}
              </button>
              {regionOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    zIndex: 20,
                    background: "white",
                    border: "1px solid var(--navy-100)",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                    padding: 6,
                    minWidth: 180,
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRegion(r);
                        setRegionOpen(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "7px 10px",
                        borderRadius: 6,
                        border: "none",
                        background: r === region ? "var(--ivory)" : "transparent",
                        color: "var(--navy)",
                        fontSize: 12,
                        fontWeight: r === region ? 700 : 500,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-gold btn-sm" onClick={toggleCompareMode} id="compare-toggle-btn">
              <svg style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Comparer
            </button>
          </div>
        </div>
        <table className="dt" id="licencies-table">
          <thead>
            <tr>
              <th className="compare-col" style={{ display: compareMode ? "table-cell" : "none", width: 40 }}></th>
              <th>Ingénieur</th>
              <th>Statut</th>
              <th>Rôle</th>
              <th>Dirigeant</th>
              <th className="num">Ingénieurs</th>
              <th className="num">Clients</th>
              <th className="num">CA cumul depuis janv.</th>
              <th className="num">Évolution</th>
              <th>Conformité</th>
              <th className="center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => (
              <tr
                key={r.id}
                className="dt-clickable"
                onClick={() => onRowClick(r.id)}
                style={r.rowDanger ? { background: "var(--orange-bg)" } : undefined}
              >
                <td className="compare-col" style={{ display: compareMode ? "table-cell" : "none" }}>
                  <input
                    type="checkbox"
                    className="compare-checkbox"
                    checked={selection.includes(r.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleCompareItem(r.id)}
                  />
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div className={`tlogo tlogo-sm ${r.tlogo}`}>{r.initials}</div>
                    <div>
                      <div className="cell-primary">{r.primary}</div>
                      <div style={{ fontSize: 10.5, color: "var(--navy-300)" }}>{r.sub}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-gold">{r.badge}</span>
                </td>
                <td>{r.role}</td>
                <td>{r.dirigeant}</td>
                <td className="num">{r.ingenieurs}</td>
                <td className="num">{r.clients}</td>
                <td className={`num cell-money${r.caStyle ? "" : " gold"}`} style={r.caStyle}>
                  {r.ca}
                </td>
                <td className="num">
                  {r.evolutionClass ? (
                    <strong className={r.evolutionClass}>{r.evolution}</strong>
                  ) : (
                    r.evolution
                  )}
                </td>
                <td>
                  <span className={r.conformite.cls}>{r.conformite.label}</span>
                </td>
                <td className="center">
                  <button
                    className={`btn ${r.delegationGold ? "btn-gold" : "btn-ghost"} btn-sm`}
                    onClick={(e) => {
                      e.stopPropagation();
                      connectAsLicencie(r.id);
                    }}
                  >
                    <svg>
                      <use href="#i-eye" />
                    </svg>
                    Délégation
                  </button>
                </td>
              </tr>
            ))}
            <tr className="row-summary" style={{ background: "var(--ivory)" }}>
              <td colSpan={compareMode ? 12 : 11} style={{ textAlign: "center", fontSize: 11.5, color: "var(--navy-300)", padding: 14 }}>
                … lignes additionnelles ·{" "}
                <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                  Voir tous les ingénieurs (5)
                </a>
              </td>
            </tr>
            <tr className="row-total" style={{ background: "var(--gold-200)", fontWeight: 700 }}>
              <td className="compare-col" style={{ display: compareMode ? "table-cell" : "none" }}></td>
              <td>Total réseau · 4 ingénieurs</td>
              <td></td>
              <td></td>
              <td></td>
              <td className="num">80</td>
              <td className="num">142</td>
              <td className="num cell-money gold">2 384 600 €</td>
              <td className="num">
                <strong className="up">▲ +14 %</strong>
              </td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Drawer licencié */}
      <div
        className={`team-drawer-overlay${drawer ? " open" : ""}`}
        id="licencie-drawer-overlay"
        onClick={() => setDrawerId(null)}
      ></div>
      <aside className={`team-drawer${drawer ? " open" : ""}`} id="licencie-drawer">
        <div className="team-drawer-header">
          <button className="team-drawer-close" onClick={() => setDrawerId(null)}>
            ×
          </button>
          <div className="team-drawer-avatar" id="lc-avatar">
            {drawer ? drawer.initials : "PE"}
          </div>
          <div className="team-drawer-name" id="lc-name" style={{ fontSize: 22, fontWeight: 700 }}>
            {drawer ? drawer.name : "Luc THILLIEZ"}
          </div>
          <div className="team-drawer-role" id="lc-meta">
            {drawer ? `${drawer.city} · ${drawer.id}` : "Paris 8e · cab-0001 · depuis mars 2023"}
          </div>
          <div className="team-drawer-contact">
            <span>
              <svg style={{ width: 13, height: 13 }}>
                <use href="#i-team" />
              </svg>
              <span id="lc-dirigeant">{drawer ? `${drawer.dirigeant} (dirigeant)` : "Émilie LAMBERT (dirigeante)"}</span>
            </span>
            <span>
              <svg style={{ width: 13, height: 13 }}>
                <use href="#i-team" />
              </svg>
              <span id="lc-ingenieurs">{drawer ? `${drawer.ingenieurs} ingénieurs` : "5 ingénieurs"}</span>
            </span>
          </div>
        </div>
        <div className="team-drawer-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
            <button className="btn btn-gold btn-sm" onClick={() => drawer && connectAsLicencie(drawer.id)}>
              <svg>
                <use href="#i-eye" />
              </svg>
              Se connecter en tant que
            </button>
            <button className="btn btn-ghost btn-sm">
              <svg>
                <use href="#i-comms" />
              </svg>
              Contacter le licencié
            </button>
            <button className="btn btn-ghost btn-sm">
              <svg>
                <use href="#i-finance" />
              </svg>
              Voir facturation
            </button>
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--orange-text)" }}>
              <svg>
                <use href="#i-alert" />
              </svg>
              Suspendre l&apos;accès
            </button>
          </div>

          <div
            style={{
              fontSize: 11.5,
              color: "var(--gold)",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Statut contractuel
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">Type de relation</span>
            <span className="finance-detail-value" style={{ color: "var(--gold)" }}>
              Licence d&apos;utilisation de marque
            </span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">Date d&apos;entrée réseau</span>
            <span className="finance-detail-value">15 mars 2023</span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">Anniversaire de licence</span>
            <span className="finance-detail-value">15 mars 2026 (renouvelée)</span>
          </div>

          <div
            style={{
              fontSize: 11.5,
              color: "var(--gold)",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: "18px 0 8px",
            }}
          >
            Performance · cumul depuis janvier
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">CA généré (clients finaux)</span>
            <span className="finance-detail-value gold">218 400 €</span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">Évolution vs N-1</span>
            <span className="finance-detail-value" style={{ color: "var(--green-text)" }}>
              ▲ +18 %
            </span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">Clients servis</span>
            <span className="finance-detail-value">142</span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">Patrimoine sous gestion</span>
            <span className="finance-detail-value">42 800 000 €</span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">Score satisfaction client</span>
            <span className="finance-detail-value gold">4,8 / 5</span>
          </div>

          <div
            style={{
              fontSize: 11.5,
              color: "var(--gold)",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: "18px 0 8px",
            }}
          >
            Conformité réglementaire
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">N° ORIAS</span>
            <span className="finance-detail-value" style={{ color: "var(--green-text)" }}>
              À jour
            </span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">CIF · Conseiller Investissement Financier</span>
            <span className="finance-detail-value" style={{ color: "var(--green-text)" }}>
              À jour
            </span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">IAS · Intermédiaire Assurance</span>
            <span className="finance-detail-value" style={{ color: "var(--green-text)" }}>
              À jour
            </span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">RC professionnelle</span>
            <span className="finance-detail-value" style={{ color: "var(--green-text)" }}>
              À jour
            </span>
          </div>
          <div className="finance-detail-row">
            <span className="finance-detail-label">Audit annuel</span>
            <span className="finance-detail-value" style={{ color: "var(--green-text)" }}>
              À jour
            </span>
          </div>
          <div
            className="finance-detail-row"
            style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--ivory-deep)" }}
          >
            <span className="finance-detail-label" style={{ fontWeight: 700 }}>
              Statut global
            </span>
            <span className="finance-detail-value">
              <span className="badge badge-success">✓ Cabinet conforme</span>
            </span>
          </div>

          <div
            style={{
              marginTop: 18,
              padding: "12px 14px",
              background: "linear-gradient(135deg, var(--ivory) 0%, var(--gold-100) 100%)",
              borderRadius: 6,
              borderLeft: "3px solid var(--gold)",
              fontSize: 11,
              color: "var(--navy-300)",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--navy)" }}>Détail niveau 2 :</strong> «&nbsp;Se connecter en tant
            que&nbsp;» ouvre l&apos;espace cabinet en mode délégation. Une bannière persistante rappelle votre
            identité ASTRAEOS.
          </div>
        </div>
      </aside>
    </div>
  );
}
