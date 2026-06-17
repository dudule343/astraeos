import { Topbar } from "../../_components/Topbar";
import { NetworkExportButton } from "../../_components/NetworkExportButton";
import { KpiCard, type KpiBlock } from "../../../(editeur)/_components/KpiCard";
import { PageHero, SectionHeader } from "../../../(editeur)/_components/PageHeader";
import { EmptyState } from "../../_components/EmptyState";
import {
  fetchNetworkCommissions,
  computeFinanceResultat,
  computeBreakdownByCategory,
  computeSourceRows,
  fmtEur,
  fmtEurCell,
} from "../../_data/network";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Marque · Synthèse du réseau",
};

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

export default async function SyntheseReseauPage() {
  // Scope RÉSEAU : toutes les commissions du tenant, tous cabinets confondus.
  const commissions = await fetchNetworkCommissions();

  const resultat = computeFinanceResultat(commissions);
  const byCategory = computeBreakdownByCategory(commissions);
  const sourceRows = computeSourceRows(commissions);

  const hasData =
    resultat.totalGenere > 0 ||
    resultat.totalEncaisse > 0 ||
    resultat.reverseIngenieurs > 0;

  const arretedAu = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // --- KPIs hero : généré vs encaissé, à l'échelle du réseau ---------------
  const heroKpis: KpiBlock[] = [
    {
      label: "CA généré · réseau",
      value: fmtEur(resultat.totalGenere),
      unit: resultat.totalGenere > 0 ? "€" : undefined,
      meta: "commissions recipient_type = cabinet · tous cabinets du tenant",
      valueTone: "gold",
    },
    {
      label: "CA encaissé · réseau",
      value: fmtEur(resultat.totalEncaisse),
      unit: resultat.totalEncaisse > 0 ? "€" : undefined,
      meta: "statut received / reconciled",
      metaHighlight:
        resultat.totalGenere > 0
          ? {
              text: `${pct(resultat.totalEncaisse, resultat.totalGenere)} % du généré`,
              tone: "up",
            }
          : undefined,
    },
    {
      label: "Reste à encaisser",
      value: fmtEur(resultat.resteAEncaisser),
      unit: resultat.resteAEncaisser > 0 ? "€" : undefined,
      meta: "généré non encore reçu · commissions pending",
    },
    {
      label: "Reversé aux ingénieurs",
      value: fmtEur(resultat.reverseIngenieurs),
      unit: resultat.reverseIngenieurs > 0 ? "€" : undefined,
      meta: "recipient_type = engineer_bonus · réseau",
    },
  ];

  // --- Honoraires vs apports : généré / encaissé ---------------------------
  const mixKpis: KpiBlock[] = [
    {
      label: "Honoraires d'études · généré",
      value: fmtEur(resultat.honorairesGenere),
      unit: resultat.honorairesGenere > 0 ? "€" : undefined,
      meta: `encaissé ${fmtEurCell(resultat.honorairesEncaisse)} · commission_type = study_fee`,
    },
    {
      label: "Apports d'affaires · généré",
      value: fmtEur(resultat.apportsGenere),
      unit: resultat.apportsGenere > 0 ? "€" : undefined,
      meta: `encaissé ${fmtEurCell(resultat.apportsEncaisse)} · upfront + gestion + performance`,
    },
    {
      label: "Part honoraires",
      value:
        resultat.totalGenere > 0
          ? String(pct(resultat.honorairesGenere, resultat.totalGenere))
          : "—",
      unit: resultat.totalGenere > 0 ? "%" : undefined,
      meta: "honoraires / CA généré réseau",
    },
    {
      label: "Part apports",
      value:
        resultat.totalGenere > 0
          ? String(pct(resultat.apportsGenere, resultat.totalGenere))
          : "—",
      unit: resultat.totalGenere > 0 ? "%" : undefined,
      meta: "apports / CA généré réseau",
    },
  ];

  const maxCategory = byCategory.reduce((m, c) => Math.max(m, c.generated), 0);

  return (
    <>
      <Topbar current="Synthèse du réseau" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Tableau de bord · synthèse financière du réseau"
          title="Synthèse du réseau"
          description="Vue financière consolidée du réseau PRIVEOS : CA généré et encaissé sur l'ensemble des cabinets du tenant, répartition entre honoraires d'études et apports d'affaires, ventilation des commissions par catégorie de produit."
          actions={
            <NetworkExportButton
              label="Export comptable"
              filename="astraeos-synthese-comptable"
              headers={[
                "Source",
                "Type",
                "Souscriptions",
                "Généré (€)",
                "Encaissé (€)",
                "Reste à encaisser (€)",
              ]}
              rows={[
                ...sourceRows.map((r) => [
                  r.source,
                  r.type,
                  r.subs,
                  Math.round(r.gen),
                  Math.round(r.enc),
                  Math.round(r.rest),
                ]),
                ...(sourceRows.length > 0
                  ? [
                      [
                        "Total réseau",
                        "",
                        "",
                        Math.round(resultat.totalGenere),
                        Math.round(resultat.totalEncaisse),
                        Math.round(resultat.resteAEncaisser),
                      ],
                    ]
                  : []),
              ]}
            />
          }
        />

        {/* ---- Synthèse · généré vs encaissé ---- */}
        <section className="mb-2 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
            Synthèse · argent généré et encaissé sur le réseau
          </div>
          <div className="text-[11px] text-[var(--navy-300)]">Arrêté au {arretedAu}</div>
        </section>
        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {heroKpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {/* ---- Honoraires vs apports ---- */}
        <section className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Composition du chiffre d&apos;affaires · honoraires vs apports
        </section>
        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mixKpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {/* ---- Répartition par catégorie de produit ---- */}
        <section className="mb-8">
          <SectionHeader
            eyebrow="Apports d'affaires · ventilation"
            title="Répartition par catégorie de produit"
          />
          {byCategory.length === 0 ? (
            <EmptyState
              icon="📊"
              title="Aucune commission réseau à ventiler"
              hint="Dès que les cabinets du réseau enregistreront des souscriptions générant des commissions, la répartition par catégorie de produit s'affichera ici."
            />
          ) : (
            <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
              <div className="flex flex-col gap-3">
                {byCategory.map((c) => (
                  <div key={c.key} className="flex items-center gap-4">
                    <div className="w-56 flex-shrink-0 text-[12.5px] font-medium text-[var(--navy)]">
                      {c.label}
                      <span className="ml-2 text-[10.5px] text-[var(--navy-300)]">
                        {c.subs} souscription{c.subs > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--navy-100)]">
                      <div
                        className="h-full rounded-full bg-[var(--gold)]"
                        style={{
                          width: `${maxCategory > 0 ? Math.max(4, pct(c.generated, maxCategory)) : 0}%`,
                        }}
                      />
                    </div>
                    <div className="w-28 flex-shrink-0 text-right text-[12.5px] font-semibold text-[var(--navy)]">
                      {fmtEurCell(c.generated)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ---- Détail généré vs encaissé par source ---- */}
        <section className="mb-8">
          <SectionHeader
            eyebrow="Détail financier · généré · encaissé · reste"
            title="Synthèse par source de revenu"
          />
          {sourceRows.length === 0 ? (
            <EmptyState
              icon="🧾"
              title="Aucune source de revenu sur le réseau"
              hint="Le détail des honoraires d'études et des apports d'affaires par catégorie apparaîtra ici une fois les premières commissions enregistrées."
            />
          ) : (
            <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--navy-300)]">
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Souscriptions</th>
                    <th className="px-4 py-3 text-right">Généré</th>
                    <th className="px-4 py-3 text-right">Encaissé</th>
                    <th className="px-4 py-3 text-right">Reste</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceRows.map((r) => (
                    <tr
                      key={`${r.type}-${r.source}`}
                      className="border-b border-[var(--navy-100)] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--navy)]">{r.source}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
                            r.type === "Honoraires"
                              ? "bg-[var(--gold-200)] text-[var(--medium-400)]"
                              : "bg-[var(--navy-100)] text-[var(--navy-300)]"
                          }`}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--navy-300)]">{r.subs}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[var(--navy)]">
                        {fmtEurCell(r.gen)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--navy)]">{fmtEurCell(r.enc)}</td>
                      <td className="px-4 py-3 text-right text-[var(--navy-300)]">
                        {fmtEurCell(r.rest)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--navy-100)] bg-[var(--ivory)] font-bold text-[var(--navy)]">
                    <td className="px-4 py-3" colSpan={3}>
                      Total réseau
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--gold-deep)]">
                      {fmtEurCell(resultat.totalGenere)}
                    </td>
                    <td className="px-4 py-3 text-right">{fmtEurCell(resultat.totalEncaisse)}</td>
                    <td className="px-4 py-3 text-right">{fmtEurCell(resultat.resteAEncaisser)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {!hasData && (
          <div className="flex items-start gap-2 rounded-md border border-dashed border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy-300)]">
            <span>ℹ️</span>
            <div>
              <strong className="text-[var(--navy)]">Réseau en cours de constitution.</strong>{" "}
              Aucune commission n&apos;est encore enregistrée pour les cabinets du réseau. Les
              montants apparaîtront automatiquement dès les premières souscriptions.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
