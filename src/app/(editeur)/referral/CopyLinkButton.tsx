"use client";

import { useState } from "react";

// Bouton « Copier » du lien de parrainage (maquette ligne 2409). On câble une
// vraie copie presse-papier plutôt qu'un clic mort, tout en conservant le
// markup verbatim de la maquette (btn btn-ghost btn-sm + icône #i-copy).
export function CopyLinkButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className="btn btn-ghost btn-sm"
      style={{ marginLeft: "auto" }}
      onClick={handleCopy}
    >
      <svg>
        <use href="#i-copy" />
      </svg>
      {copied ? "Copié" : "Copier"}
    </button>
  );
}
