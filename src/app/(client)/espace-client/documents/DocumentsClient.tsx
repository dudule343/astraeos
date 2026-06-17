"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { uploadClientDocument } from "../../actions";

// -------------------------------------------------------------------------
// Frontière server/client : ce module est "use client". Il importe la server
// action `uploadClientDocument` PAR RÉFÉRENCE (autorisé) et le TYPE
// ClientDocument via `import type` (effacé au build) — jamais une valeur
// runtime du data layer. Toutes les données réelles arrivent en props depuis
// le Server Component parent.
// -------------------------------------------------------------------------

/** Pièces attendues : libellé + document_type ciblé pour le pré-classement. */
export type ExpectedPiece = {
  documentType: string;
  label: string;
  hint: string;
  /** true si au moins un document de ce type est déjà déposé. */
  fulfilled: boolean;
};

type DocumentsClientProps = {
  dossierId: string;
  pieces: ExpectedPiece[];
};

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.heic,.heif,application/pdf,image/jpeg,image/png,image/heic,image/heif";

type FeedKind = "idle" | "uploading" | "ok" | "error";

export function DocumentsClient({ dossierId, pieces }: DocumentsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const [feed, setFeed] = useState<{ kind: FeedKind; msg: string }>({
    kind: "idle",
    msg: "",
  });
  const [docType, setDocType] = useState<string>("autre");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function submitFile(file: File) {
    if (!dossierId) {
      setFeed({ kind: "error", msg: "Aucun dossier actif : impossible de déposer." });
      return;
    }
    setFeed({ kind: "uploading", msg: `Dépôt de « ${file.name} »…` });

    const fd = new FormData();
    fd.set("dossierId", dossierId);
    fd.set("file", file);
    fd.set("documentType", docType);
    fd.set("label", file.name);

    startTransition(async () => {
      const res = await uploadClientDocument(fd);
      if (res.ok) {
        setFeed({ kind: "ok", msg: `« ${file.name} » déposé. En attente de validation.` });
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } else {
        setFeed({ kind: "error", msg: res.error });
      }
    });
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) submitFile(file);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) submitFile(file);
  }

  const busy = isPending || feed.kind === "uploading";

  return (
    <div className="space-y-6">
      {/* Zone de dépôt */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragOver) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-lg border-2 border-dashed p-7 text-center transition-colors ${
          dragOver
            ? "border-[var(--gold)] bg-[var(--gold-100)]"
            : "border-[var(--navy-100)] bg-white"
        }`}
      >
        <div
          className="mb-1 text-[15px] font-semibold text-[var(--navy)]"
          style={{ fontFamily: "var(--serif)" }}
        >
          Déposer une pièce
        </div>
        <p className="mx-auto mb-4 max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
          Glissez votre fichier ici, ou parcourez votre ordinateur. Formats acceptés :
          PDF, JPG, PNG, HEIC — 15 Mo maximum. Vos pièces restent confidentielles et ne
          sont visibles que par votre conseiller.
        </p>

        <div className="mx-auto mb-4 flex max-w-md flex-col gap-2 text-left">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--navy-300)]">
            Nature de la pièce
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            disabled={busy}
            className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[12.5px] text-[var(--navy)] outline-none focus:border-[var(--gold)]"
          >
            {pieces.map((p) => (
              <option key={p.documentType} value={p.documentType}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onPick}
          disabled={busy}
          className="hidden"
          id="client-doc-input"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || !dossierId}
          className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Dépôt en cours…" : "Parcourir mes fichiers"}
        </button>

        {feed.kind !== "idle" && (
          <p
            className={`mt-4 text-[12px] font-medium ${
              feed.kind === "error"
                ? "text-[var(--red-text)]"
                : feed.kind === "ok"
                  ? "text-[var(--green-text)]"
                  : "text-[var(--navy-300)]"
            }`}
            role="status"
            aria-live="polite"
          >
            {feed.msg}
          </p>
        )}
      </div>
    </div>
  );
}
