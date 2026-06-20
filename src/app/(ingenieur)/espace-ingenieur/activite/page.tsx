import Link from "next/link";

import { Topbar } from "../../../(editeur)/_components/Topbar";
import { fetchCockpitDashboard, fmtHeure, fmtJour, type AlertSeverity } from "../../_data/cockpit";
import { fetchDossiers } from "../../_data/dossiers";
import { joursEnEtape, type Dossier } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Mon activité commerciale",
};

// Délais moyens entre étapes : calculés sur l'ancienneté réelle des dossiers
// dans chaque étape du parcours. Si aucun dossier n'est présent à une étape,
// la valeur reste honnête (—) plutôt qu'une donnée inventée.
const STEP_DELAYS: { stage: string; label: string; sub: string }[] = [
  { stage: "01_prospect", label: "Étape 01", sub: "Prospects actifs" },
  { stage: "02_compliance", label: "Étape 02", sub: "Conformité" },
  { stage: "03_collecte", label: "Étape 03", sub: "Collecte" },
  { stage: "04_etudes", label: "Étape 04", sub: "Production" },
  { stage: "05_restituee", label: "Étape 05", sub: "Restituée" },
];

function moyenneJoursParEtape(dossiers: Dossier[], stage: string, now: Date): number | null {
  const vals = dossiers
    .filter((d) => d.stage === stage)
    .map((d) => joursEnEtape(d, now))
    .filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

const ALERT_DOT: Record<AlertSeverity, string> = {
  critique: "bg-[var(--orange-text)]",
  moyen: "bg-[var(--gold)]",
  info: "bg-[var(--navy-300)]",
};

const ALERT_RING: Record<AlertSeverity, string> = {
  critique: "shadow-[0_0_0_4px_rgba(229,124,75,0.15)]",
  moyen: "shadow-[0_0_0_4px_rgba(198,142,14,0.15)]",
  info: "shadow-[0_0_0_4px_rgba(26,58,102,0.12)]",
};

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

function KpiCell({
  label,
  value,
  unit,
  meta,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  tone?: "gold" | "alert";
}) {
  const valueClass =
    tone === "gold"
      ? "text-[var(--gold)]"
      : tone === "alert"
        ? "text-[var(--orange-text)]"
        : "text-[var(--navy)]";
  return (
    <div className="rounded-lg border border-[var(--navy-100)] bg-white px-[18px] py-4">
      <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
        {label}
      </div>
      <div
        className={`mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.018em] tabular-nums ${valueClass}`}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-normal text-[var(--navy-300)]">{unit}</span>
        )}
      </div>
      <div className="mt-2 text-[11px] text-[var(--navy-300)]">{meta}</div>
    </div>
  );
}

export default async function MonActiviteCommerciale() {
  const now = new Date();
  const [d, dossiers] = await Promise.all([fetchCockpitDashboard(), fetchDossiers()]);

  const delais = STEP_DELAYS.map((s) => ({
    ...s,
    jours: moyenneJoursParEtape(dossiers, s.stage, now),
  }));
  const delaisRenseignes = delais.filter((s) => s.jours != null);
  const cumulTotal =
    delaisRenseignes.length > 0
      ? delaisRenseignes.reduce((acc, s) => acc + (s.jours ?? 0), 0)
      : null;

  return (
    <>
      <Topbar current="Espace Ingénieur" />
      <div className="px-10 py-8">
        {/* HERO */}
        <section className="mb-6 flex items-start justify-between gap-6">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Mon activité commerciale · pilotage opérationnel
            </div>
            <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
              Mon activité <strong className="font-bold">commerciale</strong>
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
              Pilotage de votre activité personnelle · rendez-vous tenus et à venir, actions en
              retard, délais de production et sources d&apos;acquisition de vos clients.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Link
              href="/espace-ingenieur/agenda"
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              Voir l&apos;agenda
            </Link>
          </div>
        </section>

        {/* 4 KPIs pilotage */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCell
            label="Rendez-vous à venir"
            value={String(d.rdvAVenir)}
            meta={
              d.rdvAVenir > 0
                ? `${d.agenda.length} affiché${d.agenda.length > 1 ? "s" : ""} ci-dessous`
                : "Aucun rendez-vous planifié"
            }
          />
          <KpiCell
            label="Prospects actifs"
            value={String(d.prospectsActifs)}
            tone="gold"
            meta="Étape 01 du parcours patrimonial"
          />
          <KpiCell
            label="Actions en retard"
            value={String(d.alerts.length)}
            tone={d.alerts.length > 0 ? "alert" : undefined}
            meta={
              d.alerts.length > 0
                ? "Dossiers nécessitant une relance"
                : "Aucune action en retard"
            }
          />
          <KpiCell
            label="Études en cours"
            value={String(d.etudesEnCours)}
            unit={d.etudesEnCours > 1 ? "études" : "étude"}
            meta={`${d.etudesLivrees} étude${d.etudesLivrees > 1 ? "s" : ""} déjà restituée${d.etudesLivrees > 1 ? "s" : ""}`}
          />
        </div>

        {/* Délais moyens entre les étapes du parcours */}
        <div className="mb-[18px] overflow-hidden rounded-lg border border-[var(--navy-100)] bg-white">
          <div
            className="flex items-center justify-between gap-3 px-[22px] py-[18px]"
            style={{
              background: "linear-gradient(135deg, var(--navy) 0%, #1a3a66 100%)",
            }}
          >
            <div className="flex items-center gap-2.5 text-[14px] font-bold text-white">
              <span className="text-[16px] leading-none text-[var(--gold)]">◷</span>
              Délais moyens · ancienneté dans chaque étape du parcours
            </div>
            <span className="text-[11px] text-white/65">vos dossiers en cours</span>
          </div>
          <div className="px-[26px] py-6">
            {delaisRenseignes.length === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--navy-100)] px-4 py-8 text-center text-[12px] text-[var(--navy-300)]">
                Aucun dossier en cours pour le moment. Les délais moyens par étape
                apparaîtront dès que vos dossiers progresseront dans le parcours.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {delais.map((s, i) => (
                  <div
                    key={s.stage}
                    className={`relative px-2 text-center ${
                      i > 0 ? "border-l border-[var(--ivory-deep)]" : ""
                    }`}
                  >
                    <div className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                      {s.label}
                    </div>
                    <div className="text-[28px] font-bold leading-none text-[var(--navy)]">
                      {s.jours != null ? s.jours : "—"}
                      {s.jours != null && (
                        <span className="ml-1 text-[13px] font-normal text-[var(--navy-300)]">
                          jours
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">{s.sub}</div>
                  </div>
                ))}
                <div className="relative px-2 text-center border-l-2 border-[var(--gold)]">
                  <div className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--gold-deep)]">
                    Cumul total
                  </div>
                  <div className="text-[28px] font-bold leading-none text-[var(--gold-deep)]">
                    {cumulTotal != null ? cumulTotal : "—"}
                    {cumulTotal != null && (
                      <span className="ml-1 text-[13px] font-normal text-[var(--navy-300)]">
                        jours
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">
                    Prospect → Restitution
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions en retard + Sources d'acquisition */}
        <div className="mb-[18px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
          {/* Mes actions en retard */}
          <Card
            icon="⚠"
            title="Mes actions en retard"
            right={
              <span className="rounded-[12px] bg-[var(--orange-bg)] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--orange-text)]">
                {d.alerts.length} action{d.alerts.length > 1 ? "s" : ""}
              </span>
            }
            bodyPad={false}
          >
            {d.alerts.length === 0 ? (
              <div className="m-5 rounded-md border border-dashed border-[var(--navy-100)] px-4 py-8 text-center text-[12px] text-[var(--navy-300)]">
                Aucune action en retard. Vos dossiers sont à jour.
              </div>
            ) : (
              <ul>
                {d.alerts.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3.5 border-b border-[var(--ivory-deep)] px-5 py-3.5 last:border-0"
                  >
                    <span
                      className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${ALERT_DOT[a.severity]} ${ALERT_RING[a.severity]}`}
                    />
                    <div className="flex-1">
                      <div className="text-[12.5px] font-bold text-[var(--navy)]">{a.title}</div>
                      <div className="mt-0.5 text-[10.5px] text-[var(--navy-300)]">{a.detail}</div>
                    </div>
                    <Link
                      href="/espace-ingenieur/dossiers"
                      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[10.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                    >
                      Voir le dossier
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Mes sources d'acquisition · pas de champ source en base -> état honnête */}
          <Card
            icon="◆"
            title="Mes sources d'acquisition"
            right={<span className="text-[11px] font-semibold text-[var(--navy-300)]">cumul 2026</span>}
          >
            <div className="rounded-md border border-dashed border-[var(--navy-100)] px-4 py-8 text-center text-[12px] leading-relaxed text-[var(--navy-300)]">
              Aucune donnée pour le moment. La ventilation par canal d&apos;acquisition
              (recommandations clients, apporteurs d&apos;affaires, réseau personnel)
              s&apos;affichera dès que l&apos;origine de vos prospects sera renseignée.
            </div>
          </Card>
        </div>

        {/* Mes prochains rendez-vous */}
        <Card
          icon="▦"
          title="Mes prochains rendez-vous"
          right={
            <span className="text-[11px] font-semibold text-[var(--navy-300)]">
              {d.rdvAVenir} RDV à venir
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
            <div className="m-5 rounded-md border border-dashed border-[var(--navy-100)] px-4 py-8 text-center text-[12px] text-[var(--navy-300)]">
              Aucun rendez-vous planifié pour le moment.
            </div>
          ) : (
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-[var(--navy)] text-left text-[10.5px] font-bold uppercase tracking-[0.04em] text-white">
                  <th className="px-5 py-2.5 font-bold">Date &amp; heure</th>
                  <th className="px-5 py-2.5 font-bold">Client</th>
                  <th className="px-5 py-2.5 font-bold">Type</th>
                </tr>
              </thead>
              <tbody>
                {d.agenda.map((rdv, i) => (
                  <tr
                    key={rdv.id}
                    className={`border-b border-[var(--navy-100)] last:border-0 ${
                      i % 2 === 1 ? "bg-[var(--ivory)]" : ""
                    }`}
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="font-bold text-[var(--navy)] capitalize">
                        {fmtJour(rdv.scheduledAt)}
                      </span>
                      <span className="ml-1.5 text-[var(--navy-300)]">
                        {fmtHeure(rdv.scheduledAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[var(--navy)]">{rdv.clientName}</td>
                    <td className="px-5 py-3">
                      <span className="inline-block rounded-[3px] bg-[var(--gold-100)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--gold-deep)] capitalize">
                        {rdv.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
