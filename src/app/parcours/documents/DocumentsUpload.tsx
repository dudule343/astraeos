"use client";

// Zone de dépôt publique des pièces justificatives du prospect.
// Lit ?prospect=<slug>&name=<nom> dans l'URL (porté par le lien e-mail),
// liste les fichiers choisis (input multiple + glisser-déposer), puis POST
// via le server action uploadProspectDocument en FormData.

import { useCallback, useMemo, useRef, useState } from "react";

import { uploadProspectDocument } from "./actions";

const PIECES_UTILES = [
  { label: "Pièce d'identité", hint: "CNI ou passeport en cours de validité, recto-verso" },
  { label: "Justificatif de domicile", hint: "De moins de 3 mois (facture, quittance, avis)" },
  { label: "Relevé d'identité bancaire (RIB)", hint: "Au format PDF de préférence" },
  { label: "Dernier avis d'imposition", hint: "Toutes les pages" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { prospectSlug, displayName } = useMemo(() => {
    if (typeof window === "undefined") return { prospectSlug: "", displayName: "" };
    const params = new URLSearchParams(window.location.search);
    return {
      prospectSlug: params.get("prospect") || "",
      displayName: params.get("name") || "",
    };
  }, []);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => f.size > 0);
    if (list.length === 0) return;
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}:${f.size}`));
      const merged = [...prev];
      for (const f of list) {
        const key = `${f.name}:${f.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(f);
        }
      }
      return merged;
    });
    setError(null);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const onSubmit = useCallback(async () => {
    if (files.length === 0) {
      setError("Sélectionnez au moins un fichier à déposer.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    const res = await uploadProspectDocument(prospectSlug, fd);
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(res.error || "Le dépôt a échoué. Réessayez.");
    }
  }, [files, prospectSlug]);

  if (done) {
    return (
      <div style={S.page}>
        <div style={S.shell}>
          <div style={S.brand}>
            <span style={S.brandMark}>A</span>
            <span style={S.brandText}>ASTRAEOS</span>
          </div>
          <div style={S.card}>
            <div style={S.successMark}>✓</div>
            <h1 style={S.title}>Documents déposés</h1>
            <p style={S.lead}>
              Merci{displayName ? `, ${displayName}` : ""}. Vos pièces nous sont bien
              parvenues. Votre ingénieur patrimonial les retrouvera directement dans
              votre dossier pour préparer votre entretien.
            </p>
            <p style={S.note}>Vous pouvez fermer cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.shell}>
        <div style={S.brand}>
          <span style={S.brandMark}>A</span>
          <span style={S.brandText}>ASTRAEOS</span>
        </div>

        <div style={S.card}>
          <p style={S.kicker}>Dépôt de pièces</p>
          <h1 style={S.title}>Déposer mes documents</h1>
          <p style={S.lead}>
            {displayName ? `Bonjour ${displayName}, ` : ""}
            ajoutez ci-dessous les pièces justificatives nécessaires à la préparation
            de votre dossier. Vos fichiers sont transmis de façon confidentielle.
          </p>

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{ ...S.dropzone, ...(dragOver ? S.dropzoneActive : null) }}
          >
            <div style={S.dropIcon}>⬆</div>
            <p style={S.dropTitle}>Glissez vos fichiers ici</p>
            <p style={S.dropHint}>ou cliquez pour parcourir · PDF, JPG, PNG, HEIC · 15 Mo max</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,application/pdf,image/jpeg,image/png,image/heic,image/heif"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {files.length > 0 && (
            <ul style={S.fileList}>
              {files.map((f, i) => (
                <li key={`${f.name}:${f.size}:${i}`} style={S.fileRow}>
                  <span style={S.fileName}>{f.name}</span>
                  <span style={S.fileSize}>{formatSize(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    style={S.fileRemove}
                    aria-label={`Retirer ${f.name}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <p style={S.error}>{error}</p>}

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || files.length === 0}
            style={{
              ...S.submit,
              ...(submitting || files.length === 0 ? S.submitDisabled : null),
            }}
          >
            {submitting ? "Dépôt en cours…" : "Déposer mes documents"}
          </button>

          <div style={S.helpBox}>
            <p style={S.helpTitle}>Pièces utiles à fournir</p>
            <ul style={S.helpList}>
              {PIECES_UTILES.map((p) => (
                <li key={p.label} style={S.helpItem}>
                  <span style={S.helpLabel}>{p.label}</span>
                  <span style={S.helpHint}>{p.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const NAVY = "#102D50";
const GOLD = "#C68E0E";
const IVORY = "#FAF8F3";
const LINE = "#E8E3D6";
const TEXT = "#1F2937";
const TEXT_SOFT = "#4A5568";
const TEXT_MUTED = "#6B7689";

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: IVORY,
    color: TEXT,
    fontFamily:
      "'Epilogue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: 1.6,
    WebkitFontSmoothing: "antialiased",
    padding: "32px 20px",
  },
  shell: { maxWidth: 640, margin: "0 auto" },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    marginBottom: 24,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: NAVY,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Cinzel', 'Georgia', serif",
    fontWeight: 600,
  },
  brandText: {
    fontFamily: "'Cinzel', 'Georgia', serif",
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.22em",
    color: NAVY,
  },
  card: {
    background: "#FFFFFE",
    border: `1px solid ${LINE}`,
    borderRadius: 16,
    padding: "36px 32px",
    boxShadow: "0 8px 32px rgba(16, 45, 80, 0.06)",
  },
  kicker: {
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: GOLD,
    fontWeight: 700,
    marginBottom: 10,
  },
  title: {
    fontFamily: "'Cinzel', 'Georgia', serif",
    fontSize: 26,
    fontWeight: 600,
    color: NAVY,
    marginBottom: 12,
  },
  lead: { fontSize: 15, color: TEXT_SOFT, marginBottom: 24 },
  dropzone: {
    border: `2px dashed ${LINE}`,
    borderRadius: 14,
    padding: "36px 24px",
    textAlign: "center",
    cursor: "pointer",
    background: IVORY,
    transition: "border-color 0.2s, background 0.2s",
  },
  dropzoneActive: { borderColor: GOLD, background: "#F8EFDA" },
  dropIcon: { fontSize: 28, color: GOLD, marginBottom: 8 },
  dropTitle: { fontSize: 15, fontWeight: 600, color: NAVY },
  dropHint: { fontSize: 12.5, color: TEXT_MUTED, marginTop: 4 },
  fileList: {
    listStyle: "none",
    margin: "20px 0 0",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    border: `1px solid ${LINE}`,
    borderRadius: 10,
    background: "#fff",
  },
  fileName: {
    flex: 1,
    fontSize: 13.5,
    color: TEXT,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: { fontSize: 12, color: TEXT_MUTED, flexShrink: 0 },
  fileRemove: {
    border: "none",
    background: "transparent",
    color: TEXT_MUTED,
    cursor: "pointer",
    fontSize: 13,
    lineHeight: 1,
    padding: 4,
  },
  error: {
    marginTop: 16,
    color: "#D9534F",
    fontSize: 13.5,
    background: "#FBEAEA",
    border: "1px solid #F2C9C7",
    borderRadius: 8,
    padding: "10px 14px",
  },
  submit: {
    marginTop: 24,
    width: "100%",
    padding: "15px 24px",
    border: "none",
    borderRadius: 10,
    background: NAVY,
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "0.02em",
    cursor: "pointer",
  },
  submitDisabled: { opacity: 0.5, cursor: "not-allowed" },
  helpBox: {
    marginTop: 28,
    paddingTop: 22,
    borderTop: `1px solid ${LINE}`,
  },
  helpTitle: {
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: TEXT_MUTED,
    fontWeight: 700,
    marginBottom: 14,
  },
  helpList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  helpItem: { display: "flex", flexDirection: "column", gap: 2 },
  helpLabel: { fontSize: 14, fontWeight: 600, color: NAVY },
  helpHint: { fontSize: 12.5, color: TEXT_MUTED },
  successMark: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#E7F5EC",
    color: "#2EA85A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    margin: "0 auto 18px",
  },
  note: { fontSize: 13.5, color: TEXT_MUTED, marginTop: 12 },
};
