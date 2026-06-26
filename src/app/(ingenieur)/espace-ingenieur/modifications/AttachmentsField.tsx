"use client";

// Champ « Pièces jointes » du formulaire de signalement : sélection de fichiers
// Excel / PDF / Word / PPT / images, avec prévisualisation (vignette image,
// aperçu PDF inline, icône + nom pour les autres). Les fichiers sont tenus en
// mémoire (File[]) puis envoyés après création de la carte (cf. BugReportForm).

import { useEffect, useMemo } from "react";

const ACCEPT = ".pdf,.xls,.xlsx,.csv,.doc,.docx,.ppt,.pptx,.txt,image/*";
const ICONS: Record<string, string> = {
  pdf: "📄",
  xls: "📊",
  xlsx: "📊",
  csv: "📊",
  doc: "📝",
  docx: "📝",
  ppt: "📑",
  pptx: "📑",
  txt: "📄",
};

function fileExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(i + 1).toLowerCase() : "";
}
function fmtSize(b: number): string {
  if (b < 1024) return `${b} o`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`;
  return `${(b / (1024 * 1024)).toFixed(1)} Mo`;
}

export function AttachmentsField({
  files,
  onChange,
}: {
  files: File[];
  onChange: (next: File[]) => void;
}) {
  // URLs d'objet pour la prévisualisation locale (créées à chaque changement de
  // sélection) puis révoquées par l'effet de nettoyage pour éviter les fuites.
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const addFiles = (list: FileList | null) => {
    const arr = Array.from(list ?? []);
    if (arr.length) onChange([...files, ...arr]);
  };
  const removeAt = (idx: number) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="mod-af-drop">
        <input
          type="file"
          accept={ACCEPT}
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        📎 Ajouter une pièce jointe — Excel, PDF, Word, PPT, image (clique pour choisir)
      </label>

      {files.length > 0 && (
        <div className="mod-af-grid">
          {files.map((f, i) => {
            const ext = fileExt(f.name);
            const isImg = f.type?.startsWith("image/");
            const isPdf = ext === "pdf";
            return (
              <div key={`${f.name}-${i}`} className="mod-af-item">
                <button
                  type="button"
                  className="mod-af-x"
                  onClick={() => removeAt(i)}
                  title="Retirer"
                >
                  ×
                </button>
                {isImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="mod-af-img" src={urls[i]} alt={f.name} />
                ) : isPdf ? (
                  <embed className="mod-af-embed" src={urls[i]} type="application/pdf" />
                ) : (
                  <div className="mod-af-icon">{ICONS[ext] || "📎"}</div>
                )}
                <div className="mod-af-name" title={f.name}>
                  {f.name}
                </div>
                <div className="mod-af-foot">
                  <span className="mod-af-size">{fmtSize(f.size)}</span>
                  {urls[i] && (
                    <a
                      className="mod-af-preview"
                      href={urls[i]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Aperçu →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mod-af-note">
        Excel, PDF, Word, PowerPoint, images — 25 Mo max par fichier.
      </div>
    </div>
  );
}
