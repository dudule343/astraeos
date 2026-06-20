"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import type { DocumentSigne } from "../../../_data/fiche-client";

/**
 * Boutons d'action d'une ligne « Documents signés & reçus » de la fiche client.
 *
 * Chaque bouton fait une VRAIE action, jamais une coquille :
 *  - Lettre de mission / Document d'entrée en relation → génération + récupération
 *    du PDF réel via /api/conformite/der-pdf (lib/conformite-pdf.ts, pdf-lib),
 *    exactement comme la fiche conformité. « Consulter » ouvre le PDF dans un
 *    onglet, « Télécharger » le sauvegarde.
 *  - Document de collecte / étude livrée → navigation vers l'outil réel du repo
 *    (espace collecte, fiche dossier) où le document se consulte et se récupère.
 *
 * Seule la signature Yousign reste hors périmètre (pas de clé) ; aucun bouton de
 * cette carte n'en dépend, donc rien n'est désactivé ici.
 */

const PDF_LABEL: Record<"der" | "lettre_mission", string> = {
  der: "DER",
  lettre_mission: "Lettre-de-mission",
};

/** Récupère le PDF réel généré côté serveur (mode "open" = onglet, "download" = sauvegarde). */
async function fetchConformitePdf(
  pdf: "der" | "lettre_mission",
  mode: "open" | "download",
) {
  const res = await fetch("/api/conformite/der-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: pdf }),
  });
  if (!res.ok) {
    throw new Error(`Génération PDF échouée (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  if (mode === "open") {
    window.open(url, "_blank", "noopener,noreferrer");
    // L'onglet garde la référence le temps du rendu ; on libère après coup.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = `${PDF_LABEL[pdf]}-ETU-2026-014.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function PdfButton({
  pdf,
  mode,
  variant,
  children,
}: {
  pdf: "der" | "lettre_mission";
  mode: "open" | "download";
  variant: "ghost" | "gold";
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const onClick = useCallback(async () => {
    setBusy(true);
    try {
      await fetchConformitePdf(pdf, mode);
    } finally {
      setBusy(false);
    }
  }, [pdf, mode]);

  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-sm`}
      onClick={onClick}
      disabled={busy}
    >
      {busy ? "Génération…" : children}
    </button>
  );
}

export function DocumentRowActions({ doc }: { doc: DocumentSigne }) {
  if (doc.action.kind === "link") {
    const { href } = doc.action;
    if (doc.primary) {
      return (
        <Link
          href={href}
          className="btn btn-gold btn-sm"
          style={{ textDecoration: "none" }}
        >
          Ouvrir
        </Link>
      );
    }
    return (
      <div className="fc-doc-actions">
        <Link
          href={href}
          className="btn btn-ghost btn-sm"
          style={{ textDecoration: "none" }}
        >
          Consulter
        </Link>
        <Link
          href={href}
          className="btn btn-ghost btn-sm"
          style={{ textDecoration: "none" }}
        >
          Télécharger
        </Link>
      </div>
    );
  }

  // action.kind === "pdf"
  const { pdf } = doc.action;
  if (doc.primary) {
    return (
      <PdfButton pdf={pdf} mode="open" variant="gold">
        Ouvrir
      </PdfButton>
    );
  }
  return (
    <div className="fc-doc-actions">
      <PdfButton pdf={pdf} mode="open" variant="ghost">
        Consulter
      </PdfButton>
      <PdfButton pdf={pdf} mode="download" variant="ghost">
        Télécharger
      </PdfButton>
    </div>
  );
}
