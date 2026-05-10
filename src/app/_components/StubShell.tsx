"use client";

import { useEffect, useState } from "react";

type Modal = { title: string; body: string } | null;

export function StubShell() {
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest("[data-stub]");
      if (!el) return;
      e.preventDefault();
      const label = el.getAttribute("data-stub") || "Action";
      const mode = el.getAttribute("data-stub-mode") || "modal";
      const customBody = el.getAttribute("data-stub-body");

      if (mode === "toast") {
        setToast(label);
        window.clearTimeout((window as Window & { __stubT?: number }).__stubT);
        (window as Window & { __stubT?: number }).__stubT = window.setTimeout(
          () => setToast(null),
          2200,
        );
      } else {
        setModal({
          title: label,
          body:
            customBody ||
            "Module en cours d'implémentation. Sera disponible dans une prochaine itération.",
        });
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModal(null);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {modal && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-[rgba(10,31,58,0.42)] px-6"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-[520px] rounded-lg border-t-4 border-[var(--gold)] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="mb-2 text-[22px] font-semibold text-[var(--navy)]"
              style={{ fontFamily: "var(--serif)" }}
            >
              {modal.title}
            </h3>
            <p className="mb-4 text-[13px] leading-relaxed text-[var(--navy-300)]">
              {modal.body}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--navy)]"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-md bg-[var(--gold)] px-3 py-1.5 text-[11.5px] font-bold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9500] rounded-md bg-[var(--navy)] px-4 py-3 text-[12.5px] text-white shadow-xl">
          {toast}
        </div>
      )}
    </>
  );
}
