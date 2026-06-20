"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";

import {
  OPEN_NEW_RDV_EVENT,
  type OpenNewRdvDetail,
} from "../../agenda/NewRdvModal";
import { sendProspectDoc } from "./actions";

/**
 * Couche interactive de la fiche prospect (#page-ing-fiche-prospect-aubert).
 *
 * La maquette branche chaque bouton sur un vrai comportement :
 *  - « Relancer le client » / « Renvoyer » / « Envoyer » / « Relancer » →
 *    envoi isolé d'un document (envoyerDocIsole) → ici Server Action réelle
 *    + toast de confirmation,
 *  - « Consulter » (DCI / Qualif) et « Modifier » (KYC) → ouvraient des modales
 *    DCI / Qualif / KYC ; ces documents vivent dans la vraie fiche conformité du
 *    repo, on y navigue (openModalDCI/openModalKYC/openModalQualif),
 *  - « + Planifier un RDV » → ouvre la vraie modale « Nouveau RDV » (créneau
 *    pré-rempli 11h00 · Jeudi 14 mai 2026), branchée sur createRdv,
 *  - « Modifier » (Notes) → édition inline de la note avec sauvegarde,
 *  - « Supprimer » → confirm() puis retour à la liste des prospects.
 *
 * Tout l'état (toast, édition note) vit ici. La coquille reste un Server
 * Component qui lit les données de `_data/fiche-prospect`.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * Contexte partagé : toast + slug, pour que chaque bouton porté reste un
 * composant fin sans re-câbler les handlers un par un.
 * ───────────────────────────────────────────────────────────────────────── */

type FicheCtx = {
  slug: string;
  notifyDoc: (doc: string | null) => void;
};

const Ctx = createContext<FicheCtx | null>(null);

function useFiche(): FicheCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("FicheProspectProvider manquant");
  return ctx;
}

export function FicheProspectProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<string | null>(null);

  const notifyDoc = useCallback(async (doc: string | null) => {
    const res = await sendProspectDoc(slug, doc);
    setToast(res.message);
    window.setTimeout(() => setToast(null), 4500);
  }, [slug]);

  return (
    <Ctx.Provider value={{ slug, notifyDoc }}>
      {children}
      {toast ? (
        <div className="rdv-toast" role="status">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Boutons « relance / envoi » (hero, conditions, action-bar, en-tête docs).
 * ───────────────────────────────────────────────────────────────────────── */

/** « Relancer le client » du hero et de l'action-bar (relance globale). */
export function RelancerButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const { notifyDoc } = useFiche();
  return (
    <button type="button" className={className} onClick={() => notifyDoc(null)}>
      {children}
    </button>
  );
}

/** Bouton « Relancer » de la ligne condition (questionnaire de qualification). */
export function ConditionRelancerButton({ label }: { label: string }) {
  const { notifyDoc } = useFiche();
  return (
    <button
      type="button"
      className="s1b-condition-action"
      onClick={() => notifyDoc("Questionnaire de qualification")}
    >
      {label}
    </button>
  );
}

/** En-tête carte Documents : « + Envoyer un document ». */
export function EnvoyerDocumentButton() {
  const { notifyDoc } = useFiche();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      style={{ fontSize: "10.5px" }}
      onClick={() => notifyDoc("Document complémentaire")}
    >
      + Envoyer un document
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Boutons d'action sur une ligne document.
 * ───────────────────────────────────────────────────────────────────────── */

export type DocActionKind =
  | "consulter"
  | "renvoyer"
  | "envoyer"
  | "modifier"
  | "relancer";

/**
 * Bouton d'action d'une ligne document. « consulter » / « modifier » ouvrent le
 * document réel dans la fiche conformité ; « renvoyer » / « envoyer » /
 * « relancer » déclenchent l'envoi isolé (toast).
 */
export function DocActionButton({
  kind,
  label,
  variant,
  docTitle,
  icon,
}: {
  kind: DocActionKind;
  label: string;
  variant: "view" | "edit" | "primary";
  docTitle: string;
  icon: React.ReactNode;
}) {
  const router = useRouter();
  const { slug, notifyDoc } = useFiche();

  const onClick = () => {
    if (kind === "consulter" || kind === "modifier") {
      // openModalDCI / openModalQualif / openModalKYC de la maquette : le
      // document détaillé vit dans la fiche conformité réelle du dossier.
      const tab =
        docTitle === "DCI Simplifié"
          ? "dci"
          : docTitle === "DCI Complet"
            ? "kyc"
            : "qualif";
      router.push(`/espace-ingenieur/conformite/${slug}?doc=${tab}`);
      return;
    }
    notifyDoc(docTitle);
  };

  return (
    <button
      type="button"
      className={`s1c-wf-btn wf-${variant}`}
      style={{ flex: "none", padding: "6px 12px", fontSize: "10.5px" }}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Carte Rendez-vous : « + Planifier un RDV » → modale Nouveau RDV réelle.
 * ───────────────────────────────────────────────────────────────────────── */

export function PlanifierRdvButton() {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      style={{ fontSize: "10.5px" }}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent<OpenNewRdvDetail>(OPEN_NEW_RDV_EVENT, {
            detail: { heureDebut: "11h00", jour: "Jeudi 14 mai 2026" },
          }),
        )
      }
    >
      + Planifier un RDV
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Carte Notes : « Modifier » → édition inline + sauvegarde.
 * ───────────────────────────────────────────────────────────────────────── */

export function NotesCard({
  meta,
  segments,
  icon,
}: {
  meta: string;
  segments: { text: string; strong?: boolean }[];
  icon: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(segments.map((s) => s.text).join(""));
  const [value, setValue] = useState<{ text: string; strong?: boolean }[]>(segments);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          {icon}
          Notes &amp; contexte ingénieur
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ fontSize: "10.5px" }}
          onClick={() => {
            if (editing) {
              setValue([{ text: draft }]);
              setEditing(false);
            } else {
              setDraft(value.map((s) => s.text).join(""));
              setEditing(true);
            }
          }}
        >
          {editing ? "Enregistrer" : "Modifier"}
        </button>
      </div>
      <div className="card-body fp-card-body">
        <div className="s1b-note">
          <div className="note-meta">{meta}</div>
          {editing ? (
            <textarea
              className="fp-note-textarea"
              rows={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
          ) : (
            value.map((seg, i) =>
              seg.strong ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>,
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Action-bar : « Supprimer » → confirm + retour liste prospects.
 * ───────────────────────────────────────────────────────────────────────── */

export function SupprimerButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="s1b-btn-danger"
      onClick={() => {
        if (confirm("Supprimer définitivement ce dossier prospect ?")) {
          router.push("/espace-ingenieur/prospects");
        }
      }}
    >
      Supprimer
    </button>
  );
}
