"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ProfilScreen } from "../../_data/profil";

/* Écran « Profil & agréments » — partie interactive.
 * Le rendu statique reste identique à la maquette v28 ; ici on branche les
 * commandes qui étaient mortes :
 *   - bascules « Préférences de notifications » : vrais toggles (état React) ;
 *   - « Modifier » la signature : ouvre une modale d'édition (état local) ;
 *   - hero « Annuler » / « Fermer » : Annuler revient à l'état chargé,
 *     Fermer mémorise les préférences (session) puis revient au cockpit.
 * Les données réglementaires (identité, agréments, formation) restent en
 * lecture seule : leur modification passe par le référent ASTRAEOS (bandeau bas),
 * conformément à la maquette — aucune table d'édition n'existe côté base. */

function IconTeam() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M14 16.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
    </svg>
  );
}

function IconComms() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11v2c0 .8.7 1.5 1.5 1.5h2L12 19V5L6.5 9.5h-2C3.7 9.5 3 10.2 3 11z" />
      <path d="M16 8.5a4 4 0 0 1 0 7" />
    </svg>
  );
}

function MultiLine({ value }: { value: string }) {
  const parts = value.split("\n");
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </>
  );
}

type SignatureState = ProfilScreen["signature"];

function SignatureModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: SignatureState;
  onClose: () => void;
  onSave: (next: SignatureState) => void;
}) {
  const [draft, setDraft] = useState<SignatureState>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const field = (key: keyof SignatureState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div
      className="pp-modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pp-modal" role="dialog" aria-modal="true">
        <div className="pp-modal-header">
          <button className="pp-modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 L 6 18 M 6 6 L 18 18" />
            </svg>
          </button>
          <div className="pp-modal-eyebrow">Signature email · Édition</div>
          <h2 className="pp-modal-title">
            Modifier <strong>ma signature</strong>
          </h2>
          <p className="pp-modal-sub">
            Personnalisez le bloc inséré au bas de vos emails. Les mentions réglementaires restent
            sous votre responsabilité.
          </p>
        </div>
        <div className="pp-modal-body">
          <div className="pp-form-grid">
            <label className="pp-field">
              <span className="pp-field-label">Nom affiché</span>
              <input className="pp-input" value={draft.nom} onChange={field("nom")} />
            </label>
            <label className="pp-field">
              <span className="pp-field-label">Initiales</span>
              <input className="pp-input" value={draft.initiales} onChange={field("initiales")} maxLength={3} />
            </label>
            <label className="pp-field pp-field-full">
              <span className="pp-field-label">Titre / fonction</span>
              <input className="pp-input" value={draft.titre} onChange={field("titre")} />
            </label>
            <label className="pp-field pp-field-full">
              <span className="pp-field-label">Contact</span>
              <input className="pp-input" value={draft.contact} onChange={field("contact")} />
            </label>
            <label className="pp-field pp-field-full">
              <span className="pp-field-label">Lien de prise de rendez-vous</span>
              <input className="pp-input" value={draft.lienRdv} onChange={field("lienRdv")} />
            </label>
          </div>
        </div>
        <div className="pp-modal-footer">
          <button type="button" className="pp-btn pp-btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="pp-btn pp-btn-primary" onClick={() => onSave(draft)}>
            Enregistrer la signature
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilInteractive({ screen }: { screen: ProfilScreen }) {
  const router = useRouter();
  const { identite, identitePersonnelle, agrements, formation, specialites } = screen;

  // Les préférences de notifications et la signature sont éditables côté client.
  // Faute de table dédiée en base, l'état vit le temps de la session (avec un
  // garde-fou « modifications non enregistrées » sur Annuler / Fermer).
  const initialNotifs = useMemo(() => screen.notifications.map((n) => n.active), [screen.notifications]);
  const [notifActive, setNotifActive] = useState<boolean[]>(initialNotifs);
  const [signature, setSignature] = useState<SignatureState>(screen.signature);
  const [editingSignature, setEditingSignature] = useState(false);

  const dirty =
    notifActive.some((v, i) => v !== initialNotifs[i]) ||
    JSON.stringify(signature) !== JSON.stringify(screen.signature);

  const toggleNotif = (index: number) =>
    setNotifActive((prev) => prev.map((v, i) => (i === index ? !v : v)));

  const handleAnnuler = () => {
    setNotifActive(initialNotifs);
    setSignature(screen.signature);
  };

  const handleFermer = () => router.push("/espace-ingenieur");

  return (
    <div className="ing-profil-content">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            Profil &amp; <strong>agréments</strong>
          </h1>
          <p className="hero-sub">{screen.heroSub}</p>
        </div>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleAnnuler}
            disabled={!dirty}
            title={dirty ? "Revenir aux valeurs chargées" : "Aucune modification à annuler"}
          >
            Annuler
          </button>
          <button type="button" className="btn btn-gold btn-sm" onClick={handleFermer}>
            Fermer
          </button>
        </div>
      </div>

      {/* Bandeau identité */}
      <div
        className="card mb-18"
        style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1a3a66 100%)", color: "white", border: "none" }}
      >
        <div className="card-body" style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", gap: "22px", alignItems: "center" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--gold)",
                color: "white",
                display: "grid",
                placeItems: "center",
                fontSize: "28px",
                fontWeight: 700,
                border: "3px solid var(--gold-deep)",
                flexShrink: 0,
              }}
            >
              {identite.initiales}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--gold-300)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Connecté en tant que
              </div>
              <div style={{ fontSize: "26px", fontWeight: 700 }}>{identite.nomComplet}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.78)", marginTop: "2px" }}>{identite.role}</div>
              <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.6)", marginTop: "6px" }}>
                {identite.membreDepuis}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="badge badge-success" style={{ fontSize: "10px" }}>
                {identite.statutBadge}
              </span>
              <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
                {identite.derniereConnexion}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 colonnes : Identité personnelle + Agréments réglementaires */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
        {/* Identité personnelle */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconTeam />
              Identité personnelle
            </div>
          </div>
          <div className="card-body" style={{ padding: "22px", fontSize: "12.5px", lineHeight: 1.9 }}>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "6px 14px" }}>
              {identitePersonnelle.map((ligne) => (
                <React.Fragment key={ligne.label}>
                  <span style={{ color: "var(--navy-300)" }}>{ligne.label}</span>
                  <strong>
                    <MultiLine value={ligne.value} />
                  </strong>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Agréments réglementaires */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconShield />
              Agréments réglementaires
            </div>
            {agrements.every((ag) => ag.statut === "Valide") ? (
              <span className="badge badge-success" style={{ fontSize: "10px" }}>
                Tous valides
              </span>
            ) : (
              <span className="badge" style={{ fontSize: "10px" }}>
                À compléter
              </span>
            )}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {agrements.map((ag, i) => (
              <div
                key={ag.titre}
                style={{
                  padding: "14px 22px",
                  borderBottom: i < agrements.length - 1 ? "1px solid var(--ivory-deep)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>{ag.titre}</div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "2px" }}>{ag.detail}</div>
                </div>
                <span
                  className={`badge${ag.statut === "Valide" ? " badge-success" : ""}`}
                  style={{ fontSize: "10px" }}
                >
                  {ag.statut}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formation & compétences + Préférences notifications */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
        {/* Formation & compétences */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconDoc />
              Formation &amp; compétences
            </div>
          </div>
          <div className="card-body" style={{ padding: "22px", fontSize: "12.5px", lineHeight: 1.7 }}>
            {formation.map((dip) => (
              <div key={dip.titre} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>{dip.titre}</div>
                <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>{dip.detail}</div>
              </div>
            ))}
            <div style={{ paddingTop: "14px", borderTop: "1px solid var(--ivory-deep)" }}>
              <div
                style={{
                  fontSize: "10.5px",
                  color: "var(--navy-300)",
                  marginBottom: "6px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Spécialités
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {specialites.map((spe) => (
                  <span
                    key={spe}
                    style={{
                      fontSize: "10.5px",
                      padding: "5px 10px",
                      background: "var(--ivory)",
                      color: "var(--navy)",
                      border: "1px solid var(--ivory-deep)",
                      borderRadius: "14px",
                    }}
                  >
                    {spe}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Préférences de notifications */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconComms />
              Préférences de notifications
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {screen.notifications.map((notif, i) => {
              const active = notifActive[i];
              return (
                <button
                  type="button"
                  key={notif.titre}
                  className="ing-notif-row"
                  role="switch"
                  aria-checked={active}
                  aria-label={`${notif.titre} · ${active ? "activé" : "désactivé"}`}
                  onClick={() => toggleNotif(i)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    font: "inherit",
                    padding: "14px 22px",
                    borderBottom: i < screen.notifications.length - 1 ? "1px solid var(--ivory-deep)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--navy)" }}>{notif.titre}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>{notif.detail}</div>
                  </div>
                  <span
                    className={`ing-toggle${active ? " on" : ""}`}
                    aria-hidden="true"
                  >
                    <span className="ing-toggle-knob" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Signature email · pleine largeur */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <IconDoc />
            Ma signature email
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingSignature(true)}>
            Modifier
          </button>
        </div>
        <div className="card-body" style={{ padding: "22px" }}>
          <div
            style={{
              padding: "18px",
              background: "var(--ivory)",
              border: "1px solid var(--ivory-deep)",
              borderRadius: "6px",
              fontSize: "12px",
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "var(--navy)",
                  color: "var(--gold)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                {signature.initiales}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--navy)" }}>{signature.nom}</div>
                <div style={{ fontSize: "11px", color: "var(--navy-300)" }}>{signature.titre}</div>
                <div style={{ fontSize: "11px", color: "var(--navy-300)", marginTop: "4px" }}>{signature.contact}</div>
                <div style={{ fontSize: "10.5px", color: "var(--gold-deep)", marginTop: "4px" }}>{signature.lienRdv}</div>
              </div>
            </div>
            <div
              style={{
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1px solid var(--ivory-deep)",
                fontSize: "10px",
                color: "var(--navy-300)",
                lineHeight: 1.5,
              }}
            >
              <MultiLine value={signature.pied} />
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau d'information */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--ivory) 0%, var(--gold-100) 100%)",
          border: "1px solid var(--gold-200)",
        }}
      >
        <div className="card-body" style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "24px" }}>ℹ</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>Modifications réglementaires</div>
              <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "4px", lineHeight: 1.6 }}>
                Les modifications de votre identité, de vos agréments réglementaires (CIF, IAS, ORIAS) et de vos
                coordonnées professionnelles doivent être effectuées auprès de votre référent ASTRAEOS pour mise à jour
                réglementaire et synchronisation avec votre profil de marque.
              </div>
            </div>
          </div>
        </div>
      </div>

      <SignatureModal
        open={editingSignature}
        initial={signature}
        onClose={() => setEditingSignature(false)}
        onSave={(next) => {
          setSignature(next);
          setEditingSignature(false);
        }}
      />
    </div>
  );
}
