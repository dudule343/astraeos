"use client";

import { useRef, useState } from "react";

import { uploadClientLogo } from "./actions";

/** Upload / remplacement du logo d'un client. */
export function LogoUpload({ clientId, hasLogo }: { clientId: string; hasLogo: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await uploadClientLogo(new FormData(e.currentTarget));
      if (!res.ok) setErr(res.error);
      else formRef.current?.reset();
    } catch {
      setErr("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="file"
        name="file"
        accept="image/*"
        required
        className="text-[11.5px]"
      />
      <input type="hidden" name="clientId" value={clientId} />
      <button
        type="submit"
        disabled={busy}
        className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:opacity-50"
      >
        {busy ? "Envoi…" : hasLogo ? "Remplacer le logo" : "Ajouter un logo"}
      </button>
      {err && <span className="text-[11px] text-[#C0392B]">{err}</span>}
    </form>
  );
}
