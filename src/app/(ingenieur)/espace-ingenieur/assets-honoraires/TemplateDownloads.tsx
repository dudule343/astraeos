"use client";

import { useState } from "react";

import { generateTemplatePdf, type TemplateKind } from "./actions";

const TEMPLATES: { kind: TemplateKind; label: string; desc: string }[] = [
  {
    kind: "der",
    label: "Modèle · DER",
    desc: "Document d'Entrée en Relation à personnaliser par dossier.",
  },
  {
    kind: "lettre_mission",
    label: "Modèle · Lettre de mission",
    desc: "Cadre contractuel de l'étude (objet, honoraires, délais).",
  },
];

/**
 * Téléchargements des MODÈLES réglementaires vierges (DER, Lettre de mission)
 * générés par la vraie chaîne pdf-lib. Pas de données client : modèles à
 * personnaliser. base64 → Blob → téléchargement.
 */
export function TemplateDownloads() {
  const [busy, setBusy] = useState<TemplateKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download(kind: TemplateKind) {
    setBusy(kind);
    setError(null);
    try {
      const res = await generateTemplatePdf(kind);
      if (!res.ok) {
        setError(res.reason);
        return;
      }
      const bytes = Uint8Array.from(atob(res.base64), (ch) => ch.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setError("Téléchargement impossible. Réessayez.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--navy-100)] bg-white p-5">
      <div className="mb-1 text-[15px] font-semibold text-[var(--navy)]">
        Modèles contractuels
      </div>
      <p className="mb-4 text-[12px] leading-relaxed text-[var(--navy-300)]">
        Téléchargez les modèles vierges générés par le cabinet, à personnaliser pour chaque
        étude facturée.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.kind}
            type="button"
            onClick={() => download(t.kind)}
            disabled={busy != null}
            className="flex flex-col items-start gap-1 rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-4 text-left transition hover:border-[var(--gold)] disabled:opacity-60"
          >
            <span className="text-[12.5px] font-semibold text-[var(--navy)]">
              {busy === t.kind ? "Génération…" : t.label}
            </span>
            <span className="text-[11px] leading-snug text-[var(--navy-300)]">{t.desc}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-[11.5px] text-[var(--red-text)]">{error}</p>}
    </div>
  );
}
