"use client";

import { useCallback, useState } from "react";

import {
  DER,
  DOC_CARDS,
  PACK,
  PACK_PIECES,
  type DocCard,
  type PackPiece,
} from "../../../_data/fiche-conformite";
import { genererDerPdf } from "./actions";

/* ── Pictos ───────────────────────────────────────────────────────────── */

function DocIcon({ kind }: { kind: DocCard["icon"] }) {
  if (kind === "navy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12h6 M12 9v6" />
      </svg>
    );
  }
  if (kind === "gold") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M16 13H8 M16 17H8 M10 9H8" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconView() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconSign() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function PackPieceIcon({ tone }: { tone: PackPiece["icon"] }) {
  switch (tone) {
    case "navy":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12h6 M12 9v6" />
        </svg>
      );
    case "gold":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "green":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 7h8 M8 11h8 M8 15h4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
}

const PIECE_ICON_STYLE: Record<PackPiece["icon"], React.CSSProperties> = {
  navy: { background: "rgba(16,45,80,0.08)", color: "var(--navy)" },
  gold: { background: "rgba(198,142,14,0.12)", color: "var(--gold-deep)" },
  green: { background: "rgba(31,128,73,0.1)", color: "#1F8049" },
  grey: { background: "rgba(112,129,150,0.12)", color: "var(--navy-300)" },
};
const PIECE_TAG_STYLE: Record<PackPiece["tagTone"], React.CSSProperties> = {
  navy: { background: "rgba(16,45,80,0.1)", color: "var(--navy)" },
  gold: { background: "rgba(198,142,14,0.12)", color: "var(--gold-deep)" },
  green: { background: "rgba(31,128,73,0.1)", color: "#1F8049" },
  grey: { background: "rgba(112,129,150,0.12)", color: "var(--navy-300)" },
};

/* ── 3 cartes documents avec leur workflow ─────────────────────────────── */

export function DocCardsRow({ onOpenDer }: { onOpenDer: () => void }) {
  return (
    <div className="fco-doc-grid">
      {DOC_CARDS.map((card) => (
        <div className="s1c-doc-card pending" key={card.key}>
          <div className="s1c-doc-head">
            <div className={`s1c-doc-icon ${card.icon === "doc" ? "fco-icon-doc" : card.icon}`}>
              <DocIcon kind={card.icon} />
            </div>
            <div>
              <div className="s1c-doc-title">{card.title}</div>
              <div className="s1c-doc-subtitle">{card.subtitle}</div>
            </div>
            <span className="s1c-doc-status-pill fco-pill-gold">{card.statusPill}</span>
          </div>

          <div
            className="s1c-tracker fco-tracker"
            style={
              card.tracker.length === 4
                ? { gridTemplateColumns: "repeat(4, 1fr)" }
                : undefined
            }
          >
            {card.tracker.map((step) => (
              <div className={`s1c-tracker-step ${step.state}`} key={step.label}>
                <div className="s1c-tracker-dot" />
                <div className="s1c-tracker-label">{step.label}</div>
                <div className="s1c-tracker-date">{step.date}</div>
              </div>
            ))}
          </div>

          <div className="s1c-wf-actions">
            {/* Modifier : seul le DER a un vrai contenu pré-rendu modifiable. */}
            {card.key === "der" ? (
              <button type="button" className="s1c-wf-btn wf-edit" onClick={onOpenDer}>
                <IconEdit /> Modifier
              </button>
            ) : (
              <button
                type="button"
                className="s1c-wf-btn wf-edit"
                disabled
                title="Édition en cours de construction"
              >
                <IconEdit /> Modifier
              </button>
            )}

            {/* Envoyer : signature Yousign en cours d'intégration (WIP). */}
            <button
              type="button"
              className="s1c-wf-btn wf-primary"
              disabled
              title="Envoi pour signature Yousign · en cours d'intégration"
            >
              <IconSend /> Envoyer
            </button>

            {/* Consulter / Signer : le DER ouvre le document réel. */}
            {card.key === "der" ? (
              <button type="button" className="s1c-wf-btn wf-view" onClick={onOpenDer}>
                <IconView /> {card.viewLabel}
              </button>
            ) : (
              <button
                type="button"
                className="s1c-wf-btn wf-view"
                disabled
                title="Aperçu en cours de construction"
              >
                {card.key === "lm" ? <IconSign /> : <IconView />} {card.viewLabel}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Espace d'envoi groupé du pack ─────────────────────────────────────── */

export function EnvoiPack() {
  const [checked, setChecked] = useState<boolean[]>(
    PACK_PIECES.map((p) => p.defaultChecked),
  );
  const selected = checked.filter(Boolean).length;

  return (
    <div className="s1c-envoi-pack">
      <div className="s1c-envoi-head">
        <div className="s1c-envoi-head-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            Envoyer le pack de contractualisation au client
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.65)",
              marginTop: 2,
            }}
          >
            Sélectionnez les pièces · personnalisez l&apos;e-mail · un seul envoi
            groupé à Camille &amp; Yannick
          </div>
        </div>
        <span className="fco-pack-count">{PACK.pieceCount}</span>
      </div>

      <div className="s1c-envoi-body">
        <div className="fco-envoi-section-label">Pièces jointes à inclure</div>

        {PACK_PIECES.map((piece, i) => (
          <label className="s1c-envoi-piece" key={piece.title}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() =>
                setChecked((prev) =>
                  prev.map((v, j) => (j === i ? !v : v)),
                )
              }
            />
            <div className="s1c-envoi-piece-icon" style={PIECE_ICON_STYLE[piece.icon]}>
              <PackPieceIcon tone={piece.icon} />
            </div>
            <div className="s1c-envoi-piece-txt">
              <div className="s1c-envoi-piece-title">{piece.title}</div>
              <div className="s1c-envoi-piece-meta">{piece.meta}</div>
            </div>
            <span className="s1c-envoi-piece-tag" style={PIECE_TAG_STYLE[piece.tagTone]}>
              {piece.tagLabel}
            </span>
          </label>
        ))}

        <div className="fco-envoi-section-label" style={{ margin: "18px 0 10px" }}>
          E-mail d&apos;accompagnement · modifiable
        </div>
        <div className="s1c-envoi-mail">
          <div className="s1c-envoi-mail-header">
            <div>
              <strong>À :</strong> {PACK.mail.to}
            </div>
            <div style={{ marginTop: 3 }}>
              <strong>Objet :</strong> {PACK.mail.subject}
            </div>
          </div>
          <div className="s1c-envoi-mail-body" contentEditable suppressContentEditableWarning>
            <p style={{ margin: "0 0 10px" }}>
              Madame, Monsieur, chère Camille, cher Yannick,
            </p>
            <p style={{ margin: "0 0 10px" }}>
              Faisant suite à notre échange, je vous fais parvenir les éléments
              permettant de contractualiser notre relation. Vous trouverez en
              pièces jointes :
            </p>
            <ul style={{ margin: "0 0 10px", paddingLeft: 20 }}>
              <li>
                le <strong>document d&apos;entrée en relation</strong> (DER) ;
              </li>
              <li>
                votre <strong>document de collecte d&apos;informations complet</strong>{" "}
                ainsi que le <strong>questionnaire de qualification</strong> ;
              </li>
              <li>
                la <strong>lettre de mission</strong> reprenant nos honoraires ;
              </li>
              <li>
                la <strong>facture</strong> adossée à nos honoraires ;
              </li>
              <li>
                et deux éléments supplémentaires pour vous permettre de mesurer le
                livrable : l&apos;<strong>étude patrimoniale témoin</strong> et la{" "}
                <strong>synthèse exécutive témoin</strong> correspondant à
                l&apos;étude que nous produisons dans le cadre d&apos;une
                restitution.
              </li>
            </ul>
            <p style={{ margin: "0 0 10px" }}>
              <strong>La prochaine étape pour vous</strong> consiste à signer
              électroniquement les trois documents contractuels (DER, KYC et
              lettre de mission) et à régler les honoraires. Dès réception, nous
              ouvrirons votre espace sécurisé pour la collecte des pièces et
              lancerons la réalisation de votre étude patrimoniale (délai 5
              semaines).
            </p>
            <p style={{ margin: 0 }}>
              Je reste à votre entière disposition.
              <br />
              Bien à vous,
              <br />
              <strong>Luc THILLIEZ</strong> · Président associé du cabinet PRIVEOS
            </p>
          </div>
        </div>

        <div className="fco-envoi-footer">
          <div className="fco-envoi-footer-note">
            <strong style={{ color: "var(--navy)" }}>
              {selected} pièce{selected > 1 ? "s" : ""} sélectionnée
              {selected > 1 ? "s" : ""}
            </strong>{" "}
            · l&apos;envoi déclenche la signature électronique (Yousign) et la
            demande de règlement · le dossier reste en « Conformité en cours »
            jusqu&apos;à signature + paiement.
          </div>
          <button
            type="button"
            className="s1b-btn-promote navy"
            style={{ whiteSpace: "nowrap" }}
            disabled
            title="Envoi groupé Yousign · en cours d'intégration"
          >
            Envoyer le pack au client
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modale DER : 3 champs éditables + génération PDF réelle ───────────── */

export function DerModalControls() {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <>
      <DocCardsRow onOpenDer={openModal} />
      <DerModal open={open} onClose={closeModal} />
    </>
  );
}

function DerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [edit, setEdit] = useState(false);
  const [personnes, setPersonnes] = useState(DER.fields.personnes);
  const [lieu, setLieu] = useState(DER.fields.lieu);
  const [date, setDate] = useState(DER.fields.date);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const dataUri = await genererDerPdf();
      window.open(dataUri, "_blank", "noopener,noreferrer");
    } finally {
      setGenerating(false);
    }
  }, []);

  const editableField = (
    value: string,
    onChange: (v: string) => void,
    title: string,
  ) =>
    edit ? (
      <input
        className="s1c-der-editable-field fco-der-input"
        value={value}
        title={title}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <span className="s1c-der-editable-field" title={title}>
        {value}
      </span>
    );

  return (
    <div
      className={`s1a-modal-overlay${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="s1a-modal" role="dialog" aria-modal="true" style={{ maxWidth: 920 }}>
        <div className="s1a-modal-header">
          <button className="s1a-modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 L 6 18 M 6 6 L 18 18" />
            </svg>
          </button>
          <div className="s1a-modal-eyebrow">{DER.modalEyebrow}</div>
          <h2 className="s1a-modal-title">
            DER officiel PRIVEOS · <strong>{DER.client}</strong>
          </h2>
          <p className="s1a-modal-sub">{DER.modalSub}</p>
        </div>

        <div className="s1a-modal-body">
          {/* Barre de mode Consulter / Modifier */}
          <div className="s1c-mode-bar fco-mode-bar">
            <span className="s1c-mode-bar-label">Mode</span>
            <button
              type="button"
              className={!edit ? "active" : ""}
              onClick={() => setEdit(false)}
            >
              Consulter
            </button>
            <button
              type="button"
              className={edit ? "active" : ""}
              onClick={() => setEdit(true)}
            >
              Modifier
            </button>
            <span className="fco-mode-bar-meta">
              3 champs modifiables : personnes · lieu · date
            </span>
          </div>

          <div className="s1c-der-page">
            <h2>Document d&apos;Entrée en Relation</h2>
            <div className="der-disclaimer">
              Le Document d&apos;Entrée en Relation (ci-après « DER ») fournit des
              informations essentielles à nos clients et prospects concernant notre
              cabinet de Conseil en Gestion de Patrimoine, nos activités et la
              réglementation applicable à notre métier.{" "}
              <strong>Il ne s&apos;agit pas d&apos;un document promotionnel.</strong>{" "}
              Les informations qu&apos;il contient vous sont fournies conformément à
              une obligation réglementaire.
            </div>

            <div className="der-identity">
              <strong>PRIVEOS</strong> — SAS au capital de 10 000 euros
              <br />
              <strong>Siège social :</strong> 10 avenue Kléber 75116 Paris
              <br />
              <strong>SIREN :</strong> 948 742 903 &nbsp;│&nbsp; <strong>ORIAS :</strong>{" "}
              23004036 — <em>www.orias.fr</em>
            </div>

            <h3>Conseiller en Investissement Financier (CIF)</h3>
            <p>
              Adhérent de l&apos;association professionnelle <strong>ANACOFI-CIF</strong>,
              association agréée par l&apos;Autorité des Marchés Financiers (AMF), 17
              Place de la Bourse — 75082 Paris cedex 02 — <em>www.amf-france.org</em>.
              PRIVEOS s&apos;est engagé à respecter le Code de bonne conduite ANACOFI-CIF.
            </p>
            <p style={{ fontStyle: "italic", color: "var(--navy-300)" }}>
              Cette activité est contrôlée par l&apos;AMF.
            </p>
            <p>
              Le cabinet PRIVEOS ne prend pas actuellement en compte, au niveau de
              l&apos;entité, les principales incidences négatives des décisions
              d&apos;investissement sur les facteurs de durabilité.
            </p>
            <p>
              Notre offre est composée de produits financiers qui ne sont pas
              directement structurés pour intégrer une analyse approfondie des
              incidences négatives sur la durabilité. Toutefois, certains de nos
              produits intègrent des critères ESG via leur classification SFDR
              (Article 8 ou 9).
            </p>

            <h3>Courtier en Assurance (IAS)</h3>
            <p>
              Adhérent de l&apos;<strong>ANACOFI COURTAGE</strong>. Activité contrôlée
              par l&apos;ACPR — Autorité de Contrôle Prudentiel et de Résolution — 4
              place de Budapest, CS 92459 — 75436 Paris cedex 9.
            </p>
            <p>
              PRIVEOS exerce son activité de courtage d&apos;assurance conformément à
              l&apos;article L521-2, II, 1°b) du Code des Assurances.
            </p>
            <p>
              PRIVEOS délivre un conseil basé sur les connaissances et l&apos;expérience
              financière du client ainsi que sa situation financière et ses objectifs
              de souscription. Le Cabinet vérifie que le contrat proposé est cohérent
              avec les exigences et les besoins du client en matière d&apos;assurance
              (conseil niveau 1).
            </p>
            <p style={{ fontStyle: "italic", color: "var(--navy-300)" }}>
              La société ne fournit pas de service de recommandation personnalisé au
              sens de l&apos;article L 522-5 II du Code des assurances et ne remet pas
              d&apos;évaluation périodique du produit sélectionné au regard des
              exigences et besoins du client.
            </p>

            <h3>Courtier en Opérations de Banque et Services de Paiement (IOBSP)</h3>
            <p>
              Adhérent de l&apos;<strong>ANACOFI-COURTAGE</strong>. Activité contrôlée
              par l&apos;ACPR (Autorité de Contrôle Prudentiel et de Résolution) — 4
              place de Budapest, CS 92459 — 75436 Paris cedex 9. Assurance de
              responsabilité civile professionnelle conforme au code monétaire et
              financier.
            </p>
            <p>
              Dans le cadre de son activité d&apos;Intermédiaire en Opérations de
              Banque, PRIVEOS peut percevoir de la part des partenaires bancaires une
              commission ainsi que des honoraires de courtage au titre du mandat de
              recherche de capitaux.
            </p>

            <h3>Assurance Responsabilité Civile Professionnelle</h3>
            <p>
              Votre conseiller dispose, conformément à la loi et aux codes de bonne
              conduite de l&apos;ANACOFI et de l&apos;ANACOFI-CIF, d&apos;une couverture
              en Responsabilité Civile Professionnelle et d&apos;une Garantie
              Financière couvrant ses diverses activités. Ces couvertures sont
              conformes aux exigences du Code monétaire et financier et du Code des
              assurances.
            </p>
            <p>
              <strong>Souscrites auprès de :</strong> Liberty Specialty Markets Europe
              SARL (LSME)
              <br />
              <strong>N° de police :</strong> MRCSFGP202303FR00000000048913A00
            </p>
            <table>
              <tbody>
                <tr>
                  <th style={{ width: "40%" }}>Garantie</th>
                  <th>CIF</th>
                  <th>IAS</th>
                  <th>IOBSP</th>
                </tr>
                <tr>
                  <td>
                    <strong>Responsabilité Civile Professionnelle</strong>
                  </td>
                  <td>600 000 €/an, et par sinistre</td>
                  <td>2 500 000 €/an, et 2 000 000 €/sinistre</td>
                  <td>500 000 €/sinistre, et 800 000 €/an</td>
                </tr>
              </tbody>
            </table>

            <h3>Partenaires</h3>
            <p>
              Le Cabinet s&apos;est engagé à respecter intégralement le Code de Bonne
              Conduite de l&apos;ANACOFI-CIF, disponible au siège de l&apos;association
              ou sur <em>www.anacofi.asso.fr</em> ou sur <em>www.anacofi-cif.fr</em>.
            </p>
            <table>
              <tbody>
                <tr>
                  <th>Partenaire</th>
                  <th>Nature</th>
                  <th>Type d&apos;accord</th>
                  <th>Mode de rémunération</th>
                </tr>
                <tr>
                  <td>
                    <strong>UTMOST</strong>
                  </td>
                  <td>Assureur</td>
                  <td>Convention de courtage</td>
                  <td>Rétrocessions de commissions</td>
                </tr>
                <tr>
                  <td>
                    <strong>VITIS LIFE</strong>
                  </td>
                  <td>Assureur</td>
                  <td>Convention de courtage</td>
                  <td>Rétrocessions de commissions</td>
                </tr>
                <tr>
                  <td>
                    <strong>Banque Internationale à Luxembourg</strong>
                  </td>
                  <td>Banque</td>
                  <td>Convention de courtage</td>
                  <td>Rétrocessions de commissions et honoraires de courtage</td>
                </tr>
                <tr>
                  <td>
                    <strong>SWISSQUOTE</strong>
                  </td>
                  <td>Banque</td>
                  <td>Convention de courtage</td>
                  <td>Rétrocessions de commissions et honoraires de courtage</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontStyle: "italic", color: "var(--navy-300)", fontSize: "9.5px" }}>
              La liste exhaustive des partenaires peut être obtenue par le Client sur
              simple demande.
            </p>

            <h3>Mode de facturation et rémunération</h3>
            <p>
              Dans le cadre de la réalisation d&apos;un Bilan patrimonial complet,
              PRIVEOS est amené à facturer des honoraires au client au titre de la
              réalisation de l&apos;Étude Patrimoniale.
            </p>
            <p>
              Par ailleurs, dans le cas d&apos;un conseil CIF dit non-indépendant, ou
              d&apos;un acte d&apos;intermédiation, d&apos;une solution d&apos;épargne ou
              d&apos;investissement, le conseiller pourra être rémunéré par une fraction
              des frais initialement prélevés par le promoteur du produit et/ou les
              intermédiaires intercalés.
            </p>
            <p>
              Dans le cas d&apos;un conseil en investissement financier fourni de
              manière non-indépendante, votre conseiller peut conserver les
              commissions. Dans ce cadre, le conseiller évalue un éventail large
              d&apos;instruments financiers émis par une entité avec laquelle le
              conseiller entretient des relations étroites pouvant prendre la forme de
              liens capitalistiques, économiques ou contractuels.
            </p>

            <h3>Traitement des Réclamations</h3>
            <p>
              Pour toute réclamation, votre conseiller (ou le service réclamation de
              l&apos;Entreprise) peut être contacté selon les modalités suivantes :
            </p>
            <div className="der-identity" style={{ borderLeftColor: "var(--navy)" }}>
              <strong>Par courrier :</strong> PRIVEOS — 10 avenue Kléber 75116 Paris
              <br />
              <strong>Par e-mail :</strong> contact@priveos.io
            </div>

            <h3>Saisir un Médiateur</h3>
            <table>
              <tbody>
                <tr>
                  <th>Médiateur interne ANACOFI</th>
                  <th>Activités IAS (Assurance)</th>
                  <th>Activités IOBSP</th>
                </tr>
                <tr>
                  <td>
                    <strong>Médiateur compétent litiges avec une entreprise :</strong>
                    <br />
                    <strong>Médiateur de l&apos;ANACOFI</strong>
                    <br />
                    92 rue d&apos;Amsterdam 75009 Paris
                    <br />
                    <em>Litiges entre professionnels</em>
                  </td>
                  <td>
                    <strong>La Médiation de l&apos;Assurance</strong>
                    <br />
                    TSA 50110 75441 Paris Cedex 09
                    <br />
                    <em>www.mediation-assurance.org</em>
                  </td>
                  <td>
                    <strong>ANM Conso</strong>
                    <br />
                    25 Allée Rose Dieng Kuntz 75019 Paris
                    <br />
                    <em>www.anm-conso.com</em>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    <strong>Médiateur compétent litiges avec un consommateur :</strong>{" "}
                    <strong>Médiateur CIF (AMF)</strong> · M. Rémi BOUCHEZ — Médiateur de
                    l&apos;AMF · 17, place de la Bourse — 75082 Paris cedex 02 ·{" "}
                    <em>www.amf-france.org</em> ·{" "}
                    <em>Litiges avec un consommateur — activité CIF</em>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3>Communication</h3>
            <p>
              La communication entre notre cabinet et le client peut avoir lieu selon
              les modalités suivantes :{" "}
              <strong>e-mail, téléphone, visioconférence, rendez-vous physique.</strong>
            </p>

            <h3>Traitement des Données Personnelles</h3>
            <p>
              Les informations recueillies sur ce formulaire sont enregistrées dans un
              fichier informatisé par PRIVEOS pour lui permettre de respecter son
              obligation légale d&apos;information sur ses habilitations. Elles sont
              conservées pendant <strong>trois (3) ans</strong> après l&apos;entrée en
              relation s&apos;il n&apos;y a pas de relation d&apos;affaires et sont
              destinées au cabinet PRIVEOS.
            </p>
            <p>
              Conformément à la loi « informatique et libertés », vous pouvez exercer
              votre droit d&apos;accès, d&apos;opposition, d&apos;effacement, de
              limitation du traitement, de portabilité des données vous concernant et
              les faire rectifier en contactant : <em>contact@priveos.io</em>. Vous
              pouvez également introduire une réclamation auprès de la CNIL.
            </p>

            <div className="der-sig-zone">
              <div className="der-sig-block">
                <div className="der-sig-label">Le Conseiller PRIVEOS</div>
                <div className="der-sig-name">{DER.signConseiller.name}</div>
                <div style={{ fontSize: "9.5px", color: "var(--navy-300)", marginTop: 2 }}>
                  {DER.signConseiller.role}
                </div>
                <div className="der-sig-stamp">{DER.signConseiller.stamp}</div>
                <div style={{ fontSize: "9px", color: "var(--navy-300)", marginTop: 4 }}>
                  {DER.signConseiller.signedNote}
                </div>
              </div>
              <div className="der-sig-block">
                <div className="der-sig-label">
                  Signature{" "}
                  {editableField(
                    personnes,
                    setPersonnes,
                    "Champ modifiable · Le Client (singulier) ou Les Clients (pluriel)",
                  )}
                </div>
                <div style={{ marginTop: 6, fontSize: "10.5px", color: "var(--navy)" }}>
                  Fait à{" "}
                  {editableField(lieu, setLieu, "Champ modifiable · lieu de signature")},
                  le{" "}
                  {editableField(date, setDate, "Champ modifiable · date de signature")}
                </div>
                <div style={{ marginTop: 8, fontSize: "10.5px", color: "var(--navy)" }}>
                  <strong>Mme Camille JOUBERT</strong> &amp;{" "}
                  <strong>M. Yannick BERTHOUX</strong>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    padding: "8px 10px",
                    background: "white",
                    border: "1px dashed var(--navy-100)",
                    borderRadius: 3,
                    fontSize: "9.5px",
                    color: "var(--navy-300)",
                    textAlign: "center",
                  }}
                >
                  Zone signature électronique Yousign · en attente · 2 signatures
                  requises
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="s1a-modal-footer">
          <div className="s1a-modal-footer-info">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>
              Document figé au niveau du cabinet · signature électronique Yousign
              conforme eIDAS UE 910/2014
            </span>
          </div>
          <div className="s1a-modal-footer-actions">
            <button type="button" className="s1a-btn s1a-btn-ghost" onClick={onClose}>
              Fermer
            </button>
            {/* Génération PDF RÉELLE (lib/conformite-pdf.ts). */}
            <button
              type="button"
              className="s1a-btn s1a-btn-primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Génération…" : "Générer le PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
