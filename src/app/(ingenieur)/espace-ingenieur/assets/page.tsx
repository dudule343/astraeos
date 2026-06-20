import Link from "next/link";
import type { ReactNode } from "react";

import "../../_styles/assets.css";

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

/**
 * Icônes d'axe (14px) portées à l'identique des <symbol> des <defs> de la
 * maquette (i-finance, i-shield, i-business, i-doc). Les tracés et la graisse
 * de trait (stroke-width) sont repris exactement.
 */
const AXIS_ICONS: Record<AxisCardData["icon"], ReactNode> = {
  // #i-finance · portefeuille/carte avec point
  finance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9H5a2 2 0 1 1 0-4h12" />
      <circle cx="17" cy="14" r="1.4" fill="currentColor" />
    </svg>
  ),
  // #i-shield · bouclier avec coche
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  // #i-business · courbe ascendante (trending-up)
  business: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  ),
  // #i-doc · document à coin replié
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
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
    <div className="px-10 py-8">
      {/* HERO · porté de la maquette : `Assets <strong>du portefeuille</strong>` */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{data.hero.eyebrow}</div>
          <h1 className="hero-title">
            {data.hero.titleLead}
            <strong>{data.hero.titleStrong}</strong>
          </h1>
          <p className="hero-sub">{data.hero.sub}</p>
        </div>
        <div className="hero-actions">
          {/* Boutons inertes dans la maquette : branchés ici sur le feedback
              honnête global (StubShell) plutôt que sur des coquilles mortes. */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            data-stub="Export des assets"
            data-stub-mode="toast"
            data-stub-body="L'export consolidé de vos assets sera disponible prochainement."
          >
            Exporter
          </button>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            data-stub="Sélection de période"
            data-stub-mode="modal"
            data-stub-body="Le filtre par période sera branché sur l'historique de vos souscriptions."
          >
            Période · 2026
          </button>
        </div>
      </div>

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
    </div>
  );
}
