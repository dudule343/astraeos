"use client";

import { useState } from "react";
import {
  headlineKpis,
  resultatRows,
  resultatQuickFilters,
  caRepartition,
  caMonthlyBars,
  packRows,
  projectionMonths,
  chargeCards,
  tresoAccounts,
  tresoPeriodButtons,
  tresoBars,
  tresoStats,
  previKpis,
  previMonths,
  previGlobalFields,
  definitionBlocks,
  type PackRow,
  type TresoView,
} from "./financeConsolideeData";

type FinanceTab = "resultat" | "detail-ca" | "detail-charges" | "treso" | "previ" | "definitions";

/**
 * Vue financière dérivée des commissions réelles de l'éditeur (part marque),
 * pré-formatée côté serveur (page.tsx) pour éviter d'embarquer le code
 * serveur Supabase dans ce composant client. `null` = aucune commission en
 * base → la page conserve les valeurs d'exemple.
 */
export type FinanceView = {
  caRealise: string;
  caEncaisse: string;
  encaisseMeta: string;
  repartition: { label: string; pct: string; value: string }[];
  monthly: { label: string; height: string; navy: boolean }[];
  packRows: PackRow[];
};

const FINANCE_TABS: { id: FinanceTab; label: string }[] = [
  { id: "resultat", label: "Compte de résultat" },
  { id: "detail-ca", label: "Détail du CA généré / encaissé" },
  { id: "detail-charges", label: "Détail des charges" },
  { id: "treso", label: "Trésorerie" },
  { id: "previ", label: "Prévisionnel" },
  { id: "definitions", label: "Définitions" },
];

function InfoBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="info-bar">
      <svg>
        <use href="#i-info" />
      </svg>
      <div>{children}</div>
    </div>
  );
}

export function FinanceConsolidee({ real }: { real: FinanceView | null }) {
  const [tab, setTab] = useState<FinanceTab>("resultat");
  const [resultatFilter, setResultatFilter] = useState(0);
  const [tresoView, setTresoView] = useState<TresoView>("mois");
  const [openPrevi, setOpenPrevi] = useState<string | null>(null);

  const togglePrevi = (id: string) => setOpenPrevi((cur) => (cur === id ? null : id));

  // Données réelles (part marque de l'éditeur) là où une source existe ;
  // repli sur les valeurs d'exemple pour les blocs sans source (résultat
  // complet, charges, trésorerie, prévisionnel, définitions).
  const headline = real
    ? headlineKpis.map((k) => {
        if (k.label === "CA réalisé · mai") return { ...k, value: real.caRealise };
        if (k.label === "CA encaissé · mai")
          return { ...k, value: real.caEncaisse, meta: real.encaisseMeta };
        return k;
      })
    : headlineKpis;
  const caRepartitionData =
    real && real.repartition.length > 0 ? real.repartition : caRepartition;
  const caMonthlyData = real && real.monthly.length > 0 ? real.monthly : caMonthlyBars;
  const packRowsData = real && real.packRows.length > 0 ? real.packRows : packRows;

  return (
    <>
      {/* KPIs étendus (7 KPIs) */}
      <div className="kpis kpis-7 mb-20">
        {headline.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">
              {k.value} <span className="unit">{k.unit}</span>
            </div>
            <div className="kpi-meta">{k.meta}</div>
          </div>
        ))}
      </div>

      {/* Onglets fonctionnels (6 onglets cliquables) */}
      <div className="tabs">
        {FINANCE_TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ONGLET 1 : COMPTE DE RÉSULTAT */}
      <div className={`tab-panel${tab === "resultat" ? " active" : ""}`}>
        <InfoBar>
          Reconstitution du compte de résultat avec comparaison{" "}
          <strong>année en cours vs N-1</strong> et évolution. Données arrêtées au{" "}
          <strong>06 mai 2026</strong>.
        </InfoBar>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              {resultatQuickFilters.map((f, i) => (
                <button
                  key={f}
                  className={`qf${resultatFilter === i ? " active" : ""}`}
                  onClick={() => setResultatFilter(i)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="table-toolbar-right">
              <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>
                Évolution affichée vs N-1
              </span>
            </div>
          </div>
          <table className="dt">
            <thead>
              <tr>
                <th style={{ width: "45%" }}>Compte</th>
                <th className="num">2026 (cumul depuis janv.)</th>
                <th className="num">2025 (cumul depuis janv.)</th>
                <th className="num">Évolution</th>
                <th className="num">2025 (annuel)</th>
              </tr>
            </thead>
            <tbody>
              {resultatRows.map((row, i) =>
                row.section ? (
                  <tr className="dt-section" key={i}>
                    <td colSpan={5}>{row.label}</td>
                  </tr>
                ) : (
                  <tr key={i} style={row.rowStyle}>
                    <td>{row.label}</td>
                    <td className={`num ${row.c2026Cls ?? ""}`.trim()} style={row.c2026Style}>
                      {row.c2026}
                    </td>
                    <td className={`num ${row.c2025Cls ?? ""}`.trim()}>{row.c2025}</td>
                    <td className="num">{row.evo}</td>
                    <td className={`num ${row.annuelCls ?? ""}`.trim()}>{row.annuel}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ONGLET 2 : DÉTAIL DU CA GÉNÉRÉ */}
      <div className={`tab-panel${tab === "detail-ca" ? " active" : ""}`}>
        <InfoBar>
          Décomposition fine du chiffre d&apos;affaires par source de revenu — visualisez
          d&apos;où vient chaque euro encaissé.
        </InfoBar>

        <div className="grid-2 mb-24">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-chart" />
                </svg>
                Répartition du CA par source · cumul depuis janv. 2026
              </div>
            </div>
            <div className="card-body">
              <div className="finance-detail-row" style={{ background: "var(--ivory)" }}>
                <span className="finance-detail-label" style={{ fontWeight: 700 }}>
                  Total · cumul depuis janv. 2026
                </span>
                <span className="finance-detail-value gold" style={{ color: "var(--gold)" }}>
                  251 600 €
                </span>
              </div>
              {caRepartitionData.map((r) => (
                <div className="finance-detail-row" key={r.label}>
                  <span className="finance-detail-label">
                    {r.label} <span className="finance-detail-pct">({r.pct})</span>
                  </span>
                  <span className="finance-detail-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-business" />
                </svg>
                Évolution mensuelle du CA
              </div>
            </div>
            <div className="card-body">
              <div className="chart-area">
                <div className="chart-bars">
                  {caMonthlyData.map((b) => (
                    <div
                      className={`chart-bar${b.navy ? " navy" : ""}`}
                      style={{ height: b.height }}
                      key={b.label}
                    >
                      <div className="chart-bar-label">{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--navy-300)",
                  textAlign: "center",
                  marginTop: "28px",
                }}
              >
                * Mai en cours — projection à fin de mois : 48 600 €
              </div>
            </div>
          </div>
        </div>

        {/* Détail par pack */}
        <div className="table-wrap mb-24">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                Détail généré vs encaissé · cumul depuis janv. 2026
              </span>
            </div>
            <div className="table-toolbar-right">
              <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>
                Permet d&apos;identifier les <strong>produits constatés d&apos;avance</strong> (PCA)
              </span>
            </div>
          </div>
          <table className="dt">
            <thead>
              <tr>
                <th>Pack / source</th>
                <th className="num">Souscriptions</th>
                <th className="num">CA généré</th>
                <th className="num">CA encaissé</th>
                <th className="num">Reste à encaisser</th>
                <th className="num">PCA · à étaler</th>
                <th className="num">Part du CA</th>
              </tr>
            </thead>
            <tbody>
              {packRowsData.map((r, i) => (
                <tr key={i} style={r.rowStyle}>
                  <td className="cell-primary">{r.pack}</td>
                  <td className="num">{r.souscriptions}</td>
                  <td className="num cell-money">{r.genere}</td>
                  <td className="num cell-money">{r.encaisse}</td>
                  <td className="num">{r.reste}</td>
                  <td className={r.pcaStyle ? "num cell-money" : "num"} style={r.pcaStyle}>
                    {r.pca}
                  </td>
                  <td className="num">{r.part}</td>
                </tr>
              ))}
              <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
                <td>
                  <strong>Total · cumul depuis janv. 2026</strong>
                </td>
                <td className="num"></td>
                <td className="num cell-money gold">234 260 €</td>
                <td className="num cell-money gold">229 048 €</td>
                <td className="num">5 212 €</td>
                <td className="num cell-money" style={{ color: "var(--purple-text)" }}>
                  <strong>26 542 €</strong>
                </td>
                <td className="num">100 %</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Projection à venir */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-business" />
              </svg>
              Projection des encaissements à venir · jusqu&apos;à fin 2026
            </div>
            <span className="badge badge-purple">Calculé sur abonnements annuels en cours</span>
          </div>
          <div className="card-body">
            <InfoBar>
              Pour les <strong>4 clients</strong> ayant payé un abonnement annuel d&apos;avance, le
              revenu est étalé sur 12 mois en comptabilité. Voici la décomposition mois par mois
              pour le reste de l&apos;année.
            </InfoBar>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: "6px",
                marginTop: "14px",
              }}
            >
              {projectionMonths.map((m) => (
                <div
                  key={m.label}
                  style={{
                    textAlign: "center",
                    padding: "10px 6px",
                    background: "var(--ivory)",
                    border: "1px solid var(--purple-bg)",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: "var(--purple-text)",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--navy)",
                      marginTop: "3px",
                    }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "14px",
                padding: "12px 16px",
                background: "linear-gradient(90deg, var(--gold-200), var(--ivory))",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--navy)" }}>
                Total CA récurrent à reconnaître mai → décembre 2026 (PCA actuels uniquement)
              </span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--gold)" }}>
                26 542 €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ONGLET 3 : DÉTAIL DES CHARGES */}
      <div className={`tab-panel${tab === "detail-charges" ? " active" : ""}`}>
        <InfoBar>
          Décomposition des charges par poste pour identifier les principaux centres de coûts
          d&apos;ASTRAEOS.
        </InfoBar>

        <div className="grid-2 mb-24">
          {chargeCards.slice(0, 2).map((c) => (
            <ChargeCard key={c.title} card={c} />
          ))}
        </div>
        <div className="grid-2 mb-24">
          {chargeCards.slice(2, 4).map((c) => (
            <ChargeCard key={c.title} card={c} />
          ))}
        </div>

        <div
          className="card"
          style={{ background: "linear-gradient(135deg, var(--ivory), var(--gold-200))" }}
        >
          <div className="card-body">
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <div className="kpi-label" style={{ marginBottom: "4px" }}>
                  TOTAL CHARGES · cumul depuis janv. 2026
                </div>
                <div style={{ fontSize: "13px", color: "var(--navy)" }}>
                  Charges humaines + Outils SaaS + Marketing + Autres
                </div>
              </div>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "var(--gold)" }}>
                197 400 €
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ONGLET 4 : TRÉSORERIE */}
      <div className={`tab-panel${tab === "treso" ? " active" : ""}`}>
        <InfoBar>
          Vue consolidée des comptes bancaires d&apos;ASTRAEOS et de leur fluctuation. Ajustez le
          pas temporel : journalier, hebdomadaire ou mensuel.
        </InfoBar>

        <div className="grid-3 mb-24">
          {tresoAccounts.map((a) => (
            <div className="kpi clickable" key={a.label}>
              <div className="kpi-label">{a.label}</div>
              <div className="kpi-value">
                {a.value} <span className="unit">€</span>
              </div>
              <div className="kpi-meta">{a.meta}</div>
              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--navy-100)",
                  fontSize: "11px",
                  color: "var(--navy-300)",
                }}
              >
                {a.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-business" />
              </svg>
              Évolution de la trésorerie consolidée
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {tresoPeriodButtons.map((b) => (
                <button
                  key={b.period}
                  className={`qf${tresoView === b.period ? " active" : ""}`}
                  onClick={() => setTresoView(b.period)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            <div className="chart-area treso-view active" style={{ height: "220px" }}>
              <div className="chart-bars">
                {tresoBars[tresoView].map((bar, i) => (
                  <div
                    className={`chart-bar${bar.navy ? " navy" : ""}`}
                    style={{ height: bar.height }}
                    key={i}
                  >
                    {bar.label && <div className="chart-bar-label">{bar.label}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginTop: "36px",
              }}
            >
              {tresoStats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: "10px",
                    background: "var(--ivory)",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: "var(--gold)",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: s.valueColor,
                      marginTop: "4px",
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ONGLET 5 : PRÉVISIONNEL */}
      <div className={`tab-panel${tab === "previ" ? " active" : ""}`}>
        <InfoBar>
          Objectifs financiers fixés en début d&apos;année · projection mensuelle vs réalisé ·
          alerte automatique en cas d&apos;écart significatif.
        </InfoBar>

        <div className="kpis kpis-3 mb-20">
          {previKpis.map((k) => (
            <div className="kpi" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">
                {k.value} <span className="unit">{k.unit}</span>
              </div>
              <div className="kpi-meta">{k.meta}</div>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                Tableau de bord prévisionnel mensuel · 2026
              </span>
              <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>
                ▾ cliquer sur un mois pour modifier ses objectifs
              </span>
            </div>
            <div className="table-toolbar-right">
              <button className="btn btn-gold btn-sm" onClick={() => togglePrevi("global")}>
                <svg>
                  <use href="#i-doc" />
                </svg>
                Modifier les objectifs annuels
              </button>
            </div>
          </div>

          {/* Panneau global d'édition */}
          {openPrevi === "global" && (
            <div className="previ-edit-row open" style={{ display: "block" }}>
              <div className="previ-edit-content">
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg style={{ width: "16px", height: "16px", color: "var(--gold)" }}>
                    <use href="#i-doc" />
                  </svg>
                  Édition des objectifs annuels 2026
                </div>
                <div className="previ-edit-grid">
                  {previGlobalFields.map((f) => (
                    <div className="form-group" key={f.label}>
                      <label className="form-label">{f.label}</label>
                      <input className="form-input" defaultValue={f.value} type="text" />
                      <div className="form-help">{f.help}</div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                    marginTop: "14px",
                  }}
                >
                  <button className="btn btn-ghost btn-sm" onClick={() => togglePrevi("global")}>
                    Annuler
                  </button>
                  <button className="btn btn-gold btn-sm" onClick={() => togglePrevi("global")}>
                    <svg>
                      <use href="#i-success" />
                    </svg>
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}

          <table className="dt">
            <thead>
              <tr>
                <th>Mois</th>
                <th className="num">Objectif CA</th>
                <th className="num">CA réalisé</th>
                <th className="num">Écart</th>
                <th className="num">Objectif charges</th>
                <th className="num">Charges réelles</th>
                <th className="num">Résultat prévu</th>
                <th className="num">Résultat réel</th>
                <th className="center">Modifier</th>
              </tr>
            </thead>
            <tbody>
              {previMonths.map((m) => (
                <PreviRowGroup
                  key={m.id}
                  m={m}
                  open={openPrevi === m.id}
                  onToggle={() => togglePrevi(m.id)}
                />
              ))}
              <tr style={{ background: "var(--ivory)", fontWeight: 700 }}>
                <td>Cumul depuis janv. vs objectifs</td>
                <td className="num cell-money">264 000 €</td>
                <td className="num cell-money gold">251 600 €</td>
                <td className="num">
                  <strong className="down">-5 %</strong>
                </td>
                <td className="num cell-money">210 000 €</td>
                <td className="num cell-money">197 400 €</td>
                <td className="num cell-money">54 000 €</td>
                <td className="num cell-money gold">54 200 €</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ONGLET 6 : DÉFINITIONS */}
      <div className={`tab-panel${tab === "definitions" ? " active" : ""}`}>
        <InfoBar>
          Lexique des indicateurs financiers utilisés dans cette page · pour l&apos;équipe et les
          développeurs · permet à toute personne reprenant le suivi de comprendre les calculs sans
          ambiguïté.
        </InfoBar>

        {definitionBlocks.map((block, bi) => (
          <div className={bi < definitionBlocks.length - 1 ? "card mb-16" : "card"} key={block.title}>
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href={block.icon} />
                </svg>
                {block.title}
              </div>
            </div>
            <div style={{ padding: 0 }}>
              {block.items.map((item) => (
                <div
                  className="finance-detail-row"
                  style={{ flexDirection: "column", alignItems: "flex-start", padding: "14px 18px" }}
                  key={item.term}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--gold)",
                      marginBottom: "4px",
                    }}
                  >
                    {item.term}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--navy)", lineHeight: 1.6 }}>
                    {item.desc}
                  </span>
                  {item.formula && (
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: "11px",
                        color: "var(--medium-400)",
                        background: "var(--ivory)",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        marginTop: "8px",
                      }}
                    >
                      {item.formula}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ChargeCard({ card }: { card: (typeof chargeCards)[number] }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg>
            <use href={card.icon} />
          </svg>
          {card.title}
        </div>
      </div>
      <div className="card-body">
        {card.rows.map((r) => (
          <div
            className="finance-detail-row"
            style={r.bold ? { background: "var(--ivory)" } : undefined}
            key={r.label}
          >
            <span className="finance-detail-label" style={r.bold ? { fontWeight: 700 } : undefined}>
              {r.label}
            </span>
            <span className="finance-detail-value">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviRowGroup({
  m,
  open,
  onToggle,
}: {
  m: (typeof previMonths)[number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="dt-clickable" style={m.rowStyle}>
        <td className="cell-primary">{m.mois}</td>
        <td className="num">{m.objCa}</td>
        <td className={`num ${m.caRealCls ?? ""}`.trim()}>{m.caReal}</td>
        <td className="num">{m.ecart}</td>
        <td className="num">{m.objCharges}</td>
        <td className="num">{m.chargesReal}</td>
        <td className="num">{m.resPrevu}</td>
        <td className={`num ${m.resReelCls ?? ""}`.trim()}>{m.resReel}</td>
        <td className="center">
          <button
            className={`btn btn-sm ${m.goldBtn ? "btn-gold" : "btn-ghost"}`}
            onClick={onToggle}
          >
            <svg>
              <use href="#i-doc" />
            </svg>
          </button>
        </td>
      </tr>
      {open && (
        <tr className="previ-edit-row open">
          <td colSpan={9}>
            <div className="previ-edit-content">
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--navy)",
                  marginBottom: "14px",
                }}
              >
                {m.editTitle}
              </div>
              <div className="previ-edit-grid">
                {m.fields.map((f) => (
                  <div className="form-group" key={f.label}>
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" defaultValue={f.value} type="text" />
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                  marginTop: "14px",
                }}
              >
                <button className="btn btn-ghost btn-sm" onClick={onToggle}>
                  Annuler
                </button>
                <button className="btn btn-gold btn-sm" onClick={onToggle}>
                  {m.saveLabel}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
