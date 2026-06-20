import Link from "next/link";

import { getFicheRdv, type FicheRdv } from "../../../_data/fiche-rdv";
import { FicheRdvDocs } from "./FicheRdvDocs";
import "../../../_styles/fiche-rdv.css";

export const metadata = {
  title: "ASTRAEOS · Fiche rendez-vous",
};

export const dynamic = "force-dynamic";

/** Lien vers la vraie salle de visioconférence (Jitsi auto-hébergé + Deepgram
 *  déjà câblés sous /visio/[room]). On entre côté ingénieur. */
function visioHref(fiche: FicheRdv): string {
  const q = new URLSearchParams({
    role: "engineer",
    prospect: fiche.slug,
    nom: fiche.nom,
  });
  return `/visio/${fiche.room}?${q.toString()}`;
}

export default async function FicheRdvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = getFicheRdv(id);

  return (
    <div className="fiche-rdv-wrap">
      {/* Barre de retour */}
      <div className="page-back-bar">
        <Link className="btn btn-ghost btn-sm" href="/espace-ingenieur/agenda">
          ← Retour à l&apos;agenda
        </Link>
        <Link className="btn btn-ghost btn-sm" href="/espace-ingenieur/prospects">
          Voir le pipeline étape 01
        </Link>
      </div>

      {/* HERO */}
      <div className="frdv-hero">
        <div className="frdv-hero-row">
          <div className="frdv-hero-main">
            <div className="hero-eyebrow">{fiche.eyebrow}</div>
            <h1 className="hero-title">
              {fiche.title.map((part, i) =>
                part.strong ? (
                  <strong key={i}>{part.text}</strong>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
            </h1>
            <p className="hero-sub">{fiche.sub}</p>
            <div className="frdv-tags">
              {fiche.tags.map((tag) => (
                <span key={tag.label} className={`frdv-tag ${tag.variant}`}>
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
          <div className="frdv-hero-actions">
            <Link
              className="s1c-visio-btn join frdv-join-lg"
              href={visioHref(fiche)}
              title={`Rejoindre la salle de visioconférence · ${fiche.visioLabel}`}
            >
              <span className="s1c-visio-live" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                style={{ width: "18px", height: "18px" }}
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
              Rejoindre en visio
            </Link>
            {fiche.hasModifier ? (
              <button
                type="button"
                className="s1c-visio-btn replay frdv-replay-sm"
                disabled
                title="Modification du RDV — bientôt disponible"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: "14px", height: "14px" }}
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
                </svg>
                Modifier le RDV
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Synthèse client + Objectifs DCI Simplifié */}
      <div className="frdv-grid-2">
        {/* Synthèse client */}
        <div className="s1c-chart-card">
          <div className="s1c-chart-title">
            <span className="s1c-chart-title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
              </svg>
            </span>
            Synthèse client
          </div>
          <div className="frdv-synthese">
            {fiche.synthese.map((row) => (
              <div key={row.label} className="frdv-synthese-row">
                <strong>{row.label}</strong> · {row.value}
              </div>
            ))}
          </div>
        </div>

        {/* Objectifs · DCI Simplifié */}
        <div className="s1c-chart-card">
          <div className="s1c-chart-title">
            <span className="s1c-chart-title-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </span>
            Objectifs · DCI Simplifié
          </div>
          <div className="frdv-objectifs">
            {fiche.objectifs.map((obj) => (
              <div key={obj.rank} className="frdv-objectif">
                <div className={`frdv-objectif-rank ${obj.rankVariant}`}>
                  {obj.rank}
                </div>
                <div className="frdv-objectif-body">
                  <div className="frdv-objectif-title">{obj.title}</div>
                  <div className="frdv-objectif-meta">{obj.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents préparatoires complétés */}
      <div className="s1c-chart-card frdv-docs-card">
        <div className="s1c-chart-title">
          <span className="s1c-chart-title-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </span>
          {fiche.docsCardTitle}
        </div>
        <FicheRdvDocs fiche={fiche} />
        <div className="frdv-note">
          <strong>Note v21</strong> · {fiche.noteV21}
        </div>
      </div>
    </div>
  );
}
