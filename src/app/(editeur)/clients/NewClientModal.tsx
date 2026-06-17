"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { createClientFromModalAction } from "../client-new/actions";

const inputClass =
  "w-full rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[12.5px] text-[var(--navy)] focus:border-[var(--gold)] focus:outline-none";
const labelClass =
  "mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white transition-opacity hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "⏳ Création…" : "✓ Activer le client"}
    </button>
  );
}

export function NewClientModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [state, formAction] = useActionState(createClientFromModalAction, null);

  // Ferme la modal automatiquement quand la création réussit
  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      onClose();
    }
  }, [state, onClose, router]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,45,80,0.45)] p-4"
      onClick={onClose}
    >
      <form
        action={formAction}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--navy-100)] bg-[var(--ivory)] px-6 py-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Opérations clients
            </div>
            <div className="text-[18px] font-semibold text-[var(--navy)]">
              Créer un nouveau client
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[18px] text-[var(--navy-300)] hover:bg-[var(--navy-100)]"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          {state?.error && (
            <div className="mb-4 rounded-md border border-[var(--red-text)]/40 bg-[var(--red-bg)] px-4 py-3 text-[12px] text-[var(--red-text)]">
              ⚠ {state.error}
            </div>
          )}

          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
            Identité juridique
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Raison sociale <span className="text-[var(--gold)]">*</span>
              </label>
              <input
                name="raison_sociale"
                className={inputClass}
                defaultValue="Patrimoine Conseil Avignon SAS"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Nom commercial</label>
              <input
                name="nom_commercial"
                className={inputClass}
                defaultValue="Patrimoine Conseil"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>
                SIREN <span className="text-[var(--gold)]">*</span>
              </label>
              <input
                name="siren"
                className={inputClass}
                defaultValue="892 547 318"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Statut juridique</label>
              <select name="statut_juridique" className={inputClass} defaultValue="SAS">
                <option>SAS</option>
                <option>SARL</option>
                <option>SA</option>
                <option>SCP</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>N° ORIAS</label>
              <input name="numero_orias" className={inputClass} defaultValue="24 002 845" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Adresse siège <span className="text-[var(--gold)]">*</span>
              </label>
              <input
                name="adresse_siege"
                className={inputClass}
                defaultValue="42 boulevard Saint-Roch, 84000 Avignon"
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Représentant légal <span className="text-[var(--gold)]">*</span>
              </label>
              <input
                name="representant_legal"
                className={inputClass}
                defaultValue="Marc DELORME"
                required
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Email principal <span className="text-[var(--gold)]">*</span>
              </label>
              <input
                name="email_principal"
                type="email"
                className={inputClass}
                defaultValue="m.delorme@patrimoine-avignon.fr"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input
                name="telephone"
                type="tel"
                className={inputClass}
                defaultValue="04 90 12 34 56"
              />
            </div>
          </div>

          <div className="mt-6 mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
            Configuration plateforme
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Sous-domaine</label>
              <div className="flex items-center gap-1.5">
                <input
                  name="sous_domaine"
                  className={`${inputClass} flex-1`}
                  defaultValue="patrimoine-avignon"
                />
                <span className="text-[12px] text-[var(--navy-300)]">.astraeos.fr</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Mode de facturation</label>
              <select
                name="mode_facturation"
                className={inputClass}
                defaultValue="Mensuel · prélèvement automatique"
              >
                <option>Mensuel · prélèvement automatique</option>
                <option>Mensuel · virement</option>
                <option>Annuel · 1 paiement</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date d&apos;activation</label>
              <input
                name="date_activation"
                type="date"
                className={inputClass}
                defaultValue="2026-05-15"
              />
            </div>
          </div>

          <div className="mt-5 rounded-md bg-[var(--ivory)] px-4 py-3 text-[11.5px] leading-relaxed text-[var(--navy-300)]">
            ℹ️ Pour le wizard complet en 6 étapes (packs, ingénieurs, récapitulatif détaillé),{" "}
            <a href="/client-new" className="font-semibold text-[var(--gold)] hover:underline">
              ouvre la page complète
            </a>
            .
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-[var(--navy-100)] bg-[var(--ivory)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--navy-100)] bg-white px-4 py-2 text-[12.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
          >
            Annuler
          </button>
          <SubmitBtn />
        </div>
      </form>
    </div>
  );
}
