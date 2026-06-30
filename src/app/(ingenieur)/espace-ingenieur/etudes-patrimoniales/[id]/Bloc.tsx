"use client";

/**
 * Système de BLOCS du document d'audit — pièce réutilisable + contexte.
 *
 * Chaque portion révisable du document (paragraphe, sous-rubrique, cadre…) est
 * enveloppée dans <Bloc blocKey="…">. Le contexte (fourni par EtudeAuditClient)
 * porte l'état partagé — sélection, édition en cours, validations horodatées,
 * contenu édité, mode de vue — et les gestes (sélectionner, valider, éditer).
 * Le volet de révision et les blocs communiquent ainsi via ce seul contexte.
 *
 * Round-trip réel : la validation et l'édition manuelle passent par les server
 * actions (etude_blocs). L'état initial vient des props (table etude_blocs).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from "react";

import { formatHeureValidation } from "./etude-audit-structure";

export type ViewMode = "ing" | "client" | "pdf" | "word";

/** Valeur du contexte partagée entre EtudeAuditClient, le volet et les blocs. */
export type BlocContextValue = {
  mode: "bloc" | "glob";
  view: ViewMode;
  selectedKey: string | null;
  editingKey: string | null;
  isValidated: (key: string) => boolean;
  validatedAt: (key: string) => string | null;
  editedContent: (key: string) => string | null;
  /** sélectionne un bloc (clic) — ignoré hors mode bloc / hors vue ingénieur. */
  selectBloc: (key: string) => void;
  /** retire la validation d'un bloc (clic sur le tampon). */
  unvalidateBloc: (key: string) => void;
  /** enregistre/retire l'élément DOM du bloc (registre des blocs connus). */
  attachEl: (key: string, el: HTMLElement | null) => void;
};

const BlocContext = createContext<BlocContextValue | null>(null);

export function BlocProvider({
  value,
  children,
}: {
  value: BlocContextValue;
  children: ReactNode;
}) {
  return <BlocContext.Provider value={value}>{children}</BlocContext.Provider>;
}

export function useBlocContext(): BlocContextValue {
  const ctx = useContext(BlocContext);
  if (!ctx) {
    throw new Error("useBlocContext doit être utilisé à l'intérieur de <BlocProvider>.");
  }
  return ctx;
}

export type BlocProps = {
  /** clé exacte du bloc (= valeur data-block) — identifiant en base etude_blocs. */
  blocKey: string;
  /** balise du wrapper (div par défaut ; p, section, …). */
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

/**
 * Enveloppe un fragment révisable du document. Rend l'élément avec son
 * data-block, gère les états « sélectionné » / « en édition » et affiche le
 * tampon « Validé HH:MM » quand le bloc est validé.
 */
export function Bloc({ blocKey, as, className, children }: BlocProps) {
  const ctx = useBlocContext();
  const Tag = (as ?? "div") as ElementType;

  const selected = ctx.selectedKey === blocKey;
  const editing = ctx.editingKey === blocKey;
  const validated = ctx.isValidated(blocKey);
  const edited = ctx.editedContent(blocKey);

  const elRef = useRef<HTMLElement | null>(null);
  // attachEl est stable côté parent (useCallback []), donc setRef l'est aussi :
  // la ref ne se détache/rattache pas inutilement à chaque rendu.
  const attach = ctx.attachEl;
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      elRef.current = el;
      attach(blocKey, el);
    },
    [blocKey, attach],
  );

  // À l'entrée en édition, placer le curseur en fin de bloc.
  useEffect(() => {
    if (!editing) return;
    const el = elRef.current;
    if (!el || typeof document === "undefined") return;
    el.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch {
      /* placement du curseur best-effort */
    }
  }, [editing]);

  const cls =
    ["", className, selected ? "sel" : "", editing ? "editing" : ""]
      .filter(Boolean)
      .join(" ")
      .trim() || undefined;

  function handleClick(e: MouseEvent) {
    if (ctx.editingKey) return;
    const target = e.target as HTMLElement;
    if (target.closest("a,button,input,select,textarea,[data-go]")) return;
    e.stopPropagation();
    ctx.selectBloc(blocKey);
  }

  function handleUnvalidate(e: MouseEvent) {
    e.stopPropagation();
    ctx.unvalidateBloc(blocKey);
  }

  return (
    // La clé change avec l'état d'édition : changer de clé remonte l'élément et
    // purge les mutations faites en contenteditable lors d'une annulation.
    <Tag
      key={editing ? "edit" : "view"}
      ref={setRef}
      data-block={blocKey}
      className={cls}
      contentEditable={editing}
      suppressContentEditableWarning
      onClick={handleClick}
    >
      {edited != null ? edited : children}
      {validated && !editing ? (
        <span
          className="validated-badge"
          contentEditable={false}
          role="button"
          tabIndex={0}
          title="Retirer la validation"
          onClick={handleUnvalidate}
        >
          <CheckIcon /> Validé {formatHeureValidation(ctx.validatedAt(blocKey))}
        </span>
      ) : null}
    </Tag>
  );
}
