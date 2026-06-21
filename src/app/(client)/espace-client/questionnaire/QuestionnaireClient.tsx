"use client";

import { useMemo, useState, useTransition } from "react";

import { saveDciCategory, saveRiskProfile } from "@/app/(client)/actions";
import type { DciCategoryKey, DciStatus } from "@/app/(client)/_data/client";
import Questionnaire, {
  type RiskAnswers,
} from "@/app/parcours/qualification/Questionnaire";
import {
  PHASES,
  type CategorySchema,
  type Field,
  type PhaseSchema,
} from "./schema";

// =========================================================================
// Questionnaire DCI — sous-composant interactif ("use client").
//
// Reçoit TOUTES ses données en props depuis le Server Component (page.tsx) :
// jamais d'accès direct au data layer / à l'auth ici. L'enregistrement passe
// par la server action saveDciCategory(dossierId, categoryKey, payload).
//
// Frontière server/client respectée : seuls des `import type` traversent depuis
// le data layer ; la seule valeur runtime importée est la server action, qui est
// une référence sérialisable côté React.
// =========================================================================

type CategoryData = {
  responses: Record<string, unknown>;
  completionPct: number;
};

export type QuestionnaireClientProps = {
  dossierId: string;
  status: DciStatus;
  /** Nom du client, pour rattacher le profil de risque (saveRiskProfile). */
  displayName: string;
  /** Pré-remplissage par catégorie (responses brutes + complétion calculée). */
  byCategory: Record<string, CategoryData>;
  simplifiedCompletedAt: string | null;
  fullValidatedAt: string | null;
  signedAt: string | null;
};

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

/** Une réponse compte comme renseignée si non vide. */
function isFilled(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return true;
  return false;
}

function catCompletion(cat: CategorySchema, responses: Record<string, unknown>): number {
  const fields = cat.blocks.flatMap((b) => b.fields);
  if (fields.length === 0) return 0;
  const filled = fields.filter((f) => isFilled(responses[f.name])).length;
  return Math.round((filled / fields.length) * 100);
}

export default function QuestionnaireClient(props: QuestionnaireClientProps) {
  const [activePhase, setActivePhase] = useState<PhaseSchema["key"]>("simple");

  const phase = PHASES.find((p) => p.key === activePhase) ?? PHASES[0];

  // Complétion globale réelle, dérivée des réponses pré-remplies.
  const overallPct = useMemo(() => {
    const cats = PHASES.flatMap((p) => p.categories);
    if (cats.length === 0) return 0;
    const sum = cats.reduce((acc, c) => {
      const data = props.byCategory[c.key];
      return acc + catCompletion(c, data?.responses ?? {});
    }, 0);
    return Math.round(sum / cats.length);
  }, [props.byCategory]);

  return (
    <div>
      <ProgressBar pct={overallPct} status={props.status} />

      <PhaseTabs active={activePhase} onChange={setActivePhase} byCategory={props.byCategory} />

      <div className="mb-3 text-center">
        <p className="text-[13px] italic text-[var(--navy-300)]">{phase.tagline}</p>
      </div>

      <div className="space-y-4">
        {phase.categories.map((cat) => (
          <CategoryCard
            key={cat.key}
            dossierId={props.dossierId}
            category={cat}
            initialResponses={props.byCategory[cat.key]?.responses ?? {}}
          />
        ))}
      </div>

      {/* À la suite du DCI : le questionnaire de risque (profil investisseur),
          rattaché au dossier via saveRiskProfile. */}
      <div style={{ marginTop: 36, borderTop: "1px solid #E7E1D5", paddingTop: 28 }}>
        <div className="mb-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gold-deep,#C68E0E)]">
            Étape suivante
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cinzel, serif)",
              fontSize: 22,
              color: "var(--navy, #102D50)",
              margin: "4px 0",
            }}
          >
            Questionnaire de risque
          </h2>
          <p className="text-[13px] italic text-[var(--navy-300)]">
            Pour finaliser votre profil d&apos;investisseur.
          </p>
        </div>
        <div className="maq-qualification">
          <Questionnaire
            onSubmitAnswers={async (answers: RiskAnswers) => {
              await saveRiskProfile(
                props.dossierId,
                props.displayName,
                answers as unknown as Record<string, unknown>,
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Barre de progression réelle
// ---------------------------------------------------------------------------

function ProgressBar({ pct, status }: { pct: number; status: DciStatus }) {
  const statusLabel: Record<DciStatus, string> = {
    draft: "Brouillon",
    simplified_completed: "Simplifié complété",
    full_in_progress: "Complet en cours",
    full_validated: "Validé",
    signed: "Signé",
  };

  return (
    <div className="mb-8 rounded-[14px] border border-[var(--ivory-deep)] bg-white px-7 py-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--navy-300)]">
          Avancement du questionnaire
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
          {pct}% · {statusLabel[status]}
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--ivory-deep)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-300)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglets de phase
// ---------------------------------------------------------------------------

function PhaseTabs({
  active,
  onChange,
  byCategory,
}: {
  active: PhaseSchema["key"];
  onChange: (k: PhaseSchema["key"]) => void;
  byCategory: Record<string, CategoryData>;
}) {
  return (
    <div className="mb-6 flex flex-wrap justify-center gap-2 border-b border-[var(--ivory-deep)]">
      {PHASES.map((p) => {
        const isActive = p.key === active;
        const cats = p.categories;
        const phasePct =
          cats.length === 0
            ? 0
            : Math.round(
                cats.reduce((acc, c) => acc + catCompletion(c, byCategory[c.key]?.responses ?? {}), 0) /
                  cats.length,
              );
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onChange(p.key)}
            className={`group relative flex items-center gap-2.5 px-4 pb-3 pt-2 text-[13px] font-semibold transition-colors ${
              isActive ? "text-[var(--navy)]" : "text-[var(--navy-300)] hover:text-[var(--navy)]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                isActive
                  ? "border-[var(--gold)] bg-[var(--gold-100)] text-[var(--gold-deep)]"
                  : "border-[var(--navy-100)] text-[var(--navy-300)]"
              }`}
            >
              {p.pill}
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span>{p.label}</span>
              <span className="text-[10px] font-normal text-[var(--navy-300)]">{phasePct}% renseigné</span>
            </span>
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[var(--gold)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carte de catégorie (accordéon + formulaire + save)
// ---------------------------------------------------------------------------

function CategoryCard({
  dossierId,
  category,
  initialResponses,
}: {
  dossierId: string;
  category: CategorySchema;
  initialResponses: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() => normalize(initialResponses, category));
  const [dirty, setDirty] = useState(false);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  const pct = useMemo(() => catCompletion(category, values), [category, values]);
  const filled = pct > 0;

  function setField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
    setSave({ kind: "idle" });
  }

  function handleSave() {
    setSave({ kind: "saving" });
    startTransition(async () => {
      const payload = buildPayload(values, category);
      const res = await saveDciCategory(dossierId, category.key as DciCategoryKey, payload);
      if (res.ok) {
        setSave({ kind: "saved" });
        setDirty(false);
      } else {
        setSave({ kind: "error", message: res.error });
      }
    });
  }

  return (
    <div
      className={`overflow-hidden rounded-[14px] border bg-white transition-colors ${
        open ? "border-[var(--gold-200)]" : "border-[var(--ivory-deep)] hover:border-[var(--navy-100)]"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-7 py-5 text-left"
      >
        <span
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${
            filled
              ? "border-[var(--gold-200)] bg-[var(--gold-100)] text-[var(--gold-deep)]"
              : "border-[var(--navy-100)] bg-[var(--ivory)] text-[var(--navy-300)]"
          }`}
          aria-hidden
        >
          <CheckIcon filled={filled} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-[19px] font-semibold leading-tight text-[var(--navy)]">
            {category.title}
          </span>
          <span className="block text-[12.5px] italic text-[var(--navy-300)]">{category.eyebrow}</span>
        </span>
        <span
          className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
            filled ? "bg-[var(--green-bg)] text-[var(--green-text)]" : "bg-[var(--ivory)] text-[var(--navy-300)]"
          }`}
        >
          {filled ? `${pct}% rempli` : "À compléter"}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="border-t border-[var(--ivory-deep)] px-7 pb-7 pt-6">
          <p className="mb-6 text-[13.5px] leading-relaxed text-[var(--navy-300)]">{category.subtitle}</p>

          <div className="space-y-5">
            {category.blocks.map((block) => (
              <div key={block.numeral} className="rounded-[12px] border border-[var(--ivory-deep)] bg-[var(--ivory)] px-6 py-6">
                <div className="mb-5 flex items-start gap-3.5 border-b border-[var(--ivory-deep)] pb-4">
                  <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[var(--gold)] bg-white font-serif text-[13px] font-bold text-[var(--gold)]">
                    {block.numeral}
                  </span>
                  <span>
                    <span className="block font-serif text-[20px] font-semibold leading-tight text-[var(--navy)]">
                      {block.title}
                    </span>
                    {block.subtitle && (
                      <span className="block text-[12.5px] italic text-[var(--navy-300)]">{block.subtitle}</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-6">
                  {block.fields.map((field) => (
                    <FieldControl
                      key={field.name}
                      field={field}
                      value={values[field.name] ?? ""}
                      onChange={(v) => setField(field.name, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <SaveIndicator state={save} dirty={dirty} pending={pending} />
            <button
              type="button"
              onClick={handleSave}
              disabled={pending || !dirty}
              className="inline-flex items-center gap-2 rounded-[9px] bg-[var(--navy)] px-7 py-3 text-[11.5px] font-bold uppercase tracking-[0.18em] text-[var(--ivory)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--navy)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "Enregistrement…" : "Enregistrer cette rubrique"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contrôles de champ
// ---------------------------------------------------------------------------

function spanClass(span: Field["span"]): string {
  switch (span) {
    case "third":
      return "sm:col-span-2";
    case "half":
      return "sm:col-span-3";
    default:
      return "sm:col-span-6";
  }
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  const labelEl = (
    <label className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--navy)]">
      {field.label}
      {field.required && <span className="text-[var(--gold)]">*</span>}
      {!field.required && (
        <span className="ml-1 text-[10px] font-normal normal-case italic tracking-normal text-[var(--navy-300)]">
          facultatif
        </span>
      )}
    </label>
  );

  const inputBase =
    "w-full rounded-[9px] border border-[var(--navy-100)] bg-white px-4 py-3 text-[14px] text-[var(--navy)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-100)]";

  if (field.type === "choice") {
    return (
      <div className={spanClass("full")}>
        {labelEl}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(field.options ?? []).map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(selected ? "" : opt.value)}
                className={`rounded-[12px] border px-4 py-5 text-center transition ${
                  selected
                    ? "border-[var(--gold)] bg-[var(--gold-100)] shadow-[0_0_0_1px_var(--gold)]"
                    : "border-[var(--navy-100)] bg-white hover:border-[var(--gold)]"
                }`}
              >
                <span className="block font-serif text-[15px] font-semibold text-[var(--navy)]">{opt.label}</span>
                {opt.desc && <span className="mt-1 block text-[11.5px] italic text-[var(--navy-300)]">{opt.desc}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "yesno") {
    return (
      <div className={spanClass("full")}>
        {labelEl}
        <div className="inline-flex gap-0.5 rounded-[9px] border border-[var(--navy-100)] bg-white p-1">
          {[
            { v: "oui", l: "Oui" },
            { v: "non", l: "Non" },
          ].map((o) => {
            const selected = value === o.v;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => onChange(selected ? "" : o.v)}
                className={`rounded-[6px] px-6 py-2 text-[13px] font-semibold transition ${
                  selected ? "bg-[var(--navy)] text-[var(--ivory)]" : "text-[var(--navy-300)] hover:bg-[var(--ivory)]"
                }`}
              >
                {o.l}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={spanClass(field.span)}>
        {labelEl}
        <select className={`${inputBase} cursor-pointer appearance-none`} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Sélectionner —</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={spanClass("full")}>
        {labelEl}
        <textarea
          rows={4}
          className={`${inputBase} resize-y`}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // text | number | date
  return (
    <div className={spanClass(field.span)}>
      {labelEl}
      <div className="relative">
        <input
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          className={`${inputBase} ${field.unit ? "pr-12" : ""}`}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {field.unit && (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[13px] font-semibold text-[var(--navy-300)]">
            {field.unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Indicateur d'enregistrement
// ---------------------------------------------------------------------------

function SaveIndicator({ state, dirty, pending }: { state: SaveState; dirty: boolean; pending: boolean }) {
  if (pending || state.kind === "saving") {
    return <span className="text-[12px] italic text-[var(--navy-300)]">Enregistrement en cours…</span>;
  }
  if (state.kind === "error") {
    return <span className="text-[12px] font-semibold text-[var(--red-text)]">{state.message}</span>;
  }
  if (state.kind === "saved" && !dirty) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--green-text)]">
        <CheckIcon filled small />
        Réponses enregistrées
      </span>
    );
  }
  if (dirty) {
    return <span className="text-[12px] italic text-[var(--navy-300)]">Modifications non enregistrées</span>;
  }
  return <span className="text-[12px] italic text-[var(--navy-300)]">À jour</span>;
}

// ---------------------------------------------------------------------------
// Icônes (inline, pas de dépendance)
// ---------------------------------------------------------------------------

function CheckIcon({ filled, small }: { filled?: boolean; small?: boolean }) {
  const s = small ? 13 : 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {filled ? <polyline points="4 12 10 18 20 6" /> : <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />}
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--gold)"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-shrink-0 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sérialisation des réponses
// ---------------------------------------------------------------------------

/** Convertit les réponses JSONB pré-remplies en valeurs de formulaire (string). */
function normalize(responses: Record<string, unknown>, cat: CategorySchema): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of cat.blocks.flatMap((b) => b.fields)) {
    const v = responses[field.name];
    out[field.name] = v == null ? "" : String(v);
  }
  return out;
}

/**
 * Construit le payload JSONB à persister : nombres pour les champs numériques,
 * strings sinon ; champs vides omis pour ne pas gonfler le stockage.
 */
function buildPayload(values: Record<string, string>, cat: CategorySchema): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of cat.blocks.flatMap((b) => b.fields)) {
    const raw = (values[field.name] ?? "").trim();
    if (raw === "") continue;
    if (field.type === "number") {
      const n = Number(raw.replace(/\s/g, "").replace(",", "."));
      payload[field.name] = Number.isFinite(n) ? n : raw;
    } else {
      payload[field.name] = raw;
    }
  }
  return payload;
}
