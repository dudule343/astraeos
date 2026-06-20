import Link from "next/link";

import {
  getCockpit,
  type Alerte,
  type EtudePrioritaire,
  type Kpi,
  type RdvJour,
  type SanteBar,
  type StageBadge,
} from "../_data/tableau-de-bord";
import "../_styles/tableau-de-bord.css";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur",
};

const STAGE_STYLE: Record<StageBadge["variant"], React.CSSProperties> = {
  success: {},
  orange: { background: "rgba(229,124,75,0.15)", color: "var(--orange-text)" },
  "gold-100": { background: "var(--gold-100)", color: "var(--gold-deep)" },
  "gold-soft": { background: "rgba(198,142,14,0.15)", color: "var(--gold-deep)" },
};

const ALERT_DOT: Record<Alerte["dot"], string> = {
  orange: "var(--orange-text)",
  gold: "var(--gold)",
  navy: "var(--navy-300)",
};

function StageBadgeEl({ stage }: { stage: StageBadge }) {
  if (stage.variant === "success") {
    return (
      <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
        {stage.label}
      </span>
    );
  }
  return (
    <span className="badge" style={{ ...STAGE_STYLE[stage.variant], fontSize: "9.5px" }}>
      {stage.label}
    </span>
  );
}

function EtudeRow({ etu }: { etu: EtudePrioritaire }) {
  return (
    <tr
      className="dt-clickable"
      style={etu.highlight ? { background: "var(--gold-100)" } : undefined}
    >
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="ingenieur-avatar">{etu.initials}</div>
          <div>
            <div className="cell-primary">{etu.client}</div>
            <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>{etu.ref}</div>
          </div>
        </div>
      </td>
      <td>
        <StageBadgeEl stage={etu.stage} />
      </td>
      <td className="nowrap" style={etu.echeanceLate ? { color: "var(--orange-text)" } : undefined}>
        {etu.echeance.includes("·") || etu.echeanceLate ? (
          <strong>{etu.echeance}</strong>
        ) : (
          etu.echeance
        )}
      </td>
      <td className={`num cell-money${etu.honorairesGold ? " gold" : ""}`}>{etu.honoraires}</td>
      <td className="center">
        <Link
          href="/espace-ingenieur/dossiers"
          className="btn btn-ghost btn-sm"
          style={{ textDecoration: "none" }}
        >
          {etu.actionLabel}
        </Link>
      </td>
    </tr>
  );
}

function KpiCell({ kpi }: { kpi: Kpi }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{kpi.label}</div>
      <div className={`kpi-value${kpi.gold ? " gold" : ""}`}>
        {kpi.value} {kpi.unit ? <span className="unit">{kpi.unit}</span> : null}
      </div>
      <div className="kpi-meta">{kpi.meta}</div>
      <div className="kpi-compare-3">
        {kpi.compares.map((c) => (
          <div key={c.period}>
            <div className="kpi-compare-3-period">{c.period}</div>
            <div className={`kpi-compare-3-value ${c.dir}`}>
              <span className="kpi-compare-3-arrow">{c.dir === "up" ? "▲" : "▼"}</span>
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlerteRow({ alerte, last }: { alerte: Alerte; last: boolean }) {
  return (
    <div
      style={{
        padding: "14px 18px",
        borderBottom: last ? "none" : "1px solid var(--ivory-deep)",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: ALERT_DOT[alerte.dot],
          flexShrink: 0,
          marginTop: "5px",
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--navy)" }}>
          {alerte.title}
        </div>
        <div style={{ fontSize: "10px", color: "var(--navy-300)", marginTop: "2px" }}>
          {alerte.detail}
        </div>
      </div>
    </div>
  );
}

function RdvRow({ rdv }: { rdv: RdvJour }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: "1px solid var(--ivory-deep)",
      }}
    >
      <div style={{ width: "60px", flexShrink: 0, textAlign: "center" }}>
        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "var(--gold)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {rdv.jour}
        </div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>
          {rdv.heure}
        </div>
      </div>
      <div style={{ width: "3px", alignSelf: "stretch", background: "var(--gold)", borderRadius: "2px" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--navy)" }}>{rdv.client}</div>
        <div style={{ fontSize: "10px", color: "var(--navy-300)", marginTop: "1px" }}>{rdv.meta}</div>
      </div>
    </div>
  );
}

function SanteRow({ bar, last }: { bar: SanteBar; last: boolean }) {
  const color = bar.tone === "green" ? "#2EA85A" : "var(--gold)";
  const valueColor = bar.tone === "green" ? "#2EA85A" : "var(--gold-deep)";
  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: last ? "none" : "1px solid var(--ivory-deep)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--navy)" }}>
            {bar.label}
          </span>
        </div>
        <strong style={{ fontSize: "13px", color: valueColor }}>{bar.value}</strong>
      </div>
      <div
        style={{
          height: "5px",
          background: "var(--ivory-deep)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div style={{ height: "100%", width: `${bar.pct}%`, background: color }} />
      </div>
      <div style={{ fontSize: "10px", color: "var(--navy-300)", marginTop: "5px" }}>{bar.meta}</div>
    </div>
  );
}

export default function IngenieurCockpit() {
  const d = getCockpit();

  return (
    <div style={{ padding: "28px 36px 40px" }}>
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Tableau de bord personnel · {d.dateLabel}</div>
          <h1 className="hero-title">
            Bonjour <strong>{d.prenom}</strong>
          </h1>
          <p className="hero-sub">{d.heroSub}</p>
        </div>
        <div className="hero-actions">
          <Link
            href="/espace-ingenieur/client-new"
            className="btn btn-gold btn-sm"
            style={{ textDecoration: "none" }}
          >
            + Créer un espace client
          </Link>
        </div>
      </div>

      {/* 5 KPI principaux avec comparaisons M-1 · T-1 · N-1 */}
      <div className="kpis kpis-5 mb-20">
        {d.kpis.map((kpi) => (
          <KpiCell key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* LIGNE 1 : Études prioritaires (large) + Alertes (court) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "18px",
          marginBottom: "18px",
        }}
      >
        {/* Mes études prioritaires */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
              Mes études prioritaires
            </div>
            <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>{d.etudesCount}</span>
          </div>
          <table className="dt" style={{ fontSize: "12.5px" }}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Étape</th>
                <th>Échéance</th>
                <th className="num">Honoraires</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {d.etudes.map((etu) => (
                <EtudeRow key={etu.id} etu={etu} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mes alertes */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l10 17H2L12 3z" />
                <path d="M12 10v4M12 17v.5" />
              </svg>
              Mes alertes
            </div>
            <span
              className="badge"
              style={{ background: "rgba(229,124,75,0.15)", color: "var(--orange-text)", fontSize: "10px" }}
            >
              {d.alertesCount}
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {d.alertes.map((alerte, i) => (
              <AlerteRow key={alerte.id} alerte={alerte} last={i === d.alertes.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* LIGNE 2 : RDV du jour + Santé du portefeuille */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
          marginBottom: "18px",
        }}
      >
        {/* Mes rendez-vous du jour */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 3v4M16 3v4" />
              </svg>
              Mes rendez-vous du jour
            </div>
            <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>{d.rdvDuJourMeta}</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {d.rdvDuJour.map((rdv) => (
              <RdvRow key={rdv.id} rdv={rdv} />
            ))}
            <div style={{ padding: "12px 20px", textAlign: "center" }}>
              <Link
                href="/espace-ingenieur/agenda"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "10.5px", textDecoration: "none" }}
              >
                Voir tout l&apos;agenda →
              </Link>
            </div>
          </div>
        </div>

        {/* Santé du portefeuille */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              Santé de mon portefeuille
            </div>
            <span className="badge badge-success" style={{ fontSize: "10px" }}>
              {d.santeScore}
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {d.sante.map((bar, i) => (
              <SanteRow key={bar.label} bar={bar} last={i === d.sante.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
