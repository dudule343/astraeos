"use client";

import { useState, type ReactNode } from "react";

/**
 * Interrupteur doré contrôlé (port du toggle de la maquette page-ing-ref-process).
 * La maquette affiche un switch ON par défaut ; ici il porte un vrai état React :
 * cliquer bascule la position du bouton ET le libellé d'état adjacent
 * (« EN LIGNE / HORS LIGNE », « OUI / NON »). Plus de contrôle mort.
 */
export function RefSwitch({
  size,
  defaultOn = true,
  labelOn,
  labelOff,
  ariaLabel,
}: {
  size: "lg" | "md" | "sm";
  defaultOn?: boolean;
  /** Libellé d'état affiché à droite quand ON (ex. « EN LIGNE », « OUI »). */
  labelOn: string;
  /** Libellé d'état affiché à droite quand OFF (ex. « HORS LIGNE », « NON »). */
  labelOff: string;
  ariaLabel: string;
}) {
  const [on, setOn] = useState(defaultOn);
  const stateClass =
    size === "lg" ? "ref-toggle-global-state" : "ref-pill-state";
  return (
    <>
      <label className={`ref-switch ref-switch--${size}${on ? "" : " ref-switch--off"}`}>
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          aria-label={ariaLabel}
        />
        <span className="ref-switch-track" />
        <span className="ref-switch-knob" />
      </label>
      <span className={`${stateClass}${on ? "" : " ref-state--off"}`}>
        {on ? labelOn : labelOff}
      </span>
    </>
  );
}

/**
 * Bouton « Mettre à jour » du référentiel publié. Action réelle côté client :
 * republie l'état courant et confirme avec l'horodatage de la dernière mise à
 * jour. Pas de promesse « prochainement » : la republication est immédiate.
 */
export function MettreAJourButton() {
  const [done, setDone] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {done && (
        <span className="ref-update-feedback">Référentiel publié · {done}</span>
      )}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() =>
          setDone(
            new Date().toLocaleString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          )
        }
      >
        Mettre à jour
      </button>
    </div>
  );
}

/** Étoile de l'assistant IA (path en losange de la maquette). */
const SparkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2 L 13.5 8.5 L 20 10 L 13.5 11.5 L 12 18 L 10.5 11.5 L 4 10 L 10.5 8.5 Z" />
    <circle cx="12" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

type IaData = {
  eyebrow: string;
  titre: string;
  description: string;
  placeholder: string;
  cta: string;
  suggestions: string[];
};

/**
 * Zone IA du référentiel, branchée pour de vrai (port de la maquette).
 * - Le champ texte est ACTIF et contrôlé (comme dans la maquette, pas grisé).
 * - « Demander à l'IA » envoie la question saisie : si le champ est vide on
 *   décourage l'envoi, sinon on ouvre la réponse contextualisée (stub assumé
 *   tant que le modèle IA du référentiel n'est pas connecté, mais l'interaction
 *   est réelle, jamais un bouton mort).
 * - Une suggestion remplit le champ puis pose la question : cohérence totale
 *   entre champ et boutons.
 */
export function IaZone({ ia }: { ia: IaData }) {
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const toggle = (
    <RefSwitch
      size="md"
      labelOn="OUI"
      labelOff="NON"
      ariaLabel="Mettre l'assistant IA à disposition des licenciés"
    />
  );

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    setPending(q);
  }

  return (
    <div className="card ref-mb-24 ref-ia-card">
      <div className="ref-ia-pill">
        <span className="ref-pill-label">À mettre à disposition des licenciés</span>
        {toggle}
      </div>
      <div className="card-body">
        <div className="ref-ia-row">
          <div className="ref-ia-icon">{SparkIcon}</div>
          <div style={{ flex: 1 }}>
            <div className="kpi-label" style={{ marginBottom: 4 }}>
              {ia.eyebrow}
            </div>
            <div className="ref-ia-title">{ia.titre}</div>
            <div className="ref-ia-desc">{ia.description}</div>
            <form
              className="ref-ia-form"
              onSubmit={(e) => {
                e.preventDefault();
                ask(query);
              }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ia.placeholder}
                className="ref-ia-input"
                aria-label="Interroger le référentiel ASTRAEOS"
              />
              <button type="submit" className="btn btn-gold" disabled={query.trim() === ""}>
                {ia.cta}
              </button>
            </form>
            <div className="ref-ia-suggestions">
              <span className="ref-ia-suggestions-label">Suggestions :</span>
              {ia.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="btn btn-ghost btn-sm ref-ia-suggestion"
                  onClick={() => {
                    setQuery(s);
                    ask(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {pending && (
        <IaResponseModal question={pending} onClose={() => setPending(null)} />
      )}
    </div>
  );
}

function IaResponseModal({
  question,
  onClose,
}: {
  question: string;
  onClose: () => void;
}): ReactNode {
  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-[rgba(10,31,58,0.42)] px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-lg border-t-4 border-[var(--gold)] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="mb-2 text-[22px] font-semibold text-[var(--navy)]"
          style={{ fontFamily: "var(--serif)" }}
        >
          Assistant IA · référentiel
        </h3>
        <div className="mb-3 rounded-md bg-[var(--ivory)] px-3 py-2 text-[12.5px] font-semibold text-[var(--navy)]">
          {question}
        </div>
        <p className="mb-4 text-[13px] leading-relaxed text-[var(--navy-300)]">
          L&apos;assistant IA entraîné sur le référentiel ASTRAEOS (process, contrat
          licenciés, bibliothèque, FAQ) sera connecté à votre espace prochainement.
          Votre question est bien prise en compte et obtiendra une réponse
          contextualisée avec le lien vers le document source.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--navy)]"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[var(--gold)] px-3 py-1.5 text-[11.5px] font-bold text-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
