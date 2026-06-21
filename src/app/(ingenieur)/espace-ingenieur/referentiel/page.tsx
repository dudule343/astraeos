import Link from "next/link";
import type { ReactNode } from "react";

import { getReferentielScreen } from "../../_data/referentiel";
import { ApercuButton, ModeleActions, RefListLink, TelechargerButton } from "./ModeleActions";
import { IaZone, MettreAJourButton, RefSwitch } from "./ReferentielInteractive";
import "../../_styles/referentiel.css";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Process & méthodologie",
};

export const dynamic = "force-dynamic";

/** Picto document (#i-doc de la maquette). */
const DocIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
);

/** Picto bibliothèque (#i-marketplace de la maquette). */
const LibraryIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

/** Picto communication (#i-comms de la maquette). */
const CommsIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 11v2c0 .8.7 1.5 1.5 1.5h2L12 19V5L6.5 9.5h-2C3.7 9.5 3 10.2 3 11z" />
    <path d="M16 8.5a4 4 0 0 1 0 7" />
  </svg>
);

/** Pastille « Accessible licenciés / OUI » des en-têtes de cartes (toggle branché). */
function LicenciePill({ label }: { label: string }) {
  return (
    <div className="ref-pill">
      <span className="ref-pill-label">Accessible licenciés</span>
      <RefSwitch
        size="sm"
        labelOn="OUI"
        labelOff="NON"
        ariaLabel={`Rendre « ${label} » accessible aux licenciés`}
      />
    </div>
  );
}

function RefCardHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="card-header">
      <div className="card-title">
        {icon}
        {title}
      </div>
      <LicenciePill label={title} />
    </div>
  );
}

export default function ReferentielPage() {
  const screen = getReferentielScreen();
  const { ia, manuel, contrat, modeles, communication } = screen;

  return (
    <div className="px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            Process &amp; <strong>méthodologie</strong>
          </h1>
          <p className="hero-sub">{screen.heroSub}</p>
        </div>
        <div className="hero-actions ref-hero-actions">
          {/* Toggle GLOBAL : mettre en ligne / hors ligne pour les licenciés */}
          <div className="ref-toggle-global">
            <span className="ref-toggle-global-label">Mettre le référentiel en ligne</span>
            <RefSwitch
              size="lg"
              labelOn="EN LIGNE"
              labelOff="HORS LIGNE"
              ariaLabel="Mettre le référentiel en ligne pour les licenciés"
            />
          </div>
          <MettreAJourButton />
        </div>
      </div>

      {/* Zone IA (champ actif + boutons branchés) */}
      <IaZone ia={ia} />

      {/* Manuel opératoire + Contrat-cadre */}
      <div className="ref-grid-2 ref-mb-24">
        {/* Manuel opératoire */}
        <div className="card">
          <RefCardHeader icon={DocIcon} title={manuel.title} />
          <div className="card-body">
            <div className="ref-card-desc">{manuel.description}</div>
            <div className="ref-list">
              {manuel.sections.map((s) => (
                <div key={s.label} className="ref-list-row">
                  <span>{s.label}</span>
                  <RefListLink type={s.asset} label={s.link} />
                </div>
              ))}
            </div>
            <div className="ref-card-actions">
              <ApercuButton type="manuel" />
              <TelechargerButton type="manuel" />
            </div>
          </div>
        </div>

        {/* Contrat-cadre licenciés */}
        <div className="card">
          <RefCardHeader icon={DocIcon} title={contrat.title} />
          <div className="card-body">
            <div className="ref-card-desc">
              {contrat.description}
              <strong>{contrat.descriptionStrong}</strong>
              {contrat.descriptionRest}
            </div>
            <div className="ref-list">
              {contrat.items.map((item) => (
                <div
                  key={item.strong ?? item.label}
                  className={`ref-list-row${item.highlight ? " ref-list-row--gold" : ""}`}
                >
                  <span>
                    {item.strong ? <strong>{item.strong}</strong> : null}
                    {item.rest ?? item.label}
                  </span>
                  <RefListLink type={item.asset} label={item.link} />
                </div>
              ))}
            </div>
            <div className="ref-card-actions">
              <ApercuButton type="contrat_cadre" />
              {/* Branché : la liste des contrats signés vit dans la conformité. */}
              <Link href="/espace-ingenieur/conformite" className="btn btn-gold btn-sm">
                Voir tous les contrats signés
              </Link>
            </div>
            <div className="ref-card-note">
              <em>{contrat.note}</em>
            </div>
          </div>
        </div>
      </div>

      {/* Bibliothèque de modèles documentaires */}
      <div className="card ref-mb-24">
        <RefCardHeader icon={LibraryIcon} title={modeles.title} />
        <div className="card-body">
          <div className="ref-modeles-grid">
            {modeles.liste.map((m) => (
              <div key={m.title} className="ref-modele">
                <div className="ref-modele-head">
                  <div className="ref-modele-icon">{DocIcon}</div>
                  <strong className="ref-modele-title">{m.title}</strong>
                </div>
                <div className="ref-modele-desc">{m.desc}</div>
                {/* Branché : aperçu + téléchargement du modèle PDF réel. */}
                <ModeleActions type={m.asset} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Éléments de communication */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {CommsIcon}
            {communication.title}
          </div>
        </div>
        <div className="card-body">
          <div className="ref-comm-grid">
            {communication.items.map((item) => (
              <div key={item.title + item.subtitle} className={`ref-comm ref-comm--${item.variant}`}>
                {item.variant === "navy-gradient" ? <div className="ref-comm-glow" /> : null}
                {item.logo ? (
                  <div className={`ref-comm-logo${item.logoGold ? " ref-comm-logo--gold" : ""}`}>
                    {item.title}
                  </div>
                ) : (
                  <div
                    className={`ref-comm-kicker${
                      item.variant === "ivory" ? " ref-comm-kicker--navy-text" : ""
                    }`}
                  >
                    {item.title}
                  </div>
                )}
                {item.logo ? (
                  <div
                    className={`ref-comm-sub ${
                      item.variant === "navy" ? "ref-comm-sub--gold" : "ref-comm-sub--navy"
                    }`}
                  >
                    {item.subtitle}
                  </div>
                ) : (
                  <div className="ref-comm-line">{item.subtitle}</div>
                )}
                <TelechargerButton type={item.asset} className="btn btn-gold btn-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
