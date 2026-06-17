"use client";

// Store du cockpit visio : useReducer + Context (aucune dépendance externe).
// Reproduit fidèlement les mutations du HTML d'origine (validateField,
// rejectField, confirmEditField, setFilter…), mais en immuable pour React.
import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import type {
  DciFilter,
  DciSnapshot,
  EditingRef,
  RecState,
  SessionField,
  SessionSection,
} from "./types";

export type CockpitState = {
  data: DciSnapshot;
  currentSection: string;
  currentFilter: DciFilter;
  recState: RecState;
  editing: EditingRef | null;
};

export type CockpitAction =
  | { type: "applySnapshot"; snapshot: DciSnapshot }
  | { type: "setSection"; id: string }
  | { type: "setFilter"; filter: DciFilter }
  | { type: "openEdit"; ref: EditingRef }
  | { type: "closeEdit" }
  // Saisie manuelle : valeur vide → champ 'empty', sinon 'validated' (note/conf purgées).
  | { type: "commitEdit"; ref: EditingRef; value: string }
  // Accepte la proposition IA telle quelle.
  | { type: "validateField"; ref: EditingRef }
  // Refuse la proposition IA → champ remis à vide.
  | { type: "rejectField"; ref: EditingRef }
  | { type: "setRecState"; recState: RecState };

const EMPTY: DciSnapshot = { sections: [] };

/** Met à jour un champ ciblé par ref, en ne clonant que le chemin touché
 *  (section courante → groupe → [item] → champ). Le reste reste référencé. */
function patchField(
  state: CockpitState,
  ref: EditingRef,
  patch: (f: SessionField) => SessionField,
): DciSnapshot {
  const sections = state.data.sections.map((s): SessionSection => {
    if (s.id !== state.currentSection) return s;
    const groups = s.groups.map((g, gi) => {
      if (gi !== ref.groupIdx) return g;
      if (g.type === "repeatable") {
        if (ref.itemIdx == null) return g;
        const items = g.items.map((it, ii) => {
          if (ii !== ref.itemIdx) return it;
          const fields = it.fields.map((f, fi) =>
            fi === ref.fieldIdx ? patch(f as SessionField) : f,
          );
          return { ...it, fields };
        });
        return { ...g, items };
      }
      // person | block
      const fields = g.fields.map((f, fi) =>
        fi === ref.fieldIdx ? patch(f as SessionField) : f,
      );
      return { ...g, fields };
    });
    return { ...s, groups };
  });
  return { sections };
}

function stripAi(f: SessionField): SessionField {
  const next = { ...f };
  delete next.note;
  delete next.conf;
  return next;
}

function reducer(state: CockpitState, action: CockpitAction): CockpitState {
  switch (action.type) {
    case "applySnapshot": {
      const snap = action.snapshot;
      const stillExists = snap.sections.some((s) => s.id === state.currentSection);
      const currentSection =
        stillExists || snap.sections.length === 0
          ? state.currentSection
          : snap.sections[0].id;
      return { ...state, data: snap, currentSection };
    }
    case "setSection":
      return { ...state, currentSection: action.id };
    case "setFilter":
      return { ...state, currentFilter: action.filter };
    case "openEdit":
      return { ...state, editing: action.ref };
    case "closeEdit":
      return { ...state, editing: null };
    case "commitEdit": {
      const value = action.value.trim();
      const data = patchField(state, action.ref, (f) => {
        const next: SessionField = { ...f, value, status: value ? "validated" : "empty" };
        return value ? stripAi(next) : next;
      });
      return { ...state, data, editing: null };
    }
    case "validateField": {
      const data = patchField(state, action.ref, (f) =>
        stripAi({ ...f, status: "validated" }),
      );
      return { ...state, data };
    }
    case "rejectField": {
      const data = patchField(state, action.ref, (f) =>
        stripAi({ ...f, value: "", status: "empty" }),
      );
      return { ...state, data };
    }
    case "setRecState":
      return { ...state, recState: action.recState };
    default:
      return state;
  }
}

function initialState(initialSection: string): CockpitState {
  return {
    data: EMPTY,
    currentSection: initialSection,
    currentFilter: "all",
    recState: "active",
    editing: null,
  };
}

const StateCtx = createContext<CockpitState | null>(null);
const DispatchCtx = createContext<Dispatch<CockpitAction> | null>(null);

export function CockpitProvider({
  children,
  initialSection = "activite",
}: {
  children: ReactNode;
  initialSection?: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialSection, initialState);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useCockpit(): CockpitState {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error("useCockpit doit être utilisé dans <CockpitProvider>");
  return ctx;
}

export function useCockpitDispatch(): Dispatch<CockpitAction> {
  const ctx = useContext(DispatchCtx);
  if (!ctx) throw new Error("useCockpitDispatch doit être utilisé dans <CockpitProvider>");
  return ctx;
}
