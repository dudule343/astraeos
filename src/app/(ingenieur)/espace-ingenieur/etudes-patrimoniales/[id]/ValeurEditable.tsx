"use client";

/**
 * Saisie INLINE d'un montant du patrimoine, réutilisable par toutes les
 * sections du document d'audit.
 *
 * Les montants n'existent pas en base : l'ingénieur les saisit par client, et
 * ils sont persistés dans donnees.valeurs (JSONB) via la server action
 * setValeur(etudeId, key, value). L'etudeId n'est pas passé en prop (les
 * sections ne l'ont pas) : il vient du ValeurProvider câblé dans
 * EtudeAuditClient, autour du document.
 *
 * Frontière client/serveur : ce composant n'importe que la server action (RPC)
 * et les helpers purs de formatage. Aucune lecture serveur ici.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { setValeur } from "../actions";
import {
  formatValeur,
  parseMontant,
  valeurBrute,
  type ValeurFormat,
} from "./format-valeur";

// ---------------------------------------------------------------------------
// Contexte etudeId (saisie)
// ---------------------------------------------------------------------------

const ValeurCtx = createContext<{ etudeId: string } | null>(null);

export function ValeurProvider({
  etudeId,
  children,
}: {
  etudeId: string;
  children: ReactNode;
}) {
  return <ValeurCtx.Provider value={{ etudeId }}>{children}</ValeurCtx.Provider>;
}

export function useValeurCtx(): { etudeId: string } {
  const ctx = useContext(ValeurCtx);
  if (!ctx) {
    throw new Error("useValeurCtx doit être utilisé à l'intérieur de <ValeurProvider>.");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

type Brut = number | string | null;

export type ValeurEditableProps = {
  /** clé STABLE dans donnees.valeurs (ex. « patrimoine_brut_total »). */
  vKey: string;
  /** format d'affichage et de parse. */
  format: ValeurFormat;
  /** valeur initiale lue en base (ou null si jamais saisie). */
  initial?: number | string | null;
  /** intitulé pour l'accessibilité (aria-label de l'input). */
  label?: string;
  /** texte affiché à la place de « — » quand la valeur est vide. */
  placeholder?: string;
};

export default function ValeurEditable({
  vKey,
  format,
  initial = null,
  label,
  placeholder,
}: ValeurEditableProps) {
  const { etudeId } = useValeurCtx();

  const [value, setValue] = useState<Brut>(initial ?? null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Une initiale réellement nouvelle (re-render serveur après revalidatePath)
  // doit rafraîchir l'affichage tant qu'on n'édite pas.
  const lastInitial = useRef<Brut>(initial ?? null);
  useEffect(() => {
    const next = initial ?? null;
    if (next !== lastInitial.current) {
      lastInitial.current = next;
      if (!editing) setValue(next);
    }
  }, [initial, editing]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // « commit en cours » : évite qu'un blur déclenché par Enter ne valide deux fois.
  const committing = useRef(false);

  function openEdit() {
    if (saving) return;
    setDraft(valeurBrute(value, format));
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setDraft("");
  }

  async function commit() {
    if (committing.current) return;
    committing.current = true;

    const parsed: number | string | null =
      format === "text" ? (draft.trim() ? draft.trim() : null) : parseMontant(draft);

    const previous = value;
    // Mise à jour optimiste immédiate.
    setValue(parsed);
    setEditing(false);
    setDraft("");

    // Pas de round-trip inutile si rien n'a changé.
    if (parsed === previous) {
      committing.current = false;
      return;
    }

    setSaving(true);
    try {
      const res = await setValeur(etudeId, vKey, parsed);
      if (!res.ok) setValue(previous); // repli silencieux
    } catch {
      setValue(previous);
    } finally {
      setSaving(false);
      committing.current = false;
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="valeur-edit-input"
        type="text"
        inputMode={format === "text" ? "text" : "decimal"}
        value={draft}
        aria-label={label ?? vKey}
        style={INPUT_STYLE}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => void commit()}
      />
    );
  }

  const formatted = formatValeur(value, format);
  const empty = formatted === null;

  return (
    <span
      className={`valeur-edit${empty ? " is-empty" : ""}${saving ? " is-saving" : ""}`}
      role="button"
      tabIndex={0}
      title="Cliquez pour saisir cette valeur"
      aria-label={label ? `${label} : modifier` : "Modifier la valeur"}
      style={{ ...SPAN_STYLE, ...(empty ? EMPTY_STYLE : null), ...(saving ? SAVING_STYLE : null) }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderBottomColor = "var(--gold-deep, #9a7b1e)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderBottomColor = "color-mix(in srgb, currentColor 30%, transparent)";
      }}
      onClick={openEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openEdit();
        }
      }}
    >
      {empty ? placeholder ?? "—" : formatted}
    </span>
  );
}

// Affordance discrète mais visible : soulignement pointillé qui se renforce au
// survol, curseur texte. Sobre, sans casser la charte navy/gold (inline pour ne
// pas dépendre d'une feuille de style propre à ce composant).
const SPAN_STYLE: CSSProperties = {
  cursor: "text",
  borderBottom: "1px dotted color-mix(in srgb, currentColor 30%, transparent)",
  transition: "border-color .15s ease",
  paddingBottom: 1,
  whiteSpace: "nowrap",
};

const EMPTY_STYLE: CSSProperties = {
  color: "var(--navy-200, #9aa3b2)",
  fontStyle: "italic",
};

const SAVING_STYLE: CSSProperties = {
  opacity: 0.55,
};

const INPUT_STYLE: CSSProperties = {
  font: "inherit",
  color: "inherit",
  width: "9ch",
  maxWidth: "16ch",
  padding: "0 2px",
  border: "none",
  borderBottom: "1.5px solid var(--gold-deep, #9a7b1e)",
  background: "color-mix(in srgb, var(--gold-100, #f7efd6) 60%, transparent)",
  outline: "none",
};
