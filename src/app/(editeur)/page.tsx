import Link from "next/link";
import { Topbar } from "./_components/Topbar";
import { AlertsPanel, type AlertItem } from "./_components/AlertsPanel";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import { fetchLeads } from "./leads/data";
import { fetchTrials } from "./trial/data";

export const dynamic = "force-dynamic";

type Kpi = {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  href: string;
};

type CockpitBlock = {
  num: string;
  label: string;
  href: string;
};

type Prospect = {
  id: string;
  name: string;
  meta: string;
};

// Blocs cockpit 01-08 : ce sont des entrées de navigation vers les sections
// détaillées. Il n'existe aucune source de score agrégé par bloc en base, donc
// on n'affiche PAS de score (zéro chiffre inventé) — seulement la navigation.
const cockpitBlocks: CockpitBlock[] = [
  { num: "01", label: "Pilotage business", href: "/business" },
  { num: "02", label: "Acquisition & conversion", href: "/acquisition" },
  { num: "03", label: "Adoption produit", href: "/adoption" },
  { num: "04", label: "Première valeur", href: "/ttv" },
  { num: "05", label: "Santé clients", href: "/health" },
  { num: "06", label: "Analyse produit", href: "/product" },
  { num: "07", label: "Support & qualité", href: "/quality" },
  { num: "08", label: "Infrastructure", href: "/infra" },
];

const SCORE_RADIUS = 68;

type HomeData = {
  clientsActifs: number | null;
  leadsTotal: number | null;
  trialsEnCours: number | null;
  trialsDemarres30j: number | null;
  prospects: Prospect[];
  alerts: AlertItem[];
};

const EMPTY_HOME: HomeData = {
  clientsActifs: null,
  leadsTotal: null,
  trialsEnCours: null,
  trialsDemarres30j: null,
  prospects: [],
  alerts: [],
};

// Toutes les lectures passent par createAdminClient() (bypass RLS) : le scope
// tenant_id + cabinet_id de la session est la seule barrière anti-fuite. Les
// data layers réutilisés (fetchLeads/fetchTrials) appliquent déjà ce scope ;
// le comptage clients ci-dessous le reproduit. Pas de session → état vide.
async function fetchHome(): Promise<HomeData> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return EMPTY_HOME;

  const ctx = await getSessionContext();
  if (!ctx) return EMPTY_HOME;

  try {
    const supabase = createAdminClient();

    const { count: clientsCount } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);

    const [leads, trials] = await Promise.all([fetchLeads(), fetchTrials()]);

    // Pipeline : les 3 prochains leads amont réels (mêmes données que /leads),
    // sans montant inventé — on n'affiche que le nom + l'étape réelle.
    const prospects: Prospect[] = leads.leads
      .filter((l) => l.name)
      .slice(0, 3)
      .map((l) => ({
        id: l.id,
        name: l.name as string,
        meta: l.lastContact === "—" ? l.stageLabel : `${l.stageLabel} · ${l.lastContact}`,
      }));

    return {
      clientsActifs: clientsCount ?? 0,
      leadsTotal: leads.kpis.leadsTotal,
      trialsEnCours: trials.enCours,
      trialsDemarres30j: trials.demarres30j,
      prospects,
      // Aucune source d'alertes système réelle (pas de table d'incidents/SLA
      // exposée ici) → liste vide ; AlertsPanel rend un état vide honnête.
      alerts: [],
    };
  } catch {
    return EMPTY_HOME;
  }
}

function buildKpis(data: HomeData): Kpi[] {
  const dash = (n: number | null): string => (n === null ? "—" : String(n));
  return [
    {
      label: "Chiffre d'affaires généré",
      value: "—",
      meta: "donnée non disponible",
      href: "/finance",
    },
    {
      label: "Chiffre d'affaires encaissé",
      value: "—",
      meta: "donnée non disponible",
      href: "/finance",
    },
    {
      label: "Charges du mois",
      value: "—",
      meta: "donnée non disponible",
      href: "/finance",
    },
    {
      label: "Base prospects",
      value: dash(data.leadsTotal),
      meta: "leads amont du cabinet",
      href: "/leads",
    },
    {
      label: "Clients actifs",
      value: dash(data.clientsActifs),
      meta: "portefeuille du cabinet",
      href: "/clients",
    },
    {
      label: "Taux de désabonnement",
      value: "—",
      meta: "donnée non disponible",
      href: "/business",
    },
  ];
}

export default async function HomePage() {
  const data = await fetchHome();
  const kpis = buildKpis(data);
  const trialMeta =
    data.trialsDemarres30j === null
      ? "essais en cours"
      : `dont ${data.trialsDemarres30j} démarré${data.trialsDemarres30j > 1 ? "s" : ""} sous 30 j`;

  return (
    <>
      <Topbar current="Accueil" />

      <div className="px-10 py-8">
        <section className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Tableau de bord exécutif
            </div>
            <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
              Accueil
            </h1>
            <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
              Vue exécutive synthétique du SaaS ASTRAEOS — pour le détail de chaque
              métrique, utilisez les sections numérotées 01 à 08 dans la sidebar.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              data-stub="Rapport hebdo"
              data-stub-mode="toast"
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
            >
              Rapport hebdo
            </button>
            <button
              type="button"
              data-stub="Personnaliser le tableau de bord"
              className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
            >
              Personnaliser
            </button>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                KPIs exécutifs
              </div>
              <div className="text-[15px] font-semibold text-[var(--navy)]">
                Indicateurs financiers et commerciaux
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <Link
                key={kpi.label}
                href={kpi.href}
                className="block cursor-pointer rounded-md border border-[var(--navy-100)] bg-white p-4 transition-shadow hover:border-[var(--gold)] hover:shadow-sm"
              >
                <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  {kpi.label}
                </div>
                <div className="mb-1 text-[24px] font-bold leading-none text-[var(--navy)]">
                  {kpi.value}
                  {kpi.unit && (
                    <span className="ml-1 text-[14px] font-semibold text-[var(--navy-300)]">
                      {kpi.unit}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--navy-300)]">{kpi.meta}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                Score santé global
              </div>
              <span className="rounded-full bg-[var(--navy-100)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--navy-300)]">
                Non disponible
              </span>
            </div>
            <div className="p-6 text-center">
              <div className="relative mx-auto h-40 w-40">
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r={SCORE_RADIUS}
                    fill="none"
                    stroke="var(--navy-100)"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[34px] font-bold leading-none text-[var(--navy-300)]">
                    —
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                    Santé SaaS
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
                Aucun score de santé agrégé n&apos;est encore calculé pour ce cabinet.
              </div>
            </div>
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                Blocs cockpit
              </div>
              <span className="text-[11px] text-[var(--navy-300)]">
                Cliquez pour creuser
              </span>
            </div>
            <div className="divide-y divide-[var(--navy-100)]">
              {cockpitBlocks.map((block) => (
                <Link
                  key={block.num}
                  href={block.href}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[var(--light-blue)]"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[12.5px] text-[var(--navy)]">
                        {block.num} · {block.label}
                      </span>
                      <span className="text-[12px] font-semibold text-[var(--navy-300)]">
                        Ouvrir →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AlertsPanel alerts={data.alerts} />

          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                Pipeline commercial
              </div>
              <Link
                href="/clients"
                className="rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                Détails
              </Link>
            </div>
            <div className="px-4 py-3">
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-[var(--gold-300)] bg-[var(--gold-200)]/40 p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--medium-400)]">
                    En période d&apos;essai
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[22px] font-bold text-[var(--navy)]">
                      {data.trialsEnCours ?? "—"}
                    </span>
                    <span className="text-[10.5px] text-[var(--navy-300)]">{trialMeta}</span>
                  </div>
                </div>
                <div className="rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--navy-300)]">
                    Base prospects
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[22px] font-bold text-[var(--navy)]">
                      {data.leadsTotal ?? "—"}
                    </span>
                    <span className="text-[10.5px] text-[var(--navy-300)]">
                      leads amont du cabinet
                    </span>
                  </div>
                </div>
              </div>

              {data.prospects.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {data.prospects.map((p) => (
                    <Link
                      key={p.id}
                      href="/leads"
                      className="block cursor-pointer rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] px-3 py-2 hover:border-[var(--gold-300)]"
                    >
                      <div className="text-[12px] font-semibold text-[var(--navy)]">
                        {p.name}
                      </div>
                      <div className="flex items-center text-[11px] text-[var(--navy-300)]">
                        <span>{p.meta}</span>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/leads"
                    className="mt-1 text-center text-[11px] font-semibold text-[var(--gold)] hover:underline"
                  >
                    Voir tous les leads →
                  </Link>
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-[var(--ivory)] px-3 py-6 text-center text-[11.5px] text-[var(--navy-300)]">
                  Aucun lead amont à afficher pour l&apos;instant.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
