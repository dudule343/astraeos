"use client";

import { useState } from "react";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";

export type FinanceData = {
  kpis: KpiBlock[];
  arretedAu: string;
  // Compte de résultat éditeur (produits perçus seulement — pas de charges en base)
  honorairesGenere: number;
  honorairesEncaisse: number;
  apportsGenere: number;
  apportsEncaisse: number;
  totalGenere: number;
  totalEncaisse: number;
  resteAEncaisser: number;
  // Détail CA
  detailKpis: KpiBlock[];
  sourceRows: {
    source: string;
    type: "Honoraires" | "Apports";
    subs: number;
    gen: number;
    enc: number;
    rest: number;
  }[];
  categoryBreakdown: { label: string; value: number }[];
  monthly: { key: string; label: string; generated: number; current: boolean }[];
  // Définitions (statique)
  definitions: DefGroup[];
  hasData: boolean;
};

type DefGroup = {
  title: string;
  icon: string;
  items: { term: string; desc: string; formula?: string }[];
};

const TABS = [
  { id: "resultat", label: "Compte de résultat" },
  { id: "detail-ca", label: "Détail du CA généré / encaissé" },
  { id: "detail-charges", label: "Détail des charges" },
  { id: "treso", label: "Trésorerie" },
  { id: "previ", label: "Prévisionnel" },
  { id: "definitions", label: "Définitions" },
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
      <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
        {children}
      </p>
    </section>
  );
}

export function FinanceTabs({ data }: { data: FinanceData }) {
  const [tab, setTab] = useState<TabId>("resultat");

  return (
    <>
      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
      {tab === "detail-ca" && <TabDetailCa data={data} />}
      {tab === "detail-charges" && <TabDetailCharges />}
      {tab === "treso" && <TabTreso />}
      {tab === "previ" && <TabPrevi data={data} />}
      {tab === "definitions" && <TabDefinitions definitions={data.definitions} />}
    </>
  );
}

type CdrRow = {
  label: string;
  generated: number;
  encaisse: number;
  tone?: "section" | "sub" | "net";
};

function TabResultat({ data }: { data: FinanceData }) {
  const rows: CdrRow[] = [
    { tone: "section", label: "Produits perçus par l'éditeur", generated: 0, encaisse: 0 },
    {
      label: "Honoraires d'études (study_fee)",
      generated: data.honorairesGenere,
      encaisse: data.honorairesEncaisse,
    },
    {
      label: "Apports d'affaires (upfront, gestion, performance)",
      generated: data.apportsGenere,
      encaisse: data.apportsEncaisse,
    },
    {
      tone: "sub",
      label: "Total produits d'exploitation",
      generated: data.totalGenere,
      encaisse: data.totalEncaisse,
    },
    {
      tone: "net",
      label: "Reste à encaisser",
      generated: data.resteAEncaisser,
      encaisse: data.resteAEncaisser,
    },
  ];

  return (
    <>
      <InfoBar>
        Compte de résultat de l&apos;éditeur reconstitué à partir des <strong>commissions</strong>{" "}
        (part marque, <em>recipient_type = brand_owner</em>) jointes aux souscriptions. « Généré » =
        toutes commissions ; « Encaissé » = statut <em>received / reconciled</em>. Données arrêtées au{" "}
        <strong>{data.arretedAu}</strong>.
      </InfoBar>

      <InfoBar dashed>
        Les <strong className="text-[var(--navy)]">charges d&apos;exploitation</strong> (salaires,
        outils, marketing), le <strong className="text-[var(--navy)]">résultat net</strong> et
        l&apos;<strong className="text-[var(--navy)]">impôt</strong> ne sont pas modélisés en base :
        seuls les produits perçus sont affichés. Le P&L complet sera reconstitué quand une
        comptabilité analytique sera connectée.
      </InfoBar>

      {!data.hasData ? (
        <EmptyState>
          Aucune commission « part éditeur » enregistrée. Le compte de résultat s&apos;affichera dès
          que des souscriptions et leurs commissions <em>brand_owner</em> seront saisies en base.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-4 py-3" style={{ width: "55%" }}>
                  Poste
                </th>
                <th className="px-4 py-3 text-right">Généré</th>
                <th className="px-4 py-3 text-right">Encaissé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              {rows.map((row, i) => {
                if (row.tone === "section") {
                  return (
                    <tr key={i} className="bg-[var(--ivory)]">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--navy-300)]"
                      >
                        ▾ {row.label}
                      </td>
                    </tr>
                  );
                }
                const cls =
                  row.tone === "sub"
                    ? "bg-[var(--ivory)] font-bold"
                    : row.tone === "net"
                      ? "bg-[var(--gold-200)] font-bold"
                      : "";
                return (
                  <tr key={i} className={`text-[12px] text-[var(--navy)] ${cls}`}>
                    <td className="px-4 py-2.5">{row.label}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(row.generated)}</td>
                    <td
                      className={`px-4 py-2.5 text-right tabular-nums ${row.tone === "net" ? "text-[var(--gold)]" : ""}`}
                    >
                      {row.tone === "net" ? "—" : fmt(row.encaisse)}
                    </td>
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

function TabDetailCa({ data }: { data: FinanceData }) {
  const totalCat = data.categoryBreakdown.reduce((a, c) => a + c.value, 0);
  const totalGen = data.sourceRows.reduce((a, r) => a + r.gen, 0);
  const totalEnc = data.sourceRows.reduce((a, r) => a + r.enc, 0);
  const totalRest = data.sourceRows.reduce((a, r) => a + r.rest, 0);
  const maxMonth = Math.max(1, ...data.monthly.map((m) => m.generated));

  return (
    <>
      <InfoBar>
        Décomposition fine du chiffre d&apos;affaires de l&apos;éditeur par source de revenu —
        d&apos;où vient chaque euro de commission perçu. « Encaissé » = statut <em>received /
        reconciled</em> ; le reste à encaisser correspond aux commissions <em>pending</em>.
      </InfoBar>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.detailKpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
            📊 Répartition du CA par catégorie de produit
          </div>
          <div className="p-4">
            {data.categoryBreakdown.length === 0 ? (
              <div className="py-6 text-center text-[12px] text-[var(--navy-300)]">
                Aucune donnée — aucun produit rattaché à une commission éditeur.
              </div>
            ) : (
              <>
                <div className="mb-2 flex justify-between rounded-md bg-[var(--ivory)] px-4 py-2.5 text-[12.5px]">
                  <span className="font-bold text-[var(--navy)]">Total · part éditeur</span>
                  <span className="font-bold text-[var(--gold)]">{fmt(totalCat)}</span>
                </div>
                {data.categoryBreakdown.map((c) => (
                  <div
                    key={c.label}
                    className="flex justify-between border-b border-[var(--navy-100)] px-2 py-2.5 text-[12.5px] last:border-0"
                  >
                    <span className="text-[var(--navy)]">
                      {c.label}{" "}
                      <span className="text-[var(--navy-300)]">({pct(c.value, totalCat)})</span>
                    </span>
                    <span className="font-semibold text-[var(--navy)]">{fmt(c.value)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
            📈 Évolution mensuelle du CA · {new Date().getFullYear()}
          </div>
          <div className="p-6">
            {data.monthly.length === 0 ? (
              <div className="flex h-[180px] items-center justify-center text-center text-[12px] text-[var(--navy-300)]">
                Aucune commission datée sur l&apos;année en cours — pas d&apos;historique mensuel à
                afficher.
              </div>
            ) : (
              <div className="flex h-[180px] items-end gap-3">
                {data.monthly.map((m) => (
                  <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t-sm ${m.current ? "bg-[var(--navy)]" : "bg-gradient-to-t from-[var(--gold)] to-[var(--gold-300)]"}`}
                      style={{
                        height: `${m.generated > 0 ? Math.max(6, Math.round((m.generated / maxMonth) * 100)) : 2}%`,
                      }}
                    />
                    <div className="text-[10px] font-semibold text-[var(--navy-300)]">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
          <span className="text-[13px] font-bold text-[var(--navy)]">
            Détail généré vs encaissé · par source
          </span>
          <span className="text-[11px] text-[var(--navy-300)]">
            Identifie le <strong>reste à encaisser</strong> (commissions pending)
          </span>
        </div>
        {data.sourceRows.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-[var(--navy-300)]">
            Aucune donnée disponible
          </div>
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
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.type === "Honoraires" ? "bg-[var(--gold-200)] text-[var(--medium-400)]" : "bg-[var(--light-blue)] text-[var(--navy)]"}`}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.subs || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.gen)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(r.enc)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--red-text)]">
                    {fmt(r.rest)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{pct(r.gen, totalGen)}</td>
                </tr>
              ))}
              <tr className="bg-[var(--gold-200)] text-[12px] font-bold text-[var(--navy)]">
                <td className="px-4 py-3" colSpan={3}>
                  Total · part éditeur
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">
                  {fmt(totalGen)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">
                  {fmt(totalEnc)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--red-text)]">
                  {fmt(totalRest)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">100 %</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function TabDetailCharges() {
  return (
    <>
      <InfoBar dashed>
        <strong className="text-[var(--navy)]">Détail des charges · à venir.</strong> Aucune table
        de charges (salaires, prestataires, outils SaaS, marketing, locations, dotations) n&apos;est
        modélisée en base pour l&apos;éditeur. Cette vue sera branchée lorsqu&apos;une comptabilité
        analytique ou un export comptable sera connecté.
      </InfoBar>
      <EmptyState>Données de charges non disponibles.</EmptyState>
    </>
  );
}

function TabTreso() {
  return (
    <>
      <InfoBar dashed>
        <strong className="text-[var(--navy)]">Trésorerie multi-comptes · à venir.</strong> Aucune
        connexion bancaire ni table de comptes (soldes, IBAN, rendements) n&apos;est disponible en
        base. L&apos;intégration (Qonto ou équivalent) alimentera cette vue ultérieurement.
      </InfoBar>
      <EmptyState>Aucun compte bancaire connecté.</EmptyState>
    </>
  );
}

function TabPrevi({ data }: { data: FinanceData }) {
  const maxMonth = Math.max(1, ...data.monthly.map((m) => m.generated));
  return (
    <>
      <InfoBar dashed>
        <strong className="text-[var(--navy)]">Objectifs prévisionnels · non configurés.</strong>{" "}
        Aucune table d&apos;objectifs ou de budget (Obj. CA, Obj. charges, résultat prévu) n&apos;est
        modélisée en base. Seul le CA réalisé par mois ci-dessous est dérivé des commissions ;
        l&apos;écart vs objectif sera disponible quand des objectifs seront saisis.
      </InfoBar>

      {data.monthly.length === 0 ? (
        <EmptyState>
          Aucun CA réalisé daté sur l&apos;année en cours, et aucun objectif configuré.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
          <div className="border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-bold text-[var(--navy)]">
            CA réalisé par mois · {new Date().getFullYear()}
            <span className="ml-3 text-[11px] font-normal text-[var(--navy-300)]">
              objectifs non configurés → colonne « écart » indisponible
            </span>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-4 py-3">Mois</th>
                <th className="px-4 py-3 text-right">CA réalisé</th>
                <th className="px-4 py-3 text-right">Obj. CA</th>
                <th className="px-4 py-3 text-right">Écart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              {data.monthly.map((m) => (
                <tr
                  key={m.key}
                  className={`text-[12px] text-[var(--navy)] ${m.current ? "bg-[var(--gold-200)]" : ""}`}
                >
                  <td className="px-4 py-2.5 font-semibold">
                    {m.label}
                    {m.current ? " (en cours)" : ""}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(m.generated)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--navy-300)]">—</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--navy-300)]">—</td>
                </tr>
              ))}
              <tr className="bg-[var(--ivory)] text-[12px] font-bold text-[var(--navy)]">
                <td className="px-4 py-3">Cumul {new Date().getFullYear()}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--gold)]">
                  {fmt(data.monthly.reduce((a, m) => a + m.generated, 0))}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--navy-300)]">—</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--navy-300)]">—</td>
              </tr>
            </tbody>
          </table>
          {/* maxMonth réservé à un futur affichage de barres; conservé pour cohérence avec Détail CA */}
          <div className="hidden" aria-hidden data-max={maxMonth} />
        </div>
      )}
    </>
  );
}

function TabDefinitions({ definitions }: { definitions: DefGroup[] }) {
  return (
    <>
      <InfoBar>
        Lexique des indicateurs financiers utilisés dans cette page · pour l&apos;équipe et les
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
