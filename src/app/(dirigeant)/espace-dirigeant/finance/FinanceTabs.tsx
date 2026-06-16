"use client";

import { useState } from "react";
import { KpiCard, type KpiBlock } from "../../../(editeur)/_components/KpiCard";

export type EngineerCommissionRow = {
  initiales: string;
  nom: string;
  ca: number;
  reverse: number;
  encaisse: number;
  pending: number;
};

export type FinanceData = {
  kpis: KpiBlock[];
  arretedAu: string;
  // Compte de résultat cabinet
  honorairesGenere: number;
  honorairesEncaisse: number;
  apportsGenere: number;
  apportsEncaisse: number;
  totalGenere: number;
  totalEncaisse: number;
  resteAEncaisser: number;
  reverseIngenieurs: number;
  // Détail honoraires / apports
  honorairesKpis: KpiBlock[];
  sourceRows: {
    source: string;
    type: "Honoraires" | "Apports";
    subs: number;
    gen: number;
    enc: number;
    rest: number;
  }[];
  categoryBreakdown: { label: string; value: number }[];
  // Commissions ingénieurs
  commRows: EngineerCommissionRow[];
  totalReverse: number;
  hasData: boolean;
};

const TABS = [
  { id: "resultat", label: "Compte de résultat cabinet" },
  { id: "honoraires", label: "Détail honoraires & apports" },
  { id: "charges", label: "Détail des charges" },
  { id: "treso", label: "Trésorerie" },
  { id: "commissions", label: "Répartition commissions ingénieurs" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function fmt(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "— €";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}
function pct(part: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((part / total) * 100)} %`;
}

function InfoBar({ children, dashed }: { children: React.ReactNode; dashed?: boolean }) {
  return (
    <div
      className={`mb-3 flex items-start gap-2 rounded-md border bg-[var(--light-blue)] px-4 py-3 text-[11.5px] ${dashed ? "border-dashed border-[var(--navy-100)] text-[var(--navy-300)]" : "border-[var(--navy-100)] text-[var(--navy)]"}`}
    >
      <span>ℹ️</span>
      <div>{children}</div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
      <div className="mb-3 text-[40px] leading-none">🚧</div>
      <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">{children}</p>
    </section>
  );
}

export function FinanceTabs({ data }: { data: FinanceData }) {
  const [tab, setTab] = useState<TabId>("resultat");

  return (
    <>
      <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {data.kpis.map((k) => (
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

      {tab === "resultat" && <TabResultat data={data} />}
      {tab === "honoraires" && <TabHonoraires data={data} />}
      {tab === "charges" && <TabCharges />}
      {tab === "treso" && <TabTreso />}
      {tab === "commissions" && <TabCommissions data={data} />}
    </>
  );
}

type CdrRow = { label: string; generated: number; encaisse: number; tone?: "section" | "sub" | "net" };

function TabResultat({ data }: { data: FinanceData }) {
  const rows: CdrRow[] = [
    { tone: "section", label: "Produits perçus par le cabinet", generated: 0, encaisse: 0 },
    { label: "Honoraires d'études (study_fee)", generated: data.honorairesGenere, encaisse: data.honorairesEncaisse },
    { label: "Apports d'affaires (upfront, gestion, performance)", generated: data.apportsGenere, encaisse: data.apportsEncaisse },
    { tone: "sub", label: "Total produits cabinet", generated: data.totalGenere, encaisse: data.totalEncaisse },
    { tone: "section", label: "Reversements", generated: 0, encaisse: 0 },
    { label: "Commissions reversées aux ingénieurs", generated: data.reverseIngenieurs, encaisse: data.reverseIngenieurs },
    { tone: "net", label: "Net cabinet après reversements", generated: data.totalGenere - data.reverseIngenieurs, encaisse: data.totalEncaisse - data.reverseIngenieurs },
  ];

  return (
    <>
      <InfoBar>
        Compte de résultat du cabinet reconstitué à partir des <strong>commissions</strong> (part
        cabinet, <em>recipient_type = cabinet</em>) jointes aux souscriptions. « Généré » = toutes
        commissions ; « Encaissé » = statut <em>received / reconciled</em>. Données arrêtées au{" "}
        <strong>{data.arretedAu}</strong>.
      </InfoBar>

      {!data.hasData ? (
        <EmptyState>
          Aucune commission enregistrée pour ce cabinet. Le compte de résultat s&apos;affichera dès
          que des souscriptions et commissions seront saisies en base.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-4 py-3" style={{ width: "55%" }}>Poste</th>
                <th className="px-4 py-3 text-right">Généré</th>
                <th className="px-4 py-3 text-right">Encaissé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              {rows.map((row, i) => {
                if (row.tone === "section") {
                  return (
                    <tr key={i} className="bg-[var(--ivory)]">
                      <td colSpan={3} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--navy-300)]">
                        ▾ {row.label}
                      </td>
                    </tr>
                  );
                }
                const cls = row.tone === "sub" ? "bg-[var(--ivory)] font-bold" : row.tone === "net" ? "bg-[var(--gold-200)] font-bold" : "";
                return (
                  <tr key={i} className={`text-[12px] text-[var(--navy)] ${cls}`}>
                    <td className="px-4 py-2.5">{row.label}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(row.generated)}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${row.tone === "net" ? "text-[var(--gold)]" : ""}`}>{fmt(row.encaisse)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function TabHonoraires({ data }: { data: FinanceData }) {
  const totalCat = data.categoryBreakdown.reduce((a, c) => a + c.value, 0);
  const totalGen = data.sourceRows.reduce((a, r) => a + r.gen, 0);
  const totalEnc = data.sourceRows.reduce((a, r) => a + r.enc, 0);
  const totalRest = data.sourceRows.reduce((a, r) => a + r.rest, 0);

  return (
    <>
      <InfoBar>
        Décomposition du CA généré par <strong>commission_type</strong> — honoraires d&apos;études
        (<em>study_fee</em>) vs apports d&apos;affaires (<em>upfront / recurring_management /
        performance</em>) — et par <strong>catégorie de produit</strong>. Le reste à encaisser
        correspond aux commissions <strong>status = pending</strong>.
      </InfoBar>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.honorairesKpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </section>

      {data.categoryBreakdown.length > 0 && (
        <div className="mb-6 rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
            📊 Répartition par catégorie de produit
          </div>
          <div className="p-4">
            <div className="mb-2 flex justify-between rounded-md bg-[var(--ivory)] px-4 py-2.5 text-[12.5px]">
              <span className="font-bold text-[var(--navy)]">Total généré · part cabinet</span>
              <span className="font-bold text-[var(--gold)]">{fmt(totalCat)}</span>
            </div>
            {data.categoryBreakdown.map((c) => (
              <div key={c.label} className="flex justify-between border-b border-[var(--navy-100)] px-2 py-2.5 text-[12.5px] last:border-0">
                <span className="text-[var(--navy)]">
                  {c.label} <span className="text-[var(--navy-300)]">({pct(c.value, totalCat)})</span>
                </span>
                <span className="font-semibold text-[var(--navy)]">{fmt(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
          <span className="text-[13px] font-bold text-[var(--navy)]">Détail généré vs encaissé · par source</span>
          <span className="text-[11px] text-[var(--navy-300)]">
            Identifie le <strong>reste à encaisser</strong> (commissions pending)
          </span>
        </div>
        {data.sourceRows.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-[var(--navy-300)]">Aucune donnée disponible</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Souscriptions</th>
                <th className="px-4 py-3 text-right">CA généré</th>
                <th className="px-4 py-3 text-right">CA encaissé</th>
                <th className="px-4 py-3 text-right">Reste à encaisser</th>
                <th className="px-4 py-3 text-right">Part du CA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              {data.sourceRows.map((r) => (
                <tr key={r.source} className="text-[12px] text-[var(--navy)]">
                  <td className="px-4 py-2.5 font-semibold">{r.source}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.type === "Honoraires" ? "bg-[var(--gold-200)] text-[var(--medium-400)]" : "bg-[var(--light-blue)] text-[var(--navy)]"}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.subs || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.gen)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.enc)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--red-text)]">{fmt(r.rest)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{pct(r.gen, totalGen)}</td>
                </tr>
              ))}
              <tr className="bg-[var(--gold-200)] text-[12px] font-bold text-[var(--navy)]">
                <td className="px-4 py-3" colSpan={3}>Total · part cabinet</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">{fmt(totalGen)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">{fmt(totalEnc)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--red-text)]">{fmt(totalRest)}</td>
                <td className="px-4 py-3 text-right tabular-nums">100 %</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function TabCharges() {
  return (
    <>
      <InfoBar dashed>
        <strong className="text-[var(--navy)]">Détail des charges · à venir.</strong> Aucune table
        de charges (salaires, outils, marketing, IS) n&apos;est modélisée en base pour le cabinet.
        Cette vue sera branchée lorsqu&apos;une comptabilité analytique ou un export comptable sera
        connecté.
      </InfoBar>
      <EmptyState>Données de charges non disponibles pour ce cabinet.</EmptyState>
    </>
  );
}

function TabTreso() {
  return (
    <>
      <InfoBar dashed>
        <strong className="text-[var(--navy)]">Trésorerie multi-comptes · à venir.</strong> Aucune
        connexion bancaire ni table de comptes n&apos;est disponible en base. L&apos;intégration
        (Qonto ou équivalent) alimentera cette vue ultérieurement.
      </InfoBar>
      <EmptyState>Aucun compte bancaire connecté.</EmptyState>
    </>
  );
}

function TabCommissions({ data }: { data: FinanceData }) {
  return (
    <>
      <InfoBar>
        Commissions reversées aux ingénieurs · source <strong>commissions WHERE recipient_type =
        engineer_bonus</strong>, regroupées par bénéficiaire (<em>recipient_user_id → users</em>).
        Le CA généré par ingénieur provient des souscriptions (<em>engineer_id</em>).
      </InfoBar>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard kpi={{ label: "Total reversé · cumul", value: data.totalReverse > 0 ? Math.round(data.totalReverse).toLocaleString("fr-FR") : "—", unit: data.totalReverse > 0 ? "€" : undefined, meta: `${data.commRows.length} ingénieur${data.commRows.length > 1 ? "s" : ""}`, valueTone: "gold" }} />
        <KpiCard kpi={{ label: "Déjà versé aux ingénieurs", value: data.commRows.reduce((a, r) => a + r.encaisse, 0) > 0 ? Math.round(data.commRows.reduce((a, r) => a + r.encaisse, 0)).toLocaleString("fr-FR") : "—", unit: data.commRows.reduce((a, r) => a + r.encaisse, 0) > 0 ? "€" : undefined, meta: "commissions status = received" }} />
        <KpiCard kpi={{ label: "Reste à verser", value: data.commRows.reduce((a, r) => a + r.pending, 0) > 0 ? Math.round(data.commRows.reduce((a, r) => a + r.pending, 0)).toLocaleString("fr-FR") : "—", unit: data.commRows.reduce((a, r) => a + r.pending, 0) > 0 ? "€" : undefined, meta: "commissions status = pending" }} />
      </div>

      {data.commRows.length === 0 ? (
        <EmptyState>Aucune commission reversée aux ingénieurs sur la période.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-bold text-[var(--navy)]">
            Répartition des commissions par ingénieur
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-4 py-3">Ingénieur</th>
                <th className="px-4 py-3 text-right">CA généré</th>
                <th className="px-4 py-3 text-right">Commission reversée</th>
                <th className="px-4 py-3 text-right">Déjà versé</th>
                <th className="px-4 py-3 text-right">Reste à verser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              {data.commRows.map((r) => (
                <tr key={r.nom} className="text-[12px] text-[var(--navy)]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-white">{r.initiales}</div>
                      <span className="font-semibold">{r.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.ca)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--gold)]">{fmt(r.reverse)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.encaisse)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--red-text)]">{fmt(r.pending)}</td>
                </tr>
              ))}
              <tr className="bg-[var(--gold-200)] text-[12px] font-bold text-[var(--navy)]">
                <td className="px-4 py-3">Total · {data.commRows.length} ingénieur{data.commRows.length > 1 ? "s" : ""}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmt(data.commRows.reduce((a, r) => a + r.ca, 0))}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">{fmt(data.totalReverse)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmt(data.commRows.reduce((a, r) => a + r.encaisse, 0))}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--red-text)]">{fmt(data.commRows.reduce((a, r) => a + r.pending, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
