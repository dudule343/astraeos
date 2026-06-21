"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { createRdv, type RdvFormat, type CreateRdvResult } from "./actions";

type RdvSuccess = Extract<CreateRdvResult, { ok: true }>;

// E-mails du portefeuille de démonstration (les fiches clients de _data sont en
// @email-test.fr). Dans un vrai outil, l'adresse viendrait de la fiche client en
// base ; ici on résout les clients de démo connus, sinon adresse vide (l'écran
// de confirmation l'indique honnêtement). Pour un envoi réel, utiliser « Nouveau
// prospect » avec une vraie adresse.
const PORTEFEUILLE_EMAILS: { match: RegExp; email: string }[] = [
  { match: /dupont-topin/i, email: "bertrand.dupont@email-test.fr" },
  { match: /aubert/i, email: "jean.aubert@email-test.fr" },
];

function emailForClientExistant(label: string): string {
  const found = PORTEFEUILLE_EMAILS.find((e) => e.match.test(label));
  return found ? found.email : "";
}

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

/** Détail de l'événement d'ouverture : créneau et jour cliqués, et — pour
 *  « Modifier le RDV » depuis une fiche — le client déjà associé. */
export type OpenNewRdvDetail = {
  heureDebut?: string;
  jour?: string;
  /** pré-sélectionne un client existant du portefeuille (modification de RDV) */
  clientExistant?: string;
  /** bascule l'en-tête de la modale en mode « modification » */
  modeModification?: boolean;
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

/** Libellés de la liste « Lieu » → format DB du RDV. */
const LIEU_OPTIONS: { label: string; format: RdvFormat }[] = [
  { label: "Cabinet · Paris 8e", format: "presentiel" },
  { label: "Visioconférence Google Meet", format: "visio" },
  { label: "Téléphone", format: "telephone" },
  { label: "Au domicile du client", format: "presentiel" },
  { label: "Autre adresse à préciser", format: "presentiel" },
];

type SubmitStatus = "idle" | "submitting" | "done";

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export function NewRdvModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("Mardi 12 mai 2026");
  const [heureDebut, setHeureDebut] = useState("14h00");
  const [duree, setDuree] = useState("1h00");
  const [type, setType] = useState<RdvType>("initial");
  const [lieu, setLieu] = useState(LIEU_OPTIONS[0].label);
  const [clientMode, setClientMode] = useState<"existant" | "nouveau">("existant");
  const [clientExistant, setClientExistant] = useState(
    "Bertrand & Monique DUPONT-TOPIN · Couple · ETU-2026-014",
  );
  const [clientEmail, setClientEmail] = useState(
    emailForClientExistant("Bertrand & Monique DUPONT-TOPIN · Couple · ETU-2026-014"),
  );
  const [nouveauCivilite, setNouveauCivilite] = useState("Monsieur");
  const [nouveauPrenom, setNouveauPrenom] = useState("");
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauEmail, setNouveauEmail] = useState("");
  const [nouveauTel, setNouveauTel] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [nextParticipantId, setNextParticipantId] = useState(1);
  const [docDci, setDocDci] = useState(true);
  const [docQualif, setDocQualif] = useState(true);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RdvSuccess | null>(null);
  const [modeModification, setModeModification] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setSubmitStatus("idle");
    setError(null);
    setResult(null);
    setModeModification(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent<OpenNewRdvDetail>).detail ?? {};
      if (detail.heureDebut) setHeureDebut(detail.heureDebut);
      if (detail.jour) setDate(detail.jour);
      if (detail.clientExistant) {
        setClientMode("existant");
        setClientExistant(detail.clientExistant);
        setClientEmail(emailForClientExistant(detail.clientExistant));
      }
      setModeModification(Boolean(detail.modeModification));
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

  // Sélectionne un client existant et pré-remplit l'e-mail destinataire associé,
  // tout en laissant l'ingénieur le modifier librement (l'adresse de démo est éditable).
  function selectClientExistant(label: string) {
    setClientExistant(label);
    setClientEmail(emailForClientExistant(label));
  }

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

  function resolveClientNom(): string {
    if (clientMode === "existant") {
      // "Bertrand & Monique DUPONT-TOPIN · …" → on garde l'identité avant le « · ».
      return clientExistant.split("·")[0].trim();
    }
    return `${nouveauPrenom.trim()} ${nouveauNom.trim()}`.trim();
  }

  async function submit() {
    if (submitStatus === "submitting") return;
    setError(null);

    const clientNom = resolveClientNom();
    if (!clientNom) {
      setError(
        clientMode === "existant"
          ? "Sélectionnez un client dans votre portefeuille."
          : "Renseignez le prénom et le nom du prospect.",
      );
      return;
    }
    if (clientMode === "nouveau" && !nouveauEmail.trim()) {
      setError("L'e-mail du prospect est requis pour lui envoyer l'invitation.");
      return;
    }

    const format =
      LIEU_OPTIONS.find((o) => o.label === lieu)?.format ?? "presentiel";

    const clientEmailToSend =
      clientMode === "nouveau" ? nouveauEmail.trim() : clientEmail.trim();

    const documents = [
      docDci ? "DCI Simplifié" : null,
      docQualif ? "Questionnaire de qualification client" : null,
    ].filter((d): d is string => d !== null);

    const typeLabel = TYPE_CARDS.find((c) => c.type === type)?.title ?? "Rendez-vous";

    setSubmitStatus("submitting");
    const res = await createRdv({
      type,
      format,
      dateLabel: date,
      heureDebut,
      duree,
      clientNom,
      clientEmail: clientEmailToSend,
      typeLabel,
      lieuLabel: lieu,
      documents,
      message,
      attendees: participants.map((p) => ({ nom: p.nom, email: p.email })),
    });

    if (!res.ok) {
      setSubmitStatus("idle");
      setError(res.reason);
      return;
    }

    // On NE ferme PAS : on affiche l'écran de confirmation (les étapes d'après).
    // L'agenda est rafraîchi en fond pour refléter le nouveau RDV.
    setResult(res);
    setSubmitStatus("done");
    router.refresh();
  }

  if (!open) return null;

  // Écran de confirmation (les « étapes d'après ») affiché après une création
  // réussie, à la place du formulaire : statut d'envoi de l'e-mail, documents,
  // salle visio. Remplace l'ancien simple toast (« il ne se passait rien »).
  if (result) {
    const documentsEnvoyes = [
      docDci ? "DCI Simplifié" : null,
      docQualif ? "Questionnaire de qualification client" : null,
    ].filter((d): d is string => d !== null);

    return (
      <div
        className="s1a-modal-overlay open"
        id="modal-rdv-confirme"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="s1a-modal" role="dialog" aria-modal="true">
          <div className="s1a-modal-header">
            <button className="s1a-modal-close" onClick={close} aria-label="Fermer" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M18 6 L 6 18 M 6 6 L 18 18" />
              </svg>
            </button>
            <div className="s1a-modal-eyebrow">Agenda · Rendez-vous confirmé</div>
            <h2 className="s1a-modal-title">
              Rendez-vous <strong>créé</strong>
            </h2>
            <p className="s1a-modal-sub">{result.message}</p>
          </div>

          <div className="s1a-modal-body">
            <div className="s1a-section">
              <div className="s1a-section-label">Confirmation au client</div>
              {result.emailSent ? (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: "#E7F3EA",
                    color: "#1E6B3A",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <span aria-hidden="true">✓</span>
                  <span>
                    E-mail de confirmation envoyé à <strong>{result.emailTo}</strong>.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: "#FBF1E0",
                    color: "#8A5A12",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  <span>
                    ⚠ E-mail non envoyé{result.emailTo ? ` à ${result.emailTo}` : ""} : {result.emailError}
                  </span>
                  {!result.emailTo && (
                    <span style={{ fontSize: 12.5, opacity: 0.85 }}>
                      Le portefeuille de démonstration est en @email-test.fr. Pour un envoi réel,
                      utilisez « Nouveau prospect » avec une adresse valide.
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="s1a-section">
              <div className="s1a-section-label">Synchronisation agenda</div>
              {(result as { googleSynced?: boolean }).googleSynced ? (
                <div style={{ fontSize: 14, color: "#1E6B3A", lineHeight: 1.5 }}>
                  ✓ Ajouté à votre Google Agenda
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#8B96A8", lineHeight: 1.5 }}>
                  Non ajouté à Google Agenda (agenda non connecté)
                </div>
              )}
            </div>

            <div className="s1a-section">
              <div className="s1a-section-label">
                Documents {result.emailSent ? "joints à l'e-mail" : "à transmettre"}
              </div>
              {documentsEnvoyes.length ? (
                documentsEnvoyes.map((d) => (
                  <div key={d} style={{ fontSize: 14, color: "#33425A", lineHeight: 1.8 }}>
                    • {d}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 14, color: "#8B96A8" }}>Aucun document sélectionné.</div>
              )}
            </div>

            {result.room && (
              <div className="s1a-section">
                <div className="s1a-section-label">Salle de visioconférence</div>
                <div style={{ fontSize: 14, color: "#33425A", lineHeight: 1.5 }}>
                  La salle <code>{result.room}</code> est prête. Le lien d&apos;accès a été inclus
                  dans l&apos;e-mail du client.
                </div>
              </div>
            )}
          </div>

          <div className="s1a-modal-footer">
            <div className="s1a-modal-footer-info">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Action tracée &amp; horodatée</span>
            </div>
            <div className="s1a-modal-footer-actions">
              <button className="s1a-btn s1a-btn-ghost" onClick={close} type="button">
                Fermer
              </button>
              {result.room && (
                <button
                  className="s1a-btn s1a-btn-primary"
                  type="button"
                  onClick={() => {
                    const room = result.room;
                    close();
                    if (room) router.push(`/visio/${room}?role=engineer`);
                  }}
                >
                  Rejoindre la salle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="s1a-modal-eyebrow">
            {modeModification ? "Agenda · Modification du RDV" : "Agenda · Création RDV directe"}
          </div>
          <h2 className="s1a-modal-title" id="modal-rdv-title">
            {modeModification ? (
              <>
                Modifier le <strong>rendez-vous</strong>
              </>
            ) : (
              <>
                Nouveau <strong>rendez-vous</strong>
              </>
            )}
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
                <select
                  className="s1a-select"
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                >
                  {LIEU_OPTIONS.map((o) => (
                    <option key={o.label}>{o.label}</option>
                  ))}
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
                    value={clientExistant}
                    onChange={(e) => selectClientExistant(e.target.value)}
                  />
                  <div className="rdv-field-hint">
                    Saisissez nom, prénom ou n° dossier · 7 clients dans votre portefeuille
                  </div>
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">E-mail du client</label>
                  <input
                    type="email"
                    className="s1a-input"
                    placeholder="email@exemple.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                  <div className="rdv-field-hint">
                    L&apos;e-mail de confirmation sera envoyé à cette adresse.
                  </div>
                  {clientEmail.includes("@email-test.fr") && (
                    <div className="rdv-field-hint" style={{ color: "#8A5A12" }}>
                      Adresse de démonstration, remplacez-la par l&apos;e-mail réel du client.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div id="rdv-client-nouveau">
                <div className="s1a-grid-3">
                  <div className="s1a-field">
                    <label className="s1a-field-label">Civilité</label>
                    <select
                      className="s1a-select"
                      value={nouveauCivilite}
                      onChange={(e) => setNouveauCivilite(e.target.value)}
                    >
                      <option>Monsieur</option>
                      <option>Madame</option>
                    </select>
                  </div>
                  <div className="s1a-field">
                    <label className="s1a-field-label">
                      Prénom<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="s1a-input"
                      placeholder="Prénom"
                      value={nouveauPrenom}
                      onChange={(e) => setNouveauPrenom(e.target.value)}
                    />
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
                      value={nouveauNom}
                      onChange={(e) => setNouveauNom(e.target.value)}
                    />
                  </div>
                </div>
                <div className="s1a-grid-2">
                  <div className="s1a-field">
                    <label className="s1a-field-label">
                      E-mail<span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className="s1a-input"
                      placeholder="email@exemple.com"
                      value={nouveauEmail}
                      onChange={(e) => setNouveauEmail(e.target.value)}
                    />
                  </div>
                  <div className="s1a-field">
                    <label className="s1a-field-label">
                      Téléphone<span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      className="s1a-input"
                      placeholder="+33 6 …"
                      value={nouveauTel}
                      onChange={(e) => setNouveauTel(e.target.value)}
                    />
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
            {error ? (
              <>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#C0392B" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="13" />
                  <line x1="12" y1="16.5" x2="12" y2="16.6" />
                </svg>
                <span style={{ color: "#C0392B" }}>{error}</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>RDV ajouté à votre agenda &amp; e-mail envoyé · action tracée &amp; horodatée</span>
              </>
            )}
          </div>
          <div className="s1a-modal-footer-actions">
            <button className="s1a-btn s1a-btn-ghost" onClick={close} type="button">
              Annuler
            </button>
            <button
              className="s1a-btn s1a-btn-primary"
              type="button"
              onClick={submit}
              disabled={submitStatus === "submitting"}
            >
              {submitStatus === "submitting"
                ? "Enregistrement…"
                : modeModification
                  ? "Enregistrer les modifications"
                  : "Créer le RDV + envoyer"}
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

