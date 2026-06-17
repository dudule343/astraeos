"use client";

// Ligne champ DCI (port de renderField). JSX → valeurs auto-échappées, plus de
// concaténation HTML ni d'escDci manuel.
import { useCockpit, useCockpitDispatch } from "./store";
import type { EditingRef, SessionField } from "./types";

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CrossIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function DciField({
  field,
  groupIdx,
  fieldIdx,
  itemIdx = null,
}: {
  field: SessionField;
  groupIdx: number;
  fieldIdx: number;
  itemIdx?: number | null;
}) {
  const dispatch = useCockpitDispatch();
  const { currentFilter } = useCockpit();
  const ref: EditingRef = { groupIdx, fieldIdx, itemIdx };

  // v9 · surlignage (au lieu de masquer) : le champ au statut filtré ressort,
  // les autres sont atténués. Filtre « all » → aucune classe.
  const filterClass =
    currentFilter === "all"
      ? ""
      : field.status === currentFilter
        ? " v9-highlighted"
        : " v9-dimmed";

  const valDisplay = field.value || "—";
  const valClass = !field.value || field.status === "empty" ? "v6-value empty" : "v6-value";
  const isAI =
    field.status === "ai-suggest" || field.status === "ai-disagree" || field.status === "ai-agree";
  const isEmpty = field.status === "empty";
  const isProposal = field.status === "ai-suggest" || field.status === "ai-disagree";

  const openEdit = () => dispatch({ type: "openEdit", ref });

  return (
    <div className={`v6-field${field.live ? " live" : ""}${filterClass}`} data-status={field.status}>
      <div className="v6-field-label">{field.label}</div>
      <div className="v6-field-value-wrap">
        <div className="v6-field-value-row">
          <div className={valClass} onClick={openEdit}>
            {valDisplay}
          </div>
          {field.status === "ai-suggest" && (
            <span className="v6-badge ai-suggest" title={`Proposition IA · confiance ${field.conf ?? "—"}%`}>
              ✨ Proposition IA{field.conf ? ` · ${field.conf}%` : ""}
            </span>
          )}
          {field.status === "ai-agree" && (
            <span className="v6-badge ai-agree" title={`IA confirme · confiance ${field.conf ?? "—"}%`}>
              ✓✨ IA confirme{field.conf ? ` · ${field.conf}%` : ""}
            </span>
          )}
          {field.status === "ai-disagree" && (
            <span className="v6-badge ai-disagree" title={field.note || "Divergence IA / ingénieur"}>
              ⚠ Divergence IA
            </span>
          )}
        </div>
        {field.note && isAI && <div className="v6-field-note">{field.note}</div>}
      </div>
      <div className="v6-field-actions">
        {isEmpty && (
          <button className="v6-btn-fill" onClick={openEdit}>
            Renseigner
          </button>
        )}
        {isProposal && (
          <button
            className="v6-btn-validate"
            onClick={() => dispatch({ type: "validateField", ref })}
            title="Valider la proposition de l'IA"
          >
            <CheckIcon />
          </button>
        )}
        {isProposal && (
          <button
            className="v6-btn-reject"
            onClick={() => dispatch({ type: "rejectField", ref })}
            title="Refuser la proposition IA"
          >
            <CrossIcon />
          </button>
        )}
        <button className="v6-btn-modify" onClick={openEdit} title="Modifier">
          <PencilIcon />
        </button>
      </div>
    </div>
  );
}
