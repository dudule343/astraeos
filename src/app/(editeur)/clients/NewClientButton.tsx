"use client";

import { useState } from "react";
import { NewClientModal } from "./NewClientModal";

export function NewClientButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
      >
        ＋ Nouveau client
      </button>
      {open && <NewClientModal onClose={() => setOpen(false)} />}
    </>
  );
}
