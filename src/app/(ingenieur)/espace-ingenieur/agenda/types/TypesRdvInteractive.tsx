"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  MessageSegment,
  RdvType,
  TypesRdvScreen,
} from "../../../_data/types-rdv";
// Styles des modales (s1a-*) + toast : mutualisés avec la modale agenda.
import "../_styles/agenda.css";

import { CopyPublicLink } from "./CopyPublicLink";
import {
  saveDispoPlages,
  saveRdvType,
  toggleRdvTypeActive,
  type RdvVisibility,
} from "./actions";

/**
 * Tout l'interactif de l'écran « Mes types de rendez-vous ». Porte les cartes
 * de types (Modifier / Désactiver branchés), le bandeau lien public (Copier,
 * Aperçu public, Modifier mes plages) et la carte de création, plus les modales
 * réelles (création/édition d'un type, aperçu public façon Calendly, édition des
 * plages globales). Aucune persistance figée : la saisie est réellement validée
 * via Server Actions co-localisées (toast honnête tant que la table n'existe pas).
 */

export const OPEN_NEW_TYPE_EVENT = "open-new-rdv-type";

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

/** Texte brut du message (pour pré-remplir le textarea d'édition). */
function messageToText(segments: MessageSegment[]): string {
  return segments.map((s) => s.value).join("");
}

type Toast = { id: number; text: string };

export function TypesRdvInteractive({ screen }: { screen: TypesRdvScreen }) {
  // État d'activation des types (Désactiver / Réactiver, optimiste).
  const [disabled, setDisabled] = useState<Record<string, boolean>>({});
  // Type en cours d'édition / création (null = aucune modale type ouverte).
  const [editing, setEditing] = useState<RdvType | "new" | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPlages, setShowPlages] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const pushToast = useCallback((text: string) => {
    const id = Date.now();
    setToast({ id, text });
    setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
    }, 4500);
  }, []);

  // Le bouton « + Nouveau type de RDV » du hero (server) ouvre via window event.
  useEffect(() => {
    function onOpen() {
      setEditing("new");
    }
    window.addEventListener(OPEN_NEW_TYPE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_NEW_TYPE_EVENT, onOpen);
  }, []);

  async function onToggleActive(type: RdvType) {
    const willDisable = !disabled[type.id];
    setDisabled((prev) => ({ ...prev, [type.id]: willDisable }));
    const res = await toggleRdvTypeActive({
      id: type.id,
      name: type.name,
      disable: willDisable,
    });
    if (!res.ok) {
      // On annule l'optimisme si l'action échoue.
      setDisabled((prev) => ({ ...prev, [type.id]: !willDisable }));
      pushToast(res.reason);
      return;
    }
    pushToast(res.message);
  }

  const publicLink = `${screen.publicLinkBase}${screen.publicLinkSlug}`;
  const publicTypes = screen.types.filter(
    (t) => t.visibility === "public" && !disabled[t.id],
  );

  return (
    <>
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
                <CopyPublicLink link={publicLink} />
                <button
                  type="button"
                  className="btn btn-sm types-rdv-public-btn-ghost"
                  onClick={() => setShowPreview(true)}
                >
                  Aperçu public
                </button>
              </div>
            </div>
            <div>
              <div className="types-rdv-public-label">
                Disponibilités globales
              </div>
              <div
                style={{ fontSize: "12.5px", lineHeight: 1.5, color: "white" }}
              >
                <strong style={{ color: "var(--gold-300)" }}>
                  {screen.dispoGlobalStrong}
                </strong>
                {screen.dispoGlobalRest}
                <br />
                <span
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "11px",
                  }}
                >
                  {screen.dispoGlobalNote}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPlages(true)}
                style={{
                  fontSize: "10.5px",
                  color: "var(--gold-300)",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "6px",
                  display: "inline-block",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                Modifier mes plages →
              </button>
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
                <span
                  style={{
                    fontSize: "12px",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {screen.syncAccount}
                </span>
              </div>
              <div
                style={{
                  fontSize: "10.5px",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                {screen.syncMeta}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Les types de RDV */}
      {screen.types.map((type) => (
        <RdvTypeCard
          key={type.id}
          type={type}
          variables={screen.variablesList}
          disabled={!!disabled[type.id]}
          onEdit={() => setEditing(type)}
          onToggleActive={() => onToggleActive(type)}
        />
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
          onClick={() => setEditing("new")}
        >
          + Nouveau type de RDV
        </button>
      </div>

      {editing ? (
        <RdvTypeModal
          variables={screen.variablesList}
          type={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            pushToast(msg);
          }}
        />
      ) : null}

      {showPreview ? (
        <PublicPreviewModal
          link={publicLink}
          dispoStrong={screen.dispoGlobalStrong}
          dispoRest={screen.dispoGlobalRest}
          types={publicTypes}
          onClose={() => setShowPreview(false)}
        />
      ) : null}

      {showPlages ? (
        <PlagesModal
          onClose={() => setShowPlages(false)}
          onSaved={(msg) => {
            setShowPlages(false);
            pushToast(msg);
          }}
        />
      ) : null}

      {toast ? (
        <div className="rdv-toast" role="status">
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast.text}
        </div>
      ) : null}
    </>
  );
}

function RdvTypeCard({
  type,
  variables,
  disabled,
  onEdit,
  onToggleActive,
}: {
  type: RdvType;
  variables: string[];
  disabled: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}) {
  const isPrivate = type.visibility === "private";
  return (
    <div
      className={`rdv-type-card ${type.visibility}`}
      style={disabled ? { opacity: 0.55 } : undefined}
    >
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
            ● {disabled ? "Désactivé" : isPrivate ? "Privé" : "Public"}
          </span>
          <div className="rdv-type-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "10.5px" }}
              onClick={onEdit}
            >
              Modifier
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: "10.5px" }}
              onClick={onToggleActive}
            >
              {disabled ? "Réactiver" : "Désactiver"}
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
              <button
                type="button"
                className="rdv-type-doc-chip"
                style={{
                  borderColor: "var(--navy-100)",
                  color: "var(--navy-300)",
                  background: "none",
                  cursor: "pointer",
                }}
                onClick={onEdit}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter document
              </button>
            </div>
          </div>

          <div className="rdv-type-block" style={{ marginTop: "12px" }}>
            <div className="rdv-type-block-label">
              Disponibilités spécifiques
            </div>
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
            <div className="rdv-type-block-label">
              Message d&apos;accompagnement client
            </div>
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

function RdvTypeModal({
  type,
  variables,
  onClose,
  onSaved,
}: {
  type: RdvType | null;
  variables: string[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const isEdit = type !== null;
  const [name, setName] = useState(type?.name ?? "");
  const [durationLabel, setDurationLabel] = useState(type?.durationLabel ?? "1h");
  const [visibility, setVisibility] = useState<RdvVisibility>(
    type?.visibility ?? "public",
  );
  const [desc, setDesc] = useState(type?.desc ?? "");
  const [delaiMini, setDelaiMini] = useState(type?.delaiMini ?? "24 heures");
  const [tampon, setTampon] = useState(type?.tampon ?? "15 minutes");
  const [message, setMessage] = useState(
    type ? messageToText(type.message) : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    if (busy) return;
    setError(null);
    setBusy(true);
    const res = await saveRdvType({
      id: type?.id,
      name,
      durationLabel,
      visibility,
      desc,
      delaiMini,
      tampon,
      message,
    });
    if (!res.ok) {
      setBusy(false);
      setError(res.reason);
      return;
    }
    onSaved(res.message);
  }

  return (
    <div
      className="s1a-modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="s1a-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-type-rdv-title"
      >
        <div className="s1a-modal-header">
          <button
            className="s1a-modal-close"
            onClick={onClose}
            aria-label="Fermer"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M18 6 L 6 18 M 6 6 L 18 18" />
            </svg>
          </button>
          <div className="s1a-modal-eyebrow">
            Agenda · Configuration · Type de rendez-vous
          </div>
          <h2 className="s1a-modal-title" id="modal-type-rdv-title">
            {isEdit ? (
              <>
                Modifier le <strong>type</strong>
              </>
            ) : (
              <>
                Nouveau <strong>type de RDV</strong>
              </>
            )}
          </h2>
          <p className="s1a-modal-sub">
            Définit la durée, la visibilité, le message d&apos;accompagnement et
            les règles de réservation appliqués à ce type sur votre lien public.
          </p>
        </div>

        <div className="s1a-modal-body">
          <div className="s1a-section">
            <div className="s1a-section-label">Identité du type</div>
            <div className="s1a-grid-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
              <div className="s1a-field">
                <label className="s1a-field-label">
                  Nom du type<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="s1a-input"
                  placeholder="ex. Revue annuelle patrimoniale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="s1a-field">
                <label className="s1a-field-label">
                  Durée<span className="required">*</span>
                </label>
                <select
                  className="s1a-select"
                  value={durationLabel}
                  onChange={(e) => setDurationLabel(e.target.value)}
                >
                  <option>30 min</option>
                  <option>1h</option>
                  <option>1h30</option>
                  <option>2h</option>
                </select>
              </div>
            </div>
            <div className="s1a-field">
              <label className="s1a-field-label">Description courte</label>
              <input
                type="text"
                className="s1a-input"
                placeholder="ex. Suivi récurrent · client en portefeuille"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="s1a-section">
            <div className="s1a-section-label">Visibilité</div>
            <div className="s1a-toggle-group">
              <button
                type="button"
                className={`s1a-toggle-btn${
                  visibility === "public" ? " active" : ""
                }`}
                onClick={() => setVisibility("public")}
              >
                Public · sur le lien Calendly
              </button>
              <button
                type="button"
                className={`s1a-toggle-btn${
                  visibility === "private" ? " active" : ""
                }`}
                onClick={() => setVisibility("private")}
              >
                Privé · calage manuel
              </button>
            </div>
          </div>

          <div className="s1a-section">
            <div className="s1a-section-label">Réservation &amp; tampon</div>
            <div className="s1a-grid-2">
              <div className="s1a-field">
                <label className="s1a-field-label">Délai mini avant RDV</label>
                <select
                  className="s1a-select"
                  value={delaiMini}
                  onChange={(e) => setDelaiMini(e.target.value)}
                >
                  <option>24 heures</option>
                  <option>48 heures</option>
                  <option>72 heures</option>
                </select>
              </div>
              <div className="s1a-field">
                <label className="s1a-field-label">Tampon entre 2 RDV</label>
                <select
                  className="s1a-select"
                  value={tampon}
                  onChange={(e) => setTampon(e.target.value)}
                >
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="s1a-section">
            <div className="s1a-section-label">
              Message d&apos;accompagnement client
            </div>
            <textarea
              className="s1a-textarea"
              rows={6}
              placeholder="Bonjour {prenom}, je vous confirme notre rendez-vous du {date} à {heure}…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="rdv-variables-line">
              Variables disponibles :{" "}
              {variables.map((variable) => (
                <span className="rdv-type-variable" key={variable}>
                  {variable}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="s1a-modal-footer">
          <div className="s1a-modal-footer-info">
            {error ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="#C0392B"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="13" />
                  <line x1="12" y1="16.5" x2="12" y2="16.6" />
                </svg>
                <span style={{ color: "#C0392B" }}>{error}</span>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <circle cx="12" cy="16" r="0.8" fill="currentColor" />
                </svg>
                <span>
                  La variable{" "}
                  <span className="rdv-type-variable">{"{signature}"}</span> est
                  remplacée selon votre rôle · action tracée
                </span>
              </>
            )}
          </div>
          <div className="s1a-modal-footer-actions">
            <button
              className="s1a-btn s1a-btn-ghost"
              onClick={onClose}
              type="button"
            >
              Annuler
            </button>
            <button
              className="s1a-btn s1a-btn-primary"
              type="button"
              onClick={submit}
              disabled={busy}
            >
              {busy
                ? "Enregistrement…"
                : isEdit
                  ? "Enregistrer les modifications"
                  : "Créer le type de RDV"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicPreviewModal({
  link,
  dispoStrong,
  dispoRest,
  types,
  onClose,
}: {
  link: string;
  dispoStrong: string;
  dispoRest: string;
  types: RdvType[];
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="s1a-modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="s1a-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-preview-title"
      >
        <div className="s1a-modal-header">
          <button
            className="s1a-modal-close"
            onClick={onClose}
            aria-label="Fermer"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M18 6 L 6 18 M 6 6 L 18 18" />
            </svg>
          </button>
          <div className="s1a-modal-eyebrow">Aperçu public · page de réservation</div>
          <h2 className="s1a-modal-title" id="modal-preview-title">
            Ce que voient vos <strong>clients</strong>
          </h2>
          <p className="s1a-modal-sub">
            Page accessible sur{" "}
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {link}
            </span>{" "}
            · seuls les types publics et actifs y figurent.
          </p>
        </div>

        <div className="s1a-modal-body">
          <div
            style={{
              background:
                "linear-gradient(135deg, var(--navy) 0%, #1a3866 100%)",
              borderRadius: "8px",
              padding: "22px 24px",
              color: "white",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "9.5px",
                fontWeight: 700,
                color: "var(--gold-300)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              PRIVEOS · Conseil patrimonial
            </div>
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              Prenez rendez-vous
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.75)",
                marginTop: "4px",
              }}
            >
              Disponibilités : <strong>{dispoStrong}</strong>
              {dispoRest}
            </div>
          </div>

          {types.length === 0 ? (
            <div
              style={{
                fontSize: "12px",
                color: "var(--navy-300)",
                textAlign: "center",
                padding: "24px",
              }}
            >
              Aucun type public actif pour l&apos;instant.
            </div>
          ) : (
            types.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  border: "1px solid var(--navy-100)",
                  borderRadius: "6px",
                  marginBottom: "10px",
                }}
              >
                <div className="rdv-type-duration-badge">
                  {t.durationLabel}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "var(--navy)",
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{ fontSize: "11px", color: "var(--navy-300)" }}
                  >
                    {t.desc}
                  </div>
                </div>
                <span
                  className="btn btn-gold btn-sm"
                  style={{ fontSize: "11px", pointerEvents: "none" }}
                >
                  Réserver
                </span>
              </div>
            ))
          )}
        </div>

        <div className="s1a-modal-footer">
          <div className="s1a-modal-footer-info">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="0.8" fill="currentColor" />
            </svg>
            <span>Aperçu non interactif · reflète vos types publics actifs</span>
          </div>
          <div className="s1a-modal-footer-actions">
            <button
              className="s1a-btn s1a-btn-primary"
              onClick={onClose}
              type="button"
            >
              Fermer l&apos;aperçu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlagesModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [heureDebut, setHeureDebut] = useState("09h00");
  const [heureFin, setHeureFin] = useState("19h00");
  const [dejeunerDebut, setDejeunerDebut] = useState("12h00");
  const [dejeunerFin, setDejeunerFin] = useState("13h30");
  const [jours, setJours] = useState("Lun – Ven");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    if (busy) return;
    setError(null);
    setBusy(true);
    const res = await saveDispoPlages({
      jours,
      heureDebut,
      heureFin,
      dejeunerDebut,
      dejeunerFin,
    });
    if (!res.ok) {
      setBusy(false);
      setError(res.reason);
      return;
    }
    onSaved(res.message);
  }

  return (
    <div
      className="s1a-modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="s1a-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-plages-title"
      >
        <div className="s1a-modal-header">
          <button
            className="s1a-modal-close"
            onClick={onClose}
            aria-label="Fermer"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M18 6 L 6 18 M 6 6 L 18 18" />
            </svg>
          </button>
          <div className="s1a-modal-eyebrow">
            Agenda · Disponibilités globales
          </div>
          <h2 className="s1a-modal-title" id="modal-plages-title">
            Modifier mes <strong>plages</strong>
          </h2>
          <p className="s1a-modal-sub">
            Amplitude appliquée par défaut à tous vos types de RDV publics. Les
            types peuvent restreindre ces plages individuellement.
          </p>
        </div>

        <div className="s1a-modal-body">
          <div className="s1a-section">
            <div className="s1a-section-label">Jours ouvrés</div>
            <div className="s1a-field">
              <input
                type="text"
                className="s1a-input"
                value={jours}
                onChange={(e) => setJours(e.target.value)}
              />
            </div>
          </div>

          <div className="s1a-section">
            <div className="s1a-section-label">Amplitude horaire</div>
            <div className="s1a-grid-2">
              <div className="s1a-field">
                <label className="s1a-field-label">
                  Début<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="s1a-input"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                />
              </div>
              <div className="s1a-field">
                <label className="s1a-field-label">
                  Fin<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="s1a-input"
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="s1a-section">
            <div className="s1a-section-label">Pause déjeuner bloquée</div>
            <div className="s1a-grid-2">
              <div className="s1a-field">
                <label className="s1a-field-label">Début</label>
                <input
                  type="text"
                  className="s1a-input"
                  value={dejeunerDebut}
                  onChange={(e) => setDejeunerDebut(e.target.value)}
                />
              </div>
              <div className="s1a-field">
                <label className="s1a-field-label">Fin</label>
                <input
                  type="text"
                  className="s1a-input"
                  value={dejeunerFin}
                  onChange={(e) => setDejeunerFin(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="s1a-modal-footer">
          <div className="s1a-modal-footer-info">
            {error ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="#C0392B"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="13" />
                  <line x1="12" y1="16.5" x2="12" y2="16.6" />
                </svg>
                <span style={{ color: "#C0392B" }}>{error}</span>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <circle cx="12" cy="16" r="0.8" fill="currentColor" />
                </svg>
                <span>
                  Synchronisé avec Google Calendar · action tracée &amp;
                  horodatée
                </span>
              </>
            )}
          </div>
          <div className="s1a-modal-footer-actions">
            <button
              className="s1a-btn s1a-btn-ghost"
              onClick={onClose}
              type="button"
            >
              Annuler
            </button>
            <button
              className="s1a-btn s1a-btn-primary"
              type="button"
              onClick={submit}
              disabled={busy}
            >
              {busy ? "Enregistrement…" : "Enregistrer mes plages"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Bouton « + Nouveau type de RDV » du hero (server) : ouvre la modale création. */
export function NewTypeButton() {
  return (
    <button
      type="button"
      className="btn btn-gold btn-sm"
      onClick={() =>
        window.dispatchEvent(new CustomEvent(OPEN_NEW_TYPE_EVENT))
      }
    >
      + Nouveau type de RDV
    </button>
  );
}
