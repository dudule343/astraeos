"use client";

import { useState } from "react";

type Props = {
  link: string;
  /** "btn" = bouton plein style maquette ; "link" = lien texte du KPI */
  variant?: "btn" | "link";
  label?: string;
};

export function CopyLinkButton({ link, variant = "btn", label = "Copier" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
    } catch {
      // Fallback silencieux : pas de presse-papier disponible.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (variant === "link") {
    return (
      <a
        style={{ color: "var(--gold-deep)", fontWeight: 700, cursor: "pointer" }}
        onClick={copy}
      >
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-gold btn-sm"
      style={{ flex: 1, fontSize: "11px" }}
      onClick={copy}
    >
      {copied ? "Copié ✓" : label}
    </button>
  );
}
