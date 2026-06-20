import Link from "next/link";
import type { ReactNode } from "react";

import { PageScaffold } from "../../_components/PageScaffold";
import { GhostButton, GoldButton } from "@/app/_components/shared/PageHeader";
import { fetchCockpitDashboard } from "../../_data/cockpit";

export const dynamic = "force-dynamic";

/** Nombre formaté fr-FR sans symbole (le « € » est porté par un span dédié). */
function fmtNum(n: number): string {
  return Math.round(n).toLocaleString("fr-FR");
}

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Assets du portefeuille",
};

function SectionRule({ label, right }: { label: string; right: string }) {
  return (
    <div className="mb-3.5 flex items-center gap-3.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold-deep)]">
        {label}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-[var(--gold-200)] to-transparent" />
      <div className="text-[10.5px] text-[var(--navy-300)]">{right}</div>
    </div>
  );
}

function SyntheseCard({
  label,
  value,
  unit,
  meta,
  icon,
  empty,
}: {
  label: string;
  value: string;
  unit?: string;
  meta: string;
  icon: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="relative rounded-md border border-[var(--navy-100)] bg-white px-[22px] pb-[18px] pt-[22px]">
      <div className="mb-3.5 flex items-start justify-between">
        <div className="pr-10 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--navy-300)]">
          {label}
        </div>
        <div className="grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-lg bg-[var(--gold-100)] text-[var(--gold-deep)]">
          {icon}
        </div>
      </div>
      <div className="text-[30px] font-bold leading-[1.05] text-[var(--navy)]">
        {empty ? "—" : value}
        {!empty && unit && (
          <span className="ml-1 text-[14px] font-semibold text-[var(--navy-300)]">{unit}</span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-[var(--navy-300)]">{meta}</div>
    </div>
  );
}

type AxisCard = {
  href: string;
  title: ReactNode;
  value: string;
  valueUnit: string;
  caption: string;
  stats: { label: string; value: string }[];
  icon: ReactNode;
  empty: boolean;
};

function AxisCard({ axis }: { axis: AxisCard }) {
  return (
    <Link
      href={axis.href}
      className="group flex flex-col overflow-hidden rounded-md border border-[var(--navy-100)] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(16,45,80,0.08)]"
    >
      <div className="px-5 pb-3.5 pt-[18px]">
        <div className="mb-3 flex items-center gap-[9px]">
          <div className="grid h-7 w-7 place-items-center rounded-[7px] bg-[var(--gold-100)] text-[var(--gold-deep)]">
            {axis.icon}
          </div>
          <div className="text-[11px] font-bold leading-tight text-[var(--navy)]">
            {axis.title}
          </div>
        </div>
        <div className="font-[Epilogue] text-[26px] font-bold leading-none text-[var(--navy)]">
          {axis.empty ? "—" : axis.value}
          {!axis.empty && (
            <span className="ml-1 text-[12px] text-[var(--gold-deep)]">{axis.valueUnit}</span>
          )}
        </div>
        <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">{axis.caption}</div>
        <div className="mt-3.5 flex gap-3.5 border-t border-[var(--ivory-deep)] pt-3 text-[10.5px]">
          {axis.stats.map((s) => (
            <div key={s.label}>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                {s.label}
              </div>
              <strong className="text-[13px] text-[var(--navy)]">{axis.empty ? "—" : s.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[var(--ivory)] px-5 py-2 text-right text-[10px] font-bold tracking-[0.08em] text-[var(--gold-deep)]">
        VOIR LE DÉTAIL →
      </div>
    </Link>
  );
}

export default async function AssetsPage() {
  const d = await fetchCockpitDashboard();

  // Patrimoine sous gestion : encours financier + montant immobilier engagé.
  const patrimoine = d.encoursFinancier + d.montantImmo;
  const contratsActifs = d.contratsAssurance + d.clientsFinancier + d.projetsImmo;

  const honorairesMoyen =
    d.etudesLivrees + d.etudesEnCours > 0
      ? Math.round(d.caGenere / (d.etudesLivrees + d.etudesEnCours))
      : 0;

  const axes: AxisCard[] = [
    {
      href: "/espace-ingenieur/assets-financier",
      title: (
        <>
          Investissement
          <br />
          financier
        </>
      ),
      value: fmtNum(d.encoursFinancier),
      valueUnit: "€",
      caption: "Encours sous gestion",
      stats: [
        { label: "Clients", value: String(d.clientsFinancier) },
        { label: "Sur", value: `${d.clientsServis}` },
      ],
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="19" x2="20" y2="19" />
          <rect x="5" y="11" width="3" height="6" />
          <rect x="10.5" y="7" width="3" height="10" />
          <rect x="16" y="4" width="3" height="13" />
        </svg>
      ),
      empty: d.encoursFinancier === 0 && d.clientsFinancier === 0,
    },
    {
      href: "/espace-ingenieur/assets-assurance",
      title: <>Assurance</>,
      value: String(d.contratsAssurance),
      valueUnit: "contrats",
      caption: "Tous types confondus",
      stats: [
        { label: "Clients", value: String(d.clientsAssurance) },
        { label: "Sur", value: `${d.clientsServis}` },
      ],
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 L 20 6 V 11 C 20 16 16.5 19.5 12 21 C 7.5 19.5 4 16 4 11 V 6 Z" />
        </svg>
      ),
      empty: d.contratsAssurance === 0,
    },
    {
      href: "/espace-ingenieur/assets-immobilier",
      title: (
        <>
          Investissement
          <br />
          immobilier
        </>
      ),
      value: String(d.projetsImmo),
      valueUnit: "projets",
      caption: `Montant cumulé · ${d.montantImmo > 0 ? fmtNum(d.montantImmo) + " €" : "—"}`,
      stats: [
        { label: "Clients", value: String(d.clientsImmo) },
        { label: "Sur", value: `${d.clientsServis}` },
      ],
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21 V 9 L 12 4 L 20 9 V 21 Z" />
          <rect x="9" y="13" width="6" height="8" />
        </svg>
      ),
      empty: d.projetsImmo === 0,
    },
    {
      href: "/espace-ingenieur/assets-honoraires",
      title: (
        <>
          Honoraires
          <br />
          de conseil
        </>
      ),
      value: fmtNum(d.caGenere),
      valueUnit: "€",
      caption: "Honoraires facturés",
      stats: [
        { label: "Études", value: String(d.etudesLivrees + d.etudesEnCours) },
        { label: "Moyen", value: honorairesMoyen > 0 ? `${fmtNum(honorairesMoyen)} €` : "—" },
      ],
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3 L 7 21 L 17 21 L 17 7 L 13 3 Z" />
          <line x1="10" y1="11" x2="14" y2="11" />
          <line x1="10" y1="15" x2="14" y2="15" />
          <polyline points="13 3 13 7 17 7" />
        </svg>
      ),
      empty: d.caGenere === 0,
    },
  ];

  return (
    <PageScaffold
      eyebrow="Assets du portefeuille · vue d'ensemble personnelle"
      title="Assets du portefeuille"
      description="Vue consolidée des assets placés via votre portefeuille personnel · patrimoine sous gestion, contrats actifs, clients servis. Cliquez sur un axe pour ouvrir le détail."
      actions={
        <>
          <GhostButton dataStub="Export des assets" dataStubBody="L'export consolidé de vos assets sera disponible prochainement.">
            Exporter
          </GhostButton>
          <GoldButton dataStub="Sélection de période" dataStubBody="Le filtre par période sera branché sur l'historique de vos souscriptions.">
            Période · 2026
          </GoldButton>
        </>
      }
    >
      {!d.hasData && (
        <div className="mb-5 rounded-md border border-dashed border-[var(--navy-100)] bg-white px-5 py-4 text-[12px] leading-relaxed text-[var(--navy-300)]">
          Aucun encours n&apos;est encore enregistré sur votre portefeuille. Les indicateurs
          ci-dessous se rempliront automatiquement dès la première souscription saisie.
        </div>
      )}

      <SectionRule label="Synthèse" right="Mon portefeuille · 2026" />

      <div className="mb-5 grid grid-cols-3 gap-4">
        <SyntheseCard
          label="Patrimoine sous gestion"
          value={fmtNum(patrimoine)}
          unit="€"
          meta="cumul placé via votre portefeuille"
          empty={patrimoine === 0}
          icon={
            <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.5 6.5 C 16.8 4.8 14.5 4 12 4 C 7.5 4 4.5 7.5 4.5 12 C 4.5 16.5 7.5 20 12 20 C 14.5 20 16.8 19.2 18.5 17.5" />
              <line x1="3" y1="10" x2="14" y2="10" />
              <line x1="3" y1="14" x2="14" y2="14" />
            </svg>
          }
        />
        <SyntheseCard
          label="Contrats actifs"
          value={String(contratsActifs)}
          meta={`${d.clientsFinancier} financiers · ${d.contratsAssurance} assurance · ${d.projetsImmo} immobilier`}
          empty={contratsActifs === 0}
          icon={
            <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3 L 7 21 L 17 21 L 17 7 L 13 3 Z" />
              <line x1="10" y1="11" x2="14" y2="11" />
              <line x1="10" y1="15" x2="14" y2="15" />
              <polyline points="13 3 13 7 17 7" />
            </svg>
          }
        />
        <SyntheseCard
          label="Clients servis"
          value={String(d.clientsServis)}
          meta="clients en cours de suivi"
          empty={d.clientsServis === 0}
          icon={
            <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 21 v -2 a 4 4 0 0 1 4 -4 h 5 a 4 4 0 0 1 4 4 v 2" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M15 21 v -1.5 a 3 3 0 0 1 3 -3 h 1.5 a 3 3 0 0 1 3 3 v 1.5" />
            </svg>
          }
        />
      </div>

      <SectionRule label="Répartition par axe" right="cliquez sur un axe pour le détail" />

      <div className="grid grid-cols-4 gap-4">
        {axes.map((axis) => (
          <AxisCard key={axis.href} axis={axis} />
        ))}
      </div>
    </PageScaffold>
  );
}
