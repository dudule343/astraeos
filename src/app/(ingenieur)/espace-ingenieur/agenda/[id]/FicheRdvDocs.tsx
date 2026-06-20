"use client";

import { useCallback, useRef, useState } from "react";

import type { FicheRdv, RdvDoc } from "../../../_data/fiche-rdv";

/* ─────────────────────────────────────────────────────────────────────────
 * Fiche RDV · cartes documents préparatoires + modales DCI Simplifié et
 * Questionnaire de qualification, portées des `#modal-dci-simplifie` et
 * `#modal-questionnaire-qualif` de la maquette 030 v28.
 *
 * La maquette ouvre les modales via `openModalDCI('mercier')` /
 * `openModalQualif()` (clic sur la carte entière + bouton « Consulter »). On
 * porte le comportement à l'identique : la carte est cliquable (hover gold +
 * box-shadow), « Consulter » stoppe la propagation puis ouvre la modale,
 * « Télécharger » exporte un récapitulatif texte réel du document.
 * ───────────────────────────────────────────────────────────────────────── */

type Mode = "readonly" | "edit";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F8049" strokeWidth="2.4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Génère et télécharge un récapitulatif texte du document (action réelle,
 *  pas de bouton mort : à défaut d'un PDF source, on exporte les données
 *  affichées dans la fiche, journalisées côté client). */
function downloadDoc(fiche: FicheRdv, doc: RdvDoc) {
  const lines: string[] = [];
  lines.push(`${doc.title}`);
  lines.push(`Prospect : ${fiche.nom}`);
  lines.push(`Complété ${doc.date}`);
  lines.push("");
  if (doc.kind === "dci") {
    lines.push("Synthèse client");
    fiche.synthese.forEach((r) => lines.push(`- ${r.label} : ${r.value}`));
    lines.push("");
    lines.push("Objectifs (DCI Simplifié)");
    fiche.objectifs.forEach((o) => lines.push(`${o.rank}. ${o.title} — ${o.meta}`));
  } else {
    lines.push("Questionnaire de qualification — profil investisseur");
    fiche.synthese.forEach((r) => lines.push(`- ${r.label} : ${r.value}`));
  }
  lines.push("");
  lines.push(fiche.noteV21 ? `Note v21 · ${fiche.noteV21}` : "");

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fiche.slug}-${doc.kind}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function FicheRdvDocs({ fiche }: { fiche: FicheRdv }) {
  const [openModal, setOpenModal] = useState<null | "dci" | "qualif">(null);

  const dci = fiche.docs.find((d) => d.kind === "dci");
  const qualif = fiche.docs.find((d) => d.kind === "qualif");

  return (
    <>
      <div className="frdv-docs-grid">
        {fiche.docs.map((doc) => (
          <DocCard
            key={doc.id}
            fiche={fiche}
            doc={doc}
            onConsulter={() => setOpenModal(doc.kind)}
          />
        ))}
      </div>

      {dci ? (
        <DciSimplifieModal
          fiche={fiche}
          open={openModal === "dci"}
          onClose={() => setOpenModal(null)}
        />
      ) : null}
      {qualif ? (
        <QualifModal
          open={openModal === "qualif"}
          onClose={() => setOpenModal(null)}
        />
      ) : null}
    </>
  );
}

function DocCard({
  fiche,
  doc,
  onConsulter,
}: {
  fiche: FicheRdv;
  doc: RdvDoc;
  onConsulter: () => void;
}) {
  return (
    <div
      className="frdv-doc clickable"
      role="button"
      tabIndex={0}
      onClick={onConsulter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onConsulter();
        }
      }}
    >
      <div className="frdv-doc-head">
        <div className="frdv-doc-icon">
          <CheckIcon />
        </div>
        <div className="frdv-doc-info">
          <div className="frdv-doc-title">{doc.title}</div>
          <div className="frdv-doc-date">{doc.date}</div>
        </div>
      </div>
      <div className="frdv-doc-actions">
        <button
          type="button"
          className="frdv-doc-btn"
          onClick={(e) => {
            e.stopPropagation();
            onConsulter();
          }}
        >
          Consulter
        </button>
        <button
          type="button"
          className="frdv-doc-btn"
          onClick={(e) => {
            e.stopPropagation();
            downloadDoc(fiche, doc);
          }}
        >
          Télécharger
        </button>
        <span className="frdv-doc-sent">Envoyé au client</span>
      </div>
    </div>
  );
}

/* ── Coquille de modale commune (header + barre de mode + bannières) ────── */
function ModalShell({
  open,
  onClose,
  mode,
  setMode,
  maxWidth,
  eyebrow,
  title,
  sub,
  modeMeta,
  readonlyBanner,
  editBanner,
  footerInfo,
  children,
}: {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  maxWidth: number;
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  modeMeta: string;
  readonlyBanner: React.ReactNode;
  editBanner: React.ReactNode;
  footerInfo: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`s1a-modal-overlay s1b-mode-${mode}${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="s1a-modal" role="dialog" aria-modal="true" style={{ maxWidth }}>
        <div className="s1a-modal-header">
          <button className="s1a-modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 L 6 18 M 6 6 L 18 18" />
            </svg>
          </button>
          <div className="s1a-modal-eyebrow">{eyebrow}</div>
          <h2 className="s1a-modal-title">{title}</h2>
          <p className="s1a-modal-sub">{sub}</p>
        </div>

        <div className="s1c-mode-bar">
          <span className="s1c-mode-bar-label">Mode</span>
          <button className={mode === "readonly" ? "active" : ""} onClick={() => setMode("readonly")}>
            Consulter
          </button>
          <button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>
            Modifier
          </button>
          <span className="s1c-mode-bar-spacer" />
          <span className="s1c-mode-bar-meta">{modeMeta}</span>
        </div>

        <div className="s1a-modal-body">
          <div className="s1b-readonly-banner">{readonlyBanner}</div>
          <div className="s1b-edit-banner">{editBanner}</div>
          {children}
        </div>

        <div className="s1a-modal-footer">
          <div className="s1a-modal-footer-info">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>{footerInfo}</span>
          </div>
          <div className="s1a-modal-footer-actions">
            <button className="s1a-btn s1a-btn-ghost" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Ligne de champ DCI (label + valeur en lecture / champ en édition) ──── */
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="s1b-field-row">
      <label className="s1b-field-label">{label}</label>
      <input type="text" className="s1a-input" defaultValue={value} />
    </div>
  );
}

const DCI_SECTIONS = [
  { num: "00", label: "Page de garde" },
  { num: "01", label: "Votre foyer" },
  { num: "02", label: "Vos coordonnées" },
  { num: "03", label: "Votre situation" },
  { num: "04", label: "Votre patrimoine" },
  { num: "05", label: "Votre budget" },
  { num: "06", label: "Vos objectifs" },
  { num: "07", label: "Récapitulatif" },
] as const;

const recapBtnStyle: React.CSSProperties = {
  fontSize: "10px",
  padding: "3px 8px",
  background: "white",
  border: "1px solid var(--gold)",
  color: "var(--gold-deep)",
  borderRadius: "3px",
  cursor: "pointer",
  fontFamily: "'Epilogue', sans-serif",
  fontWeight: 600,
};

const recapCardStyle: React.CSSProperties = {
  padding: "14px 16px",
  background: "white",
  border: "1px solid var(--navy-100)",
  borderRadius: "8px",
};

/* ── Modale DCI Simplifié · Nicolas MERCIER (8 sections, source 042) ────── */
function DciSimplifieModal({
  fiche,
  open,
  onClose,
}: {
  fiche: FicheRdv;
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("readonly");
  const [activeStep, setActiveStep] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((step: number) => {
    setActiveStep(step);
    const el = contentRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <ModalShell
      open={open}
      onClose={() => {
        setMode("readonly");
        onClose();
      }}
      mode={mode}
      setMode={setMode}
      maxWidth={1240}
      eyebrow="DCI Simplifié · consultation & édition"
      title={
        <>
          Document de Collecte d&apos;Informations · <strong>{fiche.nom}</strong>
        </>
      }
      sub="Réponses complétées par le client · vues en lecture par défaut · passez en édition pour les ajuster pendant l'entretien."
      modeMeta="DCI Simplifié · format officiel · 7 sections"
      readonlyBanner={
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>
            <strong>Mode consultation</strong> · les réponses sont en lecture seule. Cliquez sur{" "}
            <em>Modifier</em> en haut pour les ajuster pendant l&apos;entretien.
          </span>
        </>
      }
      editBanner={
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
          </svg>
          <span>
            <strong>Mode édition activé</strong> · vous pouvez modifier toutes les réponses · pensez à
            enregistrer en bas.
          </span>
        </>
      }
      footerInfo={`Modifications enregistrées automatiquement · journalisées dans le dossier de ${fiche.nom}`}
    >
      <div className="s1c-dci-simplifie-layout">
        <nav className="s1c-dci-simplifie-nav">
          <div className="s1c-dci-simplifie-nav-title">8 sections · source 042</div>
          {DCI_SECTIONS.map((s, i) => (
            <button
              key={s.num}
              type="button"
              className={`s1c-dci-simplifie-chip${activeStep === i ? " active" : ""}`}
              onClick={() => scrollToSection(i)}
            >
              <span className="s1c-dci-simplifie-chip-num">{s.num}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="s1c-dci-simplifie-content" ref={contentRef}>
          <div className="s1b-editable">
            {/* 00 · Page de garde */}
            <div className="s1b-dci-section" data-step="0">
              <div className="s1b-dci-section-head">
                <span className="s1b-dci-section-num">00</span>
                <h3 className="s1b-dci-section-title">Page de garde</h3>
              </div>
              <div className="s1b-dci-section-body">
                <div
                  style={{
                    padding: "22px 26px",
                    background: "linear-gradient(135deg, rgba(198,142,14,0.10) 0%, white 75%)",
                    border: "1px solid var(--gold-300)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: "var(--gold-deep)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                    }}
                  >
                    PRIVEOS · DCI Simplifié
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--navy)", marginBottom: "6px" }}>
                    Bonjour Nicolas,
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--navy)", lineHeight: 1.6, marginBottom: "14px" }}>
                    En prévision de notre entretien initial du <strong>mardi 9 juin 2026 à 16h00</strong>, nous vous
                    invitons à compléter ce document de collecte d&apos;informations qui nous permettra de préparer au
                    mieux notre échange.
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--navy-300)", lineHeight: 1.6, marginBottom: "10px" }}>
                    Cela vous prendra environ <strong style={{ color: "var(--navy)" }}>10 à 15 minutes</strong>. Vos
                    réponses sont sauvegardées automatiquement, vous pouvez compléter le document en plusieurs fois.
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "white",
                      borderLeft: "3px solid var(--gold)",
                      borderRadius: "4px",
                      fontSize: "10.5px",
                      color: "var(--navy-300)",
                      lineHeight: 1.55,
                    }}
                  >
                    <strong style={{ color: "var(--navy)" }}>À noter</strong> · vos données sont protégées (RGPD). En
                    cas de question pendant le remplissage, votre ingénieur patrimonial Luc THILLIEZ reste à votre
                    disposition. La qualité du conseil dépend de l&apos;exactitude des informations transmises.
                  </div>
                </div>
              </div>
            </div>

            {/* 01 · Votre foyer */}
            <div className="s1b-dci-section" data-step="1">
              <div className="s1b-dci-section-head">
                <span className="s1b-dci-section-num">01</span>
                <h3 className="s1b-dci-section-title">Votre foyer</h3>
              </div>
              <div className="s1b-dci-section-body">
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Votre situation</div>
                  <div style={{ fontSize: "11px", color: "var(--navy-300)", marginBottom: "14px" }}>
                    Êtes-vous seul ou en couple ?
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div
                      style={{
                        padding: "14px 16px",
                        border: "2px solid var(--gold)",
                        background: "linear-gradient(135deg, rgba(198,142,14,0.18) 0%, white 80%)",
                        borderRadius: "6px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-7px",
                          right: "8px",
                          background: "var(--gold)",
                          color: "white",
                          fontSize: "8px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "8px",
                          letterSpacing: "0.08em",
                        }}
                      >
                        CHOISI
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginBottom: "4px" }}>
                        Seul
                      </div>
                      <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>Célibataire · divorcé(e) · veuf(ve)</div>
                    </div>
                    <div
                      style={{
                        padding: "14px 16px",
                        border: "1px solid var(--navy-100)",
                        background: "white",
                        borderRadius: "6px",
                        position: "relative",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)", marginBottom: "4px" }}>
                        En couple
                      </div>
                      <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>Marié(e) · pacsé(e) · concubin(e)</div>
                    </div>
                  </div>
                </div>

                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Vous</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow label="Civilité" value="Monsieur" />
                    <FieldRow label="Prénom" value="Nicolas" />
                    <FieldRow label="Nom" value="MERCIER" />
                    <FieldRow label="Date de naissance" value="14/09/1987" />
                    <FieldRow label="Nationalité" value="Française" />
                  </div>
                </div>

                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Vos enfants</div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginBottom: "12px" }}>
                    Avez-vous des enfants ? Vous pouvez en ajouter autant que nécessaire.
                  </div>
                  <div style={{ background: "white", border: "1px solid var(--navy-100)", borderRadius: "8px", padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.2fr 1.2fr 1.4fr 1fr 40px",
                          gap: "10px",
                          padding: "0 14px",
                          fontSize: "9.5px",
                          color: "var(--navy-300)",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          flex: 1,
                        }}
                      >
                        <div>Prénom</div>
                        <div>Date de naissance</div>
                        <div>Enfant de</div>
                        <div>À charge fiscale</div>
                        <div />
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "14px 16px",
                        background: "var(--ivory)",
                        border: "1px dashed var(--navy-200)",
                        borderRadius: "6px",
                        textAlign: "center",
                        fontSize: "11px",
                        color: "var(--navy-300)",
                        marginBottom: "8px",
                      }}
                    >
                      Aucun enfant déclaré · cliquez sur « Ajouter un enfant » pour en ajouter
                    </div>
                  </div>
                </div>
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">
                    Autres personnes à charge{" "}
                    <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--navy-300)", letterSpacing: "0.02em" }}>
                      (facultatif)
                    </span>
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginBottom: "12px" }}>
                    Parent âgé, frère, sœur ou autre personne dont vous avez la charge financière ou affective.
                  </div>
                  <FieldRow label="Avez-vous d'autres personnes à charge ?" value="Non" />
                </div>
              </div>
            </div>

            {/* 02 · Vos coordonnées */}
            <div className="s1b-dci-section" data-step="2">
              <div className="s1b-dci-section-head">
                <span className="s1b-dci-section-num">02</span>
                <h3 className="s1b-dci-section-title">Vos coordonnées</h3>
              </div>
              <div className="s1b-dci-section-body">
                <FieldRow label="Adresse" value="23 rue de la Tourelle" />
                <FieldRow label="Code postal" value="92100" />
                <FieldRow label="Ville" value="Boulogne-Billancourt" />
                <FieldRow label="Pays" value="France" />
                <FieldRow label="Téléphone mobile" value="+33 6 14 28 67 39" />
                <FieldRow label="E-mail" value="n.mercier@email.fr" />
              </div>
            </div>

            {/* 03 · Votre situation */}
            <div className="s1b-dci-section" data-step="3">
              <div className="s1b-dci-section-head">
                <span className="s1b-dci-section-num">03</span>
                <h3 className="s1b-dci-section-title">Votre situation</h3>
              </div>
              <div className="s1b-dci-section-body">
                <FieldRow label="Votre statut" value="Célibataire · sans enfant" />
                <FieldRow label="Date de mariage / PACS" value="Sans objet" />
                <FieldRow
                  label="Avez-vous signé un contrat de mariage ou une convention de PACS ?"
                  value="Sans objet"
                />
                <FieldRow label="Avez-vous rédigé un testament ?" value="Non" />
                <FieldRow label="Statut professionnel" value="Profession libérale" />
                <FieldRow label="Profession" value="Consultant indépendant en stratégie · 5 ans d'activité" />
                <FieldRow label="Pays de résidence fiscale" value="France" />
                <FieldRow label="Avez-vous une autre résidence fiscale ?" value="Non" />
              </div>
            </div>

            {/* 04 · Votre patrimoine */}
            <div className="s1b-dci-section" data-step="4">
              <div className="s1b-dci-section-head">
                <span className="s1b-dci-section-num">04</span>
                <h3 className="s1b-dci-section-title">Votre patrimoine</h3>
              </div>
              <div className="s1b-dci-section-body">
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Actifs professionnels</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow label="Détenez-vous des parts dans des sociétés ?" value="Non · activité en entreprise individuelle (EI)" />
                    <FieldRow label="Sociétés civiles · combien ?" value="0" />
                    <FieldRow label="Sociétés commerciales · combien ?" value="0" />
                    <FieldRow label="Estimation totale de la valeur de ces actifs professionnels" value="0 €" />
                  </div>
                </div>
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Immobilier</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow label="Votre résidence principale" value="Non · locataire · acquisition envisagée à 12-18 mois" />
                    <FieldRow label="Valeur brute estimée de votre résidence principale" value="0 €" />
                    <FieldRow label="Investissements immobiliers locatifs" value="0" />
                    <FieldRow label="Valeur brute totale estimée" value="0 €" />
                    <FieldRow label="Immobilier indirect (SCPI, OPCI, parts de SCI…)" value="0" />
                    <FieldRow label="Valeur brute totale estimée" value="0 €" />
                    <FieldRow label="Autres biens immobiliers (résidence secondaire, terrains…)" value="0" />
                    <FieldRow label="Valeur brute totale estimée" value="0 €" />
                  </div>
                </div>
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Placements financiers</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow label="Épargne disponible (livrets, comptes de dépôt…)" value="2 (LA + LDDS)" />
                    <FieldRow label="Montant total" value="34 800 €" />
                    <FieldRow label="Assurances-vie · nombre de contrats" value="1" />
                    <FieldRow label="Montant total" value="78 000 €" />
                    <FieldRow label="PEA (Plan d'Épargne en Actions)" value="1" />
                    <FieldRow label="Montant total" value="62 000 €" />
                    <FieldRow label="Compte-titres ordinaire (CTO) · nombre de comptes" value="1" />
                    <FieldRow label="Montant total" value="18 000 €" />
                    <FieldRow label="Épargne retraite (PER, PERP, Madelin, PERCO…)" value="0 · à mettre en place" />
                    <FieldRow label="Montant total" value="0 €" />
                    <FieldRow label="Autres placements financiers · nombre de supports" value="0" />
                    <FieldRow label="Montant total" value="0 €" />
                  </div>
                </div>
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Placements alternatifs</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow label="Possédez-vous des placements alternatifs ?" value="Non" />
                    <FieldRow label="Nombre de supports" value="0" />
                    <FieldRow label="Montant total estimé" value="0 €" />
                    <FieldRow label="Précisez les types (facultatif)" value="—" />
                  </div>
                </div>
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Emprunts et dettes</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow label="Prêt(s) immobilier(s) · nombre de prêts" value="0" />
                    <FieldRow label="Capital restant dû total" value="0 €" />
                    <FieldRow label="Prêt(s) à la consommation · nombre de prêts" value="0" />
                    <FieldRow label="Capital restant dû total" value="0 €" />
                    <FieldRow label="Autres dettes (familiales, fiscales, professionnelles…)" value="Aucune" />
                  </div>
                </div>
              </div>
            </div>

            {/* 05 · Votre budget */}
            <div className="s1b-dci-section" data-step="5">
              <div className="s1b-dci-section-head">
                <span className="s1b-dci-section-num">05</span>
                <h3 className="s1b-dci-section-title">Votre budget</h3>
              </div>
              <div className="s1b-dci-section-body">
                <FieldRow label="Montant total annuel des revenus du foyer (avant impôt)" value="85 000 € HT (BNC consultant)" />
                <FieldRow
                  label="Montant total annuel des charges du foyer"
                  value="42 000 € (loyer + cotisations sociales URSSAF + IR + charges courantes)"
                />
              </div>
            </div>

            {/* 06 · Vos objectifs */}
            <div className="s1b-dci-section" data-step="6">
              <div className="s1b-dci-section-head">
                <span className="s1b-dci-section-num">06</span>
                <h3 className="s1b-dci-section-title">Vos objectifs</h3>
              </div>
              <div className="s1b-dci-section-body">
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Objectif n°1</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow label="Quel est cet objectif ?" value="Optimiser ma fiscalité" />
                    <FieldRow label="Importance" value="Élevée" />
                    <FieldRow label="Quand initier ?" value="Sous 3 mois" />
                    <FieldRow label="Quand atteindre ?" value="Sous 6 mois" />
                  </div>
                </div>
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Objectif n°2</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow
                      label="Quel est cet objectif ?"
                      value="Préparer un projet d'achat de résidence principale à Paris ou région parisienne"
                    />
                    <FieldRow label="Importance" value="Élevée" />
                    <FieldRow label="Quand initier ?" value="Sous 6 mois" />
                    <FieldRow label="Quand atteindre ?" value="Sous 18 mois" />
                  </div>
                </div>
                <div className="s1b-dci-subsection">
                  <div className="s1b-dci-subsection-title">Objectif n°3</div>
                  <div className="s1b-dci-subsection-body">
                    <FieldRow
                      label="Quel est cet objectif ?"
                      value="Diversifier les placements financiers (initialement très orientés actions)"
                    />
                    <FieldRow label="Importance" value="Élevée" />
                    <FieldRow label="Quand initier ?" value="Sous 6 mois" />
                    <FieldRow label="Quand atteindre ?" value="En continu" />
                  </div>
                </div>
              </div>
            </div>

            {/* 07 · Récapitulatif */}
            <div className="s1b-dci-section" data-step="7">
              <div className="s1b-dci-section-head">
                <span className="s1b-dci-section-num">07</span>
                <h3 className="s1b-dci-section-title">Récapitulatif de votre profil</h3>
              </div>
              <div className="s1b-dci-section-body">
                <div
                  style={{
                    padding: "18px 22px",
                    background: "linear-gradient(135deg, rgba(198,142,14,0.12) 0%, white 75%)",
                    border: "1px solid var(--gold-300)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: "24px",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 700,
                        color: "var(--gold-deep)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                      }}
                    >
                      Profil patrimonial complété
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy)", marginBottom: "3px" }}>
                      Nicolas MERCIER
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--navy-300)" }}>
                      Personne seule · célibataire · 0 enfant · architecte associé · profession libérale
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginBottom: "3px" }}>
                      Patrimoine brut estimé
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--gold-deep)", letterSpacing: "-0.02em" }}>
                      ≈ 540 000 €
                    </div>
                    <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "3px" }}>
                      après dettes : ≈ 395 000 €
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <RecapCard
                    title="⌂ Foyer"
                    rows={[
                      ["Composition", "Personne seule"],
                      ["Conjoints", "—"],
                      ["Enfants", "Aucun"],
                    ]}
                  />
                  <RecapCard
                    title="✉ Coordonnées"
                    rows={[
                      ["Adresse", "23 rue Saint-James"],
                      ["Ville", "33000 Bordeaux"],
                      ["E-mail", "nicolas.mercier@email.fr"],
                    ]}
                  />
                  <RecapCard
                    title="⚭ Situation"
                    rows={[
                      ["Régime", "Célibataire"],
                      ["Statut", "Célibataire"],
                      ["Activité", "Architecte associé · libéral"],
                      ["Fiscalité", "France"],
                    ]}
                  />
                  <RecapCard
                    title="⛁ Patrimoine"
                    rows={[
                      ["Immobilier", "≈ 320 000 €"],
                      ["Financier", "≈ 165 000 €"],
                      ["Professionnel", "≈ 55 000 €"],
                      ["Dettes", "− 145 000 €", "#C0392B"],
                    ]}
                  />
                  <RecapCard
                    title="€ Budget"
                    rows={[
                      ["Revenus annuels", "118 000 €"],
                      ["Charges annuelles", "82 000 €"],
                      ["Capacité d'épargne", "≈ 28 000 € / an", "#1F8049"],
                    ]}
                  />
                  <div style={recapCardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--navy)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        ⊙ Objectifs
                      </div>
                      <button type="button" style={recapBtnStyle}>
                        Modifier
                      </button>
                    </div>
                    <div style={{ fontSize: "11px", lineHeight: 1.6, color: "var(--navy)" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "flex-start", marginBottom: "4px" }}>
                        <span style={pastilleStyle("var(--gold)")}>1</span>
                        <div>
                          <strong>Optimiser ma fiscalité</strong>{" "}
                          <span style={{ color: "var(--navy-300)" }}>· horizon court terme</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                        <span style={pastilleStyle("var(--gold-300)")}>2</span>
                        <div>
                          <strong>Préparer ma retraite</strong>{" "}
                          <span style={{ color: "var(--navy-300)" }}>· horizon long terme</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function pastilleStyle(bg: string): React.CSSProperties {
  return {
    display: "inline-grid",
    placeItems: "center",
    width: "16px",
    height: "16px",
    background: bg,
    color: "white",
    borderRadius: "50%",
    fontSize: "9px",
    fontWeight: 700,
    flexShrink: 0,
  };
}

function RecapCard({ title, rows }: { title: string; rows: [string, string, string?][] }) {
  return (
    <div style={recapCardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--navy)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <button type="button" style={recapBtnStyle}>
          Modifier
        </button>
      </div>
      <div style={{ fontSize: "11px", lineHeight: 1.6, color: "var(--navy)" }}>
        {rows.map(([k, v, color], i) => (
          <div key={i}>
            <span style={{ color: "var(--navy-300)" }}>{k}</span> ·{" "}
            <strong style={color ? { color } : undefined}>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Modale Questionnaire de qualification ─────────────────────────────── */
type QualifCat = {
  title: string;
  resume: string;
  tag: "aucune" | "initie" | "avance";
  tagLabel: string;
  icon: React.ReactNode;
  fields: [string, [string, boolean][]][];
};

const QUALIF_CATS: QualifCat[] = [
  {
    title: "Actions cotées",
    resume: "Initié · expérience moyenne · ne détient pas en direct · risque compris",
    tag: "initie",
    tagLabel: "Initié(e)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", false], ["Initié(e)", true], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", false], ["Initié(e)", true], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", false], ["Non", true], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", true], ["Non", false], ["Ne sait pas", false]]],
    ],
  },
  {
    title: "Obligations",
    resume: "Aucune connaissance · pas d'expérience · ne détient pas · risque non identifié",
    tag: "aucune",
    tagLabel: "Aucune",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="12" rx="1" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", false], ["Non", true], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", false], ["Non", false], ["Ne sait pas", true]]],
    ],
  },
  {
    title: "Fonds en Euros",
    resume: "Avancé · expérience confirmée · détient via AV · capital garanti compris",
    tag: "avance",
    tagLabel: "Avancée",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", false], ["Initié(e)", false], ["Avancé(e)", true]]],
      ["Expérience", [["Aucune expérience", false], ["Initié(e)", false], ["Avancé(e)", true]]],
      ["Détention actuelle", [["Oui", true], ["Non", false], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", false], ["Non", true], ["Ne sait pas", false]]],
    ],
  },
  {
    title: "Immobilier financier · SCPI, OPCI",
    resume: "Initiée · pas encore investi · attentive aux SCPI ESG · risque compris",
    tag: "initie",
    tagLabel: "Initié(e)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12L12 3l9 9 M5 10v10h14V10" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", false], ["Initié(e)", true], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", false], ["Non", true], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", true], ["Non", false], ["Ne sait pas", false]]],
    ],
  },
  {
    title: "Produits structurés",
    resume: "Aucune connaissance · jamais investi · ne détient pas · risque non identifié",
    tag: "aucune",
    tagLabel: "Aucune",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", false], ["Non", true], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", false], ["Non", false], ["Ne sait pas", true]]],
    ],
  },
  {
    title: "Capital risque · FCPI, FCPR",
    resume: "Initiée · jamais souscrit · intérêt fiscal connu (TMI 41 %) · risque compris",
    tag: "initie",
    tagLabel: "Initié(e)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 22h20z" />
        <line x1="12" y1="9" x2="12" y2="17" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", false], ["Initié(e)", true], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", false], ["Non", true], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", true], ["Non", false], ["Ne sait pas", false]]],
    ],
  },
  {
    title: "OPCVM · SICAV, FCP",
    resume: "Initiée · expérience via AV · détient en UC · risque compris",
    tag: "initie",
    tagLabel: "Initié(e)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", false], ["Initié(e)", true], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", false], ["Initié(e)", true], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", true], ["Non", false], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", true], ["Non", false], ["Ne sait pas", false]]],
    ],
  },
  {
    title: "Produits à effet de levier",
    resume: "Aucune connaissance · ne souhaite pas s'exposer · ne détient pas · risque non identifié",
    tag: "aucune",
    tagLabel: "Aucune",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", false], ["Non", true], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", false], ["Non", false], ["Ne sait pas", true]]],
    ],
  },
  {
    title: "ETF / Trackers",
    resume: "Initiée · investit régulièrement via PEA · détient des ETF MSCI · risque compris",
    tag: "initie",
    tagLabel: "Initié(e)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", false], ["Initié(e)", true], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", false], ["Initié(e)", true], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", true], ["Non", false], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", true], ["Non", false], ["Ne sait pas", false]]],
    ],
  },
  {
    title: "Crypto-monnaies",
    resume: "Aucune connaissance · pas d'expérience · ne détient pas · risque non identifié",
    tag: "aucune",
    tagLabel: "Aucune",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 8h5a2.5 2.5 0 0 1 0 5H9z M9 13h6a2.5 2.5 0 0 1 0 5H9z M11 5v3 M13 5v3 M11 18v3 M13 18v3" />
      </svg>
    ),
    fields: [
      ["Connaissance", [["Aucune connaissance", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Expérience", [["Aucune expérience", true], ["Initié(e)", false], ["Avancé(e)", false]]],
      ["Détention actuelle", [["Oui", false], ["Non", true], ["Ne sait pas", false]]],
      ["Comporte un risque de perte en capital ?", [["Oui", false], ["Non", false], ["Ne sait pas", true]]],
    ],
  },
];

function QualifAccordion({
  cat,
  open,
  onToggle,
}: {
  cat: QualifCat;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`s1b-accordion-cat${open ? " open" : ""}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".s1a-input, .s1a-select, .s1a-field-label")) return;
        onToggle();
      }}
    >
      <div className="s1b-accordion-head">
        <div className="s1b-accordion-icon">{cat.icon}</div>
        <div>
          <div className="s1b-accordion-title">{cat.title}</div>
          <div className="s1b-accordion-resume">{cat.resume}</div>
        </div>
        <span className={`s1b-accordion-tag ${cat.tag}`}>{cat.tagLabel}</span>
        <svg
          className="s1b-accordion-chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      <div className="s1b-accordion-body">
        <div className="s1a-grid-2">
          {cat.fields.map(([label, opts], i) => (
            <div className="s1a-field" key={i}>
              <label className="s1a-field-label">{label}</label>
              <select className="s1a-select" defaultValue={opts.find((o) => o[1])?.[0]}>
                {opts.map((o) => (
                  <option key={o[0]}>{o[0]}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const QUALIF_COURBES = [
  { n: 1, color: "#C0392B", rend: "1 %", perte: "Perte max 0 %", cy: 153 },
  { n: 2, color: "#E67E22", rend: "2 %", perte: "Perte max 2 %", cy: 144 },
  { n: 3, color: "#D4AC0D", rend: "4 %", perte: "Perte max 7 %", cy: 116 },
  { n: 4, color: "#C68E0E", rend: "6 %", perte: "Perte max 13 %", cy: 86 },
  { n: 5, color: "#16A2C2", rend: "8 %", perte: "Perte max 23 %", cy: 70 },
  { n: 6, color: "#2E5BBA", rend: "12 %", perte: "Perte max 28 %", cy: 38 },
  { n: 7, color: "#A235B0", rend: "19 %", perte: "Perte max 49 %", cy: 25 },
] as const;

const COURBE_LABELS: Record<number, string> = {
  1: "Courbe 1 · Rendement annuel moyen 1 % · Perte maximale 0 %",
  2: "Courbe 2 · Rendement annuel moyen 2 % · Perte maximale 2 %",
  3: "Courbe 3 · Rendement annuel moyen 4 % · Perte maximale 7 %",
  4: "Courbe 4 · Rendement annuel moyen 6 % · Perte maximale 13 %",
  5: "Courbe 5 · Rendement annuel moyen 8 % · Perte maximale 23 %",
  6: "Courbe 6 · Rendement annuel moyen 12 % · Perte maximale 28 %",
  7: "Courbe 7 · Rendement annuel moyen 19 % · Perte maximale 49 %",
};

const COURBE_PATHS: Record<number, string> = {
  1: "M 70 165 L 200 163 L 330 161 L 460 159 L 590 156 L 700 153",
  2: "M 70 165 L 200 168 L 330 162 L 460 156 L 590 148 L 700 144",
  3: "M 70 165 L 200 172 L 330 168 L 460 152 L 590 130 L 700 116",
  4: "M 70 165 L 200 178 L 330 188 L 460 144 L 590 110 L 700 86",
  5: "M 70 165 L 200 195 L 330 170 L 460 195 L 590 105 L 700 70",
  6: "M 70 165 L 200 210 L 330 175 L 460 205 L 590 80 L 700 38",
  7: "M 70 165 L 200 225 L 330 175 L 460 235 L 590 65 L 700 25",
};

function QualifSelect({ options }: { options: string[]; }) {
  // chaîne précédée de « selected: » => valeur cochée ; sinon défaut = 1er « * »
  const selected = options.find((o) => o.startsWith("*"))?.slice(1) ?? options[0];
  return (
    <select className="s1a-select" defaultValue={selected}>
      {options.map((o) => {
        const label = o.startsWith("*") ? o.slice(1) : o;
        return <option key={label}>{label}</option>;
      })}
    </select>
  );
}

function QualifPersonCard({
  active,
  onSelect,
  initials,
  name,
  role,
  profil,
  risque,
  horizon,
  esg,
  accent,
}: {
  active: boolean;
  onSelect: () => void;
  initials: string;
  name: string;
  role: string;
  profil: string;
  risque: string;
  horizon: string;
  esg: string;
  accent: "gold" | "navy";
}) {
  const isGold = accent === "gold";
  return (
    <div
      onClick={onSelect}
      style={{
        cursor: "pointer",
        padding: "16px 18px",
        background: isGold
          ? "linear-gradient(135deg, rgba(250,232,184,0.45) 0%, white 70%)"
          : "linear-gradient(135deg, rgba(16,45,80,0.04) 0%, white 70%)",
        border: active ? "2px solid var(--gold)" : "2px solid var(--navy-100)",
        borderRadius: "8px",
        transition: "all 0.18s",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "10px",
          fontSize: "8.5px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: "9px",
          background: isGold ? "var(--gold)" : "var(--navy)",
          color: "white",
          opacity: active ? 1 : 0,
        }}
      >
        Affiché
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span
          style={{
            display: "inline-flex",
            width: "28px",
            height: "28px",
            background: isGold ? "var(--gold)" : "var(--navy)",
            color: "white",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          {initials}
        </span>
        <div>
          <div
            style={{
              fontSize: "9.5px",
              fontWeight: 700,
              color: isGold ? "var(--gold-deep)" : "var(--navy)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: "9.5px", color: "var(--navy-300)" }}>{role}</div>
        </div>
      </div>
      <div
        style={{
          fontFamily: "'Epilogue', sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          color: "var(--navy)",
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
        }}
      >
        {profil}
      </div>
      <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "5px" }}>
        <PersStat label="Risque" value={risque} suffix="/5" />
        <PersStat label="Horizon" value={horizon} suffix=" ans" />
        <PersStat label="ESG" value={esg} />
      </div>
    </div>
  );
}

function PersStat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "5px 6px",
        background: "white",
        borderRadius: "4px",
        border: "1px solid var(--ivory-deep)",
      }}
    >
      <div
        style={{
          fontSize: "8px",
          fontWeight: 700,
          color: "var(--navy-300)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
        {value}
        {suffix ? <span style={{ fontSize: "8px", color: "var(--navy-300)" }}>{suffix}</span> : null}
      </div>
    </div>
  );
}

function QualifModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("readonly");
  const [person, setPerson] = useState<"camille" | "yannick">("camille");
  const [courbe, setCourbe] = useState(4);
  const [openCats, setOpenCats] = useState<boolean[]>(() => QUALIF_CATS.map(() => false));

  const isCamille = person === "camille";

  const toggleCat = (i: number) =>
    setOpenCats((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  const setAllCats = (open: boolean) => setOpenCats(QUALIF_CATS.map(() => open));

  return (
    <ModalShell
      open={open}
      onClose={() => {
        setMode("readonly");
        setAllCats(false);
        onClose();
      }}
      mode={mode}
      setMode={setMode}
      maxWidth={880}
      eyebrow="Questionnaire de qualification client · MIF II / ANACOFI"
      title={
        <>
          Profil investisseur · <strong>Camille JOUBERT &amp; Yannick BERTHOUX</strong>
        </>
      }
      sub="Complété par les 2 cocontractants le 02/05/2026 · 2 profils distincts dans le respect du régime PACS de séparation."
      modeMeta="Questionnaire de qualification · MIF II / ANACOFI · 18 sections"
      readonlyBanner={
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>
            <strong>Mode consultation</strong> · les réponses sont en lecture seule. Cliquez sur <em>Modifier</em> en
            haut à droite pour les ajuster pendant l&apos;entretien.
          </span>
        </>
      }
      editBanner={
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
          </svg>
          <span>
            <strong>Mode édition activé</strong> · vos modifications recalculeront les profils investisseur
            automatiquement.
          </span>
        </>
      }
      footerInfo="Profil recalculé en temps réel · conforme MIF II · validé ANACOFI"
    >
      {/* 2 profils cliquables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <QualifPersonCard
          active={isCamille}
          onSelect={() => setPerson("camille")}
          initials="CJ"
          name="Camille JOUBERT"
          role="Cheffe RSE Schneider · 42 ans"
          profil="Équilibré"
          risque="3"
          horizon="10-15"
          esg="Forte"
          accent="gold"
        />
        <QualifPersonCard
          active={!isCamille}
          onSelect={() => setPerson("yannick")}
          initials="YB"
          name="Yannick BERTHOUX"
          role="Dirigeant SASU cyber B2B · 45 ans"
          profil="Dynamique"
          risque="4"
          horizon="15-20"
          esg="Modérée"
          accent="navy"
        />
      </div>

      <div
        style={{
          marginBottom: "14px",
          padding: "10px 14px",
          background: "rgba(198,142,14,0.08)",
          borderLeft: "3px solid var(--gold)",
          borderRadius: "4px",
          fontSize: "11px",
          color: "var(--navy)",
          lineHeight: 1.55,
        }}
      >
        <strong style={{ color: "var(--gold-deep)" }}>
          Vous consultez les réponses détaillées de {isCamille ? "Camille JOUBERT" : "Yannick BERTHOUX"}
        </strong>{" "}
        · profil <strong>{isCamille ? "Équilibré" : "Dynamique"}</strong> · cliquez sur la carte de{" "}
        {isCamille ? "Yannick BERTHOUX" : "Camille JOUBERT"} ci-dessus pour basculer sur son questionnaire.
      </div>

      {/* Connaissance des produits financiers · accordéons */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Connaissance des produits financiers · 4 questions par catégorie</div>
        <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginBottom: "10px", lineHeight: 1.55 }}>
          Pour chaque catégorie : niveau de connaissance, expérience d&apos;investissement, détention actuelle, et
          compréhension du risque de perte en capital. Cliquez sur une catégorie pour déplier les 4 réponses.
        </div>
        <div className="s1b-accordion-actions">
          <button type="button" onClick={() => setAllCats(true)}>
            Tout déplier
          </button>
          <button type="button" onClick={() => setAllCats(false)}>
            Tout replier
          </button>
        </div>
        {QUALIF_CATS.map((cat, i) => (
          <QualifAccordion key={cat.title} cat={cat} open={openCats[i]} onToggle={() => toggleCat(i)} />
        ))}
      </div>

      {/* Auto-évaluation globale */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Auto-évaluation globale</div>
        <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginBottom: "10px", lineHeight: 1.55 }}>
          Synthèse de votre niveau de connaissance et d&apos;expérience global en matière d&apos;investissement, toutes
          catégories confondues.
        </div>
        <div className="s1a-grid-2">
          <div className="s1a-field">
            <label className="s1a-field-label">Comment qualifieriez-vous votre niveau de connaissance global ?</label>
            <QualifSelect options={["Aucune connaissance", "Connaissances limitées", "*Initié(e)", "Avancé(e)", "Expert(e)"]} />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">Combien d&apos;années d&apos;expérience d&apos;investissement avez-vous ?</label>
            <QualifSelect options={["Aucune", "Moins de 2 ans", "2 à 5 ans", "*5 à 10 ans", "Plus de 10 ans"]} />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">À quelle fréquence suivez-vous l&apos;actualité financière ?</label>
            <QualifSelect options={["Jamais", "Occasionnellement", "*Régulièrement (hebdo)", "Quotidiennement"]} />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">Êtes-vous accompagné(e) par un conseiller patrimonial ?</label>
            <QualifSelect options={["*Non, je gère seul(e)", "Oui, occasionnellement", "Oui, régulièrement"]} />
          </div>
        </div>
      </div>

      {/* Horizon de placement */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Horizon de placement</div>
        <div className="s1a-field">
          <label className="s1a-field-label">Sur quelle durée envisagez-vous principalement vos investissements ?</label>
          <QualifSelect
            options={["Moins de 3 ans", "3 à 5 ans", "5 à 10 ans", "*10 à 15 ans (retraite anticipée envisagée)", "Plus de 15 ans"]}
          />
        </div>
      </div>

      {/* Tolérance aux variations */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Tolérance aux variations</div>
        <div className="s1a-grid-2">
          <div className="s1a-field">
            <label className="s1a-field-label">Perte maximale acceptable sur 1 an</label>
            <QualifSelect options={["0 % (capital garanti)", "Jusqu'à -10 %", "*Jusqu'à -25 %", "Jusqu'à -40 %", "Aucune limite"]} />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">Rendement annuel cible visé</label>
            <QualifSelect options={["2-3 % (sécurité)", "3-5 %", "*5-8 %", "8-12 %", "> 12 %"]} />
          </div>
        </div>
      </div>

      {/* Réaction face à une baisse */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Réaction face à une baisse</div>
        <div className="s1a-field">
          <label className="s1a-field-label">Si votre portefeuille baissait de 30 % en 6 mois, votre réaction ?</label>
          <QualifSelect
            options={[
              "Je vendrais immédiatement pour limiter la perte",
              "Je serais très inquiet et envisagerais de vendre",
              "*Je resterais investi en attendant le rebond",
              "Je profiterais de la baisse pour renforcer mes positions",
            ]}
          />
        </div>
      </div>

      {/* Objectifs d'investissement */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Objectifs d&apos;investissement</div>
        <div className="s1a-grid-2">
          <div className="s1a-field">
            <label className="s1a-field-label">Objectif principal</label>
            <QualifSelect
              options={["Préservation du capital", "Revenus réguliers", "*Croissance du capital", "Préparation retraite", "Transmission"]}
            />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">Objectif secondaire</label>
            <QualifSelect
              options={[
                "Préservation du capital",
                "Revenus réguliers",
                "Croissance du capital",
                "*Optimisation fiscale (TMI 41 %)",
                "Transmission",
              ]}
            />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">Besoins de liquidité à court terme</label>
            <QualifSelect
              options={["Importants (> 50 %)", "Modérés", "*Faibles · épargne de précaution suffisante", "Aucun"]}
            />
          </div>
        </div>
      </div>

      {/* Profil rendement / risque · 7 courbes */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Profil rendement / risque</div>
        <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginBottom: "12px", lineHeight: 1.55 }}>
          7 séries de rendements simulés sur 5 ans, classées du moins risqué au plus risqué. La courbe sélectionnée par
          le client est surlignée en or.
        </div>
        <div style={{ background: "white", border: "1px solid var(--navy-100)", borderRadius: "8px", padding: "14px 18px", marginBottom: "14px" }}>
          <svg viewBox="0 0 720 280" style={{ width: "100%", height: "auto", maxHeight: "240px" }} aria-label="7 courbes de rendement/risque">
            <line x1="70" y1="240" x2="700" y2="240" stroke="#A4AEBB" strokeWidth="1.5" />
            <line x1="70" y1="30" x2="70" y2="240" stroke="#A4AEBB" strokeWidth="1.5" />
            <line x1="70" y1="165" x2="700" y2="165" stroke="#DBE0E4" strokeWidth="1" strokeDasharray="4,3" />
            <text x="62" y="170" fontSize="10" fill="#102D50" textAnchor="end" fontFamily="Epilogue" fontWeight="700">100</text>
            <text x="62" y="245" fontSize="9.5" fill="#708196" textAnchor="end" fontFamily="Epilogue">60</text>
            <text x="62" y="35" fontSize="9.5" fill="#708196" textAnchor="end" fontFamily="Epilogue">160</text>
            <text x="70" y="258" fontSize="9.5" fill="#708196" textAnchor="middle" fontFamily="Epilogue">0</text>
            <text x="200" y="258" fontSize="9.5" fill="#708196" textAnchor="middle" fontFamily="Epilogue">1</text>
            <text x="330" y="258" fontSize="9.5" fill="#708196" textAnchor="middle" fontFamily="Epilogue">2</text>
            <text x="460" y="258" fontSize="9.5" fill="#708196" textAnchor="middle" fontFamily="Epilogue">3</text>
            <text x="590" y="258" fontSize="9.5" fill="#708196" textAnchor="middle" fontFamily="Epilogue">4</text>
            <text x="700" y="258" fontSize="9.5" fill="#708196" textAnchor="middle" fontFamily="Epilogue">5 ans</text>
            <text x="385" y="275" fontSize="10" fill="#102D50" textAnchor="middle" fontFamily="Epilogue" fontStyle="italic">Années</text>
            {QUALIF_COURBES.map((c) => (
              <path
                key={c.n}
                d={COURBE_PATHS[c.n]}
                fill="none"
                stroke={c.color}
                strokeWidth={c.n === courbe ? 3.5 : 1.8}
                opacity={c.n === courbe ? 1 : 0.5}
              />
            ))}
            <circle cx="700" cy={QUALIF_COURBES.find((c) => c.n === courbe)!.cy} r="5" fill={QUALIF_COURBES.find((c) => c.n === courbe)!.color} stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
          {QUALIF_COURBES.map((c) => {
            const sel = c.n === courbe;
            return (
              <div
                key={c.n}
                onClick={() => setCourbe(c.n)}
                style={{
                  padding: "8px 6px",
                  background: sel ? "linear-gradient(135deg, rgba(198,142,14,0.18) 0%, white 80%)" : "white",
                  border: sel ? "2px solid var(--gold)" : "1px solid var(--navy-100)",
                  borderRadius: "5px",
                  textAlign: "center",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {sel ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "-7px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--gold)",
                      color: "white",
                      fontSize: "8px",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: "8px",
                      letterSpacing: "0.08em",
                    }}
                  >
                    CHOISIE
                  </div>
                ) : null}
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: sel ? "var(--gold-deep)" : c.color,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Courbe {c.n}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--navy)", marginTop: "2px" }}>{c.rend}</div>
                <div style={{ fontSize: "9px", color: "var(--navy-300)", marginTop: "1px" }}>{c.perte}</div>
              </div>
            );
          })}
        </div>
        <div className="s1a-field" style={{ marginTop: "12px" }}>
          <label className="s1a-field-label">Courbe sélectionnée par le client</label>
          <select
            className="s1a-select"
            value={String(courbe)}
            onChange={(e) => setCourbe(Number(e.target.value))}
          >
            {QUALIF_COURBES.map((c) => (
              <option key={c.n} value={c.n}>
                {COURBE_LABELS[c.n]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Critères ESG */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Critères ESG · investissement durable</div>
        <div className="s1a-grid-2">
          <div className="s1a-field">
            <label className="s1a-field-label">
              Importance des critères ESG
              <br />
              dans vos choix d&apos;investissement
            </label>
            <QualifSelect options={["Aucune", "Faible", "Modérée", "*Élevée", "Critère exclusif"]} />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">
              Acceptez-vous un rendement légèrement moindre
              <br />
              pour un investissement durable ?
            </label>
            <QualifSelect options={["Non", "Peut-être", "*Oui, jusqu'à -1 % de rendement", "Oui, jusqu'à -2 % de rendement"]} />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">
              Souhaitez-vous exclure certains secteurs
              <br />
              de vos investissements ?
            </label>
            <QualifSelect
              options={["Non, aucune exclusion", "*Oui · armement, tabac, énergies fossiles", "Oui · liste à préciser avec mon conseiller"]}
            />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">
              Privilégiez-vous des thématiques spécifiques
              <br />
              (climat · social · gouvernance) ?
            </label>
            <QualifSelect
              options={[
                "Indifférent",
                "*Climat & transition énergétique",
                "Inclusion sociale & santé",
                "Gouvernance & éthique",
                "Mix des trois piliers",
              ]}
            />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">
              Connaissez-vous les labels ESG
              <br />
              (ISR, Greenfin, Finansol) ?
            </label>
            <QualifSelect
              options={["Aucun", "*De nom uniquement", "Je sais ce qu'ils certifient", "Je les utilise pour orienter mes choix"]}
            />
          </div>
          <div className="s1a-field">
            <label className="s1a-field-label">
              Souhaitez-vous des reportings ESG
              <br />
              sur votre portefeuille ?
            </label>
            <QualifSelect options={["Non", "Annuel suffit", "*Semestriel", "À chaque arbitrage"]} />
          </div>
        </div>
      </div>

      {/* Récapitulatif et signature */}
      <div className="s1a-section s1b-editable">
        <div className="s1a-section-label">Récapitulatif et signature</div>
        <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginBottom: "12px", lineHeight: 1.55 }}>
          Synthèse des réponses · profil d&apos;investisseur établi conformément à la directive MIF II et aux exigences
          ANACOFI.
        </div>
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, rgba(198,142,14,0.10) 0%, white 80%)",
              border: "1px solid var(--gold-300)",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--gold-deep)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Profil retenu
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--navy)" }}>Équilibré</div>
            <div style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "4px" }}>
              Risque 3/5 · Horizon 10-15 ans · ESG élevée
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "16px 18px",
            background: "var(--ivory)",
            border: "1px dashed var(--gold)",
            borderRadius: "6px",
            display: "flex",
            gap: "14px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--gold-deep)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Confirmation des informations
            </div>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--navy)", marginTop: "4px" }}>
              Camille JOUBERT · informations validées le 04/05/2026 à 14h27
            </div>
            <div style={{ fontSize: "10px", color: "var(--navy-300)", marginTop: "2px" }}>
              La signature électronique du DER + KYC + LM interviendra à l&apos;étape 2 · finalisation lettre de mission
            </div>
          </div>
          <div
            style={{
              padding: "8px 14px",
              background: "#E8F5EE",
              color: "#1F5A36",
              borderRadius: "14px",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            ✓ CONFIRMÉ
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
