import Link from "next/link";
import type { ReactNode } from "react";

import "../../_styles/assets.css";

import { PageScaffold } from "../../_components/PageScaffold";
import { GhostButton, GoldButton } from "@/app/_components/shared/PageHeader";
import {
  fetchAssetsOverview,
  type AxisCard as AxisCardData,
  type SyntheseKpi,
} from "../../_data/assets";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Assets du portefeuille",
};

/** Icônes de synthèse (34px) portées des <symbol> de la maquette. */
const SYNTHESE_ICONS: ReactNode[] = [
  // Patrimoine sous gestion
  <svg key="patrimoine" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.5 6.5 C 16.8 4.8 14.5 4 12 4 C 7.5 4 4.5 7.5 4.5 12 C 4.5 16.5 7.5 20 12 20 C 14.5 20 16.8 19.2 18.5 17.5" />
    <line x1="3" y1="10" x2="14" y2="10" />
    <line x1="3" y1="14" x2="14" y2="14" />
  </svg>,
  // Contrats actifs
  <svg key="contrats" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3 L 7 21 L 17 21 L 17 7 L 13 3 Z" />
    <line x1="10" y1="11" x2="14" y2="11" />
    <line x1="10" y1="15" x2="14" y2="15" />
    <polyline points="13 3 13 7 17 7" />
  </svg>,
  // Clients servis
  <svg key="clients" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 21 v -2 a 4 4 0 0 1 4 -4 h 5 a 4 4 0 0 1 4 4 v 2" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M15 21 v -1.5 a 3 3 0 0 1 3 -3 h 1.5 a 3 3 0 0 1 3 3 v 1.5" />
  </svg>,
];

/** Icônes d'axe (14px) référencées par id dans `_data/assets.ts`. */
const AXIS_ICONS: Record<AxisCardData["icon"], ReactNode> = {
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="19" x2="20" y2="19" />
      <rect x="5" y="11" width="3" height="6" />
      <rect x="10.5" y="7" width="3" height="10" />
      <rect x="16" y="4" width="3" height="13" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 L 20 6 V 11 C 20 16 16.5 19.5 12 21 C 7.5 19.5 4 16 4 11 V 6 Z" />
    </svg>
  ),
  business: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21 V 9 L 12 4 L 20 9 V 21 Z" />
      <rect x="9" y="13" width="6" height="8" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3 L 7 21 L 17 21 L 17 7 L 13 3 Z" />
      <line x1="10" y1="11" x2="14" y2="11" />
      <line x1="10" y1="15" x2="14" y2="15" />
      <polyline points="13 3 13 7 17 7" />
    </svg>
  ),
};

function SectionRule({ label, right }: { label: string; right: string }) {
  return (
    <div className="ag-rule">
      <div className="ag-rule-label">{label}</div>
      <div className="ag-rule-line" />
      <div className="ag-rule-right">{right}</div>
    </div>
  );
}

function SyntheseKpiCard({ kpi, icon }: { kpi: SyntheseKpi; icon: ReactNode }) {
  return (
    <div className="ag-kpi">
      <div className="ag-kpi-head">
        <div className="ag-kpi-label">{kpi.label}</div>
        <div className="ag-kpi-icon">{icon}</div>
      </div>
      <div className="ag-kpi-value">
        {kpi.value}
        {kpi.unit && <span className="unit"> {kpi.unit}</span>}
      </div>
      <div className="ag-kpi-meta">{kpi.meta}</div>
      <div className="ag-compare">
        {kpi.trends.map((t) => (
          <div key={t.period}>
            <div className="ag-compare-period">{t.period}</div>
            <div className={`ag-compare-value ${t.dir}`}>
              <span className="ag-compare-arrow">{t.dir === "up" ? "▲" : "▼"}</span>
              {t.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AxisCard({ axis }: { axis: AxisCardData }) {
  return (
    <Link href={axis.href} className="ag-axis">
      <div className="ag-axis-body">
        <div className="ag-axis-head">
          <div className="ag-axis-icon">{AXIS_ICONS[axis.icon]}</div>
          <div className="ag-axis-title">
            {axis.title}
            {axis.titleLine2 && (
              <>
                <br />
                {axis.titleLine2}
              </>
            )}
          </div>
        </div>
        <div className="ag-axis-value">
          {axis.value} <span className="unit">{axis.valueUnit}</span>
        </div>
        <div className="ag-axis-caption">{axis.caption}</div>
        <div className="ag-axis-stats">
          {axis.stats.map((s) => (
            <div key={s.label}>
              <div className="ag-axis-stat-label">{s.label}</div>
              <strong className="ag-axis-stat-value">{s.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="ag-axis-footer">VOIR LE DÉTAIL →</div>
    </Link>
  );
}

export default async function AssetsPage() {
  const data = await fetchAssetsOverview();

  return (
    <PageScaffold
      eyebrow="Assets du portefeuille · vue d'ensemble personnelle"
      title="Assets du portefeuille"
      description="Vue consolidée des assets placés via votre portefeuille personnel · patrimoine sous gestion, contrats actifs, clients servis. Cliquez sur un axe pour ouvrir le détail."
      actions={
        <>
          <GhostButton
            dataStub="Export des assets"
            dataStubBody="L'export consolidé de vos assets sera disponible prochainement."
          >
            Exporter
          </GhostButton>
          <GoldButton
            dataStub="Sélection de période"
            dataStubBody="Le filtre par période sera branché sur l'historique de vos souscriptions."
          >
            Période · 2026
          </GoldButton>
        </>
      }
    >
      <SectionRule label={data.syntheseHeader.eyebrow} right={data.syntheseHeader.right} />

      <div className="ag-kpis ag-kpis-3 ag-mb-20">
        {data.synthese.map((kpi, i) => (
          <SyntheseKpiCard key={kpi.label} kpi={kpi} icon={SYNTHESE_ICONS[i]} />
        ))}
      </div>

      <SectionRule label={data.repartitionHeader.eyebrow} right={data.repartitionHeader.right} />

      <div className="ag-axes">
        {data.axes.map((axis) => (
          <AxisCard key={axis.href} axis={axis} />
        ))}
      </div>
    </PageScaffold>
  );
}
