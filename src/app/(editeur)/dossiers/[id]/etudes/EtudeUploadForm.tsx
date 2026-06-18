"use client";

import { useRef, useState } from "react";

import { uploadEtudeDocument } from "./actions";

type Status = { kind: "idle" | "ok" | "err"; msg?: string };

/** Upload d'un livrable d'étude (PDF) → stockage + colonne de l'étude.
 *  Le portail client peut ensuite le télécharger (route signée). */
export function EtudeUploadForm({ dossierId }: { dossierId: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus({ kind: "idle" });
    const fd = new FormData(e.currentTarget);
    fd.set("dossierId", dossierId);
    try {
      const res = await uploadEtudeDocument(fd);
      if (res.ok) {
        setStatus({ kind: "ok", msg: "Livrable enregistré ✓ — disponible côté client." });
        formRef.current?.reset();
      } else {
        setStatus({ kind: "err", msg: res.error ?? "Échec de l'envoi." });
      }
    } catch {
      setStatus({ kind: "err", msg: "Erreur réseau." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-8 rounded-md border border-[var(--navy-100)] bg-white p-4">
      <div className="mb-1 text-[13px] font-bold text-[var(--navy)]">Livrables de l&apos;étude</div>
      <p className="mb-3 text-[12px] leading-relaxed text-[var(--navy-300)]">
        Déposez le PDF de l&apos;étude (complète ou synthèse) : il devient téléchargeable par le
        client depuis son espace de suivi.
      </p>
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[var(--navy)]">Type</label>
          <select
            name="kind"
            className="rounded-md border border-[var(--navy-100)] px-3 py-2 text-[13px]"
          >
            <option value="complete">Étude complète</option>
            <option value="summary">Synthèse</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[var(--navy)]">
            Fichier PDF
          </label>
          <input
            type="file"
            name="file"
            accept="application/pdf,.pdf"
            required
            className="text-[12px]"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Envoi…" : "Déposer le livrable"}
        </button>
        {status.kind !== "idle" && (
          <span
            className={`text-[12px] font-semibold ${
              status.kind === "ok" ? "text-[var(--green-text,#1F5A36)]" : "text-[#C0392B]"
            }`}
          >
            {status.msg}
          </span>
        )}
      </form>
    </section>
  );
}
