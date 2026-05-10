"use client";

import { useState } from "react";
import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";

const kpis: KpiBlock[] = [
  { label: "CA réalisé · mai", value: "42 800", unit: "€", meta: "▲ +18 % vs M-1", trend: "up" },
  { label: "CA encaissé · mai", value: "38 200", unit: "€", meta: "89 % des facturations" },
  { label: "Charges totales · mai", value: "28 400", unit: "€", meta: "▲ +6 % vs M-1", trend: "down" },
  { label: "Marge brute", value: "14 400", unit: "€", meta: "34 % du CA" },
  { label: "Marge nette", value: "9 800", unit: "€", meta: "23 % du CA" },
  { label: "Trésorerie disponible", value: "128 600", unit: "€", meta: "3 comptes bancaires" },
  { label: "Autonomie financière", value: "4,5", unit: "mois", meta: "au taux de charges actuel" },
];

const TABS = [
  { id: "resultat", label: "Compte de résultat" },
  { id: "detail-ca", label: "Détail du CA généré / encaissé" },
  { id: "detail-charges", label: "Détail des charges" },
  { id: "treso", label: "Trésorerie" },
  { id: "previ", label: "Prévisionnel" },
  { id: "definitions", label: "Définitions" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function FinancePage() {
  const [tab, setTab] = useState<TabId>("resultat");

  return (
    <>
      <Topbar current="Finance consolidée" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Pilotage interne"
          title="Finance consolidée"
          description="Pilotage financier complet d'ASTRAEOS — compte de résultat avec évolution N/N-1, détail du CA généré, détail des charges par poste, trésorerie multi-comptes, prévisionnel et marge par client."
          actions={
            <>
              <GhostButton>Export comptable</GhostButton>
              <GoldButton>🔌 Connexion Qonto</GoldButton>
            </>
          }
        />

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--navy-100)]">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-[12px] font-semibold ${
                tab === t.id
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "border-transparent text-[var(--navy-300)] hover:text-[var(--navy)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "resultat" && <TabResultat />}
        {tab === "detail-ca" && <TabDetailCa />}
        {tab === "detail-charges" && <TabDetailCharges />}
        {tab === "treso" && <TabTreso />}
        {tab === "previ" && <TabPrevi />}
        {tab === "definitions" && <TabDefinitions />}
      </div>
    </>
  );
}

function InfoBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
      <span>ℹ️</span>
      <div>{children}</div>
    </div>
  );
}

type Row = { label: string; cells: (string | { v: string; tone?: "up" | "down" | "gold" })[]; tone?: "section" | "sub" | "highlight" | "ebitda" | "net" };

const resultatRows: Row[] = [
  { tone: "section", label: "▾ Produits d'exploitation", cells: [] },
  { label: "Chiffre d'affaires · Abonnements packs récurrents", cells: ["142 000 €", "98 400 €", { v: "▲ +44 %", tone: "up" }, "258 200 €"] },
  { label: "Chiffre d'affaires · Packs unitaires & ponctuels", cells: ["62 800 €", "48 200 €", { v: "▲ +30 %", tone: "up" }, "112 400 €"] },
  { label: "Chiffre d'affaires · Formations & supervisions", cells: ["28 600 €", "22 100 €", { v: "▲ +29 %", tone: "up" }, "52 800 €"] },
  { label: "Commissions partenariats commerciaux", cells: ["18 200 €", "9 400 €", { v: "▲ +94 %", tone: "up" }, "24 600 €"] },
  { tone: "sub", label: "Total chiffre d'affaires", cells: [{ v: "251 600 €", tone: "gold" }, "178 100 €", { v: "▲ +41 %", tone: "up" }, "448 000 €"] },
  { label: "Production stockée & immobilisée", cells: ["— €", "— €", "—", "— €"] },
  { label: "Subventions d'exploitation", cells: ["2 400 €", "— €", { v: "— → 2 400 €", tone: "up" }, "— €"] },
  { tone: "highlight", label: "Total produits d'exploitation", cells: [{ v: "254 000 €", tone: "gold" }, "178 100 €", { v: "▲ +43 %", tone: "up" }, "448 000 €"] },

  { tone: "section", label: "▾ Charges d'exploitation", cells: [] },
  { label: "Achats & services extérieurs (outils, hébergement)", cells: ["28 400 €", "22 600 €", { v: "▲ +26 %", tone: "down" }, "52 200 €"] },
  { label: "Honoraires & prestataires externes", cells: ["42 800 €", "38 400 €", { v: "▲ +11 %", tone: "down" }, "82 600 €"] },
  { label: "Salaires & charges sociales", cells: ["98 400 €", "62 200 €", { v: "▲ +58 %", tone: "down" }, "152 800 €"] },
  { label: "Marketing & publicité", cells: ["14 200 €", "8 600 €", { v: "▲ +65 %", tone: "down" }, "21 400 €"] },
  { label: "Locations, déplacements, autres", cells: ["8 200 €", "6 800 €", { v: "▲ +21 %", tone: "down" }, "16 200 €"] },
  { label: "Dotations aux amortissements & provisions", cells: ["3 600 €", "2 800 €", { v: "▲ +29 %", tone: "down" }, "6 800 €"] },
  { tone: "sub", label: "Total charges d'exploitation", cells: ["195 600 €", "141 400 €", { v: "▲ +38 %", tone: "down" }, "332 000 €"] },

  { tone: "ebitda", label: "Résultat d'exploitation (EBITDA)", cells: ["58 400 €", "36 700 €", { v: "▲ +59 %", tone: "up" }, "116 000 €"] },

  { tone: "section", label: "▾ Résultat financier & net", cells: [] },
  { label: "Charges financières (intérêts, frais bancaires)", cells: ["1 800 €", "1 200 €", { v: "▲ +50 %", tone: "down" }, "2 800 €"] },
  { label: "Produits financiers (intérêts trésorerie)", cells: ["820 €", "120 €", { v: "▲ +583 %", tone: "up" }, "380 €"] },
  { tone: "sub", label: "Résultat avant impôt", cells: ["57 420 €", "35 620 €", { v: "▲ +61 %", tone: "up" }, "113 580 €"] },
  { label: "Impôt sur les sociétés (estimation)", cells: ["14 360 €", "8 905 €", { v: "▲ +61 %", tone: "down" }, "28 400 €"] },
  { tone: "net", label: "Résultat net", cells: [{ v: "43 060 €", tone: "gold" }, "26 715 €", { v: "▲ +61 %", tone: "up" }, "85 180 €"] },
];

const cellTone = {
  up: "text-[var(--green-text)]",
  down: "text-[var(--red-text)]",
  gold: "text-[var(--gold)]",
} as const;

function TabResultat() {
  return (
    <>
      <InfoBar>
        Reconstitution du compte de résultat avec comparaison{" "}
        <strong>année en cours vs N-1</strong> et évolution. Données arrêtées au{" "}
        <strong>06 mai 2026</strong>.
      </InfoBar>

      <div className="rounded-md border border-[var(--navy-100)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Année en cours", active: true },
              { label: "Cumul depuis janv. → mai 2026" },
              { label: "Trimestre Q2" },
              { label: "12 derniers mois" },
            ].map((p) => (
              <button
                type="button"
                key={p.label}
                data-stub={`Filtre période · ${p.label}`}
                className={`rounded-md px-3 py-1.5 text-[11.5px] font-semibold ${
                  p.active
                    ? "bg-[var(--navy)] text-white"
                    : "border border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-[var(--navy-300)]">Évolution affichée vs N-1</span>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              <th className="px-4 py-3" style={{ width: "45%" }}>Compte</th>
              <th className="px-4 py-3 text-right">2026 (cumul)</th>
              <th className="px-4 py-3 text-right">2025 (cumul)</th>
              <th className="px-4 py-3 text-right">Évolution</th>
              <th className="px-4 py-3 text-right">2025 (annuel)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--navy-100)]">
            {resultatRows.map((row, i) => {
              if (row.tone === "section") {
                return (
                  <tr key={i} className="bg-[var(--ivory)]">
                    <td colSpan={5} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--navy-300)]">
                      {row.label}
                    </td>
                  </tr>
                );
              }
              const rowClass =
                row.tone === "highlight"
                  ? "bg-[var(--gold-200)] font-bold"
                  : row.tone === "sub"
                    ? "bg-[var(--ivory)] font-bold"
                    : row.tone === "ebitda"
                      ? "bg-[var(--green-bg)] font-bold text-[var(--green-text)]"
                      : row.tone === "net"
                        ? "bg-[var(--gold-200)] font-bold"
                        : "";
              return (
                <tr key={i} className={`text-[12px] text-[var(--navy)] ${rowClass}`}>
                  <td className="px-4 py-2.5">{row.label}</td>
                  {row.cells.map((c, j) => {
                    if (typeof c === "string")
                      return (
                        <td key={j} className="px-4 py-2.5 text-right tabular-nums">
                          {c}
                        </td>
                      );
                    return (
                      <td key={j} className={`px-4 py-2.5 text-right tabular-nums font-semibold ${c.tone ? cellTone[c.tone] : ""}`}>
                        {c.v}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

const caBreakdown = [
  { icon: "📦", label: "Abonnements packs récurrents", pct: "(56 %)", value: "142 000 €" },
  { icon: "🛒", label: "Packs unitaires & ponctuels", pct: "(25 %)", value: "62 800 €" },
  { icon: "🎓", label: "Formations & supervisions", pct: "(11 %)", value: "28 600 €" },
  { icon: "🤝", label: "Commissions partenaires", pct: "(7 %)", value: "18 200 €" },
];

const caEvolutionMonths = [
  { month: "Janv", h: 42 },
  { month: "Févr", h: 48 },
  { month: "Mars", h: 55 },
  { month: "Avril", h: 68 },
  { month: "Mai*", h: 82, current: true },
];

const caDetailRows = [
  { name: "Pack Investissements · Abonnement portefeuille", subs: "18 actifs", gen: "78 300 €", enc: "76 488 €", rest: "1 812 €", pca: "— €", part: "31 %" },
  { name: "Pack Investissements · Constitution portefeuille", subs: "22", gen: "22 000 €", enc: "22 000 €", rest: "— €", pca: "— €", part: "9 %" },
  { name: "Bibliothèque de documents actualisés", subs: "14", gen: "13 860 €", enc: "13 860 €", rest: "— €", pca: "— €", part: "5,5 %" },
  { name: "Rédaction et immatriculation de société", subs: "8", gen: "9 600 €", enc: "8 400 €", rest: "1 200 €", pca: "— €", part: "4 %" },
  { name: "Pack Supervision d'études", subs: "22", gen: "17 600 €", enc: "17 600 €", rest: "— €", pca: "— €", part: "7 %" },
  { name: "Pack Formation", subs: "11", gen: "11 000 €", enc: "11 000 €", rest: "— €", pca: "— €", part: "4,5 %" },
  { name: "Commissions Partenaire Immobilier", subs: "8 dossiers", gen: "11 200 €", enc: "9 800 €", rest: "1 400 €", pca: "— €", part: "4,5 %" },
  { name: "Commissions Partenaire Assurance", subs: "14 dossiers", gen: "7 000 €", enc: "6 200 €", rest: "800 €", pca: "— €", part: "2,5 %" },
];

const projectionMonths = [
  { m: "Mai*", v: "3 317 €" },
  { m: "Juin", v: "3 317 €" },
  { m: "Juil", v: "3 317 €" },
  { m: "Août", v: "3 317 €" },
  { m: "Sept", v: "3 317 €" },
  { m: "Oct", v: "3 317 €" },
  { m: "Nov", v: "3 317 €" },
  { m: "Déc", v: "3 323 €" },
];

function TabDetailCa() {
  return (
    <>
      <InfoBar>
        Décomposition fine du chiffre d'affaires par source de revenu — visualisez d'où vient chaque
        euro encaissé.
      </InfoBar>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
            📊 Répartition du CA par source · cumul depuis janv. 2026
          </div>
          <div className="p-4">
            <div className="mb-2 flex justify-between rounded-md bg-[var(--ivory)] px-4 py-2.5 text-[12.5px]">
              <span className="font-bold text-[var(--navy)]">Total · cumul depuis janv. 2026</span>
              <span className="font-bold text-[var(--gold)]">251 600 €</span>
            </div>
            {caBreakdown.map((c) => (
              <div key={c.label} className="flex justify-between border-b border-[var(--navy-100)] px-2 py-2.5 text-[12.5px] last:border-0">
                <span className="text-[var(--navy)]">
                  {c.icon} {c.label}{" "}
                  <span className="text-[var(--navy-300)]">{c.pct}</span>
                </span>
                <span className="font-semibold text-[var(--navy)]">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
            📈 Évolution mensuelle du CA
          </div>
          <div className="p-6">
            <div className="flex h-[180px] items-end gap-3">
              {caEvolutionMonths.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-sm ${m.current ? "bg-[var(--navy)]" : "bg-gradient-to-t from-[var(--gold)] to-[var(--gold-300)]"}`}
                    style={{ height: `${m.h}%` }}
                  />
                  <div className="text-[10px] font-semibold text-[var(--navy-300)]">{m.month}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-[11px] text-[var(--navy-300)]">
              * Mai en cours — projection à fin de mois : 48 600 €
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
          <span className="text-[13px] font-bold text-[var(--navy)]">
            Détail généré vs encaissé · cumul depuis janv. 2026
          </span>
          <span className="text-[11px] text-[var(--navy-300)]">
            Permet d'identifier les <strong>produits constatés d'avance</strong> (PCA)
          </span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              <th className="px-4 py-3">Pack / source</th>
              <th className="px-4 py-3 text-right">Souscriptions</th>
              <th className="px-4 py-3 text-right">CA généré</th>
              <th className="px-4 py-3 text-right">CA encaissé</th>
              <th className="px-4 py-3 text-right">Reste à encaisser</th>
              <th className="px-4 py-3 text-right">PCA · à étaler</th>
              <th className="px-4 py-3 text-right">Part du CA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--navy-100)]">
            {caDetailRows.map((r) => (
              <tr key={r.name} className="text-[12px] text-[var(--navy)]">
                <td className="px-4 py-2.5 font-semibold">{r.name}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.subs}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.gen}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.enc}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.rest}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.pca}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.part}</td>
              </tr>
            ))}
            <tr className="bg-[#E5DCEB] text-[12px] text-[var(--navy)]">
              <td className="px-4 py-2.5 font-semibold">
                Abonnements annuels payés d'avance (4 clients)
              </td>
              <td className="px-4 py-2.5 text-right">4 actifs</td>
              <td className="px-4 py-2.5 text-right tabular-nums">63 700 €</td>
              <td className="px-4 py-2.5 text-right tabular-nums">63 700 €</td>
              <td className="px-4 py-2.5 text-right tabular-nums">— €</td>
              <td className="px-4 py-2.5 text-right font-bold tabular-nums text-[#5B3A6E]">
                26 542 €
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">25 %</td>
            </tr>
            <tr className="bg-[var(--gold-200)] font-bold text-[12px] text-[var(--navy)]">
              <td className="px-4 py-3">Total · cumul depuis janv. 2026</td>
              <td />
              <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">234 260 €</td>
              <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">229 048 €</td>
              <td className="px-4 py-3 text-right tabular-nums">5 212 €</td>
              <td className="px-4 py-3 text-right tabular-nums text-[#5B3A6E]">26 542 €</td>
              <td className="px-4 py-3 text-right tabular-nums">100 %</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-[var(--navy-100)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
          <div className="text-[13px] font-semibold text-[var(--navy)]">
            📈 Projection des encaissements à venir · jusqu'à fin 2026
          </div>
          <span className="rounded-full bg-[#E5DCEB] px-2 py-0.5 text-[10px] font-bold text-[#5B3A6E]">
            Calculé sur abonnements annuels en cours
          </span>
        </div>
        <div className="p-4">
          <InfoBar>
            Pour les <strong>4 clients</strong> ayant payé un abonnement annuel d'avance, le revenu
            est étalé sur 12 mois en comptabilité. Voici la décomposition mois par mois pour le
            reste de l'année.
          </InfoBar>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {projectionMonths.map((m) => (
              <div
                key={m.m}
                className="rounded-md border border-[#E5DCEB] bg-[var(--ivory)] py-2.5 text-center"
              >
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#5B3A6E]">
                  {m.m}
                </div>
                <div className="mt-1 text-[13px] font-bold text-[var(--navy)]">{m.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-md bg-gradient-to-r from-[var(--gold-200)] to-[var(--ivory)] px-4 py-3">
            <span className="text-[12px] font-bold text-[var(--navy)]">
              Total CA récurrent à reconnaître mai → décembre 2026
            </span>
            <span className="text-[18px] font-bold text-[var(--gold)]">26 542 €</span>
          </div>
        </div>
      </div>
    </>
  );
}

const chargesGroups = [
  {
    title: "Charges humaines · 72 % des charges",
    icon: "👥",
    rows: [
      { label: "Salaires & charges sociales (6 salariés)", value: "98 400 €" },
      { label: "Honoraires prestataires externes (commerciaux, dev)", value: "42 800 €" },
    ],
    subtotal: { label: "Sous-total charges humaines", value: "141 200 €" },
  },
  {
    title: "Outils SaaS & infrastructure · 14 %",
    icon: "🖥️",
    rows: [
      { label: "Hébergement & cloud (AWS, OVH)", value: "8 400 €" },
      { label: "Licences logicielles (GitHub, Linear, Notion…)", value: "12 200 €" },
      { label: "Outils data & intégrations API", value: "7 800 €" },
    ],
    subtotal: { label: "Sous-total outils SaaS", value: "28 400 €" },
  },
  {
    title: "Marketing & publicité · 7 %",
    icon: "📢",
    rows: [
      { label: "LinkedIn Ads & Google Ads", value: "8 600 €" },
      { label: "Production contenus (vidéos, articles, podcasts)", value: "3 200 €" },
      { label: "Salons professionnels & événements", value: "2 400 €" },
    ],
    subtotal: { label: "Sous-total marketing", value: "14 200 €" },
  },
  {
    title: "Autres charges · 7 %",
    icon: "💼",
    rows: [
      { label: "Locations bureaux & charges", value: "4 200 €" },
      { label: "Honoraires juridiques & comptables", value: "3 600 €" },
      { label: "Déplacements & restauration", value: "2 200 €" },
      { label: "Dotations & provisions", value: "3 600 €" },
    ],
    subtotal: { label: "Sous-total autres", value: "13 600 €" },
  },
];

function TabDetailCharges() {
  return (
    <>
      <InfoBar>
        Décomposition des charges par poste pour identifier les principaux centres de coûts
        d'ASTRAEOS.
      </InfoBar>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {chargesGroups.map((g) => (
          <div key={g.title} className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
              {g.icon} {g.title}
            </div>
            <div className="p-4">
              {g.rows.map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between border-b border-[var(--navy-100)] py-2 text-[12px] last:border-0"
                >
                  <span className="text-[var(--navy-300)]">{r.label}</span>
                  <span className="font-semibold text-[var(--navy)]">{r.value}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between rounded-md bg-[var(--ivory)] px-3 py-2 text-[12px]">
                <span className="font-bold text-[var(--navy)]">{g.subtotal.label}</span>
                <span className="font-bold text-[var(--navy)]">{g.subtotal.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-[var(--gold-300)] bg-gradient-to-br from-[var(--ivory)] to-[var(--gold-200)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-[var(--navy-300)]">
              Total charges · cumul depuis janv. 2026
            </div>
            <div className="text-[13px] text-[var(--navy)]">
              Charges humaines + Outils SaaS + Marketing + Autres
            </div>
          </div>
          <div className="text-[32px] font-bold text-[var(--gold)]">197 400 €</div>
        </div>
      </div>
    </>
  );
}

const accounts = [
  {
    label: "Compte Courant Qonto",
    value: "82 400",
    meta: "Compte principal d'exploitation · IBAN ...4321",
    delta: "▲ +4 200 € sur 7 jours",
  },
  {
    label: "Livret épargne BNP",
    value: "38 200",
    meta: "Trésorerie placée · 3,2 % rendement",
    delta: "▲ +102 € intérêts mai",
  },
  {
    label: "Compte secondaire Boursobank",
    value: "8 000",
    meta: "Réserve de précaution · IBAN ...9876",
    delta: "stable",
  },
];

const tresoMonths = [
  { m: "Juin 25", h: 38 },
  { m: "Juil 25", h: 42 },
  { m: "Août 25", h: 48 },
  { m: "Sept 25", h: 52 },
  { m: "Oct 25", h: 58 },
  { m: "Nov 25", h: 62 },
  { m: "Déc 25", h: 64 },
  { m: "Janv 26", h: 68 },
  { m: "Févr 26", h: 72 },
  { m: "Mars 26", h: 78 },
  { m: "Avril 26", h: 82 },
  { m: "Mai 26", h: 88, current: true },
];

function TabTreso() {
  const [view, setView] = useState("Mois (12 derniers)");
  const views = [
    "Jour (30 derniers)",
    "Semaine (12 dernières)",
    "Mois (12 derniers)",
    "Trimestre (8 derniers)",
    "Année (5 dernières)",
  ];

  return (
    <>
      <InfoBar>
        Vue consolidée des comptes bancaires d'ASTRAEOS et de leur fluctuation. Ajustez le pas
        temporel : journalier, hebdomadaire ou mensuel.
      </InfoBar>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {accounts.map((a) => (
          <div
            key={a.label}
            className="cursor-pointer rounded-md border border-[var(--navy-100)] bg-white p-4 hover:shadow-sm"
          >
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              {a.label}
            </div>
            <div className="my-1 text-[24px] font-bold leading-none text-[var(--navy)]">
              {a.value} <span className="text-[14px] font-semibold text-[var(--navy-300)]">€</span>
            </div>
            <div className="text-[11px] text-[var(--navy-300)]">{a.meta}</div>
            <div className="mt-2.5 border-t border-[var(--navy-100)] pt-2.5 text-[11px] text-[var(--navy-300)]">
              {a.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-[var(--navy-100)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
          <div className="text-[13px] font-semibold text-[var(--navy)]">
            📈 Évolution de la trésorerie consolidée
          </div>
          <div className="flex flex-wrap gap-1">
            {views.map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-[11px] font-semibold ${
                  view === v
                    ? "bg-[var(--navy)] text-white"
                    : "border border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="flex h-[220px] items-end gap-2">
            {tresoMonths.map((m) => (
              <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-sm ${m.current ? "bg-[var(--gold)]" : "bg-[var(--navy)]"}`}
                  style={{ height: `${m.h}%` }}
                />
                <div className="text-[9px] font-semibold text-[var(--navy-300)]">{m.m}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const previKpis: KpiBlock[] = [
  { label: "Objectif CA 2026", value: "680 000", unit: "€", meta: "37 % atteint à mi-mai" },
  {
    label: "Objectif charges 2026",
    value: "480 000",
    unit: "€",
    meta: "41 % consommés à mi-mai",
  },
  { label: "Objectif résultat net", value: "160 000", unit: "€", meta: "27 % atteint" },
];

type PreviRow = {
  month: string;
  objCa: string;
  realCa: string;
  ecart: { v: string; tone?: "up" | "down" };
  objCharges: string;
  realCharges: string;
  prev: string;
  real: string;
  current?: boolean;
};

const previRows: PreviRow[] = [
  { month: "Janvier", objCa: "42 000 €", realCa: "38 800 €", ecart: { v: "-7 %", tone: "down" }, objCharges: "38 000 €", realCharges: "36 200 €", prev: "4 000 €", real: "2 600 €" },
  { month: "Février", objCa: "48 000 €", realCa: "42 400 €", ecart: { v: "-12 %", tone: "down" }, objCharges: "40 000 €", realCharges: "38 600 €", prev: "8 000 €", real: "3 800 €" },
  { month: "Mars", objCa: "54 000 €", realCa: "52 600 €", ecart: { v: "≈" }, objCharges: "42 000 €", realCharges: "42 800 €", prev: "12 000 €", real: "9 800 €" },
  { month: "Avril", objCa: "58 000 €", realCa: "62 200 €", ecart: { v: "+7 %", tone: "up" }, objCharges: "44 000 €", realCharges: "44 200 €", prev: "14 000 €", real: "18 000 €" },
  { month: "Mai (en cours)", objCa: "62 000 €", realCa: "42 800 €", ecart: { v: "— en cours" }, objCharges: "46 000 €", realCharges: "28 400 €", prev: "16 000 €", real: "— en cours", current: true },
  { month: "Juin (objectif)", objCa: "66 000 €", realCa: "—", ecart: { v: "—" }, objCharges: "48 000 €", realCharges: "—", prev: "18 000 €", real: "—" },
];

function TabPrevi() {
  return (
    <>
      <InfoBar>
        Objectifs financiers fixés en début d'année · projection mensuelle vs réalisé · alerte
        automatique en cas d'écart significatif.
      </InfoBar>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {previKpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>

      <div className="rounded-md border border-[var(--navy-100)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
          <div>
            <span className="text-[13px] font-bold text-[var(--navy)]">
              Tableau de bord prévisionnel mensuel · 2026
            </span>
            <span className="ml-3 text-[11px] text-[var(--navy-300)]">
              ▾ cliquer sur un mois pour modifier ses objectifs
            </span>
          </div>
          <GoldButton>📝 Modifier les objectifs annuels</GoldButton>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              <th className="px-4 py-3">Mois</th>
              <th className="px-4 py-3 text-right">Obj. CA</th>
              <th className="px-4 py-3 text-right">CA réalisé</th>
              <th className="px-4 py-3 text-right">Écart</th>
              <th className="px-4 py-3 text-right">Obj. charges</th>
              <th className="px-4 py-3 text-right">Charges réelles</th>
              <th className="px-4 py-3 text-right">Résultat prévu</th>
              <th className="px-4 py-3 text-right">Résultat réel</th>
              <th className="px-4 py-3 text-center">Modifier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--navy-100)]">
            {previRows.map((r) => (
              <tr
                key={r.month}
                className={`text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)] ${r.current ? "bg-[var(--gold-200)]" : ""}`}
              >
                <td className="px-4 py-2.5 font-semibold">{r.month}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.objCa}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.realCa}</td>
                <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${r.ecart.tone ? cellTone[r.ecart.tone] : ""}`}>
                  {r.ecart.v}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.objCharges}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.realCharges}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.prev}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.real}</td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    type="button"
                    data-stub="Annoter cette ligne du compte de résultat"
                    className={`rounded-md border px-2 py-1 text-[11px] ${r.current ? "border-[var(--gold)] bg-[var(--gold)] text-white" : "border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"}`}
                  >
                    📝
                  </button>
                </td>
              </tr>
            ))}
            <tr className="bg-[var(--ivory)] text-[12px] font-bold text-[var(--navy)]">
              <td className="px-4 py-3">Cumul depuis janv. vs objectifs</td>
              <td className="px-4 py-3 text-right tabular-nums">264 000 €</td>
              <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">251 600 €</td>
              <td className="px-4 py-3 text-right tabular-nums text-[var(--red-text)]">-5 %</td>
              <td className="px-4 py-3 text-right tabular-nums">210 000 €</td>
              <td className="px-4 py-3 text-right tabular-nums">197 400 €</td>
              <td className="px-4 py-3 text-right tabular-nums">54 000 €</td>
              <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">54 200 €</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

const definitions = [
  {
    title: "1. Produits — Chiffre d'affaires",
    icon: "📈",
    items: [
      {
        term: "Chiffre d'affaires généré",
        desc: "Total des montants facturés sur la période, qu'ils soient encaissés ou non. Inclut les abonnements packs récurrents, les packs unitaires, les formations, les supervisions et les commissions des partenariats.",
        formula: "CA généré = Σ(factures émises sur la période)",
      },
      {
        term: "Chiffre d'affaires encaissé",
        desc: "Total des paiements réellement perçus sur la période. Peut être inférieur au CA généré si certaines factures sont en attente de règlement.",
        formula: "CA encaissé = Σ(paiements reçus sur la période)",
      },
      {
        term: "Produits constatés d'avance (PCA)",
        desc: "Quand un client paye un abonnement annuel d'avance, le revenu est étalé sur 12 mois en comptabilité. Le montant non encore \"consommé\" est un produit constaté d'avance, à reconnaître progressivement.",
        formula: "PCA = montant payé d'avance × (mois restants ÷ 12)",
      },
    ],
  },
  {
    title: "2. Charges d'exploitation",
    icon: "💸",
    items: [
      {
        term: "Charges d'exploitation",
        desc: "Total des coûts engagés pour faire tourner l'activité : salaires & charges sociales, prestataires externes, hébergement cloud, licences SaaS, marketing, locations, déplacements, dotations aux amortissements.",
      },
      {
        term: "Charges humaines",
        desc: "Salaires bruts + charges sociales (employeur + salariales) + honoraires des prestataires externes (commerciaux indépendants, développeur freelance, etc.).",
      },
    ],
  },
  {
    title: "3. Soldes intermédiaires de gestion",
    icon: "📊",
    items: [
      {
        term: "Marge brute",
        desc: "Différence entre le CA et les charges directes (charges variables liées à l'activité : hébergement par client, support direct…).",
        formula: "Marge brute = CA − charges directes variables",
      },
      {
        term: "Résultat d'exploitation (EBITDA)",
        desc: "Bénéfice généré par l'activité avant prise en compte des intérêts financiers, impôts, dotations aux amortissements et provisions.",
        formula: "EBITDA = Produits exploitation − Charges exploitation (hors dotations)",
      },
      {
        term: "Résultat avant impôt",
        desc: "EBITDA + produits financiers − charges financières − dotations aux amortissements.",
        formula: "RAI = EBITDA − dotations + produits financiers − charges financières",
      },
      {
        term: "Marge nette / Résultat net",
        desc: "Bénéfice après impôt sur les sociétés. C'est ce qui revient à l'entreprise et peut être réinvesti, distribué ou mis en réserve.",
        formula: "Résultat net = Résultat avant impôt − Impôt sur les sociétés",
      },
    ],
  },
  {
    title: "4. Trésorerie",
    icon: "🏦",
    items: [
      {
        term: "Trésorerie disponible",
        desc: "Somme de tous les soldes des comptes bancaires d'ASTRAEOS (compte courant, livret épargne, comptes secondaires).",
      },
      {
        term: "Autonomie financière",
        desc: "Nombre de mois pendant lesquels ASTRAEOS peut fonctionner avec la trésorerie actuelle, au taux moyen actuel des charges, sans aucun encaissement.",
        formula: "Autonomie = Trésorerie ÷ Charges mensuelles moyennes",
      },
    ],
  },
  {
    title: "5. Indicateurs SaaS spécifiques",
    icon: "📈",
    items: [
      {
        term: "Revenu mensuel récurrent (MRR)",
        desc: "Somme de tous les abonnements mensuels actifs. Indicateur clé de la santé d'un SaaS car il représente le revenu prévisible récurrent.",
        formula: "MRR = Σ(abonnements mensuels actifs)",
      },
      {
        term: "Revenu annuel récurrent (ARR)",
        desc: "Projection annuelle du MRR : MRR × 12 mois. Permet de visualiser l'ordre de grandeur du revenu récurrent annualisé.",
      },
      {
        term: "Cumul depuis janvier (anciennement YTD)",
        desc: "Total cumulé d'un indicateur depuis le 1er janvier de l'année en cours jusqu'à la date actuelle. Permet de comparer N vs N-1 sur la même période écoulée.",
      },
    ],
  },
];

function TabDefinitions() {
  return (
    <>
      <InfoBar>
        Lexique des indicateurs financiers utilisés dans cette page · pour l'équipe et les
        développeurs · permet à toute personne reprenant le suivi de comprendre les calculs sans
        ambiguïté.
      </InfoBar>

      <div className="flex flex-col gap-4">
        {definitions.map((def) => (
          <div key={def.title} className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
              {def.icon} {def.title}
            </div>
            <div>
              {def.items.map((it, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 border-b border-[var(--navy-100)] px-5 py-4 last:border-0"
                >
                  <span className="text-[13px] font-bold text-[var(--gold)]">{it.term}</span>
                  <span className="text-[12px] leading-relaxed text-[var(--navy)]">{it.desc}</span>
                  {it.formula && (
                    <span className="rounded-md bg-[var(--ivory)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--medium-400)]">
                      {it.formula}
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
