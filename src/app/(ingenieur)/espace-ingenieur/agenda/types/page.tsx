import Link from "next/link";

import { getTypesRdvScreen } from "../../../_data/types-rdv";
import "../../../_styles/types-rdv.css";

import { NewTypeButton, TypesRdvInteractive } from "./TypesRdvInteractive";

export const metadata = {
  title: "ASTRAEOS · Mes types de rendez-vous",
};

export default function TypesRdvPage() {
  const screen = getTypesRdvScreen();

  return (
    <div className="types-rdv-page-wrap">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            Mes types de <strong>rendez-vous</strong>
          </h1>
          <p className="hero-sub">{screen.heroSub}</p>
        </div>
        <div className="hero-actions">
          <Link className="btn btn-ghost btn-sm" href="/espace-ingenieur/agenda">
            ← Retour à l&apos;agenda
          </Link>
          <NewTypeButton />
        </div>
      </div>

      {/* KPIs de configuration */}
      <div className="kpis kpis-4 mb-20">
        {screen.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div
              className="kpi-value"
              style={kpi.valueSmall ? { fontSize: "14px" } : undefined}
            >
              {kpi.value}
              {kpi.unit ? <span className="unit"> {kpi.unit}</span> : null}
            </div>
            <div className="kpi-meta">{kpi.meta}</div>
          </div>
        ))}
      </div>

      {/* Note · Signature généricisée selon le rôle ingénieur */}
      <div className="types-rdv-note">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gold-deep)"
          strokeWidth={1.8}
          className="types-rdv-note-icon"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="13" />
          <circle cx="12" cy="16.5" r="0.8" fill="var(--gold-deep)" />
        </svg>
        <div className="types-rdv-note-text">
          <strong>Signature dynamique selon votre rôle.</strong> Les messages
          d&apos;accompagnement ci-dessous utilisent la variable{" "}
          <span className="rdv-type-variable">{"{signature}"}</span> qui est
          remplacée automatiquement selon votre statut :{" "}
          <em>« Président associé du cabinet PRIVEOS »</em> pour les associés (Luc
          THILLIEZ, etc.),{" "}
          <em>« Ingénieur patrimonial · Cabinet Paris Étoile »</em> pour les
          ingénieurs collaborateurs (Julien VASSEUR, Sophie MERCIER, Thomas
          LEROY, Camille BERTRAND).
        </div>
      </div>

      {/* Bandeau lien public, cartes de types, modales — tout l'interactif. */}
      <TypesRdvInteractive screen={screen} />
    </div>
  );
}
