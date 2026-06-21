"use client";

import { useState, useTransition } from "react";

import {
  type FicheClientEditable,
  type Personne,
  type PersonneEditable,
  type RegimeField,
  ACQUISITION_ORIGIN_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  HOUSEHOLD_TYPE_OPTIONS,
  MARITAL_REGIME_OPTIONS,
} from "../../../_data/fiche-client";
import { updateFicheClient } from "./actions";

/**
 * Couche interactive de la fiche client : identité du foyer + personnes.
 *
 * N'importe QUE le module pur `fiche-client` (types + libellés d'enums + helpers)
 * et la Server Action `updateFicheClient`. Aucun import serveur ici.
 *
 * Mode lecture par défaut : rendu identique au visuel d'origine. Bouton
 * « Modifier » → les blocs « Personnes » et « Régime de l'union » passent en
 * champs éditables (inputs / select enums / dates) ; « Enregistrer » persiste
 * via la Server Action ; « Annuler » restaure les valeurs serveur.
 *
 * Quand `editable` est null (fiche modèle de repli), aucun bouton Modifier :
 * rendu strictement lecture seule.
 */

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--navy)",
  border: "1px solid var(--border, #e2e5ec)",
  borderRadius: "6px",
  padding: "5px 8px",
  background: "#fff",
  fontFamily: "inherit",
};

function IconTeam() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M14 16.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" />
    </svg>
  );
}

function IconRing() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

function PersonneCardRead({ p }: { p: Personne }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <IconTeam />
          {p.name}
        </div>
        <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
          {p.kycBadge}
        </span>
      </div>
      <div className="card-body fc-identite-body">
        <div className="fc-identite-grid">
          {p.rows.map((r) => (
            <FragmentRow key={r.label}>
              <span>{r.label}</span>
              <strong>{r.value}</strong>
            </FragmentRow>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <FragmentRow>
      <span>{label}</span>
      <div>{children}</div>
    </FragmentRow>
  );
}

function PersonneCardEdit({
  person,
  onChange,
}: {
  person: PersonneEditable;
  onChange: (patch: Partial<PersonneEditable>) => void;
}) {
  const title = `${person.first_name} ${person.last_name}`.trim() || "Personne";
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <IconTeam />
          {title}
        </div>
        <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
          {person.role_in_household === "person_a" ? "Personne A" : "Personne B"}
        </span>
      </div>
      <div className="card-body fc-identite-body">
        <div className="fc-identite-grid">
          <EditRow label="Prénom">
            <input
              style={INPUT_STYLE}
              value={person.first_name}
              onChange={(e) => onChange({ first_name: e.target.value })}
            />
          </EditRow>
          <EditRow label="Nom">
            <input
              style={INPUT_STYLE}
              value={person.last_name}
              onChange={(e) => onChange({ last_name: e.target.value })}
            />
          </EditRow>
          <EditRow label="Nom de naissance">
            <input
              style={INPUT_STYLE}
              value={person.birth_name ?? ""}
              onChange={(e) => onChange({ birth_name: e.target.value })}
            />
          </EditRow>
          <EditRow label="Date de naissance">
            <input
              type="date"
              style={INPUT_STYLE}
              value={person.birth_date ?? ""}
              onChange={(e) => onChange({ birth_date: e.target.value || null })}
            />
          </EditRow>
          <EditRow label="Nationalité">
            <input
              style={INPUT_STYLE}
              value={person.nationality ?? ""}
              onChange={(e) => onChange({ nationality: e.target.value })}
            />
          </EditRow>
          <EditRow label="Profession">
            <input
              style={INPUT_STYLE}
              value={person.profession ?? ""}
              onChange={(e) => onChange({ profession: e.target.value })}
            />
          </EditRow>
          <EditRow label="Employeur">
            <input
              style={INPUT_STYLE}
              value={person.employer ?? ""}
              onChange={(e) => onChange({ employer: e.target.value })}
            />
          </EditRow>
          <EditRow label="Statut professionnel">
            <select
              style={INPUT_STYLE}
              value={person.employment_status ?? ""}
              onChange={(e) => onChange({ employment_status: e.target.value || null })}
            >
              <option value="">—</option>
              {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </EditRow>
          <EditRow label="TMI estimée (%)">
            <input
              type="number"
              step="0.01"
              style={INPUT_STYLE}
              value={person.tmi_estimated ?? ""}
              onChange={(e) =>
                onChange({ tmi_estimated: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </EditRow>
          <EditRow label="E-mail">
            <input
              type="email"
              style={INPUT_STYLE}
              value={person.email ?? ""}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </EditRow>
          <EditRow label="Téléphone">
            <input
              style={INPUT_STYLE}
              value={person.phone ?? ""}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </EditRow>
        </div>
      </div>
    </div>
  );
}

function RegimeCardRead({
  regimeFields,
  action,
}: {
  regimeFields: RegimeField[];
  action: React.ReactNode;
}) {
  return (
    <div className="card mb-18 fc-regime-card">
      <div className="card-header">
        <div className="card-title">
          <IconRing />
          Régime de l&apos;union · cadre juridique
        </div>
        {action}
      </div>
      <div className="card-body fc-regime-body">
        <div className="fc-regime-grid">
          {regimeFields.map((f) => (
            <div key={f.label}>
              <div className="fc-regime-label">{f.label}</div>
              <div className={`fc-regime-value${f.gold ? " gold" : ""}`}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegimeCardEdit({
  foyer,
  onChange,
  action,
}: {
  foyer: FicheClientEditable["foyer"];
  onChange: (patch: Partial<FicheClientEditable["foyer"]>) => void;
  action: React.ReactNode;
}) {
  return (
    <div className="card mb-18 fc-regime-card">
      <div className="card-header">
        <div className="card-title">
          <IconRing />
          Régime de l&apos;union · cadre juridique
        </div>
        {action}
      </div>
      <div className="card-body fc-regime-body">
        <div className="fc-regime-grid">
          <div>
            <div className="fc-regime-label">Type de foyer</div>
            <select
              style={INPUT_STYLE}
              value={foyer.household_type}
              onChange={(e) => onChange({ household_type: e.target.value })}
            >
              {HOUSEHOLD_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="fc-regime-label">Régime matrimonial</div>
            <select
              style={INPUT_STYLE}
              value={foyer.marital_regime ?? ""}
              onChange={(e) => onChange({ marital_regime: e.target.value || null })}
            >
              <option value="">—</option>
              {MARITAL_REGIME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="fc-regime-label">Date du mariage</div>
            <input
              type="date"
              style={INPUT_STYLE}
              value={foyer.marriage_date ?? ""}
              onChange={(e) => onChange({ marriage_date: e.target.value || null })}
            />
          </div>
          <div>
            <div className="fc-regime-label">Origine d&apos;acquisition</div>
            <select
              style={INPUT_STYLE}
              value={foyer.acquisition_origin ?? ""}
              onChange={(e) => onChange({ acquisition_origin: e.target.value || null })}
            >
              <option value="">—</option>
              {ACQUISITION_ORIGIN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <div className="fc-regime-label">Adresse du foyer</div>
            <input
              style={INPUT_STYLE}
              value={foyer.household_address ?? ""}
              onChange={(e) => onChange({ household_address: e.target.value })}
            />
          </div>
          <div>
            <div className="fc-regime-label">Enfants</div>
            <input
              type="number"
              min={0}
              style={INPUT_STYLE}
              value={foyer.nb_children}
              onChange={(e) => onChange({ nb_children: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <div className="fc-regime-label">Personnes à charge</div>
            <input
              type="number"
              min={0}
              style={INPUT_STYLE}
              value={foyer.nb_dependents}
              onChange={(e) => onChange({ nb_dependents: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <div className="fc-regime-label">Résidence fiscale</div>
            <input
              style={INPUT_STYLE}
              value={foyer.tax_residency ?? ""}
              onChange={(e) => onChange({ tax_residency: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FicheClientInteractive({
  personnes,
  regimeFields,
  editable,
}: {
  personnes: Personne[];
  regimeFields: RegimeField[];
  editable: FicheClientEditable | null;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  // Brouillon d'édition (cloné des données serveur ; restauré sur Annuler).
  const [draftFoyer, setDraftFoyer] = useState(() => editable?.foyer ?? null);
  const [draftPersonnes, setDraftPersonnes] = useState<PersonneEditable[]>(
    () => editable?.personnes ?? [],
  );

  function startEdit() {
    if (!editable) return;
    setDraftFoyer({ ...editable.foyer });
    setDraftPersonnes(editable.personnes.map((p) => ({ ...p })));
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function save() {
    if (!editable || !draftFoyer) return;
    startTransition(async () => {
      const res = await updateFicheClient({
        clientId: editable.clientId,
        foyer: draftFoyer,
        personnes: draftPersonnes,
      });
      setToast(res.message);
      window.setTimeout(() => setToast(null), 4500);
      if (res.ok) setEditing(false);
    });
  }

  function patchPersonne(role: "person_a" | "person_b", patch: Partial<PersonneEditable>) {
    setDraftPersonnes((prev) =>
      prev.map((p) => (p.role_in_household === role ? { ...p, ...patch } : p)),
    );
  }

  // Bouton Modifier / Enregistrer + Annuler, posé dans l'en-tête « Régime ».
  const actionButton = !editable ? null : editing ? (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={cancelEdit}
        disabled={pending}
      >
        Annuler
      </button>
      <button
        type="button"
        className="btn btn-gold btn-sm"
        onClick={save}
        disabled={pending}
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  ) : (
    <button type="button" className="btn btn-ghost btn-sm" onClick={startEdit}>
      Modifier
    </button>
  );

  return (
    <>
      {/* Identités du couple */}
      <div className="fc-grid-2">
        {editing && draftFoyer
          ? draftPersonnes.map((p) => (
              <PersonneCardEdit
                key={p.role_in_household}
                person={p}
                onChange={(patch) => patchPersonne(p.role_in_household, patch)}
              />
            ))
          : personnes.map((p) => <PersonneCardRead key={p.name} p={p} />)}
      </div>

      {/* Régime de l'union · cadre juridique */}
      {editing && draftFoyer ? (
        <RegimeCardEdit
          foyer={draftFoyer}
          onChange={(patch) => setDraftFoyer((prev) => (prev ? { ...prev, ...patch } : prev))}
          action={actionButton}
        />
      ) : (
        <RegimeCardRead regimeFields={regimeFields} action={actionButton} />
      )}

      {toast ? (
        <div className="rdv-toast" role="status">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      ) : null}
    </>
  );
}

/** Wrapper neutre : ses enfants restent des cellules directes de la grille. */
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
