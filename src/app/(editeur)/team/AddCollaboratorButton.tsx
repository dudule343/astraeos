"use client";

import { useState } from "react";

import { addCollaborator, type AddCollaboratorResult } from "./actions";

const ROLES: { value: string; label: string }[] = [
  { value: "engineer", label: "Ingénieur patrimonial" },
  { value: "compliance", label: "Conformité" },
  { value: "editor", label: "Éditeur" },
  { value: "cabinet_director", label: "Directeur de cabinet" },
];

export function AddCollaboratorButton() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AddCollaboratorResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await addCollaborator(new FormData(e.currentTarget));
      setResult(res);
    } catch {
      setResult({ ok: false, error: "Erreur réseau." });
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    setResult(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
      >
        ＋ Nouveau collaborateur
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-[16px] font-bold text-[var(--navy)]">Nouveau collaborateur</div>

            {result?.ok ? (
              <div>
                <p className="mb-3 rounded-md bg-[var(--green-bg,#e6f4ec)] px-3 py-2 text-[13px] text-[var(--green-text,#1F5A36)]">
                  ✓ Collaborateur créé. Transmettez-lui ces identifiants (à changer à la 1re connexion) :
                </p>
                <div className="mb-4 rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] px-3 py-2 font-mono text-[12.5px] text-[var(--navy)]">
                  <div>e-mail : {result.email}</div>
                  <div>mot de passe : {result.tempPassword}</div>
                </div>
                <button
                  onClick={close}
                  className="w-full rounded-md bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="first_name"
                    required
                    placeholder="Prénom"
                    className="rounded-md border border-[var(--navy-100)] px-3 py-2 text-[13px]"
                  />
                  <input
                    name="last_name"
                    required
                    placeholder="Nom"
                    className="rounded-md border border-[var(--navy-100)] px-3 py-2 text-[13px]"
                  />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="email@cabinet.fr"
                  className="rounded-md border border-[var(--navy-100)] px-3 py-2 text-[13px]"
                />
                <select
                  name="role"
                  defaultValue="engineer"
                  className="rounded-md border border-[var(--navy-100)] px-3 py-2 text-[13px]"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {result && !result.ok && (
                  <p className="text-[12px] text-[#C0392B]">{result.error}</p>
                )}
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 rounded-md border border-[var(--navy-100)] px-4 py-2.5 text-[13px] font-semibold text-[var(--navy-300)]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 rounded-md bg-[var(--gold)] px-4 py-2.5 text-[13px] font-bold text-white hover:brightness-110 disabled:opacity-50"
                  >
                    {busy ? "Création…" : "Créer le collaborateur"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
