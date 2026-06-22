"use client";

import { useEffect, useState } from "react";

import { createProspect } from "./actions";

/* Bouton « Nouveau prospect » + modale #modal-nouveau-prospect.
 * Porté de page-ing-pipe-01 de la maquette ingénieur v28
 * (openModalNouveauProspect / switchProspectType / toggleProspectDoc).
 * Interactions réelles : ouverture/fermeture modale, toggle type de prospect
 * (affiche/masque identité principal / conjoint / personne morale), cases à
 * cocher des documents qui révèlent les blocs e-mail, et « Créer le prospect »
 * branché sur une Server Action (createProspect). */

type ProspectType = "solo" | "couple" | "morale";
type DocId = "dci-simple" | "dci-complet" | "questionnaire";

const DOC_LABEL: Record<DocId, string> = {
  "dci-simple": "DCI Simplifié",
  "dci-complet": "DCI Complet",
  questionnaire: "Questionnaire de qualification",
};

export default function NouveauProspectModal({
  onCreated,
}: {
  onCreated?: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ProspectType>("solo");
  const [submitting, setSubmitting] = useState(false);
  const [civilite, setCivilite] = useState("Monsieur");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [raisonSociale, setRaisonSociale] = useState("");
  const [docs, setDocs] = useState<Record<DocId, boolean>>({
    "dci-simple": false,
    "dci-complet": false,
    questionnaire: false,
  });

  const resetForm = () => {
    setType("solo");
    setCivilite("Monsieur");
    setPrenom("");
    setNom("");
    setEmail("");
    setTelephone("");
    setRaisonSociale("");
    setDocs({ "dci-simple": false, "dci-complet": false, questionnaire: false });
  };

  const canSubmit =
    type === "morale" ? raisonSociale.trim().length > 0 : nom.trim().length > 0;

  const handleCreate = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const selectedDocs = (Object.keys(docs) as DocId[])
        .filter((id) => docs[id])
        .map((id) => DOC_LABEL[id]);
      const res = await createProspect({
        type,
        civilite,
        prenom,
        nom,
        email,
        telephone,
        raisonSociale,
        docs: selectedDocs,
      });
      onCreated?.(res.message);
      resetForm();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggleDoc = (id: DocId) =>
    setDocs((prev) => ({ ...prev, [id]: !prev[id] }));

  const labelIdentite =
    type === "couple" ? "Identité du premier conjoint" : "Identité du prospect";

  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-nouveau-prospect"
        onClick={() => setOpen(true)}
      >
        Nouveau prospect
      </button>

      <div
        className={`s1a-modal-overlay${open ? " open" : ""}`}
        id="modal-nouveau-prospect"
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div
          className="s1a-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-prospect-title"
        >
          <div className="s1a-modal-header">
            <button
              className="s1a-modal-close"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M18 6 L 6 18 M 6 6 L 18 18" />
              </svg>
            </button>
            <div className="s1a-modal-eyebrow">
              Parcours patrimonial · Étape 01 · Création directe
            </div>
            <h2 className="s1a-modal-title" id="modal-prospect-title">
              Nouveau <strong>prospect</strong>
            </h2>
            <p className="s1a-modal-sub">
              Création d&#39;un dossier sans rendez-vous calé. Le prospect sera ajouté à la
              colonne « Prospects actifs ». Documents de pré-qualification optionnels.
            </p>
          </div>

          <div className="s1a-modal-body">
            {/* SECTION 1 · TYPE DE PROSPECT */}
            <div className="s1a-section">
              <div className="s1a-section-label">Type de prospect</div>
              <div className="s1a-toggle-group">
                <button
                  type="button"
                  className={`s1a-toggle-btn${type === "solo" ? " active" : ""}`}
                  onClick={() => setType("solo")}
                >
                  Personne seule
                </button>
                <button
                  type="button"
                  className={`s1a-toggle-btn${type === "couple" ? " active" : ""}`}
                  onClick={() => setType("couple")}
                >
                  Couple
                </button>
                <button
                  type="button"
                  className={`s1a-toggle-btn${type === "morale" ? " active" : ""}`}
                  onClick={() => setType("morale")}
                >
                  Personne morale
                </button>
              </div>
            </div>

            {/* SECTION 2 · IDENTITÉ PROSPECT PRINCIPAL */}
            <div
              className="s1a-section"
              id="section-identite-principal"
              style={{ display: type === "morale" ? "none" : undefined }}
            >
              <div className="s1a-section-label">
                <span id="label-identite">{labelIdentite}</span>
              </div>

              <div className="s1a-grid-3">
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Civilité<span className="required">*</span>
                  </label>
                  <select
                    className="s1a-select"
                    value={civilite}
                    onChange={(e) => setCivilite(e.target.value)}
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
                    placeholder="ex. Bertrand"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Nom<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="s1a-input"
                    placeholder="ex. DUPONT-TOPIN"
                    style={{ textTransform: "uppercase" }}
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
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
                    placeholder="bertrand.dupont-topin@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Téléphone<span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className="s1a-input"
                    placeholder="+33 6 12 34 56 78"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2b · IDENTITÉ CONJOINT (couple uniquement) */}
            <div
              className="s1a-section"
              id="section-identite-conjoint"
              style={{ display: type === "couple" ? undefined : "none" }}
            >
              <div className="s1a-section-label">Identité du conjoint</div>

              <div className="s1a-grid-3">
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Civilité<span className="required">*</span>
                  </label>
                  <select className="s1a-select">
                    <option>Madame</option>
                    <option>Monsieur</option>
                  </select>
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Prénom<span className="required">*</span>
                  </label>
                  <input type="text" className="s1a-input" placeholder="ex. Monique" />
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Nom<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="s1a-input"
                    placeholder="ex. DUPONT-TOPIN"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>

              <div className="s1a-grid-2">
                <div className="s1a-field">
                  <label className="s1a-field-label">E-mail du conjoint</label>
                  <input
                    type="email"
                    className="s1a-input"
                    placeholder="monique.dupont-topin@email.com"
                  />
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">Téléphone du conjoint</label>
                  <input type="tel" className="s1a-input" placeholder="+33 6 23 45 67 89" />
                </div>
              </div>
            </div>

            {/* SECTION 2c · IDENTITÉ PERSONNE MORALE */}
            <div
              className="s1a-section"
              id="section-identite-morale"
              style={{ display: type === "morale" ? undefined : "none" }}
            >
              <div className="s1a-section-label">Identité de la personne morale</div>

              <div className="s1a-field">
                <label className="s1a-field-label">
                  Raison sociale<span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="s1a-input"
                  placeholder="ex. SAS GROUPE LEFEBVRE"
                  style={{ textTransform: "uppercase" }}
                  value={raisonSociale}
                  onChange={(e) => setRaisonSociale(e.target.value)}
                />
              </div>

              <div className="s1a-grid-2">
                <div className="s1a-field">
                  <label className="s1a-field-label">SIREN</label>
                  <input
                    type="text"
                    className="s1a-input"
                    placeholder="9 chiffres · 123 456 789"
                  />
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">Forme juridique</label>
                  <select className="s1a-select">
                    <option>SAS</option>
                    <option>SARL</option>
                    <option>SCI</option>
                    <option>SC</option>
                    <option>SA</option>
                    <option>SASU</option>
                    <option>EURL</option>
                    <option>SNC</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>

              <div className="s1a-section-label" style={{ marginTop: "14px" }}>
                Représentant légal · signataire
              </div>

              <div className="s1a-grid-3">
                <div className="s1a-field">
                  <label className="s1a-field-label">Civilité</label>
                  <select className="s1a-select">
                    <option>Monsieur</option>
                    <option>Madame</option>
                  </select>
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Prénom<span className="required">*</span>
                  </label>
                  <input type="text" className="s1a-input" placeholder="ex. Pierre" />
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Nom<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="s1a-input"
                    placeholder="ex. LEFEBVRE"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>

              <div className="s1a-grid-2">
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    E-mail du signataire<span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="s1a-input"
                    placeholder="pierre.lefebvre@groupe-lefebvre.fr"
                  />
                </div>
                <div className="s1a-field">
                  <label className="s1a-field-label">
                    Téléphone du signataire<span className="required">*</span>
                  </label>
                  <input type="tel" className="s1a-input" placeholder="+33 6 12 34 56 78" />
                </div>
              </div>
            </div>

            {/* SECTION 3 · DOCUMENTS À ENVOYER (optionnel) */}
            <div className="s1a-section">
              <div className="s1a-section-label">
                Documents de pré-qualification à envoyer · facultatif
              </div>

              <div
                className={`s1a-checkbox-row${docs["dci-simple"] ? " checked" : ""}`}
                onClick={() => toggleDoc("dci-simple")}
                id="doc-dci-simple"
              >
                <div className="s1a-checkbox-box" />
                <div className="s1a-checkbox-content">
                  <div className="s1a-checkbox-title">
                    DCI Simplifié
                    <span className="s1a-checkbox-tag">5 min</span>
                  </div>
                  <div className="s1a-checkbox-desc">
                    Document de Collecte d&#39;Informations · données patrimoniales
                    essentielles avant 1er entretien. Recommandé si le prospect n&#39;a pas
                    encore eu de RDV.
                  </div>
                </div>
              </div>

              <div
                className={`s1a-checkbox-row${docs["dci-complet"] ? " checked" : ""}`}
                onClick={() => toggleDoc("dci-complet")}
                id="doc-dci-complet"
              >
                <div className="s1a-checkbox-box" />
                <div className="s1a-checkbox-content">
                  <div className="s1a-checkbox-title">
                    DCI Complet
                    <span className="s1a-checkbox-tag">30 min</span>
                  </div>
                  <div className="s1a-checkbox-desc">
                    Collecte exhaustive : identité, situation familiale, patrimoine détaillé,
                    objectifs, fiscalité. Préalable à l&#39;étude patrimoniale complète.
                  </div>
                </div>
              </div>

              <div
                className={`s1a-checkbox-row${docs.questionnaire ? " checked" : ""}`}
                onClick={() => toggleDoc("questionnaire")}
                id="doc-questionnaire"
              >
                <div className="s1a-checkbox-box" />
                <div className="s1a-checkbox-content">
                  <div className="s1a-checkbox-title">
                    Questionnaire de qualification
                    <span className="s1a-checkbox-tag">10 min</span>
                  </div>
                  <div className="s1a-checkbox-desc">
                    Évaluation du profil investisseur · connaissance des marchés, tolérance au
                    risque, horizon, ESG. Conformité ANACOFI.
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4 · APERÇU E-MAIL GÉNÉRIQUE */}
            <div className="s1a-section">
              <div className="s1a-section-label">
                Aperçu de l&#39;e-mail envoyé au prospect
              </div>

              <div className="s1a-email-preview">
                <div className="em-meta">
                  <strong>De</strong>
                  <span>luc.thilliez@cabinet-paris-etoile.priveos.com</span>
                  <strong>À</strong>
                  <span>
                    <span style={{ color: "var(--navy-300)", fontStyle: "italic" }}>
                      [email du prospect saisi ci-dessus]
                    </span>
                  </span>
                  <strong>Objet</strong>
                  <span>Bienvenue chez ASTRAEOS · Cabinet Paris Étoile</span>
                </div>

                <p style={{ marginBottom: "10px" }}>Monsieur,</p>

                <p style={{ marginBottom: "10px" }}>
                  Je vous remercie de l&#39;intérêt que vous portez aux services de ASTRAEOS ·
                  Cabinet Paris Étoile. Pour préparer notre prochain échange dans les
                  meilleures conditions, je vous transmets ci-dessous les documents permettant
                  de mieux comprendre votre situation patrimoniale.
                </p>

                <div
                  className={`em-conditional${docs["dci-simple"] ? " visible" : ""}`}
                  id="em-dci-simple"
                >
                  <p style={{ marginBottom: "6px" }}>
                    <strong>→ Document de Collecte d&#39;Informations (DCI) Simplifié</strong> ·
                    5 minutes
                  </p>
                  <a className="em-link">Compléter le DCI Simplifié</a>
                  <p style={{ fontSize: "10px", color: "var(--navy-300)", margin: "6px 0 12px" }}>
                    Ces informations préliminaires nous permettront d&#39;orienter efficacement
                    notre premier entretien.
                  </p>
                </div>

                <div
                  className={`em-conditional${docs["dci-complet"] ? " visible" : ""}`}
                  id="em-dci-complet"
                >
                  <p style={{ marginBottom: "6px" }}>
                    <strong>→ Document de Collecte d&#39;Informations (DCI) Complet</strong> ·
                    30 minutes
                  </p>
                  <a className="em-link">Compléter le DCI Complet</a>
                  <p style={{ fontSize: "10px", color: "var(--navy-300)", margin: "6px 0 12px" }}>
                    Document exhaustif préalable à l&#39;étude patrimoniale.
                  </p>
                </div>

                <div
                  className={`em-conditional${docs.questionnaire ? " visible" : ""}`}
                  id="em-questionnaire"
                >
                  <p style={{ marginBottom: "6px" }}>
                    <strong>→ Questionnaire de qualification investisseur</strong> · 10 minutes
                  </p>
                  <a className="em-link">Compléter le questionnaire</a>
                  <p style={{ fontSize: "10px", color: "var(--navy-300)", margin: "6px 0 12px" }}>
                    Évaluation réglementaire ANACOFI de votre profil investisseur.
                  </p>
                </div>

                <p style={{ marginBottom: "10px" }}>
                  Mes coordonnées restent à votre disposition pour toute question. Je vous
                  proposerai prochainement un créneau d&#39;échange.
                </p>

                <p style={{ marginBottom: 0 }}>Cordialement,</p>

                <div className="em-sig">
                  <strong>Luc THILLIEZ</strong>
                  <br />
                  Président associé du cabinet ASTRAEOS
                  <br />
                  <span style={{ color: "var(--gold-deep)", fontWeight: 600 }}>ASTRAEOS</span> ·
                  Conseil patrimonial indépendant
                  <br />
                  10 avenue Kléber · 75116 Paris
                  <br />
                  <span style={{ color: "var(--navy-300)" }}>
                    +33 1 47 27 12 86 · ORIAS 23004036 · CIF · COA · IOBSP
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="s1a-modal-footer">
            <div className="s1a-modal-footer-info">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="0.8" fill="currentColor" />
              </svg>
              <span>
                Le dossier sera ajouté à{" "}
                <strong style={{ color: "var(--navy)" }}>Prospects actifs</strong> · Action
                tracée &amp; horodatée
              </span>
            </div>
            <div className="s1a-modal-footer-actions">
              <button
                type="button"
                className="s1a-btn s1a-btn-ghost"
                onClick={() => setOpen(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="s1a-btn s1a-btn-primary"
                onClick={handleCreate}
                disabled={!canSubmit || submitting}
              >
                {submitting ? "Création…" : "Créer le prospect"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
