"use client";

import Link from "next/link";
import { useState } from "react";

// Drawer drilldown investissement immobilier. Fidèle à la maquette
// (reference/wireframes-dirigeant.html, lignes 7923-8091) : chaque ligne du
// classement par cabinet ouvre le même drawer ; seul le titre change selon
// le cabinet cliqué (openDrawerImmo(cabinetName)). Le corps du drawer est
// hardcodé sur l'exemple "Cabinet Paris Étoile" comme dans la maquette.

const CABINETS = [
  { name: "Cabinet Paris Étoile", initials: "PE", logo: "tlogo-priveos", projets: 8, volume: "4 200 000 €", apport: "18 200 €", recurrence: "2 800 €", delai: "68 jours", evo: "▲ +20 %" },
  { name: "Cabinet Lyon Défense", initials: "LD", logo: "tlogo-1", projets: 7, volume: "3 600 000 €", apport: "14 800 €", recurrence: "2 400 €", delai: "72 jours", evo: "▲ +14 %" },
  { name: "Cabinet Paris Vendôme", initials: "PV", logo: "tlogo-2", projets: 6, volume: "3 200 000 €", apport: "12 400 €", recurrence: "2 100 €", delai: "85 jours", evo: "▲ +10 %" },
  { name: "Cabinet Bordeaux Centre", initials: "BC", logo: "tlogo-3", projets: 5, volume: "2 400 000 €", apport: "9 600 €", recurrence: "1 800 €", delai: "76 jours", evo: "▲ +9 %" },
  { name: "Cabinet Strasbourg Orangerie", initials: "SO", logo: "tlogo-pro", projets: 4, volume: "1 900 000 €", apport: "7 600 €", recurrence: "1 400 €", delai: "82 jours", evo: "▲ +7 %" },
];

export function ImmobilierClient() {
  const [drawerTitle, setDrawerTitle] = useState<string | null>(null);

  const openDrawerImmo = (cabinetName: string) => setDrawerTitle(cabinetName);
  const closeDrawer = () => setDrawerTitle(null);

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Assets du cabinet · investissement immobilier</div>
          <h1 className="hero-title">Investissement <strong>immobilier</strong></h1>
          <p className="hero-sub">Détail des projets immobiliers (LMNP, ancien rénové, Projet Denormandie, location nue) avec apports d&apos;affaires perçus par le cabinet sur les mises en relation. Volumes par ingénieur et performance des partenaires.</p>
        </div>
        <div className="hero-actions">
          <Link href="/espace-dirigeant" className="btn btn-ghost btn-sm">← Retour accueil</Link>
          <button className="btn btn-gold btn-sm">Exporter</button>
        </div>
      </div>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi"><div className="kpi-label">Volume immobilier traité</div><div className="kpi-value">28 100 000 <span className="unit">€</span></div><div className="kpi-meta">cumul depuis janvier 2026 · réseau</div></div>
        <div className="kpi"><div className="kpi-label">Projets réalisés</div><div className="kpi-value">53</div><div className="kpi-meta">tous types confondus</div></div>
        <div className="kpi"><div className="kpi-label">Apports d&apos;affaires perçus PRIVEOS</div><div className="kpi-value gold">96 000 <span className="unit">€</span></div><div className="kpi-meta">cumul depuis janvier 2026</div></div>
        <div className="kpi"><div className="kpi-label">Ticket moyen par projet</div><div className="kpi-value">530 000 <span className="unit">€</span></div><div className="kpi-meta">moyenne réseau</div></div>
      </div>

      <div className="card mb-24">
        <div className="card-header"><div className="card-title"><svg><use href="#i-business" /></svg>Classement par ingénieur · qui apporte le plus de projets immobiliers</div><span style={{ fontSize: "11px", color: "var(--navy-300)" }}>cumul depuis janvier 2026</span></div>
        <table className="dt">
          <thead>
            <tr>
              <th>Cabinet</th>
              <th className="num">Projets réalisés</th>
              <th className="num">Volume traité</th>
              <th className="num">Apports d&apos;affaires PRIVEOS</th>
              <th className="num">Récurrence perçue PRIVEOS</th>
              <th className="num">Délai moyen<br /><span style={{ fontWeight: 400, color: "var(--navy-300)" }}>de la présentation au paiement</span></th>
              <th>Évolution N-1</th>
            </tr>
          </thead>
          <tbody>
            {CABINETS.map((c) => (
              <tr key={c.name} className="dt-clickable" onClick={() => openDrawerImmo(c.name)}>
                <td><div style={{ display: "flex", alignItems: "center", gap: "9px" }}><div className={`tlogo tlogo-sm ${c.logo}`}>{c.initials}</div><div className="cell-primary">{c.name}</div></div></td>
                <td className="num">{c.projets}</td>
                <td className="num cell-money">{c.volume}</td>
                <td className="num cell-money gold">{c.apport}</td>
                <td className="num cell-money">{c.recurrence}</td>
                <td className="num">{c.delai}</td>
                <td><span className="up">{c.evo}</span></td>
              </tr>
            ))}
            <tr style={{ background: "var(--ivory)" }}><td colSpan={7} style={{ textAlign: "center", fontSize: "11.5px", color: "var(--navy-300)", padding: "14px" }}>… 25 autres cabinets · <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>Voir tous (30)</a></td></tr>
            <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
              <td><strong>Total réseau</strong></td>
              <td className="num">53</td>
              <td className="num cell-money">28 100 000 €</td>
              <td className="num cell-money">96 000 €</td>
              <td className="num cell-money">14 800 €</td>
              <td className="num">76 jours</td>
              <td><span className="up">▲ +12 %</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Répartition par type de programme */}
      <div className="card">
        <div className="card-header"><div className="card-title"><svg><use href="#i-business" /></svg>Répartition par type de programme · réseau</div></div>
        <table className="dt" style={{ fontSize: "12px" }}>
          <thead><tr><th>Programme</th><th>Type</th><th className="num">Projets réalisés</th><th className="num">Volume traité</th></tr></thead>
          <tbody>
            <tr><td><strong>Projet Denormandie</strong></td><td>Dispositif fiscal Denormandie · ancien rénové éligible</td><td className="num cell-money gold">22</td><td className="num cell-money">12 600 000 €</td></tr>
            <tr><td><strong>LMNP résidences services</strong></td><td>Loueur meublé non professionnel</td><td className="num">14</td><td className="num cell-money">7 200 000 €</td></tr>
            <tr><td><strong>Patrimoine Centre</strong></td><td>Ancien rénové</td><td className="num">9</td><td className="num cell-money">5 100 000 €</td></tr>
            <tr><td><strong>Location nue</strong></td><td>Investissement locatif classique</td><td className="num">8</td><td className="num cell-money">3 200 000 €</td></tr>
          </tbody>
        </table>
      </div>

      {/* DRAWER DRILLDOWN · INVESTISSEMENT IMMOBILIER */}
      <div
        className={`immo-drawer-overlay${drawerTitle ? " open" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeDrawer(); }}
      >
        <div className="immo-drawer">
          <div className="immo-drawer-header">
            <div>
              <div style={{ fontSize: "10.5px", fontWeight: 700, color: "var(--gold-300)", letterSpacing: "0.16em", textTransform: "uppercase" }}>Détail · investissement immobilier</div>
              <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>{(drawerTitle ?? "Cabinet Paris Étoile") + " · Investissement immobilier"}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginTop: "4px" }}>8 projets réalisés depuis janvier 2026 · 4 200 000 € de volume traité</div>
            </div>
            <button className="immo-drawer-close" onClick={closeDrawer}>Fermer ✕</button>
          </div>

          <div style={{ padding: "24px 28px" }}>
            {/* KPIs synthèse drawer */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "white", padding: "12px 14px", borderRadius: "8px", borderLeft: "3px solid var(--gold)" }}>
                <div style={{ fontSize: "10px", color: "var(--navy-300)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Projets réalisés</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontSize: "22px", fontWeight: 700, color: "var(--navy)", marginTop: "4px" }}>8</div>
              </div>
              <div style={{ background: "white", padding: "12px 14px", borderRadius: "8px", borderLeft: "3px solid var(--gold)" }}>
                <div style={{ fontSize: "10px", color: "var(--navy-300)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Volume traité</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--navy)", marginTop: "4px" }}>4 200 000 €</div>
              </div>
              <div style={{ background: "white", padding: "12px 14px", borderRadius: "8px", borderLeft: "3px solid var(--gold)" }}>
                <div style={{ fontSize: "10px", color: "var(--navy-300)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Apports PRIVEOS</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--gold)", marginTop: "4px" }}>18 200 €</div>
              </div>
              <div style={{ background: "white", padding: "12px 14px", borderRadius: "8px", borderLeft: "3px solid var(--gold)" }}>
                <div style={{ fontSize: "10px", color: "var(--navy-300)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Délai moyen</div>
                <div style={{ fontFamily: "'Epilogue',sans-serif", fontSize: "22px", fontWeight: 700, color: "var(--navy)", marginTop: "4px" }}>68 <span style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 600 }}>j</span></div>
              </div>
            </div>

            {/* Détail des 8 projets */}
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>Détail des 8 projets · cumul depuis janvier 2026</div>
            <div className="card" style={{ marginBottom: "18px" }}>
              <table className="dt" style={{ fontSize: "12px" }}>
                <thead><tr><th>Date</th><th>Client</th><th>Programme</th><th className="num">Montant</th><th className="num">Apport PRIVEOS</th><th className="num">Délai</th><th>Ingénieur</th></tr></thead>
                <tbody>
                  <tr><td className="nowrap">12/02/2026</td><td><strong>Albert &amp; Cécile HUYGHE</strong></td><td><span style={{ color: "var(--gold-deep)", fontWeight: 600 }}>Projet Denormandie</span></td><td className="num cell-money">680 000 €</td><td className="num cell-money gold">2 800 €</td><td className="num">62 j</td><td>Émilie LAMBERT</td></tr>
                  <tr><td className="nowrap">28/02/2026</td><td><strong>Olivier MAILLOT</strong></td><td><span style={{ color: "var(--gold-deep)", fontWeight: 600 }}>Projet Denormandie</span></td><td className="num cell-money">580 000 €</td><td className="num cell-money gold">2 400 €</td><td className="num">68 j</td><td>Julien VASSEUR</td></tr>
                  <tr><td className="nowrap">15/03/2026</td><td><strong>Bertrand &amp; Monique DUPONT-TOPIN</strong></td><td><span style={{ color: "var(--gold-deep)", fontWeight: 600 }}>Projet Denormandie</span></td><td className="num cell-money">620 000 €</td><td className="num cell-money gold">2 600 €</td><td className="num">71 j</td><td>Julien VASSEUR</td></tr>
                  <tr><td className="nowrap">22/03/2026</td><td><strong>Famille DELANNOY (neveu)</strong></td><td><span style={{ color: "var(--gold-deep)", fontWeight: 600 }}>Projet Denormandie</span></td><td className="num cell-money">520 000 €</td><td className="num cell-money gold">2 200 €</td><td className="num">65 j</td><td>Luc THILLIEZ</td></tr>
                  <tr><td className="nowrap">08/04/2026</td><td><strong>Régis FOUCAULT</strong></td><td>LMNP résidences services</td><td className="num cell-money">450 000 €</td><td className="num cell-money gold">1 800 €</td><td className="num">74 j</td><td>Émilie LAMBERT</td></tr>
                  <tr><td className="nowrap">14/04/2026</td><td><strong>Hélène GUYOT</strong></td><td>LMNP résidences services</td><td className="num cell-money">450 000 €</td><td className="num cell-money gold">1 800 €</td><td className="num">68 j</td><td>Julien VASSEUR</td></tr>
                  <tr><td className="nowrap">02/05/2026</td><td><strong>Camille DURIEZ</strong></td><td>Ancien rénové</td><td className="num cell-money">600 000 €</td><td className="num cell-money gold">2 400 €</td><td className="num">62 j</td><td>Émilie LAMBERT</td></tr>
                  <tr><td className="nowrap">05/05/2026</td><td><strong>Stéphane MOREAU</strong></td><td>Location nue</td><td className="num cell-money">300 000 €</td><td className="num cell-money gold">2 200 €</td><td className="num">74 j</td><td>Julien VASSEUR</td></tr>
                </tbody>
              </table>
            </div>

            {/* Décomposition par programme */}
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>Décomposition par programme</div>
            <div className="card" style={{ marginBottom: "18px" }}>
              <table className="dt" style={{ fontSize: "12px" }}>
                <thead><tr><th>Programme</th><th className="num">Projets</th><th className="num">Volume</th><th className="num">Apport PRIVEOS</th></tr></thead>
                <tbody>
                  <tr><td><strong style={{ color: "var(--gold-deep)" }}>Projet Denormandie</strong></td><td className="num">4</td><td className="num cell-money">2 400 000 €</td><td className="num cell-money gold">10 000 €</td></tr>
                  <tr><td><strong>LMNP résidences services</strong></td><td className="num">2</td><td className="num cell-money">900 000 €</td><td className="num cell-money gold">3 600 €</td></tr>
                  <tr><td><strong>Ancien rénové</strong></td><td className="num">1</td><td className="num cell-money">600 000 €</td><td className="num cell-money gold">2 400 €</td></tr>
                  <tr><td><strong>Location nue</strong></td><td className="num">1</td><td className="num cell-money">300 000 €</td><td className="num cell-money gold">2 200 €</td></tr>
                </tbody>
              </table>
            </div>

            {/* Top contributeurs ingénieurs */}
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>Contribution des ingénieurs</div>
            <div className="card">
              <table className="dt" style={{ fontSize: "12px" }}>
                <thead><tr><th>Ingénieur</th><th className="num">Projets</th><th className="num">Apports PRIVEOS générés</th></tr></thead>
                <tbody>
                  <tr><td><strong>Julien VASSEUR</strong></td><td className="num">5</td><td className="num cell-money gold">11 200 €</td></tr>
                  <tr><td><strong>Émilie LAMBERT</strong></td><td className="num">3</td><td className="num cell-money">7 000 €</td></tr>
                  <tr><td><strong>Luc THILLIEZ</strong></td><td className="num">1</td><td className="num cell-money">2 200 €</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
