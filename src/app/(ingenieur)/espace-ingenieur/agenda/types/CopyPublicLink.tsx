"use client";

import { useState } from "react";

/** Bouton « Copier » du bandeau lien public (style or sur fond navy). */
export function CopyPublicLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
    } catch {
      // Pas de presse-papier disponible : on ne casse rien.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      className="btn btn-sm types-rdv-public-btn-gold"
      onClick={copy}
    >
      {copied ? "Copié ✓" : "Copier"}
    </button>
  );
}
