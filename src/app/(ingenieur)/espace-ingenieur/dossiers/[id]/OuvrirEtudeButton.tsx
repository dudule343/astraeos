"use client";

import { useCallback, useState, type CSSProperties } from "react";

import { generateEtudePdf } from "./actions";

/**
 * Bouton « Ouvrir l'étude » branché pour de vrai : génère le PDF de l'étude
 * patrimoniale du dossier (Server Action pdf-lib) puis déclenche un vrai
 * téléchargement. Deux variantes visuelles fidèles à la maquette : le bouton
 * doré du hero et la tuile ghost de la grille « Actions disponibles ».
 */
export function OuvrirEtudeButton({
  dossierId,
  label,
  className,
  style,
  busyLabel = "Génération…",
}: {
  dossierId: string;
  label: string;
  className: string;
  style?: CSSProperties;
  busyLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await generateEtudePdf(dossierId);
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
      setBusy(false);
    }
  }, [dossierId]);

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={handleClick}
      disabled={busy}
      title={error ?? "Télécharger l'étude patrimoniale (PDF)"}
    >
      {busy ? busyLabel : error ? "Réessayer" : label}
    </button>
  );
}
