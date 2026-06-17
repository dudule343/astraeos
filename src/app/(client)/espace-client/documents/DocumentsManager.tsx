"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { uploadClientDocument, deleteClientDocument } from "../../actions";
import type { ClientDocument } from "../../_data/client";

// Frontière server/client : on importe les server actions PAR RÉFÉRENCE et le
// TYPE ClientDocument via import type (effacé au build). Les données réelles
// arrivent en props depuis le Server Component parent. État géré localement
// (optimiste) pour la fluidité, réconcilié par router.refresh().

export type PieceDef = { documentType: string; label: string; hint: string };

const ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.heic,.heif,application/pdf,image/jpeg,image/png,image/heic,image/heif";

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  pending_validation: { label: "En attente de validation", bg: "var(--orange-bg)", text: "var(--orange-text)" },
  validated: { label: "Validé", bg: "var(--green-bg)", text: "var(--green-text)" },
  rejected: { label: "À reprendre", bg: "var(--red-bg)", text: "var(--red-text)" },
  archived: { label: "Archivé", bg: "var(--navy-100)", text: "var(--navy-300)" },
};
function statusMeta(s: string) {
  return STATUS_META[s] ?? { label: s, bg: "var(--navy-100)", text: "var(--navy-300)" };
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}
function fmtFileSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

type FeedKind = "idle" | "uploading" | "ok" | "error";

export function DocumentsManager({
  dossierId,
  initialDocuments,
  pieceDefs,
}: {
  dossierId: string;
  initialDocuments: ClientDocument[];
  pieceDefs: PieceDef[];
}) {
  const router = useRouter();
  const [docs, setDocs] = useState<ClientDocument[]>(initialDocuments);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const [docType, setDocType] = useState<string>("autre");
  const [feed, setFeed] = useState<{ kind: FeedKind; msg: string }>({ kind: "idle", msg: "" });
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Checklist dérivée de l'état courant → se met à jour optimistiquement.
  const { pieces, requiredPieces, providedCount } = useMemo(() => {
    const fulfilled = new Set(docs.map((d) => d.documentType));
    const all = pieceDefs.map((p) => ({
      ...p,
      fulfilled: p.documentType !== "autre" && fulfilled.has(p.documentType),
    }));
    const required = all.filter((p) => p.documentType !== "autre");
    return {
      pieces: all,
      requiredPieces: required,
      providedCount: required.filter((p) => p.fulfilled).length,
    };
  }, [docs, pieceDefs]);

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
    const chosenType = docType;

    startTransition(async () => {
      const res = await uploadClientDocument(fd);
      if (res.ok) {
        // Ajout optimiste immédiat → la pièce apparaît tout de suite.
        setDocs((prev) => [
          {
            id: res.documentId,
            filename: file.name,
            category: "collecte",
            documentType: chosenType,
            status: "pending_validation",
            fileSizeBytes: file.size,
            mimeType: file.type || null,
            storageUrl: "",
            createdAt: new Date().toISOString(),
            signedAt: null,
          },
          ...prev,
        ]);
        setFeed({ kind: "ok", msg: `« ${file.name} » déposé. En attente de validation.` });
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } else {
        setFeed({ kind: "error", msg: res.error });
      }
    });
  }

  function handleDelete(doc: ClientDocument) {
    if (deleting.has(doc.id)) return;
    if (!confirm(`Retirer « ${doc.filename} » ? Cette pièce sera définitivement supprimée.`)) return;

    setDeleting((s) => new Set(s).add(doc.id));
    // Retrait optimiste immédiat.
    const snapshot = docs;
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));

    startTransition(async () => {
      const res = await deleteClientDocument(doc.id);
      setDeleting((s) => {
        const n = new Set(s);
        n.delete(doc.id);
        return n;
      });
      if (res.ok) {
        setFeed({ kind: "ok", msg: `« ${doc.filename} » retiré.` });
        router.refresh();
      } else {
        // Échec : on restaure la pièce et on signale.
        setDocs(snapshot);
        setFeed({ kind: "error", msg: res.error });
      }
    });
  }

  const busy = isPending || feed.kind === "uploading";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Colonne gauche : checklist + dépôt */}
      <div className="space-y-6 lg:col-span-3">
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                Pièces à fournir
              </div>
              <div className="text-[15px] font-semibold text-[var(--navy)]">
                Checklist de votre dossier
              </div>
            </div>
            <div className="text-[12px] font-semibold text-[var(--navy-300)]">
              {providedCount}/{requiredPieces.length} fournies
            </div>
          </div>

          <ul className="divide-y divide-[var(--navy-100)] rounded-lg border border-[var(--navy-100)] bg-white">
            {requiredPieces.map((p) => (
              <li key={p.documentType} className="flex items-start gap-3 px-4 py-3">
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                    p.fulfilled
                      ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                      : "border border-[var(--navy-100)] text-[var(--navy-200)]"
                  }`}
                >
                  {p.fulfilled ? "✓" : ""}
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--navy)]">{p.label}</div>
                  <p className="text-[12px] leading-relaxed text-[var(--navy-300)]">{p.hint}</p>
                </div>
                <span
                  className="ml-auto flex-shrink-0 self-center text-[11px] font-semibold transition-colors"
                  style={{ color: p.fulfilled ? "var(--green-text)" : "var(--navy-300)" }}
                >
                  {p.fulfilled ? "Reçu" : "Attendu"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Zone de dépôt */}
        <section>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!dragOver) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) submitFile(f);
            }}
            className={`rounded-lg border-2 border-dashed p-7 text-center transition-colors ${
              dragOver ? "border-[var(--gold)] bg-[var(--gold-100)]" : "border-[var(--navy-100)] bg-white"
            }`}
          >
            <div className="mb-1 text-[15px] font-semibold text-[var(--navy)]" style={{ fontFamily: "var(--serif)" }}>
              Déposer une pièce
            </div>
            <p className="mx-auto mb-4 max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Glissez votre fichier ici, ou parcourez votre ordinateur. Formats acceptés : PDF, JPG,
              PNG, HEIC — 15 Mo maximum. Vos pièces restent confidentielles et ne sont visibles que
              par votre conseiller.
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
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) submitFile(f);
              }}
              disabled={busy}
              className="hidden"
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
        </section>
      </div>

      {/* Colonne droite : documents déposés + statut + suppression */}
      <div className="lg:col-span-2">
        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
            Documents déposés
          </div>
          <div className="text-[15px] font-semibold text-[var(--navy)]">
            {docs.length > 0 ? `${docs.length} document${docs.length > 1 ? "s" : ""}` : "Aucun document"}
          </div>
        </div>

        {docs.length === 0 ? (
          <div className="rounded-lg border border-[var(--navy-100)] bg-white p-6 text-center">
            <p className="text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Vous n&apos;avez encore déposé aucune pièce. Utilisez la zone de dépôt pour ajouter vos
              documents : ils apparaîtront ici avec leur statut.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => {
              const meta = statusMeta(d.status);
              const isDeleting = deleting.has(d.id);
              return (
                <li
                  key={d.id}
                  className={`rounded-lg border border-[var(--navy-100)] bg-white p-3 transition-opacity ${
                    isDeleting ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[var(--navy)]">
                        {d.filename}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">
                        {fmtDate(d.createdAt)} · {fmtFileSize(d.fileSizeBytes)}
                      </div>
                    </div>
                    <span
                      className="flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em]"
                      style={{ background: meta.bg, color: meta.text }}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(d)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--navy-300)] transition hover:border-[var(--red-text)] hover:text-[var(--red-text)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "Suppression…" : "🗑 Retirer"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
