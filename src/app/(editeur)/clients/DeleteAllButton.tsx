"use client";

import { useTransition } from "react";
import { deleteAllTestClientsAction } from "../client-new/actions";

export function DeleteAllButton() {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Supprimer TOUS les clients de la DB ? Cette action est irréversible.")) return;
    startTransition(async () => {
      try {
        await deleteAllTestClientsAction();
      } catch (e) {
        alert("Erreur : " + (e instanceof Error ? e.message : String(e)));
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-md border border-[var(--red-text)] bg-white px-2.5 py-1 text-[10.5px] font-semibold text-[var(--red-text)] transition-opacity hover:bg-[var(--red-bg)] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Suppression…" : "🗑 Vider"}
    </button>
  );
}
