"use client";

import { useState } from "react";

import { getRefAssetBase64, type RefAssetType } from "./actions";

function base64ToBlobUrl(base64: string, mime: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Hook commun : génère la ressource via la server action puis l'ouvre (aperçu)
 * ou la télécharge. Toute ressource du référentiel passe par là — aucun bouton
 * mort.
 */
function useRefAsset() {
  const [busy, setBusy] = useState<null | "preview" | "download">(null);
  const [error, setError] = useState<string | null>(null);

  async function run(type: RefAssetType, mode: "preview" | "download") {
    setBusy(mode);
    setError(null);
    const res = await getRefAssetBase64(type);
    setBusy(null);
    if (!res.ok) {
      setError(res.reason);
      return;
    }
    const url = base64ToBlobUrl(res.base64, res.mime);
    if (mode === "preview") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      triggerDownload(url, res.filename);
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return { busy, error, run };
}

/**
 * Boutons Aperçu / Télécharger d'un modèle de la bibliothèque documentaire
 * (DER, lettre de mission, manuel, KYC, questionnaire, étude, dossier, contrat).
 * Style btn-ghost / btn-gold de la maquette.
 */
export function ModeleActions({ type }: { type: RefAssetType }) {
  const { busy, error, run } = useRefAsset();
  return (
    <div className="ref-modele-actions">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={busy !== null}
        onClick={() => run(type, "preview")}
      >
        {busy === "preview" ? "..." : "Aperçu"}
      </button>
      <button
        type="button"
        className="btn btn-gold btn-sm"
        disabled={busy !== null}
        onClick={() => run(type, "download")}
      >
        {busy === "download" ? "..." : "Télécharger"}
      </button>
      {error && <div className="ref-modele-error">{error}</div>}
    </div>
  );
}

/**
 * Lien doré « Voir → » / « v3.1 → » d'une ligne de liste (sections du Manuel,
 * items du Contrat-cadre). Rendu comme du texte mais cliquable : ouvre l'aperçu
 * du PDF réel associé. Remplace l'ancien <span> mort de la maquette.
 */
export function RefListLink({ type, label }: { type: RefAssetType; label: string }) {
  const { busy, error, run } = useRefAsset();
  return (
    <button
      type="button"
      className="ref-list-link ref-list-link--btn"
      disabled={busy !== null}
      onClick={() => run(type, "preview")}
      title={error ?? undefined}
      aria-label={`Aperçu : ${label}`}
    >
      {busy === "preview" ? "..." : label}
    </button>
  );
}

/**
 * Bouton « Aperçu » seul (carte Manuel / Contrat), ouvre le PDF dans un onglet.
 */
export function ApercuButton({ type, className }: { type: RefAssetType; className?: string }) {
  const { busy, error, run } = useRefAsset();
  return (
    <>
      <button
        type="button"
        className={className ?? "btn btn-ghost btn-sm"}
        disabled={busy !== null}
        onClick={() => run(type, "preview")}
      >
        {busy === "preview" ? "..." : "Aperçu"}
      </button>
      {error && <span className="ref-modele-error">{error}</span>}
    </>
  );
}

/**
 * Bouton « Télécharger » seul (carte Manuel, cartes communication), déclenche
 * le téléchargement du fichier réel.
 */
export function TelechargerButton({
  type,
  className,
  label = "Télécharger",
}: {
  type: RefAssetType;
  className?: string;
  label?: string;
}) {
  const { busy, error, run } = useRefAsset();
  return (
    <>
      <button
        type="button"
        className={className ?? "btn btn-gold btn-sm"}
        disabled={busy !== null}
        onClick={() => run(type, "download")}
      >
        {busy === "download" ? "..." : label}
      </button>
      {error && <span className="ref-modele-error">{error}</span>}
    </>
  );
}
