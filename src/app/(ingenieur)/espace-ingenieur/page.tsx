import Link from "next/link";

import { Topbar } from "../../(editeur)/_components/Topbar";
import {
  fetchCockpitDashboard,
  fmtEur,
  fmtHeure,
  fmtJour,
  type AlertSeverity,
  type CockpitDashboard,
} from "../_data/cockpit";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur",
};

const SERIF = "'Cormorant Garamond', Georgia, serif";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

// --- KPIs (rangée de 5, avec comparatif 3 colonnes M-1 / T-1 / N-1) ----------

type Cmp = { period: string; value: string; dir: "up" | "down" };

type Kpi = {
  label: string;
  value: string;
  gold?: boolean;
  meta: string;
  compares: Cmp[];
};

function buildKpis(d: CockpitDashboard): Kpi[] {
  return [
    {
      label: "Mon CA généré",
      value: fmtEur(d.caGenere),
      gold: true,
      meta: "cumul depuis janvier 2026",
      compares: [
        { period: "M-1", value: "+18 %", dir: "up" },
        { period: "T-1", value: "+14 %", dir: "up" },
        { period: "N-1", value: "+16 %", dir: "up" },
      ],
    },
    {
      label: "Études réalisées et restituées",
      value: String(d.etudesLivrees),
      meta: "cumul 2026",
      compares: [
        { period: "M-1", value: "+1", dir: "up" },
        { period: "T-1", value: "+2", dir: "up" },
        { period: "N-1", value: "+3", dir: "up" },
      ],
    },
    {
      label: "Investissements financiers",
      value: fmtEur(d.encoursFinancier),
      meta:
        d.clientsFinancier > 0
          ? `encours sous gestion · ${d.clientsFinancier} client${d.clientsFinancier > 1 ? "s" : ""} concerné${d.clientsFinancier > 1 ? "s" : ""}`
          : "encours sous gestion",
      compares: [
        { period: "M-1", value: "+4 %", dir: "up" },
        { period: "T-1", value: "+9 %", dir: "up" },
        { period: "N-1", value: "-2 %", dir: "down" },
      ],
    },
    {
      label: "Assurance",
      value: `${d.contratsAssurance} contrat${d.contratsAssurance > 1 ? "s" : ""}`,
      meta:
        d.clientsAssurance > 0
          ? `${d.clientsAssurance} client${d.clientsAssurance > 1 ? "s" : ""} concerné${d.clientsAssurance > 1 ? "s" : ""} · tous types confondus`
          : "tous types confondus",
      compares: [
        { period: "M-1", value: "+1", dir: "up" },
        { period: "T-1", value: "+2", dir: "up" },
        { period: "N-1", value: "+3", dir: "up" },
      ],
    },
    {
      label: "Investissements immobiliers",
      value: `${d.projetsImmo} projet${d.projetsImmo > 1 ? "s" : ""}`,
      meta:
        d.clientsImmo > 0
          ? `${d.clientsImmo} client${d.clientsImmo > 1 ? "s" : ""} concerné${d.clientsImmo > 1 ? "s" : ""} · ${fmtEur(d.montantImmo)} engagé${d.clientsImmo > 1 ? "s" : ""}`
          : "engagements en cours",
      compares: [
        { period: "M-1", value: "+1", dir: "up" },
        { period: "T-1", value: "+1", dir: "up" },
        { period: "N-1", value: "-1", dir: "down" },
      ],
    },
  ];
}

function KpiCell({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-lg border border-[var(--navy-100)] bg-white px-[18px] py-4">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
        {kpi.label}
      </div>
      <div
        className={`mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.018em] tabular-nums ${
          kpi.gold ? "text-[var(--gold)]" : "text-[var(--navy)]"
        }`}
      >
        {kpi.value}
      </div>
      <div className="mt-1.5 text-[11px] text-[var(--navy-300)]">{kpi.meta}</div>
      <div className="mt-2.5 grid grid-cols-3 border-t border-[var(--navy-100)] pt-2.5">
        {kpi.compares.map((c, i) => (
          <div
            key={c.period}
            className={`px-1 text-center ${i < 2 ? "border-r border-[var(--ivory-deep)]" : ""}`}
          >
            <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--navy-300)]">
              {c.period}
            </div>
            <div
              className="mt-0.5 flex items-center justify-center gap-[3px] text-[11.5px] font-bold"
              style={{ color: c.dir === "up" ? "#2EA85A" : "#D9534F" }}
            >
              <span className="text-[10px] leading-none">{c.dir === "up" ? "▲" : "▼"}</span>
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Cartes ------------------------------------------------------------------

function Card({
  icon,
  title,
  right,
  bodyPad = true,
  children,
  footer,
}: {
  icon: string;
  title: string;
  right?: React.ReactNode;
  bodyPad?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--navy-100)] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--navy-100)] px-5 py-3.5">
        <div className="flex items-center gap-2.5 text-[14px] font-bold text-[var(--navy)]">
          <span className="text-[16px] leading-none text-[var(--gold)]">{icon}</span>
          {title}
        </div>
        {right}
      </div>
      <div className={bodyPad ? "px-5 py-[18px]" : ""}>{children}</div>
      {footer}
    </div>
  );
}

// Études prioritaires : pilotées par les données réelles (priorites) avec un
// repli sur le décor de la maquette quand la base est vide (états honnêtes : 0
// étude => message vide, sinon on rend les vraies lignes).
const STAGE_BADGE: Record<string, string> = {
  "02_compliance": "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  "03_collecte": "bg-[rgba(198,142,14,0.15)] text-[var(--gold-deep)]",
  "04_etudes": "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  "05_restituee": "bg-[var(--green-bg)] text-[var(--green-text)]",
};

const ALERT_DOT: Record<AlertSeverity, string> = {
  critique: "bg-[var(--orange-text)]",
  moyen: "bg-[var(--gold)]",
  info: "bg-[var(--navy-300)]",
};

const SANTE = [
  {
    label: "Satisfaction client",
    value: "4,8 / 5",
    pct: 96,
    tone: "green" as const,
    meta: "Note Trustpilot moyenne · 6 avis cumulés",
  },
  {
    label: "Conformité réglementaire",
    value: "100 %",
    pct: 100,
    tone: "green" as const,
    meta: "Tous mes dossiers à jour · KYC à 5 / 7",
  },
  {
    label: "Activité commerciale",
    value: "78 %",
    pct: 78,
    tone: "gold" as const,
    meta: "3 actions en retard · taux RDV→étude 64 %",
  },
  {
    label: "Formation continue",
    value: "14 h / 15 h",
    pct: 93,
    tone: "green" as const,
    meta: "Obligation annuelle CIF · 1 h restante",
  },
];

export default async function IngenieurCockpit() {
  const d = await fetchCockpitDashboard();
  const kpis = buildKpis(d);
  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Topbar current="Espace Ingénieur" />
      <div className="px-10 py-8">
        {/* HERO */}
        <section className="mb-6 grid grid-cols-1 items-center gap-10 border-b border-[var(--navy-100)] pb-[18px] lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-[9px] text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
              <span className="h-[5px] w-[5px] rounded-full bg-[var(--gold)]" />
              Tableau de bord personnel · {dateLabel}
            </div>
            <h1
              className="mt-2.5 text-[38px] font-semibold leading-[1.12] tracking-[-0.015em] text-[var(--navy)]"
              style={{ fontFamily: SERIF }}
            >
              Bonjour <strong className="font-bold text-[var(--navy)]">Luc</strong>
            </h1>
            <p className="mt-2.5 max-w-3xl text-[13.5px] text-[var(--navy-300)]">
              Vue d&apos;ensemble de votre activité personnelle · {d.etudesEnCours} étude
              {d.etudesEnCours > 1 ? "s" : ""} en cours, {d.prospectsActifs} prospect
              {d.prospectsActifs > 1 ? "s" : ""} actif{d.prospectsActifs > 1 ? "s" : ""}, {d.clientsServis}{" "}
              client{d.clientsServis > 1 ? "s" : ""} en suivi. Cumul depuis janvier 2026 ·{" "}
              {fmtEur(d.caGenere)} de CA généré.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Link
              href="/espace-ingenieur/client-new"
              className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
            >
              + Créer un espace client
            </Link>
          </div>
        </section>

        {/* RANGÉE DE 5 KPIS */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <KpiCell key={kpi.label} kpi={kpi} />
          ))}
        </div>

        {/* LIGNE 1 : études prioritaires + alertes */}
        <div className="mb-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
          <Card
            icon="◆"
            title="Mes études prioritaires"
            right={
              <span className="text-[11px] font-semibold text-[var(--navy-300)]">
                {d.priorites.length} étude{d.priorites.length > 1 ? "s" : ""} en cours
              </span>
            }
            bodyPad={false}
          >
            {d.priorites.length === 0 ? (
              <EmptyState message="Aucune étude en production pour le moment." />
            ) : (
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-[var(--navy)] text-left text-[10.5px] font-bold uppercase tracking-[0.04em] text-white">
                    <th className="px-4 py-2.5 font-bold">Client</th>
                    <th className="px-4 py-2.5 font-bold">Étape</th>
                    <th className="px-4 py-2.5 text-right font-bold">Honoraires</th>
                  </tr>
                </thead>
                <tbody>
                  {d.priorites.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-b border-[var(--navy-100)] last:border-0 ${
                        i % 2 === 1 ? "bg-[var(--ivory)]" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--gold-300)] bg-[var(--light-blue)] text-[10px] font-bold text-[var(--navy)]">
                            {initialsOf(p.clientName)}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--navy)]">{p.clientName}</div>
                            <div className="text-[10.5px] text-[var(--navy-300)]">{p.ref}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block rounded-[3px] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em] ${
                            STAGE_BADGE[p.stage] ?? "bg-[var(--navy-100)] text-[var(--navy)]"
                          }`}
                        >
                          Étape {String(p.stageNum).padStart(2, "0")} · {p.stageLabel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--navy)]">
                        {p.pct != null ? `${p.pct} %` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card
            icon="⚠"
            title="Mes alertes"
            right={
              <span className="rounded-[12px] bg-[var(--orange-bg)] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--orange-text)]">
                {d.alerts.length} alerte{d.alerts.length > 1 ? "s" : ""}
              </span>
            }
            bodyPad={false}
          >
            {d.alerts.length === 0 ? (
              <EmptyState message="Aucune alerte en cours." />
            ) : (
              <ul>
                {d.alerts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 border-b border-[var(--ivory-deep)] px-[18px] py-3.5 last:border-0"
                  >
                    <span
                      className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${ALERT_DOT[a.severity]}`}
                    />
                    <div>
                      <div className="text-[12px] font-bold text-[var(--navy)]">{a.title}</div>
                      <div className="text-[10px] text-[var(--navy-300)]">{a.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* LIGNE 2 : RDV du jour + santé du portefeuille */}
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
          <Card
            icon="▦"
            title="Mes rendez-vous du jour"
            right={
              <span className="text-[11px] font-semibold text-[var(--navy-300)]">
                {d.agenda.length} RDV
              </span>
            }
            bodyPad={false}
            footer={
              <div className="border-t border-[var(--ivory-deep)] px-5 py-3 text-center">
                <Link
                  href="/espace-ingenieur/agenda"
                  className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  Voir tout l&apos;agenda →
                </Link>
              </div>
            }
          >
            {d.agenda.length === 0 ? (
              <EmptyState message="Aucun rendez-vous planifié aujourd'hui." />
            ) : (
              <ul>
                {d.agenda.map((rdv) => (
                  <li
                    key={rdv.id}
                    className="flex items-stretch gap-3.5 border-b border-[var(--ivory-deep)] px-5 py-3.5 last:border-0"
                  >
                    <div className="flex w-[60px] flex-shrink-0 flex-col items-center justify-center">
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--gold)]">
                        {fmtJour(rdv.scheduledAt)}
                      </span>
                      <span className="text-[16px] font-bold text-[var(--navy)]">
                        {fmtHeure(rdv.scheduledAt)}
                      </span>
                    </div>
                    <div className="w-[3px] flex-shrink-0 rounded-[2px] bg-[var(--gold)]" />
                    <div className="flex flex-col justify-center">
                      <div className="text-[12.5px] font-bold text-[var(--navy)]">
                        {rdv.clientName}
                      </div>
                      <div className="text-[10px] capitalize text-[var(--navy-300)]">
                        {rdv.label}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            icon="◈"
            title="Santé de mon portefeuille"
            right={
              <span className="rounded-[12px] bg-[var(--green-bg)] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--green-text)]">
                88 / 100
              </span>
            }
            bodyPad={false}
          >
            <div>
              {SANTE.map((b) => (
                <div
                  key={b.label}
                  className="border-b border-[var(--ivory-deep)] px-5 py-3.5 last:border-0"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: b.tone === "green" ? "#2EA85A" : "var(--gold)" }}
                      />
                      <span className="text-[12.5px] font-bold text-[var(--navy)]">{b.label}</span>
                    </div>
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: b.tone === "green" ? "#2EA85A" : "var(--gold-deep)" }}
                    >
                      {b.value}
                    </span>
                  </div>
                  <div className="h-[5px] w-full overflow-hidden rounded-[3px] bg-[var(--ivory-deep)]">
                    <div
                      className="h-full rounded-[3px]"
                      style={{
                        width: `${b.pct}%`,
                        background: b.tone === "green" ? "#2EA85A" : "var(--gold)",
                      }}
                    />
                  </div>
                  <div className="mt-1.5 text-[10px] text-[var(--navy-300)]">{b.meta}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="m-5 rounded-md border border-dashed border-[var(--navy-100)] px-4 py-8 text-center text-[12px] text-[var(--navy-300)]">
      {message}
    </div>
  );
}
