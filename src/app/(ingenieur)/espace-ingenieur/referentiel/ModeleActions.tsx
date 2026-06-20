"use client";

import { useState } from "react";

import { getModelePdfBase64, type ModeleType } from "./actions";

function base64ToBlobUrl(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

/**
 * Boutons Aperçu / Télécharger d'un modèle réellement généré (DER, Lettre de
 * mission). Appelle la server action qui produit le PDF via les builders
 * réglementaires, puis ouvre / télécharge le document. Aucune fausse donnée :
 * le PDF est le gabarit vierge PRIVEOS.
 */
export function ModeleActions({ type }: { type: ModeleType }) {
  const [busy, setBusy] = useState<null | "preview" | "download">(null);
  const [error, setError] = useState<string | null>(null);

  async function run(mode: "preview" | "download") {
    setBusy(mode);
    setError(null);
    const res = await getModelePdfBase64(type);
    setBusy(null);
    if (!res.ok) {
      setError(res.reason);
      return;
    }
    const url = base64ToBlobUrl(res.base64);
    if (mode === "preview") {
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
  }

  return (
    <div>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("preview")}
          className="rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:opacity-50"
        >
          {busy === "preview" ? "..." : "Aperçu"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("download")}
          className="rounded-md bg-[var(--gold)] px-2.5 py-1.5 text-[10.5px] font-bold text-white hover:brightness-110 disabled:opacity-50"
        >
          {busy === "download" ? "..." : "Télécharger"}
        </button>
      </div>
      {error && <div className="mt-1.5 text-[10px] text-[var(--red-text)]">{error}</div>}
    </div>
  );
}
