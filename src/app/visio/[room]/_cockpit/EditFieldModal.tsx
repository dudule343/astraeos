"use client";

// Modale d'édition d'un champ DCI (port de editField + confirmEditField).
import { useEffect, useRef, useState } from "react";

import { useCockpit, useCockpitDispatch } from "./store";
import type { DciGroup, SessionField } from "./types";

function fieldAt(
  groups: DciGroup[],
  groupIdx: number,
  fieldIdx: number,
  itemIdx: number | null,
): SessionField | null {
  const g = groups[groupIdx];
  if (!g) return null;
  if (g.type === "repeatable") {
    if (itemIdx == null) return null;
    return (g.items[itemIdx]?.fields[fieldIdx] as SessionField) ?? null;
  }
  return (g.fields[fieldIdx] as SessionField) ?? null;
}

export function EditFieldModal() {
  const { data, currentSection, editing } = useCockpit();
  const dispatch = useCockpitDispatch();
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const [value, setValue] = useState("");

  const section = data.sections.find((s) => s.id === currentSection);
  const field = editing && section ? fieldAt(section.groups, editing.groupIdx, editing.fieldIdx, editing.itemIdx) : null;

  useEffect(() => {
    if (field) {
      setValue(field.value || "");
      const t = setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current && "select" in inputRef.current) inputRef.current.select();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [field]);

  if (!editing || !section || !field) return null;

  const close = () => dispatch({ type: "closeEdit" });
  const commit = () => {
    dispatch({ type: "commitEdit", ref: editing, value });
    dispatch({ type: "toast", message: `« ${field.label} » mis à jour` });
  };

  const isAiInfo = field.status === "ai-suggest" || field.status === "ai-agree";
  const isDivergence = field.status === "ai-disagree";

  return (
    <div className="v3-modal open" onClick={close}>
      <div className="v3-modal-card" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="v3-modal-header">
          <div className="v3-modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
            </svg>
          </div>
          <div>
            <div className="v3-modal-title">{field.label}</div>
            <div className="v3-modal-sub">
              Section {section.num} · {section.title}
            </div>
          </div>
        </div>
        <div className="v3-modal-body">
          {field.type === "select" && Array.isArray(field.options) ? (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              className="v4-modal-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              {!field.value && <option value="">— Sélectionnez —</option>}
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              className="v4-modal-input"
              value={value}
              placeholder={
                field.type === "date" ? "JJ/MM/AAAA" : field.type === "number" ? "ex. 50 000 €" : ""
              }
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") close();
              }}
            />
          )}
          {isAiInfo && (
            <div className="v4-modal-info" style={{ display: "block" }}>
              <strong>✨ Proposition IA</strong> · confiance {field.conf ?? "—"}%
              {field.note && (
                <>
                  <br />
                  {field.note}
                </>
              )}
            </div>
          )}
          {isDivergence && (
            <div
              className="v4-modal-info"
              style={{
                display: "block",
                background: "rgba(192,57,43,0.08)",
                borderLeftColor: "#C0392B",
                color: "#C0392B",
              }}
            >
              <strong>⚠ Divergence</strong> ·{" "}
              {field.note || "L'IA entend une valeur différente de la vôtre."}
            </div>
          )}
        </div>
        <div className="v3-modal-footer">
          <button className="v3-modal-btn cancel" onClick={close}>
            Annuler
          </button>
          <button className="v3-modal-btn primary" onClick={commit}>
            ✓ Valider la saisie
          </button>
        </div>
      </div>
    </div>
  );
}
