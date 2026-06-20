"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Modale « Nouveau rendez-vous » (Création RDV directe) — port fidèle de
 * #modal-nouveau-rdv de la maquette 030 v28 (lignes 18598→18818).
 *
 * Ouverte par un événement window `open-new-rdv` que dispatchent le bouton
 * « + Nouveau RDV » du hero et les cellules vides de la grille (créneau + jour
 * pré-remplis). Tout l'interactif est ici, avec un vrai état :
 *  - sélection du type de RDV qui ajuste la durée,
 *  - toggle client existant / nouveau prospect,
 *  - participants supplémentaires (ajout/suppression),
 *  - documents auto cochables avec aperçu,
 *  - message à variables.
 */

export const OPEN_NEW_RDV_EVENT = "open-new-rdv";

/** Détail de l'événement d'ouverture : créneau et jour cliqués. */
export type OpenNewRdvDetail = {
  heureDebut?: string;
  jour?: string;
};

type RdvType = "initial" | "intermediaire" | "restitution" | "suivi";

const DUREE_PAR_TYPE: Record<RdvType, string> = {
  initial: "1h00",
  intermediaire: "1h00",
  restitution: "2h00",
  suivi: "1h00",
};

const TYPE_CARDS: {
  type: RdvType;
  title: string;
  tag: string;
  desc: string;
}[] = [
  { type: "initial", title: "Entretien initial", tag: "1h", desc: "Découverte besoins · 1er contact" },
  { type: "intermediaire", title: "Entretien intermédiaire", tag: "1h", desc: "Précision pendant l'étude" },
  { type: "restitution", title: "Restitution de l'étude", tag: "2h", desc: "Présentation préconisations" },
  { type: "suivi", title: "Entretien de suivi", tag: "1h", desc: "Suivi récurrent · client en portefeuille" },
];

const DEFAULT_MESSAGE = `Bonjour,

Je vous confirme notre rendez-vous du mardi 12 mai à 14h00, en cabinet (10 avenue Kléber, Paris 16e). Notre échange durera environ 1 heure.

Pour préparer ce premier entretien dans les meilleures conditions, je vous invite à compléter le DCI Simplifié et le questionnaire de qualification client joints à cet e-mail (10 minutes au total). Ces éléments me permettront d'orienter notre conversation sur l'essentiel.

Au plaisir de notre échange.

Luc THILLIEZ
Président associé du cabinet PRIVEOS`;

type Participant = { id: number; nom: string; email: string };

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export function NewRdvModal() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("Mardi 12 mai 2026");
  const [heureDebut, setHeureDebut] = useState("14h00");
  const [duree, setDuree] = useState("1h00");
  const [type, setType] = useState<RdvType>("initial");
  const [clientMode, setClientMode] = useState<"existant" | "nouveau">("existant");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [nextParticipantId, setNextParticipantId] = useState(1);
  const [docDci, setDocDci] = useState(true);
  const [docQualif, setDocQualif] = useState(true);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<OpenNewRdvDetail>).detail ?? {};
      if (detail.heureDebut) setHeureDebut(detail.heureDebut);
      if (detail.jour) setDate(detail.jour);
      setOpen(true);
      document.body.style.overflow = "hidden";
    }
    window.addEventListener(OPEN_NEW_RDV_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_NEW_RDV_EVENT, onOpen);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Réinitialise le scroll body si le composant est démonté en état ouvert.
  useEffect(() => () => {
    document.body.style.overflow = "";
  }, []);

  function selectType(t: RdvType) {
    setType(t);
    setDuree(DUREE_PAR_TYPE[t]);
  }

  function addParticipant() {
    setParticipants((prev) => [...prev, { id: nextParticipantId, nom: "", email: "" }]);
    setNextParticipantId((id) => id + 1);
  }

  function removeParticipant(id: number) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  if (!open) return null;

  return (
    <div
      className="s1a-modal-overlay open"
      id="modal-nouveau-rdv"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="s1a-modal" role="dialog" aria-modal="true" aria-labelledby="modal-rdv-title">
        <div className="s1a-modal-header">
          <button className="s1a-modal-close" onClick={close} aria-label="Fermer" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 L 6 18 M 6 6 L 18 18" />
            </svg>
          </button>
          <div className="s1a-modal-eyebrow">Agenda · Création RDV directe</div>
          <h2 className="s1a-modal-title" id="modal-rdv-title">
            Nouveau <strong>rendez-vous</strong>
          </h2>
          <p className="s1a-modal-sub">
            Le type de RDV sélectionné déclenche automatiquement l&apos;envoi des documents associés au client.
            Personnalisable au cas par cas.
          </p>
        </div>

        <div className="s1a-modal-body">
          {/* BLOC 1 · CRÉNEAU */}
          <div className="s1a-section">
            <div className="s1a-section-label">Créneau</div>
            <div className="s1a-grid-3" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
              <div className="s1a-field">
                <label className="s1a-field-label">
                  Date<span className="required">*</span>
                </label>
                <input type="text" className="s1a-input" value={date} id="rdv-date" readOnly />
              </div>
              <div className="s1a-field">
                <label className="s1a-field-label">
                  Heure début<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="s1a-input"
                  value={heureDebut}
                  id="rdv-heure-debut"
                  onChange={(e) => setHeureDebut(e.target.value)}
                />
              </div>
              <div className="s1a-field">
                <label className="s1a-field-label">
                  Durée<span className="required">*</span>
                </label>
                <select
                  className="s1a-select"
                  id="rdv-duree"
                  value={duree}
                  onChange={(e) => setDuree(e.target.value)}
                >
                  <option>30 min</option>
                  <option>1h00</option>
                  <option>1h30</option>
                  <option>2h00</option>
                </select>
              </div>
            </div>
            <div className="s1a-grid-2">
              <div className="s1a-field">
                <label className="s1a-field-label">Lieu</label>
                <select className="s1a-select" defaultValue="Cabinet · Paris 8e">
                  <option>Cabinet · Paris 8e</option>
                  <option>Visioconférence Google Meet</option>
                  <option>Téléphone</option>
                  <option>Au domicile du client</option>
                  <option>Autre adresse à préciser</option>
                </select>
              </div>
              <div className="s1a-field">
                <label className="s1a-field-label">Rappel automatique</label>
                <select className="s1a-select" defaultValue="24h avant · e-mail + SMS">
                  <option>24h avant · e-mail + SMS</option>
                  <option>48h avant · e-mail uniquement</option>
                  <option>1h avant · SMS uniquement</option>
                  <option>Aucun rappel</option>
                </select>
              </div>
            </div>
          </div>

          {/* BLOC 2 · TYPE DE RDV */}
          <div className="s1a-section">
            <div className="s1a-section-label">Type de rendez-vous</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {TYPE_CARDS.map((card) => (
                <div
                  key={card.type}
                  className={`s1a-checkbox-row${type === card.type ? " checked" : ""}`}
                  onClick={() => selectType(card.type)}
                >
                  <div className="s1a-checkbox-box" />
                  <div className="s1a-checkbox-content">
                    <div className="s1a-checkbox-title">
                      {card.title} <span className="s1a-checkbox-tag">{card.tag}</span>
                    </div>
                    <div className="s1a-checkbox-desc">{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BLOC 3 · CLIENT */}
          <div className="s1a-section">
            <div className="s1a-section-label">Client ou prospect</div>
            <div className="s1a-toggle-group" style={{ marginBottom: "12px" }}>
              <button
                type="button"
                className={`s1a-toggle-btn${clientMode === "existant" ? " active" : ""}`}
                onClick={() => setClientMode("existant")}
              >
                Client existant du portefeuille
              </button>
              <button
                type="button"
                className={`s1a-toggle-btn${clientMode === "nouveau" ? " active" : ""}`}
                onClick={() => setClientMode("nouveau")}
              >
                Nouveau prospect
              </button>
            </div>

            {clientMode === "existant" ? (
              <div id="rdv-client-existant">
                <div className="s1a-field">
                  <label className="s1a-field-label">Rechercher dans mon portefeuille</label>
                  <input
                    type="text"
                    className="s1a-input"
                    placeholder="ex. DUPONT-TOPIN · Bertrand & Monique · ETU-2026-014"
                    defaultValue="Bertrand & Monique DUPONT-TOPIN · Couple · ETU-2026-014"
                  />
                  <div className="rdv-field-hint">
                    Saisissez nom, prénom ou n° dossier · 7 clients dans votre portefeuille
                  </div>
                </div>
              </div>
            ) : (
              <div id="rdv-client-nouveau">
                <div className="s1a-grid-3">
                  <div className="s1a-field">
                    <label className="s1a-field-label">Civilité</label>
                    <select className="s1a-select" defaultValue="Monsieur">
                      <option>Monsieur</option>
                      <option>Madame</option>
                    </select>
                  </div>
                  <div className="s1a-field">
                    <label className="s1a-field-label">
                      Prénom<span className="required">*</span>
                    </label>
                    <input type="text" className="s1a-input" placeholder="Prénom" />
                  </div>
                  <div className="s1a-field">
                    <label className="s1a-field-label">
                      Nom<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="s1a-input"
                      placeholder="NOM"
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>
                </div>
                <div className="s1a-grid-2">
                  <div className="s1a-field">
                    <label className="s1a-field-label">
                      E-mail<span className="required">*</span>
                    </label>
                    <input type="email" className="s1a-input" placeholder="email@exemple.com" />
                  </div>
                  <div className="s1a-field">
                    <label className="s1a-field-label">
                      Téléphone<span className="required">*</span>
                    </label>
                    <input type="tel" className="s1a-input" placeholder="+33 6 …" />
                  </div>
                </div>
                <div className="rdv-create-banner">
                  <strong>Création simultanée</strong> · Le prospect sera automatiquement ajouté à la colonne{" "}
                  <strong>Prospects actifs</strong> en plus du RDV calé.
                </div>
              </div>
            )}
          </div>

          {/* BLOC 3bis · PARTICIPANTS SUPPLÉMENTAIRES */}
          <div className="s1a-section">
            <div className="s1a-section-label">Participants supplémentaires</div>
            <div className="rdv-info-banner">
              Ajoutez d&apos;autres personnes à convier (avocat, notaire, expert-comptable, co-titulaire…). Chaque
              participant recevra l&apos;invitation et le lien de visioconférence par e-mail.
            </div>
            <div id="rdv-participants-list">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="s1a-grid-2"
                  style={{ marginBottom: "10px", alignItems: "end", gridTemplateColumns: "1fr 1fr auto" }}
                >
                  <div className="s1a-field" style={{ marginBottom: 0 }}>
                    <label className="s1a-field-label">Nom du participant</label>
                    <input
                      type="text"
                      className="s1a-input"
                      placeholder="ex. Maître Sophie LEROY (avocat)"
                      value={p.nom}
                      onChange={(e) =>
                        setParticipants((prev) =>
                          prev.map((x) => (x.id === p.id ? { ...x, nom: e.target.value } : x)),
                        )
                      }
                    />
                  </div>
                  <div className="s1a-field" style={{ marginBottom: 0 }}>
                    <label className="s1a-field-label">Adresse e-mail</label>
                    <input
                      type="email"
                      className="s1a-input"
                      placeholder="email@exemple.com"
                      value={p.email}
                      onChange={(e) =>
                        setParticipants((prev) =>
                          prev.map((x) => (x.id === p.id ? { ...x, email: e.target.value } : x)),
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="rdv-participant-remove"
                    title="Retirer ce participant"
                    onClick={() => removeParticipant(p.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="rdv-add-participant" onClick={addParticipant}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter un participant
            </button>
          </div>

          {/* BLOC 4 · DOCUMENTS ASSOCIÉS */}
          <div className="s1a-section">
            <div className="s1a-section-label">
              Documents envoyés à la confirmation du RDV · workflow auto
            </div>
            <div className="rdv-info-banner">
              Les documents listés ci-dessous sont configurés sur le type{" "}
              <strong style={{ color: "var(--navy)" }}>Entretien initial</strong>. Vous pouvez ajuster ponctuellement
              pour ce RDV uniquement.
            </div>

            <div
              className={`s1a-checkbox-row${docDci ? " checked" : ""}`}
              onClick={() => setDocDci((v) => !v)}
            >
              <div className="s1a-checkbox-box" />
              <div className="s1a-checkbox-content">
                <div className="s1a-checkbox-title">
                  DCI Simplifié <span className="s1a-checkbox-tag">par défaut</span>
                </div>
                <div className="s1a-checkbox-desc">
                  Document de collecte préalable à l&apos;entretien initial · 5 min
                </div>
              </div>
              <button
                className="rdv-doc-preview-btn"
                title="Aperçu"
                type="button"
                onClick={(e) => e.stopPropagation()}
              >
                <EyeIcon />
              </button>
            </div>

            <div
              className={`s1a-checkbox-row${docQualif ? " checked" : ""}`}
              onClick={() => setDocQualif((v) => !v)}
            >
              <div className="s1a-checkbox-box" />
              <div className="s1a-checkbox-content">
                <div className="s1a-checkbox-title">
                  Questionnaire de qualification client <span className="s1a-checkbox-tag">par défaut</span>
                </div>
                <div className="s1a-checkbox-desc">
                  Évaluation profil investisseur · 10 min · conformité ANACOFI
                </div>
              </div>
              <button
                className="rdv-doc-preview-btn"
                title="Aperçu"
                type="button"
                onClick={(e) => e.stopPropagation()}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          {/* BLOC 5 · MESSAGE D'ACCOMPAGNEMENT */}
          <div className="s1a-section">
            <div className="s1a-section-label">Message d&apos;accompagnement · modèle Entretien initial</div>
            <textarea
              className="s1a-textarea"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="rdv-variables-line">
              Variables disponibles : <span className="rdv-type-variable">{"{prenom}"}</span>{" "}
              <span className="rdv-type-variable">{"{nom}"}</span>{" "}
              <span className="rdv-type-variable">{"{date}"}</span>{" "}
              <span className="rdv-type-variable">{"{heure}"}</span>{" "}
              <span className="rdv-type-variable">{"{lieu}"}</span>{" "}
              <span className="rdv-type-variable">{"{ingenieur}"}</span>
            </div>
          </div>
        </div>

        <div className="s1a-modal-footer">
          <div className="s1a-modal-footer-info">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>RDV ajouté à votre agenda &amp; e-mail envoyé · action tracée &amp; horodatée</span>
          </div>
          <div className="s1a-modal-footer-actions">
            <button className="s1a-btn s1a-btn-ghost" onClick={close} type="button">
              Annuler
            </button>
            <button className="s1a-btn s1a-btn-primary" type="button" onClick={close}>
              Créer le RDV + envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Bouton « + Nouveau RDV » du hero : ouvre la modale (vrai handler). */
export function OpenRdvButton() {
  return (
    <button
      type="button"
      className="btn btn-gold btn-sm"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_NEW_RDV_EVENT))}
    >
      + Nouveau RDV
    </button>
  );
}

/** Cellule vide de la grille : clic = ouvre la modale avec créneau + jour pré-remplis. */
export function EmptyCell({
  className,
  slotKey,
  dayLabel,
  style,
}: {
  className: string;
  slotKey: string;
  dayLabel: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={style}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent<OpenNewRdvDetail>(OPEN_NEW_RDV_EVENT, {
            detail: { heureDebut: slotKey, jour: dayLabel },
          }),
        )
      }
    />
  );
}
