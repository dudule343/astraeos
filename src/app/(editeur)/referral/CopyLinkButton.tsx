"use client";

import { useState } from "react";

// Copie presse-papier du lien de parrainage d'exemple. Bloc explicitement
// étiqueté "à concevoir" : on câble une vraie copie plutôt qu'un faux clic.
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
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
    >
      {copied ? "✓ Copié" : "📋 Copier"}
    </button>
  );
}
