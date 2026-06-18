import Link from "next/link";

import { Topbar } from "../_components/Topbar";
import { ExportBusinessButton } from "./ExportBusinessButton";
import {
  fetchBusinessData,
  fmtSigned,
  fmtInt,
  fmtEur,
  STATUS_LABELS,
  type CompteExpansion,
} from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Pilotage business",
};

type Compare = { period: string; value: string; direction: "up" | "down" | "neutral" };

type KpiBlock = {
  phase: "1" | "2";
  label: string;
  value: string;
  unit?: string;
  meta: string;
  trend?: "up" | "down";
  compares?: Compare[];
};

const compareDirectionClass = {
  up: "text-[var(--green-text)]",
  down: "text-[var(--red-text)]",
  neutral: "text-[var(--navy-300)]",
} as const;

const typeBadgeClass: Record<CompteExpansion["type"], string> = {
  Marque: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  Cabinet: "bg-[var(--light-blue)] text-[var(--navy)]",
  "Autre pro": "bg-[var(--navy-100)] text-[var(--navy-300)]",
};

const statusToneClass: Record<string, string> = {
  active: "bg-[var(--green-bg)] text-[var(--green-text)]",
  trialing: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  suspended: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  churned: "bg-[var(--navy-100)] text-[var(--navy-300)]",
};

function PhaseTag({ phase }: { phase: "1" | "2" }) {
  const isP1 = phase === "1";
  return (
    <span
      className={`absolute right-3 top-3 rounded-sm px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] ${
        isP1
          ? "bg-[var(--gold-200)] text-[var(--medium-400)]"
          : "bg-[var(--navy-100)] text-[var(--navy-300)]"
      }`}
    >
      Phase {phase}
    </span>
  );
}

function KpiCard({ kpi }: { kpi: KpiBlock }) {
  const valueClass =
    kpi.trend === "up"
      ? "text-[var(--green-text)]"
      : kpi.trend === "down"
        ? "text-[var(--red-text)]"
        : "text-[var(--navy)]";

  return (
    <div className="relative rounded-md border border-[var(--navy-100)] bg-white p-4">
      <PhaseTag phase={kpi.phase} />
      <div className="mb-2 mt-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
        {kpi.label}
      </div>
      <div className={`mb-1 text-[24px] font-bold leading-none ${valueClass}`}>
        {kpi.value}
        {kpi.unit && (
          <span className="ml-1 text-[14px] font-semibold text-[var(--navy-300)]">
            {kpi.unit}
          </span>
        )}
      </div>
      <div className="mb-3 text-[11px] text-[var(--navy-300)]">{kpi.meta}</div>

      {kpi.compares && (
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--navy-100)] pt-2">
          {kpi.compares.map((c) => (
            <div key={c.period}>
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                {c.period}
              </div>
              <div className={`text-[11px] font-semibold ${compareDirectionClass[c.direction]}`}>
                {c.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          {eyebrow}
        </div>
        <div className="text-[15px] font-semibold text-[var(--navy)]">{title}</div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export default async function BusinessPage() {
  const data = await fetchBusinessData();
  const { parc, comptes, periodeLabel, windowDays } = data;

  // Bloc A — Croissance des abonnements. Aucune table de facturation
  // plateforme en base (tenants n'a ni montant ni prix de plan) → état vide
  // honnête, sans compares fabriqués.
  const growthKpis: KpiBlock[] = [
    {
      phase: "1",
      label: "Revenu mensuel récurrent",
      value: "—",
      unit: "€",
      meta: "facturation plateforme non connectée",
    },
    {
      phase: "1",
      label: "Revenu annuel récurrent",
      value: "—",
      unit: "€",
      meta: "facturation plateforme non connectée",
    },
    {
      phase: "1",
      label: "Croissance mensuelle des revenus récurrents",
      value: "—",
      meta: "facturation plateforme non connectée",
    },
  ];

  // Bloc C — Mouvement net du parc clients. Réel via tenants.
  const volumeKpis: KpiBlock[] = [
    {
      phase: "1",
      label: "Acquisitions",
      value: parc.acquisitionsScoped ? fmtSigned(parc.acquisitions, false) : "—",
      unit: "comptes",
      meta: parc.acquisitionsScoped
        ? `nouveaux clients · ${windowDays} derniers jours`
        : "date de création indisponible",
      trend: parc.acquisitions > 0 ? "up" : undefined,
    },
    {
      phase: "1",
      label: "Désabonnements",
      value: parc.hasData ? fmtSigned(-parc.desabonnements, false) : "—",
      unit: "comptes",
      meta: parc.hasData
        ? "comptes résiliés (statut churned)"
        : "aucun compte client en base",
      trend: parc.desabonnements > 0 ? "down" : undefined,
    },
    {
      phase: "1",
      label: "Mouvement net",
      value: parc.hasData ? fmtSigned(parc.mouvementNet, false) : "—",
      unit: "comptes",
      meta: "acquisitions − désabonnements",
      trend:
        parc.mouvementNet > 0 ? "up" : parc.mouvementNet < 0 ? "down" : undefined,
    },
    {
      phase: "2",
      label: "Durée moyenne d'utilisation",
      value: "—",
      unit: "mois",
      meta: "date de résiliation non datée en base",
    },
  ];

  // Bloc E — Valeur à long terme. Ni revenu par compte (LTV) ni coûts
  // marketing/ventes (CAC) en base → état vide honnête.
  const ltvKpis: KpiBlock[] = [
    {
      phase: "1",
      label: "Valeur de vie client moyenne",
      value: "—",
      unit: "€",
      meta: "revenu par compte non disponible",
    },
    {
      phase: "1",
      label: "Coût d'acquisition client",
      value: "—",
      unit: "€",
      meta: "coûts marketing/ventes non suivis",
    },
    {
      phase: "1",
      label: "Ratio valeur de vie / coût d'acquisition",
      value: "—",
      unit: "x",
      meta: "dépend de la LTV et du CAC",
    },
  ];

  return (
    <>
      <Topbar current="01 · Pilotage business" />

      <div className="px-10 py-8">
        <section className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Bloc 01 · Pilotage business
            </div>
            <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
              Pilotage business
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
              Suivi de la croissance financière et commerciale de la plateforme ASTRAEOS — revenus
              récurrents des abonnements, expansion, valeur à long terme.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <ExportBusinessButton comptes={comptes} />
            <button
              type="button"
              data-stub="Ajouter un widget au cockpit"
              className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
            >
              Ajouter widget
            </button>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Revenus récurrents" title="Croissance des abonnements" />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] px-4 py-2.5 text-[11.5px] text-[var(--navy-300)]">
            <span>ℹ️</span>
            <div>
              La facturation de la plateforme n’est pas encore connectée — aucun montant
              d’abonnement n’est disponible en base. Ces indicateurs restent vides tant que la source
              n’existe pas.
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {growthKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Tendance" title="Évolution du revenu mensuel récurrent" />
          <div className="flex h-[220px] flex-col items-center justify-center rounded-md border border-[var(--navy-100)] bg-white p-6 text-center">
            <div className="mb-2 text-[24px]">📊</div>
            <div className="text-[13px] font-semibold text-[var(--navy)]">
              Aucune donnée de revenu à afficher
            </div>
            <div className="mt-1 max-w-md text-[11.5px] text-[var(--navy-300)]">
              L’historique mensuel du revenu récurrent sera tracé ici dès que la facturation de la
              plateforme sera connectée.
            </div>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader
            eyebrow="Volumétrie"
            title="Mouvement net du portefeuille clients"
            right={
              <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--navy-300)]">
                <span className="text-[var(--gold)]">📅</span>
                {parc.acquisitionsScoped
                  ? `Acquisitions : ${windowDays} derniers jours`
                  : `Période : ${periodeLabel}`}
              </div>
            }
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {volumeKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Top performers" title="Top 5 des comptes clients" />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
            <span>ℹ️</span>
            <div>
              Comptes clients de la plateforme classés par <strong>encours sous gestion</strong>. Le
              revenu SaaS par compte (abonnement, packs) n’est pas suivi en base — ces colonnes sont
              donc absentes tant que la facturation n’est pas connectée.
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            {comptes.length === 0 ? (
              <div className="px-4 py-10 text-center text-[12.5px] text-[var(--navy-300)]">
                Aucun compte client à afficher.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Compte</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Encours sous gestion</th>
                    <th className="px-4 py-3 text-right">Clients</th>
                    <th className="px-4 py-3 text-center">Abonnement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--navy-100)]">
                  {comptes.map((row) => (
                    <tr
                      key={row.rank}
                      className="text-[12.5px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                    >
                      <td className="px-4 py-3 font-bold text-[var(--navy-300)]">{row.rank}</td>
                      <td className="px-4 py-3">
                        <Link href="/clients" className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--navy)] text-[11px] font-bold text-white">
                            {row.initials}
                          </div>
                          <span className="font-semibold">{row.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${typeBadgeClass[row.type]}`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-[var(--gold)]">
                        {fmtEur(row.aum)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmtInt(row.clients)}</td>
                      <td className="px-4 py-3 text-center">
                        {row.status ? (
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${statusToneClass[row.status] ?? statusToneClass.churned}`}
                          >
                            {STATUS_LABELS[row.status]}
                          </span>
                        ) : (
                          <span className="text-[var(--navy-300)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader eyebrow="Rentabilité long terme" title="Valeur à long terme" />
          <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] px-4 py-2.5 text-[11.5px] text-[var(--navy-300)]">
            <span>ℹ️</span>
            <div>
              La valeur de vie et le coût d’acquisition nécessitent le revenu par compte et les coûts
              marketing/ventes — non suivis en base. Ces indicateurs restent vides.
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ltvKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
