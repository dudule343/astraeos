import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";
import {
  fetchMarketplace,
  fmtEur,
  fmtKpiValue,
  fmtSinceMonth,
  PRICING_TAGS,
} from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Catalogue des packs",
};

export default async function MarketplacePage() {
  const m = await fetchMarketplace();

  const kpis: KpiBlock[] = [
    {
      label: "Revenus mensuels packs récurrents",
      value: fmtKpiValue(m.recurringMonthly),
      unit: m.recurringMonthly > 0 ? "€" : undefined,
      // Pas d'historique mensuel snapshoté en base → aucune comparaison M-1 inventée.
    },
    {
      label: "Revenus packs unitaires ce mois",
      value: fmtKpiValue(m.unitRevenueThisMonth),
      unit: m.unitRevenueThisMonth > 0 ? "€" : undefined,
      meta:
        m.unitCountThisMonth > 0
          ? `${m.unitCountThisMonth} pack${m.unitCountThisMonth > 1 ? "s" : ""} vendu${m.unitCountThisMonth > 1 ? "s" : ""}`
          : "Aucune vente ce mois",
    },
    {
      label: "Pack le plus souscrit",
      value: m.topPackName ?? "—",
      meta:
        m.topPackSubs > 0
          ? `${m.topPackSubs} souscription${m.topPackSubs > 1 ? "s" : ""}`
          : "Aucune souscription",
    },
  ];

  const since = fmtSinceMonth(m.rankingFirstDate);

  return (
    <>
      <Topbar current="Catalogue des packs" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Opérations clients"
          title="Catalogue des packs"
          description="Modules complémentaires proposés aux clients ASTRAEOS — abonnements récurrents, paiements uniques, mises en relation avec partenaires, services à l'unité."
          actions={
            <>
              <GhostButton>Export tarifs</GhostButton>
              <GoldButton>＋ Créer un pack</GoldButton>
            </>
          }
        />

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
            <div className="text-[13px] font-semibold text-[var(--navy)]">
              📊 Classement des {m.ranking.length} pack{m.ranking.length > 1 ? "s" : ""}
              {since ? ` · cumul depuis ${since}` : " · cumul"}
            </div>
            <div className="flex flex-wrap gap-1">
              {/* Pas de fenêtre temporelle modélisée (pas d'historique snapshoté) :
                  un seul filtre réel actif plutôt que des stubs trompeurs. */}
              <button
                type="button"
                className="rounded-md bg-[var(--navy)] px-3 py-1 text-[11px] font-semibold text-white"
              >
                Cumul
              </button>
            </div>
          </div>
          <div>
            {m.ranking.length === 0 ? (
              <div className="px-4 py-10 text-center text-[12px] text-[var(--navy-300)]">
                Aucune souscription enregistrée pour le moment.
              </div>
            ) : (
              <>
                {m.ranking.map((r) => {
                  const sub =
                    r.recurringMonthly > 0
                      ? `${r.subs} souscription${r.subs > 1 ? "s" : ""} · ${fmtEur(r.recurringMonthly)}/mois récurrent`
                      : `${r.subs} souscription${r.subs > 1 ? "s" : ""} · ${r.categoryLabel}`;
                  return (
                    <div
                      key={r.produitId}
                      className="grid grid-cols-[40px_1fr_180px_100px] items-center gap-4 border-b border-[var(--navy-100)] px-4 py-3 last:border-0 hover:bg-[var(--light-blue)]"
                    >
                      <div className="text-[18px] font-bold text-[var(--navy-300)]">{r.num}</div>
                      <div>
                        <div className="text-[12.5px] font-semibold text-[var(--navy)]">{r.name}</div>
                        <div className="mt-0.5 text-[10.5px] text-[var(--navy-300)]">{sub}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-sm bg-[var(--navy-100)]">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-300)]"
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                        <div className="w-10 text-right text-[11px] font-semibold text-[var(--navy)]">
                          {r.pct} %
                        </div>
                      </div>
                      <div className="text-right text-[13px] font-bold text-[var(--gold)]">
                        {fmtEur(r.ca)}
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between border-t-2 border-[var(--gold)] bg-gradient-to-r from-[var(--gold-200)] to-[var(--ivory)] px-4 py-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--medium-400)]">
                    Total cumulé{since ? ` · cumul depuis ${since}` : ""}
                  </div>
                  <div className="text-[16px] font-bold text-[var(--gold)]">
                    {fmtEur(m.rankingTotal)}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--navy-100)]">
          {m.tabs.map((t, i) => (
            <span
              key={t.key}
              className={`-mb-px border-b-2 px-4 py-2 text-[12px] font-semibold ${
                i === 0
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "border-transparent text-[var(--navy-300)]"
              }`}
            >
              {t.label} ({t.count})
            </span>
          ))}
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {m.packs.length === 0 ? (
            <div className="col-span-full rounded-md border border-dashed border-[var(--navy-100)] bg-white px-4 py-12 text-center text-[12px] text-[var(--navy-300)]">
              Aucun produit au catalogue pour le moment.
            </div>
          ) : (
            m.packs.map((p) => {
              const tag = PRICING_TAGS[p.pricing];
              const isPartner = p.pricing === "partner";
              return (
                <div
                  key={p.id}
                  className="relative flex flex-col rounded-md border border-[var(--navy-100)] bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <span
                    className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${tag.cls}`}
                  >
                    {tag.label}
                  </span>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-[var(--gold-200)] text-2xl">
                    {p.icon}
                  </div>
                  <div className="mb-2 text-[13px] font-bold leading-tight text-[var(--navy)]">
                    {p.name}
                  </div>
                  <div className="mb-3 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                    {p.categoryLabel}
                  </div>
                  {/* Pas de bullets/description en base : on liste les caractéristiques réelles. */}
                  <ul className="mb-4 flex flex-1 flex-col gap-1.5 text-[11.5px] text-[var(--navy)]">
                    {p.partnerName && (
                      <li className="flex gap-1.5">
                        <span className="text-[var(--gold)]">✓</span>
                        <span>Partenaire : {p.partnerName}</span>
                      </li>
                    )}
                    {p.minTicket != null && p.minTicket > 0 && (
                      <li className="flex gap-1.5">
                        <span className="text-[var(--gold)]">✓</span>
                        <span>Ticket minimum {fmtEur(p.minTicket)}</span>
                      </li>
                    )}
                    {p.recurringFee != null && p.recurringFee > 0 && (
                      <li className="flex gap-1.5">
                        <span className="text-[var(--gold)]">✓</span>
                        <span>Frais de gestion récurrents {p.recurringFee} %</span>
                      </li>
                    )}
                  </ul>
                  <div className="flex items-end justify-between border-t border-[var(--navy-100)] pt-3">
                    <span className="text-[10.5px] text-[var(--navy-300)]">
                      {p.categoryLabel}
                    </span>
                    <div className="text-right">
                      {/* Aucun prix catalogue en base → on affiche la donnée réelle disponible
                          (ticket min / frais récurrents / mise en relation), jamais un montant inventé. */}
                      <div
                        className={`font-bold text-[var(--gold)] ${isPartner ? "text-[13px]" : "text-[18px]"}`}
                      >
                        {isPartner
                          ? "Mise en relation"
                          : p.recurringFee != null && p.recurringFee > 0
                            ? `${p.recurringFee} %`
                            : p.minTicket != null && p.minTicket > 0
                              ? fmtEur(p.minTicket)
                              : "—"}
                      </div>
                      <div className="text-[10px] text-[var(--navy-300)]">
                        {isPartner
                          ? "commission partenaire"
                          : p.recurringFee != null && p.recurringFee > 0
                            ? "frais de gestion / an"
                            : p.minTicket != null && p.minTicket > 0
                              ? "ticket minimum"
                              : "tarif non renseigné"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </>
  );
}
