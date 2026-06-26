"use client";

// Zone de dépôt de captures pour le formulaire de signalement.
// Trois façons d'ajouter une capture, pensées pour des non-techniciens :
//   1. glisser-déposer un fichier image
//   2. coller (Cmd+V) une capture du presse-papier (Cmd+Ctrl+Maj+4 sur Mac)
//   3. cliquer pour choisir un fichier
// On réduit l'image côté navigateur (canvas -> JPEG) pour rester sous la limite
// serverless (une capture Retina plein écran dépasse sinon), puis on l'envoie via
// la server action uploadBugScreenshot qui renvoie les URLs publiques stockées.

import { useEffect, useRef, useState } from "react";

import { uploadBugScreenshot } from "@/lib/bug-reports-actions";

async function downscaleToJpeg(blob: Blob, maxDim = 2000, quality = 0.85): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const out = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", quality),
    );
    return out ?? blob;
  } catch {
    return blob;
  }
}

export function ScreenshotDropzone({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange: (next: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | File[] | null | undefined) => {
    const imgs = Array.from(fileList ?? []).filter((f) => f && f.type?.startsWith("image/"));
    if (imgs.length === 0) return;
    setError(null);
    setBusy(true);
    const collected: string[] = [];
    for (const f of imgs) {
      try {
        const small = await downscaleToJpeg(f);
        const name = (f.name || "capture").replace(/\.[^.]+$/, "") + ".jpg";
        const fd = new FormData();
        fd.append("files", new File([small], name, { type: "image/jpeg" }));
        const res = await uploadBugScreenshot(fd);
        if (res.ok && res.urls) collected.push(...res.urls);
        else if (res.error) setError(res.error);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Échec de l'envoi");
      }
    }
    if (collected.length) onChange([...value, ...collected]);
    setBusy(false);
  };

  // Coller (Cmd+V) une capture : on écoute au niveau document tant que la zone
  // est montée. Si le presse-papier contient une image, on l'ajoute.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const it of items) {
        if (it.type?.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        handleFiles(files);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div className="mod-dz">
      <div
        role="button"
        tabIndex={0}
        className={`mod-dz-zone${hover ? " hover" : ""}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          handleFiles(e.dataTransfer?.files);
        }}
      >
        {busy ? (
          "Envoi de la capture…"
        ) : (
          <>
            <div className="mod-dz-icon">📸</div>
            Glisse une capture ici, <b>colle-la (Cmd+V)</b>, ou clique pour choisir
            <div className="mod-dz-tip">
              Astuce : Cmd + Ctrl + Maj + 4 capture une zone dans le presse-papier, puis
              Cmd + V ici.
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {value.length > 0 && (
        <div className="mod-dz-thumbs">
          {value.map((url) => (
            <div key={url} className="mod-dz-thumb">
              <div
                className="mod-dz-thumb-img"
                style={{ backgroundImage: `url(${url})` }}
              />
              <button
                type="button"
                className="mod-dz-thumb-x"
                onClick={() => remove(url)}
                aria-label="Retirer la capture"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="mod-dz-error">{error}</div>}
    </div>
  );
}
