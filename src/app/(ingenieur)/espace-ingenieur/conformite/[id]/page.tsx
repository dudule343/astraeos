import Link from "next/link";

import {
  ACTION_BAR,
  CONDITIONS,
  CONDITIONS_SUB,
  HERO,
  PARCOURS_BADGE,
  PARCOURS_STEPS,
  PAY_BANNER,
  TEMOIN_DOCS,
} from "../../../_data/fiche-conformite";
import "../../../_styles/conformite.css";
import "../../../_styles/fiche-conformite.css";
import { DerModalControls, EnvoiPack } from "./FicheConformiteInteractive";

export const metadata = {
  title: "ASTRAEOS · Fiche conformité",
};

export default async function FicheConformitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Modèle de référence Joubert : l'id est mappé à la fiche démonstrative,
  // exactement comme la fiche client de la maquette.
  await params;

  return (
    <div className="fco-wrap">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{HERO.eyebrow}</div>
          <h1 className="hero-title">
            {HERO.client1Lead}
            <strong>{HERO.client1Strong}</strong>
            {HERO.client2Lead}
            <strong>{HERO.client2Strong}</strong>
            {HERO.titleTail}
          </h1>
          <p className="hero-sub">
            {HERO.sub.lead}
            <strong>{HERO.sub.honoraires}</strong>
            {HERO.sub.tail}
          </p>
        </div>
        <div className="hero-actions">
          <Link
            href="/espace-ingenieur/conformite"
            className="btn btn-ghost btn-sm"
            style={{ textDecoration: "none" }}
          >
            ← Retour conformité
          </Link>
          {/* « Relancer les clients » : sans backend dans la maquette. */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled
            title="Relance client · en cours d'intégration"
          >
            Relancer les clients
          </button>
        </div>
      </div>

      {/* Stepper parcours patrimonial */}
      <div className="s1b-parcours-stepper">
        {PARCOURS_STEPS.map((step) => (
          <div className={`s1b-step ${step.state}`} key={step.num}>
            <div className="s1b-step-num">{step.num}</div>
            <div className="s1b-step-label">
              {step.label.split("\n").map((line, i, arr) => (
                <span key={line}>
                  {line}
                  {i < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="fco-step-badge">{PARCOURS_BADGE}</div>
      </div>

      {/* Bandeau paiement honoraires · lecture seule */}
      <div className="s1c-bank-banner-ing fco-bank-banner-gold">
        <div className="s1c-bank-banner-ing-icon fco-bank-icon-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <div className="s1c-bank-banner-ing-title">
            Règlement des honoraires · <strong>{PAY_BANNER.honoraires}</strong> ·{" "}
            <span className="fco-pay-inline">{PAY_BANNER.statusInline}</span>
          </div>
          <div className="s1c-bank-banner-ing-meta">{PAY_BANNER.meta}</div>
        </div>
        <span className="s1c-pay-pill attente" style={{ margin: 0 }}>
          {PAY_BANNER.pill}
        </span>
      </div>

      {/* 3 cartes documents (DER · KYC · LM) + modale DER interactive */}
      <DerModalControls />

      {/* Espace d'envoi groupé du pack de contractualisation */}
      <EnvoiPack />

      {/* Documents pédagogiques témoins anonymisés */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <div className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Documents pédagogiques joints (lecture seule pour le client)
          </div>
        </div>
        <div className="card-body" style={{ padding: "16px 22px" }}>
          <div className="fco-temoin-intro">
            Ces 2 documents sont joints au pack envoyé au client · ils permettent
            à Camille de{" "}
            <strong>mesurer concrètement les livrables qu&apos;elle recevra</strong>{" "}
            à l&apos;issue de l&apos;étude patrimoniale. Le contenu est anonymisé
            (les noms, montants et données personnelles sont remplacés).
          </div>
          <div className="fco-temoin-grid">
            {TEMOIN_DOCS.map((doc) => (
              <div
                className="s1c-temoin-card"
                key={doc.title}
                title="Aperçu pour le client · dossier témoin anonymisé"
              >
                <div className="s1c-temoin-thumb">
                  {doc.variant === "synthese" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="s1c-temoin-title">{doc.title}</div>
                  <div className="s1c-temoin-desc">{doc.desc}</div>
                  <span className="s1c-temoin-tag">Anonymisée</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conditions de passage à l'étape 03 */}
      <div className="s1b-conditions-card">
        <div className="s1b-conditions-title">
          Conditions de passage à l&apos;étape 03 · Collecte de documents
        </div>
        <div className="s1b-conditions-sub">{CONDITIONS_SUB}</div>

        {CONDITIONS.map((cond) => (
          <div className="s1b-condition-row" key={cond.text}>
            <div className={`s1b-condition-check ${cond.check}`}>
              {cond.check === "wait" ? "⏳" : "○"}
            </div>
            <div>
              <div className="s1b-condition-text">{cond.text}</div>
              <div className="s1b-condition-meta">{cond.meta}</div>
            </div>
            {cond.badge.kind === "pay" ? (
              <span className="s1c-pay-pill attente">{cond.badge.label}</span>
            ) : (
              <span
                className={`fco-cond-badge${cond.badge.bg === "blue" ? " blue" : ""}`}
              >
                {cond.badge.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bandeau d'action · faire avancer en étape 03 */}
      <div className="s1b-action-bar">
        <div className="s1b-action-info">
          <strong>{ACTION_BAR.conditionsCount}</strong> pour ouvrir l&apos;espace
          sécurisé (étape 03 · Collecte de documents).
          <br />
          <span style={{ color: "var(--navy-300)" }}>
            {ACTION_BAR.note.lead}
            <strong>{ACTION_BAR.note.strong}</strong>
            {ACTION_BAR.note.tail}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            className="s1b-btn-secondary"
            disabled
            title="Relance client · en cours d'intégration"
          >
            Relancer le client
          </button>
          {/*
            L'ouverture de l'étape 03 dépend des 4 conditions (signatures + paiement),
            non remplies dans ce modèle. On porte un bouton honnêtement désactivé
            plutôt que la simulation factice de la maquette.
          */}
          <button
            type="button"
            className="s1b-btn-promote navy"
            disabled
            title="0/4 conditions remplies · signatures Yousign + règlement requis"
          >
            Ouvrir l&apos;espace sécurisé (étape 03)
          </button>
        </div>
      </div>
    </div>
  );
}
