import Link from "next/link";

import { getFicheDossier, type ParcoursEtape } from "../../../_data/fiche-dossier";
import "../../../_styles/fiche-dossier.css";
import { OuvrirEtudeButton } from "./OuvrirEtudeButton";

export const metadata = {
  title: "ASTRAEOS · Fiche dossier",
};

export const dynamic = "force-dynamic";

/** Carte d'une étape du parcours, portée à l'identique de la maquette. */
function EtapeCard({ etape }: { etape: ParcoursEtape }) {
  const badgeClass =
    etape.badge.variant === "success" ? "badge badge-success fd-badge" : "badge fd-badge-j1 fd-badge";

  // Étape 5 : carte enrichie (production de l'étude).
  if (etape.rich) {
    return (
      <div className="fd-card rich">
        <div className="fd-card-row">
          <div className="fd-rich-main">
            <div className="fd-eyebrow">{etape.eyebrow}</div>
            <div className="fd-title">{etape.title}</div>
            <div className="fd-rich-subtitle">{etape.rich.subtitle}</div>
            <div className="fd-rich-parties">
              {etape.rich.parties.map((p, i) => (
                <span key={p.lead}>
                  <strong>{p.lead}</strong>
                  {p.rest}
                  {i < etape.rich!.parties.length - 1 ? <br /> : null}
                </span>
              ))}
            </div>
            <div className="fd-rich-livraison">
              <div className="fd-rich-livraison-eyebrow">{etape.rich.livraison.eyebrow}</div>
              <div className="fd-rich-livraison-meta">{etape.rich.livraison.meta}</div>
            </div>
          </div>
          <span className={badgeClass}>{etape.badge.label}</span>
        </div>
      </div>
    );
  }

  const inner = (
    <div className="fd-card-row">
      <div>
        <div className="fd-eyebrow">{etape.eyebrow}</div>
        <div className="fd-title">{etape.title}</div>
        <div className="fd-desc">{etape.description}</div>
      </div>
      <span className={badgeClass}>{etape.badge.label}</span>
    </div>
  );

  const cardClass = `fd-card${etape.state === "current" ? " current" : ""}`;

  // Étape 1 : carte cliquable vers l'écran de création d'espace (maquette : onclick goToPage).
  if (etape.href) {
    return (
      <Link href={etape.href} className={`${cardClass} clickable`}>
        {inner}
      </Link>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}

export default async function FicheDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dossier = await getFicheDossier(id);

  return (
    <div>
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{dossier.eyebrow}</div>
          <h1 className="hero-title">
            {dossier.heroNameLead}
            <strong>{dossier.heroNameStrong}</strong>
          </h1>
          <p className="hero-sub">{dossier.heroSub}</p>
        </div>
        <div className="hero-actions">
          <Link
            href="/espace-ingenieur/dossiers"
            className="btn btn-ghost btn-sm"
            style={{ textDecoration: "none" }}
          >
            ← Retour pipeline
          </Link>
          {/*
            « Ouvrir l'étude » (btn-gold du hero) : génère et télécharge le vrai
            PDF de l'étude patrimoniale du dossier (Server Action pdf-lib). Plus
            de bouton mort : l'action produit un livrable réel.
          */}
          <OuvrirEtudeButton
            dossierId={dossier.id}
            label="Ouvrir l'étude"
            className="btn btn-gold btn-sm"
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="kpis kpis-4 mb-20">
        {dossier.kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div
              className={`kpi-value${k.valueVariant ? ` ${k.valueVariant}` : ""}`}
              style={
                k.valueVariant === "gold"
                  ? { fontSize: "20px" }
                  : k.valueVariant === "green"
                    ? { fontSize: "22px" }
                    : undefined
              }
            >
              {k.value}
              {k.unit ? <span className="unit">{k.unit}</span> : null}
            </div>
            <div className="kpi-meta">{k.meta}</div>
          </div>
        ))}
      </div>

      {/* TIMELINE 6 ÉTAPES */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l6-6 4 4 8-8" />
              <path d="M14 7h7v7" />
            </svg>
            Timeline du parcours · 6 étapes
          </div>
        </div>
        <div className="card-body" style={{ padding: "30px 22px" }}>
          <div className="fd-timeline">
            <div className="fd-timeline-rail" />
            {dossier.parcours.map((etape) => (
              <div className="fd-step" key={etape.num}>
                <div className={`fd-dot${etape.state === "current" ? " current" : ""}`}>{etape.num}</div>
                <EtapeCard etape={etape} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions disponibles maintenant */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {/*
              Maquette : <use href="#i-cockpit"/>, mais le symbole i-cockpit
              n'est PAS défini dans les <defs> → référence cassée, aucun glyphe.
              On porte ce comportement à l'identique avec un SVG vide.
            */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />
            Actions disponibles maintenant
          </div>
        </div>
        <div className="card-body" style={{ padding: "18px 22px" }}>
          <div className="fd-actions-grid">
            {/*
              Chaque action est branchée sur une vraie feature :
              « Préparer la restitution » et « Voir le transcript » ouvrent la
              salle de visioconférence (Jitsi + transcription), « Reporter le RDV »
              renvoie vers l'agenda, « Ouvrir l'étude » génère et télécharge le
              PDF réel de l'étude patrimoniale (Server Action pdf-lib).
            */}
            {dossier.actions.map((a) => {
              const className = `btn ${a.primary ? "btn-gold" : "btn-ghost"} btn-sm`;
              // Action « Ouvrir l'étude » : génération + téléchargement du PDF réel.
              if (a.etude) {
                return (
                  <OuvrirEtudeButton
                    key={a.label}
                    dossierId={dossier.id}
                    label={a.label}
                    className={className}
                    style={{ padding: "14px" }}
                  />
                );
              }
              if (a.href) {
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className={className}
                    style={{ textDecoration: "none", padding: "14px" }}
                  >
                    {a.label}
                  </Link>
                );
              }
              return (
                <button
                  key={a.label}
                  type="button"
                  className={className}
                  disabled
                  title={a.disabledTitle}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
