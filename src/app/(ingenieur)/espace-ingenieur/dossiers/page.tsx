import Link from "next/link";

import { getPipelineScreen, type CardBadge, type PipelineCard } from "../../_data/pipeline";
import "../../_styles/pipeline.css";

export const metadata = {
  title: "ASTRAEOS · Pipeline de mes dossiers",
};

export const dynamic = "force-dynamic";

const BADGE_CLASS: Record<CardBadge["style"], string> = {
  gold: "badge pipeline-badge badge-gold",
  blue: "badge pipeline-badge badge-blue",
  alert: "badge pipeline-badge badge-alert",
  warn: "badge pipeline-badge badge-warn",
  success: "badge badge-success pipeline-badge badge-card-success",
};

const CARD_VARIANT_CLASS: Record<PipelineCard["variant"], string> = {
  default: "",
  alert: "card-alert",
  highlight: "card-highlight",
};

function CardInner({ card }: { card: PipelineCard }) {
  return (
    <>
      <div className="pipeline-card-name">{card.name}</div>
      <div className="pipeline-card-sub">{card.sub}</div>
      {card.badge ? (
        <div className="pipeline-card-badge-row">
          <span className={BADGE_CLASS[card.badge.style]}>{card.badge.label}</span>
        </div>
      ) : null}
      {typeof card.progressPct === "number" ? (
        <div className="pipeline-progress">
          <div className="pipeline-progress-fill" style={{ width: `${card.progressPct}%` }} />
        </div>
      ) : null}
    </>
  );
}

function Card({ card }: { card: PipelineCard }) {
  const variantClass = CARD_VARIANT_CLASS[card.variant];

  if (card.linkable) {
    return (
      <Link
        href={`/espace-ingenieur/dossiers/${card.id}`}
        className={`pipeline-card is-linkable ${variantClass}`.trim()}
      >
        <CardInner card={card} />
      </Link>
    );
  }

  return (
    <div className={`pipeline-card ${variantClass}`.trim()}>
      <CardInner card={card} />
    </div>
  );
}

export default function PipelinePage() {
  const screen = getPipelineScreen();

  return (
    <div className="pipeline-page">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.hero.eyebrow}</div>
          <h1 className="hero-title">
            Pipeline de <strong>mes dossiers</strong>
          </h1>
          <p className="hero-sub">{screen.hero.sub}</p>
        </div>
        <div className="hero-actions">
          {/* Export non branché : bouton honnêtement désactivé. */}
          <button className="btn btn-ghost btn-sm" disabled>
            Exporter
          </button>
          <Link className="btn btn-gold btn-sm" href="/espace-ingenieur/client-new">
            + Nouveau dossier
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpis kpis-4 mb-20">
        {screen.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div
              className={`kpi-value${kpi.tone === "gold" ? " gold" : ""}`}
              style={kpi.tone === "alert" ? { color: "var(--orange-text)" } : undefined}
            >
              {kpi.value}
              {kpi.unit ? <span className="unit"> {kpi.unit}</span> : null}
            </div>
            <div className="kpi-meta">{kpi.meta}</div>
          </div>
        ))}
      </div>

      {/* KANBAN · 6 colonnes */}
      <div className="pipeline-grid">
        {screen.columns.map((col) => {
          const goldHead =
            col.headerVariant === "gold-soft" || col.headerVariant === "gold-strong";
          return (
            <div key={col.step}>
              <div
                className={`pipeline-col-head${
                  col.headerVariant === "gold-soft"
                    ? " head-gold-soft"
                    : col.headerVariant === "gold-strong"
                      ? " head-gold-strong"
                      : ""
                }`}
              >
                <div className="pipeline-col-head-row">
                  <span className={`pipeline-col-title${goldHead ? " title-gold" : ""}`}>
                    {col.step} · {col.title}
                  </span>
                  <span
                    className={`pipeline-col-count${
                      col.countTone === "gold"
                        ? " count-gold"
                        : col.countTone === "gold-300"
                          ? " count-gold-300"
                          : " count-navy"
                    }`}
                  >
                    {col.count}
                  </span>
                </div>
                <div className="pipeline-col-subtitle">{col.subtitle}</div>
              </div>

              <div className={`pipeline-col-body${col.emphasized ? " body-emphasized" : ""}`}>
                {col.cards.map((card) => (
                  <Card key={card.id} card={card} />
                ))}
                {col.footerNote ? (
                  <div className="pipeline-col-footer">{col.footerNote}</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
