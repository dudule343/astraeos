import Link from "next/link";

import {
  getTypesRdvScreen,
  type MessageSegment,
  type RdvType,
} from "../../../_data/types-rdv";
import "../../../_styles/types-rdv.css";

import { CopyPublicLink } from "./CopyPublicLink";

export const metadata = {
  title: "ASTRAEOS · Mes types de rendez-vous",
};

const DocIcon = ({ kind }: { kind: "doc" | "chart" }) =>
  kind === "chart" ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 11H3v8h6z M21 3h-6v16h6z M15 7h-6v12h6z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );

function Message({ segments }: { segments: MessageSegment[] }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.kind === "var" ? (
          <span className="rdv-type-variable" key={i}>
            {seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </>
  );
}

function RdvTypeCard({
  type,
  variables,
}: {
  type: RdvType;
  variables: string[];
}) {
  const isPrivate = type.visibility === "private";
  return (
    <div className={`rdv-type-card ${type.visibility}`}>
      <div className="rdv-type-header">
        <div
          className="rdv-type-duration-badge"
          style={
            isPrivate
              ? { background: "var(--light-blue)", color: "var(--navy)" }
              : undefined
          }
        >
          {type.durationLabel}
        </div>
        <div className="rdv-type-info">
          <div className="rdv-type-name">{type.name}</div>
          <div className="rdv-type-desc">{type.desc}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          <span className={`rdv-type-visibility-pill ${type.visibility}`}>
            ● {isPrivate ? "Privé" : "Public"}
          </span>
          <div className="rdv-type-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "10.5px" }}
              disabled
              title="Édition à venir"
            >
              Modifier
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "10.5px" }}
              disabled
              title="Action à venir"
            >
              Désactiver
            </button>
          </div>
        </div>
      </div>

      <div className="rdv-type-grid">
        <div>
          <div className="rdv-type-block">
            <div className="rdv-type-block-label">
              Documents auto-envoyés à la réservation
            </div>
            <div>
              {type.docs.map((doc) => (
                <span className="rdv-type-doc-chip" key={doc.label}>
                  <DocIcon kind={doc.icon} />
                  {doc.label}
                </span>
              ))}
              <span
                className="rdv-type-doc-chip"
                style={{ borderColor: "var(--navy-100)", color: "var(--navy-300)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter document
              </span>
            </div>
          </div>

          <div className="rdv-type-block" style={{ marginTop: "12px" }}>
            <div className="rdv-type-block-label">Disponibilités spécifiques</div>
            <div className="types-rdv-dispo">
              {renderDispoMain(type.dispoMain)}
              {type.dispoSub ? (
                <>
                  <br />
                  <span
                    className={`types-rdv-dispo-sub${
                      type.dispoSubItalic ? " italic" : ""
                    }`}
                  >
                    {type.dispoSub}
                  </span>
                </>
              ) : null}
            </div>
            {type.dayCells ? (
              <div className="types-rdv-days">
                {type.dayCells.map((cell, i) => (
                  <div
                    className={`types-rdv-day ${cell.active ? "on" : "off"}`}
                    key={i}
                  >
                    {cell.letter}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="rdv-type-block">
            <div className="rdv-type-block-label">Message d&apos;accompagnement client</div>
            <div className="rdv-type-message-preview">
              <Message segments={type.message} />
              <br />
              <br />
              <span style={{ fontStyle: "normal" }}>
                <strong>{type.signatureName}</strong> · {type.signatureRole}
              </span>
            </div>
            {type.showVariables ? (
              <div className="types-rdv-variables-line">
                Variables :{" "}
                {variables.map((variable) => (
                  <span className="rdv-type-variable" key={variable}>
                    {variable}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rdv-type-block" style={{ marginTop: "12px" }}>
            <div className="rdv-type-block-label">Réservation &amp; tampon</div>
            <div className="types-rdv-resa">
              <div>
                <div className="types-rdv-resa-label">Délai mini avant RDV</div>
                <strong>{type.delaiMini}</strong>
              </div>
              <div>
                <div className="types-rdv-resa-label">Tampon entre 2 RDV</div>
                <strong>{type.tampon}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** La maquette met "Lun – Ven" en gras puis le reste en texte. */
function renderDispoMain(text: string) {
  const sep = " · ";
  const idx = text.indexOf(sep);
  if (idx === -1) return <strong>{text}</strong>;
  return (
    <>
      <strong>{text.slice(0, idx)}</strong>
      {text.slice(idx)}
    </>
  );
}

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
          <button
            type="button"
            className="btn btn-gold btn-sm"
            disabled
            title="Création de type à venir"
          >
            + Nouveau type de RDV
          </button>
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

      {/* Bandeau lien public + disponibilités globales */}
      <div className="card mb-20 types-rdv-public-banner">
        <div className="card-body" style={{ padding: "22px 26px" }}>
          <div className="types-rdv-public-grid">
            <div>
              <div className="types-rdv-public-label">Lien public</div>
              <div className="types-rdv-public-url">
                {screen.publicLinkBase}
                <strong>{screen.publicLinkSlug}</strong>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <CopyPublicLink link={`${screen.publicLinkBase}${screen.publicLinkSlug}`} />
                <button
                  type="button"
                  className="btn btn-sm types-rdv-public-btn-ghost"
                  disabled
                  title="Aperçu public à venir"
                >
                  Aperçu public
                </button>
              </div>
            </div>
            <div>
              <div className="types-rdv-public-label">Disponibilités globales</div>
              <div style={{ fontSize: "12.5px", lineHeight: 1.5, color: "white" }}>
                <strong style={{ color: "var(--gold-300)" }}>
                  {screen.dispoGlobalStrong}
                </strong>
                {screen.dispoGlobalRest}
                <br />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>
                  {screen.dispoGlobalNote}
                </span>
              </div>
              <a
                style={{
                  fontSize: "10.5px",
                  color: "var(--gold-300)",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "6px",
                  display: "inline-block",
                }}
              >
                Modifier mes plages →
              </a>
            </div>
            <div>
              <div className="types-rdv-public-label">Synchronisation</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#69D49D"
                  strokeWidth={2.4}
                >
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="8 12 11 15 16 9" />
                </svg>
                <span style={{ fontSize: "12px", color: "white", fontWeight: 600 }}>
                  {screen.syncAccount}
                </span>
              </div>
              <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.65)" }}>
                {screen.syncMeta}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Les 4 types de RDV */}
      {screen.types.map((type) => (
        <RdvTypeCard type={type} variables={screen.variablesList} key={type.id} />
      ))}

      {/* Ajout nouveau type */}
      <div className="types-rdv-create">
        <div className="types-rdv-create-title">
          Créer un type de RDV personnalisé
        </div>
        <div className="types-rdv-create-sub">
          Ajoutez des types adaptés à votre pratique : revue annuelle, point
          trimestriel, signature de mandat, etc.
        </div>
        <button
          type="button"
          className="btn btn-gold btn-sm"
          style={{ fontSize: "12px" }}
          disabled
          title="Création de type à venir"
        >
          + Nouveau type de RDV
        </button>
      </div>
    </div>
  );
}
